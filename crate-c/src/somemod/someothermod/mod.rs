//! ```
//! assert_eq!(1, 1);
//! ```

/// ```
/// assert_eq!(2, 2);
/// ```
pub mod nested_mod {
    /// ```
    /// if true {
    ///     assert_eq!(1, 1);
    /// } else {
    ///     unreachable!();
    /// }
    /// ```
    pub mod nested_mod2 {}
}
