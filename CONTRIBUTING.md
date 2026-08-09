## The Goal

Ship clear, accurate docs that help real users build with **Simplicity**. If your change makes the docs easier to find, understand, or trust, you’re in the right place.

## What You Can Contribute

* New guides, tutorials, and examples
* Reference improvements
* Typos, broken links, grammar fixes
* Diagrams and architecture overviews
* Clarifications to confusing sections
* “Gotchas” and troubleshooting notes
* Working Simplicity applications and case studies

If you’re unsure it belongs here, it probably does. Submit the PR.

## Content Standards

**Write for doers.** Focus on helping users achieve their goals and build solutions successfully.

* **Be direct and precise.** Use short sentences, active voice, and exact terminology. Write with detail that expert adopters expect, but remain accessible by avoiding unexplained jargon.
* **Keep it grounded.** Don't exaggerate, oversimplify, or use slang. Avoid casual crypto hype and generic marketing fluff; let the technology speak for itself.
* **Front‑load the “how”.** Show a working snippet before deep theory.
* **One idea per section.** If your page does too much, split it.
* **Name things consistently.** Match code, error messages, and UI.
* **Show, don’t tell.** Prefer runnable examples to paragraphs.
* **Call out risk.** Use “⚠️” notes for foot‑guns and security pitfalls.
* **Cite sources** for claims and specs where useful.
* **Focus on technology, not the author.** Avoid the first person (I, we, our).

### Formatting

* English (US), Markdown only.
* Headings: `# H1`, `## H2`, `### H3` (don’t skip levels).
* Code fences with language tags: \`\`\`rust, \`\`\`bash, \`\`\`json, etc.
* File/command names as `code` inline.
* Use lists, tables, and callouts for scan‑ability.
* Prefer [Mermaid](https://github.blog/developer-skills/github/include-diagrams-markdown-files-mermaid/) diagrams/flowcharts.
* You can use [other Material for MkDocs features and extensions](https://squidfunk.github.io/mkdocs-material/reference/) for tables, math, etc. Follow their recommended configuration, syntax, and approach wherever possible.

### Examples

* Keep examples **minimal** and **correct**.
* Prefer full, copy‑pasteable blocks over fragments.

### Dependencies

Avoid assuming a particular operating system or environment.

If an example needs setup or relies on a tool, include it (or link to it).

### Runnable examples

Add `,run` to a `simplicityhl` fence and the reader can edit and execute it in the
browser. Works on any page, including inside admonitions and collapsible blocks.

````markdown
```simplicityhl,run title="A program that succeeds"
fn main() {
    assert!(jet::eq_32(2, 2));
}
```
````

Flags, comma- or space-separated, in any order:

| Flag | Effect |
| --- | --- |
| `run` | required — without it the fence stays a plain code block |
| `title="…"` | caption above the editor |
| `readonly` | show **Run** but forbid editing |
| `tx` | run against a real Liquid testnet transaction, so introspection jets return true values. Adds a txid field and an input selector |
| `txid="…"` | the transaction to prepopulate for a `tx` snippet |
| `input=N` | preselect input `N` in a `tx` snippet's selector |
| `expect=compile-error` | this snippet is meant not to compile |
| `expect=run-error` | this snippet is meant to compile and then fail |

Every runnable snippet is executed by `npm run test:snippets`, which fails the build if one
stops behaving as its `expect` says. CI runs it on every PR. A deliberately broken example
is fine — that is what `expect=` is for — but say so in the prose too.

To try snippets locally you need the compiler, which is a gitignored build artifact rather
than a checked-in binary. Once per clone:

```bash
npm run build:wasm     # needs Rust + wasm-pack; see crates/simplicity-runner/README.md
```

Without it the page renders fine and only **Run** fails, so prose-only edits need nothing.

### Audiences

Consider various audiences' perspectives:

**Bitcoin Developer**

**Background**: Familiar with Bitcoin fundamentals, at least basic architecture and use cases, possibly ranging to advanced Bitcoin Script. The primary goal for this user is to build more expressive apps or smart contracts natively on Bitcoin/Liquid.

**Key questions**: What are smart contracts and covenants, anyway? How do these things relate to the existing Bitcoin tools and wallet structures I already know?

**Solidity / Ethereum Web3 Developer**

**Background**: Experienced with smart contracts (like EVM/Solidity) but new to the Bitcoin ecosystem. This developer understands decentralization and digital assets, but has major gaps regarding the UTXO model.

**Key questions**: Where are the equivalents to the tools I'm used to? How do I adapt my thinking from an account-based model to a UTXO-based model?

**Trad-Fi Engineer**

**Background**: A software developer from traditional finance. This engineer deeply understands financial logic, legacy systems, and compliance, but is new to blockchain development and smart contracts.

**Key questions**: How does traditional financial logic actually get translated into an on-chain covenant? How do I securely integrate this with my existing stack?

**Product Architect**

**Background**: Focused on business development and product design. While not writing the code directly, this architect needs a clear conceptual understanding of the technology's capabilities and limitations to design new financial apps.

**Key questions**: What is conceptually possible with this technology? How do I design a financial application in terms of covenant-managed assets and transactions?

**Thanks for making the Simplicity docs better.**
