#!/usr/bin/env python3

# This consumes stdlib.json
# and generates docs/documentation/stdlib.md.

# Adapted from jets.md.py
# (still uses internal variables referring to jets!)

import datetime
import json
import re
import sys

preamble = """# SimplicityHL standard library reference
<!-- Generated from {} by jets.md.py on {} -->

The SimplicityHL standard library provides various functions useful in developing smart contracts.

Here is a complete list of the available library functions, their <a href="../../simplicityhl-reference/type/">type signatures</a>, and a description of what they do.

Some library functions can fail or panic. This allows a Simplicity program to refuse a proposed transaction by performing a mandatory assertion; these functions' return type is `()` below. The failure or panic effect produced by these functions, or the corresponding behavior of jets, is ultimately the *only* way to decline a transaction.

For more built-in SimplicityHL functions, see the [jets reference](../documentation/jets).
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
    return "    | `{}({}) -> {}` | {} |".format(name, i, o, desc)

section = ""
for jet in elements:
    jet["description"] = re.sub("\\n", "<br>", jet["description"])
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
