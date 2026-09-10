const { test } = require("node:test");
const assert = require("node:assert");

// 测试开始前确保无 localStorage(较新版本 Node 可能自带),以覆盖"无存储时静默降级"路径
try { delete globalThis.localStorage; } catch {}

const {
  API_KEY_STORAGE,
  readApiKey,
  saveApiKey,
  clearApiKey,
  ERROR_MESSAGES,
  classifyStatus,
} = require("../api-client.js");

test("classifyStatus: 401/403 归为 AUTH", () => {
  assert.equal(classifyStatus(401), "AUTH");
  assert.equal(classifyStatus(403), "AUTH");
});

test("classifyStatus: 429 归为 RATE_LIMIT", () => {
  assert.equal(classifyStatus(429), "RATE_LIMIT");
});

test("classifyStatus: 其他非 2xx 归为 NETWORK", () => {
  assert.equal(classifyStatus(500), "NETWORK");
  assert.equal(classifyStatus(404), "NETWORK");
});

test("Node 环境没有 localStorage 时,密钥读写静默降级", () => {
  assert.equal(readApiKey(), "");
  assert.equal(saveApiKey("any-key"), false);
  clearApiKey(); // 不应抛错
});

test("ERROR_MESSAGES 四种错误都有中文文案", () => {
  for (const kind of ["AUTH", "RATE_LIMIT", "NETWORK", "FORMAT"]) {
    assert.equal(typeof ERROR_MESSAGES[kind], "string");
    assert.ok(ERROR_MESSAGES[kind].length > 5);
  }
});

test("密钥存储键名符合约定", () => {
  assert.equal(API_KEY_STORAGE, "human-report-apikey-v1");
});
