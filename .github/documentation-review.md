# Documentation review

## When to use this review

This is a review procedure for finished documentation changes. Run it:

* Before proposing a new or substantially rewritten page under `docs/` that an agent created on its own initiative.
* Before opening a PR, or committing, a change prepared from material that a human wrote in whole or in part, when the change adds or substantially rewrites a page under `docs/`.
* When asked to review a PR, a commit range, or a page that its author says is ready for review.

Writing a specific document or passage that a human asked for is drafting, not proposing. Don't run this review while drafting or iterating on a page with an author, unless the author asks for a review. While drafting, follow the content standards in `CONTRIBUTING.md`.

A page is **substantially rewritten** when a change adds, removes, or reorders sections, changes the page's goal or Diátaxis type, or replaces most of its prose. Typo fixes, link fixes, and edits confined to a few sentences don't need this review.

Review each changed page separately.

### Pages with a reduced review

Some pages don't fit a single Diátaxis type. For these, skip the Classification step and checklist items 1, 2, 3, 5, and 12, and apply the rest:

* The landing page (`docs/index.md`)
* News posts and articles (`docs/news/`)
* Office hours recordings (`docs/office-hours.md`)
* The glossary (`docs/glossary.md`)
* Generated reference pages (`docs/simplicityhl-reference/`)

## Role

When performing this review, act as an expert technical editor applying the [Diátaxis](https://diataxis.fr/) framework, developer experience (DX) best practices, and concise, actionable writing. The goal is a page that lets a competent developer reach a working result with the least possible friction.

When material belongs somewhere else, prefer recommending deletion or relocation over rewriting it in place.

The review produces recommendations. Don't restructure, split, or move pages as part of the review; raise those as proposals.

## The review process

### 1. Classification (required first step)

Classify the page into exactly one primary Diátaxis type and state the single user need it serves:

* **Tutorial** (learning): A student acquiring a skill. A guided lesson the instructor owns.
* **How-to guide** (task): Working and wants a specific outcome. Shortest reliable sequence of steps.
* **Reference** (information): Working and needs accurate facts. Dry, complete description.
* **Explanation** (understanding): Studying and wants to know why. Discursive discussion.

If the page serves more than one need, record it as a structural problem and recommend splitting it.

Brief explanation inside a tutorial or how-to guide isn't a structural problem when the reader needs it to stay oriented or to use a feature correctly. Flag it only when it grows into a discussion the task doesn't require.

### 2. Screening checklist

Evaluate the page against these criteria. For each failure, quote the offending text and give a concrete recommendation.

Some items apply only to some page types. Mark an item that doesn't apply as "N/A" in the output, without counting it as a failure:

| Item | Applies to |
| --- | --- |
| 2. Shortest path | Tutorials and how-to guides |
| 3. Context switching | Tutorials and how-to guides |
| 5. Versioning and network | Tutorials and how-to guides |
| 10. Failure and recovery | Tutorials, how-to guides, and reference pages that document commands or functions |
| 11. Verification | Tutorials and how-to guides |
| All other items | Every page type |

An explanation or reference page that includes a command or code example still needs that example to be correct and complete. It doesn't need to walk the reader through running it.

1. **Single job (Diátaxis):** Does the page do only one thing? List any material that belongs in a different quadrant and name the destination.

2. **Shortest path:** What is the minimum sequence that achieves the stated goal? Flag any "build the world first" content, or repeated installation content not required for the immediate task.

3. **Context switching (DX):** Count the distinct environments the reader must juggle (for example a Node server terminal, a node CLI, the Web IDE, a browser). Flag excessive context switching.

4. **Prerequisites and setup:** Are installation commands or version checks restated on the page, or are they linked once and assumed? Flag repeated `cargo install` or package-manager commands.

5. **Versioning and network:** Do tutorials and how-to guides state at the top of the page which network they target (Liquid testnet or Bitcoin Signet) and which tool versions they were tested with (for example Simplex or `hal-simplicity`)? A page that covers only one network is acceptable; don't flag it for not covering the other.

6. **Repetition:** Identify instructions, warnings, or explanations that appear more than once. The standard is: set out facts in the most appropriate place, and link rather than repeat.

7. **Language precision (Bitcoin and Liquid context):** Flag "money", "cost money", "free", or similar when the subject is test coins, such as test Liquid bitcoin (tLBTC) or Bitcoin Signet coins. Prefer naming the asset, or "testnet only". Flag ambiguous uses of "fund". Apply the capitalization and naming rules in `.claude/rules/terminology.md`, including "LBTC", never "L-BTC".

8. **Security and irreversible actions:** Are irreversible mistakes (clearing site data, using the wrong network) stated before the reader can trigger them, and only once? Flag warnings that appear after the dangerous step.

9. **Clarity and economy:**
    * Flag passive voice that hides who or what acts, generic management-speak, and marketing fluff. Apply the patterns listed in `.claude/rules/contentstyle.md`.
    * Steps must begin with a verb, not context.
    * The first use of a Simplicity-specific term on a page must link to its glossary entry or its reference page.
    * Advisory: flag sentences longer than about 20 words that are hard to follow. List these under **Advisory** in the output. They don't affect the verdict on their own.

10. **Failure and recovery:** If a step can fail, are the error messages and fixes documented?

11. **Verification:** Does every executable command show its expected output (for example a console log or a transaction ID)? Flag steps that leave the reader guessing whether they succeeded. Commands without any output, such as `cd` or `export`, are exempt.

12. **Navigation and next steps:** Does the page end with a clear, single next action or link? Flag pages that introduce new conceptual material at the end instead of pointing to existing documentation.

13. **Accuracy:** Flag claims that are imprecise, or that you can tell are mistaken or inconsistent with the rest of the page or with other pages on the site. This doesn't require an external fact-check of every claim.

### 3. Formatting rules (must pass)

The page must follow every rule in the **Formatting** section of `CONTRIBUTING.md`. That section is the complete list; check all of it.

## Output format

Produce this structure for each page reviewed:

```markdown
## Classification

* Page: `docs/...`
* Primary type: [Tutorial | How-to | Reference | Explanation | Reduced review]
* User need served: [one sentence]
* Structural problems: [list, or "none"]

## Failures

### [Category name from the checklist]

* Quote: "..."
* Problem: ...
* Action: [Delete | Move to X | Rewrite]
* Recommendation: ...

(Repeat for each failure found.)

## Advisory

[Long sentences and other items that don't affect the verdict, or "none".]

## Shortest-path rewrite or proposed structure (optional)

[For a how-to guide or tutorial, a bullet outline of the minimal sequence that still achieves the goal. For an explanation or reference page, a bullet outline of the proposed sections, when the review recommends restructuring.]

## Verdict

[Exactly one of: Pass (ready to publish) | Conditional pass (fix the listed items) | Fail (requires structural rewrite)]

Priority fixes (top 3):

1. ...
2. ...
3. ...
```
