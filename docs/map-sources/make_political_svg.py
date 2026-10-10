"""Political map of Europe as SVG, same frame/projection (EPSG:3035, 4096x4096) as make_relief.py.

Usage: python make_political_svg.py <countries.geojson>   (GISCO CNTR_RG_*_3035.geojson)
Writes europe_political_4096.svg (vector only) and
       europe_political_relief_4096.svg (countries over the embedded relief JPG).
"""
import base64
import json
import sys
from collections import defaultdict
from xml.sax.saxutils import escape

import rasterio
from rasterio.warp import transform_bounds

SRC = r"C:\Work\europe-dem\data\eurodem.tif"
RELIEF = r"C:\Work\europe-dem\europe_relief_4096.jpg"
OUT_DIR = r"C:\Work\europe-dem"
W = H = 4096
FRAME_DEG = (-25.0, 34.5, 36.0, 71.5)  # keep in sync with make_relief.py

# --- frame (identical to make_relief.py) -------------------------------------
with rasterio.open(SRC) as ds:
    src_crs = ds.crs
l, b, r, t = transform_bounds(src_crs, "EPSG:3035", *[v * 3600 for v in FRAME_DEG], densify_pts=101)
cx, cy = (l + r) / 2, (b + t) / 2
half = max(r - l, t - b) / 2 * 0.92
x0, y1 = cx - half, cy + half
px = 2 * half / W

def to_px(x, y):
    return (x - x0) / px, (y1 - y) / px

# --- load countries intersecting the frame ---------------------------------
gj = json.load(open(sys.argv[1], encoding="utf-8"))
countries = []
for f in gj["features"]:
    g = f["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    xs = [p[0] for poly in polys for ring in poly for p in ring]
    ys = [p[1] for poly in polys for ring in poly for p in ring]
    if max(xs) < x0 or min(xs) > x0 + 2 * half or max(ys) < y1 - 2 * half or min(ys) > y1:
        continue
    countries.append({"id": f["properties"]["CNTR_ID"],
                      "name": f["properties"]["NAME_ENGL"], "polys": polys})

# --- neighbours via shared border vertices -> greedy colouring ------------
owners = defaultdict(set)
for i, c in enumerate(countries):
    for poly in c["polys"]:
        for p in poly[0]:
            owners[(round(p[0]), round(p[1]))].add(i)
adj = defaultdict(set)
for s in owners.values():
    for i in s:
        adj[i] |= s - {i}

PALETTE = ["#f2d7a6", "#c9dfb3", "#f4c2b8", "#c7d7ec", "#e6cde8", "#f7eba1", "#bfe3dc"]
order = sorted(range(len(countries)), key=lambda i: -len(adj[i]))
color = {}
for i in order:
    used = {color[j] for j in adj[i] if j in color}
    # rotate start index by country so the map isn't dominated by colour 0
    k = next(k for k in range(len(PALETTE)) if PALETTE[(k + i) % len(PALETTE)] not in used)
    color[i] = PALETTE[(k + i) % len(PALETTE)]

# --- geometry -> SVG path (drop vertices closer than ~0.4 px) -----------
def ring_d(ring):
    out, last = [], None
    for x, y in ring:
        X, Y = to_px(x, y)
        if last and abs(X - last[0]) < 0.4 and abs(Y - last[1]) < 0.4:
            continue
        out.append(f"{X:.1f},{Y:.1f}")
        last = (X, Y)
    return "M" + "L".join(out) + "Z" if len(out) >= 3 else ""

def ring_area_centroid(ring):
    a = cxs = cys = 0.0
    for (xa, ya), (xb, yb) in zip(ring, ring[1:]):
        cr = xa * yb - xb * ya
        a += cr; cxs += (xa + xb) * cr; cys += (ya + yb) * cr
    return (abs(a) / 2, cxs / (3 * a), cys / (3 * a)) if a else (0, ring[0][0], ring[0][1])

paths, labels = [], []
for i, c in enumerate(countries):
    d = "".join(ring_d(ring) for poly in c["polys"] for ring in poly)
    if not d:
        continue
    paths.append((c, color[i], d))
    area, lx, ly = max(ring_area_centroid(poly[0]) for poly in c["polys"])
    LX, LY = to_px(lx, ly)
    if area > 2.0e10 and 0 < LX < W and 0 < LY < H:  # label countries > ~20,000 km2 main part
        labels.append((c["name"], LX, LY, 30 if area > 1.5e11 else 22))

def svg(fill_opacity, background):
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
         f'<title>Europe – political map</title>', background,
         f'<g id="countries" stroke="#5a5a5a" stroke-width="1.6" stroke-linejoin="round" fill-rule="evenodd" fill-opacity="{fill_opacity}">']
    for c, col, d in paths:
        o.append(f'<path id="{c["id"]}" fill="{col}" d="{d}"><title>{escape(c["name"])}</title></path>')
    o.append('</g><g id="labels" font-family="Segoe UI, Arial, sans-serif" fill="#333" text-anchor="middle" '
             'stroke="#fff" stroke-width="5" paint-order="stroke" stroke-opacity="0.8">')
    for name, X, Y, fs in labels:
        o.append(f'<text x="{X:.0f}" y="{Y:.0f}" font-size="{fs}">{escape(name)}</text>')
    o.append('</g></svg>')
    return "\n".join(o)

sea = f'<rect width="{W}" height="{H}" fill="#cfe0ec"/>'
with open(rf"{OUT_DIR}\europe_political_4096.svg", "w", encoding="utf-8") as fh:
    fh.write(svg(1.0, sea))

b64 = base64.b64encode(open(RELIEF, "rb").read()).decode()
relief = f'<image width="{W}" height="{H}" href="data:image/jpeg;base64,{b64}"/>'
with open(rf"{OUT_DIR}\europe_political_relief_4096.svg", "w", encoding="utf-8") as fh:
    fh.write(svg(0.35, relief))
print(len(paths), "countries,", len(labels), "labels")
