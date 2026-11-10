// Loads the PA design-system token stylesheets that every page inlines.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "_ds/pa-consulting-design-system-c8c638d2-e948-4822-ae72-4e0cf94e9fb4/tokens"
);

export function loadTokenCss(dir = DS_DIR) {
  const read = (name) => fs.readFileSync(path.join(dir, `${name}.css`), "utf8");
  return { fonts: read("fonts"), colors: read("colors"), typography: read("typography"), spacing: read("spacing") };
}
