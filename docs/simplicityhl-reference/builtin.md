# Built-in functions

[SimplicityHL](../glossary.md#simplicityhl) offers several built-in functions and macros. These are additional to the hundreds of [jets](../../documentation/jets) provided by the Simplicity Elements integration.

| <div style="width:8em">Function</div> | Description |
|-------------|-----------------------------------|
| `array_fold()` | Repeatedly apply a function to each element of an array, starting with an initial accumulator value. |
| `assert!()` | Require that a boolean value is `true`. Panic otherwise. |
| `dbg!()` | Do-nothing function used as a debugger marker. |
| `fold()` | Repeatedly apply a function to each element of a list, starting with an initial accumulator value. |
| `for_while()` | Perform a bounded loop by repeatedly calling a function with an incrementing counter variable. Permits an explicit early exit from the loop.<br><br>**Note: can be computationally expensive.** |
| `<T>::into()` | Perform native type conversions. See [type casting](../type_casting) for more details. |
| `is_none<T>()` | Check whether an `Option<T>` value is `None`, returning `true` or `false`. |
| `panic!` | Immediately abort the current program, rejecting the currently proposed transaction. |
| `unwrap` | Require that a value of type `Option<T>` is `Some`, extracting the underlying element of type `T`. Panics if the given value is `None` instead. |
| `unwrap_left` | Require that a value of type `Either<T, U>` is `Left`, extracting the underlying element of type `T`. Panics if the given value is `Right` instead. |
| `unwrap_right` | Require that a value of type `Either<T, U>` is `Right`, extracting the underlying element of type `U`. Panics if the given value is `Left` instead. |

## Examples

### `array_fold`

```rust
fn sum(elt: u32, acc: u32) -> u32 {  
    let (_, acc): (bool, u32) = jet::add_32(elt, acc);  
    acc  
}  
  
fn main() {  
    let arr: [u32; 7] = [1, 2, 3, 4, 5, 6, 7];  
    let sum: u32 = array_fold::<sum, 7>(arr, 0);  
    assert!(jet::eq_32(sum, 28));  
}
```

### `assert!`

```rust
fn main(){
   let (_, total): (bool, u32) = jet::add_32(1, 1);
   assert!(jet::eq_32(total, 2));
}
```

### `fold`

```rust
fn sum(elt: u32, acc: u32) -> u32 {  
    let (_, acc): (bool, u32) = jet::add_32(elt, acc);  
    acc  
}  
  
fn main() {  
    let xs: List<u32, 8> = list![1, 2, 3];  
    let s: u32 = fold::<sum, 8>(xs, 0);  
    assert!(jet::eq_32(s, 6));  
}
```

### `for_while`

Detailed example of calculating a hash over an entire array (from `SimplicityHL/examples/hash_loop.simf`).

??? "Click to show"
    ```rust
    // Add counter to streaming hash and finalize when the loop exists
    fn hash_counter_8(ctx: Ctx8, unused: (), byte: u8) -> Either<u256, Ctx8> {
        let new_ctx: Ctx8 = jet::sha_256_ctx_8_add_1(ctx, byte);
        match jet::all_8(byte) {
            true => Left(jet::sha_256_ctx_8_finalize(new_ctx)),
            false => Right(new_ctx),
        }
    }
    
    // Add counter to streaming hash and finalize when the loop exists
    fn hash_counter_16(ctx: Ctx8, unused: (), bytes: u16) -> Either<u256, Ctx8> {
        let new_ctx: Ctx8 = jet::sha_256_ctx_8_add_2(ctx, bytes);
        match jet::all_16(bytes) {
            true => Left(jet::sha_256_ctx_8_finalize(new_ctx)),
            false => Right(new_ctx),
        }
    }
    
    fn main() {
        // Hash bytes 0x00 to 0xff
        let ctx: Ctx8 = jet::sha_256_ctx_8_init();
        let out: Either<u256, Ctx8> = for_while::<hash_counter_8>(ctx, ());
        let expected: u256 = 0x40aff2e9d2d8922e47afd4648e6967497158785fbd1da870e7110266bf944880;
        assert!(jet::eq_256(expected, unwrap_left::<Ctx8>(out)));
    
        // Hash bytes 0x0000 to 0xffff
        // This takes ~10 seconds on my computer
        // let ctx: Ctx8 = jet::sha_256_ctx_8_init();
        // let out: Either<u256, Ctx8> = for_while::<hash_counter_16>(ctx, ());
        // let expected: u256 = 0x281f79f89f0121c31db2bea5d7151db246349b25f5901c114505c18bfaa50ba1;
        // assert!(jet::eq_256(expected, unwrap_left::<Ctx8>(out)));
    }
    ```

### `into`

```rust
fn not(bit: bool) -> bool {
    <u1>::into(jet::complement_1(<bool>::into(bit)))
}
```

See [type casting](../type_casting) for more details.

### `is_none`

Many uses of `is_none` are more simply handled with `unwrap()` or `match`, but it is available where desired.

```rust
let existing_key: Pubkey = get_existing_pubkey();
if is_none::<Pubkey>(witness::NEW_PUBKEY) {
    require_pubkey(existing_key)
} else {
    require_pubkey(unwrap(witness::NEW_PUBKEY))
};
```

This is equivalent to the `match` version

```rust
let existing_key: Pubkey = get_existing_pubkey();
match witness::NEW_PUBKEY {
    None => require_pubkey(existing_key),
    Some(new_key: Pubkey) => require_pubkey(new_key),
}
```

### `panic!`

```rust
// This requires that the specified witness include a Left(Signature)
// rather than a Right(Signature).
fn main(){
    match witness::LEFT_OR_RIGHT {
        Left(s: Signature) => validate_signature(s),
        Right(_: Signature) => panic!(),
    }
}
```

### `unwrap`, `unwrap_left`, `unwrap_right`

A simple example of `unwrap()` appears in [`last_will.simf`](https://github.com/BlockstreamResearch/SimplicityHL/blob/master/examples/last_will.simf).

```rust
assert!(unwrap(jet::output_is_fee(1)));
```

`jet::output_is_fee()` returns `Option<bool>` to handle the case where the specified output does not exist. That is, the jet returns `None` if the specified output doesn't exist, `Some(true)` if the specified output is a fee output, and `Some(false)` if the specified output is a non-fee output.

The code above requires that the return value is `Some(true)`. `unwrap()` panics if the return value is `None`, while `assert!()` panics if the unwrapped value returned by `unwrap()` is `false`.

More examples of `unwrap()`, as well as `unwrap_left()` and `unwrap_right()`, can be found in the [options contract](https://github.com/BlockstreamResearch/simplicity-contracts/blob/main/crates/contracts/src/finance/options/source_simf/options.simf).
