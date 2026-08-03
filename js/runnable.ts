/**
 * Upgrades the inert snippet shells emitted by `hooks/runnable.py` into CodeMirror
 * editors with Run/Reset and an output pane. Without this the shell still reads fine —
 * the source sits in a `<textarea>`.
 */

import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { setDiagnostics, type Diagnostic as CmDiagnostic } from '@codemirror/lint';
import { rust } from '@codemirror/lang-rust';
import { tags as t } from '@lezer/highlight';

import { loadCompiler, type Diagnostic, type RunResult } from './simplicityhl';
import { GENESIS_HASH, describeInput, loadTransaction, type LoadedTransaction } from './explorer';

/**
 * Emits class names rather than inline styles so `runnable.css` can map them onto
 * Material's `--md-code-hl-*` variables — snippets then match the static code blocks
 * around them and follow light/dark for free.
 */
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.moduleKeyword, t.self], class: 'rn-hl-keyword' },
  { tag: [t.string, t.special(t.string), t.character], class: 'rn-hl-string' },
  { tag: [t.number, t.bool, t.literal], class: 'rn-hl-number' },
  { tag: [t.comment, t.lineComment, t.blockComment], class: 'rn-hl-comment' },
  { tag: [t.function(t.variableName), t.macroName, t.labelName], class: 'rn-hl-function' },
  { tag: [t.typeName, t.className, t.namespace, t.standard(t.typeName)], class: 'rn-hl-type' },
  { tag: [t.operator, t.derefOperator, t.definitionOperator], class: 'rn-hl-operator' },
  { tag: [t.punctuation, t.bracket, t.separator], class: 'rn-hl-punctuation' },
  { tag: [t.propertyName, t.attributeName], class: 'rn-hl-name' },
  { tag: [t.constant(t.variableName), t.definition(t.variableName)], class: 'rn-hl-constant' },
  { tag: [t.invalid], class: 'rn-hl-invalid' },
]);

function toCmDiagnostics(source: string, diagnostics: Diagnostic[]): CmDiagnostic[] {
  // SimplicityHL spans are byte offsets; CodeMirror wants UTF-16 code units. Identical
  // for ASCII, so only pay for the conversion when a snippet isn't.
  const bytes = /^[\u0000-\u007f]*$/.test(source) ? null : new TextEncoder().encode(source);
  const toChar = (offset: number) =>
    bytes === null
      ? offset
      : new TextDecoder().decode(bytes.subarray(0, Math.min(offset, bytes.length))).length;

  // `!= null` catches undefined too, which is what wasm-bindgen delivers for Rust's None.
  return diagnostics
    .filter((d) => d.start != null && d.end != null)
    .map((d) => {
      const from = toChar(d.start as number);
      // A zero-width diagnostic renders as nothing, so widen it — that is how
      // end-of-input errors ("expected `}`") stay visible.
      const to = Math.max(toChar(d.end as number), Math.min(from + 1, source.length));
      return { from, to, severity: d.severity, message: d.message };
    });
}

function renderOutput(pane: HTMLElement, result: RunResult): void {
  pane.replaceChildren();
  pane.hidden = false;

  const add = (className: string, text: string) => {
    const line = document.createElement('div');
    line.className = className;
    line.textContent = text;
    pane.append(line);
  };

  // `error` is set only when a program compiled and then failed to execute, so its
  // absence on a failure means compilation is what went wrong. `??` not `===`: Rust's
  // None arrives as undefined.
  const runtimeError = result.error ?? null;
  if (!result.ok && runtimeError === null) {
    add('rn-status rn-status--error', 'Did not compile');
    const messages = result.diagnostics.filter((d) => d.severity === 'error');
    if (messages.length > 0) for (const d of messages) add('rn-line', d.message);
    else if (result.rendered.trim()) add('rn-line', result.rendered.trim());
    return;
  }

  for (const line of result.debug) add('rn-line rn-line--debug', line);
  for (const line of result.warnings) add('rn-line rn-line--warning', line);

  // A SimplicityHL program returns nothing; it either holds or it doesn't.
  if (result.ok) add('rn-status rn-status--ok', 'Program succeeded — all assertions held');
  else {
    add('rn-status rn-status--error', 'Program failed');
    if (runtimeError) add('rn-line', runtimeError);
  }

  if (result.cmr) add('rn-cmr', `CMR ${result.cmr}`);
}

interface TxBar {
  ensureLoaded(): Promise<LoadedTransaction>;
  selectedInput(): number;
}

