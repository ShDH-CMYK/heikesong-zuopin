"""
Normalise the five supplied pet renders for web use.

They already ship with a correct alpha channel, so no background removal is
needed here - this only trims the empty margin (the bbox is often 30-40% of the
canvas), re-pads a little so drop shadows / growth room survive, and downscales
2304x1728 originals down to something a browser will actually cache happily.
"""
import os
from PIL import Image

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(SRC, "pets")

JOBS = [
    ("豆包 (9).png", "doubao.png"),
    ("DeepSeek.png", "deepseek.png"),
    ("WorkBuddy.png", "workbuddy.png"),
    ("Codex.png", "codex.png"),
    ("元宝.png", "yuanbao.png"),
]

MAX_EDGE = 760
PAD_RATIO = 0.03          # keep a sliver of breathing room around the cut
CANVAS = 900              # square canvas so every pet shares one optical scale


def normalise(src_path, dst_path):
    im = Image.open(src_path).convert("RGBA")
    bbox = im.getchannel("A").getbbox()
    if bbox:
        pad = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * PAD_RATIO)
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
        im = im.crop(bbox)

    # fit into a shared square canvas, anchored to the bottom centre, so the
    # five characters sit on a common ground line when laid out side by side
    scale = min(CANVAS * 0.96 / im.width, CANVAS * 0.96 / im.height)
    im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)

    sheet = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    sheet.paste(im, ((CANVAS - im.width) // 2, CANVAS - im.height - int(CANVAS * 0.02)), im)

    if max(sheet.size) > MAX_EDGE:
        s = MAX_EDGE / float(max(sheet.size))
        sheet = sheet.resize((int(sheet.width * s), int(sheet.height * s)), Image.LANCZOS)

    sheet.save(dst_path, "PNG", optimize=True)

    chk = Image.open(dst_path)
    corners = [chk.getpixel(p)[3] for p in
               [(0, 0), (chk.width - 1, 0), (0, chk.height - 1), (chk.width - 1, chk.height - 1)]]
    return {"out": os.path.basename(dst_path), "size": chk.size,
            "kb": round(os.path.getsize(dst_path) / 1024.0, 1), "corners": corners}


def main():
    os.makedirs(OUT, exist_ok=True)
    total = 0
    for src, dst in JOBS:
        p = os.path.join(SRC, src)
        if not os.path.exists(p):
            print("MISSING", src)
            continue
        r = normalise(p, os.path.join(OUT, dst))
        total += r["kb"]
        print("%-16s -> %-16s %sx%s  %7sKB  corners=%s  %s" % (
            src, r["out"], r["size"][0], r["size"][1], r["kb"], r["corners"],
            "OK" if all(c == 0 for c in r["corners"]) else "!! opaque corner"))
    print("\n5 files, %.0f KB total" % total)


if __name__ == "__main__":
    main()
