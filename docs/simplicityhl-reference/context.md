# Context

A context Γ maps variable names to [Simplicity](../glossary.md#simplicity) types:

Γ = [ `foo` ↦ 𝟙, `bar` ↦ 𝟚^32?, `baz` ↦ 𝟚^32 × 𝟙 ]

Γ(`v`) = A denotes that variable `v` has type A in context Γ.

Contexts handle free variables inside [SimplicityHL](../glossary.md#simplicityhl) expressions.

If all free variables are defined in a context, then the context assigns a type to the expression.

Γ ⊩ `a`: A denotes that expression `a` has type A in context Γ.

Contexts handle only the **target type** of an expression.

Source types are handled by [environments](environment.md) and the [translation](translation.md) of SimplicityHL to Simplicity.

Γ ⊎ Δ denotes the **disjoint union** of Γ and Δ.

Γ // Δ denotes the **update** of Γ with Δ. The update contains mappings from both contexts. If a variable is present in both, then the mapping from Δ is taken.

## Unit literal

Γ ⊩ `()`: 𝟙

## Product constructor

If Γ ⊩ `b`: B

If Γ ⊩ `c`: C

Then Γ ⊩ `(b, c)`: B × C

## Left constructor

If Γ ⊩ `b`: B

Then Γ ⊩ `Left(b)`: B + C

For any C

## Right constructor

If Γ ⊩ `c`: C

Then Γ ⊩ `Right(c)`: B + C

For any B

## Bit string literal

If `s` is a bit string of 2^n bits

Then Γ ⊩ `0bs`: 𝟚^(2^n)

## Byte string literal

If `s` is a hex string of 2^n digits

Then Γ ⊩ `0xs`: 𝟚^(4 * 2^n)

## Variable

If Γ(`v`) = B

Then Γ ⊩ `v`: B

## Witness value

Γ ⊩ `witness(name)`: B

For any B

## Jet

If `j` is the name of a [jet](../glossary.md#jet) of type B → C

If Γ ⊩ `b`: B

Then Γ ⊩ `jet::j b`: C

## Chaining

If Γ ⊩ `b`: 𝟙

If Γ ⊩ `c`: C

Then Γ ⊩ `b; c`: C

## Patterns

Type A and pattern `p` create a context denoted by PCtx(A, `p`)

PCtx(A, `v`) := [`v` ↦ A]

PCtx(A, `_`) := []

If `p1` and `p2` map disjoint sets of variables

Then PCtx(A × B, `(p1, p2)`) := PCtx(A, `p1`) ⊎ PCtx(B, `p2`)

## Let statement

If Γ ⊩ `b`: B

If Γ // PCtx(B, `p`) ⊩ `c`: C

Then Γ ⊩ `let p: B = b; c`: C

With alternative syntax

Then Γ ⊩ `let p = b; c`: C

## Match statement

If Γ ⊩ `a`: B + C

If Γ // [`x` ↦ B] ⊩ `b`: D

If Γ // [`y` ↦ C] ⊩ `c`: D

Then Γ ⊩ `match a { Left(x) => b, Right(y) => c, }`: D

This rule doesn't require `x` to be used inside `b`, or `y` inside `c`.

## Left unwrap

If Γ ⊩ `b`: B + C

Then Γ ⊩ `b.unwrap_left()`: B

## Right unwrap

If Γ ⊩ `c`: B + C

Then Γ ⊩ `c.unwrap_right()`: C
