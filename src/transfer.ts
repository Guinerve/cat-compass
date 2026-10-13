import { parseBackup, type Backup } from "./care";

const b64 = (bytes: Uint8Array) => btoa(Array.from(bytes, b => String.fromCharCode(b)).join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
async function key(password: string, salt: Uint8Array<ArrayBuffer>) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
export function companionUrl(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Use the trusted HTTPS address where Cat Compass is hosted.");
  url.hash = ""; url.search = ""; return url;
}
export async function sealTransfer(backup: Backup, password: string, now = Date.now()): Promise<string> {
  if (password.length < 12) throw new Error("Use a transfer password with at least 12 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify({ expires: now + 86400000, backup }));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(password, salt), data);
  return ["v1", b64(salt), b64(iv), b64(new Uint8Array(ciphertext))].join(".");
}
export async function openTransfer(token: string, password: string, now = Date.now()): Promise<Backup> {
  if (token.length > 2000000) throw new Error("Transfer is too large.");
  try {
    const [version, s, i, c, extra] = token.split(".");
    if (version !== "v1" || !s || !i || !c || extra) throw new Error();
    const salt = unb64(s), iv = unb64(i);
    if (salt.length !== 16 || iv.length !== 12) throw new Error();
    const decoded = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, await key(password, salt), unb64(c));
    const data: unknown = JSON.parse(new TextDecoder().decode(decoded));
    if (!data || typeof data !== "object" || !("expires" in data) || typeof data.expires !== "number" || !Number.isFinite(data.expires) || data.expires < now || !("backup" in data)) throw new Error();
    return parseBackup(data.backup);
  } catch { throw new Error("Transfer could not be opened. Check the password. Links expire after 24 hours."); }
}
