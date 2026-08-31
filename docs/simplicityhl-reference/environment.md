# Environment

An environment Ξ maps variable names to Simplicity expressions.

All expressions inside an environment share the same source type A. We say the environment is "from type A".

```text
Ξ =
[ foo ↦ unit:      (𝟚^32? × 2^32) → 𝟙
, bar ↦ take iden: (𝟚^32? × 𝟚^32) → 𝟚^32?
, baz ↦ drop iden: (𝟚^32? × 𝟚^32) → 𝟚^32
]
```

We use environments to translate variables inside SimplicityHL expressions to Simplicity.

The environment tells us the Simplicity expression that returns the value of each variable.

We translate a SimplicityHL program "top to bottom". Each time a variable is defined, we update the environment to reflect this change.

During the translation, we can ignore the source type of Simplicity expressions (translated SimplicityHL expressions) entirely. We can focus on producing a Simplicity value of the expected target type. Environments ensure that we get input values for each variable that is in scope.

Target types are handled by contexts.

We obtain context Ctx(Ξ) from environment Ξ by mapping each variable `x` from Ξ to the target type of Ξ(`x`):

Ctx(Ξ)(`x`) = B if Ξ(`x`) = a: A → B

## Patterns


Patterns occur in let statements `let p := s`.

Pattern `p` binds the output of SimplicityHL expression `s` to variables.

As we translate `s` to Simplicity, we need an environment that maps the variables from `p` to Simplicity expressions.

If `p` is just a variable `p = a`, then the environment is simply [`a` ↦ iden: A → A].

If `p` is a product of two variables `p = (a, b)`, then the environment is [`a` ↦ take iden: A × B → A, `b` ↦ drop iden: A × B → B].

"take" and "drop" are added as we go deeper in the product hierarchy. The pattern `_` is ignored.

PEnv'(t: A → B, `v`) := [`v` ↦ t]

PEnv'(t: A → B, `_`) := []

If `p1` and `p2` contain disjoint sets of variables

Then PEnv'(t: A → B × C, `(p1, p2)`) := PEnv'(take t: A → B, p1) ⊎ PEnv'(drop t: A → C, p2)

PEnv(A, `p`) := PEnv'(iden: A → A, `p`)

Pattern environments are compatible with pattern contexts:

Ctx(PEnv(A, `p`)) = PCtx(A, `p`)

## Product

We write Product(ΞA, ΞB) to denote the **product** of environment ΞA from A and environment ΞB from B.

The product is an environment from type A × B.

When two Simplicity expressions with environments are joined using the "pair" combinator, then the product of both environments gives us updated bindings for all variables.

If the same variable is bound in both environments, then the binding from the first environment is taken.

If ΞA maps `v` to Simplicity expression a: A → C

Then Product(ΞA, ΞB) maps `v` to take a: A × B → C

If ΞB maps `v` to Simplicity expression b: B → C

If ΞA doesn't map `v`

Then Product(ΞA, ΞB) maps `v` to drop b: A × B → C

Environment products are compatible with context updates:

Ctx(Product(ΞA, ΞB)) = Ctx(ΞB) // Ctx(ΞA)

The order of B and A is reversed: The context of ΞB is updated with the dominant context of ΞA.
