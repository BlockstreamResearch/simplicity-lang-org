#!/usr/bin/env python3

# Suggested by Gemini as a way to add the { data-preview } to cause
# glossary entries to render appropriately whenever they are linked
# in glossary.md.

import re

def on_page_markdown(markdown, page, config, files):
    # This regex matches:
    # 1. [Link Text]
    # 2. (Any path that ends in glossary.md#some-anchor)
    # 3. Negative lookahead to ensure we don't add { data-preview } if it's already there

    open("/tmp/foobaz", "w").write("hello")
    
    pattern = r'(\[.*?\]\((?:.*?\/)?glossary\.md#.*?\))(?!\s*\{)'
    
    # Replacement appends the attribute
    return re.sub(pattern, r'\1{ data-preview }', markdown)

