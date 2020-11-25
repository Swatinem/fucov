#[derive(Debug, Default, PartialEq)]
struct StructB {
    b: bool,
}

#[test]
fn tests_a() {
    assert_eq!(
        crate_a::generic_fn("err", StructB::default()),
        Err(StructB::default())
    );
}
