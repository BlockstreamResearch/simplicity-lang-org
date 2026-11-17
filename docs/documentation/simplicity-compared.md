# Simplicity compared to other languages

Simplicity is a low-level, formally verifiable functional language for expressing spending conditions and covenants on Bitcoin-like blockchains. The table below compares it with other approaches to writing on-chain spend conditions and smart contracts.

| Aspect | **Bitcoin Script** | **Miniscript** | **Solidity** | **Simplicity** | **Comments** |
|---|---|---|---|---|---|
| **Primary purpose** | Minimal spend conditions for Bitcoin UTXOs | Safer, structured way to write Bitcoin Script policies | General-purpose smart contracts on Ethereum-like blockchains | Formally verifiable contracts in Bitcoin-like settings | |
| **Expressiveness** | Limited by design | More composable than Bitcoin Script | Very high | High within strict rules | More features increase the number of ways a program can be misused or misconfigured. |
| **Execution model** | Stack-based, no global state | Policy → Script, tree-structured, stack-based | Runs on EVM with global state | Combinator-based, no loops or mutable state | The execution model determines how contracts interact and how directly their behavior can be audited. |
| **Turing-completeness** | No | No | Yes | No | Non-Turing-completeness means every program terminates in bounded time; gas metering is unnecessary because execution cost is bounded statically. |
| **Typical use cases** | Payments, multisig, timelocks | Advanced wallet policies, thresholds with fallbacks | DeFi, tokens, DAOs, dApps | High-assurance financial logic | Each language targets a different point on the tradeoff between expressiveness and constraint. |
| **Safety approach** | Minimal opcodes, deterministic | Constrained grammar with static checks | Security via patterns, audits, and tooling | Formal proofs and deterministic execution | Static and formal methods catch a different class of bugs than runtime testing and auditing. |
| **State model** | [UTXO](../glossary.md#utxo) (local) | UTXO (via Script) | Account/global state | UTXO-style | A local (UTXO) model isolates each contract's state from others. A global-state model lets contracts read and write state shared with other contracts directly. |
| **Formal verification** | Limited | Better static analysis | Possible but complex | Core feature | The extent and rigor of available formal-verification tooling varies across these ecosystems. |
| **Performance/resource bounds** | Bounded by consensus | Bounded by consensus | Gas-limited execution | Strict static bounds | How resource bounds are enforced (by consensus limits, by a gas mechanism, or statically by the language) affects how predictable execution cost is before deployment. |
| **Interoperability** | Bitcoin-native | Bitcoin-native | EVM-wide standards | Liquid ecosystem | Interoperability depends on which wallets, tooling, and standards a contract can integrate with directly. |
