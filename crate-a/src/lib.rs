/// Doctests must not start at the same line :-(
///
/// ```
/// assert_eq!(crate_a::generic_fn("doc", "oh hai"), Ok("doctest"));
/// ```
pub fn generic_fn<T>(s: &str, val: T) -> Result<&str, T> {
    match s {
        "unit" => Ok("unit-test"),
        "integration" => Ok("integration-test"),
        "doc" => Ok("doctest"),
        "foreign-doc" => Ok("doctest"),
        _ => Err(val),
    }
}

#[test]
fn unit_test() {
    assert_eq!(generic_fn("unit", 1), Ok("unit-test"));
}
