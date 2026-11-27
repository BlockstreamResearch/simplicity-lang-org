// Facts that more than one page states, checked against the one page that owns
// each: editing only one copy fails. Run with: node --test tests/
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => readFileSync(path.join(root, file), "utf8");

const TUTORIAL = "docs/getting-started/build-end-to-end-app.md";
const SIMPLEX = "docs/documentation/simplex.md";
const MODULES = "docs/documentation/modules.md";
const STDLIB = "docs/documentation/stdlib.md";
const AGENT = "docs/getting-started/agent-setup/prompt.md";
const SETUP = "docs/getting-started/agent-setup.md";
const HERO = "overrides/main.html";

const all = (text, re) => [...text.matchAll(re)].map((m) => m[1]);

function only(file, values, what) {
  const unique = new Set(values);
  assert.equal(unique.size, 1, `${file} states ${[...unique].join(", ") || "no"} ${what}`);
  return values[0];
}

// smplx-std is released with Simplex under the same version number, so the
// crate the tutorial adds must match the Simplex it installs.
test("the end-to-end tutorial adds the smplx-std release matching its Simplex", () => {
  const tutorial = read(TUTORIAL);
  const simplex = only(TUTORIAL, all(tutorial, /simplexup --install v?(\d+\.\d+\.\d+)/g), "Simplex version");
  const crate = all(tutorial, /smplx-std(?:@| = ")=(\d+\.\d+\.\d+)/g);
  assert.ok(crate.length > 0, `${TUTORIAL} doesn't pin smplx-std`);
  for (const version of crate) {
    assert.equal(
      version,
      simplex,
      `${TUTORIAL} pins smplx-std ${version} but installs Simplex ${simplex}. Update both together.`
    );
  }
});

// stdlib.md is generated from a simplicityhl-std tag; the manual clone on the
// modules page must fetch the same release.
test("the modules page clones the standard library release the reference documents", () => {
  const generated = only(
    STDLIB,
    all(read(STDLIB), /Generated from BlockstreamResearch\/simplicityhl-std v?(\d+\.\d+\.\d+)/g),
    "simplicityhl-std version"
  );
  const cloned = all(read(MODULES), /--branch v?(\d+\.\d+\.\d+) \S*simplicityhl-std/g);
  assert.ok(cloned.length > 0, `${MODULES} doesn't clone a simplicityhl-std release`);
  for (const version of cloned) {
    assert.equal(
      version,
      generated,
      `${MODULES} clones simplicityhl-std ${version}, but ${STDLIB} documents ${generated}. Regenerate ${STDLIB} with stdlib.md.py or update the clone.`
    );
  }
});

// The end-to-end tutorial owns the minimum Rust version.
test("every setup path asks for the tutorial's minimum Rust version", () => {
  const rust = /Rust (\d+\.\d+)\+|(\d+\.\d+) or newer|older than (\d+\.\d+)/g;
  const versions = (text) => [...text.matchAll(rust)].map((m) => m[1] || m[2] || m[3]);
  const expected = only(TUTORIAL, versions(read(TUTORIAL)), "minimum Rust version");
  for (const file of [AGENT, SETUP, HERO]) {
    const found = versions(read(file));
    assert.ok(found.length > 0, `${file} doesn't state a minimum Rust version`);
    for (const version of found) {
      assert.equal(
        version,
        expected,
        `${file} asks for Rust ${version}, but ${TUTORIAL} needs ${expected}. Update both together.`
      );
    }
  }
});

// The Simplex page owns the installer command.
test("every page installs simplexup with the Simplex page's command", () => {
  const installer = /^\s*(?:<li>.*<code>)?(curl\b[^<\n]*smplx\.simplicity-lang\.org[^<\n]*)/gm;
  const expected = only(SIMPLEX, all(read(SIMPLEX), installer).map((c) => c.trim()), "installer command");
  for (const file of [AGENT, HERO]) {
    const found = all(read(file), installer).map((c) => c.trim());
    assert.ok(found.length > 0, `${file} doesn't run the simplexup installer`);
    for (const command of found) {
      assert.equal(
        command,
        expected,
        `${file} runs "${command}", but ${SIMPLEX} uses "${expected}". Update both together.`
      );
    }
  }
});
