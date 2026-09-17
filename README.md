## Simplicity Docs

This is the static site generator for https://docs.simplicity-lang.org. We aim to make usable, up-to-date documentation and welcome suggestions and updates via a pull request.

The site is built on [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) which includes some [nice formatting options](https://squidfunk.github.io/mkdocs-material/reference/).

Realtime preview of documentation changes (preferably inside a Python3 virtualenv):
```bash
# Install dependencies
pip install -r requirements.txt

# Serve locally with hot reload
mkdocs serve

# Build for production
python -m mkdocs build
```

## WebMCP search

Browsers that expose WebMCP receive one tool, `search_docs`, with a required
`query` string (1–500 characters). It uses Material's existing search index and
worker, returns up to ten sections with plain-text excerpts and URLs, and displays
the query in the normal search UI. Unsupported browsers keep normal search.
No server, API key, or additional search dependency is needed.

The integration supports `document.modelContext` and the earlier
`navigator.modelContext` location. It loads once per document and survives
Material's instant navigation. Each invocation owns a worker, which is terminated
on completion, failure, cancellation, or the 15-second timeout.

Run the regression check with `node --test tests/webmcp.test.cjs`. For browser
validation, serve the built site over localhost, discover `search_docs` with a
WebMCP-capable browser, and try `timelock`, `eq_32`, and an unmatched query.
Check that result links work from nested pages, the 404 page, and after instant
navigation. To test HTML extraction with the browser's real DOM parser, serve the
repository root (`python -m http.server 8001 --bind 127.0.0.1`) and open
`http://127.0.0.1:8001/tests/webmcp-browser.html`; the page must report PASS.
This fixture tests markup removal, entities, and whitespace. Material's generated
search excerpts can still omit surrounding context; follow result links for full
definitions and warnings.

## Runnable SimplicityHL code snippets

See [`RUNNABLE_SNIPPETS.md`](RUNNABLE_SNIPPETS.md) for how to add an editable, runnable
SimplicityHL example to a page.

## SimplicityHL lexer

There is a separate syntax highlighting module for SimplicityHL in
`hooks/` which can be invoked with a ```simplicityhl code fence. Currently
it falls back to Rust syntax highlighting rules, but it can be extended if
the SimplicityHL syntax diverges from Rust's in an important way in the
future.

This module also works around a bug where Markdown annotations like // (1)!
didn't work at all at the end of a // comment line.
