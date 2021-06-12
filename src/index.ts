import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";
import fs from "fs";
import os from "os";
import path from "path";
import stringArgv from "string-argv";

const PROFILE = "+nightly";

process.on("uncaughtException", (e) => {
  core.setFailed(e);
});

async function run() {
  const doctestDir = path.join(os.tmpdir(), "_rustdoc");
  const profrawDir = path.join(os.tmpdir(), "_profraw");

  core.exportVariable("CARGO_INCREMENTAL", 0);
  core.exportVariable("RUSTFLAGS", "-Z instrument-coverage");
  core.exportVariable("RUSTDOCFLAGS", `-Z instrument-coverage -Z unstable-options --persist-doctests=${doctestDir}`);
  core.exportVariable("LLVM_PROFILE_FILE", path.join(profrawDir, "%p.profraw"));

  try {
    const libdir = await getCmdOutput("rustc", [PROFILE, "--print", "target-libdir"]);
    const tooldir = path.join(path.dirname(libdir), "bin");

    const args = stringArgv(core.getInput("args") || `--workspace --all-features`);
    await exec.exec("cargo", [PROFILE, "-Zdoctest-in-workspace", "test", ...args]);

    const outputFormat = core.getInput("output-format") || `lcov`;
    const outputFile = core.getInput("output-filename") || `coverage/coverage.${outputFormat}`;

    const profdataFile = outputFormat == "profdata" ? outputFile : path.join(profrawDir, "coverage.profdata");

    try {
      await fs.promises.mkdir(path.dirname(outputFile));
    } catch {}

    await exec.exec(path.join(tooldir, "llvm-profdata"), [
      "merge",
      "-sparse",
      ...(await findProfRaw(profrawDir)),
      "-o",
      profdataFile,
    ]);

    if (outputFormat == "profdata") {
      return;
    }

    const objects = await filterObjects(tooldir, [...(await findTargets()), ...(await findDoctests(doctestDir))]);

    const outFile = fs.createWriteStream(outputFile);

    const formatArgs =
      outputFormat == "lcov"
        ? ["export", "-format=lcov"]
        : outputFormat == "html"
        ? ["show", "-format=html"]
        : ["export", "-format=text"];

    const llvmCov = path.join(tooldir, "llvm-cov");
    const llvmCovArgs = [
      ...formatArgs,
      "-ignore-filename-regex=([\\/]rustc[\\/]|[\\/].cargo[\\/]registry[\\/])",
      `-instr-profile=${profdataFile}`,
      ...objects,
    ];
    // WTF? https://github.com/actions/toolkit/issues/649
    core.info(`[command]${llvmCov} ${llvmCovArgs.join(" ")}`);
    await exec.exec(llvmCov, llvmCovArgs, {
      silent: true,
      listeners: {
        stdout(data) {
          outFile.write(data);
        },
        stderr(data) {
          process.stderr.write(data);
        },
      },
    });
    outFile.close();
  } catch (e) {
    core.setFailed(e);
  } finally {
    await io.rmRF(doctestDir);
    await io.rmRF(profrawDir);
  }
}

run();

async function filterObjects(tooldir: string, objects: Array<string>): Promise<Array<string>> {
  const output = [];
  for (const obj of objects) {
    try {
      // this will error out if one of the objects is not a valid object file
      await exec.exec(path.join(tooldir, "llvm-readobj"), [obj], { silent: true });
      output.push(`-object=${obj}`);
    } catch {}
  }
  return output;
}

async function findProfRaw(profrawDir: string): Promise<Array<string>> {
  const files = [];
  for await (const name of walk(profrawDir)) {
    const ext = path.extname(name);
    if (ext === ".profraw") {
      files.push(name);
    }
  }
  return files;
}

async function findTargets(): Promise<Array<string>> {
  const targets = new Set(await getMetaTargets());

  const objects = [];
  const dir = await fs.promises.opendir("./target/debug/deps");
  for await (const dirent of dir) {
    if (!dirent.isFile()) {
      continue;
    }
    let name = dirent.name;
    const idx = name.lastIndexOf("-");
    if (idx !== -1) {
      name = name.slice(0, idx);
    }
    const ext = path.extname(dirent.name);
    if (targets.has(name) && (!ext || ext === ".exe")) {
      objects.push(path.join(dir.path, dirent.name));
    }
  }
  return objects;
}

async function findDoctests(doctestDir: string): Promise<Array<string>> {
  const objects = [];
  try {
    for await (const name of walk(doctestDir)) {
      const ext = path.extname(name);
      if (!ext || ext === ".exe") {
        objects.push(name);
      }
    }
  } catch {}
  return objects;
}

interface Meta {
  packages: Array<{
    name: string;
    version: string;
    manifest_path: string;
    targets: Array<{ name: string; doctest: boolean; test: boolean }>;
  }>;
}

async function getMetaTargets(): Promise<Array<string>> {
  const cwd = process.cwd();
  const meta: Meta = JSON.parse(
    await getCmdOutput("cargo", [PROFILE, "metadata", "--all-features", "--format-version=1"]),
  );

  return meta.packages
    .filter((p) => p.manifest_path.startsWith(cwd))
    .flatMap((p) => {
      return p.targets.filter((t) => t.doctest || t.test).map((t) => t.name.replace(/-/, "_"));
    });
}

async function getCmdOutput(cmd: string, args: Array<string> = [], options: exec.ExecOptions = {}): Promise<string> {
  let stdout = "";
  await exec.exec(cmd, args, {
    silent: true,
    listeners: {
      stdout(data) {
        stdout += data.toString();
      },
    },
    ...options,
  });
  return stdout;
}

async function* walk(dir: string): AsyncIterable<string> {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}
