import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../", import.meta.url));
const build = path.join(source, "dist");
const destination = path.resolve(source, "..");
const manifestPath = path.join(source, ".published-files.json");
const allowedRoots = new Set(["assets", "fonts", "media", "models"]);
const allowedFiles = new Set([
  "index.html",
  "favicon.svg",
  "gallery.json",
  "provenance.json",
  "demos.json",
]);
function checkName(name) {
  assert(!path.isAbsolute(name) && !name.split("/").includes(".."));
  assert(allowedFiles.has(name) || allowedRoots.has(name.split("/")[0]));
}

async function collect(directory, prefix = "") {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    assert(!entry.isSymbolicLink(), `Unexpected symlink: ${name}`);
    if (entry.isDirectory()) {
      files.push(
        ...(await collect(path.join(directory, entry.name), name + "/")),
      );
    } else {
      assert(entry.isFile());
      checkName(name);
      const contents = await fs.readFile(path.join(build, name));
      files.push({
        file: name,
        bytes: contents.length,
        sha256: createHash("sha256").update(contents).digest("hex"),
      });
    }
  }
  return files.sort((a, b) => a.file.localeCompare(b.file));
}

// Validate the complete build before touching the published files.
const files = await collect(build);
assert(files.some((entry) => entry.file === "index.html"));
const current = new Set(files.map((entry) => entry.file));
let previous = [];
try {
  previous = JSON.parse(await fs.readFile(manifestPath, "utf8")).files;
  for (const entry of previous) checkName(entry.file);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
for (const entry of files) {
  const target = path.join(destination, entry.file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(path.join(build, entry.file), target);
}
// Remove only files owned by the previous generated manifest.
for (const entry of previous) {
  if (!current.has(entry.file)) {
    await fs.rm(path.join(destination, entry.file), { force: true });
  }
}
await fs.writeFile(
  manifestPath,
  JSON.stringify({ base: "/projects/PhiRIE/", files }, null, 2) + "\n",
);
console.log(`Published ${files.length} files to ${destination}`);
