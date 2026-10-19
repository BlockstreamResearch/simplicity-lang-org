---
name: review-docs
description: Review finished documentation changes against .github/documentation-review.md.
argument-hint: "[page path | PR number | commit range]"
disable-model-invocation: false
---

Read `.github/documentation-review.md` and follow it to review: $ARGUMENTS

If no target is given, review the pages under `docs/` that the current branch adds or changes relative to `main`. Report the review in the output format the file specifies. Don't edit any files unless asked.
