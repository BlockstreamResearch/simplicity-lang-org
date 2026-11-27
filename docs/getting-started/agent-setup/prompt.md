# Set up Simplicity development

These instructions are for a coding agent. A person setting up by hand can follow [Simplex](../../documentation/simplex.md) instead.

Install Simplex, add the SimplicityHL skill to yourself, then create a first project, write a test for its contract and run it against a local regtest node that Simplex starts and stops. Nothing is sent to Liquid testnet or mainnet.

Inform the user we're installing:

* Rust, through rustup, if it's missing
* `simplexup`, the Simplex installer, in `${XDG_CONFIG_HOME:-$HOME}/.simplex/bin`, added to their shell profile
* Simplex 0.2.0, with `simfmt` and the regtest tools
* the `simplicityhl-simplex` skill, for you
* a `hello_simplicity` project in the current directory

Run the sections in order without stopping between them. If a command fails in a way this page doesn't cover, stop and show the user the error.

## 1. Check the platform and prerequisites

Simplex publishes prebuilt binaries for macOS on Apple silicon and for Linux on x86_64. Check which one this machine is:

```bash
uname -sm   # Darwin arm64 or Linux x86_64
```

On any other result, `simplexup` can't install Simplex. Stop and tell the user.

On Windows (PowerShell or Command Prompt, where `uname` isn't found), Simplex runs inside WSL 2 with an x86_64 Linux distribution. Check for one from PowerShell:

```powershell
wsl --list --verbose   # a distribution with VERSION 2
```

If there's none, ask the user to run `wsl --install -d Ubuntu` from an administrator PowerShell, restart Windows, and finish the Ubuntu first-run setup; then continue. With WSL ready, run every command on this page except the skill install (section 4) inside WSL by prefixing it, for example `wsl -- bash -lc "cargo --version"`. Run the skill install in your own Windows shell, so the skill lands in your Windows skills folder. On Windows on ARM, WSL runs ARM Linux, which Simplex doesn't support.

Check the prerequisites:

```bash
cargo --version    # Rust 1.91 or newer
git --version
curl --version
npx --version      # comes with Node.js; runs the skill installer
```

Any Rust installation works, whether it came from rustup, Homebrew or a Linux package. If it's older than 1.91, update it the way it was installed, for example `rustup update stable` or `brew upgrade rust`. If `cargo` isn't found, install Rust with its official installer and load it into the current shell:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
. "$HOME/.cargo/env"
```

If `npx` isn't found, ask the user to install [Node.js](https://nodejs.org/en/download), which includes `npx`.

## 2. Install simplexup

```bash
curl -L https://smplx.simplicity-lang.org | bash
```

The installer puts `simplexup` in `${XDG_CONFIG_HOME:-$HOME}/.simplex/bin`, adds that directory to the shell profile so new terminals find it, and prints `Detected your preferred shell is <shell> and added simplexup to PATH.` A shell that started before the install doesn't have the directory on its `PATH`, so the later blocks on this page start with an `export` line that adds it. The installer's source is in the [smplx repository](https://github.com/BlockstreamResearch/smplx/blob/master/simplexup/install).

The installer recognizes bash, zsh and fish. With any other shell, it stops with `simplexup: could not detect shell, manually add <directory> to your PATH.` It has already installed `simplexup` at that point, so the `export` lines in the later blocks still work. Tell the user to add the directory to their profile.

## 3. Install Simplex

```bash
export PATH="${XDG_CONFIG_HOME:-$HOME}/.simplex/bin:$PATH"
simplexup --install 0.2.0
simplex --version   # Simplex 0.2.0
```

`simplexup` downloads the release, checks it against the release's attestation, and installs `simplex` along with `simfmt` and the regtest tools that `simplex test` uses.

## 4. Add the SimplicityHL skill

```bash
npx skills add brenorb/freedom-skills -s simplicityhl-simplex -g -y -a claude-code
```

Replace `claude-code` with your own name in the skills installer, such as `codex` or `cursor`. The `-g -y -a` flags install the skill globally, for you only, without waiting for input. The skill covers SimplicityHL syntax, the layout of a Simplex project, and how to build and test one.

If you load new skills only when a session starts, tell the user to start a new session to use it.

## 5. Create a first project

```bash
export PATH="${XDG_CONFIG_HOME:-$HOME}/.simplex/bin:$PATH"
simplex init hello_simplicity
cd hello_simplicity
simplex build
```

`simplex init` creates the project with a starter pay-to-public-key (P2PK) contract, `simf/p2pk.simf`, and prints `Config written to:` followed by the path of the new `Simplex.toml`. The contract takes a public key as a parameter and can be spent only with a signature from that key. `simplex build` generates Rust artifacts from the contract.

If the directory already exists, `simplex init` reports `entity already exists`. Ask the user for another name.

## 6. Write and run a test

The starter test, `tests/p2pk_test.rs`, is a placeholder whose body is `todo!()`, so it fails until it's written. Using the `simplicityhl-simplex` skill, replace it with a test that sends coins from the test signer to the P2PK contract's address, then spends them with the signer's signature, waiting for each transaction to confirm. The [basic example in the smplx repository](https://github.com/BlockstreamResearch/smplx/blob/v0.2.0/examples/basic/tests/basic_test.rs) does the same with the generated `P2pkProgram`, `P2pkArguments` and `P2pkWitness` types. If the test returns `anyhow::Result`, add the crate first with `cargo add anyhow`.

```bash
export PATH="${XDG_CONFIG_HOME:-$HOME}/.simplex/bin:$PATH"
simplex test
```

The first `simplex test` compiles the project's Rust dependencies, which can take several minutes. The test passes when it's listed as `PASS` and the output ends with a `Summary` line that reports no failures, followed by `Exit Status: 0`.

## 7. Report to the user

Tell the user what you installed, where the `hello_simplicity` project is, what its test does, and whether it passed. Then point them to:

* [Simplex](../../documentation/simplex.md), for project configuration, writing and running tests, fuzz tests and `simplex fmt`
* [Build a complete application from web to wallet](../build-end-to-end-app.md), which takes a contract from tests to Liquid testnet
