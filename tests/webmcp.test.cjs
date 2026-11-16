const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");
const source = readFileSync(`${__dirname}/../docs/javascript/webmcp.js`, "utf8");

function setup({ legacy = false, supported = true, failFetch = false, failWorker = false, stallWorker = false, base = "../.." } = {}) {
  const tools = new Map();
  const workers = [];
  const input = { value: "", dispatchEvent() {}, focus() { this.focused = true; } };
  const context = { registerTool(tool) { tools.set(tool.name, tool); } };
  const urls = [];
  const location = { href: "http://localhost:8000/docs/reference/types/" };
  class Worker {
    constructor(url, options) {
      urls.push(url.href);
      workers.push(this);
      this.options = options;
    }
    postMessage(message) {
      setImmediate(() => {
        if (failWorker) return this.onerror();
        if (stallWorker) return;
        if (this.options?.type === "module") {
          this.onmessage({ data: { ok: true, status: "success", debug: [message] } });
        } else if (message.type === 0) {
          assert.equal(message.data.options.suggest, false);
          this.onmessage({ data: { type: 1 } });
        } else {
          const items = message.data === "unmatched" ? [] : [[
            { title: "Parent", text: "", location: "reference/", score: 0 },
            ...Array.from({ length: 12 }, (_, i) => ({
              title: `${message.data} ${i}`, text: "excerpt ".repeat(100),
              location: `reference/#section-${i}`, score: i + 1,
            })),
          ]];
          this.onmessage({ data: { type: 3, data: { items } } });
        }
      });
    }
    terminate() { this.terminated = true; }
  }
  vm.runInNewContext(source, {
    document: {
      modelContext: supported && !legacy ? context : undefined,
      getElementById: () => ({ textContent: JSON.stringify({ base, search: "../../assets/worker.js" }) }),
      querySelector: () => input,
      createElement: () => ({ set innerHTML(value) { this.content = { textContent: value }; } }),
    },
    navigator: { modelContext: supported && legacy ? context : undefined },
    location,
    URL, Worker, AbortController, Event, setTimeout, clearTimeout,
    fetch: async (url, { signal }) => {
      urls.push(url.href);
      signal.throwIfAborted();
      return { ok: !failFetch, status: 503, json: async () => ({ config: {}, docs: [] }) };
    },
  });
  return { tool: tools.get("search_docs"), runner: tools.get("run_simplicityhl"), workers, urls, input, location };
}

const result = value => JSON.parse(value.content[0].text);

test("search_docs validates, isolates calls, bounds results and cleans up", async () => {
  assert.equal(setup({ supported: false }).tool, undefined);
  for (const legacy of [false, true]) {
    const env = setup({ legacy });
    assert.equal(env.tool.name, "search_docs");
    for (const query of [undefined, 12, "  ", "x".repeat(501)]) {
      await assert.rejects(env.tool.execute({ query }), /query must/);
    }
    env.location.href = "http://localhost:8000/docs/"; // Material instant navigation.
    const [a, b] = await Promise.all([
      env.tool.execute({ query: " timelock " }), env.tool.execute({ query: "jet::eq_32" }),
    ]);
    assert.equal(result(a).query, "timelock");
    assert.equal(result(a).results[0].title, "timelock 11");
    assert.equal(result(b).results[0].title, "jet::eq_32 11");
    assert.equal(result(a).results.length, 10);
    assert.equal(result(a).total, 12);
    assert.equal(result(a).results[0].excerpt.length, 600);
    assert.equal(result(a).results[0].url, "http://localhost:8000/docs/reference/#section-11");
    assert.ok(env.urls.includes("http://localhost:8000/docs/search/search_index.json"));
    assert.ok(env.urls.includes("http://localhost:8000/docs/assets/worker.js"));
    assert.deepEqual(result(await env.tool.execute({ query: "unmatched" })).results, []);
    assert.equal(env.input.value, "unmatched");
    assert.equal(env.input.focused, true);
    assert.ok(env.workers.every(worker => worker.terminated));
  }
  await assert.rejects(setup({ failFetch: true }).tool.execute({ query: "test" }), /HTTP 503/);
  const broken = setup({ failWorker: true });
  await assert.rejects(broken.tool.execute({ query: "test" }), /worker failed/);
  assert.ok(broken.workers[0].terminated);
  const cancelled = setup();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(cancelled.tool.execute({ query: "test" }, { signal: controller.signal }));
  assert.equal(cancelled.workers.length, 0);
  const pending = setup({ stallWorker: true });
  const during = new AbortController();
  const execution = pending.tool.execute({ query: "test" }, { signal: during.signal });
  await new Promise(resolve => setImmediate(resolve));
  during.abort();
  await assert.rejects(execution, /cancelled or timed out/);
  assert.ok(pending.workers[0].terminated);
});

test("root and subpath bases retain a single trailing slash", async () => {
  for (const base of ["/", "/docs/", "/docs"]) {
    const env = setup({ base });
    const output = result(await env.tool.execute({ query: "timelock" }));
    const expected = base === "/" ? "http://localhost:8000/" : "http://localhost:8000/docs/";
    assert.ok(env.urls.includes(`${expected}search/search_index.json`));
    assert.equal(output.results[0].url, `${expected}reference/#section-11`);
  }
});

test("run_simplicityhl validates source, runs in isolation, and cleans up", async () => {
  assert.equal(setup({ supported: false }).runner, undefined);
  for (const legacy of [false, true]) {
    const env = setup({ legacy });
    for (const source of [undefined, " ", 3, "a".repeat(65537)]) {
      assert.equal((await env.runner.execute({ source })).status, "invalid_input");
    }
    assert.equal(env.workers.length, 0);
    env.location.href = "http://localhost:8000/docs/getting-started/try-it/";
    const programs = ["fn main() {}", "fn main() { assert!(true); }"];
    const outputs = await Promise.all(programs.map(source => env.runner.execute({ source })));
    for (const [i, output] of outputs.entries()) {
      assert.equal(output.status, "success");
      assert.equal(output.debug[0], programs[i]);
    }
    assert.ok(env.workers.every(worker => worker.terminated));
    assert.equal(env.urls[0], "http://localhost:8000/docs/javascript/webmcp-runner.js");
    assert.equal(env.input.value, "");
  }

  const env = setup({ stallWorker: true });
  const controller = new AbortController();
  const request = { source: "fn main() {}" };
  const pending = env.runner.execute(request, { signal: controller.signal });
  controller.abort();
  assert.equal((await pending).status, "cancelled");
  assert.equal((await env.runner.execute(request, { signal: controller.signal })).status, "cancelled");
  assert.equal(env.workers.length, 1);
  assert.ok(env.workers[0].terminated);

  const broken = setup({ failWorker: true });
  assert.equal((await broken.runner.execute(request)).status, "runner_error");
  assert.ok(broken.workers[0].terminated);
});
