# Operators

Since version *nnnn*, SimplicityHL supports some common *operators* in expressions. Their notations and meanings are similar to languages like Rust and C.

## Logic operators

The Boolean logic operators (operating on `bool`s and returning a `bool`) are:

| Operator | Description |
| -------- | ----------- |
| `&&` | Boolean AND (infix) |
| `||` | Boolean OR (infix) |
| `!` | Boolean NOT (unary) |

For example, `true || false` evaluates to `true`.

The bitwise logic operators (operating on the bits within an integer type) are:

| Operator | Description |
| -------- | ----------- |
| `&` | Bitwise AND (infix) |
| `|` | Bitwise OR (infix) |
| `^` | Bitwise XOR (infix) |
| `~` | Bitwise NOT (unary) |

For example, `0xb1 | 0x04` evaluates to `0xb5`.

Both sides of the bitwise operator must be interpretable as *the same* integer type.

## Comparison operators

The comparison operators (infix) can be used to compare integer types. They return `bool`.

| Operator | Description |
| -------- | ----------- |
| `<` | Integer less than |
| `<=` | Integer less than or equal to |
| `>` | Integer greater than |
| `>=` | Integer greater than or equal to |
| `==` | Integer equality |
| `!=` | Integer inequality |

For example, `3 <= 20` evaluates to `true`.

Both sides of the comparison operator must be interpretable as *the same* integer type.

## Not yet implemented

These operators have not yet been implemented because of difficulties related to safely handling arithmetic overflow or underflow. In each case, [jets](../../documentation/jets) are available as an alternative.

| Operator | Description | Alternative |
| -------- | ----------- | ----------- |
| `+` | Integer addition | `jet::add_`*nn* |
| `-` | Integer subtraction | `jet::subtract_`*nn* |
| `-` | Unary integer negation | Currently there is no negative number type. |
| `*` | Integer multiplication | `jet::multiply_`*nn* |
| `/` | Integer division | `jet::divide_`*nn* or `jet::div_mod_`*nn* |
| `%` | Integer modulo | `jet::modulo_`*nn* or `jet::div_mod_`*nn* |
| `<<` | Left shift | Numerous jets are available with variant behaviors.<br>Search `left_shift` and `left_rotate` in the jets list. |
| `>>` | Right shift | Numerous jets are available with variant behaviors.<br>Search `right_shift` and `right_rotate` in the jets list. |
