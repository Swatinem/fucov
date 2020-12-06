//! crate-level doctest
//!
//! ```
//! // lib.rs line 3
//! assert_eq!(1, 1);
//! ```

pub mod mod_with_file_doctest;

/// mod reference-level doctest
///
/// ```
/// // lib.rs line 12
/// assert_eq!(1, 1);
/// ```
pub mod mod_with_ref_doctest;

/// mod reference-level doctest
///
/// ```
/// // lib.rs line 20
/// assert_eq!(1, 1);
/// ```
pub mod mod_with_both_doctests;
