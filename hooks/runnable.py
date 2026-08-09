"""Turn annotated SimplicityHL fences into runnable snippets.

Authoring contract — this is the whole thing:

    ```simplicityhl,run
    fn main() {
        assert!(jet::eq_32(2, 2));
    }
    ```

Meta flags, comma- or space-separated, in any order:

    run        make it runnable (required; without it the fence stays a plain code block)
    readonly   show Run but forbid editing
    title="…"  caption above the editor
    tx         run against a real Liquid testnet transaction instead of a placeholder
               environment, so transaction-introspection jets return true values. Adds a
               txid field and an input selector above the editor.
    txid="…"   the transaction to prepopulate for `tx` snippets
    input=N    preselect input N in the selector of a `tx` snippet
    expect=…   `compile-error` or `run-error`. Ignored here; it tells the test harness in
               `crates/simplicity-runner` that this snippet is meant to fail, and how.

The emitted HTML is inert: the source lives in a ``<textarea>``, so with JavaScript
disabled or still loading the reader sees the code as plain text rather than an empty
box. ``docs/javascripts/runnable.js`` upgrades each shell into an editor on the client.

Structurally this is a Python-Markdown *preprocessor*, registered from a MkDocs hook.
Both halves of that are deliberate:

* A preprocessor, not a plain ``on_page_markdown`` text rewrite, because the shell has
  to reach the output as raw HTML. Substituting the HTML directly works at the top
  level but is torn apart the moment a snippet is indented inside an admonition or a
  list. Handing it to ``md.htmlStash`` instead leaves a single placeholder token on the
  line, which survives block parsing at any indentation — exactly the mechanism fenced
  code blocks themselves rely on.
* Registered from a hook, not named in ``markdown_extensions``, because a hook is
  referenced by file path and so needs no importable package and no ``sys.path``
  juggling.

Priority 27 puts it just above ``fenced_code``/``superfences`` (25), so runnable fences
are claimed before the ordinary fence handlers see them; every other fence is left
untouched and highlights as usual.
"""

from __future__ import annotations

import re

from markdown.extensions import Extension
from markdown.preprocessors import Preprocessor

#: Languages that may carry a `run` flag.
LANGUAGES = {"simplicityhl", "simf"}

#: An opening fence: three or more backticks or tildes, plus its info string.
_FENCE_OPEN = re.compile(r"^(?P<indent>[ \t]*)(?P<fence>`{3,}|~{3,})(?P<info>.*)$")

#: Fence meta tokens. The `key="value"` alternative must come first: a bare `[^\s,"]+`
#: would otherwise match `title=` and stop at the quote, orphaning the value.
_TOKEN = re.compile(r'[^\s,"]+="[^"]*"|[^\s,"]+')

_KEYED = re.compile(r'^([a-z-]+)="?([^"]*)"?$', re.IGNORECASE)


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _parse_meta(meta: str) -> tuple[set[str], dict[str, str]]:
    """Split a fence's meta string into bare flags and `key=value` pairs."""
    flags: set[str] = set()
    values: dict[str, str] = {}
    for token in _TOKEN.findall(meta):
        keyed = _KEYED.match(token)
        # `expect=…` is a flag consumed by the snippet test harness upstream, not a
        # value the shell carries.
        if keyed and keyed.group(1).lower() != "expect":
            values[keyed.group(1).lower()] = keyed.group(2)
        else:
            flags.add(token.lower())
    return flags, values


