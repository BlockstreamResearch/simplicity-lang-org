// Keeps the homepage "Copy setup prompt" panel, the prompt it copies, the setup
// page, the agent instructions the prompt points to, and the end-to-end
// tutorial in sync. Run with: node --test tests/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

const HERO = "overrides/main.html";
const PROMPT = "overrides/partials/agent-prompt.txt";
const SETUP = "docs/getting-started/agent-setup.md";
const AGENT = "docs/getting-started/agent-setup/prompt.md";
const TUTORIAL = "docs/getting-started/build-end-to-end-app.md";

const hero = read(HERO);
const prompt = read(PROMPT).trim();
const setup = read(SETUP);
const agent = read(AGENT);
const tutorial = read(TUTORIAL);

const unescapeHtml = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Every Simplex version a file pins, from `simplexup --install X`,
// `# Simplex X` (the expected `simplex --version` output) and
// "Installs Simplex X" / "Simplex X, with" in step lists.
function simplexVersions(text) {
  const patterns = [
    /simplexup --install v?(\d+\.\d+\.\d+)/g,
    /#\s*Simplex (\d+\.\d+\.\d+)/g,
    /Installs Simplex (\d+\.\d+\.\d+)/g,
    /^\* Simplex (\d+\.\d+\.\d+)/gm,
  ];
  return patterns.flatMap((re) => [...text.matchAll(re)].map((m) => m[1]));
}

test("the end-to-end tutorial pins exactly one Simplex version", () => {
  const versions = new Set(simplexVersions(tutorial));
  assert.equal(versions.size, 1, `${TUTORIAL} pins ${[...versions].join(", ") || "no version"}`);
});

test("the agent instructions, setup page and homepage panel install the tutorial's Simplex version", () => {
  const [expected] = simplexVersions(tutorial);
  for (const [file, text] of [[AGENT, agent], [SETUP, setup], [HERO, hero]]) {
    const versions = simplexVersions(text);
    assert.ok(versions.length > 0, `${file} doesn't pin a Simplex version`);
    for (const version of versions) {
      assert.equal(
        version,
        expected,
        `${file} installs Simplex ${version}, but ${TUTORIAL} uses ${expected}. Update both together.`
      );
    }
  }
});

test("the copied prompt points to the agent instructions", () => {
  const url = prompt.match(/https:\/\/docs\.simplicity-lang\.org\/(\S+?\.md)\b/);
  assert.ok(url, `${PROMPT} must link to a .md page on docs.simplicity-lang.org`);
  assert.equal(`docs/${url[1]}`, AGENT);
  assert.ok(existsSync(path.join(root, AGENT)));
});

// The prompt and the instructions each live in one file; the homepage and the
// setup page embed them rather than keeping their own copies.
test("the homepage and setup page embed the prompt instead of copying it", () => {
  assert.ok(hero.includes('{% include "partials/agent-prompt.txt" %}'), `${HERO} must include ${PROMPT}`);
  assert.ok(setup.includes(`--8<-- "${PROMPT}"`), `${SETUP} must embed ${PROMPT}`);
  for (const [file, text] of [[HERO, hero], [SETUP, setup]]) {
    assert.ok(!text.includes(prompt), `${file} repeats the prompt; embed ${PROMPT} instead`);
  }
});

test("the setup page embeds the agent instructions", () => {
  assert.ok(setup.includes(`--8<-- "${AGENT}"`), `${SETUP} must embed ${AGENT}`);
});

test("every command in the homepage panel appears in the agent instructions", () => {
  const steps = hero.match(/<div class="agent-steps"[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(steps, `${HERO} must list the steps in <div class="agent-steps">`);
  const commands = [...steps[1].matchAll(/<code>([^<]+)<\/code>/g)]
    .flatMap((m) => unescapeHtml(m[1]).split("&&"))
    .map((c) => c.trim());
  assert.ok(commands.length >= 5, "expected the panel to list its commands");
  const agentLines = agent.split("\n").map((l) => l.trim());
  for (const command of commands) {
    assert.ok(
      agentLines.some((line) => line.startsWith(command)),
      `"${command}" is in ${HERO} but not in ${AGENT}`
    );
  }
});
