"""Package a completed static build for Sites without including source/secrets."""
import argparse
import hashlib
import json
from pathlib import Path
import tarfile

parser = argparse.ArgumentParser()
parser.add_argument('archive', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
config = root / '.openai/hosting.json'
hosting = json.loads(config.read_text())
build = root / hosting['static']['directory']
assert (build / 'index.html').is_file(), 'Build the site before packaging'
assert build.resolve().is_relative_to(root), 'Static directory must be inside project'
files = [config] + sorted(p for p in build.rglob('*') if p.is_file())
for p in files:
    assert not p.is_symlink(), f'Symlink in build: {p}'
    assert p.stat().st_size <= 25 * 1024 * 1024, f'Asset exceeds hosting limit: {p}'
args.archive.parent.mkdir(parents=True, exist_ok=True)
with tarfile.open(args.archive, 'w:gz') as archive:
    for p in files:
        archive.add(p, arcname=str(p.relative_to(root)), recursive=False)
with tarfile.open(args.archive) as archive:
    assert len(archive.getmembers()) == len(files)
    assert all(m.isfile() and not m.name.startswith('/') and '..' not in Path(m.name).parts
               for m in archive.getmembers())
print(json.dumps(dict(archive=str(args.archive.resolve()), files=len(files),
    bytes=args.archive.stat().st_size,
    sha256=hashlib.sha256(args.archive.read_bytes()).hexdigest())))
