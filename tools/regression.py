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

    # 6. deepseek 3d (explicitly switch to 拆镜 = index 1)
    sw(page, 1, 2600)
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
    page.evaluate("""() => document.getElementById('backstage-close').click()""")
    page.wait_for_timeout(400)

    # 9. absurd alert
    page.evaluate("""() => document.getElementById('clear-btn').click()""")
    page.wait_for_timeout(500)
    for _ in range(3):
        ask_topic(page, "rich", 1600)
    check("24 连续三条离谱触发告警", page.evaluate("""() => document.getElementById('alert-banner').classList.contains('is-show')"""))

    # 10. poke / surprise / sound
    page.evaluate("""() => document.getElementById('poke-btn').click()""")
    page.wait_for_timeout(400)
    check("25 戳它一下出气泡", "is-show" in (page.locator("#bubble").get_attribute("class") or ""))
    before = page.evaluate("""() => document.querySelectorAll('.msg--user').length""")
    page.evaluate("""() => document.getElementById('surprise-btn').click()""")
    page.wait_for_timeout(1800)
    after = page.evaluate("""() => document.querySelectorAll('.msg--user').length""")
    check("26 随机离谱自动提问", after == before + 1, (before, after))
    s1 = page.evaluate("""() => document.getElementById('sound-btn').getAttribute('aria-pressed')""")
    page.evaluate("""() => document.getElementById('sound-btn').click()""")
    s2 = page.evaluate("""() => document.getElementById('sound-btn').getAttribute('aria-pressed')""")
    check("27 音效开关切换", s1 != s2, (s1, s2))

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
    check("28 清空后指数日志告警归零", cl["meter"] == "0" and cl["badge"] == "0" and not cl["alert"], cl)
    check("29 清空后重新打招呼", cl["msgs"] == 1 and cl["hint"], cl)

    # 12. back home
    page.evaluate("""() => document.getElementById('home-btn').click()""")
    page.wait_for_timeout(1300)
    check("30 换一只返回首页", page.evaluate("""() => document.getElementById('scene-home').classList.contains('is-active') && !document.getElementById('scene-lab').classList.contains('is-active')"""))

    # 13. mobile
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(500)
    of1 = page.evaluate("""() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8""")
    check("31 窄屏首页无横向溢出", not of1, of1)
    page.evaluate("""() => document.querySelectorAll('.pet-card')[4].click()""")
    page.wait_for_selector("#scene-lab.is-active", timeout=8000)
    page.wait_for_timeout(1200)
    of2 = page.evaluate("""() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8""")
    check("32 窄屏实验室无溢出", not of2, of2)

    check("33 全程无 JS 报错", not errs, errs[:2])
    bad = [u for u in failed if "fonts.g" not in u]
    check("34 全程无资源加载失败", not bad, bad[:2])
    browser.close()

fails = [r for r in R if not r["pass"]]
print("\n==== SUMMARY ====", flush=True)
print(f"{len(R) - len(fails)}/{len(R)} passed", flush=True)
for f in fails:
    print("FAIL:", f["case"], f["detail"], flush=True)
raise SystemExit(1 if fails else 0)
