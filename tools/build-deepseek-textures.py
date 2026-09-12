"""Reproducible, original painted base-color maps for the DeepSeek whale maid.

Requires Python 3 and Pillow. Run from any directory:
    python tools/build-deepseek-textures.py

The source reference drawings are not copied into these maps. All motifs are
drawn with curves, gradients, and deterministic fabric/hair details below.
PNG pixel y=0 corresponds to UV v=1 when loaded normally in Blender.
"""

from pathlib import Path
from math import sin, cos, pi, sqrt, exp
import random
from PIL import Image, ImageDraw, ImageFilter


DEST = Path(__file__).resolve().parents[1] / "pets" / "textures"
DEST.mkdir(parents=True, exist_ok=True)
SS = 2


def clamp(x):
    return max(0, min(255, round(x)))


def mix(a, b, t):
    return tuple(clamp(x * (1 - t) + y * t) for x, y in zip(a, b))


def bezier(a, b, c, d, steps=32):
    return [tuple((1 - t) ** 3 * a[i] + 3 * (1 - t) ** 2 * t * b[i]
                  + 3 * (1 - t) * t * t * c[i] + t ** 3 * d[i]
                  for i in range(2)) for t in (j / steps for j in range(steps + 1))]


class Painter:
    def __init__(self, img):
        self.size = img.size
        self.img = img.resize((img.width * SS, img.height * SS), Image.Resampling.BICUBIC)
        self.draw = ImageDraw.Draw(self.img)

    def points(self, pts):
        return [(round(x * SS), round(y * SS)) for x, y in pts]

    def polygon(self, pts, color):
        self.draw.polygon(self.points(pts), fill=color)

    def line(self, pts, color, width=1):
        self.draw.line(self.points(pts), fill=color, width=max(1, round(width * SS)), joint="curve")

    def ellipse(self, bbox, color, outline=None, width=1):
        self.draw.ellipse(tuple(round(x * SS) for x in bbox), fill=color,
                          outline=outline, width=max(1, round(width * SS)))

    def save(self, name):
        result = self.img.resize(self.size, Image.Resampling.LANCZOS)
        result.save(DEST / name, optimize=True)
        return result


def make_iris():
    """Square UV map, pupil toward image top / v=1, reflected light at bottom."""
    size = 512
    img = Image.new("RGB", (size, size))
    pixels = img.load()
    for y in range(size):
        v = y / (size - 1)
        if v < .30:
            color = mix((15, 22, 63), (28, 63, 139), v / .30)
        elif v < .68:
            color = mix((28, 63, 139), (42, 140, 212), (v - .30) / .38)
        else:
            color = mix((42, 140, 212), (170, 231, 244), (v - .68) / .32)
        for x in range(size):
            dx, dy = (x - 255.5) / 255.5, (y - 255.5) / 255.5
            radius = sqrt(dx * dx + dy * dy)
            edge = min(1, max(0, (radius - .78) / .20))
            fiber = (sin(x * .39 + y * .018) * 1.6 + sin(x * .12) * 1.7) * max(0, v - .3)
            pixels[x, y] = tuple(clamp(c * (1 - .63 * edge) + fiber) for c in color)
    p = Painter(img)
    p.ellipse((202, 125, 310, 346), (10, 25, 67))
    p.ellipse((224, 149, 285, 313), (12, 31, 78))
    # Lower iris rim and reflected sky have a distinct anime crescent silhouette.
    pts = bezier((119, 395), (167, 311), (348, 315), (389, 393))
    pts += bezier((389, 393), (363, 468), (171, 481), (119, 395))
    p.polygon(pts, (151, 221, 242))
    p.ellipse((198, 378, 323, 465), (193, 239, 250))
    # Upper and secondary catchlights.
    p.ellipse((133, 91, 209, 174), (251, 254, 255))
    p.ellipse((169, 107, 205, 157), (255, 255, 255))
    p.ellipse((308, 169, 344, 207), (217, 243, 255))
    p.ellipse((320, 177, 335, 195), (255, 255, 255))
    p.ellipse((109, 282, 126, 299), (150, 223, 250))
    p.save("deepseek-iris.png")


