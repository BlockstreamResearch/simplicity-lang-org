# SimplicityHL standard library reference
<!-- Generated from stdlib.json by stdlib.md.py on 2026-08-26 -->

The SimplicityHL standard library provides various functions useful in developing smart contracts.

Here is a complete list of the available library functions, their <a href="../../simplicityhl-reference/type/">type signatures</a>, and a description of what they do.

Some library functions can fail or panic. This allows a Simplicity program to refuse a proposed transaction by performing a mandatory assertion; these functions' return type is `()` below. The failure or panic effect produced by these functions, or the corresponding behavior of jets, is ultimately the *only* way to decline a transaction.

For more built-in SimplicityHL functions, see the [jets reference](../../documentation/jets).


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
    | `assert_eq_bool(bool, bool) -> ()` | Assert that two `bool` values are equal.<br><br>## Panics<br>The assertion fails. |

## Binary logic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `not(bool) -> bool` | Return the logical NOT of the given value. |
    | `or(bool, bool) -> bool` | Return the logical OR of the two given values. |
    | `and(bool, bool) -> bool` | Return the logical AND of the two given values. |
    | `xor(bool, bool) -> bool` | Return the logical XOR of the two given values. |

## OP_RETURN



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `is_output_op_return(u32) -> bool` | Return `true` if the output at the given index is an OP_RETURN (null data) output, `false` otherwise (including if the output does not exist). |
    | `assert_output_is_op_return(u32) -> ()` | Assert that the output at the given index is an OP_RETURN (null data) output.<br><br>## Panics<br>The assertion fails. |

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

## `u1` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `u1_to_u8(u1) -> u8` | Widen a `u1` value to a `u8` value, zero-extending the high bits. |
    | `u1_to_u16(u1) -> u16` | Widen a `u1` value to a `u16` value, zero-extending the high bits. |
    | `u1_to_u32(u1) -> u32` | Widen a `u1` value to a `u32` value, zero-extending the high bits. |
    | `u1_to_u64(u1) -> u64` | Widen a `u1` value to a `u64` value, zero-extending the high bits. |
    | `u1_to_u128(u1) -> u128` | Widen a `u1` value to a `u128` value, zero-extending the high bits. |
    | `u1_to_u256(u1) -> u256` | Widen a `u1` value to a `u256` value, zero-extending the high bits. |
    | `u1_to_bool(u1) -> bool` | Convert a `u1` value to `bool`. |

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

## `u8` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `u8_to_u16(u8) -> u16` | Widen a `u8` value to a `u16` value, zero-extending the high bits. |
    | `u8_to_u32(u8) -> u32` | Widen a `u8` value to a `u32` value, zero-extending the high bits. |
    | `u8_to_u64(u8) -> u64` | Widen a `u8` value to a `u64` value, zero-extending the high bits. |
    | `u8_to_u128(u8) -> u128` | Widen a `u8` value to a `u128` value, zero-extending the high bits. |
    | `u8_to_u256(u8) -> u256` | Widen a `u8` value to a `u256` value, zero-extending the high bits. |
    | `split_u8_into_u1(u8) -> (u1, u1, u1, u1, u1, u1, u1, u1)` | Split a `u8` value into eight `u1` words, most-significant first. |
    | `safe_u8_to_u1(u8) -> u1` | Narrow a `u8` value to `u1`.<br><br>## Panics<br>Panics if the value does not fit in `u1`. |

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

## `u16` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `u16_to_u32(u16) -> u32` | Widen a `u16` value to a `u32` value, zero-extending the high bits. |
    | `u16_to_u64(u16) -> u64` | Widen a `u16` value to a `u64` value, zero-extending the high bits. |
    | `u16_to_u128(u16) -> u128` | Widen a `u16` value to a `u128` value, zero-extending the high bits. |
    | `u16_to_u256(u16) -> u256` | Widen a `u16` value to a `u256` value, zero-extending the high bits. |
    | `split_u16_into_u8(u16) -> (u8, u8)` | Split a `u16` value into two `u8` words, most-significant first. |
    | `safe_u16_to_u1(u16) -> u1` | Narrow a `u16` value to `u1`.<br><br>## Panics<br>Panics if the value does not fit in `u1`. |
    | `safe_u16_to_u8(u16) -> u8` | Narrow a `u16` value to `u8`.<br><br>## Panics<br>Panics if the value does not fit in `u8`. |

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

