# Agent documentation experiments

Each directory is one run of an AI agent testing whether the Simplicity
documentation gets a developer to a working result. Directories are named
`YYYY-MM-DD-<model>-<test>[-N]`:

- `YYYY-MM-DD` is the date the run started, in US Pacific time.
- `<model>` is the Claude model that performed the run, from its model ID
  (`claude-sonnet-5` becomes `sonnet-5`).
- `<test>` names the test that was run (see [Tests](#tests)).
- `-N` numbers runs that would otherwise share a name.

## Runs

| Run | Model | Test | Committed logs and reports | Original location | Session |
| --- | --- | --- | --- | --- | --- |
| `2026-09-16-sonnet-5-allowance-app` | `claude-sonnet-5` | allowance-app | `README.md`, `logs/*.md`, `docs-notes/*.md`, `EXTERNAL-REVIEW-prompt-v2-suggestions.md` (written by a separate reviewing session) | `~/src/simplicity-dev-experiment-1` | `13dbab52` |
| `2026-09-21-sonnet-5-ecosystem-coverage` | `claude-sonnet-5` | ecosystem-coverage | `audit-log.md` | `~/src/slo2/ecosystem-doc-audit` | `e5c9380c` |
| `2026-09-23-haiku-4-5-ecosystem-coverage` | `claude-haiku-4-5-20251001` | ecosystem-coverage | `AUDIT_REPORT.md`, `EXPERIMENT_LOG.md`, `FRICTION_LOG.md` | `~/simplicity-docs-eval` | `408a7d7f` |
| `2026-09-23-opus-5-ecosystem-coverage` | `claude-opus-5` | ecosystem-coverage | `README.md`, `audit-log.md` | `~/src/slo2/ecosystem-doc-audit-2026-09-23` | `23be6c4d` |
| `2026-09-23-sonnet-5-ecosystem-coverage` | `claude-sonnet-5` | ecosystem-coverage | `audit-log.md` | `~/src/slo2/ecosystem-doc-audit-2026-09-23-sonnet5` | `e6c00a3b` |
| `2026-10-07-sonnet-5-howto-test-1` | `claude-sonnet-5` | howto-test | `REPORT.md` (extracted from the transcript) | none; ran in `~/src/simplicity-dev-experiment-1/howto-standalone` | `df12a8b7` |
| `2026-10-07-sonnet-5-howto-test-2` | `claude-sonnet-5` | howto-test | `REPORT.md` (extracted from the transcript) | `~/src/allowance-howto-test` | `3ea34a3b` |
| `2026-10-21-opus-5-5-ecosystem-coverage` | `claude-opus-5-5` | ecosystem-coverage, with the allowance HOWTO draft | `README.md`, `REPORT.md`, `AUDIT.md`, `LOG.md` | `~/src/slo2/allowance-docs-audit-2026-10-21` | `7baa1054` |
| `2026-10-21-opus-5-5-howto-test` | `claude-opus-5-5` | howto-test | `log/TEST-LOG.md` | `~/src/allowance-howto-test-opus55-20261021` | `618bba28` |

The session column gives the first eight characters of the Claude Code session ID.

## Tests

- **allowance-app**: build a small two-party app around the `allowance.simf`
  covenant from the documentation homepage, from the task in the run's `prompt`
  file.
- **ecosystem-coverage**: the end-to-end test plan in
  `tests/ecosystem-documentation-coverage.md` on the `main` branch.
- **howto-test**: follow the allowance HOWTO draft as a new reader and report
  where it fails. The draft's source is maintained outside this repository, and
  `docs/getting-started/allowance-howto/` holds a published copy.

## What is committed

Only the Markdown logs and reports listed in the table are committed. Each run
directory also holds, locally and ignored by `.gitignore`:

- everything else the run produced or downloaded, such as artifacts, build
  trees, fetched pages, and testnet wallet files;
- `session-transcripts/`, the Claude Code session transcript;
- `original-repo.bundle`, the full history of the run's own git repository,
  where it had one.

To commit another file, add a whitelist line for it to `.gitignore`. To browse a
run's original history:

```bash
git clone experiments/<run>/original-repo.bundle /tmp/<run>-history
```
