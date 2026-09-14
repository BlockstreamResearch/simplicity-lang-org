/**
 * Minimal Esplora client for Liquid testnet transactions.
 *
 * Fetched straight from the reader's browser — the public explorer sends
 * `Access-Control-Allow-Origin: *`, so nothing is proxied through a server of ours.
 */

const API = 'https://blockstream.info/liquidtestnet/api';

/** Liquid testnet genesis hash, as read by `jet::genesis_block_hash`. */
export const GENESIS_HASH = 'a771da8e52ee6ad581ed1e9a99825e5b3b7992225534eaa2ae23244fe26ab1c1';

export interface TxInput {
  index: number;
  /** Transaction this input spends from. */
  txid: string;
  vout: number;
  /** Null when the spent output is blinded. */
  value: number | null;
  asset: string | null;
  isCoinbase: boolean;
}

export interface LoadedTransaction {
  txid: string;
  /** Consensus-encoded, hex. */
  hex: string;
  /** Same, for every transaction referenced by an input. */
  prevTxsHex: string[];
  inputs: TxInput[];
}

const cache = new Map<string, Promise<LoadedTransaction>>();

async function getText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    // A mistyped txid, or one from mainnet — by far the likeliest failure.
    if (response.status === 404) throw new Error('not found on Liquid testnet');
    throw new Error(`explorer returned ${response.status}`);
  }
  return response.text();
}

interface EsploraVin {
  txid: string;
  vout: number;
  is_coinbase: boolean;
  prevout: { value?: number; asset?: string } | null;
}

async function fetchTransaction(txid: string): Promise<LoadedTransaction> {
  const details = JSON.parse(await getText(`${API}/tx/${txid}`)) as { vin: EsploraVin[] };
  const hex = await getText(`${API}/tx/${txid}/hex`);

  const inputs: TxInput[] = details.vin.map((vin, index) => ({
    index,
    txid: vin.txid,
    vout: vin.vout,
    value: vin.prevout?.value ?? null,
    asset: vin.prevout?.asset ?? null,
    isCoinbase: Boolean(vin.is_coinbase),
  }));

  // Whole previous transactions rather than parsed amounts: a blinded output's value
  // exists only as a commitment, so re-deriving it from raw bytes keeps blinded and
  // unblinded inputs on one code path. Deduped — several inputs may share a source.
  const referenced = [...new Set(inputs.filter((i) => !i.isCoinbase).map((i) => i.txid))];
  const prevTxsHex = await Promise.all(referenced.map((id) => getText(`${API}/tx/${id}/hex`)));

  return { txid, hex, prevTxsHex, inputs };
}

/** Load a transaction, cached by txid. */
export function loadTransaction(txid: string): Promise<LoadedTransaction> {
  const key = txid.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(key)) {
    return Promise.reject(new Error('that does not look like a transaction id (64 hex characters)'));
  }
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchTransaction(key);
    // Don't cache failures; a reader who drops connectivity should be able to retry.
    pending.catch(() => cache.delete(key));
    cache.set(key, pending);
  }
  return pending;
}

/** Label for an input in the selector. */
export function describeInput(input: TxInput): string {
  if (input.isCoinbase) return `Input ${input.index} — coinbase`;
  const amount =
    input.value === null
      ? 'confidential'
      : `${input.value.toLocaleString()} of ${(input.asset ?? '').slice(0, 8)}…`;
  return `Input ${input.index} — ${amount}`;
}
