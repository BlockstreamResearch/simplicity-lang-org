# Programs

Every [SimplicityHL](../glossary.md#simplicityhl) program has a `main` [function](./function.md#main-function).

A program may also have [type aliases](./type_alias.md) or custom [function definitions](./function.md).
The `main` function comes last in the program, because everything it calls must be [defined before it](./function.md#order-matters).

```simplicityhl
type Furlong = u32;
type Mile = u32;

fn to_miles(distance: Either<Furlong, Mile>) -> Mile {
    match distance {
        Left(furlongs: Furlong) => jet::divide_32(furlongs, 8),
        Right(miles: Mile) => miles,
    }
}

fn main() {
    let eight_furlongs: Either<Furlong, Mile> = Left(8);
    let one_mile: Either<Furlong, Mile> = Right(1);
    assert!(jet::eq_32(1, to_miles(eight_furlongs)));
    assert!(jet::eq_32(1, to_miles(one_mile)));
}
```
