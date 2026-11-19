# Jets reference

Simplicity jets are built-in functions which you can call to efficiently perform various computations, including some related to arithmetic, logic, and cryptography.

## Uses of jets

Jet calls are currently used in SimplicityHL to perform many operations, such as integer comparisons or arithmetic, that have dedicated notation in other programming languages.

* For example, in SimplicityHL, you check whether two integers are equal with a call to a jet such as `jet::eq_32`.

Some jets allow a Simplicity program to refuse a proposed transaction by performing a mandatory assertion (these jets' return type is `()` below). The "panic" or failure effect produced by these jets is the *only* way to decline a transaction, so every program will need to call one or more of these jets directly or indirectly.

* For example, `jet::bip_0340_verify` checks a digital signature and refuses the transaction if the signature cannot be verified.

Jets also provide [introspection](../glossary.md#introspection) of the currently proposed transaction's inputs and outputs.

* For example, `jet::output_script_hash` provides the cryptographic identity of the program that controls a specified output of the proposed transaction. This can be used to require that assets are sent back to a copy of a specific [program](../glossary.md#program) (a [covenant](../glossary.md#covenant)).

## Jet list

Here is a complete list of the available jets, their [type signatures](../simplicityhl-reference/type.md), and a description of what they do. Types such as `Fe`, `Ctx8`, and `Asset1` are [builtin type aliases](../simplicityhl-reference/type_alias.md#builtin-aliases).

The jet list covers both the Elements Simplicity integration (for [Liquid Network](../glossary.md#liquid)) and the Bitcoin integration (for [Simplicity Signet](../glossary.md#signet)). About 95% of the jets are shared between these two integrations. Where a section differs, it has an **Elements** tab and a **Bitcoin** tab; choosing a tab in one section switches every section to the same integration.

### Multi-bit logic

These jets work on the bits of unsigned integers: bitwise logic (`and_N`, `or_N`, `xor_N`, `complement_N`), tests (`all_N`, `some_N`, `eq_N`), constants (`high_N`, `low_N`), shifts and rotations, and conversions between widths (`left_pad_*`, `right_pad_*`, `left_extend_*`, `right_extend_*`, `leftmost_*`, `rightmost_*`). `ch_N`, `maj_N`, and `xor_xor_N` are the bitwise functions that SHA256 uses.

The number at the end of a name is the width in bits; in a conversion, the two numbers are the input and output widths. In names, "left" means the most significant end of a value and "right" the least significant end.

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `all_8(u8) -> bool` | Check if the value is `u8::MAX` = 2⁸ − 1 = `0xff`. |
    | `all_16(u16) -> bool` | Check if the value is `u16::MAX` = 2¹⁶ − 1 = `0xffff`. |
    | `all_32(u32) -> bool` | Check if the value is `u32::MAX` = 2³² − 1 = `0xffff_ffff`. |
    | `all_64(u64) -> bool` | Check if the value is `u64::MAX` = 2⁶⁴ − 1 = `0xffff_ffff_ffff_ffff`. |
    | `and_1(u1, u1) -> u1` | Bitwise AND of two 1-bit values. |
    | `and_8(u8, u8) -> u8` | Bitwise AND of two 8-bit values. |
    | `and_16(u16, u16) -> u16` | Bitwise AND of two 16-bit values. |
    | `and_32(u32, u32) -> u32` | Bitwise AND of two 32-bit values. |
    | `and_64(u64, u64) -> u64` | Bitwise AND of two 64-bit values. |
    | `ch_1(u1, u1, u1) -> u1` | Bitwise CHOICE of three 1-bit values. At each bit position, if the bit of the first value is true, then take the bit of the second value, else take the bit of the third value. |
    | `ch_8(u8, u8, u8) -> u8` | Bitwise CHOICE of three 8-bit values. At each bit position, if the bit of the first value is true, then take the bit of the second value, else take the bit of the third value. |
    | `ch_16(u16, (u16, u16)) -> u16` | Bitwise CHOICE of three 16-bit values. At each bit position, if the bit of the first value is true, then take the bit of the second value, else take the bit of the third value. |
    | `ch_32(u32, (u32, u32)) -> u32` | Bitwise CHOICE of three 32-bit values. At each bit position, if the bit of the first value is true, then take the bit of the second value, else take the bit of the third value. |
    | `ch_64(u64, (u64, u64)) -> u64` | Bitwise CHOICE of three 64-bit values. At each bit position, if the bit of the first value is true, then take the bit of the second value, else take the bit of the third value. |
    | `complement_1(u1) -> u1` | Bitwise NOT of a 1-bit value. |
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
    | `full_left_shift_16_1(u16, u1) -> (u1, u16)` | Shift a 16-bit value left by 1 bit, filling the vacated low bit with the given 1-bit value. Return a tuple of the 1 bit shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_16_2(u16, u2) -> (u2, u16)` | Shift a 16-bit value left by 2 bits, filling the vacated low bits with the given 2-bit value. Return a tuple of the 2 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_16_4(u16, u4) -> (u4, u16)` | Shift a 16-bit value left by 4 bits, filling the vacated low bits with the given 4-bit value. Return a tuple of the 4 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_16_8(u16, u8) -> (u8, u16)` | Shift a 16-bit value left by 8 bits, filling the vacated low bits with the given 8-bit value. Return a tuple of the 8 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_32_1(u32, u1) -> (u1, u32)` | Shift a 32-bit value left by 1 bit, filling the vacated low bit with the given 1-bit value. Return a tuple of the 1 bit shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_32_2(u32, u2) -> (u2, u32)` | Shift a 32-bit value left by 2 bits, filling the vacated low bits with the given 2-bit value. Return a tuple of the 2 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_32_4(u32, u4) -> (u4, u32)` | Shift a 32-bit value left by 4 bits, filling the vacated low bits with the given 4-bit value. Return a tuple of the 4 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_32_8(u32, u8) -> (u8, u32)` | Shift a 32-bit value left by 8 bits, filling the vacated low bits with the given 8-bit value. Return a tuple of the 8 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_32_16(u32, u16) -> (u16, u32)` | Shift a 32-bit value left by 16 bits, filling the vacated low bits with the given 16-bit value. Return a tuple of the 16 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_64_1(u64, u1) -> (u1, u64)` | Shift a 64-bit value left by 1 bit, filling the vacated low bit with the given 1-bit value. Return a tuple of the 1 bit shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_64_2(u64, u2) -> (u2, u64)` | Shift a 64-bit value left by 2 bits, filling the vacated low bits with the given 2-bit value. Return a tuple of the 2 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_64_4(u64, u4) -> (u4, u64)` | Shift a 64-bit value left by 4 bits, filling the vacated low bits with the given 4-bit value. Return a tuple of the 4 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_64_8(u64, u8) -> (u8, u64)` | Shift a 64-bit value left by 8 bits, filling the vacated low bits with the given 8-bit value. Return a tuple of the 8 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_64_16(u64, u16) -> (u16, u64)` | Shift a 64-bit value left by 16 bits, filling the vacated low bits with the given 16-bit value. Return a tuple of the 16 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_64_32(u64, u32) -> (u32, u64)` | Shift a 64-bit value left by 32 bits, filling the vacated low bits with the given 32-bit value. Return a tuple of the 32 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_8_1(u8, u1) -> (u1, u8)` | Shift an 8-bit value left by 1 bit, filling the vacated low bit with the given 1-bit value. Return a tuple of the 1 bit shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_8_2(u8, u2) -> (u2, u8)` | Shift an 8-bit value left by 2 bits, filling the vacated low bits with the given 2-bit value. Return a tuple of the 2 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_left_shift_8_4(u8, u4) -> (u4, u8)` | Shift an 8-bit value left by 4 bits, filling the vacated low bits with the given 4-bit value. Return a tuple of the 4 bits shifted out of the top and the shifted value.<br><br>The first argument is the value to shift, and the second supplies the bits shifted in. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_16_1(u1, u16) -> (u16, u1)` | Shift a 16-bit value right by 1 bit, filling the vacated high bit with the given 1-bit value. Return a tuple of the shifted value and the 1 bit shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_16_2(u2, u16) -> (u16, u2)` | Shift a 16-bit value right by 2 bits, filling the vacated high bits with the given 2-bit value. Return a tuple of the shifted value and the 2 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_16_4(u4, u16) -> (u16, u4)` | Shift a 16-bit value right by 4 bits, filling the vacated high bits with the given 4-bit value. Return a tuple of the shifted value and the 4 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_16_8(u8, u16) -> (u16, u8)` | Shift a 16-bit value right by 8 bits, filling the vacated high bits with the given 8-bit value. Return a tuple of the shifted value and the 8 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_32_1(u1, u32) -> (u32, u1)` | Shift a 32-bit value right by 1 bit, filling the vacated high bit with the given 1-bit value. Return a tuple of the shifted value and the 1 bit shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_32_2(u2, u32) -> (u32, u2)` | Shift a 32-bit value right by 2 bits, filling the vacated high bits with the given 2-bit value. Return a tuple of the shifted value and the 2 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_32_4(u4, u32) -> (u32, u4)` | Shift a 32-bit value right by 4 bits, filling the vacated high bits with the given 4-bit value. Return a tuple of the shifted value and the 4 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_32_8(u8, u32) -> (u32, u8)` | Shift a 32-bit value right by 8 bits, filling the vacated high bits with the given 8-bit value. Return a tuple of the shifted value and the 8 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_32_16(u16, u32) -> (u32, u16)` | Shift a 32-bit value right by 16 bits, filling the vacated high bits with the given 16-bit value. Return a tuple of the shifted value and the 16 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_64_1(u1, u64) -> (u64, u1)` | Shift a 64-bit value right by 1 bit, filling the vacated high bit with the given 1-bit value. Return a tuple of the shifted value and the 1 bit shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_64_2(u2, u64) -> (u64, u2)` | Shift a 64-bit value right by 2 bits, filling the vacated high bits with the given 2-bit value. Return a tuple of the shifted value and the 2 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_64_4(u4, u64) -> (u64, u4)` | Shift a 64-bit value right by 4 bits, filling the vacated high bits with the given 4-bit value. Return a tuple of the shifted value and the 4 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_64_8(u8, u64) -> (u64, u8)` | Shift a 64-bit value right by 8 bits, filling the vacated high bits with the given 8-bit value. Return a tuple of the shifted value and the 8 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_64_16(u16, u64) -> (u64, u16)` | Shift a 64-bit value right by 16 bits, filling the vacated high bits with the given 16-bit value. Return a tuple of the shifted value and the 16 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_64_32(u32, u64) -> (u64, u32)` | Shift a 64-bit value right by 32 bits, filling the vacated high bits with the given 32-bit value. Return a tuple of the shifted value and the 32 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_8_1(u1, u8) -> (u8, u1)` | Shift an 8-bit value right by 1 bit, filling the vacated high bit with the given 1-bit value. Return a tuple of the shifted value and the 1 bit shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_8_2(u2, u8) -> (u8, u2)` | Shift an 8-bit value right by 2 bits, filling the vacated high bits with the given 2-bit value. Return a tuple of the shifted value and the 2 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `full_right_shift_8_4(u4, u8) -> (u8, u4)` | Shift an 8-bit value right by 4 bits, filling the vacated high bits with the given 4-bit value. Return a tuple of the shifted value and the 4 bits shifted out of the bottom.<br><br>The first argument supplies the bits shifted in, and the second is the value to shift. Chaining these jets, passing the bits shifted out of one word into the next, shifts a value that spans several words. |
    | `high_1() -> u1` | Return `u1::MAX` = 1. |
    | `high_8() -> u8` | Return `u8::MAX` = 2⁸ − 1 = `0xff`. |
    | `high_16() -> u16` | Return `u16::MAX` = 2¹⁶ − 1 = `0xffff`. |
    | `high_32() -> u32` | Return `u32::MAX` = 2³² − 1 = `0xffff_ffff`. |
    | `high_64() -> u64` | Return `u64::MAX` = 2⁶⁴ − 1 = `0xffff_ffff_ffff_ffff`. |
    | `left_extend_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_1_8(u1) -> u8` | Extend a 1-bit value to an 8-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_1_16(u1) -> u16` | Extend a 1-bit value to a 16-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_1_32(u1) -> u32` | Extend a 1-bit value to a 32-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_1_64(u1) -> u64` | Extend a 1-bit value to a 64-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_extend_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its left with the MSB. This is sign extension: if the input is a signed integer in two's complement form, the output represents the same number. |
    | `left_pad_high_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its left with ones. |
    | `left_pad_high_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with ones. |
    | `left_pad_high_1_8(u1) -> u8` | Extend a 1-bit value to an 8-bit value by padding its left with ones. |
    | `left_pad_high_1_16(u1) -> u16` | Extend a 1-bit value to a 16-bit value by padding its left with ones. |
    | `left_pad_high_1_32(u1) -> u32` | Extend a 1-bit value to a 32-bit value by padding its left with ones. |
    | `left_pad_high_1_64(u1) -> u64` | Extend a 1-bit value to a 64-bit value by padding its left with ones. |
    | `left_pad_high_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its left with ones. |
    | `left_pad_high_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its left with ones. |
    | `left_pad_high_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its left with ones. |
    | `left_pad_high_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its left with ones. |
    | `left_pad_low_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its left with zeroes. |
    | `left_pad_low_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its left with zeroes. |
    | `left_pad_low_1_8(u1) -> u8` | Extend a 1-bit value to an 8-bit value by padding its left with zeroes. |
    | `left_pad_low_1_16(u1) -> u16` | Extend a 1-bit value to a 16-bit value by padding its left with zeroes. |
    | `left_pad_low_1_32(u1) -> u32` | Extend a 1-bit value to a 32-bit value by padding its left with zeroes. |
    | `left_pad_low_1_64(u1) -> u64` | Extend a 1-bit value to a 64-bit value by padding its left with zeroes. |
    | `left_pad_low_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its left with zeroes. |
    | `left_pad_low_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its left with zeroes. |
    | `left_pad_low_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its left with zeroes. |
    | `left_pad_low_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its left with zeroes. |
    | `left_rotate_8(u4, u8) -> u8` | Left-rotate an 8-bit value by the given amount. The amount is taken modulo 8. |
    | `left_rotate_16(u4, u16) -> u16` | Left-rotate a 16-bit value by the given amount. |
    | `left_rotate_32(u8, u32) -> u32` | Left-rotate a 32-bit value by the given amount. The amount is taken modulo 32. |
    | `left_rotate_64(u8, u64) -> u64` | Left-rotate a 64-bit value by the given amount. The amount is taken modulo 64. |
    | `left_shift_8(u4, u8) -> u8` | Left-shift an 8-bit value by the given amount. Bits are filled with zeroes. Shifting by 8 or more yields zero. |
    | `left_shift_16(u4, u16) -> u16` | Left-shift a 16-bit value by the given amount. Bits are filled with zeroes. |
    | `left_shift_32(u8, u32) -> u32` | Left-shift a 32-bit value by the given amount. Bits are filled with zeroes. Shifting by 32 or more yields zero. |
    | `left_shift_64(u8, u64) -> u64` | Left-shift a 64-bit value by the given amount. Bits are filled with zeroes. Shifting by 64 or more yields zero. |
    | `left_shift_with_8(u1, u4, u8) -> u8` | Left-shift an 8-bit value by the given amount. Bits are filled with the given bit. Shifting by 8 or more yields a value made up entirely of that bit. |
    | `left_shift_with_16(u1, u4, u16) -> u16` | Left-shift a 16-bit value by the given amount. Bits are filled with the given bit. |
    | `left_shift_with_32(u1, u8, u32) -> u32` | Left-shift a 32-bit value by the given amount. Bits are filled with the given bit. Shifting by 32 or more yields a value made up entirely of that bit. |
    | `left_shift_with_64(u1, u8, u64) -> u64` | Left-shift a 64-bit value by the given amount. Bits are filled with the given bit. Shifting by 64 or more yields a value made up entirely of that bit. |
    | `leftmost_16_1(u16) -> u1` | Return the most significant 1 bit of a 16-bit value. |
    | `leftmost_16_2(u16) -> u2` | Return the most significant 2 bits of a 16-bit value. |
    | `leftmost_16_4(u16) -> u4` | Return the most significant 4 bits of a 16-bit value. |
    | `leftmost_16_8(u16) -> u8` | Return the most significant 8 bits of a 16-bit value. |
    | `leftmost_32_1(u32) -> u1` | Return the most significant 1 bit of a 32-bit value. |
    | `leftmost_32_2(u32) -> u2` | Return the most significant 2 bits of a 32-bit value. |
    | `leftmost_32_4(u32) -> u4` | Return the most significant 4 bits of a 32-bit value. |
    | `leftmost_32_8(u32) -> u8` | Return the most significant 8 bits of a 32-bit value. |
    | `leftmost_32_16(u32) -> u16` | Return the most significant 16 bits of a 32-bit value. |
    | `leftmost_64_1(u64) -> u1` | Return the most significant 1 bit of a 64-bit value. |
    | `leftmost_64_2(u64) -> u2` | Return the most significant 2 bits of a 64-bit value. |
    | `leftmost_64_4(u64) -> u4` | Return the most significant 4 bits of a 64-bit value. |
    | `leftmost_64_8(u64) -> u8` | Return the most significant 8 bits of a 64-bit value. |
    | `leftmost_64_16(u64) -> u16` | Return the most significant 16 bits of a 64-bit value. |
    | `leftmost_64_32(u64) -> u32` | Return the most significant 32 bits of a 64-bit value. |
    | `leftmost_8_1(u8) -> u1` | Return the most significant 1 bit of an 8-bit value. |
    | `leftmost_8_2(u8) -> u2` | Return the most significant 2 bits of an 8-bit value. |
    | `leftmost_8_4(u8) -> u4` | Return the most significant 4 bits of an 8-bit value. |
    | `low_1() -> u1` | Return `u1::MIN` = 0 (as a `u1`). |
    | `low_8() -> u8` | Return `u8::MIN` = 0 (as a `u8`). |
    | `low_16() -> u16` | Return `u16::MIN` = 0 (as a `u16`). |
    | `low_32() -> u32` | Return `u32::MIN` = 0 (as a `u32`). |
    | `low_64() -> u64` | Return `u64::MIN` = 0 (as a `u64`). |
    | `maj_1(u1, u1, u1) -> u1` | Bitwise MAJORITY of three 1-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
    | `maj_8(u8, u8, u8) -> u8` | Bitwise MAJORITY of three 8-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
    | `maj_16(u16, (u16, u16)) -> u16` | Bitwise MAJORITY of three 16-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
    | `maj_32(u32, (u32, u32)) -> u32` | Bitwise MAJORITY of three 32-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
    | `maj_64(u64, (u64, u64)) -> u64` | Bitwise MAJORITY of three 64-bit values. The output bit is false if two or more input bits are false, and true otherwise. |
    | `or_1(u1, u1) -> u1` | Bitwise OR of two 1-bit values. |
    | `or_8(u8, u8) -> u8` | Bitwise OR of two 8-bit values. |
    | `or_16(u16, u16) -> u16` | Bitwise OR of two 16-bit values. |
    | `or_32(u32, u32) -> u32` | Bitwise OR of two 32-bit values. |
    | `or_64(u64, u64) -> u64` | Bitwise OR of two 64-bit values. |
    | `right_extend_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its right with the LSB. |
    | `right_extend_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with the LSB. |
    | `right_extend_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its right with the LSB. |
    | `right_extend_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its right with the LSB. |
    | `right_extend_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its right with the LSB. |
    | `right_extend_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its right with the LSB. |
    | `right_pad_high_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its right with ones. |
    | `right_pad_high_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with ones. |
    | `right_pad_high_1_8(u1) -> u8` | Extend a 1-bit value to an 8-bit value by padding its right with ones. |
    | `right_pad_high_1_16(u1) -> u16` | Extend a 1-bit value to a 16-bit value by padding its right with ones. |
    | `right_pad_high_1_32(u1) -> u32` | Extend a 1-bit value to a 32-bit value by padding its right with ones. |
    | `right_pad_high_1_64(u1) -> u64` | Extend a 1-bit value to a 64-bit value by padding its right with ones. |
    | `right_pad_high_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its right with ones. |
    | `right_pad_high_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its right with ones. |
    | `right_pad_high_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its right with ones. |
    | `right_pad_high_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its right with ones. |
    | `right_pad_low_16_32(u16) -> u32` | Extend a 16-bit value to a 32-bit value by padding its right with zeroes. |
    | `right_pad_low_16_64(u16) -> u64` | Extend a 16-bit value to a 64-bit value by padding its right with zeroes. |
    | `right_pad_low_1_8(u1) -> u8` | Extend a 1-bit value to an 8-bit value by padding its right with zeroes. |
    | `right_pad_low_1_16(u1) -> u16` | Extend a 1-bit value to a 16-bit value by padding its right with zeroes. |
    | `right_pad_low_1_32(u1) -> u32` | Extend a 1-bit value to a 32-bit value by padding its right with zeroes. |
    | `right_pad_low_1_64(u1) -> u64` | Extend a 1-bit value to a 64-bit value by padding its right with zeroes. |
    | `right_pad_low_32_64(u32) -> u64` | Extend a 32-bit value to a 64-bit value by padding its right with zeroes. |
    | `right_pad_low_8_16(u8) -> u16` | Extend an 8-bit value to a 16-bit value by padding its right with zeroes. |
    | `right_pad_low_8_32(u8) -> u32` | Extend an 8-bit value to a 32-bit value by padding its right with zeroes. |
    | `right_pad_low_8_64(u8) -> u64` | Extend an 8-bit value to a 64-bit value by padding its right with zeroes. |
    | `right_rotate_8(u4, u8) -> u8` | Right-rotate an 8-bit value by the given amount. The amount is taken modulo 8. |
    | `right_rotate_16(u4, u16) -> u16` | Right-rotate a 16-bit value by the given amount. |
    | `right_rotate_32(u8, u32) -> u32` | Right-rotate a 32-bit value by the given amount. The amount is taken modulo 32. |
    | `right_rotate_64(u8, u64) -> u64` | Right-rotate a 64-bit value by the given amount. The amount is taken modulo 64. |
    | `right_shift_8(u4, u8) -> u8` | Right-shift an 8-bit value by the given amount. Bits are filled with zeroes. Shifting by 8 or more yields zero. |
    | `right_shift_16(u4, u16) -> u16` | Right-shift a 16-bit value by the given amount. Bits are filled with zeroes. |
    | `right_shift_32(u8, u32) -> u32` | Right-shift a 32-bit value by the given amount. Bits are filled with zeroes. Shifting by 32 or more yields zero. |
    | `right_shift_64(u8, u64) -> u64` | Right-shift a 64-bit value by the given amount. Bits are filled with zeroes. Shifting by 64 or more yields zero. |
    | `right_shift_with_8(u1, u4, u8) -> u8` | Right-shift an 8-bit value by the given amount. Bits are filled with the given bit. Shifting by 8 or more yields a value made up entirely of that bit. |
    | `right_shift_with_16(u1, u4, u16) -> u16` | Right-shift a 16-bit value by the given amount. Bits are filled with the given bit. |
    | `right_shift_with_32(u1, u8, u32) -> u32` | Right-shift a 32-bit value by the given amount. Bits are filled with the given bit. Shifting by 32 or more yields a value made up entirely of that bit. |
    | `right_shift_with_64(u1, u8, u64) -> u64` | Right-shift a 64-bit value by the given amount. Bits are filled with the given bit. Shifting by 64 or more yields a value made up entirely of that bit. |
    | `rightmost_16_1(u16) -> u1` | Return the least significant 1 bit of a 16-bit value. |
    | `rightmost_16_2(u16) -> u2` | Return the least significant 2 bits of a 16-bit value. |
    | `rightmost_16_4(u16) -> u4` | Return the least significant 4 bits of a 16-bit value. |
    | `rightmost_16_8(u16) -> u8` | Return the least significant 8 bits of a 16-bit value. |
    | `rightmost_32_1(u32) -> u1` | Return the least significant 1 bit of a 32-bit value. |
    | `rightmost_32_2(u32) -> u2` | Return the least significant 2 bits of a 32-bit value. |
    | `rightmost_32_4(u32) -> u4` | Return the least significant 4 bits of a 32-bit value. |
    | `rightmost_32_8(u32) -> u8` | Return the least significant 8 bits of a 32-bit value. |
    | `rightmost_32_16(u32) -> u16` | Return the least significant 16 bits of a 32-bit value. |
    | `rightmost_64_1(u64) -> u1` | Return the least significant 1 bit of a 64-bit value. |
    | `rightmost_64_2(u64) -> u2` | Return the least significant 2 bits of a 64-bit value. |
    | `rightmost_64_4(u64) -> u4` | Return the least significant 4 bits of a 64-bit value. |
    | `rightmost_64_8(u64) -> u8` | Return the least significant 8 bits of a 64-bit value. |
    | `rightmost_64_16(u64) -> u16` | Return the least significant 16 bits of a 64-bit value. |
    | `rightmost_64_32(u64) -> u32` | Return the least significant 32 bits of a 64-bit value. |
    | `rightmost_8_1(u8) -> u1` | Return the least significant 1 bit of an 8-bit value. |
    | `rightmost_8_2(u8) -> u2` | Return the least significant 2 bits of an 8-bit value. |
    | `rightmost_8_4(u8) -> u4` | Return the least significant 4 bits of an 8-bit value. |
    | `some_1(u1) -> bool` | Check if a 1-bit value is nonzero. |
    | `some_8(u8) -> bool` | Check if an 8-bit value is nonzero. |
    | `some_16(u16) -> bool` | Check if a 16-bit value is nonzero. |
    | `some_32(u32) -> bool` | Check if a 32-bit value is nonzero. |
    | `some_64(u64) -> bool` | Check if a 64-bit value is nonzero. |
    | `xor_1(u1, u1) -> u1` | Bitwise XOR of two 1-bit values. |
    | `xor_8(u8, u8) -> u8` | Bitwise XOR of two 8-bit values. |
    | `xor_16(u16, u16) -> u16` | Bitwise XOR of two 16-bit values. |
    | `xor_32(u32, u32) -> u32` | Bitwise XOR of two 32-bit values. |
    | `xor_64(u64, u64) -> u64` | Bitwise XOR of two 64-bit values. |
    | `xor_xor_1(u1, u1, u1) -> u1` | Bitwise XOR of three 1-bit values. |
    | `xor_xor_8(u8, u8, u8) -> u8` | Bitwise XOR of three 8-bit values. |
    | `xor_xor_16(u16, (u16, u16)) -> u16` | Bitwise XOR of three 16-bit values. |
    | `xor_xor_32(u32, (u32, u32)) -> u32` | Bitwise XOR of three 32-bit values. |
    | `xor_xor_64(u64, (u64, u64)) -> u64` | Bitwise XOR of three 64-bit values. |

### Arithmetic

These jets do arithmetic on unsigned integers. A result that doesn't fit in the integer type wraps around modulo 2ⁿ, where n is the width of the type, and the jets that can overflow also return a carry or borrow bit that says whether it did. The `full_` jets take a carry or borrow in as well, so that they can be chained to do arithmetic on integers wider than 64 bits.

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `add_8(u8, u8) -> (bool, u8)` | Add two integers. Return a tuple of a carry bit and the sum.<br><br>The carry is `true` if the sum overflows the integer type. The sum then wraps around: it is the true sum minus 2ⁿ, where n is the width of the type. |
    | `add_16(u16, u16) -> (bool, u16)` | Add two integers. Return a tuple of a carry bit and the sum.<br><br>The carry is `true` if the sum overflows the integer type. The sum then wraps around: it is the true sum minus 2ⁿ, where n is the width of the type. |
    | `add_32(u32, u32) -> (bool, u32)` | Add two integers. Return a tuple of a carry bit and the sum.<br><br>The carry is `true` if the sum overflows the integer type. The sum then wraps around: it is the true sum minus 2ⁿ, where n is the width of the type. |
    | `add_64(u64, u64) -> (bool, u64)` | Add two integers. Return a tuple of a carry bit and the sum.<br><br>The carry is `true` if the sum overflows the integer type. The sum then wraps around: it is the true sum minus 2ⁿ, where n is the width of the type. |
    | `decrement_8(u8) -> (bool, u8)` | Decrement an integer by one. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` only if the integer is zero, and the result then wraps around to the maximum value of its type. |
    | `decrement_16(u16) -> (bool, u16)` | Decrement an integer by one. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` only if the integer is zero, and the result then wraps around to the maximum value of its type. |
    | `decrement_32(u32) -> (bool, u32)` | Decrement an integer by one. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` only if the integer is zero, and the result then wraps around to the maximum value of its type. |
    | `decrement_64(u64) -> (bool, u64)` | Decrement an integer by one. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` only if the integer is zero, and the result then wraps around to the maximum value of its type. |
    | `div_mod_8(u8, u8) -> (u8, u8)` | Divide the first integer by the second integer.<br>Return a tuple of the quotient and the remainder.<br><br>Division by zero returns a quotient of zero and a remainder equal to the first integer. |
    | `div_mod_16(u16, u16) -> (u16, u16)` | Divide the first integer by the second integer.<br>Return a tuple of the quotient and the remainder.<br><br>Division by zero returns a quotient of zero and a remainder equal to the first integer. |
    | `div_mod_32(u32, u32) -> (u32, u32)` | Divide the first integer by the second integer.<br>Return a tuple of the quotient and the remainder.<br><br>Division by zero returns a quotient of zero and a remainder equal to the first integer. |
    | `div_mod_64(u64, u64) -> (u64, u64)` | Divide the first integer by the second integer.<br>Return a tuple of the quotient and the remainder.<br><br>Division by zero returns a quotient of zero and a remainder equal to the first integer. |
    | `div_mod_128_64(u128, u64) -> (u64, u64)` | Divide the 128-bit integer `a` by the 64-bit integer `b`.<br>Return a tuple of the quotient `q` and the remainder `r`.<br><br>This is the building block for dividing integers wider than 128 bits by long division, one 64-bit word at a time (Knuth's Algorithm D). Long division first shifts the divisor left until its top bit is set, which satisfies precondition 2, and keeps each running remainder below the divisor, which satisfies precondition 1. For ordinary division, use `div_mod_64` or a narrower jet instead.<br><br><span class="panics">Preconditions</span><ol><li>The quotient fits into 64 bits, i.e. `(a >> 64) < b`</li><li>2⁶³ ≤ `b`</li></ol>Return `(u64::MAX, u64::MAX)` when the preconditions are not satisfied. |
    | `divide_8(u8, u8) -> u8` | Divide the first integer by the second integer.<br><br>Division by zero returns zero. |
    | `divide_16(u16, u16) -> u16` | Divide the first integer by the second integer.<br><br>Division by zero returns zero. |
    | `divide_32(u32, u32) -> u32` | Divide the first integer by the second integer.<br><br>Division by zero returns zero. |
    | `divide_64(u64, u64) -> u64` | Divide the first integer by the second integer.<br><br>Division by zero returns zero. |
    | `divides_8(u8, u8) -> bool` | Check if the first integer divides the second integer, i.e. if the second integer is divisible by the first. Zero divides only zero. |
    | `divides_16(u16, u16) -> bool` | Check if the first integer divides the second integer, i.e. if the second integer is divisible by the first. Zero divides only zero. |
    | `divides_32(u32, u32) -> bool` | Check if the first integer divides the second integer, i.e. if the second integer is divisible by the first. Zero divides only zero. |
    | `divides_64(u64, u64) -> bool` | Check if the first integer divides the second integer, i.e. if the second integer is divisible by the first. Zero divides only zero. |
    | `full_add_8(bool, u8, u8) -> (bool, u8)` | Add two integers and a carry-in bit. Return a tuple of a carry-out bit and the sum.<br><br>The first argument is the carry-in. The carry-out is `true` if the sum overflows the integer type, and the sum then wraps around. To add integers wider than 64 bits, add them one word at a time, starting from the least significant word, and pass each carry-out to the next carry-in. |
    | `full_add_16(bool, u16, u16) -> (bool, u16)` | Add two integers and a carry-in bit. Return a tuple of a carry-out bit and the sum.<br><br>The first argument is the carry-in. The carry-out is `true` if the sum overflows the integer type, and the sum then wraps around. To add integers wider than 64 bits, add them one word at a time, starting from the least significant word, and pass each carry-out to the next carry-in. |
    | `full_add_32(bool, u32, u32) -> (bool, u32)` | Add two integers and a carry-in bit. Return a tuple of a carry-out bit and the sum.<br><br>The first argument is the carry-in. The carry-out is `true` if the sum overflows the integer type, and the sum then wraps around. To add integers wider than 64 bits, add them one word at a time, starting from the least significant word, and pass each carry-out to the next carry-in. |
    | `full_add_64(bool, u64, u64) -> (bool, u64)` | Add two integers and a carry-in bit. Return a tuple of a carry-out bit and the sum.<br><br>The first argument is the carry-in. The carry-out is `true` if the sum overflows the integer type, and the sum then wraps around. To add integers wider than 64 bits, add them one word at a time, starting from the least significant word, and pass each carry-out to the next carry-in. |
    | `full_decrement_8(bool, u8) -> (bool, u8)` | Decrement an integer by one if the borrow-in bit is `true`. Return a tuple of a borrow-out bit and the result.<br><br>The first argument is the borrow-in. The borrow-out is `true` only if the borrow-in is `true` and the integer is zero; the result then wraps around to the maximum value of its type. Chaining these jets propagates a borrow through an integer wider than 64 bits. |
    | `full_decrement_16(bool, u16) -> (bool, u16)` | Decrement an integer by one if the borrow-in bit is `true`. Return a tuple of a borrow-out bit and the result.<br><br>The first argument is the borrow-in. The borrow-out is `true` only if the borrow-in is `true` and the integer is zero; the result then wraps around to the maximum value of its type. Chaining these jets propagates a borrow through an integer wider than 64 bits. |
    | `full_decrement_32(bool, u32) -> (bool, u32)` | Decrement an integer by one if the borrow-in bit is `true`. Return a tuple of a borrow-out bit and the result.<br><br>The first argument is the borrow-in. The borrow-out is `true` only if the borrow-in is `true` and the integer is zero; the result then wraps around to the maximum value of its type. Chaining these jets propagates a borrow through an integer wider than 64 bits. |
    | `full_decrement_64(bool, u64) -> (bool, u64)` | Decrement an integer by one if the borrow-in bit is `true`. Return a tuple of a borrow-out bit and the result.<br><br>The first argument is the borrow-in. The borrow-out is `true` only if the borrow-in is `true` and the integer is zero; the result then wraps around to the maximum value of its type. Chaining these jets propagates a borrow through an integer wider than 64 bits. |
    | `full_increment_8(bool, u8) -> (bool, u8)` | Increment an integer by one if the carry-in bit is `true`. Return a tuple of a carry-out bit and the result.<br><br>The first argument is the carry-in. The carry-out is `true` only if the carry-in is `true` and the integer is the maximum value of its type; the result then wraps around to zero. Chaining these jets propagates a carry through an integer wider than 64 bits. |
    | `full_increment_16(bool, u16) -> (bool, u16)` | Increment an integer by one if the carry-in bit is `true`. Return a tuple of a carry-out bit and the result.<br><br>The first argument is the carry-in. The carry-out is `true` only if the carry-in is `true` and the integer is the maximum value of its type; the result then wraps around to zero. Chaining these jets propagates a carry through an integer wider than 64 bits. |
    | `full_increment_32(bool, u32) -> (bool, u32)` | Increment an integer by one if the carry-in bit is `true`. Return a tuple of a carry-out bit and the result.<br><br>The first argument is the carry-in. The carry-out is `true` only if the carry-in is `true` and the integer is the maximum value of its type; the result then wraps around to zero. Chaining these jets propagates a carry through an integer wider than 64 bits. |
    | `full_increment_64(bool, u64) -> (bool, u64)` | Increment an integer by one if the carry-in bit is `true`. Return a tuple of a carry-out bit and the result.<br><br>The first argument is the carry-in. The carry-out is `true` only if the carry-in is `true` and the integer is the maximum value of its type; the result then wraps around to zero. Chaining these jets propagates a carry through an integer wider than 64 bits. |
    | `full_multiply_8(u8, u8, u8, u8) -> u16` | Multiply the first two integers and add the last two: for the arguments `a`, `b`, `c`, and `d`, return `a * b + c + d`.<br><br>The result is twice as wide as the inputs and never overflows: even when every input is the maximum value 2ⁿ − 1, the result is 2²ⁿ − 1. This makes it the building block for multiplying integers wider than 64 bits one word at a time, with `c` and `d` adding in carries from the other partial products. |
    | `full_multiply_16(u16, u16, u16, u16) -> u32` | Multiply the first two integers and add the last two: for the arguments `a`, `b`, `c`, and `d`, return `a * b + c + d`.<br><br>The result is twice as wide as the inputs and never overflows: even when every input is the maximum value 2ⁿ − 1, the result is 2²ⁿ − 1. This makes it the building block for multiplying integers wider than 64 bits one word at a time, with `c` and `d` adding in carries from the other partial products. |
    | `full_multiply_32(u32, u32, u32, u32) -> u64` | Multiply the first two integers and add the last two: for the arguments `a`, `b`, `c`, and `d`, return `a * b + c + d`.<br><br>The result is twice as wide as the inputs and never overflows: even when every input is the maximum value 2ⁿ − 1, the result is 2²ⁿ − 1. This makes it the building block for multiplying integers wider than 64 bits one word at a time, with `c` and `d` adding in carries from the other partial products. |
    | `full_multiply_64(u64, u64, u64, u64) -> u128` | Multiply the first two integers and add the last two: for the arguments `a`, `b`, `c`, and `d`, return `a * b + c + d`.<br><br>The result is twice as wide as the inputs and never overflows: even when every input is the maximum value 2ⁿ − 1, the result is 2²ⁿ − 1. This makes it the building block for multiplying integers wider than 64 bits one word at a time, with `c` and `d` adding in carries from the other partial products. |
    | `full_subtract_8(bool, u8, u8) -> (bool, u8)` | Subtract the second integer and a borrow-in bit from the first integer. Return a tuple of a borrow-out bit and the difference.<br><br>The first argument is the borrow-in. The borrow-out is `true` if the result would be negative, and the difference then wraps around. To subtract integers wider than 64 bits, subtract them one word at a time, starting from the least significant word, and pass each borrow-out to the next borrow-in. |
    | `full_subtract_16(bool, u16, u16) -> (bool, u16)` | Subtract the second integer and a borrow-in bit from the first integer. Return a tuple of a borrow-out bit and the difference.<br><br>The first argument is the borrow-in. The borrow-out is `true` if the result would be negative, and the difference then wraps around. To subtract integers wider than 64 bits, subtract them one word at a time, starting from the least significant word, and pass each borrow-out to the next borrow-in. |
    | `full_subtract_32(bool, u32, u32) -> (bool, u32)` | Subtract the second integer and a borrow-in bit from the first integer. Return a tuple of a borrow-out bit and the difference.<br><br>The first argument is the borrow-in. The borrow-out is `true` if the result would be negative, and the difference then wraps around. To subtract integers wider than 64 bits, subtract them one word at a time, starting from the least significant word, and pass each borrow-out to the next borrow-in. |
    | `full_subtract_64(bool, u64, u64) -> (bool, u64)` | Subtract the second integer and a borrow-in bit from the first integer. Return a tuple of a borrow-out bit and the difference.<br><br>The first argument is the borrow-in. The borrow-out is `true` if the result would be negative, and the difference then wraps around. To subtract integers wider than 64 bits, subtract them one word at a time, starting from the least significant word, and pass each borrow-out to the next borrow-in. |
    | `increment_8(u8) -> (bool, u8)` | Increment an integer by one. Return a tuple of a carry bit and the result.<br><br>The carry is `true` only if the integer is the maximum value of its type, and the result then wraps around to zero. |
    | `increment_16(u16) -> (bool, u16)` | Increment an integer by one. Return a tuple of a carry bit and the result.<br><br>The carry is `true` only if the integer is the maximum value of its type, and the result then wraps around to zero. |
    | `increment_32(u32) -> (bool, u32)` | Increment an integer by one. Return a tuple of a carry bit and the result.<br><br>The carry is `true` only if the integer is the maximum value of its type, and the result then wraps around to zero. |
    | `increment_64(u64) -> (bool, u64)` | Increment an integer by one. Return a tuple of a carry bit and the result.<br><br>The carry is `true` only if the integer is the maximum value of its type, and the result then wraps around to zero. |
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
    | `modulo_8(u8, u8) -> u8` | Compute the remainder after dividing the first integer by the second integer.<br><br>Division by zero returns the first integer. |
    | `modulo_16(u16, u16) -> u16` | Compute the remainder after dividing the first integer by the second integer.<br><br>Division by zero returns the first integer. |
    | `modulo_32(u32, u32) -> u32` | Compute the remainder after dividing the first integer by the second integer.<br><br>Division by zero returns the first integer. |
    | `modulo_64(u64, u64) -> u64` | Compute the remainder after dividing the first integer by the second integer.<br><br>Division by zero returns the first integer. |
    | `multiply_8(u8, u8) -> u16` | Multiply two integers. The output is a 16-bit integer. |
    | `multiply_16(u16, u16) -> u32` | Multiply two integers. The output is a 32-bit integer. |
    | `multiply_32(u32, u32) -> u64` | Multiply two integers. The output is a 64-bit integer. |
    | `multiply_64(u64, u64) -> u128` | Multiply two integers. The output is a 128-bit integer. |
    | `negate_8(u8) -> (bool, u8)` | Negate an integer modulo 2⁸, that is, subtract it from zero. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` for every nonzero integer. The result is 2⁸ minus the integer, or zero if the integer is zero. |
    | `negate_16(u16) -> (bool, u16)` | Negate an integer modulo 2¹⁶, that is, subtract it from zero. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` for every nonzero integer. The result is 2¹⁶ minus the integer, or zero if the integer is zero. |
    | `negate_32(u32) -> (bool, u32)` | Negate an integer modulo 2³², that is, subtract it from zero. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` for every nonzero integer. The result is 2³² minus the integer, or zero if the integer is zero. |
    | `negate_64(u64) -> (bool, u64)` | Negate an integer modulo 2⁶⁴, that is, subtract it from zero. Return a tuple of a borrow bit and the result.<br><br>The borrow is `true` for every nonzero integer. The result is 2⁶⁴ minus the integer, or zero if the integer is zero. |
    | `one_8() -> u8` | Return 1 as an 8-bit integer. |
    | `one_16() -> u16` | Return 1 as a 16-bit integer. |
    | `one_32() -> u32` | Return 1 as a 32-bit integer. |
    | `one_64() -> u64` | Return 1 as a 64-bit integer. |
    | `subtract_8(u8, u8) -> (bool, u8)` | Subtract the second integer from the first integer. Return a tuple of a borrow bit and the difference.<br><br>The borrow is `true` if the second integer is greater than the first. The difference then wraps around: it is the true difference plus 2ⁿ, where n is the width of the type. |
    | `subtract_16(u16, u16) -> (bool, u16)` | Subtract the second integer from the first integer. Return a tuple of a borrow bit and the difference.<br><br>The borrow is `true` if the second integer is greater than the first. The difference then wraps around: it is the true difference plus 2ⁿ, where n is the width of the type. |
    | `subtract_32(u32, u32) -> (bool, u32)` | Subtract the second integer from the first integer. Return a tuple of a borrow bit and the difference.<br><br>The borrow is `true` if the second integer is greater than the first. The difference then wraps around: it is the true difference plus 2ⁿ, where n is the width of the type. |
    | `subtract_64(u64, u64) -> (bool, u64)` | Subtract the second integer from the first integer. Return a tuple of a borrow bit and the difference.<br><br>The borrow is `true` if the second integer is greater than the first. The difference then wraps around: it is the true difference plus 2ⁿ, where n is the width of the type. |

### Hash functions

These jets compute SHA256 hashes. To hash data, start a hash context with `sha_256_ctx_8_init`, add data to it with the `sha_256_ctx_8_add_*` jets, and get the hash with `sha_256_ctx_8_finalize`. The hash context has the type `Ctx8`. `sha_256_block` and `sha_256_iv` are the lower-level SHA256 compression function and initial value.

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `sha_256_block(u256, u256, u256) -> u256` | Update the given 256-bit midstate by running the SHA256 block compression function, using the given 512-bit block. |
    | `sha_256_ctx_8_add_1(Ctx8, u8) -> Ctx8` | Add 1 byte to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_2(Ctx8, u16) -> Ctx8` | Add 2 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_4(Ctx8, u32) -> Ctx8` | Add 4 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_8(Ctx8, u64) -> Ctx8` | Add 8 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_16(Ctx8, u128) -> Ctx8` | Add 16 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_32(Ctx8, u256) -> Ctx8` | Add 32 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_64(Ctx8, [u8; 64]) -> Ctx8` | Add 64 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_128(Ctx8, [u8; 128]) -> Ctx8` | Add 128 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_256(Ctx8, [u8; 256]) -> Ctx8` | Add 256 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_512(Ctx8, [u8; 512]) -> Ctx8` | Add 512 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_add_buffer_511(Ctx8, List<u8, 512>) -> Ctx8` | Add a list of less than 512 bytes to the SHA256 hash engine. |
    | `sha_256_ctx_8_finalize(Ctx8) -> u256` | Produce a hash from the current state of the SHA256 hash engine. |
    | `sha_256_ctx_8_init() -> Ctx8` | Initialize a default SHA256 hash engine. |
    | `sha_256_iv() -> u256` | Return the SHA256 initial value. |

### Elliptic curve functions

These jets are building blocks for implementing elliptic curve cryptography on the secp256k1 curve. Most programs don't need them: to check a signature, use `bip_0340_verify` (see [Digital signatures](#digital-signatures)).

The types are `Fe`, a field element (an integer modulo the field size p); `Scalar`, an integer modulo the curve order n; `Ge`, a point in affine coordinates (x, y); `Gej`, a point in Jacobian coordinates (X, Y, Z), which represents the affine point (X/Z², Y/Z³); and `Point`, a compressed point (a y-coordinate parity bit and an x-coordinate). Their definitions are listed with the [builtin type aliases](../simplicityhl-reference/type_alias.md#builtin-aliases).

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `decompress(Point) -> Option<Ge>` | Decompress a point into affine coordinates.<ul><li>Return `None` if the x-coordinate is not on the curve.</li><li>Return `Some(ge)` even if the x-coordinate is not normalized.</li></ul> |
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
    | `ge_negate(Ge) -> Ge` | Negate a point. |
    | `gej_add(Gej, Gej) -> Gej` | Add two points. |
    | `gej_double(Gej) -> Gej` | Double a point. If the result is the point at infinity, it is returned in canonical form. |
    | `gej_equiv(Gej, Gej) -> bool` | Check if two points in Jacobian coordinates represent the same point. |
    | `gej_ge_add(Gej, Ge) -> Gej` | Add two points. If the result is the point at infinity, it is returned in canonical form. |
    | `gej_ge_add_ex(Gej, Ge) -> (Fe, Gej)` | Add two points. Also return the ratio of the result's z-coordinate to `a`'s z-coordinate. If the result is the point at infinity, it is returned in canonical form. |
    | `gej_ge_equiv(Gej, Ge) -> bool` | Check if a point in Jacobian coordinates and a point in affine coordinates represent the same point. |
    | `gej_infinity() -> Gej` | Return the canonical representation of the point at infinity. |
    | `gej_is_infinity(Gej) -> bool` | Check if the point represents infinity. |
    | `gej_is_on_curve(Gej) -> bool` | Check if the given point satisfies the curve equation y² = x³ + 7. |
    | `gej_negate(Gej) -> Gej` | Negate a point. |
    | `gej_normalize(Gej) -> Option<Ge>` | Convert the point into affine coordinates with canonical field representatives.<br><br>Return `None` if the point is the point at infinity. |
    | `gej_rescale(Gej, Fe) -> Gej` | Change the representatives of a point by multiplying the z-coefficient by the given value. |
    | `gej_x_equiv(Fe, Gej) -> bool` | Check if the point represents an affine point with the given x-coordinate. |
    | `gej_y_is_odd(Gej) -> bool` | Check if the point represents an affine point with odd y-coordinate. |
    | `generate(Scalar) -> Gej` | Multiply the generator point with the given scalar. |
    | `hash_to_curve(u256) -> Ge` | A cryptographic hash function that results in a point on the secp256k1 curve.<br><br>In Elements, this matches the hash function used to map asset IDs to asset commitments.<br><br><span class="panics">Panics</span><br>An intermediate hash value exceeds the secp256k1 field size.<br><br>Finding an input that causes this is computationally infeasible. |
    | `linear_combination_1((Scalar, Gej), Scalar) -> Gej` | Compute the linear combination `a * b + c * g` for scalars `a` and `c` and point `b`, where `g` is the generator point.<br><br><span class="panics">Panics</span><br>The point `b` is not on the curve. |
    | `linear_verify_1(((Scalar, Ge), Scalar), Ge) -> ()` | Given the arguments `((k, p), m)` and `b`, assert that the point `b` is equal to the linear combination `k * p + m * g`, where `g` is the generator point.<br><br><span class="panics">Panics</span><br>The assertion fails. |
    | `point_verify_1(((Scalar, Point), Scalar), Point) -> ()` | Given the arguments `((k, p), m)` and `b`, assert that the point `b` is equal to the linear combination `k * p + m * g`, where `g` is the generator point.<br><br>The points `p` and `b` are given in compressed form, as a y-coordinate parity bit together with an x-coordinate.<br><br><span class="panics">Panics</span><ul><li>The assertion fails.</li><li>A point cannot be decompressed.</li></ul> |
    | `scalar_add(Scalar, Scalar) -> Scalar` | Add two scalars. |
    | `scalar_invert(Scalar) -> Scalar` | Compute the modular inverse of a scalar. |
    | `scalar_is_zero(Scalar) -> bool` | Check if the scalar represents zero. |
    | `scalar_multiply(Scalar, Scalar) -> Scalar` | Multiply two scalars. |
    | `scalar_multiply_lambda(Scalar) -> Scalar` | Multiply a scalar with the canonical primitive cube root of unity (lambda). |
    | `scalar_negate(Scalar) -> Scalar` | Negate a scalar. |
    | `scalar_normalize(Scalar) -> Scalar` | Return the canonical representation of the scalar. |
    | `scalar_square(Scalar) -> Scalar` | Square a scalar. |
    | `scale(Scalar, Gej) -> Gej` | Multiply a point by a scalar.<br><br><span class="panics">Panics</span><br>The given point is not on the curve. |
    | `swu(Fe) -> Ge` | Map a field element to a point on the secp256k1 curve, using the method defined in ["Indifferentiable Hashing to Barreto-Naehrig Curves"](https://inria.hal.science/hal-01094321/file/FT12.pdf) by Pierre-Alain Fouque and Mehdi Tibouchi.<br><br>This isn't a cryptographic hash function by itself, and its output isn't uniformly distributed over the curve. Adding the results of two calls on independent field elements gives a distribution close to uniform, which is how `hash_to_curve` uses it. |

### Digital signatures

`bip_0340_verify` checks a Schnorr signature, as defined in [BIP-0340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki). To check a signature over the spending transaction, pass `sig_all_hash` as the message; see [Signature hash modes](#signature-hash-modes).

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `bip_0340_verify((Pubkey, Message), Signature) -> ()` | Assert that a Schnorr signature, as defined in [BIP-0340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki), is valid for the given public key and message. The public key is an x-only key (32 bytes), the message is 32 bytes, and the signature is 64 bytes.<br><br>The message is usually `sig_all_hash`, which commits to the spending transaction: `jet::bip_0340_verify((pubkey, jet::sig_all_hash()), signature)`.<br><br><span class="panics">Panics</span><br>The assertion fails. |

### Bitcoin

These jets decode Bitcoin's consensus encodings of lock times and sequence numbers, and start a SHA256 context initialized with a `TapData` tag. Both integrations have them, because Elements uses the same encodings.

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `parse_lock(u32) -> Either<Height, Time>` | Parse an integer as a consensus-encoded Bitcoin lock time.<ul><li>Return `Left(n)` if the lock time is the block height `n` (less than `500000000`).</li><li>Return `Right(n)` if the lock time is the UNIX timestamp `n` (`500000000` or greater).</li></ul> |
    | `parse_sequence(u32) -> Option<Either<Distance, Duration>>` | Parse an integer as a consensus-encoded Bitcoin sequence number.<ul><li>Return `Some(Left(n))` if the sequence number encodes a relative lock time of `n` blocks.</li><li>Return `Some(Right(n))` if the sequence number encodes a relative lock time of `n` units of 512 seconds.</li><li>Return `None` if the sequence number disables relative lock times.</li></ul> |
    | `tapdata_init() -> Ctx8` | Create a SHA256 context, initialized with a `TapData` tag. |

### Signature hash modes

**For most programs, use `sig_all_hash`.** It's the standard signature message: it signs the whole transaction, wallet and developer tools sign it by default, and a program checks a signature against it with `jet::bip_0340_verify((pubkey, jet::sig_all_hash()), signature)`.

The other jets in this section compute the parts that make up that message. Simplicity signatures don't carry a sighash flag, so a program that needs a different signature mode, or wants to commit to chosen parts of the transaction, builds its own message from these jets.

Each hash jet's description starts with a formula. In it, ‖ is byte concatenation, and a jet name stands for that jet's result. The list after the formula gives the exact bytes of each part.

=== "Elements"

    ???+ "Click to hide"
        | <div style="width:22em">Jet</div> | Description |
        | ----------------------------------- | ----------- |
        | `annex_hash(Ctx8, Option<u256>) -> Ctx8` | Continue a SHA256 hash with an optional hash by appending the following:<ul><li>If there is no hash, then the byte `0x00`.</li><li>If there is a hash, then the byte `0x01` followed by the given hash (32 bytes).</li></ul> |
        | `asset_amount_hash(Ctx8, Asset1, Amount1) -> Ctx8` | Continue a SHA256 hash with the serialization of a confidential asset followed by the serialization of an amount. |
        | `build_tapbranch(u256, u256) -> u256` | `SHA256(t ‖ t ‖ min(x, y) ‖ max(x, y))` for the inputs `x` and `y`, where `t` is `SHA256("TapBranch/elements")`.<br><br>Return the SHA256 hash of the following:<ul><li>The hash of the ASCII string `TapBranch/elements` (32 bytes).</li><li>The hash of the ASCII string `TapBranch/elements` again (32 bytes).</li><li>The lexicographically smaller of the two inputs (32 bytes).</li><li>The lexicographically larger of the two inputs (32 bytes).</li></ul>This builds a taproot branch hash from the hashes of its two children. |
        | `build_tapleaf_simplicity(u256) -> u256` | `SHA256(t ‖ t ‖ 0xbe ‖ 0x20 ‖ cmr)` for the input `cmr`, where `t` is `SHA256("TapLeaf/elements")`.<br><br>Return the SHA256 hash of the following:<ul><li>The hash of the ASCII string `TapLeaf/elements` (32 bytes).</li><li>The hash of the ASCII string `TapLeaf/elements` again (32 bytes).</li><li>The Simplicity leaf version `0xbe` (1 byte).</li><li>The byte `0x20` (1 byte).</li><li>The input CMR (32 bytes).</li></ul>This builds a tapleaf hash for a Simplicity program. |
        | `build_taptweak(Pubkey, u256) -> u256` | Implementation of `taproot_tweak_pubkey` from [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).<br><br><span class="panics">Panics</span><ol><li>The input x-only public key is off curve or exceeds the field size.</li><li>The internal hash value `t` exceeds the secp256k1 group order.</li><li>The generated tweaked point is infinity, and thus has no valid x-only public key.</li></ol>Finding inputs that cause situations 2 or 3 is computationally infeasible. |
        | `input_amounts_hash() -> u256` | `SHA256(asset₀ ‖ amount₀ ‖ … ‖ assetₙ₋₁ ‖ amountₙ₋₁)` for the outputs that the n inputs spend.<br><br>Return the SHA256 hash of the serialization of each input UTXO's asset and amount fields. |
        | `input_annexes_hash() -> u256` | `SHA256(annex₀ ‖ … ‖ annexₙ₋₁)` for the n inputs, where each `annexᵢ` is as listed below.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>If the input has no annex, or isn't a taproot spend, then the byte `0x00`.</li><li>If the input has an annex, then the byte `0x01` followed by the SHA256 hash of the annex (32 bytes).</li></ul> |
        | `input_hash(u32) -> Option<u256>` | `SHA256(pegin ‖ prev_txid ‖ prev_index ‖ sequence ‖ annex)` for the input at the given index, with each part as listed below.<br><br>Return the SHA256 hash of the following:<ul><li>If the input is not a peg-in, then the byte `0x00`.</li><li>If the input is a peg-in, then the byte `0x01` followed by the parent chain's genesis hash (32 bytes).</li><li>The input's serialized previous transaction ID (32 bytes).</li><li>The input's previous transaction index in big endian format (4 bytes).</li><li>The input's sequence number in big endian format (4 bytes).</li><li>If the input has no annex, or isn't a taproot spend, then the byte `0x00`.</li><li>If the input has an annex, then the byte `0x01` followed by the SHA256 hash of the annex (32 bytes).</li></ul>Return `None` if the input does not exist. |
        | `input_outpoints_hash() -> u256` | `SHA256(pegin₀ ‖ outpoint₀ ‖ … ‖ peginₙ₋₁ ‖ outpointₙ₋₁)` for the n inputs, with each part as listed below.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>If the input is not a peg-in, then the byte `0x00`.</li><li>If the input is a peg-in, then the byte `0x01` followed by the parent chain's genesis hash (32 bytes).</li><li>The input's serialized previous transaction ID (32 bytes).</li><li>The input's previous transaction index in big endian format (4 bytes).</li></ul><br><span class="panics">Important</span><br>The index is serialized in big endian format rather than little endian format. |
        | `input_script_sigs_hash() -> u256` | `SHA256(SHA256(script_sig₀) ‖ … ‖ SHA256(script_sigₙ₋₁))` for the n inputs.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each input's scriptSig.<br><br>Note that if an input's UTXO uses segwit, then its scriptSig will necessarily be the empty string. In such cases, the SHA256 hash of the empty string is still used. |
        | `input_scripts_hash() -> u256` | `SHA256(SHA256(script₀) ‖ … ‖ SHA256(scriptₙ₋₁))`, where `scriptᵢ` is the scriptPubKey of the output that input i spends.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each input UTXO's scriptPubKey. |
        | `input_sequences_hash() -> u256` | `SHA256(sequence₀ ‖ … ‖ sequenceₙ₋₁)` for the n inputs.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>The input's sequence number in big endian format (4 bytes).</li></ul><br><span class="panics">Important</span><br>The sequence number is serialized in big endian format rather than little endian format. |
        | `input_utxo_hash(u32) -> Option<u256>` | `SHA256(asset ‖ amount ‖ SHA256(script))` for the output that the input at the given index spends, where `script` is its scriptPubKey.<br><br>Return the SHA256 hash of the following:<ul><li>The serialization of the input UTXO's asset and amount fields.</li><li>The SHA256 hash of the input UTXO's scriptPubKey.</li></ul>Return `None` if the input does not exist. |
        | `input_utxos_hash() -> u256` | `SHA256(input_amounts_hash ‖ input_scripts_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `input_amounts_hash` (32 bytes).</li><li>The result of `input_scripts_hash` (32 bytes).</li></ul> |
        | `inputs_hash() -> u256` | `SHA256(input_outpoints_hash ‖ input_sequences_hash ‖ input_annexes_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `input_outpoints_hash` (32 bytes).</li><li>The result of `input_sequences_hash` (32 bytes).</li><li>The result of `input_annexes_hash` (32 bytes).</li></ul><br><span class="panics">Note</span><br>The result of `input_script_sigs_hash` is specifically excluded. Commit to it separately if your program needs to cover it. |
        | `issuance_asset_amounts_hash() -> u256` | `SHA256(issuance₀ ‖ … ‖ issuanceₙ₋₁)` for the n inputs, where each `issuanceᵢ` is as listed below.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>If the input has no issuance then two bytes `0x00 0x00`.</li><li>If the input has a new issuance then the byte `0x01` followed by a serialization of the calculated issued asset id (32 bytes) followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).</li><li>If the input has a reissuance then the byte `0x01` followed by a serialization of the issued asset id (32 bytes), followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).</li></ul><br><span class="panics">Important</span><br>If there is an issuance but there is no asset issued (i.e. the amount is null), the value is serialized as the explicit 0 amount: the byte `0x01` followed by eight `0x00` bytes.<br><br><span class="panics">Note</span><br>The issuance asset id is serialized in the same format as an explicit asset id would be. |
        | `issuance_blinding_entropy_hash() -> u256` | `SHA256(entropy₀ ‖ … ‖ entropyₙ₋₁)` for the n inputs, where each `entropyᵢ` is as listed below.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>If the input has no issuance then the byte `0x00`.</li><li>If the input has a new issuance then the byte `0x01` followed by 32 `0x00` bytes and the new issuance's contract hash field (32 bytes).</li><li>If the input has a reissuance then the byte `0x01` followed by a serialization of the reissuance's blinding nonce field (32 bytes) and the reissuance's entropy field (32 bytes).</li></ul>Note that if the issuance is a new issuance then the blinding nonce field is 32 `0x00` bytes and new issuance's contract hash. |
        | `issuance_hash(u32) -> Option<u256>` | `SHA256(asset_issuance ‖ token_issuance ‖ range_proofs ‖ blinding_entropy)` for the input at the given index, with each part as listed below.<br><br>Return the SHA256 hash of the following:<ol><li>The asset issuance:<ul><li>If the input has no issuance then two bytes `0x00 0x00`.</li><li>If the input has a new issuance then the byte `0x01` followed by a serialization of the calculated issued asset id (32 bytes) followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).</li><li>If the input has a reissuance then the byte `0x01` followed by a serialization of the issued asset id (32 bytes), followed by the serialization of the (possibly confidential) issued asset amount (9 bytes or 33 bytes).</li></ul></li><li>The token issuance:<ul><li>If the input has no issuance then two bytes `0x00 0x00`.</li><li>If the input has a new issuance then the byte `0x01` followed by a serialization of the calculated issued token id (32 bytes) followed by the serialization of the (possibly confidential) issued token amount (9 bytes or 33 bytes).</li><li>If the input has a reissuance then the byte `0x01` followed by a serialization of the issued token id (32 bytes), followed by the serialization of the explicit 0 amount, which is the byte `0x01` followed by eight `0x00` bytes (9 bytes).</li></ul></li><li>The range proofs:<ul><li>The SHA256 hash of the range proof of the input's issuance asset amount (32 bytes).</li><li>The SHA256 hash of the range proof of the input's issuance token amount (32 bytes).</li></ul></li><li>The blinding entropy:<ul><li>If the input has no issuance then the byte `0x00`.</li><li>If the input has a new issuance then the byte `0x01` followed by 32 `0x00` bytes and the new issuance's contract hash field (32 bytes).</li><li>If the input has a reissuance then the byte `0x01` followed by a serialization of the reissuance's blinding nonce field (32 bytes) and the reissuance's entropy field (32 bytes).</li></ul></li></ol>Return `None` if the input does not exist. |
        | `issuance_range_proofs_hash() -> u256` | `SHA256(SHA256(asset_proof₀) ‖ SHA256(token_proof₀) ‖ … ‖ SHA256(asset_proofₙ₋₁) ‖ SHA256(token_proofₙ₋₁))` for the n inputs.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>The SHA256 hash of the range proof of the input's issuance asset amount (32 bytes).</li><li>The SHA256 hash of the range proof of the input's issuance token amount (32 bytes).</li></ul>Note that each range proof is considered to be the empty string in the case there is no issuance, or if the asset or token amount doesn't exist (i.e. is null). The SHA256 hash of the empty string is still used in these cases. |
        | `issuance_token_amounts_hash() -> u256` | `SHA256(issuance₀ ‖ … ‖ issuanceₙ₋₁)` for the n inputs, where each `issuanceᵢ` is as listed below.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>If the input has no issuance then two bytes `0x00 0x00`.</li><li>If the input has a new issuance then the byte `0x01` followed by a serialization of the calculated issued token id (32 bytes) followed by the serialization of the (possibly confidential) issued token amount (9 bytes or 33 bytes).</li><li>If the input has a reissuance then the byte `0x01` followed by a serialization of the issued token id (32 bytes), followed by the serialization of the explicit 0 amount, which is the byte `0x01` followed by eight `0x00` bytes (9 bytes).</li></ul><br><span class="panics">Important</span><br>If there is an issuance but there are no tokens issued (i.e. the amount is null), the value is serialized as the explicit 0 amount: the byte `0x01` followed by eight `0x00` bytes.<br><br><span class="panics">Note</span><br>The issuance token id is serialized in the same format as an explicit asset id would be. |
        | `issuances_hash() -> u256` | `SHA256(issuance_asset_amounts_hash ‖ issuance_token_amounts_hash ‖ issuance_range_proofs_hash ‖ issuance_blinding_entropy_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `issuance_asset_amounts_hash` (32 bytes).</li><li>The result of `issuance_token_amounts_hash` (32 bytes).</li><li>The result of `issuance_range_proofs_hash` (32 bytes).</li><li>The result of `issuance_blinding_entropy_hash` (32 bytes).</li></ul> |
        | `nonce_hash(Ctx8, Option<Nonce>) -> Ctx8` | Continue the SHA256 hash with the serialization of an optional nonce. |
        | `outpoint_hash(Ctx8, Option<u256>, Outpoint) -> Ctx8` | Continue the SHA256 hash with an optional peg-in and an outpoint by appending the following:<ul><li>If the input is not a peg-in, then the byte `0x00`.</li><li>If the input is a peg-in, then the byte `0x01` followed by the given parent genesis hash (32 bytes).</li><li>The input's previous transaction ID (32 bytes).</li><li>The input's previous transaction index in big endian format (4 bytes).</li></ul> |
        | `output_amounts_hash() -> u256` | `SHA256(asset₀ ‖ amount₀ ‖ … ‖ assetₙ₋₁ ‖ amountₙ₋₁)` for the n outputs.<br><br>Return the SHA256 hash of the serialization of each output's asset and amount fields. |
        | `output_hash(u32) -> Option<u256>` | `SHA256(asset ‖ amount ‖ nonce ‖ SHA256(script) ‖ SHA256(range_proof))` for the output at the given index, where `script` is its scriptPubKey.<br><br>Return the SHA256 hash of the following:<ul><li>The serialization of the output's asset and amount fields.</li><li>The serialization of the output's nonce field.</li><li>The SHA256 hash of the output's scriptPubKey.</li><li>The SHA256 hash of the output's range proof.</li></ul>Return `None` if the output does not exist.<br><br><span class="panics">Note</span><br>The result of `output_surjection_proofs_hash` is specifically excluded because surjection proofs are dependent on the inputs as well as the output. |
        | `output_nonces_hash() -> u256` | `SHA256(nonce₀ ‖ … ‖ nonceₙ₋₁)` for the n outputs.<br><br>Return the SHA256 hash of the serialization of each output's nonce field. |
        | `output_range_proofs_hash() -> u256` | `SHA256(SHA256(range_proof₀) ‖ … ‖ SHA256(range_proofₙ₋₁))` for the n outputs.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each output's range proof.<br><br>Note that if the output's amount is explicit then the range proof is considered the empty string. |
        | `output_scripts_hash() -> u256` | `SHA256(SHA256(script₀) ‖ … ‖ SHA256(scriptₙ₋₁))`, where `scriptᵢ` is the scriptPubKey of output i.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each output's scriptPubKey. |
        | `output_surjection_proofs_hash() -> u256` | `SHA256(SHA256(surjection_proof₀) ‖ … ‖ SHA256(surjection_proofₙ₋₁))` for the n outputs.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each output's surjection proof.<br><br>Note that if the output's asset is explicit then the surjection proof is considered the empty string. |
        | `outputs_hash() -> u256` | `SHA256(output_amounts_hash ‖ output_nonces_hash ‖ output_scripts_hash ‖ output_range_proofs_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `output_amounts_hash` (32 bytes).</li><li>The result of `output_nonces_hash` (32 bytes).</li><li>The result of `output_scripts_hash` (32 bytes).</li><li>The result of `output_range_proofs_hash` (32 bytes).</li></ul><br><span class="panics">Note</span><br>The result of `output_surjection_proofs_hash` is specifically excluded because surjection proofs are dependent on the inputs as well as the output. See also `tx_hash`. |
        | `sig_all_hash() -> u256` | `SHA256(g ‖ g ‖ tx_hash ‖ tap_env_hash ‖ current_index)`, where `g` is `genesis_block_hash`.<br><br>Return the standard signature message, which signs the whole transaction. Wallet and developer tools sign this message by default (for example, the `sighash` command of hal-simplicity and the Simplex SDK), and most programs check signatures against it: `jet::bip_0340_verify((pubkey, jet::sig_all_hash()), signature)`.<br><br>It's comparable to Bitcoin's `SIGHASH_ALL`, and commits to the chain, the entire transaction, the current input's Taproot leaf and path, and the index of the current input. Simplicity signatures don't carry a sighash flag: a program that wants a different signature mode, such as the equivalent of `SIGHASH_SINGLE` or `SIGHASH_ANYONECANPAY`, builds its own message from the other jets in this section.<br><br>The hash covers the following:<ul><li>The result of `genesis_block_hash` (32 bytes).</li><li>The result of `genesis_block_hash` again (32 bytes).</li><li>The result of `tx_hash` (32 bytes).</li><li>The result of `tap_env_hash` (32 bytes).</li><li>The result of `current_index` (4 bytes, big endian).</li></ul><br><span class="panics">Note</span><br>The two copies of the `genesis_block_hash` values effectively make this result a [BIP-340](https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki) style tagged hash. |
        | `tap_env_hash() -> u256` | `SHA256(tapleaf_hash ‖ tappath_hash ‖ internal_key)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `tapleaf_hash` (32 bytes).</li><li>The result of `tappath_hash` (32 bytes).</li><li>The result of `internal_key` (32 bytes).</li></ul> |
        | `tapleaf_hash() -> u256` | `SHA256(t ‖ t ‖ tapleaf_version ‖ 0x20 ‖ script_cmr)`, where `t` is `SHA256("TapLeaf/elements")`.<br><br>Return the SHA256 hash of the following:<ul><li>The hash of the ASCII string `TapLeaf/elements` (32 bytes).</li><li>The hash of the ASCII string `TapLeaf/elements` again (32 bytes).</li><li>The result of `tapleaf_version` (1 byte).</li><li>The byte `0x20` (1 byte).</li><li>The result of `script_cmr` (32 bytes).</li></ul><br><span class="panics">Note</span><br>This matches Elements' modified [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki) definition of tapleaf hash. |
        | `tappath_hash() -> u256` | Return a hash of the current input's control block excluding the leaf version and the taproot internal key.<br><br>Using the notation of [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki), it returns the SHA256 hash of `c[33 : 33+32m]`, where `c` is the control block and `m` is the number of entries in the tap path. |
        | `tx_hash() -> u256` | `SHA256(version ‖ lock_time ‖ inputs_hash ‖ outputs_hash ‖ issuances_hash ‖ output_surjection_proofs_hash ‖ input_utxos_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `version` (4 bytes, big endian).</li><li>The result of `lock_time` (4 bytes, big endian).</li><li>The result of `inputs_hash` (32 bytes).</li><li>The result of `outputs_hash` (32 bytes).</li><li>The result of `issuances_hash` (32 bytes).</li><li>The result of `output_surjection_proofs_hash` (32 bytes).</li><li>The result of `input_utxos_hash` (32 bytes).</li></ul><br><span class="panics">Note</span><br>The result of `input_script_sigs_hash` is not covered, neither directly nor through `inputs_hash`. |

=== "Bitcoin"

    ???+ "Click to hide"
        | <div style="width:22em">Jet</div> | Description |
        | ----------------------------------- | ----------- |
        | `annex_hash(Ctx8, Option<u256>) -> Ctx8` | Continue a SHA256 hash with an optional hash by appending the following:<ul><li>If there is no hash, then the byte `0x00`.</li><li>If there is a hash, then the byte `0x01` followed by the given hash (32 bytes).</li></ul> |
        | `build_tapbranch(u256, u256) -> u256` | `SHA256(t ‖ t ‖ min(x, y) ‖ max(x, y))` for the inputs `x` and `y`, where `t` is `SHA256("TapBranch")`.<br><br>Return the SHA256 hash of the following:<ul><li>The hash of the ASCII string `TapBranch` (32 bytes).</li><li>The hash of the ASCII string `TapBranch` again (32 bytes).</li><li>The lexicographically smaller of the two inputs (32 bytes).</li><li>The lexicographically larger of the two inputs (32 bytes).</li></ul>This builds a taproot branch hash from the hashes of its two children. |
        | `build_tapleaf_simplicity(u256) -> u256` | `SHA256(t ‖ t ‖ 0xbe ‖ 0x20 ‖ cmr)` for the input `cmr`, where `t` is `SHA256("TapLeaf")`.<br><br>Return the SHA256 hash of the following:<ul><li>The hash of the ASCII string `TapLeaf` (32 bytes).</li><li>The hash of the ASCII string `TapLeaf` again (32 bytes).</li><li>The Simplicity leaf version `0xbe` (1 byte).</li><li>The byte `0x20` (1 byte).</li><li>The input CMR (32 bytes).</li></ul>This builds a tapleaf hash for a Simplicity program. |
        | `build_taptweak(Pubkey, u256) -> u256` | Implementation of `taproot_tweak_pubkey` from [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).<br><br><span class="panics">Panics</span><ol><li>The input x-only public key is off curve or exceeds the field size.</li><li>The internal hash value `t` exceeds the secp256k1 group order.</li><li>The generated tweaked point is infinity, and thus has no valid x-only public key.</li></ol>Finding inputs that cause situations 2 or 3 is computationally infeasible. |
        | `input_annexes_hash() -> u256` | `SHA256(annex₀ ‖ … ‖ annexₙ₋₁)` for the n inputs, where each `annexᵢ` is as listed below.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>If the input has no annex, or isn't a taproot spend, then the byte `0x00`.</li><li>If the input has an annex, then the byte `0x01` followed by the SHA256 hash of the annex (32 bytes).</li></ul> |
        | `input_hash(u32) -> Option<u256>` | `SHA256(prev_txid ‖ prev_index ‖ sequence ‖ annex)` for the input at the given index, with each part as listed below.<br><br>Return the SHA256 hash of the following:<ul><li>The input's serialized previous transaction ID (32 bytes).</li><li>The input's previous transaction index in big endian format (4 bytes).</li><li>The input's sequence number in big endian format (4 bytes).</li><li>If the input has no annex, or isn't a taproot spend, then the byte `0x00`.</li><li>If the input has an annex, then the byte `0x01` followed by the SHA256 hash of the annex (32 bytes).</li></ul>Return `None` if the input does not exist. |
        | `input_outpoints_hash() -> u256` | `SHA256(prev_txid₀ ‖ prev_index₀ ‖ … ‖ prev_txidₙ₋₁ ‖ prev_indexₙ₋₁)` for the n inputs.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>The input's serialized previous transaction ID (32 bytes).</li><li>The input's previous transaction index in big endian format (4 bytes).</li></ul><br><span class="panics">Important</span><br>The index is serialized in big endian format rather than little endian format. |
        | `input_script_sigs_hash() -> u256` | `SHA256(SHA256(script_sig₀) ‖ … ‖ SHA256(script_sigₙ₋₁))` for the n inputs.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each input's scriptSig.<br><br>Note that if an input's UTXO uses segwit, then its scriptSig will necessarily be the empty string. In such cases, the SHA256 hash of the empty string is still used. |
        | `input_scripts_hash() -> u256` | `SHA256(SHA256(script₀) ‖ … ‖ SHA256(scriptₙ₋₁))`, where `scriptᵢ` is the scriptPubKey of the output that input i spends.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each input UTXO's scriptPubKey. |
        | `input_sequences_hash() -> u256` | `SHA256(sequence₀ ‖ … ‖ sequenceₙ₋₁)` for the n inputs.<br><br>Return the SHA256 hash of the concatenation of the following for every input:<ul><li>The input's sequence number in big endian format (4 bytes).</li></ul><br><span class="panics">Important</span><br>The sequence number is serialized in big endian format rather than little endian format. |
        | `input_utxo_hash(u32) -> Option<u256>` | `SHA256(value ‖ SHA256(script))` for the output that the input at the given index spends, where `script` is its scriptPubKey.<br><br>Return the SHA256 hash of the following:<ul><li>The input UTXO's value in big endian format (8 bytes).</li><li>The SHA256 hash of the input UTXO's scriptPubKey (32 bytes).</li></ul>Return `None` if the input does not exist. |
        | `input_utxos_hash() -> u256` | `SHA256(input_values_hash ‖ input_scripts_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `input_values_hash` (32 bytes).</li><li>The result of `input_scripts_hash` (32 bytes).</li></ul> |
        | `input_values_hash() -> u256` | `SHA256(value₀ ‖ … ‖ valueₙ₋₁)` for the outputs that the n inputs spend.<br><br>Return the SHA256 hash of the concatenation of each input UTXO's value in big endian format (8 bytes each). |
        | `inputs_hash() -> u256` | `SHA256(input_outpoints_hash ‖ input_sequences_hash ‖ input_annexes_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `input_outpoints_hash` (32 bytes).</li><li>The result of `input_sequences_hash` (32 bytes).</li><li>The result of `input_annexes_hash` (32 bytes).</li></ul><br><span class="panics">Note</span><br>The result of `input_script_sigs_hash` is specifically excluded. Commit to it separately if your program needs to cover it. |
        | `outpoint_hash(Ctx8, Outpoint) -> Ctx8` | Continue the SHA256 hash with an outpoint by appending the following:<ul><li>The input's previous transaction ID (32 bytes).</li><li>The input's previous transaction index in big endian format (4 bytes).</li></ul> |
        | `output_hash(u32) -> Option<u256>` | `SHA256(value ‖ SHA256(script))` for the output at the given index, where `script` is its scriptPubKey.<br><br>Return the SHA256 hash of the following:<ul><li>The output's value in big endian format (8 bytes).</li><li>The SHA256 hash of the output's scriptPubKey (32 bytes).</li></ul>Return `None` if the output does not exist. |
        | `output_scripts_hash() -> u256` | `SHA256(SHA256(script₀) ‖ … ‖ SHA256(scriptₙ₋₁))`, where `scriptᵢ` is the scriptPubKey of output i.<br><br>Return the SHA256 hash of the concatenation of the SHA256 hash of each output's scriptPubKey. |
        | `output_values_hash() -> u256` | `SHA256(value₀ ‖ … ‖ valueₙ₋₁)` for the n outputs.<br><br>Return the SHA256 hash of the concatenation of each output's value in big endian format (8 bytes each). |
        | `outputs_hash() -> u256` | `SHA256(output_values_hash ‖ output_scripts_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `output_values_hash` (32 bytes).</li><li>The result of `output_scripts_hash` (32 bytes).</li></ul> |
        | `sig_all_hash() -> u256` | `SHA256(tx_hash ‖ tap_env_hash ‖ current_index)`<br><br>Return the standard signature message, which signs the whole transaction. Most programs check signatures against it: `jet::bip_0340_verify((pubkey, jet::sig_all_hash()), signature)`.<br><br>It's comparable to Bitcoin's `SIGHASH_ALL`, and commits to the entire transaction, the current input's Taproot leaf and path, and the index of the current input. Simplicity signatures don't carry a sighash flag: a program that wants a different signature mode, such as the equivalent of `SIGHASH_SINGLE` or `SIGHASH_ANYONECANPAY`, builds its own message from the other jets in this section.<br><br>The hash covers the following:<ul><li>The result of `tx_hash` (32 bytes).</li><li>The result of `tap_env_hash` (32 bytes).</li><li>The result of `current_index` (4 bytes, big endian).</li></ul> |
        | `tap_env_hash() -> u256` | `SHA256(tapleaf_hash ‖ tappath_hash ‖ internal_key)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `tapleaf_hash` (32 bytes).</li><li>The result of `tappath_hash` (32 bytes).</li><li>The result of `internal_key` (32 bytes).</li></ul> |
        | `tapleaf_hash() -> u256` | `SHA256(t ‖ t ‖ tapleaf_version ‖ 0x20 ‖ script_cmr)`, where `t` is `SHA256("TapLeaf")`.<br><br>Return the SHA256 hash of the following:<ul><li>The hash of the ASCII string `TapLeaf` (32 bytes).</li><li>The hash of the ASCII string `TapLeaf` again (32 bytes).</li><li>The result of `tapleaf_version` (1 byte).</li><li>The byte `0x20` (1 byte).</li><li>The result of `script_cmr` (32 bytes).</li></ul><br><span class="panics">Note</span><br>This matches the [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki) definition of tapleaf hash. |
        | `tappath_hash() -> u256` | Return a hash of the current input's control block excluding the leaf version and the taproot internal key.<br><br>Using the notation of [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki), it returns the SHA256 hash of `c[33 : 33+32m]`, where `c` is the control block and `m` is the number of entries in the tap path. |
        | `tx_hash() -> u256` | `SHA256(version ‖ lock_time ‖ inputs_hash ‖ outputs_hash ‖ input_utxos_hash)`<br><br>Return the SHA256 hash of the following:<ul><li>The result of `version` (4 bytes, big endian).</li><li>The result of `lock_time` (4 bytes, big endian).</li><li>The result of `inputs_hash` (32 bytes).</li><li>The result of `outputs_hash` (32 bytes).</li><li>The result of `input_utxos_hash` (32 bytes).</li></ul><br><span class="panics">Note</span><br>The result of `input_script_sigs_hash` is not covered, neither directly nor through `inputs_hash`. |

### Time locks

These jets let a program require a [timelock](../glossary.md#timelock). `check_lock_height` and `check_lock_time` require an absolute lock time, like `OP_CHECKLOCKTIMEVERIFY`. `check_lock_distance` and `check_lock_duration` require a relative lock time on the current input, like `OP_CHECKSEQUENCEVERIFY`, but they're deprecated on Elements. There, check the current input's sequence number directly: assert that `version` is at least 2, and compare the result of `parse_sequence(current_sequence())` with the minimum.

???+ "Click to hide"
    | <div style="width:22em">Jet</div> | Description |
    | ----------------------------------- | ----------- |
    | `check_lock_distance(Distance) -> ()` | Assert that the current input has a relative lock time of at least the given number of blocks. Consensus rules ([BIP-0068](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)) then keep the transaction out of every block less than that many blocks after the block that confirmed the output being spent. This is the Simplicity counterpart of `OP_CHECKSEQUENCEVERIFY`.<br><br>To satisfy the assertion, the spending transaction must have version 2 or greater, and the current input's sequence number must encode a relative lock time of at least the given number of blocks. The assertion checks the value returned by `tx_lock_distance`.<br><br><span class="panics">Panics</span><br>The assertion fails.<br><br>:warning: **Deprecated on Elements**<br>In Elements, this jet checks the Elements version of `tx_lock_distance`, which is also deprecated. Don't use it in programs for Elements. |
    | `check_lock_duration(Duration) -> ()` | Assert that the current input has a relative lock time of at least the given duration, in units of 512 seconds. Consensus rules ([BIP-0068](https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki)) then keep the transaction out of every block until that much time has passed, by median time past, since the block that confirmed the output being spent. This is the Simplicity counterpart of `OP_CHECKSEQUENCEVERIFY`.<br><br>To satisfy the assertion, the spending transaction must have version 2 or greater, and the current input's sequence number must encode a relative lock time of at least the given duration. The assertion checks the value returned by `tx_lock_duration`.<br><br><span class="panics">Panics</span><br>The assertion fails.<br><br>:warning: **Deprecated on Elements**<br>In Elements, this jet checks the Elements version of `tx_lock_duration`, which is also deprecated. Don't use it in programs for Elements. |
    | `check_lock_height(Height) -> ()` | Assert that the transaction's lock time is a block height of at least the given value. Consensus rules then keep the transaction out of every block at or below that height, so the spend can't confirm until the chain has passed it. This is the Simplicity counterpart of `OP_CHECKLOCKTIMEVERIFY`.<br><br>To satisfy the assertion, the spending transaction must set its lock time to a block height of at least the given value, and at least one of its inputs must have a sequence number below `0xffff_ffff`, so that the lock time is enforced (see `tx_is_final`). The assertion checks the value returned by `tx_lock_height`.<br><br><span class="panics">Panics</span><br>The assertion fails. |
    | `check_lock_time(Time) -> ()` | Assert that the transaction's lock time is a time of at least the given value. Consensus rules then keep the transaction out of every block whose median time past is at or before that time, so the spend can't confirm until then. This is the Simplicity counterpart of `OP_CHECKLOCKTIMEVERIFY`.<br><br>To satisfy the assertion, the spending transaction must set its lock time to a UNIX timestamp of at least the given value, and at least one of its inputs must have a sequence number below `0xffff_ffff`, so that the lock time is enforced (see `tx_is_final`). The assertion checks the value returned by `tx_lock_time`.<br><br><span class="panics">Panics</span><br>The assertion fails. |
    | `tx_is_final() -> bool` | Check if the sequence numbers of all transaction inputs are at their maximum value, `0xffff_ffff`.<br><br>If they are, the transaction is final: consensus rules don't enforce its lock time, and `tx_lock_height` and `tx_lock_time` return zero. |
    | `tx_lock_distance() -> Distance` | If `version` returns 2 or greater and the current input's sequence number encodes a relative block distance, then return that distance. Return zeroes otherwise.<br><br>:warning: **Deprecated on Elements**<br>In Elements, if `version` returns 2 or greater, this jet returns the greatest valid `Distance` value of any transaction input, and zeroes otherwise. Don't use it in programs for Elements. |
    | `tx_lock_duration() -> Duration` | If `version` returns 2 or greater and the current input's sequence number encodes a relative time duration, then return that duration. Return zeroes otherwise.<br><br>:warning: **Deprecated on Elements**<br>In Elements, if `version` returns 2 or greater, this jet returns the greatest valid `Duration` value of any transaction input, and zeroes otherwise. Don't use it in programs for Elements. |
    | `tx_lock_height() -> Height` | If `tx_is_final` returns false, then try to parse the transaction's lock time as a `Height` value. Return zeroes otherwise. |
    | `tx_lock_time() -> Time` | If `tx_is_final` returns false, then try to parse the transaction's lock time as a `Time` value. Return zeroes otherwise. |

### Issuance

On Elements, these jets compute and read issuance data. A new issuance creates an [asset](../glossary.md#asset): its asset ID, and the ID of its reissuance token, are derived from entropy that depends on the issuing input's outpoint and a contract hash. A reissuance creates more of an existing asset, and requires spending its reissuance token. `lbtc_asset` returns the asset ID of Liquid bitcoin.

=== "Elements"

    ???+ "Click to hide"
        | <div style="width:22em">Jet</div> | Description |
        | ----------------------------------- | ----------- |
        | `calculate_asset(u256) -> ExplicitAsset` | Calculate the issued asset id from a given entropy value. |
        | `calculate_confidential_token(u256) -> ExplicitAsset` | Calculate the reissuance token id from a given entropy value for assets with confidential issued amounts. |
        | `calculate_explicit_token(u256) -> ExplicitAsset` | Calculate the reissuance token id from a given entropy value for assets with explicit issued amounts. |
        | `calculate_issuance_entropy(Outpoint, u256) -> u256` | Calculate the entropy value from a given outpoint and contract hash.<br><br>This entropy value is used to compute issued asset and token IDs. |
        | `issuance(u32) -> Option<Option<bool>>` | Return the kind of issuance of the input at the given index:<ul><li>Return `Some(Some(false))` if the input has new issuance.</li><li>Return `Some(Some(true))` if the input has reissuance.</li><li>Return `Some(None)` if the input has no issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `issuance_asset(u32) -> Option<Option<ExplicitAsset>>` | Return the ID of the issued asset of the input at the given index:<ul><li>Return `Some(Some(x))` if the input has issuance with asset id `x`.</li><li>Return `Some(None)` if the input has no issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `issuance_entropy(u32) -> Option<Option<u256>>` | Return the issuance entropy of the input at the given index:<ul><li>Return `Some(Some(x))` if the input has reissuance with entropy `x` or if there is new issuance whose computed entropy is `x`.</li><li>Return `Some(None)` if the input has no issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `issuance_token(u32) -> Option<Option<ExplicitAsset>>` | Return the reissuance token of the input at the given index:<ul><li>Return `Some(Some(x))` if the input has issuance with the reissuance token ID `x`.</li><li>Return `Some(None)` if the input has no issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `lbtc_asset() -> u256` | Return the asset for Liquid bitcoin.<br><br>The result is a constant: the asset ID of Liquid bitcoin (LBTC) on Liquid mainnet, in internal byte order. On Liquid testnet, `lbtc_asset` still returns the LBTC asset ID, even though LBTC doesn't exist there and the network's [policy asset](../glossary.md#policy-asset) is test Liquid bitcoin (tLBTC). The same applies on regtest. To check for the policy asset of the network a contract is deployed on, pass its asset ID in as a [parameter](../glossary.md#parameter). See [Asset checks in SimplicityHL](pitfalls.md#asset-checks-in-simplicityhl). |

=== "Bitcoin"

    Bitcoin is a single-asset blockchain, so issuance does not apply.

### Transaction

These jets read the transaction that is spending the current input. The current input is the input whose Simplicity program is running, and each `current_*` jet returns the same value as the corresponding `input_*` jet at `current_index`. A jet that takes an index returns `None` if there's no input or output at that index.

On Elements, assets, amounts, and nonces can be [confidential](../glossary.md#confidential). In the `Asset1`, `Amount1`, and `Nonce` types, a `Left` value is a confidential commitment and a `Right` value is explicit; see the [builtin type aliases](../simplicityhl-reference/type_alias.md#builtin-aliases).

=== "Elements"

    ???+ "Click to hide"
        | <div style="width:22em">Jet</div> | Description |
        | ----------------------------------- | ----------- |
        | `current_amount() -> (Asset1, Amount1)` | Return the `input_amount` at the `current_index`. |
        | `current_annex_hash() -> Option<u256>` | Return the `input_annex_hash` at the `current_index`. |
        | `current_asset() -> Asset1` | Return the `input_asset` at the `current_index`. |
        | `current_index() -> u32` | Return the index of the current input. |
        | `current_issuance_asset_amount() -> Option<Amount1>` | Return the `issuance_asset_amount` at the `current_index`. |
        | `current_issuance_asset_proof() -> u256` | Return the `issuance_asset_proof` at the `current_index`. |
        | `current_issuance_token_amount() -> Option<TokenAmount1>` | Return the `issuance_token_amount` at the `current_index`. |
        | `current_issuance_token_proof() -> u256` | Return the `issuance_token_proof` at the `current_index`. |
        | `current_new_issuance_contract() -> Option<u256>` | Return the `new_issuance_contract` at the `current_index`. |
        | `current_pegin() -> Option<u256>` | Return the `input_pegin` at the `current_index`. |
        | `current_prev_outpoint() -> Outpoint` | Return the previous outpoint of the current input. |
        | `current_reissuance_blinding() -> Option<ExplicitNonce>` | Return the `reissuance_blinding` at the `current_index`. |
        | `current_reissuance_entropy() -> Option<u256>` | Return the `reissuance_entropy` at the `current_index`. |
        | `current_script_hash() -> u256` | Return the SHA256 hash of the scriptPubKey of the output that the current input spends.<br><br>A Simplicity program is always spent from a Taproot output, and the scriptPubKey of a Taproot output is the bytes `0x51 0x20` followed by the 32-byte output key, so this is `SHA256(0x5120 ‖ output_key)`. |
        | `current_script_sig_hash() -> u256` | Return the SHA256 hash of the scriptSig of the current input.<br><br>SegWit UTXOs enforce scriptSig to be the empty string. In such cases, this jet returns the SHA256 hash of the empty string. |
        | `current_sequence() -> u32` | Return the nSequence of the current input.<br><br>Use this jet to obtain the raw, encoded sequence number. |
        | `genesis_block_hash() -> u256` | Return the block hash of the genesis block of the chain that the transaction is on. The block hash is the double SHA256 hash of the block header.<br><br>The hash is in internal byte order, the reverse of the order that block explorers display. On Liquid, the result is `0x0360208a889692372c8d68b084a62efdf60ea1a359a04c94b20d223658276614`, and on Liquid testnet it is `0xc1b16ae24f2423aea2ea34552292793b5b5e82999a1eed81d56aee528eda71a7`. |
        | `input_amount(u32) -> Option<(Asset1, Amount1)>` | Return the asset id and the asset amount at the given input index.<br><br>Return `None` if the input does not exist. |
        | `input_annex_hash(u32) -> Option<Option<u256>>` | Return the SHA256 hash of the annex at the given input:<ul><li>Return `Some(Some(x))` if the input has an annex that hashes to `x`.</li><li>Return `Some(None)` if the input has no annex.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `input_asset(u32) -> Option<Asset1>` | Return the asset id of the input at the given index.<br><br>Return `None` if the input does not exist. |
        | `input_pegin(u32) -> Option<Option<u256>>` | Return the parent genesis block hash if the input at the given index is a peg-in.<ul><li>Return `Some(None)` if the input is not a peg-in.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `input_prev_outpoint(u32) -> Option<Outpoint>` | Return the previous outpoint of the input at the given index.<br><br>Return `None` if the input does not exist. |
        | `input_script_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptPubKey of the output that the input at the given index spends.<br><br>Return `None` if the input does not exist.<br><br>For a Taproot output, the scriptPubKey is the bytes `0x51 0x20` followed by the 32-byte output key, so this is `SHA256(0x5120 ‖ output_key)`. |
        | `input_script_sig_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptSig of the input at the given index.<br><br>Return `None` if the input does not exist.<br><br>SegWit UTXOs enforce scriptSig to be the empty string. In such cases, this jet returns the SHA256 hash of the empty string. |
        | `input_sequence(u32) -> Option<u32>` | Return the nSequence of the input at the given index.<br><br>Return `None` if the input does not exist. |
        | `internal_key() -> Pubkey` | Return the internal key of the current input.<br><br>Simplicity programs are only spent through Taproot outputs, so the current input always has an internal key. |
        | `issuance_asset_amount(u32) -> Option<Option<Amount1>>` | Return the possibly confidential amount of the issuance if the input at the given index has an issuance.<ul><li>Return `Some(None)` if the input does not have an issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `issuance_asset_proof(u32) -> Option<u256>` | Return the SHA256 hash of the range proof for the amount of the issuance at the given input index.<ul><li>Return the hash of the empty string if the input does not have an issuance.</li><li>Return `None` if the input does not exist.</li></ul>Note that the range proof is also considered the empty string if the issued asset amount is explicit. |
        | `issuance_token_amount(u32) -> Option<Option<TokenAmount1>>` | Return the possibly confidential amount of the reissuance tokens if the input at the given index has an issuance.<ul><li>Return `Some(Some(Right(0)))` if the input is itself a reissuance.</li><li>Return `Some(None)` if the input does not have an issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `issuance_token_proof(u32) -> Option<u256>` | Return the SHA256 hash of the range proof for the amount of the reissuance tokens at the given input index.<ul><li>Return the hash of the empty string if the input does not have an issuance.</li><li>Return `None` if the input does not exist.</li></ul>Note that the range proof is also considered the empty string if the issued token amount is explicit, which is the case for every reissuance. |
        | `lock_time() -> Lock` | Return the lock time of the transaction. |
        | `new_issuance_contract(u32) -> Option<Option<u256>>` | Return the contract hash for the new issuance at the given input index.<ul><li>Return `Some(None)` if the input does not have a new issuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `num_inputs() -> u32` | Return the number of inputs of the transaction. |
        | `num_outputs() -> u32` | Return the number of outputs of the transaction. |
        | `output_amount(u32) -> Option<(Asset1, Amount1)>` | Return the asset id and the asset amount of the output at the given index.<br><br>Return `None` if the output does not exist. |
        | `output_asset(u32) -> Option<Asset1>` | Return the asset id of the output at the given index.<br><br>Return `None` if the output does not exist. |
        | `output_is_fee(u32) -> Option<bool>` | Check if the output at the given index is a fee output.<br><br>Return `None` if the output does not exist. |
        | `output_nonce(u32) -> Option<Option<Nonce>>` | Return the nonce of the output at the given index.<ul><li>Return `Some(None)` if the output does not have a nonce.</li><li>Return `None` if the output does not exist.</li></ul> |
        | `output_null_datum(u32, u32) -> Option<Option<Either<(u2, u256), Either<u1, u4>>>>` | Return the `b`-th entry of a null data (`OP_RETURN`) output at index `a`.<ul><li>Return `Some(Some(Right(Right(x-1))))` if the entry is `OP_x` for `x` from 1 to 16.</li><li>Return `Some(Some(Right(Left(0))))` if the entry is `OP_1NEGATE`.</li><li>Return `Some(Some(Right(Left(1))))` if the entry is `OP_RESERVED`.</li><li>Return `Some(Some(Left((x, hash))))` if the entry is pushed data. `hash` is the SHA256 hash of the data pushed and `x` indicates how the data was pushed:<ul><li>`x == 0` means the push was an immediate 0 to 75 bytes.</li><li>`x == 1` means the push was an `OP_PUSHDATA1`.</li><li>`x == 2` means the push was an `OP_PUSHDATA2`.</li><li>`x == 3` means the push was an `OP_PUSHDATA4`.</li></ul></li><li>Return `Some(None)` if the null data has no `b`-th entry, i.e. if it has at most `b` entries.</li><li>Return `None` if the output does not exist or is not a null data output.</li></ul>Use this jet to read peg-out data from an output. |
        | `output_range_proof(u32) -> Option<u256>` | Return the SHA256 hash of the range proof of the output at the given index.<br><br>Return `None` if the output does not exist.<br><br>Note that if the output's amount is explicit then the range proof is considered the empty string. The SHA256 hash of the empty string is still used in that case. |
        | `output_script_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptPubKey of the output at the given index.<br><br>Return `None` if the output does not exist.<br><br>For a Taproot output, the scriptPubKey is the bytes `0x51 0x20` followed by the 32-byte output key, so this is `SHA256(0x5120 ‖ output_key)`. To require that an output is locked exactly like the current input, for example in a covenant that keeps funds under the same program, compare this hash with `current_script_hash`. |
        | `output_surjection_proof(u32) -> Option<u256>` | Return the SHA256 hash of the surjection proof of the output at the given index.<br><br>Return `None` if the output does not exist.<br><br>Note that if the output's asset is explicit then the surjection proof is considered the empty string. The SHA256 hash of the empty string is still used in that case. |
        | `reissuance_blinding(u32) -> Option<Option<ExplicitNonce>>` | Return the blinding factor used for the reissuance at the given input index.<ul><li>Return `Some(None)` if the input does not have a reissuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `reissuance_entropy(u32) -> Option<Option<u256>>` | Return the entropy used for the reissuance at the given input index.<ul><li>Return `Some(None)` if the input does not have a reissuance.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `script_cmr() -> u256` | Return the CMR of the Simplicity program in the current input.<br><br>This is the CMR of the currently executed Simplicity program. |
        | `tapleaf_version() -> u8` | Return the tap leaf version of the current input.<br><br>Simplicity programs are only spent through Taproot outputs, so the current input always has a tap leaf. |
        | `tappath(u8) -> Option<u256>` | Return the entry of the current input's tap path at the given index.<br><br>The tap path is the Merkle path in the current input's control block, excluding the leaf version and the taproot internal key. Index `i` returns bytes `c[33+32i : 65+32i]` of the control block `c`, using the notation of [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).<br><br>Return `None` if the index is out of bounds. See also `tappath_hash`. |
        | `total_fee(ExplicitAsset) -> ExplicitAmount` | Return the total amount of fees paid to the given asset id.<br><br>Return zero for any asset without fees.<br><br>The fees are tallied modulo 2⁶⁴. Elements consensus rules keep the total within the valid money range, so this can only be observed in an invalid transaction environment. |
        | `transaction_id() -> u256` | Return the transaction ID. |
        | `version() -> u32` | Return the version number of the transaction. |

=== "Bitcoin"

    ???+ "Click to hide"
        | <div style="width:22em">Jet</div> | Description |
        | ----------------------------------- | ----------- |
        | `current_annex_hash() -> Option<u256>` | Return the `input_annex_hash` at the `current_index`. |
        | `current_index() -> u32` | Return the index of the current input. |
        | `current_prev_outpoint() -> Outpoint` | Return the previous outpoint of the current input. |
        | `current_script_hash() -> u256` | Return the SHA256 hash of the scriptPubKey of the output that the current input spends.<br><br>A Simplicity program is always spent from a Taproot output, and the scriptPubKey of a Taproot output is the bytes `0x51 0x20` followed by the 32-byte output key, so this is `SHA256(0x5120 ‖ output_key)`. |
        | `current_script_sig_hash() -> u256` | Return the SHA256 hash of the scriptSig of the current input.<br><br>SegWit UTXOs enforce scriptSig to be the empty string. In such cases, this jet returns the SHA256 hash of the empty string. |
        | `current_sequence() -> u32` | Return the nSequence of the current input.<br><br>Use this jet to obtain the raw, encoded sequence number. |
        | `current_value() -> u64` | Return the `input_value` at the `current_index`. |
        | `fee() -> u64` | Return the fee paid by the transaction, which is the difference between `total_input_value` and `total_output_value`. |
        | `input_annex_hash(u32) -> Option<Option<u256>>` | Return the SHA256 hash of the annex at the given input:<ul><li>Return `Some(Some(x))` if the input has an annex that hashes to `x`.</li><li>Return `Some(None)` if the input has no annex.</li><li>Return `None` if the input does not exist.</li></ul> |
        | `input_prev_outpoint(u32) -> Option<Outpoint>` | Return the previous outpoint of the input at the given index.<br><br>Return `None` if the input does not exist. |
        | `input_script_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptPubKey of the output that the input at the given index spends.<br><br>Return `None` if the input does not exist.<br><br>For a Taproot output, the scriptPubKey is the bytes `0x51 0x20` followed by the 32-byte output key, so this is `SHA256(0x5120 ‖ output_key)`. |
        | `input_script_sig_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptSig of the input at the given index.<br><br>Return `None` if the input does not exist.<br><br>SegWit UTXOs enforce scriptSig to be the empty string. In such cases, this jet returns the SHA256 hash of the empty string. |
        | `input_sequence(u32) -> Option<u32>` | Return the nSequence of the input at the given index.<br><br>Return `None` if the input does not exist. |
        | `input_value(u32) -> Option<u64>` | Return the value of the UTXO at the given input index.<br><br>Return `None` if the input does not exist. |
        | `internal_key() -> Pubkey` | Return the internal key of the current input.<br><br>Simplicity programs are only spent through Taproot outputs, so the current input always has an internal key. |
        | `lock_time() -> Lock` | Return the lock time of the transaction. |
        | `num_inputs() -> u32` | Return the number of inputs of the transaction. |
        | `num_outputs() -> u32` | Return the number of outputs of the transaction. |
        | `output_script_hash(u32) -> Option<u256>` | Return the SHA256 hash of the scriptPubKey of the output at the given index.<br><br>Return `None` if the output does not exist.<br><br>For a Taproot output, the scriptPubKey is the bytes `0x51 0x20` followed by the 32-byte output key, so this is `SHA256(0x5120 ‖ output_key)`. To require that an output is locked exactly like the current input, for example in a covenant that keeps funds under the same program, compare this hash with `current_script_hash`. |
        | `output_value(u32) -> Option<u64>` | Return the value of the output at the given index.<br><br>Return `None` if the output does not exist. |
        | `script_cmr() -> u256` | Return the CMR of the Simplicity program in the current input.<br><br>This is the CMR of the currently executed Simplicity program. |
        | `tapleaf_version() -> u8` | Return the tap leaf version of the current input.<br><br>Simplicity programs are only spent through Taproot outputs, so the current input always has a tap leaf. |
        | `tappath(u8) -> Option<u256>` | Return the entry of the current input's tap path at the given index.<br><br>The tap path is the Merkle path in the current input's control block, excluding the leaf version and the taproot internal key. Index `i` returns bytes `c[33+32i : 65+32i]` of the control block `c`, using the notation of [BIP-0341](https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki).<br><br>Return `None` if the index is out of bounds. See also `tappath_hash`. |
        | `total_input_value() -> u64` | Return the sum of the values of all input UTXOs. |
        | `total_output_value() -> u64` | Return the sum of the values of all outputs. |
        | `transaction_id() -> u256` | Return the transaction ID. |
        | `version() -> u32` | Return the version number of the transaction. |

## Notation

There are three styles of writing jet names that you may encounter in Simplicity-related tooling or source code.

* SimplicityHL writes jets like `jet::eq_32`.
* Disassembly of low-level Simplicity writes them like `jet_eq_32`.
* Rust source code writes them like `Elements::Eq32`.

The reference list above is aimed at SimplicityHL developers, so it presents jet names in SimplicityHL format. Remember to include `jet::` before the name of the jet when calling it from a SimplicityHL program.

## More about jet implementation

The list of jets is fixed when Simplicity is integrated with a specific blockchain, because their details become part of the consensus rules for each Simplicity-enabled blockchain. A complete list of jets must be predefined so different verifiers can agree on what a particular Simplicity program means and what its exact behavior is when it is run. Jet implementations are available in native code to allow miners and other node operators to run these functions more quickly and efficiently.

Calling jets, where available, makes your Simplicity program smaller and faster.

A few jets <a href="https://delvingbitcoin.org/t/delving-simplicity-part-two-side-effects/2091">provide behaviors that could not be achieved directly with low-level Simplicity combinators alone</a>, such as transaction introspection. Jets that can fail (those whose return type is `()`) are the expected and only way for a Simplicity program to disapprove a proposed transaction.
