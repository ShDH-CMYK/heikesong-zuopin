# -*- coding: utf-8 -*-
"""Full regression of the core game loop against the local build."""
import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8890/index.html"
R = []


def check(name, ok, detail=""):
    R.append({"case": name, "pass": bool(ok), "detail": str(detail)[:140]})
    print(("PASS " if ok else "FAIL ") + name + "  " + str(detail)[:100], flush=True)


def sw(page, i, wait=900):
    page.evaluate("""(idx) => {
      const b = document.querySelector('.switcher__item[data-index="' + idx + '"]');
      if (b) b.click();
    }""", i)
    page.wait_for_timeout(wait)


def ask_topic(page, topic, wait=1800):
    page.evaluate("""(t) => {
      const b = document.querySelector('.preset[data-topic="' + t + '"]');
      if (b) b.click();
    }""", topic)
    page.wait_for_timeout(wait)


def submit_text(page, text, wait=1800):
    page.evaluate("""(v) => {
      const i = document.getElementById('chat-input');
      i.value = v;
      document.getElementById('composer').requestSubmit();
    }""", text)
    page.wait_for_timeout(wait)


def first_msg(page):
    return page.evaluate("""() => {
      const el = document.querySelector('.msg .msg__body-copy');
      return el ? el.textContent : '';
    }""")