/** Wire up a `tx` snippet's transaction bar. Nothing is fetched until Load or Run. */
function mountTxBar(root: HTMLElement): TxBar | null {
  const field = root.querySelector<HTMLInputElement>('[data-simplicity-txid]');
  const loadButton = root.querySelector<HTMLButtonElement>('[data-simplicity-load]');
  const select = root.querySelector<HTMLSelectElement>('[data-simplicity-input]');
  const status = root.querySelector<HTMLElement>('[data-simplicity-txstatus]');
  if (!field || !loadButton || !select || !status) return null;

  // `input=N` on the fence, applied once so the reader stays free to change it after.
  const preselect = root.dataset.simplicityInputIndex;
  let preselectApplied = false;

  let loaded: LoadedTransaction | null = null;
  let pending: Promise<LoadedTransaction> | null = null;

  const setStatus = (text: string, kind: 'info' | 'error' | 'ok' = 'info') => {
    status.textContent = text;
    status.className = `rn-txstatus rn-txstatus--${kind}`;
  };

  const populate = (tx: LoadedTransaction) => {
    select.replaceChildren();
    for (const input of tx.inputs) {
      select.append(new Option(describeInput(input), String(input.index)));
    }
    select.disabled = tx.inputs.length === 0;
    if (preselect !== undefined && !preselectApplied) {
      preselectApplied = true;
      // Ignored if there is no such input; the snippet then runs against input 0.
      if (tx.inputs.some((input) => String(input.index) === preselect)) select.value = preselect;
    }
    setStatus(`Loaded — ${tx.inputs.length} ${tx.inputs.length === 1 ? 'input' : 'inputs'}`, 'ok');
  };

  const load = (): Promise<LoadedTransaction> => {
    const txid = field.value.trim();
    if (loaded && loaded.txid === txid.toLowerCase()) return Promise.resolve(loaded);
    if (!pending) {
      setStatus('Loading transaction…');
      loadButton.disabled = true;
      pending = loadTransaction(txid)
        .then((tx) => {
          loaded = tx;
          populate(tx);
          return tx;
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          setStatus(`Could not load: ${message}`, 'error');
          // Rethrow so Run reports it instead of proceeding without data.
          throw new Error(`could not load transaction — ${message}`);
        })
        .finally(() => {
          loadButton.disabled = false;
          pending = null;
        });
    }
    return pending;
  };

  loadButton.addEventListener('click', () => {
    loaded = null; // Honour a changed txid.
    void load().catch(() => {});
  });

  // A new txid invalidates the selector, which otherwise keeps offering another
  // transaction's inputs.
  field.addEventListener('input', () => {
    if (loaded && loaded.txid !== field.value.trim().toLowerCase()) {
      loaded = null;
      select.replaceChildren(new Option('—'));
      select.disabled = true;
      setStatus('Press Load to fetch this transaction');
    }
  });

  return { ensureLoaded: load, selectedInput: () => Number(select.value) || 0 };
}

function mount(root: HTMLElement): void {
  const holder = root.querySelector<HTMLTextAreaElement>('[data-simplicity-source]');
  const editorHost = root.querySelector<HTMLElement>('[data-simplicity-editor]');
  const runButton = root.querySelector<HTMLButtonElement>('[data-simplicity-run]');
  const resetButton = root.querySelector<HTMLButtonElement>('[data-simplicity-reset]');
  const pane = root.querySelector<HTMLElement>('[data-simplicity-output]');
  if (!holder || !editorHost || !runButton || !resetButton || !pane) return;

  const original = holder.value;

  const view = new EditorView({
    state: EditorState.create({
      doc: original,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        // SimplicityHL is deliberately Rust-like, so Rust's grammar highlights it
        // convincingly. A stand-in until the LSP runs in the browser.
        rust(),
        syntaxHighlighting(highlight),
        EditorView.editable.of(root.dataset.simplicityReadonly !== 'true'),
        EditorView.lineWrapping,
      ],
    }),
    parent: editorHost,
  });

  // CodeMirror now owns the content; the textarea was only the no-JS fallback.
  holder.hidden = true;
  editorHost.hidden = false;

  const setBusy = (label: string | null) => {
    runButton.disabled = label !== null;
    runButton.textContent = label ?? 'Run';
  };

  // Null on a non-`tx` snippet, which runs against the dummy environment.
  const transaction = root.hasAttribute('data-simplicity-tx') ? mountTxBar(root) : null;

  const run = async () => {
    const source = view.state.doc.toString();
    setBusy('Loading…');
    try {
      // Load the transaction first: a clearer failure, and it avoids fetching 2 MB of
      // wasm only to discover the txid was wrong.
      const loaded = transaction ? await transaction.ensureLoaded() : null;

      const compiler = await loadCompiler();
      setBusy('Running…');
      const result = loaded
        ? compiler.run_program_with_tx(
            source,
            loaded.hex,
            loaded.prevTxsHex,
            transaction!.selectedInput(),
            GENESIS_HASH,
          )
        : compiler.run_program(source);
      view.dispatch(setDiagnostics(view.state, toCmDiagnostics(source, result.diagnostics)));
      renderOutput(pane, result);
    } catch (error) {
      // Infrastructure failure, not a fault in the reader's code — say so, or someone
      // spends twenty minutes debugging correct SimplicityHL.
      pane.replaceChildren();
      pane.hidden = false;
      const line = document.createElement('div');
      line.className = 'rn-status rn-status--error';
      line.textContent = `Could not run the compiler: ${
        error instanceof Error ? error.message : String(error)
      }`;
      pane.append(line);
    } finally {
      setBusy(null);
    }
  };

  runButton.addEventListener('click', () => void run());

  resetButton.addEventListener('click', () => {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: original } });
    view.dispatch(setDiagnostics(view.state, []));
    pane.hidden = true;
    pane.replaceChildren();
  });

  editorHost.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      void run();
    }
  });
}

export function mountAll(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-simplicity-runnable]')) {
    if (root.dataset.simplicityMounted === 'true') continue;
    root.dataset.simplicityMounted = 'true';
    mount(root);
  }
}

/** Material's page-load observable, present only if `navigation.instant` is on. */
declare const document$: { subscribe(next: () => void): void } | undefined;

mountAll();
if (typeof document$ !== 'undefined') document$.subscribe(() => mountAll());
