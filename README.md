## Simplicity Docs

This is the static site generator for https://docs.simplicity-lang.org. We aim to make usable, up-to-date documenation and welcome suggestions and updates via a pull request.

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

See [`RUNNABLE_SNIPPETS.md`](RUNNABLE_SNIPPETS.md) for how to add an editable, runnable
SimplicityHL example to a page.
