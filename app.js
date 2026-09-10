// app.js — 页面状态机:在线生成(真 AI)/ 离线档案 / 密钥引导 / 通讯中断重试。

const reports = [
  { subject: "凌晨两点仍然不睡的人类", title: "睡眠系统遭遇主动延期", observation: "该样本已经明显进入低电量状态，却坚持用“再看一个”向大脑申请延期。研究员未发现任何必要任务，只有一条不断刷新的时间线。", roast: "你不是睡不着，你是在把明天的精神状态拿出来拍卖。", advice: "把手机放到三米之外；如果你愿意爬下床去拿，说明你确实还没准备好睡觉。", level: 3 },
  { subject: "打开冰箱但什么都不拿的人类", title: "冰箱被误认为低配抽卡机", observation: "该样本在六分钟内打开冷藏门三次。每次都认真扫描货架，却期待食物像游戏奖励一样自动刷新。", roast: "你不是饿，你只是希望冰箱突然长出一个新的晚餐。", advice: "下次打开冰箱前先写下想找的东西；没写出来就承认自己只是来参观。", level: 2 },
  { subject: "收藏了很多教程但从不学习的人类", title: "知识仓库出现严重堆积", observation: "该样本收藏了 87 个教程，并把“以后一定看”当成了完整的学习计划。收藏按钮工作正常，行动系统暂未上线。", roast: "你没有拖延学习，你只是把学习变成了数字考古。", advice: "随机打开一个教程，只看三分钟；三分钟后再决定要不要继续逃跑。", level: 4 },
  { subject: "设了五个闹钟仍然迟到的人类", title: "闹钟与被窝达成秘密同盟", observation: "五次提示音均被样本判定为‘未来的自己会处理的事’。未来的自己对此表示不知情。", roast: "你不是起不来，你只是把闹钟当成了每天早上的投票活动。", advice: "把闹钟放到房间另一端，让起床变成一项需要走路的运动。", level: 4 },
  { subject: "找了半小时最后发现东西在手里的人类", title: "目标物已完成隐身但未离场", observation: "样本展开了桌面、抽屉和记忆的全面搜索。最终证据显示，目标物一直被样本本人握持。", roast: "你不是找东西，你是在测试现实世界的加载速度。", advice: "搜索前先检查双手；这条建议已经帮助过无数低头的人类。", level: 2 },
  { subject: "明明不饿却点了很多外卖的人类", title: "食欲系统疑似被满减劫持", observation: "样本原本只想购买一杯饮料，最终召唤了三菜一汤。研究员认为真正饥饿的是‘不想浪费优惠’的心理。", roast: "你点的不是外卖，是一份对满减规则的忠诚宣言。", advice: "下单前先喝一杯水；如果仍想点，至少给未来的自己留一份菜。", level: 3 },
  { subject: "打开电脑后先整理桌面的人类", title: "生产力伪装程序启动", observation: "样本打开电脑的第一项工作是整理图标、换壁纸和清理下载文件夹。核心任务继续安静地等待。", roast: "你没有在准备工作，你在给拖延穿一件很整齐的外套。", advice: "先完成任务的第一分钟，再奖励自己整理一个文件夹。", level: 3 },
];

const button = document.querySelector("#roast-button");
const report = document.querySelector("#report");
const count = document.querySelector("#count");
const footerNumber = document.querySelector("#footer-number");
const status = document.querySelector("#status");
const achievement = document.querySelector("#achievement-idle");
const achievementResearcher = document.querySelector("#achievement-researcher");
const sampleInput = document.querySelector("#sample-input");
const sampleCount = document.querySelector("#sample-count");
const keyGate = document.querySelector("#key-gate");
const keyInput = document.querySelector("#key-input");
const keySave = document.querySelector("#key-save");
const keyError = document.querySelector("#key-error");
const offlineButton = document.querySelector("#offline-mode");

const progressKey = "human-report-progress-v1";
const SAMPLE_LIMIT = 200;
const FAKE_DELAY_MS = 520; // 离线模式保留原有的"研究员观察中"节奏