## `u32` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `u32_to_u64(u32) -> u64` | Widen a `u32` value to a `u64` value, zero-extending the high bits. |
    | `u32_to_u128(u32) -> u128` | Widen a `u32` value to a `u128` value, zero-extending the high bits. |
    | `u32_to_u256(u32) -> u256` | Widen a `u32` value to a `u256` value, zero-extending the high bits. |
    | `split_u32_into_u8(u32) -> (u8, u8, u8, u8)` | Split a `u32` value into four `u8` words, most-significant first. |
    | `split_u32_into_u16(u32) -> (u16, u16)` | Split a `u32` value into two `u16` words, most-significant first. |
    | `safe_u32_to_u1(u32) -> u1` | Narrow a `u32` value to `u1`.<br><br>## Panics<br>Panics if the value does not fit in `u1`. |
    | `safe_u32_to_u8(u32) -> u8` | Narrow a `u32` value to `u8`.<br><br>## Panics<br>Panics if the value does not fit in `u8`. |
    | `safe_u32_to_u16(u32) -> u16` | Narrow a `u32` value to `u16`.<br><br>## Panics<br>Panics if the value does not fit in `u16`. |

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

## `u64` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `u64_to_u128(u64) -> u128` | Widen a `u64` value to a `u128` value, zero-extending the high bits. |
    | `u64_to_u256(u64) -> u256` | Widen a `u64` value to a `u256` value, zero-extending the high bits. |
    | `split_u64_into_u8(u64) -> (u8, u8, u8, u8, u8, u8, u8, u8)` | Split a `u64` value into eight `u8` words, most-significant first. |
    | `split_u64_into_u16(u64) -> (u16, u16, u16, u16)` | Split a `u64` value into four `u16` words, most-significant first. |
    | `split_u64_into_u32(u64) -> (u32, u32)` | Split a `u64` value into two `u32` words, most-significant first. |
    | `safe_u64_to_u1(u64) -> u1` | Narrow a `u64` value to `u1`.<br><br>## Panics<br>Panics if the value does not fit in `u1`. |
    | `safe_u64_to_u8(u64) -> u8` | Narrow a `u64` value to `u8`.<br><br>## Panics<br>Panics if the value does not fit in `u8`. |
    | `safe_u64_to_u16(u64) -> u16` | Narrow a `u64` value to `u16`.<br><br>## Panics<br>Panics if the value does not fit in `u16`. |
    | `safe_u64_to_u32(u64) -> u32` | Narrow a `u64` value to `u32`.<br><br>## Panics<br>Panics if the value does not fit in `u32`. |

## `u128` bit logic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `and_128(u128, u128) -> u128` | Bitwise AND of two `u128` values. |
    | `or_128(u128, u128) -> u128` | Bitwise OR of two `u128` values. |
    | `eq_128(u128, u128) -> bool` | Check if two `u128` values are equal. |
    | `left_shift_128(u8, u128) -> u128` | Left-shift a `u128` value by the given amount. Bits shifted out are discarded; vacated low bits are filled with zeroes. |
    | `right_shift_128(u8, u128) -> u128` | Right-shift a `u128` value by the given amount. Bits shifted out are discarded; vacated high bits are filled with zeroes. |

## `u128` comparisons



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `is_zero_128(u128) -> bool` | Check if a `u128` value is zero. |
    | `lt_128(u128, u128) -> bool` | Check if the first `u128` value is strictly less than the second. |
    | `le_128(u128, u128) -> bool` | Check if the first `u128` value is less than or equal to the second. |
    | `gt_128(u128, u128) -> bool` | Check if the first `u128` value is strictly greater than the second. |
    | `ge_128(u128, u128) -> bool` | Check if the first `u128` value is greater than or equal to the second. |

## `u128` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `u128_to_u256(u128) -> u256` | Widen a `u128` value to a `u256` value, zero-extending the high bits. |
    | `split_u128_into_u8(u128) -> (u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8)` | Split a `u128` value into sixteen `u8` words, most-significant first. |
    | `split_u128_into_u16(u128) -> (u16, u16, u16, u16, u16, u16, u16, u16)` | Split a `u128` value into eight `u16` words, most-significant first. |
    | `split_u128_into_u32(u128) -> (u32, u32, u32, u32)` | Split a `u128` value into four `u32` words, most-significant first. |
    | `split_u128_into_u64(u128) -> (u64, u64)` | Split a `u128` value into two `u64` words, most-significant first. |
    | `safe_u128_to_u1(u128) -> u1` | Narrow a `u128` value to `u1`.<br><br>## Panics<br>Panics if the value does not fit in `u1`. |
    | `safe_u128_to_u8(u128) -> u8` | Narrow a `u128` value to `u8`.<br><br>## Panics<br>Panics if the value does not fit in `u8`. |
    | `safe_u128_to_u16(u128) -> u16` | Narrow a `u128` value to `u16`.<br><br>## Panics<br>Panics if the value does not fit in `u16`. |
    | `safe_u128_to_u32(u128) -> u32` | Narrow a `u128` value to `u32`.<br><br>## Panics<br>Panics if the value does not fit in `u32`. |
    | `safe_u128_to_u64(u128) -> u64` | Narrow a `u128` value to `u64`.<br><br>## Panics<br>Panics if the value does not fit in `u64`. |

