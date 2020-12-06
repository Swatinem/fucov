# fucov

A GitHub Action that does single-action code coverage generation.

The action needs a nightly compiler and `llvm-tools` available.
It will invoke `cargo test` with `--workspace --all-features` and will generate
a `coverage/coverage.lcov` file which can be uploaded to codecov for example.

This action basically does all the steps that are described in the [unstable book].

## Example usage

```yaml
# the action needs a nightly toolchain
- uses: actions-rs/toolchain@v1
  with:
    profile: minimal
    toolchain: nightly
    components: llvm-tools-preview

- uses: Swatinem/fucov@v1

# afterwards, upload the report to codecov
- uses: codecov/codecov-action@v1
  with:
    directory: coverage
```

[unstable book]: https://doc.rust-lang.org/nightly/unstable-book/compiler-flags/source-based-code-coverage.html

## Known Issues

There are a few known issues around doctests:

- [x] https://github.com/rust-lang/rust/pull/79413
- [ ] https://github.com/rust-lang/rust/issues/79417
- [ ] https://github.com/rust-lang/rust/issues/79764
