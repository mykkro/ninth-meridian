"""Reproduce the supplied EuroDEM image frame and extract its GISCO outlines.

No GIS dependencies or DEM read is needed: the original make_relief.py specifies
the GRS80/ETRS89 frame, densification, square crop, and output dimensions.
Run from any directory: python tests/prepare_europe_map.py
"""
import json
import math
import re
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
A = 6378137.0
F = 1 / 298.257222101
E2 = F * (2 - F)
E = math.sqrt(E2)


def authalic_q(phi):
    s = math.sin(phi)
    return (1 - E2) * (s / (1 - E2 * s * s) - math.log((1 - E * s) / (1 + E * s)) / (2 * E))


QP = authalic_q(math.pi / 2)
RQ = A * math.sqrt(QP / 2)
PHI0 = math.radians(52)
BETA0 = math.asin(authalic_q(PHI0) / QP)
D = A * math.cos(PHI0) / math.sqrt(1 - E2 * math.sin(PHI0) ** 2) / (RQ * math.cos(BETA0))


def project_meters(lon, lat):
    """EPSG:3035, explicitly returning easting/northing (SVG x/y order)."""
    lam = math.radians(lon - 10)
    beta = math.asin(max(-1, min(1, authalic_q(math.radians(lat)) / QP)))
    b = RQ * math.sqrt(2 / (1 + math.sin(BETA0) * math.sin(beta) + math.cos(BETA0) * math.cos(beta) * math.cos(lam)))
    return (4321000 + b * D * math.cos(beta) * math.sin(lam),
            3210000 + b / D * (math.cos(BETA0) * math.sin(beta) - math.sin(BETA0) * math.cos(beta) * math.cos(lam)))


def image_frame():
    # rasterio.transform_bounds(..., densify_pts=101): 101 intermediate points
    # per edge, plus both endpoints. Source angular units were arcseconds;
    # multiplying FRAME_DEG by 3600 in the original script converts back here.
    left, bottom, right, top = (-25.0, 34.5, 36.0, 71.5)
    edge = []
    for i in range(103):
        t = i / 102
        lon, lat = left + (right - left) * t, bottom + (top - bottom) * t
        edge.extend([project_meters(lon, bottom), project_meters(lon, top),
                     project_meters(left, lat), project_meters(right, lat)])
    xs, ys = zip(*edge)
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    half = max(max(xs) - min(xs), max(ys) - min(ys)) / 2 * 0.92
    return [cx - half, cy - half, cx + half, cy + half]


def main():
    bounds = image_frame()
    pixel = (bounds[2] - bounds[0]) / 4096
    control_points = []
    for lon, lat in [(10, 52), (14.4378, 50.0755), (-0.1276, 51.5072),
                     (-21.9426, 64.1466), (30.3, 59.9), (23.7275, 37.9838)]:
        x, y = project_meters(lon, lat)
        control_points.append([lon, lat, (x - bounds[0]) / pixel, (bounds[3] - y) / pixel])
    metadata = {"crs": "EPSG:3035", "center": [10, 52], "semiMajor": A,
                "inverseFlattening": 298.257222101, "falseOrigin": [4321000, 3210000],
                "boundsMeters": bounds, "pixelSizeMeters": pixel,
                "frameDegrees": [-25, 34.5, 36, 71.5], "densifyPoints": 101,
                "frameScale": 0.92, "controlPoints": control_points}
    (ROOT / 'assets/europe-relief.metadata.json').write_text(json.dumps(metadata, indent=2) + '\n', encoding='utf-8')
    relief = ROOT / 'relief.js'
    code = relief.read_text(encoding='utf-8')
    code, count = re.subn(r' const metadata=.*?; // Regenerated',
                         ' const metadata=' + json.dumps(metadata, separators=(',', ':')) + '; // Regenerated', code)
    if count != 1:
        raise ValueError('Expected one generated metadata declaration in relief.js')
    relief.write_text(code, encoding='utf-8')

    # Store only path data, never source SVG markup or embedded JPEGs.
    ns = '{http://www.w3.org/2000/svg}'
    aliases = {'RU': 'Russia', 'TR': 'Turkey', 'FO': 'Faroe Islands',
               'VA': 'Vatican', 'RS': 'Republic of Serbia',
               'US': 'United States of America', 'SJ': 'Norway'}
    countries = []
    for path in ET.parse(ROOT / 'media/europe_political_4096.svg').iter(ns + 'path'):
        code = path.attrib['id']
        countries.append({'code': code, 'name': aliases.get(code, path.find(ns + 'title').text), 'path': path.attrib['d']})
    borders = {'crs': 'EPSG:3035', 'width': 4096, 'height': 4096, 'countries': countries}
    (ROOT / 'assets/europe-borders.json').write_text(json.dumps(borders, ensure_ascii=False, separators=(',', ':')) + '\n', encoding='utf-8')
    print(f'Prepared exact image frame ({pixel:.6f} m/pixel) and {len(countries)} GISCO country paths.')


if __name__ == '__main__':
    main()
