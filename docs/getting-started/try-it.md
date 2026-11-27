---
title: Try it in your browser
description: Run SimplicityHL in your browser, with nothing to install.
---

This page compiles and runs [SimplicityHL](../glossary.md#simplicityhl) directly in your browser, using
the same compiler and [Simplicity](../glossary.md#simplicity) bit machine used on-chain. Nothing
you type here is sent to a server or to the blockchain. The compiler
is downloaded on the first Run; after that, each Run is immediate.

## Assertions

A SimplicityHL [program](../glossary.md#program) doesn't return a value. It either succeeds or fails. A
[transaction](../glossary.md#transaction) spending a SimplicityHL-locked [output](../glossary.md#output) can be valid only if the program
succeeds.

```simplicityhl,run title="Assertions"
fn main() {
    let (_, sum): (bool, u32) = jet::add_32(2, 2);
    assert!(jet::eq_32(sum, 4));
}
```

Press **Run**. The pane shows "Program succeeded — all assertions held".

Change the last argument from `4` to `5` and press **Run** again. The program still
compiles, but the assertion fails, and the pane shows "Program failed". On-chain, a
transaction spending an output locked by this program would be invalid and wouldn't
confirm.

## Arithmetic overflow

Addition that can overflow returns the overflow condition as an explicit value,
rather than wrapping silently or raising an error.

```simplicityhl,run title="Arithmetic overflow"
fn main() {
    let (overflowed, sum): (bool, u32) = jet::add_32(4000000000, 1000000000);
    let overflowed: bool = dbg!(overflowed);
    let sum: u32 = dbg!(sum);
    assert!(overflowed);
}
```

Running this prints `overflowed: true` and `sum: 705032704`, the wrapped result of
4000000000 + 1000000000. Change the first argument to `2000000000` and press **Run**
again. This removes the overflow: `overflowed` becomes `false`, and the final assertion,
which requires it to be `true`, fails.

## Transaction introspection

A SimplicityHL program runs in the context of a specific transaction [input](../glossary.md#input), and can
inspect that transaction directly: which input it is, how many inputs the transaction
has, and other properties. Introspection [jets](../glossary.md#jet) let a program constrain the transaction's
outputs, for example by requiring that [assets](../glossary.md#asset) go back to the same program.
[Vaults](../glossary.md#vault) and other [covenants](../glossary.md#covenant) work this way.

```simplicityhl,run title="Transaction introspection"
fn main() {
    let index: u32 = dbg!(jet::current_index());
    let inputs: u32 = dbg!(jet::num_inputs());
    assert!(jet::lt_32(index, inputs));
}
```

This runs against a placeholder transaction with a single input, so it prints
`jet::current_index(): 0` and `jet::num_inputs(): 1`. Run against a real
transaction, these jets return the transaction's actual values; the Quickstart linked
below does this against a live [Liquid](../glossary.md#liquid) testnet transaction.

## Where to go next

- **Quickstart:** the [Quickstart tutorial](quickstart.md) compiles a "last will" [contract](../glossary.md#contract), sends test Liquid bitcoin (tLBTC) to it, and spends it in a transaction on Liquid testnet.
- **Use cases:** [applications built with Simplicity](../use-cases/index.md).
