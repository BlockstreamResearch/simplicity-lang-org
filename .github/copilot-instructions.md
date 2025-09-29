# Simplicity Documentation Site - AI Coding Assistant Instructions

## Project Overview
This is the documentation site for Simplicity, a typed functional smart contract language for Bitcoin-like blockchains. The site is built with MkDocs Material and focuses on educating developers about Simplicity's tools and implementations.

## Architecture & Key Components

### Documentation Structure
- **Root site**: Built with MkDocs Material (`mkdocs.yml` at root)
- **Content organization**: `docs/` contains markdown files with a hierarchical structure
- **Navigation pattern**: Uses Material's tabbed navigation (`navigation.tabs`) with sections like "Getting Started", "Documentation", etc.
- **Asset management**: Icons use Material Design icons (`:material-*:`) and Simple Icons (`:simple-*:`)

### Deployment Pipeline
- **Build command**: `python -m mkdocs build` (note: always use `python -m` prefix for reliability)
- **Output**: Static site generated to `site/` directory
- **Hosting**: Github Pages with build in `.github/workflows/ci.yml`
- **Dev environment**: VS Code dev container with Python 3.11 and all dependencies

## Development Workflows

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Serve locally with hot reload
mkdocs serve --dev-addr=0.0.0.0:8000

# Build for production
python -m mkdocs build
```

### Content Creation Patterns
- Use Material Design's card grids for feature showcases: `<div class="grid cards" markdown>`
- Code examples prefer SimplicityHL (Rust-like) syntax with `rust` highlighting
- Tools/implementations tables use Material icons in first column
- Navigation structure follows: Getting Started → Language Docs → Tools → Community

### Key Files & Dependencies
- `requirements.txt`: Pinned MkDocs Material 9.6.18 with specific pymdown-extensions
- `mkdocs.yml`: Extensive Material theme configuration with navigation tabs and search
- `docs/stylesheets/extra.css`: Custom styling for hero sections and cards
- `.devcontainer/`: VS Code development environment with Python + Node.js

## Project-Specific Conventions

### Content Guidelines
- **Tool recommendations**: Always promote WebIDE for beginners, SimplicityHL for development
- **External links**: Point to BlockstreamResearch GitHub organization for implementations
- **Code samples**: Use SimplicityHL syntax, not core Simplicity combinators in getting-started content
- **Navigation flow**: High-level tools → Low-level implementations progression

### Markdown Extensions
- Mermaid diagrams supported via `pymdownx.superfences` custom fences
- YouTube embeds available through custom fence format
- Admonitions and details/summary blocks extensively used
- Tabbed content for multi-language examples

### Icon Usage Pattern
- `:material-lambda:` for Haskell implementation
- `:simple-rust:` for Rust-related tools
- `:material-web:` for WebIDE
- `:material-tools:` for command-line tools
- `:material-microscope:` for formal verification (Coq)

## Writing Style

Do:

- Be precise
- Be clear
- Be instructional
- Be direct and confident
- Highlight sovereignty
- Use active voice
- Balance technical detail with clarity

Don’t:

- Don’t hype or exaggerate
- Don’t over-simplify technical concepts - respect the audience’s intelligence.
- Don’t use generic marketing fluff or managemenet-speak
