#!/usr/bin/env python3
"""
Run this script once to generate the PNG icons needed for the PWA.
Requires: pip install Pillow
Output: public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
"""

from PIL import Image, ImageDraw
import os

def create_icon(size, output_path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded rect
    radius = size // 5
    bg_color = (253, 246, 240, 255)  # #FDF6F0
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=bg_color)

    # Patch shape
    pad = size * 0.18
    patch_color = (212, 165, 165, 80)   # #D4A5A5 with alpha
    stroke_color = (212, 165, 165, 255)
    draw.rounded_rectangle(
        [pad, size*0.28, size-pad, size*0.72],
        radius=size*0.08,
        fill=patch_color,
        outline=stroke_color,
        width=max(2, size//60)
    )

    # Centre dot
    dot_r = size * 0.08
    cx, cy = size/2, size/2
    draw.ellipse([cx-dot_r, cy-dot_r, cx+dot_r, cy+dot_r], fill=(196, 133, 106, 200))

    img.save(output_path, "PNG")
    print(f"Created {output_path} ({size}x{size})")

os.makedirs("public", exist_ok=True)
create_icon(192, "public/icon-192.png")
create_icon(512, "public/icon-512.png")
create_icon(180, "public/apple-touch-icon.png")
print("Done! Icons generated.")
