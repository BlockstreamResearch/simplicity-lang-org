# SimplicityHL standard library reference
<!-- Generated from stdlib.json by jets.md.py on 2026-08-14 -->

The SimplicityHL standard library provides various functions useful in developing smart contracts.

Here is a complete list of the available library functions, their <a href="../../simplicityhl-reference/type/">type signatures</a>, and a description of what they do.

Some library functions can fail or panic. This allows a Simplicity program to refuse a proposed transaction by performing a mandatory assertion; these functions' return type is `()` below. The failure or panic effect produced by these functions, or the corresponding behavior of jets, is ultimately the *only* way to decline a transaction.

For more built-in SimplicityHL functions, see the [jets reference](../documentation/jets).

## Asserts



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `assert_eq_1(u1, u1) -> ()` | Assert that two `u1` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_eq_8(u8, u8) -> ()` | Assert that two `u8` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_eq_16(u16, u16) -> ()` | Assert that two `u16` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_eq_32(u32, u32) -> ()` | Assert that two `u32` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_eq_64(u64, u64) -> ()` | Assert that two `u64` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_eq_128(u128, u128) -> ()` | Assert that two `u128` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_eq_256(u256, u256) -> ()` | Assert that two `u256` values are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_1(Option<u1>) -> ()` | Assert that the given `Option<u1>` is `None`.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_8(Option<u8>) -> ()` | Assert that the given `Option<u8>` is `None`.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_16(Option<u16>) -> ()` | Assert that the given `Option<u16>` is `None`.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_32(Option<u32>) -> ()` | Assert that the given `Option<u32>` is `None`.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_64(Option<u64>) -> ()` | Assert that the given `Option<u64>` is `None`.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_128(Option<u128>) -> ()` | Assert that the given `Option<u128>` is `None`.<br><br>## Panics<br>The assertion fails. |
    | `assert_none_256(Option<u256>) -> ()` | Assert that the given `Option<u256>` is `None`.<br><br>## Panics<br>The assertion fails. |

## Binary logic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `not(bool) -> bool` | Return the logical NOT of the given value. |
    | `or(bool, bool) -> bool` | Return the logical OR of the two given values. |
    | `and(bool, bool) -> bool` | Return the logical AND of the two given values. |
    | `xor(bool, bool) -> bool` | Return the logical XOR of the two given values. |

## OP\_RETURN



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `is_output_op_return(u32) -> bool` | Return `true` if the output at the given index is an OP\_RETURN (null data) output, `false` otherwise (including if the output does not exist). |
    | `assert_output_is_op_return(u32) -> ()` | Assert that the output at the given index is an OP\_RETURN (null data) output.<br><br>## Panics<br>The assertion fails. |

## secp256k1 operations



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `ge_to_point(Ge) -> Point` | Compress an affine point to `(parity, x)`, where `parity = 1` if and only if `y` is odd. |
    | `point_to_gej(Point) -> Gej` | Decompress a compressed `Point` into a Jacobian point with `z = 1`.<br><br>## Panics<br>Panics if the compressed point does not decode to a valid curve point. |
    | `safe_gej_normalize(Gej) -> Ge` | Convert a Jacobian point into affine coordinates.<br><br>## Panics<br>Panics if the point is the point at infinity, which has no affine representation. |
    | `fe_sub(Fe, Fe) -> Fe` | Subtract two field elements. |
    | `scalar_sub(Scalar, Scalar) -> Scalar` | Subtract two scalars. |
    | `gej_sub(Gej, Gej) -> Gej` | Subtract two Jacobian points. |
    | `fe_eq(Fe, Fe) -> bool` | Check field-element equality modulo `p`. |
    | `scalar_eq(Scalar, Scalar) -> bool` | Check scalar equality modulo the curve order `n`. |
    | `ge_eq(Ge, Ge) -> bool` | Check whether two affine points are equal. |
    | `point_point_eq(Point, Point) -> bool` | Check whether two compressed `Point` values are equal (same parity and same x-coordinate). |
    | `gej_point_eq(Gej, Point) -> bool` | Check whether a Jacobian point and a compressed `Point` represent the same curve point.<br><br>## Panics<br>Panics if the compressed point does not decode to a valid curve point. |
    | `assert_fe_eq(Fe, Fe) -> ()` | Assert field-element equality modulo `p`.<br><br>## Panics<br>The assertion fails. |
    | `assert_scalar_eq(Scalar, Scalar) -> ()` | Assert scalar equality modulo the curve order `n`.<br><br>## Panics<br>The assertion fails. |
    | `assert_ge_eq(Ge, Ge) -> ()` | Assert that two affine points are equal.<br><br>## Panics<br>The assertion fails. |
    | `assert_point_eq(Point, Point) -> ()` | Assert that two compressed `Point` values are equal (same parity and same x-coordinate).<br><br>## Panics<br>The assertion fails. |
    | `assert_gej_point_eq(Gej, Point) -> ()` | Assert that a Jacobian point equals the point encoded by a compressed `Point`.<br><br>## Panics<br>The assertion fails, or the compressed point does not decode to a valid curve point. |
    | `assert_gej_eq(Gej, Gej) -> ()` | Assert that two Jacobian points represent the same curve point, without normalizing either one first.<br><br>## Panics<br>The assertion fails. |
    | `assert_gej_ge_eq(Gej, Ge) -> ()` | Assert that a Jacobian point equals an affine point, without normalizing the Jacobian point first.<br><br>## Panics<br>The assertion fails. |

