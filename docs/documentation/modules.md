# Introduction to modules and imports

As a [SimplicityHL](../glossary.md#simplicityhl) program grows, it's often useful to split it across multiple files, or to reuse functions that were already written for a different project. SimplicityHL has a module system for this, based on two keywords: `pub` (to make something available to other files) and `use` (to bring something from another file into the one you're writing).

This system is loosely based on the module system in the Rust programming language, but is much simpler. This page introduces it from scratch and doesn't assume you've used Rust modules before. For the complete, formal syntax rules, see the [modules reference page](../simplicityhl-reference/modules.md).

!!! warning "This is an experimental feature"

    Modules and imports are available since SimplicityHL 0.6.0, and are gated behind an unstable-features flag. To use any of the syntax described on this page, you need a compiler of at least that version, and you currently need to compile with `simc -Z imports program.simf` (equivalently, `--unstable-feature imports`). Omitting that flag makes `use`, `mod`, `as`, and `crate::` all fail to compile.

## Making an item importable with `pub`

You don't have to do anything special to make a `.simf` file into a module; by default, every file is a module, but functions defined in one file aren't visible from another.

To let a function be imported into another file, put `pub` in front of its definition:

```simplicityhl
// shapes/polygons.simf
pub fn triangle_area(base: u32, height: u32) -> u32 {
    let (_, doubled): (bool, u32) = jet::multiply_32(base, height);
    let (half, _): (u32, bool) = jet::divide_32(doubled, 2);
    half
}
```

Without `pub`, `triangle_area` could only be called from within `polygons.simf` itself.

## Importing an item with `use`

To use `triangle_area` from a different file, add a `use` line naming its full path, starting with `crate` and delimited with double colons:

```simplicityhl
// main.simf
use crate::shapes::polygons::triangle_area;

fn main() {
    assert!(jet::eq_32(triangle_area(6, 4), 12));
}
```

Given a project laid out like this:

```text
project/
├── main.simf
└── shapes/
    └── polygons.simf
```

`crate` refers to the root of the current project: by default, the directory containing the file you pass to [`simc`](../glossary.md#simc) (there's also a `--project-root` flag (0.7.2+) for less common layouts, covered in the reference page). Each `::`-separated segment after `crate` is then either:

* the name of a subdirectory to descend into, or
* the name of a `.simf` file (written without the `.simf` suffix): once a segment matches a file instead of a directory, that's the file being imported from,

with the final segment naming the item being imported from that file. In the example above, `shapes` is a directory and `polygons` is the file `shapes/polygons.simf`.

## Grouping code with `mod`, without separate files

Sometimes you want to group related functions together without creating a separate file for them. A `mod` block does that inside a single file. `mod` blocks can be nested.

```simplicityhl
mod math {
    pub mod ops {
        pub fn double(x: u32) -> u32 {
            let (overflow, res): (bool, u32) = jet::add_32(x, x);
            assert!(not(overflow));
            res
        }
    }
}

mod business_logic {
    use crate::math::ops::double;

    pub fn calculate_fee(base_price: u32, tax: u32) -> u32 {
        let (overflow, res): (bool, u32) = jet::add_32(double(base_price), tax);
        assert!(not(overflow));
        res
    }
}

use crate::business_logic::calculate_fee;

fn main() {
    assert!(jet::eq_32(calculate_fee(15, 5), 35));
}
```

This is a single file, `examples/modules.simf` in the SimplicityHL repository. `business_logic` still needs its own `use` line to access `math::ops`, even though both are defined in the same file. `pub` and `use` work the same way whether the code you're importing appears in the same file or a different one.

## Renaming an import with `as`

If an imported name would clash with something else, or you'd prefer a different local name, add `as`:

```simplicityhl
use crate::shapes::polygons::triangle_area as tri_area;
```

The imported function will now be called `tri_area`.

## Importing multiple items

List multiple items from the same file in braces. Any of them can be renamed with `as`:

```simplicityhl
use crate::shapes::polygons::{triangle_area, square_area as sq_area};
```

There's no `*` wildcard to import every item from a file.

## Re-exporting with `pub use`

Adding `pub` in front of a `use` line imports the item and makes it available for *other* files to import from *this* file, under its own name. This lets one file collect items from several lower-level files under a single import path:

```simplicityhl
// lib/api.simf
pub use crate::shapes::polygons::triangle_area;
pub use crate::shapes::polygons::square_area;
```

Another file can then import it with `use crate::lib::api::triangle_area;`, without depending on its implementation being stored in `shapes/polygons.simf`.

## Using code from another project

To reuse a library in a separate directory (not a subdirectory of your current project), pass `simc` the `--dep` flag with a local name (an *alias*) and the library's directory:

```bash
simc -Z imports --dep shapes_lib=../shapes_lib main.simf
```

This maps the name `shapes_lib` to the directory `../shapes_lib` for the duration of this compile. Inside your code, you import from it exactly like a local module, starting from the alias instead of `crate`:

```simplicityhl
use shapes_lib::polygons::triangle_area;
```

## Using the standard library with Simplex

SimplicityHL ships a standard library, [`simplicityhl-std`](https://github.com/BlockstreamResearch/simplicityhl-std), with functions like checked arithmetic and equality assertions; see the [standard library reference](stdlib.md) for the complete list. It can be imported the same way as any other external dependency.

Most current SimplicityHL projects, including the standard library's own development, are managed with [Simplex](simplex.md), which can fetch the standard library and register it as a dependency automatically with the special package name `std`:

```bash
simplex install std
```

This adds an entry to the project's `Simplex.toml`.

Simplex passes the equivalent of a `--dep std=...` argument to `simc` when it builds the project, so all standard library functions become available to import under `std::`:

```simplicityhl
use std::lib::u32::math::checked_add_32;
use std::lib::asserts::assert_eq_32;

fn main() {
    assert_eq_32(unwrap(checked_add_32(1, 2)), 3);
}
```

## Using the standard library without Simplex

To get the same result manually, clone the `BlockstreamResearch/simplicityhl-std` repository and register it with `--dep`. Point the alias at the repository's `simf` directory, since that's where the library's own `crate::` paths are rooted:

```bash
git clone --branch v0.2.0 https://github.com/BlockstreamResearch/simplicityhl-std.git
simc -Z imports --dep std=simplicityhl-std/simf myproject.simf
```

With a manual `--dep` alias, the `use` lines in the SimplicityHL project source are identical to the Simplex case above.

## Differences from other module systems

SimplicityHL's module system is more restrictive than similar-looking import systems in other languages, including Rust:

* Functions are private unless marked `pub`, so a function that isn't exported can't be imported.
* Every local (non-dependency) path starts with `crate::`, and there's no special way to refer to a parent module.
* There's no `*` wildcard import.

## Where to go next

* The [modules reference page](../simplicityhl-reference/modules.md) covers exact syntax details related to modules and imports.
* The [Simplex](simplex.md) page covers its package and dependency management features.
