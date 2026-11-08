---
name: review-docs
description: Review finished documentation changes against .github/documentation-review.md.
argument-hint: "[page path | PR number | commit range]"
disable-model-invocation: false
---

Read `.github/documentation-review.md` and follow it to review: $ARGUMENTS

If no target is given, review the pages under `docs/` that the current branch adds or changes relative to `main`. Report the review in the output format the file specifies. Don't edit any files unless asked.

## Classifying first

Before any sweep starts, do the review file's Classification step yourself: choose the page's primary Diátaxis type, or note that it gets a reduced review. Which checklist items apply depends on the type, so give the classification to every sweep, and tell the sweeps to use it rather than classify the page again. If you can't settle on one type, record that as a structural problem, choose the closer type, and say so in the report.

## Choosing how to split the review

Sweeps exist for completeness: a single pass over a long page reports only the failures it happens to notice. How much splitting that needs depends on the page type and length. Choose by this table:

| Page | Plan |
| --- | --- |
| Reduced review (landing page, news, glossary, generated reference) | One pass, by you, without subagents |
| Reference or explanation, any length | Two sweeps: **Content** and **Line-level** |
| Tutorial or how-to guide, under about 400 lines with few commands | Two sweeps: **Content** and **Line-level** |
| Tutorial or how-to guide, about 400 lines or more, or with many commands to run | The six sweeps below |
| Any page, when the user asks for the full split | The six sweeps below |

Tutorials and how-to guides get the full split because items 2, 3, 5, 10 and 11 apply to every step and command, and on a long procedure those findings are numerous and easy to miss. On reference and explanation pages most of those items are N/A, and the remaining work is mainly line-level.

The two-sweep plan:

| Sweep | Covers |
| --- | --- |
| Content | Items 1 to 6, 8, and 10 to 13 |
| Line-level | Items 7 and 9, all of `.claude/rules/terminology.md` and `.claude/rules/contentstyle.md`, and every rule in the **Formatting** section of `CONTRIBUTING.md` |

The six-sweep plan:

| Sweep | Covers |
| --- | --- |
| Structure | Items 1, 2, 3, and 12 |
| Procedure | Items 4, 5, 6, 8, 10, and 11 |
| Terminology | Item 7, the glossary-link rule in item 9, and all of `.claude/rules/terminology.md` |
| Style | The rest of item 9, and all of `.claude/rules/contentstyle.md` |
| Accuracy | Item 13 |
| Formatting | Every rule in the **Formatting** section of `CONTRIBUTING.md` |

Run each sweep as its own subagent, all in parallel. Give each subagent the page path, the path of the review file, the page's classification, its sweep's scope, and these instructions:

* Read the whole page, then go through it section by section from top to bottom.
* Report every instance of every failure in scope, with a quote and its line number. Don't stop at examples.
* For each item or rule in scope, report Pass, N/A, or Fail with the number of instances.
* Report findings only for the sweep's own scope.
* Don't edit any files.

A single pass follows the same instructions: go through the page once per item or rule group, rather than trying to check everything in one read.

Then merge the results. Remove duplicates, fill in the **Coverage** table, and assign the verdict yourself according to the review file. If a sweep reports a rule as passing but another sweep quotes a violation of it, recheck that rule against the page before reporting.

## A record of settled decisions

If the user names a file of settled editorial decisions for the page, give its path to every sweep, with these rules:

* Don't report a finding that an entry settles as a failure.
* List it under **Skipped because of the decisions record** only if it's a finding you would otherwise have reported, because it fails a checklist item or rule in your scope. Don't list a place just because an entry applies to it. A link the record confirms is correct, which you wouldn't have flagged anyway, isn't a skipped finding.
* For each skipped finding, give the line number, a short quote, and the heading of the entry that settles it.
* If you have a substantive argument for reopening an entry, list it under **Decisions to reconsider** with that argument. Don't list an entry there without one. These don't count as failures.

In the merged report, add both sections after **Advisory**. Open the skipped section with the number of skipped findings after removing duplicates.

Record the commit you reviewed with `git rev-parse --short HEAD`, and note "working tree" if the page has uncommitted changes.

Never report a Pass unless it comes from this full review of the page's current text. When asked whether some edits fixed earlier findings, answer that question, and say that a Pass needs a fresh `/review-docs` run.
