#[test]
fn integration_test() {
    assert_eq!(
        fucov::generic_fn("integration", Some(true)),
        Ok("integration-test")
    );
}
