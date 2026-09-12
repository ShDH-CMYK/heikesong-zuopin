"""Real-browser checks for the five interactive GLB characters.

Run: python tools/check-pet-interactions.py http://127.0.0.1:8766/
Requires Playwright and Chromium. Screenshots/results stay in output/playwright/.
"""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('url', nargs='?', default='http://127.0.0.1:8766/')
parser.add_argument('--output', type=Path, default=Path('output/playwright/all-pets'))
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
PETS = [('doubao', '暖球'), ('deepseek', '拆镜'), ('workbuddy', '班班'),
        ('codex', '报错'), ('yuanbao', '小金')]
results = []


def record(name, detail):
    results.append({'check': name, 'passed': True, 'detail': detail})
    print('PASS ' + name, flush=True)


def ready(page, pet):
    page.wait_for_function('''id => {
      const h = document.querySelector('#stage-model-3d');
      return h.dataset.state === 'ready' && h.dataset.pet === id;
    }''', arg=pet, timeout=35000)
    assert page.locator('#stage-model-3d').get_attribute('data-animations') == 'Idle,React'


def select(page, name):
    # The tab strip is horizontally scrollable on phones; force the semantic
    # button click after locating it so an off-screen tab is still selectable.
    tab = page.locator('[role="tab"]').filter(has_text=name)
    if tab.get_attribute('aria-selected') != 'true':
        tab.click(force=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
    errors, requests = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda req: requests.append(req.url) if '.glb?' in req.url else None)
    page.goto(args.url, wait_until='domcontentloaded')
    page.get_by_role('button', name='暖球 ORB 暖球 温柔安慰 · 克制吐槽 去问它一句').click()
    for pet, name in PETS:
        select(page, name)
        ready(page, pet)
        host = page.locator('#stage-model-3d')
        canvas = host.locator('canvas')
        assert canvas.is_visible() and host.locator('canvas').count() == 1
        assert name in canvas.get_attribute('aria-label')
        assert not page.locator('#lab-pet').is_visible()
        canvas.focus()
        canvas.press('Home')
        canvas.screenshot(path=str(args.output / (pet + '-front.png')))
        for _ in range(12):
            canvas.press('ArrowRight')
        canvas.screenshot(path=str(args.output / (pet + '-back.png')))
        assert (args.output / (pet + '-front.png')).read_bytes() != (args.output / (pet + '-back.png')).read_bytes()
        canvas.press('Home')
        if pet == 'doubao':
            base_view = canvas.screenshot()
            canvas.press('+')
            page.wait_for_timeout(60)
            assert canvas.screenshot() != base_view
            canvas.press('Home')
            page.wait_for_timeout(60)
            assert canvas.screenshot() == base_view
            box = canvas.bounding_box()
            page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
            page.mouse.wheel(0, -220)
            page.wait_for_timeout(100)
            assert canvas.screenshot() != base_view
            canvas.press('Home')
            record('Keyboard and wheel zoom, Home reset', True)
        canvas.press('Enter')
        page.wait_for_function("document.querySelector('#stage-model-3d').dataset.action === 'React'")
        page.wait_for_function("document.querySelector('#stage-model-3d').dataset.action === 'Idle'")
        assert host.get_attribute('data-pet') == pet
        record(name + ' model, orbit, keyboard interaction and return to idle', pet)

    for pet, name in reversed(PETS):
        select(page, name)
        ready(page, pet)
    assert len(requests) == 5, requests
    record('Repeated switches reuse five assets and one renderer', len(requests))

    # Drag and pinch must not accidentally trigger poke; click hits the model.
    canvas = page.locator('#stage-model-3d canvas')
    rect = canvas.bounding_box()
    cx, cy = rect['x'] + rect['width'] / 2, rect['y'] + rect['height'] / 2
    page.mouse.move(cx, cy)
    page.mouse.down()
    page.mouse.move(cx + 90, cy + 25, steps=10)
    page.mouse.up()
    page.wait_for_timeout(350)
    assert page.locator('#stage-model-3d').get_attribute('data-action') == 'Idle'
    canvas.press('Home')
    page.mouse.click(cx, cy)
    page.wait_for_function("document.querySelector('#stage-model-3d').dataset.action === 'React'")
    page.wait_for_function("document.querySelector('#stage-model-3d').dataset.action === 'Idle'")
    record('Pointer drag does not poke; model click plays React', True)

    # Delayed responses finish out of order while users change the selection.
    cold = browser.new_page(viewport={'width': 1280, 'height': 900})
    held = []
    cold.route('**/pets/doubao.glb*', lambda route: held.append(route))
    cold.goto(args.url, wait_until='domcontentloaded')
    cold.get_by_role('button', name='暖球 ORB 暖球 温柔安慰 · 克制吐槽 去问它一句').click()
    cold.wait_for_function("document.querySelector('#stage-model-3d').dataset.state === 'loading'")
    select(cold, '小金')
    ready(cold, 'yuanbao')
    assert held
    for route in held:
        route.abort()
    cold.wait_for_timeout(300)
    assert cold.locator('#stage-model-3d').get_attribute('data-state') == 'ready'
    assert cold.locator('#stage-model-3d').get_attribute('data-pet') == 'yuanbao'
    record('Stale failed request cannot replace or hide the selected character', True)
    cold.unroute('**/pets/doubao.glb*')
    select(cold, '暖球')
    ready(cold, 'doubao')
    record('A later selection retries failed downloads', True)
    cold.close()

    # A visible error must keep the current portrait, then permit another pet.
    failed = browser.new_page()
    failed.route('**/pets/codex.glb*', lambda route: route.fulfill(status=503, body='unavailable'))
    failed.goto(args.url, wait_until='domcontentloaded')
    failed.get_by_role('button', name='报错 TRACE 报错 技术宅 · 现实报错 去问它一句').click()
    failed.wait_for_function("document.querySelector('#stage-model-3d').dataset.state === 'fallback'")
    assert failed.locator('#lab-pet').is_visible()
    assert failed.locator('#lab-pet').get_attribute('alt') == '报错'
    failed.unroute('**/pets/codex.glb*')
    failed.get_by_role('button', name='重试 3D').click()
    ready(failed, 'codex')
    select(failed, '班班')
    ready(failed, 'workbuddy')
    record('503 keeps portrait; Retry restores model and switching still works', True)
    failed.close()

    mobile = browser.new_page(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    mobile.goto(args.url, wait_until='domcontentloaded')
    mobile.get_by_role('button', name='小金 COIN 小金 财迷机灵 · 暴富吐槽 去问它一句').click()
    ready(mobile, 'yuanbao')
    for pet, name in PETS:
        select(mobile, name)
        ready(mobile, pet)
        assert mobile.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert mobile.evaluate('scrollY === 0')
        mobile.screenshot(path=str(args.output / (pet + '-mobile.png')))
    record('All five models visible on mobile without horizontal overflow', '390x844')
    touch = mobile.context.new_cdp_session(mobile)
    b = mobile.locator('#stage-model-3d canvas').bounding_box()
    x, y = b['x'] + b['width'] / 2, b['y'] + b['height'] / 2
    touch.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [
        {'x': x - 30, 'y': y, 'id': 0}, {'x': x + 30, 'y': y, 'id': 1}]})
    for d in [40, 50, 60, 70]:
        touch.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [
            {'x': x - d, 'y': y, 'id': 0}, {'x': x + d, 'y': y, 'id': 1}]})
    touch.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    mobile.wait_for_timeout(350)
    assert mobile.locator('#stage-model-3d').get_attribute('data-action') == 'Idle'
    assert mobile.locator('#stage-model-3d').get_attribute('data-state') == 'ready'
    record('Real touch pinch does not accidentally poke', True)
    mobile.close()
    assert not errors, errors
    record('Desktop flow has no JavaScript exceptions', errors)
    browser.close()

(args.output / 'verification.json').write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
print(str(len(results)) + ' checks passed', flush=True)
