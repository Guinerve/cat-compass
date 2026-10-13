"""Generate original Cat Compass app icons. Requires Pillow only for asset editing."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "public"
root.mkdir(exist_ok=True)
image = Image.new("RGB", (1024, 1024), "#246653")
d = ImageDraw.Draw(image)
d.ellipse((218, 324, 810, 835), fill="#eed7b6")
d.polygon([(226, 513), (243, 191), (447, 375)], fill="#eed7b6")
d.polygon([(588, 375), (790, 191), (800, 513)], fill="#eed7b6")
d.polygon([(273, 415), (280, 267), (374, 372)], fill="#cf916d")
d.polygon([(660, 372), (753, 267), (762, 415)], fill="#cf916d")
d.arc((328, 452, 452, 551), 0, 180, fill="#345348", width=15)
d.arc((573, 452, 697, 551), 0, 180, fill="#345348", width=15)
d.polygon([(484, 597), (543, 597), (514, 631)], fill="#9f694f")
d.arc((456, 610, 514, 670), 0, 155, fill="#9f694f", width=10)
d.arc((514, 610, 572, 670), 25, 180, fill="#9f694f", width=10)
for line in [(211, 596, 355, 616), (202, 680, 353, 655), (676, 616, 820, 596), (678, 655, 829, 680)]:
    d.line(line, fill="#345348", width=8)
for size in (192, 512):
    image.resize((size, size), Image.Resampling.LANCZOS).save(root / f"icon-{size}.png")
image.save(root / "cat-compass.icns")
print("Generated public/icon-192.png, public/icon-512.png, public/cat-compass.icns")
