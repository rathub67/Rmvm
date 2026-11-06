/**
 * Controla o MariaDB portátil incluído em backend/.mariadb.
 * Uso: node scripts/mariadb.js start|stop|status
 *
 * Se a pasta backend/.mariadb não existir (por exemplo, numa máquina sem a
 * versão portátil), o script apenas avisa e deixa o utilizador usar um
 * servidor MariaDB/MySQL já instalado.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(rootDir, "backend");
const mariadbDir = path.join(backendDir, ".mariadb");
const dataDir = path.join(mariadbDir, "data");
const isWindows = process.platform === "win32";
const exe = (name) => path.join(mariadbDir, "bin", `${name}${isWindows ? ".exe" : ""}`);

const mysqld = exe("mysqld");
const mariadbAdmin = exe("mariadb-admin");

const env = readEnv(path.join(backendDir, ".env"));
const host = env.DB_HOST || "127.0.0.1";
const port = Number(env.DB_PORT || 3306);
const user = env.DB_USER || "root";
const password = env.DB_PASSWORD || "";

function readEnv(file) {
  if (!existsSync(file)) return {};

  const values = {};
  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const index = line.indexOf("=");
    if (index === -1) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }
  return values;
}

function isPortOpen() {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const done = (open) => {
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(1000);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function waitForPort(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isPortOpen()) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function waitForClosed(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await isPortOpen())) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function assertInstalled() {
  if (!existsSync(mysqld) || !existsSync(dataDir)) {
    console.warn(
      "[mariadb] Versão portátil não encontrada em backend/.mariadb.\n" +
        "          Configure DB_HOST/DB_PORT no backend/.env para um servidor existente\n" +
        "          ou execute o instalador portátil (ver README)."
    );
    return false;
  }
  return true;
}

async function start({ quiet = false } = {}) {
  if (await isPortOpen()) {
    if (!quiet) console.log(`[mariadb] Já está a correr em ${host}:${port}.`);
    return true;
  }

  if (!assertInstalled()) return false;

  const args = [
    "--no-defaults",
    `--basedir=${mariadbDir}`,
    `--datadir=${dataDir}`,
    `--plugin-dir=${path.join(mariadbDir, "lib", "plugin")}`,
    `--port=${port}`,
    "--console",
  ];

  const child = spawn(mysqld, args, {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();

  const ready = await waitForPort();
  if (!ready) {
    console.error(`[mariadb] Não foi possível iniciar o servidor em ${host}:${port}.`);
    return false;
  }

  console.log(`[mariadb] A correr em ${host}:${port} (base ${env.DB_NAME || "backend_db"}).`);
  return true;
}

async function stop() {
  if (!(await isPortOpen())) {
    console.log(`[mariadb] Não está a correr em ${host}:${port}.`);
    return true;
  }

  if (existsSync(mariadbAdmin)) {
    const result = spawnSync(
      mariadbAdmin,
      ["-h", host, "-P", String(port), "-u", user, `-p${password}`, "shutdown"],
      { stdio: "ignore" }
    );

    if (result.status === 0) {
      if (await waitForClosed()) {
        console.log("[mariadb] Servidor parado.");
        return true;
      }
    }
  }

  console.error("[mariadb] Não foi possível parar o servidor.");
  return false;
}

async function status() {
  if (await isPortOpen()) {
    console.log(`[mariadb] A correr em ${host}:${port}.`);
  } else {
    console.log(`[mariadb] Parado (${host}:${port}).`);
  }
}

const command = process.argv[2] || "status";

if (command === "start") {
  start({ quiet: process.argv.includes("--quiet") }).then((ok) => process.exit(ok ? 0 : 1));
} else if (command === "stop") {
  stop().then((ok) => process.exit(ok ? 0 : 1));
} else if (command === "status") {
  status().then(() => process.exit(0));
} else {
  console.error("Uso: node scripts/mariadb.js start|stop|status");
  process.exit(1);
}
