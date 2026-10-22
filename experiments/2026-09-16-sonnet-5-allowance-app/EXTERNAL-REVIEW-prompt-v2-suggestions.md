# External review: suggestions for the next iteration of this experiment

> **Note on authorship**: this file was written by a separate Claude Code session,
> acting as an outside reviewer of this completed experiment (`prompt`, `README.md`,
> `logs/LOG.md`, and the rest of this repo) — not by the agent that ran the
> experiment itself, and not part of its persona or its log. It reflects an
> after-the-fact read of the artifacts here, done at the request of the person
> running the experiment, in order to critique the experiment's design (prompt
> quality and realism of the "less-knowledgeable human" setup) ahead of a second
> iteration. Where it refers to "the agent" or "the run," it means the experiment
> documented in `logs/LOG.md`, as an external observer would.

## Summary judgment

This was a stronger run than most attempts at this kind of exercise, and for a
specific reason: the technique that actually caught the agent's prior-knowledge
leakage wasn't anything in the prompt's wording asking it to *suppress* its own
knowledge — that instruction demonstrably did not work (see `logs/LOG.md` Step 9's
own list of things "read on sight" before any reference page was fetched). What
worked was **interrogating the agent about its own trace**, both live
(`logs/leak`, `logs/esplora-conversation`) and as a structured retrospective (Step
9). That's the finding worth carrying forward most deliberately into a v2 prompt.

The four suggestions below were raised in conversation with the person running this
experiment and are recorded here for use when drafting the next prompt.

## 1. Bake the retrospective interrogation into the prompt itself

Right now the single most valuable artifact in the log — Step 9's honest accounting
of leaked prior knowledge and superhuman ability — only exists because the human
running the experiment thought to ask for it live, at the end of the session. That
shouldn't depend on the human remembering to ask. Add a required closing section to
the prompt itself, e.g.:

> Before concluding, list every place you can identify where you relied on
> outside/prior knowledge instead of something confirmed from the docs or this
> session's own tool output, and every place your ability was substantially beyond
> what a solo human novice could realistically do in the same amount of time.

This turns the best ad hoc catch from this run into a standard, repeatable part of
the deliverable for every future run, independent of who's watching.

## 2. Add a lighter-weight, proactive version of the same check mid-flight

The full retrospective in #1 catches leakage only after it's already shaped the
whole session (Step 9's examples — jets semantics, Taproot script-path shape,
`param::`/`witness::` syntax — were all used to reason and write code well before
being "confirmed" against docs after the fact). A cheaper, earlier checkpoint would
catch some of these closer to when they happen:

> Before treating any claim about jets, timelocks, or language syntax as settled,
> state whether you've actually fetched the relevant reference page yet in this
> session. If not, fetch it first and note whether it matches what you assumed.

## 3. Isolate the sandbox from sibling project directories and pin down tooling availability

Two separate issues bundled here:

- **Filesystem leakage risk.** This run's sandbox sat inside `~/src`, next to
  sibling checkouts that are the actual production docs/code repos for this
  project. The agent noticed them and the user's own email domain, and
  (correctly, but only by its own judgment, not by any enforced constraint)
  chose not to open them. A future run — or a different, less cautious model —
  might not show the same restraint, which would silently invalidate the "learn
  only from the published docs" premise. Run future iterations in a directory
  tree that contains nothing but the experiment itself.
- **Toolchain availability should be stated, not discovered.** A full step of
  this run (Steps 3A/4, real and substantial code) was spent on a Rust backend
  that could never compile because the sandbox has no C compiler — correctly
  identified in the log as an environment artifact rather than a documentation
  gap, but it still cost a full phase of effort. Either provision a sandbox with
  a working C toolchain so the docs' primary recommended path (a Rust SDK) can
  actually be tested, or state up front in the prompt that only prebuilt-binary /
  no-compile tooling is available, so the agent doesn't have to spend a phase
  discovering that itself.

## 4. Decide explicitly whether background-agent parallelism is in scope, and track effort if it matters

This run used parallel background research/implementation forks (Step 3), which
the agent itself flagged in Step 9 as "something no solo human developer can do."
That's a legitimate thing to allow, but right now it's incidental rather than a
stated parameter of the experiment, which makes the run harder to compare against
"how long would this take a real developer." For v2: either disallow subagent
parallelism to better match solo-human pacing, or keep it and explicitly ask for
wall-clock/effort accounting (this run used session-relative step numbers instead
of timestamps, which discarded that information) so time-to-complete stays legible
alongside the narrative log.

## One structural limit worth naming even if not fixable by prompt wording

Independent of the four items above: this run's own Step 9 shows that fluent,
un-sourced familiarity with jets semantics, Taproot mechanics, Elements
conventions, and SimplicityHL syntax means **the experiment currently provides no
signal about whether the language-reference and jets/timelocks documentation pages
are any good** — the agent never needed them enough to stress-test them. An
absence of flagged gaps in those areas should not be read as "the docs are fine
there." This is a ceiling on what any single frontier-model persona run can tell
you about reference-doc quality specifically, not a defect in this run's execution.
