import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const directory = resolve(process.argv[2] || "release");
const entries = await readdir(directory, { withFileTypes: true });
// AppImage packaging expands x64 to x86_64. Keep public download names consistent.
for (const entry of entries) {
  if (!entry.isFile() || !/^Cat-Compass-.+-linux-x86_64\.AppImage$/.test(entry.name)) continue;
  const name = entry.name.replace("-linux-x86_64.", "-linux-x64.");
  if (entries.some(e => e.name === name)) throw new Error(`Both Linux naming variants exist: ${name}. Review them before publishing.`);
  await rename(join(directory, entry.name), join(directory, name)); entry.name = name;
}
const files = entries.filter(e => e.isFile() && /^Cat-Compass-.+-(mac|win|linux)-(arm64|x64)\.(dmg|zip|exe|AppImage)$/.test(e.name)).map(e => e.name).sort();
if (!files.length) throw new Error("No Cat Compass installers found. Build or collect the release assets first.");
const lines = [];
for (const name of files) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(join(directory, name))) hash.update(chunk);
  lines.push(`${hash.digest("hex")}  ${name}`);
}
await writeFile(join(directory, "SHA256SUMS.txt"), lines.join("\n") + "\n");
console.log(`Wrote SHA256SUMS.txt for ${files.length} installer files.`);
