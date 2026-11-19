// Expose documentation search and the Try it playground to browser agents.
(() => {
  const context = document.modelContext ?? navigator.modelContext;
  if (!context?.registerTool) return;

  const config = JSON.parse(document.getElementById("__config").textContent);
  const base = new URL(config.base.endsWith("/") ? config.base : `${config.base}/`, location.href);
  const workerURL = new URL(config.search, location.href);

  context.registerTool({
    name: "search_docs",
    description: "Search Simplicity documentation for concepts, symbols, and examples. Returns up to ten matching sections with titles, excerpts, and URLs, and shows the query in the site search.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search words or a symbol name, such as relative timelock or eq_32." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    async execute({ query } = {}, { signal } = {}) {
      if (typeof query !== "string" || !query.trim() || query.length > 500) {
        throw new Error("query must contain between 1 and 500 characters.");
      }
      query = query.trim();
      // Each call owns its worker: concurrent queries cannot receive each other's results.
      const controller = new AbortController();
      const abort = () => controller.abort();
      signal?.addEventListener("abort", abort, { once: true });
      if (signal?.aborted) abort();
      const timeout = setTimeout(abort, 15000);
      let worker;
      try {
        const response = await fetch(new URL("search/search_index.json", base), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Search index unavailable (HTTP ${response.status}). Retry shortly.`);
        const index = await response.json();
        controller.signal.throwIfAborted();
        worker = new Worker(workerURL);
        const result = await new Promise((resolve, reject) => {
          controller.signal.addEventListener("abort", () => reject(new Error("Search cancelled or timed out. Retry the query.")), { once: true });
          worker.onerror = () => reject(new Error("Search worker failed. Reload the page and retry."));
          worker.onmessage = ({ data }) => {
            if (data.type === 1) worker.postMessage({ type: 2, data: query });
            if (data.type === 3) resolve(data.data);
          };
          // Material's worker protocol: SETUP=0, READY=1, QUERY=2, RESULT=3.
          worker.postMessage({ type: 0, data: { ...index, options: { suggest: false } } });
        });
        const plainText = (html) => {
          const template = document.createElement("template");
          template.innerHTML = html;
          return template.content.textContent.replace(/\s+/g, " ").trim();
        };
        const matches = result.items.flat().filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);
        const results = matches.slice(0, 10).map(item => ({
          title: plainText(item.title),
          excerpt: plainText(item.text).slice(0, 600),
          url: new URL(item.location, base).href,
        }));
        const input = document.querySelector('[data-md-component="search-query"]');
        if (input) {
          input.value = query;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.focus();
        }
        return { content: [{ type: "text", text: JSON.stringify({ query, results, total: matches.length }) }] };
      } finally {
        worker?.terminate();
        clearTimeout(timeout);
        signal?.removeEventListener("abort", abort);
      }
    },
  });
  const maxSourceLength = 64 * 1024;
  const runnerURL = new URL("javascript/webmcp-runner.js", base);
  const registerRunner = async () => {
    await context.registerTool({
      name: "run_simplicityhl",
      description: "Compile and run a complete SimplicityHL program with the Try it playground. Use this to check whether a snippet compiles, whether its assertions hold, and what dbg!() prints. Runs locally against a dummy transaction with one input; no wallet, broadcast, custom witnesses, or real transaction data.",
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      inputSchema: {
        type: "object",
        properties: {
          source: {
            type: "string",
            minLength: 1,
            maxLength: maxSourceLength,
            description: "Plain SimplicityHL source with fn main(), without Markdown fences or external files.",
          },
        },
        required: ["source"],
        additionalProperties: false,
      },
      async execute({ source } = {}, { signal } = {}) {
        const failure = (status, message) => ({ ok: false, status, message });
        if (typeof source !== "string" || !source.trim() || source.length > maxSourceLength) {
          return failure("invalid_input", "Pass a nonblank SimplicityHL source string of at most 65536 characters.");
        }
        const cancel = () => failure("cancelled", "The run was cancelled.");
        if (signal?.aborted) return cancel();

        // WASM execution is synchronous. An isolated worker keeps the page responsive
        // and lets us terminate compilation or execution on cancellation or timeout.
        let worker;
        let timeout;
        let abort;
        try {
          worker = new Worker(runnerURL, { type: "module" });
          return await new Promise((resolve) => {
            abort = () => resolve(cancel());
            signal?.addEventListener("abort", abort, { once: true });
            timeout = setTimeout(() => resolve(failure("timeout", "The run exceeded 15 seconds. Try a smaller program.")), 15000);
            worker.onmessage = ({ data }) => resolve(data);
            worker.onerror = () => resolve(failure("runner_error", "Could not start the playground runner. Reload the page and retry."));
            worker.postMessage(source);
          });
        } catch {
          return failure("runner_error", "Could not start the playground runner. Reload the page and retry.");
        } finally {
          worker?.terminate();
          clearTimeout(timeout);
          if (abort) signal?.removeEventListener("abort", abort);
        }
      },
    });
  };
  registerRunner().catch(error => console.warn("Could not register run_simplicityhl:", error));
})();
