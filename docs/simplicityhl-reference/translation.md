# Translation

⟦`e`⟧Ξ denotes the translation of [SimplicityHL](../glossary.md#simplicityhl) expression `e` using [environment](environment.md) Ξ from type A.

The translation produces a [Simplicity](../glossary.md#simplicity) expression with source type A.

The target type depends on the SimplicityHL expression `e`.

Ctx, PEnv and Product are defined on the [Environment](environment.md) page. The typing judgment ⊩ is defined on the [Context](context.md) page.

## Unit literal

⟦`()`⟧Ξ = unit: A → 𝟙

## Product constructor

If Ctx(Ξ) ⊩ `b`: B

If Ctx(Ξ) ⊩ `c`: C

Then ⟦`(b, c)`⟧Ξ = pair ⟦`b`⟧Ξ ⟦`c`⟧Ξ: A → B × C

## Left constructor

If Ctx(Ξ) ⊩ `b`: B

Then ⟦`Left(b)`⟧Ξ = injl ⟦`b`⟧Ξ: A → B + C

For any C

## Right constructor

If Ctx(Ξ) ⊩ `c`: C

Then ⟦`Right(c)`⟧Ξ = injr ⟦`c`⟧Ξ: A → B + C

For any B

## Bit string literal

If `s` is a bit string of 2^n bits

Then ⟦`0bs`⟧Ξ = comp unit const 0bs: A → 𝟚^(2^n)

## Byte string literal

If `s` is a hex string of 2^n digits

Then ⟦`0xs`⟧Ξ = comp unit const 0xs: A → 𝟚^(4 * 2^n)

## Variable

If Ctx(Ξ)(`v`) = B

Then ⟦`v`⟧Ξ = Ξ(`v`): A → B

## Witness value

If Ctx(Ξ) ⊩ `witness(name)`: B

Then ⟦`witness(name)`⟧Ξ = witness: A → B

## Jet

If `j` is the name of a [jet](../glossary.md#jet) of type B → C

If Ctx(Ξ) ⊩ `b`: B

Then ⟦`jet::j b`⟧Ξ = comp ⟦`b`⟧Ξ j: A → C

## Chaining

If Ctx(Ξ) ⊩ `b`: 𝟙

If Ctx(Ξ) ⊩ `c`: C

Then ⟦`b; c`⟧Ξ = comp (pair ⟦`b`⟧Ξ ⟦`c`⟧Ξ) (drop iden): A → C

## Let statement

If Ctx(Ξ) ⊩ `b`: B

If Product(PEnv(B, `p`), Ξ) ⊩ `c`: C

Then ⟦`let p: B = b; c`⟧Ξ = comp (pair ⟦`b`⟧Ξ iden) ⟦`c`⟧Product(PEnv(B, `p`), Ξ): A → C

## Match statement

If Ctx(Ξ) ⊩ `a`: B + C

If Product(PEnv(B, `x`), Ξ) ⊩ `b`: D

If Product(PEnv(C, `y`), Ξ) ⊩ `c`: D

Then ⟦`match a { Left(x) => b, Right(y) => c, }`⟧Ξ = comp (pair ⟦`a`⟧Ξ iden) (case ⟦`b`⟧Product(PEnv(B, `x`), Ξ) ⟦`c`⟧Product(PEnv(C, `y`), Ξ)): A → D

## Left unwrap

If Ctx(Ξ) ⊩ `b`: B + C

Then ⟦`b.unwrap_left()`⟧Ξ = comp (pair ⟦`b`⟧Ξ unit) (assertl iden #{fail 0}): A → B

## Right unwrap

If Ctx(Ξ) ⊩ `c`: B + C

Then ⟦`c.unwrap_right()`⟧Ξ = comp (pair ⟦`c`⟧Ξ unit) (assertr #{fail 0} iden): A → C