## `u8` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `checked_add_8(u8, u8) -> Option<u8>` | Add two `u8` values. Return `Some` of the sum, or `None` if the result overflows `u8`. |
    | `safe_add_8(u8, u8) -> u8` | Add two `u8` values.<br><br>## Panics<br>Panics if the result overflows `u8`. |
    | `checked_sub_8(u8, u8) -> Option<u8>` | Subtract the second `u8` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u8`. |
    | `safe_sub_8(u8, u8) -> u8` | Subtract the second `u8` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u8`. |
    | `checked_mul_8(u8, u8) -> Option<u8>` | Multiply two `u8` values. Return `Some` of the product, or `None` if the result overflows `u8`. |
    | `safe_mul_8(u8, u8) -> u8` | Multiply two `u8` values.<br><br>## Panics<br>Panics if the result overflows `u8`. |
    | `checked_div_8(u8, u8) -> Option<u8>` | Divide the first `u8` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_8(u8, u8) -> u8` | Divide the first `u8` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `gt_8(u8, u8) -> bool` | Check if the first `u8` value is greater than the second. |
    | `ge_8(u8, u8) -> bool` | Check if the first `u8` value is greater than or equal to the second. |

## `u16` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `checked_add_16(u16, u16) -> Option<u16>` | Add two `u16` values. Return `Some` of the sum, or `None` if the result overflows `u16`. |
    | `safe_add_16(u16, u16) -> u16` | Add two `u16` values.<br><br>## Panics<br>Panics if the result overflows `u16`. |
    | `checked_sub_16(u16, u16) -> Option<u16>` | Subtract the second `u16` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u16`. |
    | `safe_sub_16(u16, u16) -> u16` | Subtract the second `u16` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u16`. |
    | `checked_mul_16(u16, u16) -> Option<u16>` | Multiply two `u16` values. Return `Some` of the product, or `None` if the result overflows `u16`. |
    | `safe_mul_16(u16, u16) -> u16` | Multiply two `u16` values.<br><br>## Panics<br>Panics if the result overflows `u16`. |
    | `checked_div_16(u16, u16) -> Option<u16>` | Divide the first `u16` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_16(u16, u16) -> u16` | Divide the first `u16` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `gt_16(u16, u16) -> bool` | Check if the first `u16` value is greater than the second. |
    | `ge_16(u16, u16) -> bool` | Check if the first `u16` value is greater than or equal to the second. |

