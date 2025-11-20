# SimplicityHL Quickstart
We'll use only two tools initially: `simc` (the SimplicityHL compiler) and `hal-simplicity` (an all-purpose Simplicity utility that can do various tasks related to programs and transactions).

Both of these can be installed with `cargo`; make sure you <a href="https://doc.rust-lang.org/stable/cargo/getting-started/installation.html">have `cargo` installed</a> first.  The demo script also requires `jq` and `curl` (for parsing JSON data and connecting to Liquid Testnet API endpoints).

You will also need to download the <a href="/assets/p2ms-demo.sh">p2ms-demo.sh</a> bash script from this site. Then mark it executable with `chmod +x p2ms-demo`.

The steps below should then be sufficient to perform your first Simplicity transaction with an on-chain contract written in SimplicityHL!

```
cargo install simplicityhl
cargo install --git https://github.com/BlockstreamResearch/hal-simplicity

# We'll check out a local copy of the SimplicityHL repository to use its
# contract code examples.  If you choose to check this out under a different
# path, change the path to the source files in the p2ms-demo script below, as
# it defaults to assuming that the example SimplicityHL source code is found
# under ~/src/SimplicityHL/examples.
pushd ~/src
git clone https://github.com/BlockstreamResearch/SimplicityHL
popd

./p2ms-demo.sh
```

This demo script exercises a Pay to Multisig contract written in SimplicityHL by performing a real transaction to and from this contract on the Liquid Testnet. You can look at the contents of `p2ms-demo.sh` to understand more about the steps it performs, or use it as a basis for performing Liquid Testnet transactions with other Simplicity contracts.
