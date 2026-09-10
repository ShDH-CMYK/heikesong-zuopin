const { test } = require("node:test");
const assert = require("node:assert");

const {
  SYSTEM_PROMPT,
  buildUserMessage,
  extractJson,
  validateReport,
} = require("../prompt.js");

test("validateReport 接受合法报告并保留 level", () => {
  const result = validateReport({
    subject: "熬夜刷手机", title: "睡眠系统遭遇主动延期", observation: "观察记录",
    roast: "吐槽", advice: "建议", level: 4, leaked_note: "它明明知道明早要开会",
  });
  assert.equal(result.ok, true);
  assert.equal(result.report.level, 4);
});

test("validateReport 拒绝缺字段", () => {
  const result = validateReport({ subject: "x", title: "x", observation: "x", roast: "x", advice: "x", level: 3 });
  assert.equal(result.ok, false);
});

test("validateReport 拒绝越界 level", () => {
  const result = validateReport({ subject: "s", title: "t", observation: "o", roast: "r", advice: "a", level: 9, leaked_note: "n" });
  assert.equal(result.ok, false);
});

test("validateReport 拒绝非整数 level", () => {
  const result = validateReport({ subject: "s", title: "t", observation: "o", roast: "r", advice: "a", level: 3.5, leaked_note: "n" });
  assert.equal(result.ok, false);
});

test("validateReport 拒绝空字符串字段", () => {
  const result = validateReport({ subject: "  ", title: "t", observation: "o", roast: "r", advice: "a", level: 2, leaked_note: "n" });
  assert.equal(result.ok, false);
});

test("validateReport 对 level 字符串数字也放行并转为整数", () => {
  const result = validateReport({ subject: "s", title: "t", observation: "o", roast: "r", advice: "a", level: "4", leaked_note: "n" });
  assert.equal(result.ok, true);
  assert.equal(result.report.level, 4);
});

test("buildUserMessage 包含样本原文", () => {
  assert.equal(buildUserMessage("我又熬夜了"), "观察样本：我又熬夜了");
});

test("extractJson 能剥离 markdown 围栏", () => {
  const value = extractJson('```json\n{"a":1}\n```');
  assert.deepEqual(value, { a: 1 });
});

test("extractJson 能从前后杂讯中提取", () => {
  const value = extractJson('好的，以下是报告：\n{"a":1}\n希望有帮助');
  assert.deepEqual(value, { a: 1 });
});

test("extractJson 对无 JSON 文本返回 null", () => {
  assert.equal(extractJson("抱歉，我无法完成"), null);
});

test("SYSTEM_PROMPT 包含安全边界与 JSON 字段要求", () => {
  assert.match(SYSTEM_PROMPT, /不评价用户的身份/);
  assert.match(SYSTEM_PROMPT, /leaked_note/);
  assert.match(SYSTEM_PROMPT, /只输出一个 JSON 对象/);
});
