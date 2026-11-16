"""Add a "Source:" line under each page heading in llms-full.txt.

The llms-source plugin joins every page into llms-full.txt under a
``### <nav title>`` heading, without saying where each page lives. An agent
that greps the file then can't tell which page a matching line came from, and
can't resolve the page's relative links. This hook rewrites the file after the
plugin writes it, adding the URL of the page's Markdown source below each
heading.

It reads the plugin's private ``_sections`` attribute, so recheck it after
upgrading mkdocs-llms-source. If the plugin's output format changes, the build
fails here instead of publishing a file without source lines.
"""

from pathlib import Path

from mkdocs.plugins import event_priority


@event_priority(-100)  # after the llms-source plugin has written llms-full.txt
def on_post_build(config):
    plugin = config.plugins.get("llms-source")
    if plugin is None or not plugin.config.get("full_output", True):
        return

    site_url = (config.get("site_url") or "").rstrip("/")
    path = Path(config["site_dir"]) / "llms-full.txt"
    text = path.read_text(encoding="utf-8")

    # Match each heading together with the page content after it, searching
    # forward in nav order, so that a page's own "### ..." headings can't be
    # mistaken for the heading of a later page with the same title.
    out = []
    cursor = 0
    for section in plugin._sections:
        for page in section.pages:
            if not page.markdown:
                continue
            heading = f"### {page.title}\n\n"
            block = heading + page.markdown.strip()
            at = text.find(block, cursor)
            if at < 0:
                raise RuntimeError(
                    f"llms_full_sources: can't find page {page.src_path!r} "
                    "in llms-full.txt; has the llms-source output format changed?"
                )
            out.append(text[cursor : at + len(heading)])
            out.append(f"Source: {page.md_url(site_url)}\n\n")
            out.append(block[len(heading) :])
            cursor = at + len(block)
    out.append(text[cursor:])

    path.write_text("".join(out), encoding="utf-8")