def whale(p, cx, cy, scale=1, color=(76, 136, 193), detail=True):
    def trans(points):
        return [(cx + x * scale, cy + y * scale) for x, y in points]

    def curve(a, b, c, d):
        return bezier(a, b, c, d)

    silhouette = curve((-130, -10), (-125, -95), (-33, -94), (23, -52))
    silhouette += curve((23, -52), (69, -37), (69, 6), (92, 2))
    silhouette += curve((92, 2), (101, -1), (117, -27), (135, -31))
    silhouette += curve((135, -31), (139, -13), (135, 0), (125, 8))
    silhouette += curve((125, 8), (142, 4), (153, 9), (161, 19))
    silhouette += curve((161, 19), (146, 41), (113, 40), (92, 25))
    silhouette += curve((92, 25), (43, 104), (-62, 91), (-105, 52))
    silhouette += curve((-105, 52), (-125, 36), (-135, 7), (-130, -10))
    p.polygon(trans(silhouette), color)
    if detail:
        belly = curve((-125, 5), (-73, -9), (-18, 15), (8, 50))
        belly += curve((8, 50), (-23, 77), (-77, 67), (-105, 43))
        belly += curve((-105, 43), (-117, 30), (-124, 18), (-125, 5))
        p.polygon(trans(belly), (166, 205, 233))
        for i in range(6):
            x = -110 + i * 18
            p.line(trans(curve((x, 8 + i * 3), (x + 2, 28), (x + 20, 51), (x + 33, 62))),
                   (104, 161, 205), 1.5 * scale)
        fin = curve((-14, 7), (22, 4), (47, 30), (48, 55))
        fin += curve((48, 55), (16, 58), (-7, 37), (-14, 7))
        p.polygon(trans(fin), (56, 111, 176))
        p.ellipse((cx - 77 * scale, cy - 26 * scale, cx - 66 * scale, cy - 15 * scale), (28, 67, 117))
        p.ellipse((cx - 75 * scale, cy - 25 * scale, cx - 71 * scale, cy - 21 * scale), (242, 253, 255))
        p.line(trans(curve((-120, 1), (-108, 12), (-98, 14), (-87, 11))), (46, 97, 154), 2 * scale)


def teardrop(p, x, y, r, color, lean=0):
    pts = bezier((x + lean, y - r), (x + r, y), (x + r, y + r), (x, y + r))
    pts += bezier((x, y + r), (x - r, y + r), (x - r, y), (x + lean, y - r))
    p.polygon(pts, color)


def make_apron():
    size = 1024
    img = Image.new("RGB", (size, size))
    pixels = img.load()
    rng = random.Random(2224)
    for y in range(size):
        for x in range(size):
            weave = (.40 if x % 3 == 0 else -.15) + (.35 if y % 3 == 0 else -.1)
            grain = rng.uniform(-.65, .65)
            pixels[x, y] = tuple(clamp(c + weave + grain) for c in (253, 248, 241))
    p = Painter(img)
    gold = (190, 168, 123)
    pale_gold = (214, 197, 162)
    blue = (111, 164, 199)
    # Border is below the printed emblem; upper bib stays clear.
    border = bezier((180, 618), (178, 925), (846, 925), (844, 618), 120)
    inner = bezier((196, 620), (196, 899), (828, 899), (828, 620), 120)
    p.line(border, pale_gold, 3)
    p.line(inner, (205, 220, 227), 2)
    for idx in range(4, len(border) - 3, 5):
        x, y = border[idx]
        p.ellipse((x - 2.5, y + 10, x + 2.5, y + 15), gold)
    whale(p, 510, 696, 1.02)
    teardrop(p, 488, 574, 10, (72, 143, 190), -7)
    teardrop(p, 515, 561, 12, (94, 164, 204), 0)
    teardrop(p, 541, 577, 9, (72, 143, 190), 7)
    for cx in (258, 766):
        s = 1 if cx < 512 else -1
        p.line(bezier((cx, 731), (cx + 13 * s, 745), (cx + 26 * s, 742), (cx + 32 * s, 727)), blue, 2)
        p.line(bezier((cx, 750), (cx + 13 * s, 764), (cx + 26 * s, 761), (cx + 32 * s, 746)), pale_gold, 2)
    p.save("deepseek-apron.png")


