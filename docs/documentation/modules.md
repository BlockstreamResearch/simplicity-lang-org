# Introduction to modules and imports

As a SimplicityHL program grows, it's often useful to split it across multiple files, or to reuse functions that were already written for a different project. SimplicityHL has a lightweight system for this, based on two keywords: `pub` (to make something available to other files) and `use` (to bring something from another file into the one you're writing).

This system is loosely based on the module system in the Rust programming language, but is much simpler. This page introduces it from scratch and doesn't assume you've used Rust modules before. For the complete, formal syntax rules, see the [modules reference page](../../simplicityhl-reference/modules/).

!!! warning "This is an experimental feature"

    Modules and imports are available since SimplicityHL 0.6.0, and are gated behind an unstable-features flag. To use any of the syntax described on this page, you need a compiler of at least that version, and you currently need to compile with `simc -Z imports program.simf` (equivalently, `--unstable-feature imports`). Omitting that option makes `use`, `mod`, `as`, and `crate::` all fail to compile.

## Making a symbol importable with `pub`

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

## Importing a symbol with `use`

To use `triangle_area` from a different file, add a `use` line naming its full path, starting with `crate` and delimited with double colons:

```simplicityhl
// main.simf
use crate::shapes::polygons::triangle_area;

fn main() {
    assert!(jet::eq_32(triangle_area(6, 4), 12));
}
```

Given a project laid out like this:

```
project/
├── main.simf
└── shapes/
    └── polygons.simf
```

`crate` means "start from the root of my own project": by default, the folder containing the file you pass to `simc` (there's also a `--project-root` flag for less common layouts, covered in the reference page). Each `::`-separated segment after `crate` is then either:

* the name of a subdirectory to descend into, or
* the name of a `.simf` file (written without the `.simf` suffix): once a segment matches a file instead of a directory, that's the file being imported from,

with the very last segment naming the actual item being imported from that file. In the example above, `shapes` is a directory and `polygons` is the file `shapes/polygons.simf`.

## Grouping code with `mod`, without separate files

Sometimes you want to group related functions together without creating a whole new file for them. A `mod` block does that inside a single file. `mod` blocks can be nested.

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

This is a single file, `examples/modules.simf` in the SimplicityHL repository. Notice that `business_logic` still needs its own `use` line to access `math::ops`, even though both are defined in the same file. `pub` and `use` work the same way whether the code you're importing appears in the same file or a different one.

## Renaming an import with `as`

If an imported name would clash with something else, or you'd just prefer a different local name, add `as`:

```simplicityhl
use crate::shapes::polygons::triangle_area as tri_area;
```

The imported function will now be called `tri_area`.

## Importing several things at once

List multiple items from the same file in braces. Optionally, use an `as` wherever you like:

```simplicityhl
use crate::shapes::polygons::{triangle_area, square_area as sq_area};
```

There's no `*` wildcard to import "everything" from a file. Every name has to be listed explicitly.

## Re-exporting with `pub use`

Adding `pub` in front of a `use` line imports the item and makes it available for *other* files to import from *this* file, under its own name. This is handy for building a single file that gathers up functions from several lower-level files into one convenient place:

```simplicityhl
// lib/api.simf
pub use crate::shapes::polygons::triangle_area;
pub use crate::shapes::polygons::square_area;
```

Another file can then write `use crate::lib::api::triangle_area;` without needing to know that its implementation is actually stored in `shapes/polygons.simf`.

## Using code from another project

To reuse a library that lives in a separate directory entirely (not a subdirectory of your current project), tell `simc` about it with the `--dep` flag, giving it a local name (an *alias*) to import under:

```bash
simc -Z imports --dep shapes_lib=../shape_lib main.simf
```

This maps the name `shapes_lib` to the directory `../shape_lib` for the duration of this compile. Inside your code, you import from it exactly like a local module, just starting from the alias instead of `crate`:

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

The same effect can be achieved manually by cloning the `BlockstreamResearch/simplicityhl-std` repository and registering it as a manual `--dep`. Point the alias at the repository's `simf` directory, since that's where the library's own `crate::` paths are rooted:

```bash
git clone --branch v0.1.0 https://github.com/BlockstreamResearch/simplicityhl-std.git
simc -Z imports --dep std=simplicityhl-std/simf myproject.simf
```

When the alias is created this way, the `use` lines in the SimplicityHL project source are identical to the Simplex case above.

## A quick summary of what's different from other languages

If you've used a language with a similar-looking import system before (including Rust), a few things about SimplicityHL's version are worth calling out because they're more restrictive:

* Functions are private unless marked `pub`: there's no way to import something that wasn't exported.
* Every local (non-dependency) path starts with `crate::`; there's no special way to refer to a parent module.
* There's no `*` wildcard import. Each imported name must be written out in full.

## Where to go next

* The [modules reference page](../../simplicityhl-reference/modules/) covers exact syntax details related to modules and imports.
* Read more about [Simplex](simplex.md) and its package and dependency management features.
