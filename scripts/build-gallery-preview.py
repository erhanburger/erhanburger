#!/usr/bin/env python3
"""Bundle the design concepts and the current site for a static preview.

Keeps the repository layout (charcoal-demo/, burger-builder-demo/assets/ and
the root menu photos) so relative paths work unchanged, and adds a gallery
page at the bundle root. Usage: build-gallery-preview.py OUTPUT_DIR
"""
import re
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1]).resolve()
if out == root or root in out.parents:
    sys.exit('Choose an output folder outside the repository.')
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(root / 'charcoal-demo', out / 'charcoal-demo')
shutil.copytree(root / 'burger-builder-demo' / 'assets', out / 'burger-builder-demo' / 'assets')
used = set()
for path in (root / 'charcoal-demo').rglob('*'):
    if path.suffix in {'.js', '.html', '.css'}:
        used.update(re.findall(r'IMG_\d+\.(?:png|jpeg|jpg|webp)', path.read_text(encoding='utf-8')))
for name in sorted(used - {'IMG_0402.jpeg', 'IMG_0367.jpeg'}):
    if (root / name).exists():
        shutil.copy2(root / name, out / name)
shutil.copy2(root / 'docs' / 'design' / 'gallery.html', out / 'index.html')
count = sum(1 for p in out.rglob('*') if p.is_file())
print(f'Gallery bundle written to {out} ({count} files).')
