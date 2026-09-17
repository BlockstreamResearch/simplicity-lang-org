---
title: Interactive tutorial
description: Learn SimplicityHL by running programs in your browser. The compiler is compiled to WebAssembly, so nothing is installed and nothing is sent to a server.
---

# Interactive tutorial

Every code block in this tutorial is live. Edit it, press **Run**, and the SimplicityHL
compiler — built to WebAssembly and running inside this page — compiles your program to
Simplicity bytecode and executes it on the Simplicity bit machine.

Nothing is installed, and nothing is sent to a server. The compiler is downloaded once, on
your first Run, and reused for the rest of the session.

<div class="grid cards" markdown>

-   :material-play-circle:{ .lg .middle } **[Your first program](your-first-program.md)**

    ---

    What `assert!` means, why a program has no return value, what a jet is, and how to see
    intermediate values with `dbg!`.

-   :material-magnify:{ .lg .middle } **[Reading data from an input](reading-transaction-data.md)**

    ---

    Introspection jets, run against a real Liquid testnet transaction fetched into your
    browser. Amounts, assets, and outpoints as the program would really see them.

</div>

If you would rather install the toolchain and work locally, start with the
[quickstart](../getting-started/quickstart.md) instead. For a full editor in the browser,
with witness management and transaction building, see the
[Web IDE](../getting-started/web-ide.md).
