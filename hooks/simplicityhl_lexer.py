"""Register `simplicityhl`/`simf` as Pygments lexer aliases.

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
instead of just passing the functionality through to it. Currently this
does not do that, relying entirely on RustLexer.

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
"""

from __future__ import annotations

from pygments.lexers import LEXERS
from pygments.lexers.rust import RustLexer

#: Must match this file's own entry in `mkdocs.yml`'s `hooks:` list.
_MODULE_NAME = "hooks/simplicityhl_lexer.py"


class SimplicityHLLexer(RustLexer):
    name = "SimplicityHL"
    aliases = ["simplicityhl", "simf"]
    filenames = ["*.simf"]
    mimetypes = ()


__all__ = ["SimplicityHLLexer"]

LEXERS["SimplicityHLLexer"] = (
    _MODULE_NAME,
    SimplicityHLLexer.name,
    tuple(SimplicityHLLexer.aliases),
    tuple(SimplicityHLLexer.filenames),
    tuple(SimplicityHLLexer.mimetypes),
)
