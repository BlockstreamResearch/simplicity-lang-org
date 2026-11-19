// Use the same WASM artifact and dummy transaction as the Try it Run button.
self.onmessage = async ({ data: source }) => {
  let compiler;
  try {
    compiler = await import("../wasm/pkg/simplicity_runner.js");
    await compiler.default();
  } catch {
    self.postMessage({ ok: false, status: "runner_error", message: "Could not load the SimplicityHL compiler. Retry shortly, or build the WASM package if serving the docs locally." });
    return;
  }

  try {
    const result = compiler.run_program(source);
    const status = result.ok ? "success"
      : !result.cmr ? "compile_error"
      : result.error ? "execution_error"
      : "witness_error";
    self.postMessage({ ...result, status, cmr: result.cmr ?? null, error: result.error ?? null });
  } catch {
    self.postMessage({ ok: false, status: "runner_error", message: "The compiler stopped unexpectedly. Try a smaller program." });
  }
};
