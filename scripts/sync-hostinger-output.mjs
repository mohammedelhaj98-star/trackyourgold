import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceNextDir = path.join(repoRoot, "apps", "web", ".next");
const targetNextDir = path.join(repoRoot, ".next");

if (!existsSync(sourceNextDir)) {
  throw new Error(`Expected web build output at ${sourceNextDir}`);
}

rmSync(targetNextDir, { recursive: true, force: true });
mkdirSync(targetNextDir, { recursive: true });
cpSync(sourceNextDir, targetNextDir, { recursive: true });

console.log(`Synced ${sourceNextDir} to ${targetNextDir}`);