## `u128` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `add_128(u128, u128) -> (bool, u128)` | Add two `u128` values. Return the carry bit and the sum. |
    | `add_128_64(u128, u64) -> (bool, u128)` | Add a `u64` value to a `u128` value. Return the carry bit and the sum. |
    | `checked_add_128(u128, u128) -> Option<u128>` | Add two `u128` values. Return `Some` of the sum, or `None` if the result overflows `u128`. |
    | `safe_add_128(u128, u128) -> u128` | Add two `u128` values.<br><br>## Panics<br>Panics if the result overflows `u128`. |
    | `sub_128(u128, u128) -> (bool, u128)` | Subtract the second `u128` value from the first. Return the borrow bit and the difference. |
    | `checked_sub_128(u128, u128) -> Option<u128>` | Subtract the second `u128` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u128`. |
    | `safe_sub_128(u128, u128) -> u128` | Subtract the second `u128` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u128`. |
    | `mul_128(u128, u128) -> u256` | Multiply two `u128` values. The full, non-truncated product is returned as a `u256`, so this operation can never overflow. |
    | `checked_mul_128(u128, u128) -> Option<u128>` | Multiply two `u128` values. Return `Some` of the product, or `None` if the result overflows `u128`. |
    | `safe_mul_128(u128, u128) -> u128` | Multiply two `u128` values.<br><br>## Panics<br>Panics if the result overflows `u128`. |
    | `div_mod_128_64(u128, u64) -> (u128, u64)` | Divide a `u128` value by a `u64` value, returning the `u128` quotient and the `u64` remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_mod_128(u128, u128) -> (u128, u128)` | Divide the first `u128` value by the second, returning the quotient and the remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_128(u128, u128) -> u128` | Divide the first `u128` value by the second, returning the quotient.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `checked_div_128(u128, u128) -> Option<u128>` | Divide the first `u128` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_128(u128, u128) -> u128` | Divide the first `u128` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `full_add_128(bool, u128, u128) -> (bool, u128)` | Add two `u128` values, taking an incoming carry bit. Return the outgoing carry bit and the sum. |
    | `full_sub_128(bool, u128, u128) -> (bool, u128)` | Subtract the second `u128` value from the first, taking an incoming borrow bit. Return the outgoing borrow bit and the difference. |
    | `mul_128_64(u128, u64) -> u256` | Multiply a `u128` value by a `u64` value. The full, non-truncated product is returned as a `u256`, so this operation can never overflow. |
    | `calculate_normalizer_base_64(u128, bool) -> u64` | Helper for `jet::div_mod_128_64`-based division algorithms. Returns the factor by which `b` should be multiplied so that its most-significant non-zero word is at least `2^63`, as required by those algorithms (which operate in base `2^64`). Set `is_b_u128` to `true` if `b`'s upper 64 bits may be non-zero, or `false` if `b` is known to fit in `u64` (in which case its upper 64 bits must already be zero).<br><br>## Panics<br>The assertion fails if `is_b_u128` is `false` but `b`'s upper 64 bits are non-zero, or if `b` is zero. |
    | `estimate_quotient_digit_base_64(u64, u64, u64, u64, u64) -> u64` | Helper for Algorithm D division. Estimates and corrects the next base-`2^64` quotient digit from the three most-significant dividend words (`u2`, `u1`, `u0`) and the two most-significant divisor words (`v1`, `v0`). |

## `u256` bit logic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `and_256(u256, u256) -> u256` | Bitwise AND of two `u256` values. |
    | `or_256(u256, u256) -> u256` | Bitwise OR of two `u256` values. |
    | `left_shift_256(u8, u256) -> u256` | Left-shift a `u256` value by the given amount. Bits shifted out are discarded; vacated low bits are filled with zeroes. |
    | `right_shift_256(u8, u256) -> u256` | Right-shift a `u256` value by the given amount. Bits shifted out are discarded; vacated high bits are filled with zeroes. |

## `u256` comparisons



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `is_zero_256(u256) -> bool` | Check if a `u256` value is zero. |
    | `lt_256(u256, u256) -> bool` | Check if the first `u256` value is strictly less than the second. |
    | `le_256(u256, u256) -> bool` | Check if the first `u256` value is less than or equal to the second. |
    | `gt_256(u256, u256) -> bool` | Check if the first `u256` value is strictly greater than the second. |
    | `ge_256(u256, u256) -> bool` | Check if the first `u256` value is greater than or equal to the second. |

## `u256` conversions



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `split_u256_into_u8(u256) -> (u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8, u8)` | Split a `u256` value into thirty-two `u8` words, most-significant first. |
    | `split_u256_into_u16(u256) -> (u16, u16, u16, u16, u16, u16, u16, u16, u16, u16, u16, u16, u16, u16, u16, u16)` | Split a `u256` value into sixteen `u16` words, most-significant first. |
    | `split_u256_into_u32(u256) -> (u32, u32, u32, u32, u32, u32, u32, u32)` | Split a `u256` value into eight `u32` words, most-significant first. |
    | `split_u256_into_u64(u256) -> (u64, u64, u64, u64)` | Split a `u256` value into four `u64` words, most-significant first. |
    | `split_u256_into_u128(u256) -> (u128, u128)` | Split a `u256` value into two `u128` words, most-significant first. |
    | `safe_u256_to_u1(u256) -> u1` | Narrow a `u256` value to `u1`.<br><br>## Panics<br>Panics if the value does not fit in `u1`. |
    | `safe_u256_to_u8(u256) -> u8` | Narrow a `u256` value to `u8`.<br><br>## Panics<br>Panics if the value does not fit in `u8`. |
    | `safe_u256_to_u16(u256) -> u16` | Narrow a `u256` value to `u16`.<br><br>## Panics<br>Panics if the value does not fit in `u16`. |
    | `safe_u256_to_u32(u256) -> u32` | Narrow a `u256` value to `u32`.<br><br>## Panics<br>Panics if the value does not fit in `u32`. |
    | `safe_u256_to_u64(u256) -> u64` | Narrow a `u256` value to `u64`.<br><br>## Panics<br>Panics if the value does not fit in `u64`. |
    | `safe_u256_to_u128(u256) -> u128` | Narrow a `u256` value to `u128`.<br><br>## Panics<br>Panics if the value does not fit in `u128`. |

## `u256` arithmetic



???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |
    | `add_256(u256, u256) -> (bool, u256)` | Add two `u256` values. Return the carry bit and the sum. |
    | `add_256_128(u256, u128) -> (bool, u256)` | Add a `u128` value to a `u256` value. Return the carry bit and the sum. |
    | `checked_add_256(u256, u256) -> Option<u256>` | Add two `u256` values. Return `Some` of the sum, or `None` if the result overflows `u256`. |
    | `safe_add_256(u256, u256) -> u256` | Add two `u256` values.<br><br>## Panics<br>Panics if the result overflows `u256`. |
    | `sub_256(u256, u256) -> (bool, u256)` | Subtract the second `u256` value from the first. Return the borrow bit and the difference. |
    | `checked_sub_256(u256, u256) -> Option<u256>` | Subtract the second `u256` value from the first. Return `Some` of the difference, or `None` if the result would underflow `u256`. |
    | `safe_sub_256(u256, u256) -> u256` | Subtract the second `u256` value from the first.<br><br>## Panics<br>Panics if the result would underflow `u256`. |
    | `mul_256(u256, u256) -> (u256, u256)` | Multiply two `u256` values. The full, non-truncated product is returned as a pair of `u256` values, most-significant first, so this operation can never overflow. |
    | `mul_256_64(u256, u64) -> (u64, u256)` | Multiply a `u256` value by a `u64` value. The full, non-truncated product is returned as a `u64`/`u256` pair, most-significant first, so this operation can never overflow. |
    | `mul_256_128(u256, u128) -> (u128, u256)` | Multiply a `u256` value by a `u128` value. The full, non-truncated product is returned as a `u128`/`u256` pair, most-significant first, so this operation can never overflow. |
    | `checked_mul_256(u256, u256) -> Option<u256>` | Multiply two `u256` values. Return `Some` of the product, or `None` if the result overflows `u256`. |
    | `safe_mul_256(u256, u256) -> u256` | Multiply two `u256` values.<br><br>## Panics<br>Panics if the result overflows `u256`. |
    | `div_mod_256_64(u256, u64) -> (u256, u64)` | Divide a `u256` value by a `u64` value, returning the `u256` quotient and the `u64` remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_mod_256_128(u256, u128) -> (u256, u128)` | Divide a `u256` value by a `u128` value, returning the `u256` quotient and the `u128` remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_mod_256(u256, u256) -> (u256, u256)` | Divide the first `u256` value by the second, returning the quotient and the remainder.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `div_256(u256, u256) -> u256` | Divide the first `u256` value by the second, returning the quotient.<br><br>## Panics<br>Panics if the divisor is zero. |
    | `checked_div_256(u256, u256) -> Option<u256>` | Divide the first `u256` value by the second. Return `Some` of the quotient, or `None` if the divisor is zero. |
    | `safe_div_256(u256, u256) -> u256` | Divide the first `u256` value by the second.<br><br>## Panics<br>Panics if the divisor is zero. |

