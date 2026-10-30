#!/usr/bin/env node
// Starts the published REA MCP server for Claude Code.
//
// This repository's own package.json is named "rea-agents", so running
// `npx rea-agents` from here would pick the unbuilt source checkout instead of
// the published package. Launching npx from the OS temp directory avoids that.
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

const REA_VERSION = process.env.REA_AGENTS_VERSION || "6.8.0";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(npx, ["-y", `rea-agents@${REA_VERSION}`, "mcp"], {
  cwd: tmpdir(),
  stdio: "inherit",
  shell: process.platform === "win32",
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`[rea-mcp] failed to start npx: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
