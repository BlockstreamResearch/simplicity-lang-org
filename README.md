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
Check that result links work from nested pages and after instant navigation.
