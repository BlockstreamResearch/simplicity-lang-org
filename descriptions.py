#!/usr/bin/env python3

"""Render upstream jet/library-function descriptions for a Markdown table cell.

The descriptions in elements.json and stdlib.json are rustdoc comments,
so they follow the Rust convention of a `## Panics` section (and
occasionally `## Preconditions`) with its body below. Those descriptions
end up inside a Markdown table cell, where only *inline* syntax is
processed: a `## Panics` line renders as the literal characters `##
Panics`, and a `- ` or `1. ` list renders with its literal markers
showing. Both look wrong on the page.

This module keeps the upstream wording verbatim and changes only how it
is presented: a section heading becomes a warning-styled label, and a
list becomes a real HTML list (nested where the source nests). Nothing
block-level is emitted, so the result stays valid inside a table cell.
"""

import re

# Rustdoc section headings, as they appear upstream, mapped to the label
# used on the rendered page. The label is a quiet chip and carries no
# warning sign: as the jets reference explains in its own introduction,
# a panic is the *only* way for a Simplicity program to decline a
# transaction, so every useful program must trigger one somewhere. These
# sections document the mechanism by which a program enforces its rules,
# not a hazard to avoid, and most of the functions listed have one. The
# chip is styled in docs/stylesheets/extra.css. A heading not listed
# here falls back to a plain bold label.
SECTION_LABELS = {
    "Panics": '<span class="panics">Panics</span>',
    "Preconditions": '<span class="panics">Preconditions</span>',
}

HEADING = re.compile(r"\A#+\s+(\S.*?)\s*\Z")
# A list item, capturing its indent (which carries the nesting) and
# whether the marker is a bullet or a number.
LIST_ITEM = re.compile(r"\A(\s*)(?:(?P<bullet>[-*])|\d+\.)\s+(?P<text>\S.*?)\s*\Z")


def _list_items(lines):
    """Return (indent, tag, text) per line, or None if any line is not an item."""
    items = []
    for line in lines:
        m = LIST_ITEM.match(line)
        if not m:
            return None
        tag = "ul" if m.group("bullet") else "ol"
        items.append((len(m.group(1)), tag, m.group("text")))
    return items


def _render_list(items, pos, indent):
    """Render items[pos:] at this indent level; return (markup, next position)."""
    tag = items[pos][1]
    texts = []
    while pos < len(items) and items[pos][0] >= indent:
        if items[pos][0] > indent:
            # A deeper item belongs inside the item that introduced it.
            nested, pos = _render_list(items, pos, items[pos][0])
            texts[-1] += nested
            continue
        texts.append(items[pos][2])
        pos += 1
    return (
        "<{0}>{1}</{0}>".format(tag, "".join("<li>{}</li>".format(t) for t in texts)),
        pos,
    )


def _as_html_list(lines):
    """Return list markup if these lines are entirely one list, else None."""
    items = _list_items(lines)
    if not items:
        return None
    markup, pos = _render_list(items, 0, items[0][0])
    # A trailing position short of the end means the block was not a clean
    # tree (an item shallower than the first); leave it alone rather than guess.
    return markup if pos == len(items) else None


def description_to_cell(description):
    """Convert a rustdoc description into Markdown safe for a table cell."""
    out = ""
    separator = ""  # nothing precedes the first block
    for block in re.split(r"\n\s*\n", description.strip()):
        lines = [line.rstrip() for line in block.strip("\n").split("\n")]

        heading = HEADING.match(lines[0].strip())
        if heading:
            title = heading.group(1)
            out += separator + SECTION_LABELS.get(title, "**{}**".format(title))
            # Body text under a label wants one break, not a paragraph gap.
            separator = "<br>"
            lines = lines[1:]
            if not lines:
                continue

        # Upstream usually introduces a list with a lead-in line and no blank
        # line after it, so the text and the list share one block.
        first_item = next(
            (i for i, line in enumerate(lines) if LIST_ITEM.match(line)), len(lines)
        )
        rendered = _as_html_list(lines[first_item:]) if first_item < len(lines) else None
        text = lines if rendered is None else lines[:first_item]

        if text:
            out += separator + "<br>".join(line.strip() for line in text)
            separator = "<br><br>"
        if rendered is not None:
            # A real HTML list separates itself from its surroundings.
            out += rendered
            separator = ""

    return out
