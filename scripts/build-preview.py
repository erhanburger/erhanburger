#!/usr/bin/env python3
"""Bundle charcoal-demo/ into one self-contained folder for a static preview.

The builder references shared files one level up (menu photos, ingredient
cut-outs). This copies them under ./shared/ and rewrites "../" paths so the
folder works when served on its own. Usage: build-preview.py OUTPUT_DIR
"""
import re
import shutil
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
source = root / 'charcoal-demo'
out = Path(sys.argv[1]).resolve()
if out == root or root in out.parents:
    sys.exit('Choose an output folder outside the repository.')
shutil.rmtree(out, ignore_errors=True)
shutil.copytree(source, out)

pattern = re.compile(r'\.\./((?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_.-]*)')
shared = set()
for path in out.rglob('*'):
    if path.suffix not in {'.js', '.html', '.css'}:
        continue
    text = path.read_text(encoding='utf-8')
    shared.update(pattern.findall(text))
    path.write_text(text.replace('../', './shared/'), encoding='utf-8')

for ref in sorted(shared):
    target = root / ref
    destination = out / 'shared' / ref
    if target.is_dir():
        shutil.copytree(target, destination, dirs_exist_ok=True)
    elif target.is_file():
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target, destination)
    else:
        sys.exit(f'Missing shared file: {ref}')
print(f'Preview bundle written to {out} ({len(shared)} shared references).')
