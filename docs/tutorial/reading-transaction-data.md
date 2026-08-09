---
title: Reading data from an input
description: Use transaction introspection jets to read amounts, assets, and outpoints from a real Liquid testnet transaction.
---

# Reading data from an input

Everything on the [previous page](your-first-program.md) ran against a **placeholder
transaction**. That was fine while programs only did arithmetic, but a real spending condition
needs to ask questions about the transaction spending it — how much is this input worth? which
asset? what is it spending?

Those questions are answered by **introspection jets**, and this page runs them against a
real transaction from Liquid testnet, fetched into your browser from the block explorer.

The snippets below have a transaction id and an input selector. Change either and re-run;
the program sees exactly what it would see on-chain.

## Which input am I?

A SimplicityHL program does not run once per transaction — it runs once **per input**, for
the input whose spending condition it guards. So the very first thing worth knowing is
where you are:

```simplicityhl,run,tx txid="0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2" title="Where am I in this transaction?"
fn main() {
    let index: u32 = dbg!(jet::current_index());
    let inputs: u32 = dbg!(jet::num_inputs());
    assert!(jet::lt_32(index, inputs));
}
```

Run it, then change the **Input** selector from 0 to 1 and run again. `current_index`
follows your selection, because you are asking a different question each time: *what would
this program see if it guarded that input?*

The example transaction has two inputs, so the assertion that `index < num_inputs` holds
either way.

## Reading the amount

Here is where Liquid differs from Bitcoin. An amount is not simply a number, because
Liquid amounts can be **confidential** — hidden behind a cryptographic commitment. So
`jet::current_amount()` returns a pair of `Either` values:

```text
(Either<(u1, u256), u256>,   Either<(u1, u256), u64>)
 └── asset ──────────────┘   └── amount ───────────┘
     Left  = confidential        Left  = confidential
     Right = explicit            Right = explicit
```

`Left` carries a commitment you cannot read. `Right` carries the value in the clear. You
have to handle both, and the type system makes sure you do:

```simplicityhl,run,tx txid="0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2" title="What is this input worth?"
fn main() {
    let (_, amount): (Either<(u1, u256), u256>, Either<(u1, u256), u64>) = jet::current_amount();

    let value: u64 = match amount {
        // A blinded amount: all we have is a commitment, so there is no number to read.
        Left(_: (u1, u256)) => 0,
        Right(explicit: u64) => explicit,
    };

    let value: u64 = dbg!(value);
    assert!(jet::le_64(0, value));
}
```

Both inputs of the example transaction are unblinded, so you will see a real number.
Switch between input 0 and input 1 — they hold different amounts of **different assets**.

!!! note

    This is why a contract that checks amounts only works on unblinded outputs, or must be
    written to accept a commitment and verify a range proof instead. The `Either` is not
    ceremony; it is the confidentiality of the chain showing up in the type system.

## Reading other inputs

`current_*` jets describe the input you are guarding. To look at *any* input, use the
`input_*` family, which takes an index. Since the index might be out of range, they return
an `Option`:

```simplicityhl,run,tx txid="0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2" title="Looking at input 1 from anywhere"
fn main() {
    // `unwrap` fails the program if input 1 does not exist.
    let (_, amount): (Either<(u1, u256), u256>, Either<(u1, u256), u64>) =
        unwrap(jet::input_amount(1));

    let value: u64 = match amount {
        Left(_: (u1, u256)) => 0,
        Right(explicit: u64) => explicit,
    };

    let value: u64 = dbg!(value);
    assert!(jet::le_64(0, value));
}
```

This reports input 1's amount no matter which input you select, because it names the input
explicitly rather than asking about the current one.

That distinction is the basis of most interesting contracts: a program guarding input 0
can insist on facts about input 1, or about the outputs.

## What is this input spending?

Every input points at an earlier transaction's output — its **outpoint**, a txid and an
output index:

```simplicityhl,run,tx txid="0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2" title="The outpoint being spent"
fn main() {
    let (txid, vout): (u256, u32) = unwrap(jet::input_prev_outpoint(jet::current_index()));
    // `dbg!` returns its argument, so it goes in expression position; rebinding the same
    // name keeps the code readable.
    let txid: u256 = dbg!(txid);
    let vout: u32 = dbg!(vout);
    assert!(jet::le_32(0, vout));
}
```

Compare the `txid` printed here against the input's source in the explorer. Note it is
displayed in Simplicity's byte order, which is the reverse of how block explorers usually
show a txid.

## Try it yourself

Write a program that passes **only when the current input is worth more than 1000 units**.
The example transaction's input 0 holds 1 and input 1 holds 875,421 — so your program
should fail on input 0 and succeed on input 1.

`jet::lt_64(a, b)` returns `true` when `a < b`.

```simplicityhl,run,tx,expect=run-error txid="0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2" title="Fail on input 0, pass on input 1"
fn main() {
    let (_, amount): (Either<(u1, u256), u256>, Either<(u1, u256), u64>) = jet::current_amount();
    let value: u64 = match amount {
        Left(_: (u1, u256)) => 0,
        Right(explicit: u64) => explicit,
    };

    // Replace this with the real check.
    assert!(jet::lt_64(1000, 0));
}
```

??? success "Solution"

    Assert that 1000 is less than the value:

    ```simplicityhl,run,tx,input=1 txid="0440094a1c5d16ccae819750a19b5f2e926760de112c6f88d81361c0b48f57c2" title="Solution — select input 1"
    fn main() {
        let (_, amount): (Either<(u1, u256), u256>, Either<(u1, u256), u64>) = jet::current_amount();
        let value: u64 = match amount {
            Left(_: (u1, u256)) => 0,
            Right(explicit: u64) => explicit,
        };

        assert!(jet::lt_64(1000, value));
    }
    ```

    This snippet starts on **input 1**, where it passes. Select input 0 and it fails, which
    is the point — the same program is a different question on each input.

## What is still a placeholder

Running against a real transaction does not make *everything* real. Your edited program has
a different CMR than whatever actually locked those coins, so there is no genuine taproot
spend path to model. Jets reading the **internal key**, **tapleaf version**, or **tappath**
still return placeholder values. Everything that reads the transaction itself — amounts,
assets, outpoints, sequences, locktime, inputs, and outputs — is real.
