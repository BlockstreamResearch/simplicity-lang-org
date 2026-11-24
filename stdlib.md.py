#!/usr/bin/env python3

# This consumes stdlib.json
# and generates docs/documentation/stdlib.md.

# Adapted from jets.md.py
# (still uses internal variables referring to jets!)

import datetime
import json
import sys

from descriptions import description_to_cell

preamble = """# SimplicityHL standard library reference
<!-- Generated from {} by stdlib.md.py on {} -->

The SimplicityHL standard library provides various functions useful in developing [smart contracts](../glossary.md#smart-contract). This reference describes `simplicityhl-std` 0.2.0.

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
""".format(sys.argv[1], datetime.datetime.now().date().isoformat())

print(preamble)

def new_section(section_name, introduction = ""):
    template = """
## {}

{}

???+ "Click to hide"
    | <div style="width:22em">Standard library function</div> | Description |
    | ----------------------------------- | ----------- |"""
    return template.format(section_name, introduction)

elements = json.load(open(sys.argv[1]))

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