def make_hair():
    w, h = 512, 1024
    img = Image.new("RGB", (w, h))
    pixels = img.load()
    rng = random.Random(6304)
    strand_phase = [rng.random() * 2 * pi for _ in range(38)]
    for y in range(h):
        v = y / (h - 1)
        t = max(0, (v - .22) / .78) ** 1.55
        base = mix((39, 42, 99), (73, 147, 198), t)
        for x in range(w):
            u = x / w
            # Periodic across U so cylinders and ribbon strips have no UV seam.
            bands = 2.7 * sin(u * 2 * pi * 7 + .40 * sin(v * 2.7))
            fine = sum(.22 * sin(2 * pi * u * (j + 19) + strand_phase[j] + .23 * sin(v * 5))
                       for j in range(38))
            shine = 5.4 * exp(-((v - .37) / .13) ** 2) * (.7 + .3 * cos(u * 2 * pi * 4))
            pixels[x, y] = tuple(clamp(c + bands + fine + shine) for c in base)
    img.save(DEST / "deepseek-hair.png", optimize=True)


def make_skirt():
    w, h = 1024, 512
    img = Image.new("RGB", (w, h))
    pixels = img.load()
    rng = random.Random(8901)
    for y in range(h):
        for x in range(w):
            thread = (.6 if x % 4 == 0 else 0) + (.5 if y % 4 == 0 else 0)
            noise = rng.uniform(-.45, .45)
            pixels[x, y] = tuple(clamp(c + thread + noise) for c in (31, 35, 79))
    p = Painter(img)
    gold = (200, 180, 127)
    pale = (228, 212, 168)
    shadow = (130, 118, 100)
    for y, col, width in ((425, shadow, 1), (429, gold, 1.5), (493, gold, 2), (499, shadow, 1)):
        p.line([(0, y), (w, y)], col, width)
    # A seamless all-around embroidered ocean vine, repeated every 256 pixels.
    for tile in range(-1, 5):
        ox = tile * 256
        wave = bezier((ox, 470), (ox + 22, 450), (ox + 42, 452), (ox + 60, 469))
        wave += bezier((ox + 60, 469), (ox + 85, 491), (ox + 105, 484), (ox + 125, 466))
        wave += bezier((ox + 125, 466), (ox + 153, 439), (ox + 182, 454), (ox + 195, 469))
        wave += bezier((ox + 195, 469), (ox + 215, 489), (ox + 237, 487), (ox + 256, 470))
        p.line(wave, gold, 1.7)
        for dx, flip in ((24, -1), (83, 1), (193, -1), (232, 1)):
            x, y = ox + dx, 465
            stem = bezier((x, y + 8), (x + flip * 5, y - 2), (x + flip * 12, y - 10), (x + flip * 9, y - 20))
            p.line(stem, gold, 1.3)
            leaf = bezier((x + flip * 4, y), (x - flip * 8, y - 3), (x - flip * 7, y - 12), (x + flip * 4, y))
            p.polygon(leaf, gold)
            leaf2 = bezier((x + flip * 10, y - 10), (x + flip * 21, y - 10), (x + flip * 18, y - 20), (x + flip * 10, y - 10))
            p.polygon(leaf2, pale)
        whale(p, ox + 139, 453, .125, pale, detail=False)
        p.ellipse((ox + 64, 443, ox + 68, 447), pale)
        p.ellipse((ox + 208, 438, ox + 212, 442), gold)
    p.save("deepseek-skirt.png")


if __name__ == "__main__":
    make_iris()
    make_apron()
    make_hair()
    make_skirt()
    for name in ("deepseek-iris.png", "deepseek-apron.png", "deepseek-hair.png", "deepseek-skirt.png"):
        path = DEST / name
        with Image.open(path) as img:
            img.verify()
        with Image.open(path) as img:
            print(f"{path}: {img.width}x{img.height}, {img.mode}, {path.stat().st_size:,} bytes")
