# Type Aliases

SimplicityHL currently doesn't support Rust-like `struct`s for organizing data.

```simplicityhl
struct User {
  active: bool,
  id: u256,
  sign_in_count: u64,
}
```

Instead, SimplicityHL programs group data in tuples, whose fields aren't labeled. Long tuples are hard to read.

```simplicityhl
(bool, u256, u64)
```

A type alias gives a new name to an existing type, which makes code that uses long tuples easier to read.
Unlike a `struct`, an alias doesn't define a new type.

```simplicityhl
type User = (bool, u256, u64);
```

## Builtin aliases

SimplicityHL also has builtin type aliases, which programs can use without defining them.

| Builtin Alias    | Definition                    |
|------------------|-------------------------------|
| `Amount1`        | `Either<(u1, u256), u64>`     |
| `Asset1`         | `Either<(u1, u256), u256>`    |
| `Confidential1`  | `(u1, u256)`                  |
| `Ctx8`           | `(List<u8, 64>, (u64, u256))` |
| `Distance`       | `u16`                         |
| `Duration`       | `u16`                         |
| `ExplicitAmount` | `u64`                         |
| `ExplicitAsset`  | `u256`                        |
| `ExplicitNonce`  | `u256`                        |
| `Fe`             | `u256`                        |
| `Ge`             | `(u256, u256)`                |
| `Gej`            | `((u256, u256), u256)`        |
| `Height`         | `u32`                         |
| `Lock`           | `u32`                         |
| `Message`        | `u256`                        |
| `Message64`      | `[u8; 64]`                    |
| `Nonce`          | `Either<(u1, u256), u256>`    |
| `Outpoint`       | `(u256, u32)`                 |
| `Point`          | `(u1, u256)`                  |
| `Pubkey`         | `u256`                        |
| `Scalar`         | `u256`                        |
| `Signature`      | `[u8; 64]`                    |
| `Time`           | `u32`                         |
| `TokenAmount1`   | `Either<(u1, u256), u64>`     |
