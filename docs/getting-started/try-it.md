---
title: Try it in your browser
description: Run SimplicityHL in your browser, with nothing to install.
---

This page compiles and runs SimplicityHL directly in your browser, using
the same compiler and Simplicity bit machine used on-chain. Nothing
you type here is sent to a server or to the blockchain. The compiler
is downloaded on the first Run; after that, each Run is immediate.

## Assertions

A SimplicityHL program doesn't return a value. It either holds or it doesn't. A
transaction spending a SimplicityHL-locked output is valid exactly when the program
holds.

```simplicityhl,run title="Assertions"
fn main() {
    let (_, sum): (bool, u32) = jet::add_32(2, 2);
    assert!(jet::eq_32(sum, 4));
}
```

Changing the last argument from `4` to `5` (or, indeed, changing any
of the integer values), and running again produces a program that still
compiles. But the program's logic no longer confirms the transaction;
on-chain, this is a rejected spend, not a runtime error.

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
4000000000 + 1000000000. Changing the first argument to `2000000000` removes the
overflow: `overflowed` becomes `false`, and the final assertion, which requires it to be
`true`, fails. The addition still succeeds, but now the assertion fails.

## Transaction introspection

A SimplicityHL program runs in the context of a specific transaction input, and can
inspect that transaction directly: which input it is, how many inputs the transaction
has, and other properties. These tools can be used to build vaults and covenants, by
constraining the outputs of transaction itself to send assets back to the same program.

```simplicityhl,run title="Transaction introspection"
fn main() {
    let index: u32 = dbg!(jet::current_index());
    let inputs: u32 = dbg!(jet::num_inputs());
    assert!(jet::lt_32(index, inputs));
}
```

This runs against a placeholder transaction with a single input, so it prints
`jet::current_index(): 0` and `jet::num_inputs(): 1`. Checked against a real
transaction, these jets return the transaction's actual values; the Quickstart linked
below does this against a live Liquid testnet transaction.

## Run a program from a browser agent

Open any page on this site in a browser with [WebMCP enabled](https://developer.chrome.com/docs/ai/webmcp/). Ask the agent to
discover `run_simplicityhl` and call it with the full program as `source`.
For example:

```json
{"source":"fn main() { assert!(jet::eq_32(2, 2)); }"}
```

This returns `status: "success"`. Change the second `2` to `3` to get
`status: "execution_error"`. A program that doesn't compile returns
`status: "compile_error"` and compiler diagnostics. Use `dbg!()` to
inspect values in the `debug` array.

The tool uses the same placeholder transaction as the examples on this
page. It leaves the editors unchanged and doesn't submit transactions.

## Where to go next

- **Quickstart:** the [Quickstart tutorial](quickstart.md) compiles a similar contract, funds it, and spends it in a transaction on [Liquid](../glossary.md#liquid) testnet.
- **Use cases:** [applications built with Simplicity](../use-cases/index.md).
