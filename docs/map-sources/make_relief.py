"""Render a shaded-relief JPG of EuroDEM, reprojected to ETRS89-LAEA (EPSG:3035)."""
import sys
import numpy as np
import rasterio
from rasterio.warp import reproject, transform_bounds, Resampling
from rasterio.transform import from_bounds
from PIL import Image

SRC = r"C:\Work\europe-dem\data\eurodem.tif"
OUT = sys.argv[1] if len(sys.argv) > 1 else r"C:\Work\europe-dem\europe_relief_4096.jpg"
W = H = 4096
OVR_FACTOR = 16  # read the 1/16 overview (~7.5k px wide), plenty for a 4096 px output
DST_CRS = "EPSG:3035"
NODATA = 32767

# --- read overview ---------------------------------------------------------
with rasterio.open(SRC, overview_level=[2, 4, 8, 16].index(OVR_FACTOR)) as ds:
    src = ds.read(1)
    src_transform, src_crs = ds.transform, ds.crs
    bounds = ds.bounds
print("overview", src.shape)

# EuroDEM stores sea inside its tiles as 0 -> treat as no-data
src = np.where(src == 0, NODATA, src)

# --- square extent in LAEA framing mainland Europe + Iceland --------------------
# (Canary Islands etc. are left out so the continent fills the frame)
FRAME_DEG = (-25.0, 34.5, 36.0, 71.5)  # lon_min, lat_min, lon_max, lat_max (arcsec below)
l, b, r, t = transform_bounds(src_crs, DST_CRS, *[v * 3600 for v in FRAME_DEG], densify_pts=101)
cx, cy = (l + r) / 2, (b + t) / 2
half = max(r - l, t - b) / 2 * 0.92
dst_transform = from_bounds(cx - half, cy - half, cx + half, cy + half, W, H)
px = 2 * half / W
print(f"extent {2*half/1000:.0f} km, pixel {px:.0f} m")

dem = np.full((H, W), np.nan, dtype=np.float32)
reproject(src.astype(np.float32), dem,
          src_transform=src_transform, src_crs=src_crs, src_nodata=NODATA,
          dst_transform=dst_transform, dst_crs=DST_CRS, dst_nodata=np.nan,
          resampling=Resampling.average)
land = ~np.isnan(dem)
z = np.where(land, dem, 0.0)

# --- hillshade (multidirectional-ish blend) -------------------------------
def hillshade(z, az, alt, zfac):
    gy, gx = np.gradient(z * zfac, px)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = np.radians(360 - az + 90), np.radians(alt)
    return np.clip(np.sin(alt) * np.cos(slope) +
                   np.cos(alt) * np.sin(slope) * np.cos(az - aspect), 0, 1)

zfac = 3.0  # vertical exaggeration for the small scale
hs = (0.55 * hillshade(z, 315, 40, zfac) + 0.25 * hillshade(z, 270, 45, zfac)
      + 0.20 * hillshade(z, 0, 50, zfac))
hs = hs / np.percentile(hs[land], 99.5)

# --- hypsometric tint -------------------------------------------------------
stops = np.array([-250, 0, 100, 300, 600, 1000, 1500, 2200, 3000, 4800], dtype=np.float32)
cols = np.array([
    [ 92, 140,  90],   # below sea level
    [112, 160, 100],   # lowlands
    [150, 182, 112],
    [196, 205, 140],
    [222, 210, 150],
    [205, 175, 120],
    [178, 140, 100],
    [160, 128, 110],
    [205, 200, 198],
    [250, 250, 250],   # high peaks
], dtype=np.float32)
tint = np.stack([np.interp(z, stops, cols[:, i]) for i in range(3)], axis=-1)

shade = np.clip(0.35 + 0.75 * hs, 0, 1.15)[..., None]
rgb = np.clip(tint * shade, 0, 255)

# no-data (sea and areas outside EuroDEM coverage)
bg = np.array([206, 222, 234], dtype=np.float32)
rgb[~land] = bg

Image.fromarray(rgb.astype(np.uint8)).save(OUT, quality=92, subsampling=0, optimize=True)
print("saved", OUT)