def _shell(source: str, flags: set[str], values: dict[str, str]) -> str:
    """Render the inert HTML for one runnable snippet."""
    readonly = "readonly" in flags
    use_tx = "tx" in flags
    title = values.get("title")
    txid = values.get("txid", "")
    preselect = values.get("input", "")

    caption = f'<figcaption class="rn-title">{_escape(title)}</figcaption>' if title else ""

    # The transaction bar. Rendered inert; runnable.js fetches and populates it. The
    # `<select>` starts disabled because there are no inputs to choose until a
    # transaction has actually loaded.
    if use_tx:
        txbar = (
            '<div class="rn-txbar">'
            '<label class="rn-txfield">'
            "<span>Transaction</span>"
            '<input type="text" spellcheck="false" data-simplicity-txid '
            f'placeholder="Liquid testnet txid" value="{_escape(txid)}">'
            "</label>"
            '<button type="button" class="rn-button" data-simplicity-load>Load</button>'
            '<label class="rn-txfield">'
            "<span>Input</span>"
            "<select data-simplicity-input disabled><option>—</option></select>"
            "</label>"
            '<span class="rn-txstatus" data-simplicity-txstatus></span>'
            "</div>"
        )
    else:
        txbar = ""

    tx_attrs = ""
    if use_tx:
        tx_attrs = " data-simplicity-tx"
        if preselect:
            tx_attrs += f' data-simplicity-input-index="{_escape(preselect)}"'

    # `</textarea>` inside the source would close the element early. It cannot occur in
    # valid SimplicityHL, but escaping `<` defends against it regardless.
    rows = len(source.split("\n"))

    return "".join(
        [
            f'<figure class="rn" data-simplicity-runnable '
            f'data-simplicity-readonly="{str(readonly).lower()}"{tx_attrs}>',
            caption,
            txbar,
            f'<textarea data-simplicity-source class="rn-fallback" rows="{rows}" readonly>'
            f"{_escape(source)}</textarea>",
            '<div class="rn-editor" data-simplicity-editor hidden></div>',
            '<div class="rn-actions">',
            '<button type="button" class="rn-button rn-button--run" data-simplicity-run>Run</button>',
            '<button type="button" class="rn-button" data-simplicity-reset>Reset</button>',
            '<span class="rn-hint">Edit the code, then Run (Ctrl+Enter)</span>',
            "</div>",
            '<div class="rn-output" data-simplicity-output hidden></div>',
            "</figure>",
        ]
    )


class RunnablePreprocessor(Preprocessor):
    """Replace every runnable fence, leaving all other fences to the usual handlers."""

    def run(self, lines: list[str]) -> list[str]:
        # Cheap bail-out: most pages have no snippets at all.
        if not any(language in line for line in lines for language in LANGUAGES):
            return lines

        out: list[str] = []
        index = 0

        while index < len(lines):
            opening = _FENCE_OPEN.match(lines[index])
            if not opening:
                out.append(lines[index])
                index += 1
                continue

            fence = opening.group("fence")
            indent = opening.group("indent")
            info = opening.group("info")

            # Find the matching close: same character, at least as long, nothing else on
            # the line. An unterminated fence runs to the end of the document, which is
            # what Markdown itself does.
            closer = re.compile(rf"^[ \t]*{re.escape(fence[0])}{{{len(fence)},}}[ \t]*$")
            end = index + 1
            while end < len(lines) and not closer.match(lines[end]):
                end += 1

            # `lang` is the first token; ```simplicityhl,run puts "simplicityhl,run"
            # there, so split the language off the front and treat the rest as meta.
            language, _, rest = info.strip().partition(",")
            flags, values = _parse_meta(rest)

            if language.strip().lower() in LANGUAGES and "run" in flags:
                body = lines[index + 1 : end]
                # Strip the fence's own indentation from the source so a snippet nested
                # in an admonition or a list still compiles.
                source = "\n".join(
                    line[len(indent) :] if line.startswith(indent) else line
                    for line in body
                )
                placeholder = self.md.htmlStash.store(_shell(source, flags, values))
                # Blank lines around it, and the fence's own indentation in front, so the
                # placeholder is a block of its own and stays inside whatever container
                # the fence was written in.
                out.extend(["", indent + placeholder, ""])
            else:
                out.extend(lines[index:end])
                if end < len(lines):
                    out.append(lines[end])

            index = end + 1

        return out


class RunnableExtension(Extension):
    def extendMarkdown(self, md):
        md.preprocessors.register(RunnablePreprocessor(md), "simplicityhl_runnable", 27)


def on_config(config):
    # `mkdocs serve` rebuilds against a fresh config each time, but guard anyway so a
    # repeated call cannot stack duplicate preprocessors.
    if not any(isinstance(ext, RunnableExtension) for ext in config.markdown_extensions):
        config.markdown_extensions.append(RunnableExtension())
    return config