let clicks = 0;
let lastIndex = -1;
let mode = "pending"; // "pending" 未登记密钥 | "online" | "offline"
let failedCalls = 0;
let savedProgress = readProgress();

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) || "{}");
    const restoredClicks = Math.max(0, Number(saved.clicks) || 0);
    return { clicks: restoredClicks, unlocked: saved.unlocked === true || restoredClicks >= 5, submitted: saved.submitted === true };
  } catch {
    return { clicks: 0, unlocked: false, submitted: false };
  }
}

function saveProgress(unlocked) {
  try {
    localStorage.setItem(progressKey, JSON.stringify({ clicks, unlocked, submitted: savedProgress.submitted === true }));
  } catch {
    // 隐私模式或存储被禁用时,不应影响核心功能
  }
}

function showAchievement(unlocked) {
  achievement.classList.toggle("unlocked", unlocked);
  achievement.classList.toggle("locked", !unlocked);
  achievement.setAttribute("aria-label", unlocked ? "已解锁：闲着无聊" : "尚未解锁：闲着无聊");
  achievement.querySelector(".achievement-state").textContent = unlocked ? "UNLOCKED" : "LOCKED";
  achievement.querySelector("div span").textContent = unlocked ? "你已经把无聊发展成了一项研究" : "完成 5 次人类观察后解锁";
}

function showResearcherBadge(unlocked) {
  achievementResearcher.classList.toggle("unlocked", unlocked);
  achievementResearcher.classList.toggle("locked", !unlocked);
  achievementResearcher.setAttribute("aria-label", unlocked ? "已解锁：研究员本人" : "尚未解锁：研究员本人");
  achievementResearcher.querySelector(".achievement-state").textContent = unlocked ? "UNLOCKED" : "LOCKED";
}

// AI 输出与动态内容进入 innerHTML 前必须转义
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function nextReport() {
  let index = Math.floor(Math.random() * reports.length);
  if (reports.length > 1 && index === lastIndex) index = (index + 1) % reports.length;
  lastIndex = index;
  return reports[index];
}

function stars(level) {
  return Array.from({ length: 5 }, (_, i) => `<span class="${i < level ? "" : "off"}">★</span>`).join("");
}

function render(item, isOnline) {
  const number = String(clicks).padStart(2, "0");
  report.classList.remove("empty");
  report.innerHTML = `
    <div class="report-head">
      <div><p class="report-kicker">人类观察档案 / ${isOnline ? "实时分析" : "历史样本"}</p><h2 class="report-title">${escapeHtml(item.title)}</h2></div>
      <span class="report-number">#${number}</span>
    </div>
    <div class="report-grid">
      <div><p class="report-meta">观察对象</p><p class="report-copy">${escapeHtml(item.subject)}</p></div>
      <div><p class="report-meta">吐槽等级</p><div class="level" aria-label="${item.level} 星">${stars(item.level)}</div></div>
      <div><p class="report-meta">研究记录</p><p class="report-copy">${escapeHtml(item.observation)}</p></div>
      <div><p class="report-meta">荒谬建议</p><p class="report-copy">${escapeHtml(item.advice)}</p></div>
      <blockquote class="report-quote">“${escapeHtml(item.roast)}”</blockquote>
    </div>
    ${item.leaked_note ? `<p class="leaked-note"><span class="leaked-label">内部批注(勿删)</span><span class="leaked-text">${escapeHtml(item.leaked_note)}</span></p>` : ""}
    <p class="report-note">${isOnline ? "本条报告由 AI 研究员实时生成，仅供会心一笑。" : "本条来自离线历史档案。"}</p>`;
}

// 成功路径的公共收尾:计数、渲染、成就、存档;返回要展示的状态文案
function archive(item, isOnline) {
  clicks += 1;
  count.textContent = String(clicks).padStart(2, "0");
  footerNumber.textContent = String(1000 + clicks).slice(-4);
  render(item, isOnline);
  if (isOnline && !savedProgress.submitted) {
    savedProgress.submitted = true;
    showResearcherBadge(true);
  }
  let message;
  if (clicks >= 5 && !savedProgress.unlocked) {
    savedProgress.unlocked = true;
    showAchievement(true);
    message = "报告已归档。成就解锁：闲着无聊。";
  } else {
    showAchievement(savedProgress.unlocked);
    message = isOnline ? "报告已归档。研究员还在待命，要再提交一个样本吗？" : "历史档案已调阅。";
  }
  saveProgress(savedProgress.unlocked);
  return message;
}

