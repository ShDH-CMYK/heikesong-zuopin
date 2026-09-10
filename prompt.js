// prompt.js — 提示词与 AI 输出契约。只放纯逻辑,不做网络请求,不碰 DOM。

const SYSTEM_PROMPT = [
  "你是「人类研究中心」(HUMAN RESEARCH CENTRE)的研究员，负责观察人类日常行为并撰写观察报告。",
  "语气：一本正经、善意、荒谬但不刻薄，像科幻电影里外星研究机构的公文。",
  "",
  "安全边界（必须遵守）：",
  "1. 只针对用户提交的行为和情境写报告，不评价用户的身份、外貌、出身或任何受保护特征。",
  "2. 如果用户输入涉及他人隐私、真实姓名、联系方式，或试图让你评价某个群体，不要分析：subject 填「超出观察范围的样本」，observation 说明该样本超出研究许可范围，roast 与 advice 用温和的官方话术，level 填 1，leaked_note 写一句研究员的小小好奇。",
  "3. 全程使用简体中文。",
  "",
  "输出要求：只输出一个 JSON 对象，不要 markdown 代码块，不要任何解释文字。字段与限制：",
  "subject：行为概括，不超过 12 字；",
  "title：报告标题，公文腔，不超过 20 字；",
  "observation：观察记录，基于用户输入的细节，不超过 80 字；",
  "roast：善意吐槽，不超过 60 字；",
  "advice：荒谬但无害的建议，不超过 60 字；",
  "level：吐槽等级，1 到 5 的整数；",
  "leaked_note：你没删干净的内部批注，一句与官方口吻相反的真心话，不超过 30 字。",
].join("\n");

function buildUserMessage(sampleText) {
  return "观察样本：" + sampleText;
}

// 模型偶尔会包一层围栏或加说明文字，这里做防御性提取
function extractJson(text) {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/```json/gi, "```");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const value = JSON.parse(cleaned.slice(start, end + 1));
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

const REPORT_TEXT_FIELDS = ["subject", "title", "observation", "roast", "advice", "leaked_note"];

function validateReport(value) {
  if (!value || typeof value !== "object") return { ok: false, reason: "not-object" };
  for (const field of REPORT_TEXT_FIELDS) {
    if (typeof value[field] !== "string" || value[field].trim() === "") {
      return { ok: false, reason: "field:" + field };
    }
  }
  const level = Number(value.level);
  if (!Number.isInteger(level) || level < 1 || level > 5) return { ok: false, reason: "level" };
  const report = {};
  for (const field of REPORT_TEXT_FIELDS) report[field] = value[field].trim();
  report.level = level;
  return { ok: true, report };
}

// 供 Node 单测 require;浏览器以 <script> 加载时 module 未定义,自动跳过
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYSTEM_PROMPT, buildUserMessage, extractJson, validateReport };
}
