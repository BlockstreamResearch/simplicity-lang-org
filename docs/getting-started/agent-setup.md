# Set up Simplicity with a coding agent

Paste this prompt into a coding agent such as Claude Code, Codex or Cursor. The agent installs [Simplex](../glossary.md#simplex), adds a [SimplicityHL](../glossary.md#simplicityhl) skill to itself, and builds and tests a first project against a local [regtest](../glossary.md#regtest) [node](../glossary.md#node). Nothing is sent to [Liquid](../glossary.md#liquid) testnet or mainnet.

``` { .text .wrap title="Setup prompt" }
--8<-- "overrides/partials/agent-prompt.txt"
```

Simplex runs on macOS on Apple silicon, Linux on x86_64, and Windows through WSL 2 with an x86_64 Linux distribution.

## What the agent does

The agent:

1. Checks for Rust 1.91+, git, curl and Node.js, and installs Rust with rustup if it's missing.
2. Installs `simplexup`, the Simplex installer.
3. Installs Simplex 0.2.0, the release the [end-to-end tutorial](build-end-to-end-app.md) uses.
4. Adds the `simplicityhl-simplex` skill.
5. Creates a `hello_simplicity` project with a pay-to-public-key contract, uses the skill to write a test that funds the contract and spends from it on regtest, and runs the test.

Setup has worked when the agent reports that the `hello_simplicity` test passed. [Simplex](../documentation/simplex.md) explains the project layout and how its tests work. If the agent doesn't use the skill afterward, start a new session: some agents load skills only when a session starts.

??? abstract "The full instructions your agent follows"

    ```` { .markdown .wrap }
    --8<-- "docs/getting-started/agent-setup/prompt.md"
    ````

## Set up without an agent

[Installing Simplex](../documentation/simplex.md#installing-simplex) and [Creating a project](../documentation/simplex.md#creating-a-project) cover the same steps by hand.