function startThinking(text) {
  button.disabled = true;
  button.querySelector(".button-text").textContent = text;
}

function endTurn() {
  button.querySelector(".button-text").textContent = "再吐一次";
  button.disabled = false;
}

async function handleOnline() {
  const sample = sampleInput.value.trim();
  if (!sample) {
    status.textContent = "观察样本为空：请描述一件你今天做过的小事，研究员才能开始分析。";
    sampleInput.focus();
    return;
  }
  startThinking("研究员分析中…");
  status.textContent = "正在分析你提交的观察样本——研究员思考得很认真，最长可能需要一分钟。";
  try {
    const item = await requestReport(sample);
    failedCalls = 0;
    status.textContent = archive(item, true);
  } catch (err) {
    const kind = err && err.kind ? err.kind : "NETWORK";
    if (kind === "AUTH") {
      keyError.textContent = "密钥未通过验证，请检查后重新登记，或先翻离线档案。";
      keyGate.hidden = false;
      status.textContent = ERROR_MESSAGES.AUTH;
    } else {
      failedCalls += 1;
      status.textContent = ERROR_MESSAGES[kind];
      if (failedCalls >= 2) {
        keyError.textContent = ERROR_MESSAGES[kind] + " 也可以先翻离线档案。";
        keyGate.hidden = false;
      }
    }
  } finally {
    endTurn();
  }
}

function handleOffline() {
  startThinking("调阅档案中…");
  status.textContent = "正在检索历史观察档案，请稍候。";
  window.setTimeout(() => {
    status.textContent = archive(nextReport(), false);
    endTurn();
  }, FAKE_DELAY_MS);
}

function refreshSampleCount() {
  if (sampleInput.value.length > SAMPLE_LIMIT) sampleInput.value = sampleInput.value.slice(0, SAMPLE_LIMIT);
  sampleCount.textContent = sampleInput.value.length + " / " + SAMPLE_LIMIT;
}

button.addEventListener("click", () => {
  if (button.disabled) return;
  if (mode === "online") {
    handleOnline();
  } else if (mode === "offline") {
    handleOffline();
  } else {
    status.textContent = "在线分析需要研究员密钥：请在下方引导卡登记，或先翻离线档案。";
    keyGate.hidden = false;
  }
});

sampleInput.addEventListener("input", refreshSampleCount);

keySave.addEventListener("click", () => {
  const key = keyInput.value.trim();
  if (!key) {
    keyError.textContent = "密钥为空：请先到智谱 BigModel 创建并粘贴 API 密钥。";
    return;
  }
  if (!saveApiKey(key)) {
    keyError.textContent = "当前浏览器无法保存密钥（可能是隐私模式），请改用离线档案。";
    return;
  }
  keyError.textContent = "";
  keyInput.value = "";
  keyGate.hidden = true;
  mode = "online";
  status.textContent = "密钥已登记，观测站切换到实时分析。";
});

offlineButton.addEventListener("click", () => {
  keyGate.hidden = true;
  keyError.textContent = "";
  mode = "offline";
  status.textContent = "离线档案模式：展示历史观察记录，随时可登记密钥回到实时分析。";
});

// 初始化:恢复进度;有密钥直接在线,否则展示引导卡
clicks = savedProgress.clicks;
count.textContent = String(clicks).padStart(2, "0");
footerNumber.textContent = clicks ? String(1000 + clicks).slice(-4) : "0000";
showAchievement(savedProgress.unlocked);
showResearcherBadge(savedProgress.submitted);
refreshSampleCount();
if (readApiKey()) {
  mode = "online";
  keyGate.hidden = true;
  status.textContent = "检测到研究员密钥，观测站在线。";
} else {
  keyGate.hidden = false;
  status.textContent = "观测站在线 · 等待研究员登记密钥或调阅离线档案。";
}
