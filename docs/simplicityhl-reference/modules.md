# Modules and imports reference

An informal introduction to this feature is available in the [introduction to modules and imports](../../documentation/modules/).

The modules and imports feature is available experimentally since SimplicityHL 0.6.0 (compiling with `-Z imports`). Modules let you organize a program as multiple files and/or nested `mod` blocks, and let you import function and type definitions from elsewhere, whether from another file in your own project or from a separate project entirely. The syntax is a subset of that used by Rust.

The SimplicityHL modules mechanism also supports the [SimplicityHL standard library](../../documentation/stdlib/).

!!! warning "Unstable feature"

    Everything on this page (`use`, `mod`, `as`, `pub`, and `crate::`) requires compiling with `simc -Z imports`, and this behavior is subject to change.

## Exporting with `pub`

The objects that can be exported and imported in SimplicityHL are functions and type aliases. SimplicityHL does not currently have any way to declare module-level constants, so these cannot be exported or imported.

By default, every function and type alias is private to the file (or the `mod` block, see below) that declares it. To make a function, type alias, `mod` block, or `use` import visible to other files, put `pub` in front of its declaration. A `pub use` is a *re-export*; see [Re-exporting](#re-exporting-with-pub-use) below.

## Importing with `use`

Reference the item you want with a `use` declaration, giving its full path and ending in `;`.

### Local paths (`crate::`)

Local files (that is, files belonging to your own project rather than an external dependency) are addressed with the `crate::` prefix. Path resolution walks the remaining segments greedily: each segment that names an existing subdirectory is descended into, and the first segment that instead matches `<name>.simf` (the name, without the `.simf` extension) marks the file being imported from. Any segments still remaining after that point name a chain of nested `mod` blocks inside that file, ending in the actual function or type being imported.

```simplicityhl
use crate::math::foo::bar;
```

Here, `math` is a subdirectory, `foo` is the file `math/foo.simf`, and `bar` is a `pub` item defined in that file: either directly, or, if the path had further segments, nested inside `pub mod` blocks within it.

By default, `crate::` is rooted at the directory containing the entry file you pass to `simc`. `simc --project-root <dir>` (added in 0.7.2) can anchor it at a different directory instead, which allows the entry file to live in a subdirectory of the project.

There is no `super::` or other syntax for referring to a parent module relatively. Every local path is written in full, starting from `crate::`.

### Declaring modules inline with `mod`

Instead of (or alongside) splitting code into separate files, `mod name { ... }` groups items into a named namespace within a single file. `mod` blocks can be marked `pub` and nested to any depth:

```simplicityhl
mod math {
    pub mod ops {
        pub fn double(x: u32) -> u32 {
            let (_, res): (bool, u32) = jet::add_32(x, x);
            res
        }
    }
}

use crate::math::ops::double;

fn main() {
    assert!(jet::eq_32(double(21), 42));
}
```

A `use` declaration is required to reach a sibling `mod` block's items even when both are defined in the same file. `pub`/`use` visibility rules don't distinguish between "same file" and "different file".

As a special case, `enum` declarations cannot be placed inside any `mod` block, and (independently of modules) can only appear in the compiler's entry file, not in any other local file or in a dependency. (Enum identity is currently tied to the compiler's internal file-numbering, which is not guaranteed stable once other files are involved; see [Enum Types](type.md#enum-types).)

### Aliasing with `as`

```simplicityhl
use crate::math::foo::bar as baz;
```

`bar` from `math/foo.simf` is available under the local name `baz` instead. Aliasing an import to `main` is an error, regardless of the imported item's original name.

### Importing multiple items at once

```simplicityhl
use crate::math::foo::{bar, baz as qux};
```

imports both `bar` and `baz` (renamed to `qux`) from the same file or `mod` block via a single declaration; aliasing with `as` works per item inside the list. There is no wildcard/glob form (the Rust-like form `use crate::math::foo::*;` is not supported). Every imported name must be listed explicitly, either on its own or inside a `{ }` list.

### Re-exporting with `pub use`

Adding `pub` in front of a `use` declaration imports the item for use in the current file and also re-exports it, making it available for other files to import from this file/module, under its own path:

```simplicityhl
pub use crate::math::foo::bar;
```

Re-exports may be chained across any number of files. This is how the SimplicityHL standard library and multi-file "façade" libraries can expose a flat, curated set of names while splitting their actual implementations across multiple files.

## External library dependencies

To import from a `.simf` source tree other than the one containing your file, register it with the `simc` compiler's `--dep` flag:

```bash
simc -Z imports --dep NAME=PATH main.simf
```

This maps the prefix `NAME` to the directory `PATH` (relative or absolute) for that compile. A `use NAME::...` path is then resolved exactly like a `crate::...` path, but rooted at `PATH` instead of the project root:

```simplicityhl
use elsewhere::foo::bar;
```

When a program containing the code above is compiled with `simc -Z imports --dep elsewhere=../libs/elsewhere_dir main.simf`, the compiler looks for `bar` in `../libs/elsewhere_dir/foo.simf`. `--dep` can be repeated to register any number of dependencies, each under its own alias.

### Scoping a dependency with `CONTEXT:`

A `--dep` argument may optionally be prefixed with a context directory:

```bash
simc -Z imports --dep CONTEXT:NAME=PATH main.simf
```

This restricts the `NAME` alias so it only resolves for files located under `CONTEXT` (a path relative to, or equal to, the project root); files outside `CONTEXT` don't see `NAME` as a valid dependency at all. This lets different parts of a larger project map the same alias name to different targets, or limit which of your own files are allowed to see a given dependency. A plain `NAME=PATH` (no `CONTEXT:`) makes the alias available to every file in the project.

A file cannot be imported both as a local (`crate::`) file and, through a `--dep` alias, as if it were external to the project. The compiler rejects this as an error.
