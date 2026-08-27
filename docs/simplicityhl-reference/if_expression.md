# If Expression

The `if` expression conditionally executes code branches based on a boolean value (`true` or `false`), returning the value of the branch that was executed.

The syntax is

```rust
if condition { block_a } else { block_b }
```

where `condition` is an expression of type `bool` and `block_a` and `block_b` are sequences of SimplicityHL code returning the same type.

As in other SimplicityHL code blocks, and similarly to Rust, the value of the final expression within the code block is returned. For example, in

```rust
if x { a; b; c } else { d; e; f }
```

the value of the overall expression is `c` when `x` is `true`, and `f` when `x` is `false`. The lack of semicolons after `c` and `f` here indicates that these values are the values returned by each block. <!-- Otherwise you get a unit type which is only appropriate in practice if the if is conditionally doing a pair of assert!() assertions or calling jets that return unit. This is commented out because it may be challenging to explain concisely. -->

## Examples

```rust
fn min_32(a: u32, b: u32) {
    // Return the smaller of the two arguments.
    //
    // This function already exists as a jet. This is just an example to
    // show how it could implemented using the if statement.
    if jet::lt32(a, b) { a } else { b }
}
```

```
fn limit_by_time() -> u64 {
    // Relative timelocks: not to determine whether a transaction is
    // categorically forbidden, but rather to apply different rate
    // limits depending on how soon it occurs.

    // Logic to determine relative timelock
    assert!(jet::le_32(2, jet::version()));
    // Fetch and parse sequence for current transaction
    let parsed_seq: Option<Either<Distance, Duration>> = jet::parse_sequence(jet::current_sequence());
    let relative_duration: Duration = match parsed_seq {
        // Failure condition
        None => assert!(false),
        // This is either a distance or a duration, but only a duration is
        // acceptable here.
        Some(actual_data: Either<Distance, Duration>) => match actual_data {
            // A distance is not acceptable in this context.
            Left(actual_distance: Distance) => assert!(false),
            // The actual duration value
            Right(actual_duration: Duration) => actual_duration,
        },
    };

    if jet::lt_16(relative_duration, 5000) {
        1000
    } else {
        100000
    }
}
```

```rust
fn and(a: bool, b: bool): bool {
    if a { b } else { false }
}
```

## Notes

The `if` expression is specific to boolean values, like those returned by comparison jets. More general matching logic is provided by the `match` expression.

Because the `if` expression always returns a value, the `else` clause is mandatory, unlike some programming languages. For the same reason, both arms of the `if` must be of the same type. For example, it is valid to write

```rust
fn next_collatz_step(n: u64) -> u64 {
    if jet::divides_64(n, 2) {
        jet::divide_64(n, 2)
    } else {
        let (q, r): (u64, u64) = jet::divmod_64(jet::multiply_64(3, n), 1);
        let (carry, result): (bool, u64) = jet::increment_64(q);
        assert!(not(carry));
        result
    }
}
```
