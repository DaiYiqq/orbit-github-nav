"""
Orbit 图标生成器（纯 Python 标准库，无第三方依赖）
生成 PWA / 桌面端所需的全部图标：
  site/assets/icons/*.png|svg
  desktop/src-tauri/icons/*.png|ico|icns
用法： python scripts/gen-icons.py
"""
import math
import os
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PWA_DIR = ROOT / "site" / "assets" / "icons"
TAURI_DIR = ROOT / "desktop" / "src-tauri" / "icons"
PWA_DIR.mkdir(parents=True, exist_ok=True)
TAURI_DIR.mkdir(parents=True, exist_ok=True)

STOPS = [
    (0.00, (94, 155, 255)),   # #5E9BFF
    (0.55, (124, 92, 255)),   # #7C5CFF
    (1.00, (255, 100, 130)),  # #FF6482
]


def lerp(a, b, t):
    return a + (b - a) * t


def gradient(t):
    t = max(0.0, min(1.0, t))
    for i in range(len(STOPS) - 1):
        p0, c0 = STOPS[i]
        p1, c1 = STOPS[i + 1]
        if t <= p1:
            k = (t - p0) / (p1 - p0)
            return tuple(int(round(lerp(c0[j], c1[j], k))) for j in range(3))
    return STOPS[-1][1]


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def render(size):
    """返回 RGBA bytes，绘制渐变圆角方块 + 轨道环 + 星球"""
    px = bytearray(size * size * 4)
    cos_a, sin_a = math.cos(math.radians(-32)), math.sin(math.radians(-32))
    rad = 0.22
    for y in range(size):
        v = (y + 0.5) / size
        for x in range(size):
            u = (x + 0.5) / size
            # 圆角矩形 signed distance
            dx = abs(u - 0.5) - (0.5 - rad)
            dy = abs(v - 0.5) - (0.5 - rad)
            d = math.sqrt(max(dx, 0) ** 2 + max(dy, 0) ** 2) + min(max(dx, dy), 0.0) - rad
            alpha = clamp(0.5 - d * size)
            if alpha <= 0:
                continue
            r, g, b = gradient((u + v) / 2)

            # 轨道环（旋转椭圆）
            xr = (u - 0.5) * cos_a + (v - 0.5) * sin_a
            yr = -(u - 0.5) * sin_a + (v - 0.5) * cos_a
            q = math.sqrt((xr / 0.335) ** 2 + (yr / 0.1575) ** 2)
            ring = clamp((0.010 - abs(q - 1.0) * 0.335) / 0.006)
            # 中心星体
            cd = math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2)
            core = clamp((0.135 - cd) * size)
            # 环上的卫星
            sd = math.sqrt((u - 0.78) ** 2 + (v - 0.32) ** 2)
            sat = clamp((0.0625 - sd) * size)
            white = clamp(max(ring, core, sat))
            r = int(round(lerp(r, 255, white)))
            g = int(round(lerp(g, 255, white)))
            b = int(round(lerp(b, 255, white)))

            i = (y * size + x) * 4
            px[i] = r
            px[i + 1] = g
            px[i + 2] = b
            px[i + 3] = int(round(alpha * 255))
    return bytes(px)


def png_chunk(tag, data):
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def make_png(size):
    raw = bytearray()
    row = render(size)
    stride = size * 4
    for y in range(size):
        raw.append(0)  # filter type 0
        raw.extend(row[y * stride:(y + 1) * stride])
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", ihdr)
            + png_chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + png_chunk(b"IEND", b""))


def make_ico(sizes):
    images = [(s, make_png(s)) for s in sizes]
    header = struct.pack("<HHH", 0, 1, len(images))
    offset = 6 + 16 * len(images)
    entries, body = b"", b""
    for s, data in images:
        w = 0 if s >= 256 else s
        entries += struct.pack("<BBBBHHII", w, w, 0, 0, 1, 32, len(data), offset)
        body += data
        offset += len(data)
    return header + entries + body


def make_icns(sizes):
    # PNG-based ICNS：ic07=128, ic08=256, ic09=512, ic10=1024
    types = {128: b"ic07", 256: b"ic08", 512: b"ic09", 1024: b"ic10"}
    chunks = b""
    for s in sizes:
        data = make_png(s)
        chunks += types[s] + struct.pack(">I", 8 + len(data)) + data
    return b"icns" + struct.pack(">I", 8 + len(chunks)) + chunks


SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#5E9BFF"/><stop offset="0.55" stop-color="#7C5CFF"/><stop offset="1" stop-color="#FF6482"/>
  </linearGradient></defs>
  <rect width="40" height="40" rx="9" fill="url(#g)"/>
  <ellipse cx="20" cy="20" rx="13.4" ry="6.3" transform="rotate(-32 20 20)" fill="none" stroke="#fff" stroke-width="1.9" opacity=".94"/>
  <circle cx="20" cy="20" r="5.4" fill="#fff"/>
  <circle cx="31.2" cy="12.8" r="2.5" fill="#fff"/>
</svg>
'''


def main():
    (PWA_DIR / "icon.svg").write_text(SVG, encoding="utf-8")
    (PWA_DIR / "favicon.svg").write_text(SVG, encoding="utf-8")

    cache = {}
    for size in (180, 192, 512, 32, 128, 256):
        cache[size] = make_png(size)

    for size, name in ((192, "icon-192.png"), (512, "icon-512.png"), (180, "icon-180.png")):
        (PWA_DIR / name).write_bytes(cache[size])

    for size, name in ((32, "32x32.png"), (128, "128x128.png"), (256, "128x128@2x.png"), (512, "icon.png")):
        (TAURI_DIR / name).write_bytes(cache[size])

    (TAURI_DIR / "icon.ico").write_bytes(make_ico([32, 64, 128, 256]))
    (TAURI_DIR / "icon.icns").write_bytes(make_icns([128, 256, 512]))

    print("已生成图标：")
    for p in sorted(PWA_DIR.iterdir()):
        print("  ", p.relative_to(ROOT), p.stat().st_size, "B")
    for p in sorted(TAURI_DIR.iterdir()):
        print("  ", p.relative_to(ROOT), p.stat().st_size, "B")


if __name__ == "__main__":
    main()
