# Live documentation-site regression reproduction

Checked against `https://docs.simplicity-lang.org/` on 2026-09-17.

Issue [#60](https://github.com/BlockstreamResearch/simplicity-lang-org/issues/60) already documents the original five broken links. This note records the additional live failures found during the same crawl, plus the 404-report UX defect.

## 404 report contains the wrong URL

1. Open `https://docs.simplicity-lang.org/live-audit-missing-page/`.
2. Scroll to **Think this link is broken? Let us know on GitHub**.
3. Open the GitHub link without submitting an issue.
4. Inspect the prefilled issue body.

Expected:

```text
404 Error at URL: https://docs.simplicity-lang.org/live-audit-missing-page/
```

Actual:

```text
404 Error at URL: /.
```

## ALT quickstart track links

1. Open `https://docs.simplicity-lang.org/getting-started/ALT-quickstart/`.
2. Click each of the **Rust**, **Bash / CLI**, and **Python** track links.
3. The links resolve to these paths:

   - `/getting-started/ALT-quickstart/quickstart-rust.md`
   - `/getting-started/ALT-quickstart/quickstart-bash.md`
   - `/getting-started/ALT-quickstart/quickstart-python.md`

4. Each target returns **404 - Page Not Found**.

Expected: each track opens its corresponding quickstart.

## Welcome-page documentation links

1. Open each page:

   - `https://docs.simplicity-lang.org/getting-started/welcome-bitcoin/`
   - `https://docs.simplicity-lang.org/getting-started/welcome-finance/`
   - `https://docs.simplicity-lang.org/getting-started/welcome-evm/`

2. Under **Where to go from here**, follow the general documentation link.
3. It resolves to `/documentation/`.
4. The target returns **404 - Page Not Found**.

Expected: the link opens the documentation landing page.

## Scope exclusions

The source files `anonymized-contract-implementations.md` and `anonymized-contract-recreation-set.md` were removed from this project and moved to the parent `BLOCKSTREAM/` directory. They are intentionally excluded from this report.

## Passing live behaviors

The same live check passed search, instant navigation, light/dark themes, Try It execution, page feedback, and the `/llms.txt` and `/llms-full.txt` exports.
