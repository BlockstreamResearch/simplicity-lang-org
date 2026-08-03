---
title: Your first program
description: Run your first SimplicityHL program in the browser and learn what assert! actually does.
---

# Your first program

Every SimplicityHL program is a **predicate**. It does not return a value or print anything —
it either succeeds or it fails. A transaction spending a SimplicityHL-locked output is valid
exactly when the program succeeds.

That makes `assert!` the heart of the language. Here is a complete program:

```simplicityhl,run title="A program that succeeds"
fn main() {
    assert!(jet::eq_32(2, 2));
}
```

Press **Run**. The compiler is downloaded once, on your first run, then compiles this to
Simplicity bytecode and executes it on the Simplicity bit machine — all inside your browser.
Nothing is sent to a server.

You should see that the program succeeded, along with its **CMR** (Commitment Merkle Root) —
the hash that commits to this program's structure. The CMR is what an address encodes.

## Making it fail

Now change `jet::eq_32(2, 2)` to `jet::eq_32(2, 3)` and Run again.

The program compiles perfectly well — it is valid, well-typed code — but the assertion does not
hold, so execution fails. This is the distinction to internalise early:

- A **compile error** means your program is not valid SimplicityHL.
- A **failed assertion** means your program is valid but the spending condition was not met.

On-chain, the second case is a rejected transaction.

## Jets

`jet::eq_32` is a **jet**: a primitive the Simplicity interpreter implements natively rather
than building up from combinators. `eq_32` compares two 32-bit numbers and returns a `bool`.

Jets are how SimplicityHL stays fast. Because Simplicity has no loops and no recursion, an
operation like SHA-256 would be ruinously large if assembled from raw combinators — so common
operations are recognised and executed directly. There is more on this in
[Jets Explained](../documentation/jets-explained.md), and the full list lives in the
[jets overview](../documentation/jets-overview.md).

Try swapping in a different jet. `jet::add_32` returns a pair — a carry bit and the sum — so it
needs destructuring:

```simplicityhl,run title="Addition returns a carry and a sum"
fn main() {
    let (_, sum): (bool, u32) = jet::add_32(20, 22);
    assert!(jet::eq_32(sum, 42));
}
```

The `_` discards the carry bit, which is `true` only when the addition overflows 32 bits.
Nothing is hidden from you here: because Simplicity is a low-level target, arithmetic tells you
about overflow instead of silently wrapping or trapping. If you care about overflow, you bind
that bit and assert on it.

## Seeing values with `dbg!`

Assertions tell you *whether* something held, not *what* the values were. `dbg!` wraps any
expression, returns it unchanged, and reports the value it saw:

```simplicityhl,run title="Inspecting an intermediate value"
fn main() {
    let (_, sum): (bool, u32) = jet::add_32(20, 22);
    let checked: u32 = dbg!(sum);
    assert!(jet::eq_32(checked, 42));
}
```

Run this and the output pane shows the value flowing through `dbg!`. Since `dbg!` returns its
argument, you can drop it around any subexpression without restructuring your code.

!!! note

    `dbg!` is a compile-time debugging aid. It has no effect on the CMR and costs nothing
    on-chain, because the debug symbols it relies on are not part of the committed program.

## Try it yourself

The program below does not compile. Run it to see the error, then fix it.

```simplicityhl,run,expect=compile-error title="Fix the type error"
fn main() {
    let x: u32 = true;
    assert!(jet::eq_32(x, 1));
}
```

??? success "Solution"

    `true` is a `bool`, not a `u32`. The comparison wants a 32-bit number, so declare one:

    ```simplicityhl,run title="Solution"
    fn main() {
        let x: u32 = 1;
        assert!(jet::eq_32(x, 1));
    }
    ```

## Next

[Reading data from an input](reading-transaction-data.md) moves off the placeholder
environment and runs these programs against a real Liquid testnet transaction.
