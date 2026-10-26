import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  const port = address.port;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("static server serves app assets with security headers and blocks traversal", { timeout: 12000 }, async (t) => {
  const port = await freePort();
  const child = spawn(process.execPath, ["scripts/serve.mjs"], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore"
  });
  t.after(async () => {
    if (child.exitCode !== null) return;
    const exitPromise = once(child, "exit").catch(() => []);
    child.kill();
    await Promise.race([exitPromise, pause(1000)]);
  });

  let response = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      response = await fetch("http://127.0.0.1:" + port + "/");
      break;
    } catch {
      if (child.exitCode !== null) throw new Error("Static server exited before becoming ready.");
      await pause(100);
    }
  }
  assert.ok(response, "server should start and accept a request");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-security-policy") || "", /default-src 'self'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(await response.text(), /Inspectra — Operational Assurance/);

  const scriptResponse = await fetch("http://127.0.0.1:" + port + "/src/main.js");
  assert.equal(scriptResponse.status, 200);
  assert.match(scriptResponse.headers.get("content-type") || "", /javascript/);
  assert.match(await scriptResponse.text(), /renderOverview/);

  const postResponse = await fetch("http://127.0.0.1:" + port + "/", { method: "POST" });
  assert.equal(postResponse.status, 405);

  const traversal = await fetch("http://127.0.0.1:" + port + "/..%2fpackage.json");
  assert.equal(traversal.status, 403);
});
