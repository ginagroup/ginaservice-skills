#!/usr/bin/env node
/**
 * Validate source skill paths and module references in configs/install-modules.json.
 *
 * Run from any working directory:
 *   node tools/validate-install-modules.mjs
 *
 * This intentionally validates source skill directories only. Other manifest paths can
 * represent platform-specific destinations and must not be treated as missing sources
 * without an installer contract that distinguishes source paths from destination paths.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join, relative, isAbsolute, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const manifestPath = join(repoRoot, "configs", "install-modules.json");

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

if (!existsSync(manifestPath)) {
  fail(`Manifest not found: ${manifestPath}`);
  process.exit();
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail(`Manifest is not valid JSON: ${error.message}`);
  process.exit();
}

if (!Array.isArray(manifest.modules)) {
  fail("Manifest must contain a modules array.");
  process.exit();
}

const ids = new Set();
for (const [index, module] of manifest.modules.entries()) {
  if (!module || typeof module !== "object" || typeof module.id !== "string" || !module.id.trim()) {
    fail(`modules[${index}] has no valid id.`);
    continue;
  }
  if (ids.has(module.id)) fail(`Duplicate module id: ${module.id}`);
  ids.add(module.id);
}

for (const [index, module] of manifest.modules.entries()) {
  if (!module || typeof module !== "object") continue;
  if (!Array.isArray(module.paths)) {
    fail(`Module ${module.id ?? index} must contain a paths array.`);
    continue;
  }
  for (const sourcePath of module.paths) {
    if (typeof sourcePath !== "string" || !sourcePath.trim()) {
      fail(`Module ${module.id} contains an empty or non-string path.`);
      continue;
    }
    if (!sourcePath.startsWith("skills/")) continue;

    const normalized = resolve(repoRoot, sourcePath);
    const relativePath = relative(repoRoot, normalized);
    if (
      relativePath === ".." ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      fail(`Skill path escapes repository root: ${sourcePath}`);
      continue;
    }
    if (!existsSync(normalized)) {
      fail(`Skill source path does not exist: ${sourcePath} (module ${module.id})`);
      continue;
    }
    if (!existsSync(join(normalized, "SKILL.md"))) {
      fail(`Skill directory has no SKILL.md: ${sourcePath} (module ${module.id})`);
    }
  }

  for (const dependency of module.dependencies ?? []) {
    if (!ids.has(dependency)) {
      fail(`Module ${module.id} depends on unknown module: ${dependency}`);
    }
  }
}

if (process.exitCode) {
  console.error("Install-module validation failed.");
} else {
  const skillPathCount = manifest.modules.reduce(
    (count, module) => count + (module.paths ?? []).filter((path) => path.startsWith("skills/")).length,
    0,
  );
  console.log(`Install-module validation passed: ${manifest.modules.length} modules, ${skillPathCount} skill source paths.`);
}
