# Let Statement

Variables are defined in let statements, [just like in Rust](https://doc.rust-lang.org/std/keyword.let.html).

```simplicityhl
let x: u32 = 1;
```

The above let statement defines a variable called `x`.
The variable is of type `u32` and it is assigned the value `1`.

```simplicityhl
let x: u32 = f(1337);
```

A variable can be assigned the value of any expression, such as a function call.

## Explicit typing

In [SimplicityHL](../glossary.md#simplicityhl), the type of a defined variable **always** has to be written.
This is different from Rust, which can infer the type of a variable.

## Immutability

SimplicityHL variables are **always** immutable.

## Redefinition and scoping

A variable name can be defined again in the same scope.
The later definition shadows the earlier definition.

```simplicityhl
let x: u32 = 1;
let x: u32 = 2;
assert!(jet::eq_32(x, 2)); // x == 2
```

Normal scoping rules apply:
Variables from outer scopes are available inside inner scopes.
A variable defined in an inner scope shadows a variable of the same name from an outer scope.

```simplicityhl
let x: u32 = 1;
let y: u32 = 2;
let z: u32 = {
    let x: u32 = 3;
    assert!(jet::eq_32(y, 2)); // y == 2
    x
};
assert!(jet::eq_32(z, 3)); // z == 3
```

## Pattern matching

There is limited pattern matching support inside let statements.

```simplicityhl
let (x, y, _): (u8, u16, u32) = (1, 2, 3);
let [x, _, z]: [u32; 3] = [1, 2, 3];
```

In the first line, the tuple `(1, 2, 3)` is deconstructed into the values `1`, `2` and `3`.
The values `1` and `2` are assigned to the variables `x` and `y`.
The pattern `_` discards the value `3`.
In the end, two variables are created: `x: u8 = 1` and `y: u16 = 2`.

Similarly, an array can be deconstructed element by element. Each element is assigned to a variable or discarded with `_`.
