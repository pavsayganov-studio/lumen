import type { Account, CategoryId, InsightId, Project, Transaction } from "./finance.ts";

/** Local-only transfer code. Nothing here is uploaded. */

export interface Snapshot {
  v: 1;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Record<string, number>;
  allocations: Record<string, Partial<Record<CategoryId, number>>>;
  projects: Project[];
  month: string;
  insightOrder: InsightId[];
  hiddenInsights: InsightId[];
  /** True when the data is the made-up sample set. */
  demo?: boolean;
}

export class BackupError extends Error {
  code: "passphrase" | "format" | "damaged";
  constructor(code: BackupError["code"]) {
    super(code);
    this.code = code;
  }
}

const TEXT = new TextEncoder();
const TEXT_DEC = new TextDecoder();

function bytesToB64url(bytes: Uint8Array) {
  let raw = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) raw += String.fromCharCode(...bytes.subarray(i, i + step));
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlToBytes(value: string) {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function copyBytes(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

async function gzip(text: string) {
  const stream = new Blob([copyBytes(TEXT.encode(text))]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array) {
  const stream = new Blob([copyBytes(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return TEXT_DEC.decode(await new Response(stream).arrayBuffer());
}

async function sha16(bytes: Uint8Array) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
  return [...digest.slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function keyFrom(passphrase: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey("raw", TEXT.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 120_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function exportBackup(snapshot: Snapshot, passphrase = "") {
  const packed = await gzip(JSON.stringify(snapshot));
  const phrase = passphrase.trim();
  if (!phrase) {
    const body = JSON.stringify({ v: 1, sum: await sha16(packed), d: bytesToB64url(packed) });
    return `LUMEN1.${bytesToB64url(TEXT.encode(body))}`;
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(phrase, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, packed as BufferSource));
  const body = JSON.stringify({
    v: 1,
    salt: bytesToB64url(salt),
    iv: bytesToB64url(iv),
    ct: bytesToB64url(ct),
  });
  return `LUMEN1P.${bytesToB64url(TEXT.encode(body))}`;
}

export async function importBackup(code: string, passphrase = ""): Promise<Snapshot> {
  const trimmed = code.trim().replace(/\s+/g, "");
  const locked = trimmed.startsWith("LUMEN1P.");
  const open = trimmed.startsWith("LUMEN1.");
  if (!locked && !open) throw new BackupError("format");
  let envelope: { v?: number; sum?: string; d?: string; salt?: string; iv?: string; ct?: string };
  try {
    const raw = TEXT_DEC.decode(b64urlToBytes(trimmed.slice(trimmed.indexOf(".") + 1)));
    envelope = JSON.parse(raw) as typeof envelope;
  } catch {
    throw new BackupError("format");
  }
  try {
    let packed: Uint8Array;
    if (locked) {
      if (!passphrase.trim()) throw new BackupError("passphrase");
      if (!envelope.salt || !envelope.iv || !envelope.ct) throw new BackupError("format");
      const salt = b64urlToBytes(envelope.salt);
      const iv = b64urlToBytes(envelope.iv);
      const key = await keyFrom(passphrase.trim(), salt);
      packed = new Uint8Array(
        await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, b64urlToBytes(envelope.ct) as BufferSource),
      );
    } else {
      if (!envelope.d || !envelope.sum) throw new BackupError("format");
      packed = b64urlToBytes(envelope.d);
      if ((await sha16(packed)) !== envelope.sum) throw new BackupError("damaged");
    }
    const parsed = JSON.parse(await gunzip(packed)) as Snapshot;
    if (parsed.v !== 1 || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.accounts)) throw new BackupError("damaged");
    parsed.projects ??= [];
    return parsed;
  } catch (error) {
    if (error instanceof BackupError) throw error;
    if (locked) throw new BackupError("passphrase");
    throw new BackupError("damaged");
  }
}
