# Set up Simplicity development

These instructions are for a coding agent. A person setting up by hand can follow [Simplex](../../documentation/simplex.md) instead.

Install Simplex, add the SimplicityHL skill to yourself, then create, build and test a first project against a local regtest node that Simplex starts and stops. Nothing is sent to Liquid testnet or mainnet.

Before you run anything, tell the user what you'll install and wait for them to agree:

* Rust, through rustup, if it's missing or older than 1.91
* `simplexup`, the Simplex installer, in `${XDG_CONFIG_HOME:-$HOME}/.simplex/bin`, added to their shell profile
* Simplex 0.2.0, with `simfmt` and the regtest tools
* the `simplicityhl-simplex` skill, for you
* a `hello_simplicity` project in the current directory

Run the sections in order. If a command fails in a way this page doesn't cover, stop and show the user the error.

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

If there's none, ask the user to run `wsl --install -d Ubuntu` from an administrator PowerShell, restart Windows, and finish the Ubuntu first-run setup; then continue. With WSL ready, run every command on this page except the skill install (section 4) inside WSL by prefixing it, for example `wsl -- bash -lc "rustc --version"`. Run the skill install in your own Windows shell, so the skill lands in your Windows skills folder. On Windows on ARM, WSL runs ARM Linux, which Simplex doesn't support.

Check the prerequisites:

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

If `npx` isn't found, ask the user to install [Node.js](https://nodejs.org/en/download), which includes `npx`.

## 2. Install simplexup

```bash
curl -L https://smplx.simplicity-lang.org | bash
export SIMPLEX_DIR="${XDG_CONFIG_HOME:-$HOME}/.simplex"
export PATH="$SIMPLEX_DIR/bin:$PATH"
```

The installer puts `simplexup` in `$SIMPLEX_DIR/bin`, adds that directory to the shell profile so new terminals find it, and prints `Detected your preferred shell is <shell> and added simplexup to PATH.` The `export` lines make it available in the current shell. The installer's source is in the [smplx repository](https://github.com/BlockstreamResearch/smplx/blob/master/simplexup/install).

The installer recognizes bash, zsh and fish. With any other shell, it stops with `simplexup: could not detect shell, manually add <directory> to your PATH.` It has already installed `simplexup` at that point, so the `export` lines above still work for the current shell. Tell the user to add the directory to their profile.

## 3. Install Simplex

```bash
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

## 5. Create and test a first project

```bash
simplex init hello_simplicity
cd hello_simplicity
simplex build
simplex test
```

`simplex init` creates the project with a starter contract, `simf/p2pk.simf`, and a test for it, `tests/p2pk_test.rs`, and prints `Config written to:` followed by the path of the new `Simplex.toml`. `simplex build` generates Rust artifacts from the contract, and `simplex test` runs the test against a regtest node. The first `simplex test` compiles the project's Rust dependencies, which can take several minutes.

The test passes when it's listed as `PASS` and the output ends with a `Summary` line that reports no failures, followed by `Exit Status: 0`.

If the directory already exists, `simplex init` reports `entity already exists`. Ask the user for another name.

## 6. Report to the user

Tell the user what you installed, where the `hello_simplicity` project is, and whether its test passed. Then point them to:

* [Simplex](../../documentation/simplex.md), for project configuration, dependencies, fuzz tests and `simplex fmt`
* [Build a complete application from web to wallet](../build-end-to-end-app.md), which takes a contract from tests to Liquid testnet