## `u32` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `checked_add_32(u32, u32) -> Option<u32>` | Add two `u32` values. Return `Some` of the sum, or `None` if the result overflows `u32`. |
    | `safe_add_32(u32, u32) -> u32` | Add two `u32` values.<br><br>## Panics<br>Panics if the result overflows `u32`. |
    | `checked_sub_32(u32, u32) -> Option<u32>` | Subtract the second `u32` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u32`. |
    | `safe_sub_32(u32, u32) -> u32` | Subtract the second `u32` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u32`. |
    | `checked_mul_32(u32, u32) -> Option<u32>` | Multiply two `u32` values. Return `Some` of the product, or `None` if the result overflows `u32`. |
    | `safe_mul_32(u32, u32) -> u32` | Multiply two `u32` values.<br><br>## Panics<br>Panics if the result overflows `u32`. |
    | `checked_div_32(u32, u32) -> Option<u32>` | Divide the first `u32` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_32(u32, u32) -> u32` | Divide the first `u32` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `gt_32(u32, u32) -> bool` | Check if the first `u32` value is greater than the second. |
    | `ge_32(u32, u32) -> bool` | Check if the first `u32` value is greater than or equal to the second. |

## `u64` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `checked_add_64(u64, u64) -> Option<u64>` | Add two `u64` values. Return `Some` of the sum, or `None` if the result overflows `u64`. |
    | `safe_add_64(u64, u64) -> u64` | Add two `u64` values.<br><br>## Panics<br>Panics if the result overflows `u64`. |
    | `checked_sub_64(u64, u64) -> Option<u64>` | Subtract the second `u64` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u64`. |
    | `safe_sub_64(u64, u64) -> u64` | Subtract the second `u64` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u64`. |
    | `checked_mul_64(u64, u64) -> Option<u64>` | Multiply two `u64` values. Return `Some` of the product, or `None` if the result overflows `u64`. |
    | `safe_mul_64(u64, u64) -> u64` | Multiply two `u64` values.<br><br>## Panics<br>Panics if the result overflows `u64`. |
    | `checked_div_64(u64, u64) -> Option<u64>` | Divide the first `u64` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_64(u64, u64) -> u64` | Divide the first `u64` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `gt_64(u64, u64) -> bool` | Check if the first `u64` value is greater than the second. |
    | `ge_64(u64, u64) -> bool` | Check if the first `u64` value is greater than or equal to the second. |
    | `u64_into_u256(u64) -> u256` | Widen a `u64` value to a `u256` value, placing it in the least-significant word and zero-filling the rest. |

