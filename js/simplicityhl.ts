/** Lazy access to the SimplicityHL compiler, compiled to WASM. */

// `serde-wasm-bindgen` maps Rust's `None` to `undefined`, not `null`, so optional fields
// must not be tested with `=== null`.

export interface Diagnostic {
  severity: 'error' | 'warning';
  message: string;
  /** Byte offset into the source; absent for whole-file diagnostics. */
  start: number | null | undefined;
  end: number | null | undefined;
}

export interface RunResult {
  ok: boolean;
  diagnostics: Diagnostic[];
  /** Prose fallback for diagnostics with no span to attach to. */
  rendered: string;
  /** Lines produced by `dbg!()`, in program order. */
  debug: string[];
  warnings: string[];
  /** Set when the program compiled but failed to execute, e.g. a failed `assert!`. */
  error: string | null | undefined;
  /** Commitment Merkle Root, hex, once the program compiles. */
  cmr: string | null | undefined;
}

interface WasmModule {
  default(): Promise<unknown>;
  run_program(source: string): RunResult;
  /**
   * `prevTxsHex` needs every transaction referenced by an input of `txHex`, not just the
   * selected one — a program may address any input via `jet::input_amount(i)`.
   */
  run_program_with_tx(
    source: string,
    txHex: string,
    prevTxsHex: string[],
    inputIndex: number,
    genesisHash: string,
  ): RunResult;
}

let modulePromise: Promise<WasmModule> | null = null;

/**
 * Load the compiler once; concurrent callers share the fetch.
 *
 * The URL is built at runtime rather than written as a literal import so esbuild leaves
 * it alone — the 2 MB compiler must stay a separate lazy fetch, and resolving against
 * `import.meta.url` works whether the site is served from a domain root or a subpath.
 */
export function loadCompiler(): Promise<WasmModule> {
  modulePromise ??= (async () => {
    const url = new URL('../wasm/pkg/simplicity_runner.js', import.meta.url).href;
    const wasm = (await import(/* webpackIgnore: true */ url)) as unknown as WasmModule;
    await wasm.default();
    return wasm;
  })();
  return modulePromise;
}
