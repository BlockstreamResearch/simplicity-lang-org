# Information for AI agents

This is a documentation repository for the Simplicity and SimplicityHL programming language projects run by Blockstream. This repository is used to generate the [Simplicity documentation](https://docs.simplicity-lang.org/) site.

This repository uses Markdown for documentation, which is rendered using [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/). Please make contributions in line with Material for MkDocs syntax and best practices. The top-level Material for MkDocs configuration file is `mkdocs.yml`. The documentation itself is found under the `docs/` subdirectory.

If you add a completely new Markdown file on the site, you'll usually need to link it into an appropriate place within the menu structure (the `nav` section) in `mkdocs.yml` in order for site visitors to find it.

**Please see the `CONTRIBUTING.md` file at top-level for various important content guidance. Please follow this file's instructions carefully where applicable.** You can use these instructions to write your own documentation or to edit or propose edits to improve existing documentation.

As an AI agent, you don't have to invoke any form of deployment or rendering pipeline. The deployment of the site is handled automatically elsewhere.

If you create an entire pull request autonomously as an AI agent, please identify yourself in the commit messages or PR description.

## Documentation quality gate

Before proposing or merging any new or substantially rewritten page under `docs/`, run the page through the screening checklist in `.github/documentation-review.md`.

The checklist enforces Diátaxis separation (one primary type per page) and a short path from the reader’s current state to a working result. Prefer deletion and relocation over in-place rewriting when material belongs in another quadrant.

If you are creating a PR autonomously, include the screening verdict (Pass / Conditional pass / Fail) and the top priority fixes in the PR description.
