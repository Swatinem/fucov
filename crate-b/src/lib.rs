/// ```
/// let b = crate_b::called_in_doctest();
/// assert_eq!(crate_a::generic_fn("foreign-doc", b), Ok("doctest"));
/// ```
#[derive(Copy, Clone, Debug, Default, PartialEq)]
pub struct StructB {
    b: bool,
}

pub fn called_in_doctest() -> StructB {
    StructB { b: true }
}

#[test]
fn tests_a() {
    let b = StructB::default();
    assert_eq!(crate_a::generic_fn("err", b), Err(b),);
}