## `u128` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `and_128(u128, u128) -> u128` | Bitwise AND of two `u128` values. |
    | `or_128(u128, u128) -> u128` | Bitwise OR of two `u128` values. |
    | `eq_128(u128, u128) -> bool` | Check if two `u128` values are equal. |
    | `left_shift_128(u8, u128) -> u128` | Left-shift a `u128` value by the given amount. Bits shifted out are discarded; vacated low bits are filled with zeroes. |
    | `right_shift_128(u8, u128) -> u128` | Right-shift a `u128` value by the given amount. Bits shifted out are discarded; vacated high bits are filled with zeroes. |
    | `is_zero_128(u128) -> bool` | Check if a `u128` value is zero. |
    | `lt_128(u128, u128) -> bool` | Check if the first `u128` value is strictly less than the second. |
    | `le_128(u128, u128) -> bool` | Check if the first `u128` value is less than or equal to the second. |
    | `gt_128(u128, u128) -> bool` | Check if the first `u128` value is strictly greater than the second. |
    | `ge_128(u128, u128) -> bool` | Check if the first `u128` value is greater than or equal to the second. |
    | `add_128(u128, u128) -> (bool, u128)` | Add two `u128` values. Return the carry bit and the (possibly wrapped) sum. |
    | `add_128_64(u128, u64) -> (bool, u128)` | Add a `u64` value to a `u128` value. Return the carry bit and the (possibly wrapped) sum. |
    | `checked_add_128(u128, u128) -> Option<u128>` | Add two `u128` values. Return `Some` of the sum, or `None` if the result overflows `u128`. |
    | `safe_add_128(u128, u128) -> u128` | Add two `u128` values.<br><br>## Panics<br>Panics if the result overflows `u128`. |
    | `sub_128(u128, u128) -> (bool, u128)` | Subtract the second `u128` value from the first. Return the borrow bit and the (possibly wrapped) difference. |
    | `checked_sub_128(u128, u128) -> Option<u128>` | Subtract the second `u128` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u128`. |
    | `safe_sub_128(u128, u128) -> u128` | Subtract the second `u128` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u128`. |
    | `mul_128(u128, u128) -> u256` | Multiply two `u128` values. The full, non-truncated product is returned as a `u256`, so this operation can never overflow. |
    | `checked_mul_128(u128, u128) -> Option<u128>` | Multiply two `u128` values. Return `Some` of the product, or `None` if the result overflows `u128`. |
    | `safe_mul_128(u128, u128) -> u128` | Multiply two `u128` values.<br><br>## Panics<br>Panics if the result overflows `u128`. |
    | `split_256_into_64(u256) -> ((u64, u64), (u64, u64))` | Split a `u256` value into four `u64` words, most-significant first. |
    | `normalize_to_threshold(u128, u128, bool) -> (u256, u128)` | Helper for `jet::div_mod_128_64`-based division algorithms. Multiplies both `a` and `b` by the same factor so that the most-significant non-zero word of `b` is at least `2^63`, as required by the division jets, which operate in base `2^64`. Set `is_b_u128` to `true` if `b`'s upper 64 bits may be non-zero, or `false` if `b` is known to fit in `u64` (in which case its upper 64 bits must already be zero).<br><br>## Panics<br>The assertion fails if `is_b_u128` is `false` but `b`'s upper 64 bits are non-zero, or if `b` is zero. |
    | `algorithm_d(u128, u128) -> (u64, u128)` | Divide `dividend` by `divisor`, returning the `u64` quotient and the `u128` remainder. Implements Knuth's Algorithm D. Requires the upper 64 bits of `divisor` to be non-zero; use `div_mod_128_64` instead when the divisor fits in `u64`. |
    | `div_mod_128_64(u128, u64) -> (u128, u64)` | Divide a `u128` value by a `u64` value, returning the `u128` quotient and the `u64` remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_mod_128(u128, u128) -> (u128, u128)` | Divide the first `u128` value by the second, returning the quotient and the remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_128(u128, u128) -> u128` | Divide the first `u128` value by the second, returning the quotient.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `checked_div_128(u128, u128) -> Option<u128>` | Divide the first `u128` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_128(u128, u128) -> u128` | Divide the first `u128` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |

## Timelocks



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `enforce_relative_distance(Distance) -> ()` | Assert that the current input is being spent in a transaction that can only be included in a block at least `min_distance` blocks after the block containing the input's UTXO. This is a drop-in replacement for the deprecated `jet::check_lock_distance`, with one important difference: it checks the relative locktime declared specifically by the current input, not the greatest value declared by any input in the transaction.<br><br>## Panics<br>The assertion fails if the transaction version is less than 2, or if the current input's declared relative locktime is less than `min_distance`. The assertion also fails if the input's sequence number does not encode a valid relative locktime at all (the disable flag is set), or if it encodes a duration instead of a distance. |
    | `enforce_relative_duration(Duration) -> ()` | Assert that the current input is being spent in a transaction that can only be included in a block whose median-time-past is at least `min_duration` units of 512 seconds after the median-time-past of the block containing the input's UTXO. This is a drop-in replacement for the deprecated `jet::check_lock_duration`, with one important difference: it checks the relative locktime declared specifically by the current input, not the greatest value declared by any input in the transaction.<br><br>## Panics<br>The assertion fails if the transaction version is less than 2, or if the current input's declared relative locktime is less than `min_duration`. The assertion also fails if the input's sequence number does not encode a valid relative locktime at all (the disable flag is set), or if it encodes a distance instead of a duration. |

## Storage



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `load(u256) -> ()` | Assert that the current input's own address commits, via a hidden Taproot leaf alongside the program, to the given `u256` state value. Use this at the start of a stateful covenant to verify a witness-supplied claim about the state carried by the UTXO being spent.<br><br>## Panics<br>The assertion fails if the input does not commit to the given state data -- either because it commits to a different value, or because it commits to no state at all. |
    | `store(u256, u32) -> ()` | Assert that the output at the given index (`u32`) re-creates this same covenant, committing via a hidden Taproot leaf to the given `u256` state value. Use this to enforce that a stateful covenant correctly carries its new state forward into a specific output. The covenant's own convention must determine whether a specific index is permissible.<br><br>## Panics<br>The assertion fails if the output at the given index does not commit to the given state under this same program -- either because it commits to a different value, commits to no state at all, or belongs to a different program entirely. The assertion also fails if no output exists at the specified index. |
