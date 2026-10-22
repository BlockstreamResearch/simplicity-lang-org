# Allowance docs-coverage audit, 2026-10-21

An end-to-end documentation audit following the test plan in the
simplicity-lang-org repository, `tests/ecosystem-documentation-coverage.md`, with
particular attention to the draft at
<https://docs.simplicity-lang.org/getting-started/allowance-howto/HOWTO/>.

- `LOG.md`: chronological action log, with reasoning, written as the test runs.
- `AUDIT.md`: the Documentation Audit Log (one row per finding).
- `REPORT.md`: the required output structure (sections 0 to 5).
- `artifacts/`: produced code and specs, each annotated with SOURCE / CONFIDENCE.
- `pages/`: raw copies of the doc pages as fetched, for quoting.
- `downloads/`: repositories and files that a doc page told the reader to fetch.
- `fetch.py`: the fetcher used for `pages/`.

Executed by Claude Code (Claude Opus 5.5) on behalf of Seth Schoen.

## Downloads

`downloads/` is gitignored. Recreate with `git clone https://github.com/BlockstreamResearch/simplicity-demo downloads/simplicity-demo` (audited at commit 7864241).
