// Keeps the homepage "Copy setup prompt" panel, the agent setup page it points
// to, and the end-to-end tutorial in sync. Run with: node --test tests/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

const HERO = "overrides/main.html";
const SETUP = "docs/getting-started/agent-setup.md";
const TUTORIAL = "docs/getting-started/build-end-to-end-app.md";

const hero = read(HERO);
const setup = read(SETUP);
const tutorial = read(TUTORIAL);

const unescapeHtml = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Every Simplex version a file pins, from `simplexup --install X`,
// `# Simplex X` (the expected `simplex --version` output) and the panel's
// "Installs Simplex X" step.
function simplexVersions(text) {
  const patterns = [
    /simplexup --install v?(\d+\.\d+\.\d+)/g,
    /#\s*Simplex (\d+\.\d+\.\d+)/g,
    /Installs Simplex (\d+\.\d+\.\d+)/g,
  ];
  return patterns.flatMap((re) => [...text.matchAll(re)].map((m) => m[1]));
}

function heroPrompt() {
  const m = hero.match(/{% set agent_prompt = "([^"]+)" %}/);
  assert.ok(m, `${HERO} must define agent_prompt`);
  return m[1];
}

test("the end-to-end tutorial pins exactly one Simplex version", () => {
  const versions = new Set(simplexVersions(tutorial));
  assert.equal(versions.size, 1, `${TUTORIAL} pins ${[...versions].join(", ") || "no version"}`);
});

test("the agent setup page and homepage panel install the tutorial's Simplex version", () => {
  const [expected] = simplexVersions(tutorial);
  for (const [file, text] of [[SETUP, setup], [HERO, hero]]) {
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

test("the copied prompt points to the agent setup page", () => {
  const prompt = heroPrompt();
  const url = prompt.match(/https:\/\/docs\.simplicity-lang\.org\/(\S+?\.md)\b/);
  assert.ok(url, "the prompt must link to a .md page on docs.simplicity-lang.org");
  assert.equal(`docs/${url[1]}`, SETUP);
  assert.ok(existsSync(path.join(root, SETUP)));
});

test("the agent setup page shows the same prompt the homepage copies", () => {
  assert.ok(setup.includes(unescapeHtml(heroPrompt())), `${SETUP} must quote the prompt from ${HERO}`);
});

test("every command in the homepage panel appears on the agent setup page", () => {
  const steps = hero.match(/<div class="agent-steps"[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(steps, `${HERO} must list the steps in <div class="agent-steps">`);
  const commands = [...steps[1].matchAll(/<code>([^<]+)<\/code>/g)]
    .flatMap((m) => unescapeHtml(m[1]).split("&&"))
    .map((c) => c.trim());
  assert.ok(commands.length >= 5, "expected the panel to list its commands");
  const setupLines = setup.split("\n").map((l) => l.trim());
  for (const command of commands) {
    assert.ok(
      setupLines.some((line) => line.startsWith(command)),
      `"${command}" is in ${HERO} but not in ${SETUP}`
    );
  }
});
