# Set up Simplicity with a coding agent

The **Copy setup prompt** button on the [homepage](../index.md) copies a one-line prompt for a coding agent such as Claude Code, Codex or Cursor. The agent reads this page and runs the commands below. They install [Simplex](../glossary.md#simplex), add a [SimplicityHL](../glossary.md#simplicityhl) skill to the agent, and build and test a first project against a local [regtest](../glossary.md#regtest) [node](../glossary.md#node). Nothing is sent to [Liquid](../glossary.md#liquid) testnet or mainnet.

```text title="The prompt"
Set up Simplicity development on this machine by following https://docs.simplicity-lang.org/getting-started/agent-setup.md. Tell me what you'll install before you start.
```

Without an agent, run the same commands in a terminal.

!!! note "Supported platforms"
    Simplex publishes prebuilt binaries for macOS on Apple silicon and for Linux on x86_64. On other systems, `simplexup` can't install Simplex. On Windows, run these commands in WSL.

## 1. Check the prerequisites

```bash
rustup --version
rustc --version    # 1.91 or newer; if older, run: rustup update stable
git --version
curl --version
npx --version      # comes with Node.js; runs the skill installer
```

If `rustup` isn't found, install Rust with its official installer and load it into the current shell:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
. "$HOME/.cargo/env"
```

If `npx` isn't found, install [Node.js](https://nodejs.org/en/download), which includes `npx`.

## 2. Install simplexup

```bash
curl -L https://smplx.simplicity-lang.org | bash
export SIMPLEX_DIR="${XDG_CONFIG_HOME:-$HOME}/.simplex"
export PATH="$SIMPLEX_DIR/bin:$PATH"
```

The installer puts `simplexup` in `$SIMPLEX_DIR/bin`, adds that directory to the shell profile so new terminals find it, and prints `Detected your preferred shell is <shell> and added simplexup to PATH.` The `export` lines make it available in the current shell. The installer's source is in the [smplx repository](https://github.com/BlockstreamResearch/smplx/blob/master/simplexup/install).

The installer recognizes bash, zsh and fish. With any other shell, it stops with `simplexup: could not detect shell, manually add <directory> to your PATH.` It has already installed `simplexup` at that point, so the `export` lines above still work for the current shell.

## 3. Install Simplex

```bash
simplexup --install 0.2.0
simplex --version   # Simplex 0.2.0
```

`simplexup` downloads the release, checks it against the release's attestation, and installs `simplex` along with `simfmt` and the regtest tools that `simplex test` uses. This is the same release the [end-to-end tutorial](build-end-to-end-app.md) uses.

## 4. Add the SimplicityHL skill

```bash
npx skills add brenorb/freedom-skills -s simplicityhl-simplex
```

The skill teaches a coding agent SimplicityHL syntax, the layout of a Simplex project, and how to build and test one. The installer asks which agents to install it for. A coding agent running this command should answer up front, so that the installer doesn't wait for input: add `-g -y -a` followed by its own name, such as `claude-code`, `codex` or `cursor`.

```bash
npx skills add brenorb/freedom-skills -s simplicityhl-simplex -g -y -a claude-code
```

Some agents load new skills only when a session starts. If the skill doesn't appear, start a new session.

## 5. Create and test a first project

```bash
simplex init hello_simplicity
cd hello_simplicity
simplex build
simplex test
```

`simplex init` creates the project with a starter contract, `simf/p2pk.simf`, and a test for it, `tests/p2pk_test.rs`, and prints `Config written to:` followed by the path of the new `Simplex.toml`. `simplex build` generates Rust artifacts from the contract, and `simplex test` runs the test against a regtest node that Simplex starts and stops on its own. The first `simplex test` compiles the project's Rust dependencies, which can take several minutes.

The test passes when it's listed as `PASS` and the output ends with a `Summary` line that reports no failures, followed by `Exit Status: 0`.

If the directory already exists, `simplex init` reports `entity already exists`. Choose another name.

## Next steps

* [Simplex](../documentation/simplex.md) covers project configuration, dependencies, fuzz tests and `simplex fmt`.
* [Build a complete application from web to wallet](build-end-to-end-app.md) takes a contract from tests to Liquid testnet.
