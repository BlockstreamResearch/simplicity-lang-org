# SimplicityHL Toolchain

Our basic developer tools for SimplicityHL are

* `simc`, the SimplicityHL compiler (<a href="https://github.com/BlockstreamResearch/SimplicityHL/">GitHub project</a>)
* `hal-simplicity`, an all-purpose Simplicity utility that can do various tasks related to programs and transactions (<a href="https://github.com/BlockstreamResearch/hal-simplicity/">GitHub project</a>)

The recommended way to install both of these tools is via `cargo`; make sure you <a href="https://doc.rust-lang.org/stable/cargo/getting-started/installation.html">have `cargo` installed</a> first.

You can then install these tools with the command

```bash
cargo install simplicityhl hal-simplicity
```

That's it! With these tools installed, you can complete our <a href="/getting-started/quickstart">quickstart tutorial</a>.

## VSCode extension

If you're expecting to develop SimplicityHL contracts with Visual Studio Code, you can also install our extension to provide syntax highlighting and other developer features.

* Open Extensions View: Click the Extensions icon in the left sidebar.
* Search: In the search field, type `SimplicityHL`.
* Install: Click the Install button for the extension provided by Blockstream. 
