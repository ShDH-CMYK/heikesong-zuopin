// api-client.js — 唯一负责与智谱 API 通信的模块:密钥存取、请求、错误分类。
// 安全约定:密钥只保存在用户浏览器 localStorage,绝不写入代码或仓库。

const API_ENDPOINT = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const API_MODEL = "glm-4.7-flash"; // 用真实密钥联调时验证;若模型名无效,只改这一行
const API_KEY_STORAGE = "human-report-apikey-v1";
const REQUEST_TIMEOUT_MS = 10000;

const ERROR_MESSAGES = {
  AUTH: "密钥未通过验证，请检查后重新登记。",
  RATE_LIMIT: "研究所线路拥挤（触发限流），请稍后重试。",
  NETWORK: "研究员通讯中断，请检查网络后重试。",
  FORMAT: "研究员返回了无法归档的报告，请重试。",
};

function readApiKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch {
    return ""; // 无 localStorage(隐私模式、Node 测试)时静默降级
  }
}

function saveApiKey(key) {
  try {
    localStorage.setItem(API_KEY_STORAGE, key);
    return true;
  } catch {
    return false;
  }
}

function clearApiKey() {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // 同上,静默降级
  }
}

function classifyStatus(code) {
  if (code === 401 || code === 403) return "AUTH";
  if (code === 429) return "RATE_LIMIT";
  return "NETWORK";
}

function apiError(kind) {
  const error = new Error(ERROR_MESSAGES[kind]);
  error.kind = kind;
  return error;
}

async function callOnce(sampleText, apiKey, strict) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const systemContent = strict
    ? SYSTEM_PROMPT + "\n上一次输出无法解析归档。只输出一个 JSON 对象，不要任何其他文字。"
    : SYSTEM_PROMPT;
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      signal: controller.signal,
      body: JSON.stringify({
        model: API_MODEL,
        temperature: 0.9,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: buildUserMessage(sampleText) },
        ],
      }),
    });
    if (!response.ok) throw apiError(classifyStatus(response.status));
    const data = await response.json();
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    const parsed = extractJson(typeof content === "string" ? content : "");
    if (!parsed) throw apiError("FORMAT");
    const check = validateReport(parsed);
    if (!check.ok) throw apiError("FORMAT");
    return check.report;
  } catch (err) {
    if (err && (err.name === "AbortError" || err instanceof TypeError)) throw apiError("NETWORK");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// 生成一份观察报告;FORMAT 类失败自动带严格指令重试 1 次
async function requestReport(sampleText) {
  const apiKey = readApiKey();
  if (!apiKey) throw apiError("AUTH");
  try {
    return await callOnce(sampleText, apiKey, false);
  } catch (err) {
    if (err && err.kind === "FORMAT") return callOnce(sampleText, apiKey, true);
    throw err;
  }
}

// 供 Node 单测 require;浏览器以 <script> 加载时 module 未定义,自动跳过。
// 浏览器中 SYSTEM_PROMPT/buildUserMessage/extractJson/validateReport 由先加载的 prompt.js 提供
if (typeof module !== "undefined" && module.exports) {
  module.exports = { API_ENDPOINT, API_MODEL, API_KEY_STORAGE, readApiKey, saveApiKey, clearApiKey, ERROR_MESSAGES, classifyStatus, requestReport };
}
