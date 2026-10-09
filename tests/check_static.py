"""Check local asset references and DOM targets without a JavaScript runtime."""
from pathlib import Path
import re
import json

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
references = re.findall(r'(?:src|href)="([^"]+)"', html)
assert all((root / path).is_file() for path in references), references
ids = set(re.findall(r'id="([^"]+)"', html))
app = (root / 'app.js').read_text(encoding='utf-8')
targets = set(re.findall(r"\$\('([^']+)'\)", app))
assert targets <= ids, targets - ids
assert len(ids) == len(re.findall(r'id="([^"]+)"', html)), 'Duplicate DOM IDs'
manifest = json.loads((root / 'data/world.json').read_text(encoding='utf-8'))
for group, paths in manifest['content'].items():
    for path in paths:
        file = root / 'data' / path
        assert file.is_file(), f'Missing {group} file: {path}'
        json.loads(file.read_text(encoding='utf-8'))
print('Passed: local HTML assets, DOM targets, registered content files, and JSON syntax.')
countries = json.loads((root / 'assets/world-countries.geojson').read_text(encoding='utf-8'))
assert countries['type'] == 'FeatureCollection' and len(countries['features']) > 150
assert all(feature['geometry']['type'] in ('Polygon', 'MultiPolygon') for feature in countries['features'])
vertices = sum(len(ring) for feature in countries['features'] for polygon in ([feature['geometry']['coordinates']] if feature['geometry']['type'] == 'Polygon' else feature['geometry']['coordinates']) for ring in polygon)
assert vertices > 500000, 'Expected 1:10m detailed country outlines'
print('Passed: bundled world map country data.')