def wait_model_ready(page, seconds=20):
    """Poll instead of sleeping: over WAN the GLB + three.js take far longer than locally."""
    for _ in range(seconds * 2):
        if page.evaluate("() => document.getElementById('stage-pet').classList.contains('is-model-ready')"):
            return True
        page.wait_for_timeout(500)
    return False


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errs, failed = [], []
    page.on("pageerror", lambda e: errs.append(str(e)))
    page.on("requestfailed", lambda r: failed.append(r.url))

    # 1. home
    page.goto(URL, wait_until="domcontentloaded", timeout=15000)
    page.wait_for_selector(".pet-card", timeout=8000)
    names = page.locator(".pet-card__name").all_inner_texts()
    check("01 首页五只宠物为原创名", names == ["暖球", "拆镜", "班班", "报错", "小金"], names)
    check("02 首页无旧品牌名", not page.evaluate("""() => /豆包|DeepSeek|WorkBuddy|Codex|元宝/.test(document.body.innerText)"""))
    check("03 首屏示例与词库一致", "先投三千" in page.evaluate("""() => document.querySelector('.hero-demo__roast').textContent"""))

    # 2. enter lab
    page.evaluate("""() => document.getElementById('random-btn').click()""")
    page.wait_for_selector("#scene-lab.is-active", timeout=8000)
    page.wait_for_timeout(900)
    lab = page.evaluate("""() => document.getElementById('lab-name').textContent""")
    greet1 = first_msg(page)
    check("04 随机按钮进入实验室", lab in ["暖球", "拆镜", "班班", "报错", "小金"], lab)
    check("05 招呼语与当前宠物一致", lab in greet1, greet1[:36])

    # 3. switch with zero asks (pick a pet different from the one random chose)
    cur = page.evaluate("""() => +document.querySelector('.switcher__item.is-active').dataset.index""")
    other = 0 if cur != 0 else 1
    sw(page, other, 800)
    greet2 = first_msg(page)
    cur = other
    target = page.evaluate("""() => document.getElementById('lab-name').textContent""")
    check("06 未提问切换刷新招呼", (target in greet2) and (lab not in greet2), (lab, target, greet2[:36]))

    # 4. preset question
    ask_topic(page, "rich")
    m = page.evaluate("""() => ({
      user: document.querySelectorAll('.msg--user').length,
      ai: document.querySelectorAll('.msg--ai').length,
      roast: document.querySelectorAll('.msg--roast').length,
      bubble: document.getElementById('bubble').classList.contains('is-show'),
      meter: +document.getElementById('meter-val').textContent
    })""")
    check("07 预设提问出三段回复", m["user"] == 1 and m["ai"] >= 1 and m["roast"] == 1, m)
    check("08 吐槽同步头顶气泡", m["bubble"], m["bubble"])
    check("09 离谱指数增加", m["meter"] > 0, m["meter"])

    # 5. switch after ask keeps history + gossip (must move to a different pet)
    nxt = 1 if cur != 1 else 2
    sw(page, nxt, 2600)
    hist = page.evaluate("""() => ({
      user: document.querySelectorAll('.msg--user').length,
      wire: document.querySelectorAll('.msg--wire').length,
      lines: document.querySelectorAll('.msg--wire .wire-line').length,
      greet: (document.querySelector('.msg .msg__body-copy')||{}).textContent || ''
    })""")
    check("10 提问后切换保留历史", hist["user"] == 1, hist["user"])
    check("11 切换触发内部通讯(一问一答两条)", hist["wire"] == 1 and hist["lines"] == 2, hist)
    check("12 提问后切换不重置招呼", target in hist["greet"], (target, hist["greet"][:36]))

    # 6. deepseek 3d (explicitly switch to 拆镜 = index 1, then wait for first render)
    sw(page, 1, 800)
    ready = wait_model_ready(page)
    ds = page.evaluate("""() => {
      const pet = document.getElementById('stage-pet');
      const host = document.getElementById('stage-model-3d');
      const canvas = host && host.querySelector('canvas');
      const img = document.getElementById('lab-pet');
      return {
        name: document.getElementById('lab-name').textContent,
        ready: pet.classList.contains('is-model-ready'),
        canvasVisible: !!(canvas && getComputedStyle(canvas).visibility === 'visible'),
        imgHidden: getComputedStyle(img).display === 'none'
      };
    }""")
    check("13 拆镜舞台名正确", ds["name"] == "拆镜", ds["name"])
    check("14 拆镜 3D 渲染成功", ds["ready"] and ds["canvasVisible"], ds)
    sw(page, 0, 900)
    back = page.evaluate("""() => getComputedStyle(document.getElementById('lab-pet')).display !== 'none'""")
    check("15 切回立绘宠物显示立绘", back, back)

    # 7. input edge cases
    submit_text(page, "   ", 400)
    check("16 纯空格提交被拦截", page.evaluate("""() => document.querySelectorAll('.msg--user').length""") == 1)
    submit_text(page, "<img src=x onerror=alert(1)>")
    xss = page.evaluate("""() => document.querySelectorAll('.msg img[src="x"]').length""")
    check("17 XSS 输入被转义", xss == 0, xss)
    submit_text(page, "啊" * 300)
    ovf = page.evaluate("""() => {
      const els = document.querySelectorAll('.msg--user .msg__body-copy');
      const el = els[els.length - 1];
      return el ? el.scrollWidth > el.clientWidth + 8 : null;
    }""")
    check("18 超长中文不撑破气泡", ovf is False, ovf)

    # 8. backstage + confront
    page.evaluate("""() => document.getElementById('backstage-btn').click()""")
    page.wait_for_timeout(500)
    logs = page.evaluate("""() => document.querySelectorAll('.log-entry').length""")
    badge = page.evaluate("""() => +document.getElementById('log-count').textContent""")
    check("19 保密后台记录日志", logs >= 1 and badge == logs, (logs, badge))
    page.evaluate("""() => { const b = document.querySelector('.log-entry__confront'); if (b) b.click(); }""")
    page.wait_for_timeout(3200)
    conf = page.evaluate("""() => ({
      confront: Array.from(document.querySelectorAll('.msg--user .msg__body-copy')).some(el => el.textContent.includes('偷偷吐槽')),
      ai: document.querySelectorAll('.msg--ai').length,
      logs: document.querySelectorAll('.log-entry').length,
      done: Array.from(document.querySelectorAll('.log-entry__confront')).some(b => b.disabled || b.textContent.includes('已对质'))
    })""")
    check("20 对质出现质问消息", conf["confront"], conf["confront"])
    check("21 对质含官方否认与内心招供", conf["ai"] >= 2, conf["ai"])
    check("22 对质偷偷补记日志", conf["logs"] >= logs + 1, (logs, conf["logs"]))
    check("23 对质按钮变已对质", conf["done"], conf["done"])

    # 8b. auto-generated case report
    page.wait_for_timeout(1100)
    dsr = page.evaluate("""() => {
      const d = document.getElementById('dossier');
      const stats = Array.from(document.querySelectorAll('.dsr-stat')).map(x => +x.querySelector('b').textContent);
      return {
        open: d.classList.contains('is-open') && !d.hidden,
        n: stats[0], absurd: stats[1], m: stats[2], w: stats[3], c: stats[4],
        verdict: (document.querySelector('.dsr-sec--verdict p') || {}).textContent || '',
        placeholder: /\{[nmcw]\}/.test(d.innerText),
        locked: document.body.classList.contains('is-locked'),
        users: document.querySelectorAll('.msg--user').length,
        wires: document.querySelectorAll('.msg--wire').length,
        meter: +document.getElementById('meter-val').textContent
      };
    }""")
    check("24 对质后自动弹出结案报告", dsr["open"], dsr["open"])
    check("25 报告统计与真实互动一致",
          dsr["n"] == dsr["users"] - 1 and dsr["c"] == 1 and dsr["w"] == dsr["wires"] and dsr["m"] == dsr["meter"], dsr)
    check("26 判词已填充无残留占位符", (not dsr["placeholder"]) and len(dsr["verdict"]) > 8, dsr["verdict"][:40])
    page.evaluate("() => document.getElementById('dossier-close').click()")
    page.wait_for_timeout(700)
    dsr2 = page.evaluate("""() => ({
      hidden: document.getElementById('dossier').hidden,
      locked: document.body.classList.contains('is-locked'),
      scrim: document.getElementById('scrim').hidden
    })""")
    check("27 关闭报告后解锁页面", dsr2["hidden"] and not dsr2["locked"] and dsr2["scrim"], dsr2)

    page.evaluate("""() => document.getElementById('backstage-close').click()""")
    page.wait_for_timeout(400)

    # 9. absurd alert
    page.evaluate("""() => document.getElementById('clear-btn').click()""")
    page.wait_for_timeout(500)
    for _ in range(3):
        ask_topic(page, "rich", 1600)
    check("28 连续三条离谱触发告警", page.evaluate("""() => document.getElementById('alert-banner').classList.contains('is-show')"""))

    # 10. poke / surprise / sound
    page.evaluate("""() => document.getElementById('poke-btn').click()""")
    page.wait_for_timeout(400)
    check("29 戳它一下出气泡", "is-show" in (page.locator("#bubble").get_attribute("class") or ""))
    before = page.evaluate("""() => document.querySelectorAll('.msg--user').length""")
    page.evaluate("""() => document.getElementById('surprise-btn').click()""")
    page.wait_for_timeout(1800)
    after = page.evaluate("""() => document.querySelectorAll('.msg--user').length""")
    check("30 随机离谱自动提问", after == before + 1, (before, after))
    s1 = page.evaluate("""() => document.getElementById('sound-btn').getAttribute('aria-pressed')""")
    page.evaluate("""() => document.getElementById('sound-btn').click()""")
    s2 = page.evaluate("""() => document.getElementById('sound-btn').getAttribute('aria-pressed')""")
    check("31 音效开关切换", s1 != s2, (s1, s2))

    # 11. clear
    page.evaluate("""() => document.getElementById('clear-btn').click()""")
    page.wait_for_timeout(600)
    cl = page.evaluate("""() => ({
      msgs: document.querySelectorAll('.msg').length,
      meter: document.getElementById('meter-val').textContent,
      badge: document.getElementById('log-count').textContent,
      alert: document.getElementById('alert-banner').classList.contains('is-show'),
      hint: !!document.querySelector('.messages__hint')
    })""")
    check("32 清空后指数日志告警归零", cl["meter"] == "0" and cl["badge"] == "0" and not cl["alert"], cl)
    check("33 清空后重新打招呼", cl["msgs"] == 1 and cl["hint"], cl)

    # 11b. report resets and reopens from backstage
    page.evaluate("""() => document.getElementById('backstage-btn').click()""")
    page.wait_for_timeout(400)
    page.evaluate("""() => document.getElementById('report-btn').click()""")
    page.wait_for_timeout(600)
    rep = page.evaluate("""() => {
      const d = document.getElementById('dossier');
      const stats = Array.from(document.querySelectorAll('.dsr-stat')).map(x => +x.querySelector('b').textContent);
      return {
        open: d.classList.contains('is-open'),
        backstageClosed: !document.getElementById('backstage').classList.contains('is-open'),
        n: stats[0], c: stats[1 + 3],
        empty: !!document.querySelector('.dsr-empty')
      };
    }""")
    check("34 后台可重开报告且互斥于后台", rep["open"] and rep["backstageClosed"], rep)
    check("35 清空后报告统计归零并显示空态", rep["n"] == 0 and rep["empty"], rep)
    page.evaluate("""() => document.getElementById('dossier-close').click()""")
    page.wait_for_timeout(600)

    # 12. back home
    page.evaluate("""() => document.getElementById('home-btn').click()""")
    page.wait_for_timeout(1300)
    check("36 换一只返回首页", page.evaluate("""() => document.getElementById('scene-home').classList.contains('is-active') && !document.getElementById('scene-lab').classList.contains('is-active')"""))

    # 13. mobile
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(500)
    of1 = page.evaluate("""() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8""")
    check("37 窄屏首页无横向溢出", not of1, of1)
    page.evaluate("""() => document.querySelectorAll('.pet-card')[4].click()""")
    page.wait_for_selector("#scene-lab.is-active", timeout=8000)
    page.wait_for_timeout(1200)
    of2 = page.evaluate("""() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8""")
    check("38 窄屏实验室无溢出", not of2, of2)
    ask_topic(page, "rich", 1700)
    page.evaluate("""() => document.getElementById('backstage-btn').click()""")
    page.wait_for_timeout(400)
    page.evaluate("""() => document.getElementById('report-btn').click()""")
    page.wait_for_timeout(700)
    of3 = page.evaluate("""() => {
      const d = document.getElementById('dossier');
      const r = d.getBoundingClientRect();
      return {
        open: d.classList.contains('is-open'),
        fits: r.width <= innerWidth + 1 && r.height <= innerHeight + 1,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 8
      };
    }""")
    check("39 窄屏结案报告不溢出视口", of3["open"] and of3["fits"] and not of3["overflow"], of3)
    page.evaluate("""() => document.getElementById('dossier-close').click()""")
    page.wait_for_timeout(500)

    # 14. report hardening (second pass findings)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.evaluate("""() => document.getElementById('clear-btn').click()""")
    page.wait_for_timeout(600)
    ask_topic(page, "rich", 1700)
    page.evaluate("""() => document.getElementById('backstage-btn').click()""")
    page.wait_for_timeout(300)
    page.evaluate("""() => document.querySelector('.log-entry__confront').click()""")
    page.wait_for_timeout(4000)
    first_auto = page.evaluate("() => document.getElementById('dossier').classList.contains('is-open')")
    check("40 首次对质自动弹出报告", first_auto, first_auto)
    page.keyboard.press("Escape")
    page.wait_for_timeout(700)
    esc = page.evaluate("""() => ({
      open: document.getElementById('dossier').classList.contains('is-open'),
      hidden: document.getElementById('dossier').hidden,
      locked: document.body.classList.contains('is-locked'),
      scrim: document.getElementById('scrim').hidden
    })""")
    check("41 Esc 关闭报告并复位遮罩", (not esc["open"]) and esc["hidden"] and (not esc["locked"]) and esc["scrim"], esc)
    ask_topic(page, "magic", 1700)
    page.evaluate("""() => document.getElementById('backstage-btn').click()""")
    page.wait_for_timeout(300)
    page.evaluate("""() => { const t = Array.from(document.querySelectorAll('.log-entry__confront')).find(b => !b.classList.contains('is-done')); if (t) t.click(); }""")
    page.wait_for_timeout(4200)
    second_auto = page.evaluate("() => document.getElementById('dossier').classList.contains('is-open')")
    check("42 第二次对质不重复自动弹", not second_auto, second_auto)
    for _ in range(8):
        ask_topic(page, "rich", 1500)
    cap = page.evaluate("() => +document.getElementById('meter-val').textContent")
    check("43 离谱指数封顶不超过 100", 0 < cap <= 100, cap)
    page.evaluate("""() => document.getElementById('backstage-btn').click()""")
    page.wait_for_timeout(300)
    page.evaluate("""() => document.getElementById('report-btn').click()""")
    page.wait_for_timeout(700)
    tier = page.evaluate("() => (document.querySelector('.dsr-tier')||{}).textContent || ''")
    check("44 高档位落到晚期且文案完整", (not tier) or cap < 75 or "晚期" in tier, tier)
    page.evaluate("""() => document.querySelector('.switcher__item[data-index=\\"2\\"]').click()""")
    page.wait_for_timeout(2500)
    both = page.evaluate("""() => ({
      open: document.getElementById('dossier').classList.contains('is-open'),
      scrimHidden: document.getElementById('scrim').hidden,
      locked: document.body.classList.contains('is-locked')
    })""")
    check("45 报告开启时切换宠物不破坏遮罩", both["open"] and (not both["scrimHidden"]) and both["locked"], both)
    page.evaluate("""() => document.getElementById('dossier-close').click()""")
    page.wait_for_timeout(700)

    check("46 全程无 JS 报错", not errs, errs[:2])
    bad = [u for u in failed if "fonts.g" not in u]
    check("47 全程无资源加载失败", not bad, bad[:2])
    browser.close()
fails = [r for r in R if not r["pass"]]
print("\n==== SUMMARY ====", flush=True)
print(f"{len(R) - len(fails)}/{len(R)} passed", flush=True)
for f in fails:
    print("FAIL:", f["case"], f["detail"], flush=True)
raise SystemExit(1 if fails else 0)
