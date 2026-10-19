"""확장 아이콘(PNG)을 만든다. 밝은 그라디언트 배경 + 재생 삼각형에 사선 하나."""
from PIL import Image, ImageDraw

SIZES = (16, 32, 48, 128)
SS = 8  # 안티앨리어싱용 배율
BASE = 128 * SS
STOPS = ((0.0, (255, 106, 61)), (0.55, (255, 45, 149)), (1.0, (124, 58, 237)))


def mix(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def gradient_color(t):
    for (p0, c0), (p1, c1) in zip(STOPS, STOPS[1:]):
        if t <= p1:
            return mix(c0, c1, (t - p0) / (p1 - p0))
    return STOPS[-1][1]


def build():
    img = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    px = img.load()
    for y in range(BASE):
        for x in range(BASE):
            px[x, y] = gradient_color((x + y) / (2 * (BASE - 1))) + (255,)

    mask = Image.new("L", (BASE, BASE), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, BASE - 1, BASE - 1), radius=int(BASE * 0.22), fill=255)
    img.putalpha(mask)

    # 재생 삼각형
    tri = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    d = ImageDraw.Draw(tri)
    left, right = BASE * 0.34, BASE * 0.72
    top, bottom = BASE * 0.26, BASE * 0.74
    d.polygon([(left, top), (left, bottom), (right, BASE * 0.5)], fill=(255, 255, 255, 255))

    # 사선이 지나갈 자리를 비워 두고, 그 안에 흰 사선을 다시 긋는다.
    gap = Image.new("L", (BASE, BASE), 255)
    ImageDraw.Draw(gap).line(
        [(BASE * 0.2, BASE * 0.8), (BASE * 0.8, BASE * 0.2)],
        fill=0, width=int(BASE * 0.19),
    )
    tri.putalpha(Image.composite(tri.getchannel("A"), Image.new("L", (BASE, BASE), 0), gap))
    img.alpha_composite(tri)

    slash = Image.new("RGBA", (BASE, BASE), (0, 0, 0, 0))
    ImageDraw.Draw(slash).line(
        [(BASE * 0.2, BASE * 0.8), (BASE * 0.8, BASE * 0.2)],
        fill=(255, 255, 255, 255), width=int(BASE * 0.095),
    )
    img.alpha_composite(slash)
    return img


def main():
    icon = build()
    for size in SIZES:
        icon.resize((size, size), Image.LANCZOS).save(f"extension/icons/icon{size}.png")
        print(f"icons/icon{size}.png")


if __name__ == "__main__":
    main()
