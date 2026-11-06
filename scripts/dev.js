/**
 * Sobe o backend e o frontend juntos, sem depender de pacotes extras
 * como concurrently. Uso: npm run dev (na raiz do projeto)
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendDir = path.join(rootDir, "frontend");
const backendDir = path.join(rootDir, "backend");
const backendEntry = path.join(backendDir, "src", "server.js");
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";

const children = [];
let shuttingDown = false;

function start(command, args, label, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    ...options,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (signal) {
      console.log(`[${label}] encerrado (${signal}).`);
    } else if (code !== 0) {
      console.error(`[${label}] encerrado com código ${code}.`);
    }
    // Se um dos processos cair, encerra o outro para evitar servidor órfão.
    shutdown(code || 1);
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.killed || child.exitCode !== null) continue;
    try {
      child.kill();
    } catch {
      /* ignora */
    }
  }

  setTimeout(() => process.exit(code), 250);
}

start(process.execPath, [backendEntry], "api", { cwd: backendDir });

if (isWindows) {
  start("cmd.exe", ["/c", npmCommand, "run", "dev"], "frontend", {
    cwd: frontendDir,
  });
} else {
  start(npmCommand, ["run", "dev"], "frontend", { cwd: frontendDir });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
