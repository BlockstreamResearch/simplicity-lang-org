#!/usr/bin/env python3

# This reads docs/stdlib.json and Cargo.toml at a release tag of a
# simplicityhl-std checkout and generates docs/documentation/stdlib.md.
#
# Usage: python3 stdlib.md.py <simplicityhl-std checkout> <tag>
#   e.g. python3 stdlib.md.py ~/src/simplicityhl-std v0.2.0 \
#            > docs/documentation/stdlib.md
#
# Both files are read from the tag with `git show`, so the page always
# names the version it was generated from, and uncommitted or newer
# changes in the checkout don't leak into it.

# Adapted from jets.md.py
# (still uses internal variables referring to jets!)

import datetime
import json
import re
import subprocess
import sys

from descriptions import description_to_cell


def git_show(checkout, tag, path):
    try:
        return subprocess.run(
            ["git", "-C", checkout, "show", "{}:{}".format(tag, path)],
            check=True, capture_output=True, text=True,
        ).stdout
    except subprocess.CalledProcessError as e:
        sys.exit("stdlib.md.py: can't read {} at {} in {}: {}".format(
            path, tag, checkout, e.stderr.strip()))


def package_version(cargo_toml):
    # The version line in the [package] table. A regex rather than tomllib,
    # which needs Python 3.11 or later.
    package = re.search(r"^\[package\]$(.*?)(?=^\[|\Z)", cargo_toml, re.M | re.S)
    version = package and re.search(r'^version\s*=\s*"([^"]+)"', package.group(1), re.M)
    if not version:
        sys.exit("stdlib.md.py: no [package] version in Cargo.toml")
    return version.group(1)


if len(sys.argv) != 3:
    sys.exit("usage: stdlib.md.py <simplicityhl-std checkout> <tag>")
checkout, tag = sys.argv[1], sys.argv[2]

version = package_version(git_show(checkout, tag, "Cargo.toml"))
if tag.startswith("v") and tag[1:] != version:
    sys.exit("stdlib.md.py: tag {} doesn't match Cargo.toml version {}".format(tag, version))
elements = json.loads(git_show(checkout, tag, "docs/stdlib.json"))

preamble = """# SimplicityHL standard library reference
<!-- Generated from BlockstreamResearch/simplicityhl-std {tag} docs/stdlib.json by stdlib.md.py on {date} -->

The SimplicityHL standard library provides various functions useful in developing [smart contracts](../glossary.md#smart-contract). This reference describes `simplicityhl-std` {version}.

Here is a complete list of the available library functions, their [type signatures](../simplicityhl-reference/type.md), and a description of what they do.

Some library functions can panic. Their descriptions include a **Panics** note that gives the condition. A panic makes the program fail, so the [transaction](../glossary.md#transaction) is invalid and doesn't confirm. The `assert_*` functions return `()` and exist only for this effect.

For more built-in SimplicityHL functions, see the [jets reference](jets.md).

## Using the library in SimplicityHL projects with Simplex

In an existing [Simplex](simplex.md) project, install the standard library by running:

```bash
simplex install std
```

This adds an entry to the project's `Simplex.toml` with a standard library dependency. The functions listed below are then available under the alias `std`, for example:

```simplicityhl
use std::lib::u32::math::add_32;
```

See [Modules](modules.md#using-the-standard-library-with-simplex) for more on the module and import system used here.
""".format(tag=tag, version=version, date=datetime.datetime.now().date().isoformat())

print(preamble)

def new_section(section_name, introduction = ""):
    template = """
## {}

{}

???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |"""
    return template.format(section_name, introduction)

def format_jet(name, i, o, desc):
    # stdlib.json records a function that takes no arguments with
    # input_type "()"; show it as name() rather than name(()).
    if i == "()":
        i = ""
    return "    | `{}({}) -> {}` | {} |".format(name, i, o, desc)

section = ""
for jet in elements:
    jet["description"] = description_to_cell(jet["description"])
    if "deprecated" in jet and jet["deprecated"]:
        continue
    this_section = jet["section"]
    if this_section != section:
        print(new_section(this_section))
        section = this_section
    print(format_jet(jet["simplicityhl_name"], jet["input_type"], jet["output_type"], jet["description"]))

footer = """
"""

print(footer)
