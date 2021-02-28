# fucov

A GitHub Action that does single-action code coverage generation.

The action needs a nightly compiler and `llvm-tools` available.
It will invoke `cargo test` and generate a `coverage/coverage.lcov` file which
can be uploaded to codecov for example.

This action basically does all the steps that are described in the [unstable book].

## Example usage

```yaml
# the action needs a nightly toolchain with llvm-tools
- uses: actions-rs/toolchain@v1
  with:
    profile: minimal
    toolchain: nightly
    components: llvm-tools-preview

# runs cargo with defaults flags, using the default `lcov` output
- uses: Swatinem/fucov@v1

# afterwards, upload the report to codecov
- uses: codecov/codecov-action@v1
  with:
    directory: coverage
```

**NOTE** that you do need a **nightly** toolchain with the `llvm-tools-preview`
component installed, as this action will use the included `llvm-profdata/cov` tools.

## Inputs

: `args`
Arguments for the `cargo test` command. Defaults to `--workspace --all-features`.

: `output-format`
The desired output format. One of `lcov`, `json`, `html` or `profdata`. Defaults to `lcov`.

: `output-filename`
The desired output filename. Defaults to `coverage/coverage.$ext`, depending on the chosen `output-format`.

## How it looks

This repo has some testcases included, which yield the following coverage results:

[![codecov](https://codecov.io/gh/Swatinem/fucov/branch/v1/graph/badge.svg?token=XSTLrgtVxJ)](https://codecov.io/gh/Swatinem/fucov)

[unstable book]: https://doc.rust-lang.org/nightly/unstable-book/compiler-flags/source-based-code-coverage.html

## Known Issues

There are a few known issues around doctests:

- [x] https://github.com/rust-lang/rust/pull/79413
- [x] https://github.com/rust-lang/rust/pull/79762
- [x] https://github.com/rust-lang/cargo/pull/9105
- [x] https://github.com/rust-lang/rust/pull/81264
- [x] https://github.com/rust-lang/rust/issues/79417 (columns are not re-mapped yet)
- [ ] https://github.com/rust-lang/rust/issues/79764
- [ ] https://github.com/rust-lang/rust/pull/79770
- [x] ~~https://github.com/rust-lang/cargo/pull/8954~~
