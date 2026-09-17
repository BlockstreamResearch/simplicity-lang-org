r"""Register `simplicityhl`/`simf` as Pygments lexer aliases.

SimplicityHL syntax is Rust-derived, and the runnable-snippet editor
and its associated plugin already highlight runnable SimplicityHL
snippets when annotated as `simplicityhl,run`. This trivial plugin
gives static fences (without `run`) highlighting support, so that
documentation can write

    ```simplicityhl
    fn main() { ... }
    ```

and get highlighting instead of pretending the code is Rust with
```rust, or falling back to an unhighlighted plain-text block (which
would otherwise happen by default for an unregistered code fence type).

This is also useful in case the desired syntax highlighting ever
diverges significantly from Rust. There are many minor reasons that this
could happen with new SimplicityHL language features, and we can choose to
handle them individually as they occur by overriding/extending RustLexer
instead of just passing the functionality through to it. Currently the
only such override is the annotation-marker split described below.

Registration goes through `pygments.lexers.LEXERS` rather than a proper
installed package with a `pygments.lexers` entry point, because this repo
loads hooks as ad hoc files (see `mkdocs.yml`'s `hooks:` list) with no
importable package. Pygments' lazy loader (`_load_lexers`) resolves a
registered module by feeding its name straight to `__import__`, which
checks `sys.modules` before touching the filesystem — and MkDocs already
populates `sys.modules[name]` for every hook file, keyed by the exact
string used in `hooks:` (see `Hooks._load_hook` in
`mkdocs/config/config_options.py`). So the module name registered below
must match this file's `hooks:` entry exactly.

Splitting a trailing annotation marker into its own comment token
-------------------------------------------------------------------

Material for MkDocs code annotations (`content.code.annotate`, see
`# (1)!`-style markers in fenced code) are matched client-side against the
*rendered* DOM: `bundle.js` scans each syntax-highlighting token's text
node for `/(\(\d+\))(!)?/` and, on a match, overwrites that whole text
node's content with just the digits before swapping in the annotation
icon (function `Xa` in `material/templates/assets/javascripts/bundle.*.js`
as of mkdocs-material 9.7.2). That is harmless when the marker's token
contains nothing else, which is automatically true whenever it follows
real code, since Pygments always tokenizes trailing-comment text as its
own token separate from the preceding code tokens. It is destructive when
the marker shares a token with real prose, which happens whenever an
annotation marker is appended to the end of a full comment line: Rust's
(and so SimplicityHL's) `//` line comments are lexed as one token per
physical line (`//(.*?)\n`), so `// explanation.// (1)!` becomes a single
token and the whole explanation gets wiped, not just the marker.

`RustLexer`'s `base` state is patched below to special-case this: a rule
inserted immediately ahead of the stock single-line-comment rule matches
`(//.*?)(//\s*\(\d+\)!\n)` and emits the two halves as separate tokens via
`bygroups`, so the descriptive text and the marker land in separate DOM
text nodes on the same rendered line — exactly like a marker following
real code already does — while ordinary comments and `///`/`//!` doc
comments (checked earlier in the rule list and thus still take priority)
are untouched.

The two halves deliberately get *different* token types (`Comment.Single`
for the text, `Comment.Special` for the marker) rather than both being
`Comment.Single`. Pygments' `HtmlFormatter` coalesces adjacent tokens of
the same type into a single `<span>` when rendering (a normal
size/output optimization), which would silently undo the split — the
marker would end up back in the same DOM text node as the prose, right
where this whole workaround started. Giving it a different token type
is invisible to a reader (the annotation JavaScript replaces the marker
text with an icon before anyone would notice its highlighting color),
but stops the formatter from merging it back into the preceding span.

This is not quite literally true of the underlying language (there's
still only one `//` construct as far as SimplicityHL itself is
concerned), but it only affects the documentation site's own syntax
highlighting, not compilation.
"""

from __future__ import annotations

from pygments.lexer import bygroups
from pygments.lexers import LEXERS
from pygments.lexers.rust import RustLexer
from pygments.token import Comment

#: Must match this file's own entry in `mkdocs.yml`'s `hooks:` list.
_MODULE_NAME = "hooks/simplicityhl_lexer.py"

#: Matches a `//`-comment line that ends in an annotation marker preceded
#: by further comment text on the same line, e.g. `// explanation.// (1)!`.
#: Captures the leading text and the marker as separate groups so they
#: become separate tokens; see the module docstring for why.
_ANNOTATION_MARKER_RE = r"(//.*?)(//\s*\(\d+\)!\n)"


class SimplicityHLLexer(RustLexer):
    name = "SimplicityHL"
    aliases = ["simplicityhl", "simf"]
    filenames = ["*.simf"]
    mimetypes = ()

    tokens = {
        **RustLexer.tokens,
        "base": [
            (_ANNOTATION_MARKER_RE, bygroups(Comment.Single, Comment.Special)),
            *RustLexer.tokens["base"],
        ],
    }


__all__ = ["SimplicityHLLexer"]

LEXERS["SimplicityHLLexer"] = (
    _MODULE_NAME,
    SimplicityHLLexer.name,
    tuple(SimplicityHLLexer.aliases),
    tuple(SimplicityHLLexer.filenames),
    tuple(SimplicityHLLexer.mimetypes),
)
