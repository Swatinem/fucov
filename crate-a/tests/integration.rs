#[test]
fn integration_test() {
    assert_eq!(
        crate_a::generic_fn("integration", Some(true)),
        Ok("integration-test")
    );
}
