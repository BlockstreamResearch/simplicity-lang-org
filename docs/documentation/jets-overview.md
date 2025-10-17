Jets are available for common bit widths: **1, 8, 16, 32, 64, 128, 256**. Operations follow the pattern `jet::operation_N` where N is the bit width.

## Arithmetic Jets

### Addition Operations
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`add_N`** - Addition with carry flag
- `(uN, uN) → (bool, uN)`
- `let (carry, sum) = jet::add_32(x, y);`

### Subtraction Operations  
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`subtract_N`** - Subtraction with borrow flag
- `(uN, uN) → (bool, uN)`

### Multiplication Operations
**Available bit widths:** 8, 16, 32, 64, 128

**`multiply_N`** - Multiplication returning double-width result
- `(uN, uN) → u(2N)`

### Division Operations
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`divide_N`** - Division returning quotient and remainder
- `(uN, uN) → (uN, uN)`

### Increment/Decrement Operations
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`increment_N`** / **`decrement_N`** - Add/subtract 1 with overflow flag
- `uN → (bool, uN)`

## Comparison Jets
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`eq_N`**, **`le_N`**, **`lt_N`** - Equality and comparison operations
- `(uN, uN) → bool`

**`max_N`**, **`min_N`** - Return larger/smaller value
- `(uN, uN) → uN`

## Bitwise Integer Operations

### Logical Operations
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`and_N`**, **`or_N`**, **`xor_N`** - Bitwise logical operations
- `(uN, uN) → uN`

**`complement_N`** - Bitwise NOT
- `uN → uN`

### Bit Shifting Operations
**Available bit widths:** 1, 8, 16, 32, 64, 128, 256

**`shift_left_N`**, **`shift_right_N`** - Bit shifting
- `(uN, u8) → uN`

## Type Conversion Jets

**`left_pad_low_A_B`** - Zero-pad smaller type to larger type
- `uA → uB` (e.g., `u16 → u32`)
- Example: `jet::left_pad_low_16_32(x)`

**Common patterns:** `1→8,16,32,64`, `8→16,32,64`, `16→32,64`, `32→64`

**`high_N`**, **`low_N`** - Extract high/low bits from larger integers

## Cryptographic Jets

### Hash Functions

**`sha_256_ctx_8_init`** - Initialize SHA-256 context
- `() → Ctx8`

**`sha_256_ctx_8_add_4`** - Add 4-byte word to SHA-256 context
- `(Ctx8, u32) → Ctx8`

**`sha_256_ctx_8_finalize`** - Finalize SHA-256 hash
- `Ctx8 → u256`

### Digital Signatures

**`bip_0340_check`** - Verify BIP-340 Schnorr signature (returns bool)
- `(Pubkey, u256, Signature) → bool`

**`bip_0340_verify`** - Verify BIP-340 Schnorr signature (panics if invalid)
- `((Pubkey, u256), Signature) → ()`

## Bitcoin-Specific Jets

**`sig_all_hash`** - Compute SIGHASH_ALL signature hash
- `() → u256`

**`check_lock_height`** - Validate height-based timelock
- `u32 → ()`