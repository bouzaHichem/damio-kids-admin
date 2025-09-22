# PWA Icon Generation Guide

To generate proper PWA icons, you have two options:

## Option 1: Use Online Tools (Recommended)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo/favicon
3. Download the generated icon pack
4. Replace the placeholder files with the generated icons

## Option 2: Use ImageMagick (Command Line)
If you have ImageMagick installed, you can use this script:

```bash
# From your logo.png file, generate the required sizes
convert logo.png -resize 192x192 icon-192x192.png
convert logo.png -resize 512x512 icon-512x512.png
```

## Required Files:
- icon-192x192.png (192x192 pixels)
- icon-512x512.png (512x512 pixels)
- screenshot-wide.png (1280x720 pixels) - Optional
- screenshot-narrow.png (720x1280 pixels) - Optional

## Temporary Placeholders
For now, copy your existing favicon.ico and rename it:
```bash
cp favicon.ico icon-192x192.png
cp favicon.ico icon-512x512.png
```

This will work temporarily until you generate proper icons.