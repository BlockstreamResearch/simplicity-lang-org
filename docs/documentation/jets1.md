# Jets reference

Simplicity jets are built-in functions which you can call to efficiently perform various computations, including some related to arithmetic, logic, and cryptography.

Jet calls are currently used in SimplicityHL to perform many operations, such as integer comparisons or arithmetic, that have dedicated notation in other programming languages. For example, in SimplicityHL, you check whether two integers are equal with a call to a jet such as `jet::eq_32`.

Some jets allow a Simplicity program to refuse a proposed transaction by performing a mandatory assertion (these jets' return type is `unit` below). For example, `jet::bip_0340_verify` will refuse the entire transaction if the specified signature cannot be verified. Jets also provide information about the currently proposed transaction, enabling <glossary:introspection> of its inputs and outputs.

The list of jets is fixed when Simplicity is integrated with a specific blockchain, because their details become part of the consensus rules for each Simplicity-enabled blockchain. A complete list of jets must be predefined so different verifiers can agree on what a particular Simplicity program means and what its exact behavior is when it is run. Jet implementations are available in native code to allow miners and other node operators to run these functions more quickly and efficiently.

## Jet list

Here is a complete list of the available jets in the Elements Simplicity integration available on Liquid Network, their <a href="/simplicityhl-reference/type/">type signatures</a>, and a description of what they do.

### Multi-bit logic

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `all_8(u8) -> bool` | Check if the value is `u8::MAX`. |
| `all_16(u16) -> bool` | Check if the value is `u16::MAX`. |
| `all_32(u32) -> bool` | Check if the value is `u32::MAX`. |
| `all_64(u64) -> bool` | Check if the value is `u64::MAX`. |
| `and_1(u1, u1) -> u1` | Bitwise AND of two 1-bit values. |
| `and_8(u8, u8) -> u8` | Bitwise AND of two 8-bit values. |
| `and_16(u16, u16) -> u16` | Bitwise AND of two 16-bit values. |
| `and_32(u32, u32) -> u32` | Bitwise AND of two 32-bit values |
| `and_64(u64, u64) -> u64` | Bitwise AND of two 64-bit values |
| `ch_1(u1, u1, u1) -> u1` | Bitwise CHOICE of a bit and two 1-bit values.  If the bit is true, then take the first value, else take the second value. |
| `ch_8(u8, u8, u8) -> u8` | Bitwise CHOICE of a bit and two 8-bit values.  If the bit is true, then take the first value, else take the second value. |
| `ch_16(u16, (u16, u16)) -> u16` | Bitwise CHOICE of a bit and two 16-bit values. If the bit is true, then take the first value, else take the second value. |
| `ch_32(u32, (u32, u32)) -> u32` | Bitwise CHOICE of a bit and two 32-bit values. If the bit is true, then take the first value, else take the second value. |
| `ch_64(u64, (u64, u64)) -> u64` | Bitwise CHOICE of a bit and two 64-bit values. If the bit is true, then take the first value, else take the second value. |
| `complement_1(u1) -> u1` | Bitwise NOT of a 1-bit  value. |
| `complement_8(u8) -> u8` | Bitwise NOT of an 8-bit value. |
| `complement_16(u16) -> u16` | Bitwise NOT of a 16-bit value. |
| `complement_32(u32) -> u32` | Bitwise NOT of a 32-bit value. |
| `complement_64(u64) -> u64` | Bitwise NOT of a 64-bit value. |
| `eq_1(u1, u1) -> bool` | Check if two 1-bit values are equal. |
| `eq_8(u8, u8) -> bool` | Check if two 8-bit values are equal. |
| `eq_16(u16, u16) -> bool` | Check if two 16-bit values are equal. |
| `eq_32(u32, u32) -> bool` | Check if two 32-bit values are equal. |
| `eq_64(u64, u64) -> bool` | Check if two 64-bit values are equal. |
| `eq_256(u256, u256) -> bool` | Check if two 256-bit values are equal. |
| `full_left_shift_8_1(u8, u1) -> (u1, u8)` | Helper for left-shifting  bits. The bits are shifted from a 1-bit  value into a 8-bit  value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_left_shift_8_2(u8, u2) -> (u2, u8)` | Helper for left-shifting  bits. The bits are shifted from a 2-bit  value into a 8-bit  value. Return the shifted value and the 2  bits that were shifted out. |
| `full_left_shift_8_4(u8, u4) -> (u4, u8)` | Helper for left-shifting  bits. The bits are shifted from a 4-bit  value into a 8-bit  value. Return the shifted value and the 4  bits that were shifted out. |
| `full_left_shift_16_1(u16, u1) -> (u1, u16)` | Helper for left-shifting  bits. The bits are shifted from a 1-bit  value into a 16-bit value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_left_shift_16_2(u16, u2) -> (u2, u16)` | Helper for left-shifting  bits. The bits are shifted from a 2-bit  value into a 16-bit value. Return the shifted value and the 2  bits that were shifted out. |
| `full_left_shift_16_4(u16, u4) -> (u4, u16)` | Helper for left-shifting  bits. The bits are shifted from a 4-bit  value into a 16-bit value. Return the shifted value and the 4  bits that were shifted out. |
| `full_left_shift_16_8(u16, u8) -> (u8, u16)` | Helper for left-shifting  bits. The bits are shifted from a 8-bit  value into a 16-bit value. Return the shifted value and the 8  bits that were shifted out. |
| `full_left_shift_32_1(u32, u1) -> (u1, u32)` | Helper for left-shifting  bits. The bits are shifted from a 1-bit  value into a 32-bit value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_left_shift_32_2(u32, u2) -> (u2, u32)` | Helper for left-shifting  bits. The bits are shifted from a 2-bit  value into a 32-bit value. Return the shifted value and the 2  bits that were shifted out. |
| `full_left_shift_32_4(u32, u4) -> (u4, u32)` | Helper for left-shifting  bits. The bits are shifted from a 4-bit  value into a 32-bit value. Return the shifted value and the 4  bits that were shifted out. |
| `full_left_shift_32_8(u32, u8) -> (u8, u32)` | Helper for left-shifting  bits. The bits are shifted from a 8-bit  value into a 32-bit value. Return the shifted value and the 8  bits that were shifted out. |
| `full_left_shift_32_16(u32, u16) -> (u16, u32)` | Helper for left-shifting  bits. The bits are shifted from a 16-bit value into a 32-bit value. Return the shifted value and the 16 bits that were shifted out. |
| `full_left_shift_64_1(u64, u1) -> (u1, u64)` | Helper for left-shifting  bits. The bits are shifted from a 1-bit  value into a 64-bit value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_left_shift_64_2(u64, u2) -> (u2, u64)` | Helper for left-shifting  bits. The bits are shifted from a 2-bit  value into a 64-bit value. Return the shifted value and the 2  bits that were shifted out. |
| `full_left_shift_64_4(u64, u4) -> (u4, u64)` | Helper for left-shifting  bits. The bits are shifted from a 4-bit  value into a 64-bit value. Return the shifted value and the 4  bits that were shifted out. |
| `full_left_shift_64_8(u64, u8) -> (u8, u64)` | Helper for left-shifting  bits. The bits are shifted from a 8-bit  value into a 64-bit value. Return the shifted value and the 8  bits that were shifted out. |
| `full_left_shift_64_16(u64, u16) -> (u16, u64)` | Helper for left-shifting  bits. The bits are shifted from a 16-bit value into a 64-bit value. Return the shifted value and the 16 bits that were shifted out. |
| `full_left_shift_64_32(u64, u32) -> (u32, u64)` | Helper for left-shifting  bits. The bits are shifted from a 32-bit value into a 64-bit value. Return the shifted value and the 32 bits that were shifted out. |
| `full_right_shift_8_1(u1, u8) -> (u8, u1)` | Helper for right-shifting bits. The bits are shifted from a 1-bit  value into a 8-bit  value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_right_shift_8_2(u2, u8) -> (u8, u2)` | Helper for right-shifting bits. The bits are shifted from a 2-bit  value into a 8-bit  value. Return the shifted value and the 2  bits that were shifted out. |
| `full_right_shift_8_4(u4, u8) -> (u8, u4)` | Helper for right-shifting bits. The bits are shifted from a 4-bit  value into a 8-bit  value. Return the shifted value and the 4  bits that were shifted out. |
| `full_right_shift_16_1(u1, u16) -> (u16, u1)` | Helper for right-shifting bits. The bits are shifted from a 1-bit  value into a 16-bit value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_right_shift_16_2(u2, u16) -> (u16, u2)` | Helper for right-shifting bits. The bits are shifted from a 2-bit  value into a 16-bit value. Return the shifted value and the 2  bits that were shifted out. |
| `full_right_shift_16_4(u4, u16) -> (u16, u4)` | Helper for right-shifting bits. The bits are shifted from a 4-bit  value into a 16-bit value. Return the shifted value and the 4  bits that were shifted out. |
| `full_right_shift_16_8(u8, u16) -> (u16, u8)` | Helper for right-shifting bits. The bits are shifted from a 8-bit  value into a 16-bit value. Return the shifted value and the 8  bits that were shifted out. |
| `full_right_shift_32_1(u1, u32) -> (u32, u1)` | Helper for right-shifting bits. The bits are shifted from a 1-bit  value into a 32-bit value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_right_shift_32_2(u2, u32) -> (u32, u2)` | Helper for right-shifting bits. The bits are shifted from a 2-bit  value into a 32-bit value. Return the shifted value and the 2  bits that were shifted out. |
| `full_right_shift_32_4(u4, u32) -> (u32, u4)` | Helper for right-shifting bits. The bits are shifted from a 4-bit  value into a 32-bit value. Return the shifted value and the 4  bits that were shifted out. |
| `full_right_shift_32_8(u8, u32) -> (u32, u8)` | Helper for right-shifting bits. The bits are shifted from a 8-bit  value into a 32-bit value. Return the shifted value and the 8  bits that were shifted out. |
| `full_right_shift_32_16(u16, u32) -> (u32, u16)` | Helper for right-shifting bits. The bits are shifted from a 16-bit value into a 32-bit value. Return the shifted value and the 16 bits that were shifted out. |
| `full_right_shift_64_1(u1, u64) -> (u64, u1)` | Helper for right-shifting bits. The bits are shifted from a 1-bit  value into a 64-bit value. Return the shifted value and the 1  bit  that was  shifted out. |
| `full_right_shift_64_2(u2, u64) -> (u64, u2)` | Helper for right-shifting bits. The bits are shifted from a 2-bit  value into a 64-bit value. Return the shifted value and the 2  bits that were shifted out. |
| `full_right_shift_64_4(u4, u64) -> (u64, u4)` | Helper for right-shifting bits. The bits are shifted from a 4-bit  value into a 64-bit value. Return the shifted value and the 4  bits that were shifted out. |
| `full_right_shift_64_8(u8, u64) -> (u64, u8)` | Helper for right-shifting bits. The bits are shifted from a 8-bit  value into a 64-bit value. Return the shifted value and the 8  bits that were shifted out. |
| `full_right_shift_64_16(u16, u64) -> (u64, u16)` | Helper for right-shifting bits. The bits are shifted from a 16-bit value into a 64-bit value. Return the shifted value and the 16 bits that were shifted out. |
| `full_right_shift_64_32(u32, u64) -> (u64, u32)` | Helper for right-shifting bits. The bits are shifted from a 32-bit value into a 64-bit value. Return the shifted value and the 32 bits that were shifted out. |
| `high_1() -> u1` | Return `u1::MAX` = 1. |
| `high_8() -> u8` | Return `u8::MAX`. |
| `high_16() -> u16` | Return `u16::MAX`. |
| `high_32() -> u32` | Return `u32::MAX`. |
| `high_64() -> u64` | Return `u64::MAX`. |
| `left_extend_1_8(u1) -> u8` | Extend a 1-bit  value to an 8-bit value by padding its left with the MSB. |
| `left_extend_1_16(u1) -> u16` | Extend a 1-bit  value to a 16-bit value by padding its left with the MSB. |
| `left_extend_1_32(u1) -> u32` | Extend a 1-bit  value to a 32-bit value by padding its left with the MSB. |
| `left_extend_1_64(u1) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its left with the MSB. |
| `left_extend_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its left with the MSB. |
| `left_extend_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its left with the MSB. |
| `left_extend_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its left with the MSB. |
| `left_extend_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its left with the MSB. |
| `left_extend_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with the MSB. |
| `left_extend_32_64(u32) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with the MSB. |
| `left_pad_high_1_8(u1) -> u8` | Extend a 1-bit  value to an 8-bit value by padding its left with ones. |
| `left_pad_high_1_16(u1) -> u16` | Extend a 1-bit  value to a 16-bit value by padding its left with ones. |
| `left_pad_high_1_32(u1) -> u32` | Extend a 1-bit  value to a 32-bit value by padding its left with ones. |
| `left_pad_high_1_64(u1) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its left with ones. |
| `left_pad_high_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its left with ones. |
| `left_pad_high_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its left with ones. |
| `left_pad_high_8_64(u8) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its left with ones. |
| `left_pad_high_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its left with ones. |
| `left_pad_high_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with ones. |
| `left_pad_high_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its left with ones. |
| `left_pad_low_1_8(u1) -> u8` | Extend a 1-bit  value to an 8-bit value by padding its left with zeroes. |
| `left_pad_low_1_16(u1) -> u16` | Extend a 1-bit  value to a 16-bit value by padding its left with zeroes. |
| `left_pad_low_1_32(u1) -> u32` | Extend a 1-bit  value to a 32-bit value by padding its left with zeroes. |
| `left_pad_low_1_64(u1) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its left with zeroes. |
| `left_pad_low_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its left with zeroes. |
| `left_pad_low_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its left with zeroes. |
| `left_pad_low_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its left with zeroes. |
| `left_pad_low_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its left with zeroes. |
| `left_pad_low_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with zeroes. |
| `left_pad_low_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its left with zeroes. |
| `left_rotate_8(u4, u8) -> u8` | Left-rotate an 8-bit value by the given amount. |
| `left_rotate_16(u4, u16) -> u16` | Left-rotate a 16-bit value by the given amount. |
| `left_rotate_32(u8, u32) -> u32` | Left-rotate a 32-bit value by the given amount. |
| `left_rotate_64(u8, u64) -> u64` | Left-rotate a 64-bit value by the given amount. |
| `left_shift_8(u4, u8) -> u8` | Left-shift an 8-bit value by the given amount. Bits are filled with zeroes. |
| `left_shift_16(u4, u16) -> u16` | Left-shift a 16-bit value by the given amount. Bits are filled with zeroes. |
| `left_shift_32(u8, u32) -> u32` | Left-shift a 32-bit value by the given amount. Bits are filled with zeroes. |
| `left_shift_64(u8, u64) -> u64` | Left-shift a 64-bit value by the given amount. Bits are filled with zeroes. |
| `left_shift_with_8(u1, u4, u8) -> u8` | Left-shift an 8-bit value by the given amount. Bits are filled with the given bit. |
| `left_shift_with_16(u1, u4, u16) -> u16` | Left-shift a 16-bit value by the given amount. Bits are filled with the given bit. |
| `left_shift_with_32(u1, u8, u32) -> u32` | Left-shift a 32-bit value by the given amount. Bits are filled with the given bit. |
| `left_shift_with_64(u1, u8, u64) -> u64` | Left-shift a 64-bit value by the given amount. Bits are filled with the given bit. |
| `leftmost_8_1(u8) -> u1` | Return the most significant 1  bits of an 8-bit value. |
| `leftmost_8_2(u8) -> u2` | Return the most significant 1  bits of an 8-bit value. |
| `leftmost_8_4(u8) -> u4` | Return the most significant 1  bits of an 8-bit value. |
| `leftmost_16_1(u16) -> u1` | Return the most significant 1  bit  of a 16-bit value. |
| `leftmost_16_2(u16) -> u2` | Return the most significant 2  bits of a 16-bit value. |
| `leftmost_16_4(u16) -> u4` | Return the most significant 4  bits of a 16-bit value. |
| `leftmost_16_8(u16) -> u8` | Return the most significant 8  bits of a 16-bit value. |
| `leftmost_32_1(u32) -> u1` | Return the most significant 1  bit  of a 32-bit value. |
| `leftmost_32_2(u32) -> u2` | Return the most significant 2  bits of a 32-bit value. |
| `leftmost_32_4(u32) -> u4` | Return the most significant 4  bits of a 32-bit value. |
| `leftmost_32_8(u32) -> u8` | Return the most significant 8  bits of a 32-bit value. |
| `leftmost_32_16(u32) -> u16` | Return the most significant 16 bits of a 32-bit value. |
| `leftmost_64_1(u64) -> u1` | Return the most significant 1  bits of a 64-bit value. |
| `leftmost_64_2(u64) -> u2` | Return the most significant 2  bits of a 64-bit value. |
| `leftmost_64_4(u64) -> u4` | Return the most significant 4  bits of a 64-bit value. |
| `leftmost_64_8(u64) -> u8` | Return the most significant 8  bits of a 64-bit value. |
| `leftmost_64_16(u64) -> u16` | Return the most significant 16 bits of a 64-bit value. |
| `leftmost_64_32(u64) -> u32` | Return the most significant 32 bits of a 64-bit value. |
| `low_1() -> u1` | Return `u1::MIN` = 0. |
| `low_8() -> u8` | Return `u8::MIN`. |
| `low_16() -> u16` | Return `u16::MIN`. |
| `low_32() -> u32` | Return `u32::MIN`. |
| `low_64() -> u64` | Return `u64::MIN`. |
| `maj_1(u1, u1, u1) -> u1` | Bitwise MAJORITY of three 1-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
| `maj_8(u8, u8, u8) -> u8` | Bitwise MAJORITY of three 1-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
| `maj_16(u16, (u16, u16)) -> u16` | Bitwise MAJORITY of three 1-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
| `maj_32(u32, (u32, u32)) -> u32` | Bitwise MAJORITY of three 1-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
| `maj_64(u64, (u64, u64)) -> u64` | Bitwise MAJORITY of three 1-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
| `or_1(u1, u1) -> u1` | Bitwise OR of two 1-bit values. |
| `or_8(u8, u8) -> u8` | Bitwise OR of two 8-bit values. |
| `or_16(u16, u16) -> u16` | Bitwise OR of two 16-bit values. |
| `or_32(u32, u32) -> u32` | Bitwise OR of two 32-bit values. |
| `or_64(u64, u64) -> u64` | Bitwise OR of two 64-bit values. |
| `right_extend_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its right with the MSB. |
| `right_extend_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its right with the MSB. |
| `right_extend_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its right with the MSB. |
| `right_extend_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its right with the MSB. |
| `right_extend_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with the MSB. |
| `right_extend_32_64(u32) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with the MSB. |
| `right_pad_high_1_8(u1) -> u8` | Extend a 1-bit  value to an 8-bit value by padding its right with ones. |
| `right_pad_high_1_16(u1) -> u16` | Extend a 1-bit  value to a 16-bit value by padding its right with ones. |
| `right_pad_high_1_32(u1) -> u32` | Extend a 1-bit  value to a 32-bit value by padding its right with ones. |
| `right_pad_high_1_64(u1) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its right with ones. |
| `right_pad_high_8_16(u8) -> u16` | Extend an 8-bit  value to a 16-bit value by padding its right with ones. |
| `right_pad_high_8_32(u8) -> u32` | Extend an 8-bit  value to a 32-bit value by padding its right with ones. |
| `right_pad_high_8_64(u8) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its right with ones. |
| `right_pad_high_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its right with ones. |
| `right_pad_high_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with ones. |
| `right_pad_high_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its right with ones. |
| `right_pad_low_1_8(u1) -> u8` | Extend a 1-bit  value to an 8-bit value by padding its right with zeroes. |
| `right_pad_low_1_16(u1) -> u16` | Extend a 1-bit  value to a 16-bit value by padding its right with zeroes. |
| `right_pad_low_1_32(u1) -> u32` | Extend a 1-bit  value to a 32-bit value by padding its right with zeroes. |
| `right_pad_low_1_64(u1) -> u64` | Extend a 1-bit  value to a 64-bit value by padding its right with zeroes. |
| `right_pad_low_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its right with zeroes. |
| `right_pad_low_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its right with zeroes. |
| `right_pad_low_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its right with zeroes. |
| `right_pad_low_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its right with zeroes. |
| `right_pad_low_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with zeroes. |
| `right_pad_low_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its right with zeroes. |
| `right_rotate_8(u4, u8) -> u8` | Right-rotate an 8-bit value by the given amount. |
| `right_rotate_16(u4, u16) -> u16` | Right-rotate a 16-bit value by the given amount. |
| `right_rotate_32(u8, u32) -> u32` | Right-rotate a 32-bit value by the given amount. |
| `right_rotate_64(u8, u64) -> u64` | Right-rotate a 64-bit value by the given amount. |
| `right_shift_8(u4, u8) -> u8` | Right-shift an 8-bit value by the given amount. Bits are filled with zeroes. |
| `right_shift_16(u4, u16) -> u16` | Right-shift a 16-bit value by the given amount. Bits are filled with zeroes. |
| `right_shift_32(u8, u32) -> u32` | Right-shift a 32-bit value by the given amount. Bits are filled with zeroes. |
| `right_shift_64(u8, u64) -> u64` | Right-shift a 64-bit value by the given amount. Bits are filled with zeroes. |
| `right_shift_with_8(u1, u4, u8) -> u8` | Right-shift an 8-bit value by the given amount. Bits are filled with the given bit. |
| `right_shift_with_16(u1, u4, u16) -> u16` | Right-shift a 16-bit value by the given amount. Bits are filled with the given bit. |
| `right_shift_with_32(u1, u8, u32) -> u32` | Right-shift a 32-bit value by the given amount. Bits are filled with the given bit. |
| `right_shift_with_64(u1, u8, u64) -> u64` | Right-shift a 64-bit value by the given amount. Bits are filled with the given bit. |
| `rightmost_8_1(u8) -> u1` | Return the least significant 1  bits of an 8-bit value. |
| `rightmost_8_2(u8) -> u2` | Return the least significant 1  bits of an 8-bit value. |
| `rightmost_8_4(u8) -> u4` | Return the least significant 1  bits of an 8-bit value. |
| `rightmost_16_1(u16) -> u1` | Return the least significant 1  bit  of a 16-bit value. |
| `rightmost_16_2(u16) -> u2` | Return the least significant 2  bits of a 16-bit value. |
| `rightmost_16_4(u16) -> u4` | Return the least significant 4  bits of a 16-bit value. |
| `rightmost_16_8(u16) -> u8` | Return the least significant 8  bits of a 16-bit value. |
| `rightmost_32_1(u32) -> u1` | Return the least significant 1  bit  of a 32-bit value. |
| `rightmost_32_2(u32) -> u2` | Return the least significant 2  bits of a 32-bit value. |
| `rightmost_32_4(u32) -> u4` | Return the least significant 4  bits of a 32-bit value. |
| `rightmost_32_8(u32) -> u8` | Return the least significant 8  bits of a 32-bit value. |
| `rightmost_32_16(u32) -> u16` | Return the least significant 16 bits of a 32-bit value. |
| `rightmost_64_1(u64) -> u1` | Return the least significant 1  bits of a 64-bit value. |
| `rightmost_64_2(u64) -> u2` | Return the least significant 2  bits of a 64-bit value. |
| `rightmost_64_4(u64) -> u4` | Return the least significant 4  bits of a 64-bit value. |
| `rightmost_64_8(u64) -> u8` | Return the least significant 8  bits of a 64-bit value. |
| `rightmost_64_16(u64) -> u16` | Return the least significant 16 bits of a 64-bit value. |
| `rightmost_64_32(u64) -> u32` | Return the least significant 32 bits of a 64-bit value. |
| `some_1(u1) -> bool` | Check if a 1-bit  value is nonzero. |
| `some_8(u8) -> bool` | Check if an 8-bit value is nonzero. |
| `some_16(u16) -> bool` | Check if a 16-bit value is nonzero. |
| `some_32(u32) -> bool` | Check if a 32-bit value is nonzero. |
| `some_64(u64) -> bool` | Check if a 64-bit value is nonzero. |
| `verify(bool) -> unit` | Assert that a bit is true.<br><br>## Panics<br>The assertion fails. |
| `xor_1(u1, u1) -> u1` | Bitwise XOR of two 1-bit  values. |
| `xor_8(u8, u8) -> u8` | Bitwise XOR of two 8-bit  values. |
| `xor_16(u16, u16) -> u16` | Bitwise XOR of two 16-bit values. |
| `xor_32(u32, u32) -> u32` | Bitwise XOR of two 32-bit values. |
| `xor_64(u64, u64) -> u64` | Bitwise XOR of two 64-bit values. |
| `xor_xor_1(u1, u1, u1) -> u1` | Bitwise XOR of three 1-bit  values. |
| `xor_xor_8(u8, u8, u8) -> u8` | Bitwise XOR of three 8-bit  values. |
| `xor_xor_16(u16, (u16, u16)) -> u16` | Bitwise XOR of three 16-bit values. |
| `xor_xor_32(u32, (u32, u32)) -> u32` | Bitwise XOR of three 32-bit values. |
| `xor_xor_64(u64, (u64, u64)) -> u64` | Bitwise XOR of three 64-bit values. |

### Arithmetic

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `add_8(u8, u8) -> (bool, u8)` | Add two integers and return the carry. |
| `add_16(u16, u16) -> (bool, u16)` | Add two integers and return the carry. |
| `add_32(u32, u32) -> (bool, u32)` | Add two integers and return the carry. |
| `add_64(u64, u64) -> (bool, u64)` | Add two integers and return the carry. |
| `decrement_8(u8) -> (bool, u8)` | Decrement an integer by one and return the borrow bit. |
| `decrement_16(u16) -> (bool, u16)` | Decrement an integer by one and return the borrow bit. |
| `decrement_32(u32) -> (bool, u32)` | Decrement an integer by one and return the borrow bit. |
| `decrement_64(u64) -> (bool, u64)` | Decrement an integer by one and return the borrow bit. |
| `div_mod_8(u8, u8) -> (u8, u8)` | Divide the first integer by the second integer, and return the remainder. |
| `div_mod_16(u16, u16) -> (u16, u16)` | Divide the first integer by the second integer, and return the remainder. |
| `div_mod_32(u32, u32) -> (u32, u32)` | Divide the first integer by the second integer, and return the remainder. |
| `div_mod_64(u64, u64) -> (u64, u64)` | Divide the first integer by the second integer, and return the remainder. |
| `div_mod_128_64(u128, u64) -> (u64, u64)` | Divide the 128-bit integer `a` by the 64-bit integer `b`.<br>Return a tuple of the quotient `q` and the remainder `r`.<br><br>Use this jet to recursively define wide integer divisions.<br><br>## Preconditions<br>1. `q` < 2^64<br>2. 2^63 ≤ `b`<br><br>Return `(u64::MAX, u64::MAX)` when the preconditions are not satisfied. |
| `divide_8(u8, u8) -> u8` | Divide the first integer by the second integer. |
| `divide_16(u16, u16) -> u16` | Divide the first integer by the second integer. |
| `divide_32(u32, u32) -> u32` | Divide the first integer by the second integer. |
| `divide_64(u64, u64) -> u64` | Divide the first integer by the second integer. |
| `divides_8(u8, u8) -> bool` | Check if the first integer is divisible by the second integer. |
| `divides_16(u16, u16) -> bool` | Check if the first integer is divisible by the second integer. |
| `divides_32(u32, u32) -> bool` | Check if the first integer is divisible by the second integer. |
| `divides_64(u64, u64) -> bool` | Check if the first integer is divisible by the second integer. |
| `full_add_8(bool, u8, u8) -> (bool, u8)` | Add two integers. Take a carry-in and return a carry-out. |
| `full_add_16(bool, u16, u16) -> (bool, u16)` | Add two integers. Take a carry-in and return a carry-out. |
| `full_add_32(bool, u32, u32) -> (bool, u32)` | Add two integers. Take a carry-in and return a carry-out. |
| `full_add_64(bool, u64, u64) -> (bool, u64)` | Add two integers. Take a carry-in and return a carry-out. |
| `full_decrement_8(bool, u8) -> (bool, u8)` | Decrement an integer by one. Take a borrow-in and return a borrow-out. |
| `full_decrement_16(bool, u16) -> (bool, u16)` | Decrement an integer by one. Take a borrow-in and return a borrow-out. |
| `full_decrement_32(bool, u32) -> (bool, u32)` | Decrement an integer by one. Take a borrow-in and return a borrow-out. |
| `full_decrement_64(bool, u64) -> (bool, u64)` | Decrement an integer by one. Take a borrow-in and return a borrow-out. |
| `full_increment_8(bool, u8) -> (bool, u8)` | Increment an integer by one. Take a carry-in and return a carry-out. |
| `full_increment_16(bool, u16) -> (bool, u16)` | Increment an integer by one. Take a carry-in and return a carry-out. |
| `full_increment_32(bool, u32) -> (bool, u32)` | Increment an integer by one. Take a carry-in and return a carry-out. |
| `full_increment_64(bool, u64) -> (bool, u64)` | Increment an integer by one. Take a carry-in and return a carry-out. |
| `full_multiply_8((u8, u8), (u8, u8)) -> u16` | Helper for multiplying integers. Take the product of the first pair of integers and add the sum of the second pair. |
| `full_multiply_16((u16, u16), (u16, u16)) -> u32` | Helper for multiplying integers. Take the product of the first pair of integers and add the sum of the second pair. |
| `full_multiply_32((u32, u32), (u32, u32)) -> u64` | Helper for multiplying integers. Take the product of the first pair of integers and add the sum of the second pair. |
| `full_multiply_64((u64, u64), (u64, u64)) -> u128` | Helper for multiplying integers. Take the product of the first pair of integers and add the sum of the second pair. |
| `full_subtract_8(bool, u8, u8) -> (bool, u8)` | Subtract the second integer from the first integer. Take a borrow-in and return a borrow-out. |
| `full_subtract_16(bool, u16, u16) -> (bool, u16)` | Subtract the second integer from the first integer. Take a borrow-in and return a borrow-out. |
| `full_subtract_32(bool, u32, u32) -> (bool, u32)` | Subtract the second integer from the first integer. Take a borrow-in and return a borrow-out. |
| `full_subtract_64(bool, u64, u64) -> (bool, u64)` | Subtract the second integer from the first integer. Take a borrow-in and return a borrow-out. |
| `increment_8(u8) -> (bool, u8)` | Increment an integer by one and return the carry. |
| `increment_16(u16) -> (bool, u16)` | Increment an integer by one and return the carry. |
| `increment_32(u32) -> (bool, u32)` | Increment an integer by one and return the carry. |
| `increment_64(u64) -> (bool, u64)` | Increment an integer by one and return the carry. |
| `is_one_8(u8) -> bool` | Check if an integer is one. |
| `is_one_16(u16) -> bool` | Check if an integer is one. |
| `is_one_32(u32) -> bool` | Check if an integer is one. |
| `is_one_64(u64) -> bool` | Check if an integer is one. |
| `is_zero_8(u8) -> bool` | Check if an integer is zero. |
| `is_zero_16(u16) -> bool` | Check if an integer is zero. |
| `is_zero_32(u32) -> bool` | Check if an integer is zero. |
| `is_zero_64(u64) -> bool` | Check if an integer is zero. |
| `le_8(u8, u8) -> bool` | Check if an integer is less than or equal to another integer. |
| `le_16(u16, u16) -> bool` | Check if an integer is less than or equal to another integer. |
| `le_32(u32, u32) -> bool` | Check if an integer is less than or equal to another integer. |
| `le_64(u64, u64) -> bool` | Check if an integer is less than or equal to another integer. |
| `lt_8(u8, u8) -> bool` | Check if an integer is less than another integer. |
| `lt_16(u16, u16) -> bool` | Check if an integer is less than another integer. |
| `lt_32(u32, u32) -> bool` | Check if an integer is less than another integer. |
| `lt_64(u64, u64) -> bool` | Check if an integer is less than another integer. |
| `max_8(u8, u8) -> u8` | Return the bigger of two integers. |
| `max_16(u16, u16) -> u16` | Return the bigger of two integers. |
| `max_32(u32, u32) -> u32` | Return the bigger of two integers. |
| `max_64(u64, u64) -> u64` | Return the bigger of two integers. |
| `median_8(u8, u8, u8) -> u8` | Return the median of three integers. |
| `median_16(u16, u16, u16) -> u16` | Return the median of three integers. |
| `median_32(u32, u32, u32) -> u32` | Return the median of three integers. |
| `median_64(u64, u64, u64) -> u64` | Return the median of three integers. |
| `min_8(u8, u8) -> u8` | Return the smaller of two integers. |
| `min_16(u16, u16) -> u16` | Return the smaller of two integers. |
| `min_32(u32, u32) -> u32` | Return the smaller of two integers. |
| `min_64(u64, u64) -> u64` | Return the smaller of two integers. |
| `modulo_8(u8, u8) -> u8` | Compute the remainder after dividing both integers. |
| `modulo_16(u16, u16) -> u16` | Compute the remainder after dividing both integers. |
| `modulo_32(u32, u32) -> u32` | Compute the remainder after dividing both integers. |
| `modulo_64(u64, u64) -> u64` | Compute the remainder after dividing both integers. |
| `multiply_8(u8, u8) -> u16` | Multiply two integers. The output is a 16-bit integer. |
| `multiply_16(u16, u16) -> u32` | Multiply two integers. The output is a 32-bit integer. |
| `multiply_32(u32, u32) -> u64` | Multiply two integers. The output is a 64-bit integer. |
| `multiply_64(u64, u64) -> u128` | Multiply two integers. The output is a 128-bit integer. |
| `negate_8(u8) -> (bool, u8)` | Negate the integer (modulo 2⁸)  and return the borrow bit. |
| `negate_16(u16) -> (bool, u16)` | Negate the integer (modulo 2¹⁶) and return the borrow bit. |
| `negate_32(u32) -> (bool, u32)` | Negate the integer (modulo 2³²) and return the borrow bit. |
| `negate_64(u64) -> (bool, u64)` | Negate the integer (modulo 2⁶⁴) and return the borrow bit. |
| `one_8() -> u8` | Return 1 as an 8-bit integer. |
| `one_16() -> u16` | Return 1 as a 16-bit integer. |
| `one_32() -> u32` | Return 1 as a 32-bit integer. |
| `one_64() -> u64` | Return 1 as a 64-bit integer. |
| `subtract_8(u8, u8) -> (bool, u8)` | Subtract the second integer from the first integer, and return the borrow bit. |
| `subtract_16(u16, u16) -> (bool, u16)` | Subtract the second integer from the first integer, and return the borrow bit. |
| `subtract_32(u32, u32) -> (bool, u32)` | Subtract the second integer from the first integer, and return the borrow bit. |
| `subtract_64(u64, u64) -> (bool, u64)` | Subtract the second integer from the first integer, and return the borrow bit. |

### Hash functions

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `sha_256_block(u256, u256, u256) -> u256` | Update the given 256-bit midstate by running the SHA256 block compression function, using the given 512-bit block. |
| `sha_256_ctx8_add1(Ctx8, u8) -> Ctx8` | Add 1   byte  to the SHA256 hash engine. |
| `sha_256_ctx8_add2(Ctx8, u16) -> Ctx8` | Add 2   bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add4(Ctx8, u32) -> Ctx8` | Add 4   bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add8(Ctx8, u64) -> Ctx8` | Add 8   bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add16(Ctx8, u128) -> Ctx8` | Add 16  bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add32(Ctx8, u256) -> Ctx8` | Add 32  bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add64(Ctx8, array(u8, 64)) -> Ctx8` | Add 64  bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add128(Ctx8, array(u8, 128)) -> Ctx8` | Add 128 bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add256(Ctx8, array(u8, 256)) -> Ctx8` | Add 256 bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add512(Ctx8, array(u8, 512)) -> Ctx8` | Add 512 bytes to the SHA256 hash engine. |
| `sha_256_ctx8_add_buffer511(Ctx8, [u8; 512]) -> Ctx8` | Add a list of less than 512 bytes to the SHA256 hash engine. |
| `sha_256_ctx8_finalize(Ctx8) -> u256` | Produce a hash from the current state of the SHA256 hash engine. |
| `sha_256_ctx8_init() -> Ctx8` | Initialize a default SHA256 hash engine. |
| `sha_256_iv() -> u256` | Return the SHA256 initial value. |

### Elliptic curve functions

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `decompress(Point) -> Option<Ge>` | Decompress a point into affine coordinates.<br><br>- Return `None` if the x-coordinate is not on the curve.<br>- Return `Some(ge)` even if the x-coordinate is not normalized. |
| `fe_add(Fe, Fe) -> Fe` | Add two field elements. |
| `fe_invert(Fe) -> Fe` | Compute the modular inverse of a field element. |
| `fe_is_odd(Fe) -> bool` | Check if the canonical representative of the field element is odd. |
| `fe_is_zero(Fe) -> bool` | Check if the field element represents zero. |
| `fe_multiply(Fe, Fe) -> Fe` | Multiply two field elements. |
| `fe_multiply_beta(Fe) -> Fe` | Multiply a field element by the canonical primitive cube root of unity (beta). |
| `fe_negate(Fe) -> Fe` | Negate a field element. |
| `fe_normalize(Fe) -> Fe` | Return the canonical representation of a field element. |
| `fe_square(Fe) -> Fe` | Square a field element. |
| `fe_square_root(Fe) -> Option<Fe>` | Compute the modular square root of a field element if it exists. |
| `ge_is_on_curve(Ge) -> bool` | Check if the given point satisfies the curve equation y² = x³ + 7. |
| `gej_is_on_curve(Gej) -> bool` | Check if the given point satisfies the curve equation y² = x³ + 7. |
| `ge_negate(Ge) -> Ge` | Negate a point. |
| `gej_negate(Gej) -> Gej` | Negate a point. |
| `gej_add(Gej, Gej) -> Gej` | Add two points. |
| `gej_double(Gej) -> Gej` | Double a point. If the result is the point at infinity, it is returned in canonical form. |
| `gej_equiv(Gej, Gej) -> bool` | Check if two points represent the same point. |
| `gej_ge_add(Gej, Ge) -> Gej` | Add two points. If the result is the point at infinity, it is returned in canonical form. |
| `gej_ge_add_ex(Gej, Ge) -> (Fe, Gej)` | Add two points. Also return the ration of the `a`s z-coordinate and the result's z-coordinate. If the result is the point at infinity, it is returned in canonical form. |
| `gej_ge_equiv(Gej, Ge) -> bool` | Check if two points represent the same point. |
| `gej_infinity() -> Gej` | Return the canonical representation of the point at infinity. |
| `gej_is_infinity(Gej) -> bool` | Check if the point represents infinity. |
| `gej_normalize(Gej) -> Option<Ge>` | Convert the point into affine coordinates with canonical field representatives. If the result is the point at infinity, it is returned in canonical form. |
| `gej_rescale(Gej, Fe) -> Gej` | Change the representatives of a point by multiplying the z-coefficient by the given value. |
| `gej_x_equiv(Fe, Gej) -> bool` | Check if the point represents an affine point with the given x-coordinate. |
| `gej_y_is_odd(Gej) -> bool` | Check if the point represents an affine point with odd y-coordinate. |
| `generate(Scalar) -> Gej` | Multiply the generator point with the given scalar. |
| `linear_combination_1((Scalar, Gej), Scalar) -> Gej` | Compute the linear combination `b * a + c * g` for point `b` and scalars `a` and `c`, where `g` is the generator point. |
| `linear_verify_1(((Scalar, Ge), Scalar), Ge) -> unit` | Assert that a point `b` is equal to the linear combination `a.0 * a.1 + a.2 * g`, where `g` is the generator point.<br><br>## Panics<br>The assertion fails. |
| `point_verify_1(((Scalar, Point), Scalar), Point) -> unit` | Assert that a point `b` is equal to the linear combination `a.0 * a.1 + a.2 * g`, where `g` is the generator point.<br><br>## Panics<br>- The assertion fails.<br>- Fails if the points cannot be decompressed. |
| `scalar_add(Scalar, Scalar) -> Scalar` | Add two scalars. |
| `scalar_invert(Scalar) -> Scalar` | Compute the modular inverse of a scalar. |
| `scalar_is_zero(Scalar) -> bool` | Check if the scalar represents zero. |
| `scalar_multiply(Scalar, Scalar) -> Scalar` | Multiply two scalars. |
| `scalar_multiply_lambda(Scalar) -> Scalar` | Multiply a scalar with the canonical primitive cube of unity (lambda) |
| `scalar_negate(Scalar) -> Scalar` | Negate a scalar. |
| `scalar_normalize(Scalar) -> Scalar` | Return the canonical representation of the scalar. |
| `scalar_square(Scalar) -> Scalar` | Square a scalar. |
| `scale(Scalar, Gej) -> Gej` | Multiply a point by a scalar. |
| `hash_to_curve(u256) -> Ge` | A cryptographic hash function that results in a point on the secp256k1 curve.<br><br>This matches the hash function used to map asset IDs to asset commitments. |
| `swu(Fe) -> Ge` | Algebraically distribute a field element over the secp256k1 curve as defined in<br>'Indifferentiable Hashing to Barreto-Naehrig Curves' by Pierre-Alain Fouque, Mehdi Tibouchi.<br><br>While this by itself is not a cryptographic hash function, it can be used as a subroutine in a `hash_to_curve` function. However, the distribution only approaches uniformity when it is called twice. |

### Digital Signatures

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `bip_0340_verify((Pubkey, Message), Signature) -> unit` | Assert that a Schnorr signature matches a public key and message.<br><br>## Panics<br>The assertion fails. |
| `check_sig_verify((Pubkey, Message64), Signature) -> unit` | Assert that a Schnorr signature matches a public key and message, using a custom sighash mode.<br><br>## Panics<br>The assertion fails.<br><br>## Safety<br>This jet should not be used directly. |

### Bitcoin (without primitives)

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `parse_lock(u32) -> Either<Height, Time>` | Parse an integer as a consensus-encoded Bitcoin lock time. |
| `parse_sequence(u32) -> Option<Either<Distance, Duration>>` | Parse an integer as a consensus-encoded Bitcoin sequence number. |
| `tapdata_init() -> Ctx8` | Create a SHA256 context, initialized with a "TapData" tag. |

### Signature hash modes

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `annex_hash(Ctx8, Option<u256>) -> Ctx8` | Continue a SHA256 hash with an optional hash by appending the following:<br>- If there is no hash, then the byte `0x00`.<br>- If there is a hash, then the byte `0x01` followed by the given hash (32 bytes). |
| `asset_amount_hash(Ctx8, Asset1, Amount1) -> Ctx8` | Continue a SHA256 hash with the serialization of a confidential asset followed by the serialization of a amount. |
| `build_tapbranch(u256, u256) -> u256` | Return the SHA256 hash of the following:<br>- The hash of the ASCII string `TapBranch/elements` (32 bytes).<br>- The lexicographically smaller of the two inputs (32 bytes).<br>- The hash of the ASCII string `TapBranch/elements` again (32 bytes).<br>- The lexicographically larger of the two inputs (32 bytes).<br><br>This builds a taproot from two branches. |
| `build_tapleaf_simplicity(u256) -> u256` | Return the SHA256 hash of the following:<br>- The hash of the ASCII string `TapBranch/elements` (32 bytes).<br>- The hash of the ASCII string `TapBranch/elements` again (32 bytes).<br>- The lexicographically smaller of the two inputs (32 bytes).<br>- The lexicographically larger of the two inputs (32 bytes).<br><br>This builds a taproot from two branches. |
| `build_taptweak(Pubkey, u256) -> u256` | Implementation of `taproot_tweak_pubkey` from BIP-0341.<br><br>## Panics<br>1. The input x-only public key is off curve or exceeds the field size.<br>2. The internal hash value `t` exceeds the secp256k1 group order.<br>3. The generated tweaked point is infinity, and thus has no valid x-only public key.<br><br>Note that situations 2 and 3 are cryptographically impossible to occur. |
| `input_amounts_hash() -> u256` | Return the SHA256 hash of the serialization of each input UTXO's asset and amount fields. |
| `input_annexes_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- If the input has no annex, or isn't a taproot spend, then the byte `0x00`.<br>- If the input has an annex, then the byte `0x01` followed by the SHA256 hash of the annex (32 bytes). |
| `input_outpoints_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- If the input is not a pegin, then the byte `0x00`.<br>- If the input is a pegin, then the byte `0x01` followed by the parent chain's genesis hash (32 bytes).<br>- The input's serialized previous transaction id (32 bytes).<br>- The input's previous transaction index in big endian format (4 bytes).<br><br>IMPORTANT: the index is serialized in big endian format rather than little endian format. |
| `input_script_sigs_hash() -> u256` | Return the SHA256 hash of the concatenation of the SHA256 hash of each input's scriptSig.<br><br>Note that if an input's UTXO uses segwit, then it's scriptSig will necessarily be the empty string. In such cases we still use the SHA256 hash of the empty string. |
| `input_scripts_hash() -> u256` | Return the SHA256 hash of the concatenation of the SHA256 hash of each input UTXO's scriptPubKey. |
| `input_sequences_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- The input's sequence number in big endian format (4 bytes).<br><br>IMPORTANT, the sequence number is serialized in big endian format rather than little endian format. |
| `input_utxo_hash(u32) -> Option<u256>` | Return the SHA256 hash of the following:<br>- The serialization of the input UTXO's asset and amount fields.<br>- The SHA256 hash of the input UTXO's scriptPubKey.<br><br>Return `None` if the input does not exist. |
| `input_utxos_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `input_amounts_hash` (32 bytes).<br>- The result of `input_scripts_hash` (32 bytes). |
| `input_hash(u32) -> Option<u256>` | Return the SHA256 hash of the following:<br>- If the input is not a pegin, then the byte `0x00`.<br>- If the input is a pegin, then the byte `0x01` followed by the parent chain's genesis hash (32 bytes).<br>- The input's serialized previous transaction id (32 bytes).<br>- The input's previous transaction index in big endian format (4 bytes).<br>- The input's sequence number in big endian format (4 bytes).<br>- If the input has no annex, or isn't a taproot spend, then the byte `0x00`.<br>- If the input has an annex, then the byte `0x01` followed by the SHA256 hash of the annex (32 bytes).<br><br>Return `None` if the input does not exist. |
| `inputs_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `input_outpoints_hash` (32 bytes).<br>- The result of `input_sequences_hash` (32 bytes).<br>- The result of `input_annexes_hash` (32 bytes). |
| `issuance_asset_amounts_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- If the input has no issuance then two bytes `0x00 0x00`.<br>- If the input is has a new issuance then the byte `0x01` followed by a serialization of the calculated issued asset id (32 bytes) followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).<br>- If the input is has a reissuance then the byte `0x01` followed by a serialization of the issued asset id<br>(32 bytes), followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or<br>33 bytes).<br><br>IMPORTANT: If there is an issuance but there are no asset issued (i.e. the amount is null) we serialize the value as the explicit 0 amount, (i.e. `0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00`).<br><br>Note, the issuance asset id is serialized in the same format as an explicit asset id would be. |
| `issuance_blinding_entropy_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- If the input has no issuance then the byte `0x00`.<br>- If the input is has a new issuance then the byte `0x01` followed by 32 `0x00` bytes and the new issuance's contract hash field (32 bytes).<br>- If the input is has reissuance then the byte `0x01` followed by a serializaiton of the reissuance's blinding nonce field (32 bytes) and the reissuance's entropy field (32 bytes).<br><br>Note that if the issuance is a new issuance then the blinding nonce field is 32 `0x00` bytes and new issuance's contract hash. |
| `issuance_range_proofs_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- The SHA256 hash of the range proof of the input's issuance asset amount (32 bytes).<br>- The SHA256 hash of the range proof of the input's issuance token amount (32 bytes).<br><br>Note that each the range proof is considered to be the empty string in the case there is no issuance, or if the asset or token amount doesn't exist (i.e is null). The SHA256 hash of the empty string is still used in these cases. |
| `issuance_token_amounts_hash() -> u256` | Return the SHA256 hash of the concatenation of the following for every input:<br>- If the input has no issuance then two bytes `0x00 0x00`.<br>- If the input is has a new issuance then the byte `0x01` followed by a serialization of the calculated issued token id (32 bytes) followed by the serialization of the (possibly confidential) issued token amount (9 bytes or 33 bytes).<br>- If the input is has a reissuance then the byte `0x01` followed by a serialization of the issued token id<br>(32 bytes), followed by the serialization of the explicit 0 amount (i.e `0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00`) (9 bytes).<br><br>IMPORTANT: If there is an issuance but there are no tokens issued (i.e. the amount is null) we serialize the value as the explicit 0 amount, (i.e. `0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00`).<br><br>Note, the issuance token id is serialized in the same format as an explicit asset id would be. |
| `issuance_hash(u32) -> Option<u256>` | Return the SHA256 hash of the following:<br>1. The asset issuance:<br>- If the input has no issuance then two bytes `0x00 0x00`.<br>- If the input is has a new issuance then the byte `0x01` followed by a serialization of the calculated issued asset id (32 bytes) followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).<br>- If the input is has a reissuance then the byte `0x01` followed by a serialization of the issued asset id<br>(32 bytes), followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).<br>2. The token issuance:<br>- If the input has no issuance then two bytes `0x00 0x00`.<br>- If the input is has a new issuance then the byte `0x01` followed by a serialization of the calculated issued token id (32 bytes) followed by the serialization of the (possibly confidential) issued token amount (9 bytes or 33 bytes).<br>- If the input is has a reissuance then the byte `0x01` followed by a serialization of the issued token id (32 bytes), followed by the serialization of the explicit 0 amount (i.e `0x01 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00`) (9 bytes).<br>3. The range proofs:<br>- The SHA256 hash of the range proof of the input's issuance asset amount (32 bytes).<br>- The SHA256 hash of the range proof of the input's issuance token amount (32 bytes).<br>4. The blinding entropy:<br>- If the input has no issuance then the byte `0x00`.<br>- If the input is has a new issuance then the byte `0x01` followed by 32 `0x00` bytes and the new issuance's contract hash field (32 bytes).<br>- If the input is has reissuance then the byte `0x01` followed by a serializaiton of the reissuance's blinding nonce field (32 bytes) and the reissuance's entropy field (32 bytes).<br><br>Return `None` if the input does not exist. |
| `issuances_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `issuance_asset_amounts_hash` (32 bytes).<br>- The result of `issuance_token_amounts_hash` (32 bytes).<br>- The result of `issuance_range_proofs_hash` (32 bytes).<br>- The result of `issuance_blinding_entropy_hash` (32 bytes). |
| `nonce_hash(Ctx8, Option<Nonce>) -> Ctx8` | Continue the SHA256 hash with the serialization of an optional nonce. |
| `outpoint_hash(Ctx8, Option<u256>, Outpoint) -> Ctx8` | Continue the SHA256 hash with an optional pegin and an outpoint by appending the following:<br>- If the input is not a pegin, then the byte `0x00`.<br>- If the input is a pegin, then the byte `0x01` followed by the given parent genesis hash (32 bytes).<br>- The input's previous transaction id (32 bytes).<br>- The input's previous transaction index in big endian format (4 bytes). |
| `output_amounts_hash() -> u256` | Return the SHA256 hash of the serialization of each output's asset and amount fields. |
| `output_nonces_hash() -> u256` | Return the SHA256 hash of the serialization of each output's nonce field. |
| `output_range_proofs_hash() -> u256` | Return the SHA256 hash of the concatenation of the SHA256 hash of each output's range proof.<br><br>Note that if the output's amount is explicit then the range proof is considered the empty string. |
| `output_scripts_hash() -> u256` | Return the SHA256 hash of the concatenation of the SHA256 hash of each output's scriptPubKey. |
| `output_surjection_proofs_hash() -> u256` | Return the SHA256 hash of the concatenation of the SHA256 hash of each output's surjection proof.<br><br>Note that if the output's asset is explicit then the surjection proof is considered the empty string. |
| `output_hash(u32) -> Option<u256>` | Return the SHA256 hash of the following:<br>- The serialization of the output's asset and amount fields.<br>- The serialization of the output's nonce field.<br>- The SHA256 hash of the output's scriptPubKey.<br>- The SHA256 hash of the output's range proof.<br><br>Return `None` if the output does not exist.<br><br>Note: the result of `output_surjection_proofs_hash` is specifically excluded because surjection proofs are dependent on the inputs as well as the output. |
| `outputs_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `output_amounts_hash` (32 bytes).<br>- The result of `output_nonces_hash` (32 bytes).<br>- The result of `output_scripts_hash` (32 bytes).<br>- The result of `output_range_proofs_hash` (32 bytes).<br><br>Note: the result of `output_surjection_proofs_hash` is specifically excluded because surjection proofs are dependent on the inputs as well as the output. See also `tx_hash`. |
| `sig_all_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `genesis_block_hash` (32 bytes).<br>- The result of `genesis_block_hash` again (32 bytes).<br>- The result of `tx_hash` (32 bytes).<br>- The result of `tap_env_hash` (32 bytes).<br>- The result of `current_index` (Note: this is in big endian format) (4 bytes).<br><br>Note: the two copies of the `genesis_block_hash` values effectively makes this result a BIP-340 style tagged hash. |
| `tap_env_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `tapleaf_hash` (32 bytes).<br>- The result of `tappath_hash` (32 bytes).<br>- The result of `internal_key` (32 bytes). |
| `tapleaf_hash() -> u256` | Return the SHA256 hash of the following:<br>- The hash of the ASCII string `TapLeaf/elements` (32 bytes).<br>- The hash of the ASCII string `TapLeaf/elements` again (32 bytes).<br>- The result of `tapleaf_version` (1 byte).<br>- The byte `0x20` (1 byte).<br>- The result of `script_cmr` (32 bytes).<br><br>Note: this matches Elements's modified BIP-0341 definition of tapleaf hash. |
| `tappath_hash() -> u256` | Return a hash of the current input's control block excluding the leaf version and the taproot internal key.<br><br>Using the notation of BIP-0341, it returns the SHA256 hash of c33: 33 + 32m. |
| `tx_hash() -> u256` | Return the SHA256 hash of the following:<br>- The result of `version` (Note: this is in big endian format) (4 bytes).<br>- The result of `tx_lock_time` (Note: this is in big endian format) (4 bytes).<br>- The result of `inputs_hash` (32 bytes).<br>- The result of `outputs_hash` (32 bytes).<br>- The result of `issuances_hash` (32 bytes).<br>- The result of `output_surjection_proofs_hash` (32 bytes).<br>- The result of `input_utxos_hash` (32 bytes). |

### Time locks

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `check_lock_distance(Distance) -> unit` | Assert that the value returned by `tx_lock_distance` is greater than or equal to the given value.<br><br>## Panics<br>The assertion fails. |
| `check_lock_duration(Duration) -> unit` | Assert that the value returned by `tx_lock_duration` is greater than or equal to the given value.<br><br>## Panics<br>The assertion fails |
| `check_lock_height(Height) -> unit` | Assert that the value returned by `tx_lock_height`   is greater than or equal to the given value.<br><br>## Panics<br>The assertion fails. |
| `check_lock_time(Time) -> unit` | Assert that the value returned by `tx_lock_time`     is greater than or equal to the given value.<br><br>## Panics<br>The assertion fails. |
| `tx_is_final() -> bool` | Check if the sequence numbers of all transaction inputs are at their maximum value. |
| `tx_lock_distance() -> Distance` | If `version` returns 2 or greater, then return the greatest valid `Distance` value of any transaction input. Return zeroes otherwise. |
| `tx_lock_duration() -> Duration` | If `version` returns 2 or greater, then return the greatest valid `Duration` value of any transaction input. Return zeroes otherwise. |
| `tx_lock_height() -> Height` | If `tx_is_final` returns false, then try to parse the transaction's lock time as a `Height` value. Return zeroes otherwise. |
| `tx_lock_time() -> Time` | If `tx_is_final` returns false, then try to parse the transaction's lock time as a `Time` value. Return zeroes otherwise. |

### Issuance

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `calculate_asset(u256) -> ExplicitAsset` | Calculate the issued asset id from a given entropy value. |
| `calculate_confidential_token(u256) -> ExplicitAsset` | Calculate the reissuance token id from a given entropy value for assets with confidential issued amounts. |
| `calculate_explicit_token(u256) -> ExplicitAsset` | Calculate the reissuance token id from a given entropy value for assets with explicit issued amounts. |
| `calculate_issuance_entropy(Outpoint, u256) -> u256` | Calculate the entropy value from a given outpoint and contract hash.<br><br>This entropy value is used to compute issued asset and token IDs. |
| `issuance(u32) -> Option<Option<bool>>` | Return the kind of issuance of the input at the given index:<br>- Return `Some(Some(false))` if the input has new issuance.<br>- Return `Some(Some(true))` if the input as reissuance.<br>- Return `Some(None)` if the input has no issuance.<br>- Return `None` if the input does not exist. |
| `issuance_asset(u32) -> Option<Option<ExplicitAsset>>` | Return the ID of the issued asset of the input at the given index:<br>- Return `Some(Some(x))` if the input has issuance with asset id `x`.<br>- Return `Some(None)` if the input has no issuance.<br>- Return `None` if the input does not exist. |
| `issuance_entropy(u32) -> Option<Option<u256>>` | Return the issuance entropy of the input at the given index:<br>- Return `Some(Some(x))` if the input has reissuance with entropy `x` or if there is new issuance whose computed entropy is `x`.<br>- Return `Some(Some(x))` if the input has no issuance.<br>- Return `None` if the input does not exist. |
| `issuance_token(u32) -> Option<Option<ExplicitAsset>>` | Return the reissuance token of the input at the given index:<br>- Return `Some(Some(x))` if the input has issuance with the reissuance token ID `x`.<br>- Return `Some(None)` if the input has no issuance.<br>- Return `None` if the input does not exist. |
| `lbtc_asset() -> u256` | Return the asset for Liquid Bitcoin. |

### Transaction

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `current_amount() -> (Asset1, Amount1)` | Return the `input_amount` at the `current_index`. |
| `current_annex_hash() -> Option<u256>` | Return the `input_annex_hash` at th `current_index`. |
| `current_asset() -> Asset1` | Return the `input_asset` at the `current_index`. |
| `current_index() -> u32` | Return the index of the current txin. |
| `current_issuance_asset_amount() -> Option<Amount1>` | Return the `issuance_asset_amount` at the `current_index`. |
| `current_issuance_asset_proof() -> u256` | Return the `issuance_asset_proof`  at the `current_index`. |
| `current_issuance_token_amount() -> Option<TokenAmount1>` | Return the `issuance_token_amount` at the `current_index`. |
| `current_issuance_token_proof() -> u256` | Return the `issuance_token_proof`  at the `current_index`. |
| `current_new_issuance_contract() -> Option<u256>` | Return the `new_issuance_contract` at the `current_index`. |
| `current_pegin() -> Option<u256>` | Return the `input_pegin` at the `current_index`. |
| `current_prev_outpoint() -> Outpoint` | Return the previous outpoint of the current txin. |
| `current_reissuance_blinding() -> Option<ExplicitNonce>` | Return the `reissuance_blinding` at the `current_index`. |
| `current_reissuance_entropy() -> Option<u256>` | Return the `reissuance_entropy`  at the `current_index`. |
| `current_script_hash() -> u256` | Return the SHA256 hash of the scriptPubKey of the UTXO of the current txin. |
| `current_script_sig_hash() -> u256` | Return the SHA256 hash of the scriptSig of the current txin.<br><br>SegWit UTXOs enforce scriptSig to be the empty string. In such cases, we return the SHA256 hash of the empty string. |
| `current_sequence() -> u32` | Return the nSequence of the current txin.<br><br>Use this jet to obtain the raw, encoded sequence number.<br>Use `tx_lock_distance` to obtain a relative block height, or `tx_lock_duration` to obtain a relative UNIX timestamp, in a safe manner. |
| `genesis_block_hash() -> u256` | Return the SHA256 hash of the genesis block. |
| `input_amount(u32) -> Option<(Asset1, Amount1)>` | Return the asset id and the asset amount at the given input index.<br><br>Return `None` if the input does not exist. |
| `input_annex_hash(u32) -> Option<Option<u256>>` | Return the SHA256 hash of the annex at the given input:<br>- Return `Some(Some(x))` if the input has an annex that hashes to `x`.<br>- Return `Some(None`) if the input has no annex.<br>- Return `None` if the input does not exist. |
| `input_asset(u32) -> Option<Asset1>` | Return the asset id of the input at the given index.<br><br>Return `None` if the input does not exist. |
| `input_pegin(u32) -> Option<Option<u256>>` | Return the parent genesis block hash if the input at the given index is a peg-in.<br><br>- Return `Some(None)` if the input is not a peg-in.<br>- Return `None` if the input does not exist. |
| `input_prev_outpoint(u32) -> Option<Outpoint>` | Return the previous outpoint of the input at the given index.<br><br>Return `None` if the input does not exist. |
| `input_script_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptPubKey of the UTXO of the input at the given index.<br><br>Return `None` if the input does not exist. |
| `input_script_sig_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptSigKey of the input at the given index.<br><br>Return `None` if the input does not exist.<br><br>SegWit UTXOs enforce scriptSig to be the empty string. In such cases, we return the SHA256 hash of the empty string. |
| `input_sequence(u32) -> Option<u32>` | Return the nSequence of the input at the given index.<br><br>Return `None` if the input does not exist. |
| `internal_key() -> Pubkey` | Return the internal key of the current input.<br><br>We assume that Simplicity can be spent in Taproot outputs only, so there always exists an internal key. |
| `issuance_asset_amount(u32) -> Option<Option<Amount1>>` | Return the possibly confidential amount of the issuance if the input at the given index has an issuance.<br><br>- Return `Some(None)` if the input does not have an issuance.<br>- Return `None` if the input does not exist. |
| `issuance_asset_proof(u32) -> Option<u256>` | Return the SHA256 hash of the range proof for the amount of the issuance at the given input index.<br><br>- Return the hash of the empty string if the input does not have an issuance.<br>- Return `None` if the input does not exist. |
| `issuance_token_amount(u32) -> Option<Option<TokenAmount1>>` | Return the possibly confidential amount of the reissuance tokens if the input at the given index has an issuance.<br><br>- Return `Some(Some(Right(0)))` if the input is itself a reissuance.<br>- Return `Some(None)` if the input does not have an issuance.<br>- Return `None` if the input does not exist. |
| `issuance_token_proof(u32) -> Option<u256>` | Return the SHA256 hash of the range proof for the amount of the reissuance tokens at the given input index.<br><br>- Return the hash of the empty string if the input does not have an issuance.<br>- Return `None` if the input does not exist. |
| `lock_time() -> Lock` | Return the lock time of the transaction. |
| `new_issuance_contract(u32) -> Option<Option<u256>>` | Return the contract hash for the new issuance at the given input index.<br><br>- Return `Some(None)` if the input does not have a new issuance.<br>- Return `None` if the input does not exist. |
| `num_inputs() -> u32` | Return the number of inputs of the transaction. |
| `num_outputs() -> u32` | Return the number of outputs of the transaction. |
| `output_amount(u32) -> Option<(Asset1, Amount1)>` | Return the asset amount of the output at the given index.  <br>Return `None` if the output does not exist. |
| `output_asset(u32) -> Option<Asset1>` | Return the asset id of the output at the given index.<br><br>Return `None` if the output does not exist. |
| `output_is_fee(u32) -> Option<bool>` | Check if the output at the given index is a fee output.<br><br>Return `None` if the output does not exist. |
| `output_nonce(u32) -> Option<Option<Nonce>>` | Return the nonce of the output at the given index.<br><br>- Return `Some(None)` if the output does not have a nonce.<br>- Return `None` if the output does not exist. |
| `output_null_datum(u32, u32) -> Option<Option<Either<(u2, u256), Either<u1, u4>>>>` | Return the `b`-th entry of a null data (`OP_RETURN`) output at index `a`.<br><br>- Return `Some(Some(Right(Right(x-1))))` if the entry is `OP_x` for `x` in the range 1..=16.<br>- Return `Some(Some(Right(Left(0))))` if the entry is `OP_1NEGATE`.<br>- Return `Some(Some(Right(Left(1))))` if the entry is `OP_RESERVED`.<br>- Return `Some(Some(Left((x, hash))))` if the entry is pushed data. `hash` is the SHA256 hash of the data pushed and `x` indicates how the data was pushed:<br>- `x == 0` means the push was an immediate 0 to 75 bytes.<br>- `x == 1` means the push was an `OP_PUSHDATA1`.<br>- `x == 2` means the push was an `OP_PUSHDATA2`.<br>- `x == 3` means the push was an `OP_PUSHDATA4`.<br>- Return `Some(None)` if the null data has fewer than `b` entries.<br>- Return `None` if the output is not a null data output.<br><br>Use this jet to read peg-out data from an output. |
| `output_range_proof(u32) -> Option<u256>` | Return the SHA256 hash of the range proof of the output at the given index.<br><br>Return `None` if the output does not exist. |
| `output_script_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptPubKey of the output at the given index.<br><br>Return `None` if the output does not exist. |
| `output_surjection_proof(u32) -> Option<u256>` | Return the SHA256 hash of the surjection proof of the output at the given index.<br><br>Return `None` if the output does not exist. |
| `reissuance_blinding(u32) -> Option<Option<ExplicitNonce>>` | Return the blinding factor used for the reissuance at the given input index.<br><br>- Return `Some(None)` if the input does not have a reissuance.<br>- Return `None` if the input does not exist. |
| `reissuance_entropy(u32) -> Option<Option<u256>>` | Return the entropy used for the reissuance at the given input index.<br><br>- Return `Some(None)` if the input does not have a reissuance.<br>- Return `None` if the input does not exist. |
| `script_cmr() -> u256` | Return the CMR of the Simplicity program in the current input.<br><br>This is the CMR of the currently executed Simplicity program. |
| `tapleaf_version() -> u8` | Return the tap leaf version of the current input.<br><br>We assume that Simplicity can be spent in Taproot outputs only, so there always exists a tap leaf. |
| `tappath(u8) -> Option<u256>` | Return the SHA256 hash of the tap path of the current input.<br><br>We assume that Simplicity can be spent in Taproot outputs only, so there always exists a tap path. |
| `total_fee(ExplicitAsset) -> ExplicitAmount` | Return the total amount of fees paid to the given asset id.<br><br>Return zero for any asset without fees. |
| `transaction_id() -> u256` | Return the transaction ID. |
| `version() -> u32` | Return the version number of the transaction. |

## Deprecated jets

Four jets related to time locks have been deprecated.

| <div style="width:22em">Jet</div> | Description |
| ----------------------------------- | ----------- |
| `check_lock_distance(Distance) -> unit` | **Deprecated; do not use.** Assert that the value returned by [`tx_lock_distance`] is greater than or equal to the given value.<br><br>## Panics<br>The assertion fails. |
| `check_lock_duration(Duration) -> unit` | **Deprecated; do not use.** Assert that the value returned by [`tx_lock_duration`] is greater than or equal to the given value.<br><br>## Panics<br>The assertion fails |
| `tx_lock_distance() -> Distance` | **Deprecated; do not use.** If [`version`] returns 2 or greater, then return the greatest valid [`Distance`] value of any transaction input. Return zeroes otherwise. |
| `tx_lock_duration() -> Duration` | **Deprecated; do not use.** If [`version`] returns 2 or greater, then return the greatest valid [`Duration`] value of any transaction input. Return zeroes otherwise. |

These jets' names may have been changed in some tools and libraries to discourage their use.

## Notation

There are three styles of writing jet names that you may encounter in Simplicity-related tooling or source code.

* SimplicityHL writes jets like `jet::eq_32`.
* Disassembly of low-level Simplicity writes them like `jet_eq_32`.
* Rust source code writes them like `Elements::Eq32`.

The reference list above is aimed at SimplicityHL developers, so it presents jet names in SimplicityHL format. Remember to include `jet::` before the name of the jet when calling it from a SimplicityHL program.
