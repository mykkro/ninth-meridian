# European relief layer

The active raster is the user-supplied `media/europe_relief_4096.jpg` (4096 × 4096), generated from EuroDEM 2023. Its SHA-256 matches `C:\Work\europe-dem\europe_relief_4096.jpg`: `CC7524EE76C1409C183F98429A282996AE5D7BC6887E8C3721FA13FD1BC2EAD0`. The original generation scripts and metadata are preserved in [docs/map-sources](../docs/map-sources/). Obsolete earlier rasters, the stylized relief SVG, and the combined political/relief export were removed. The separate political SVG remains the input used to regenerate the active border data.

## Verified georeferencing

The source GeoTIFF metadata specifies ETRS89 on the GRS80 ellipsoid with **arcsecond angular units** and 2-arcsecond pixels. Its `.tfw` describes that source raster, not the rendered JPEG. `make_relief.py` explicitly reprojects it to **EPSG:3035**, ellipsoidal Lambert azimuthal equal-area centered at 10°E, 52°N, with false easting/northing 4,321,000 / 3,210,000 metres. `relief.js` now implements that projection rather than a fitted spherical approximation. See the [PROJ LAEA documentation](https://proj.org/en/stable/operations/projections/laea.html).

The renderer transforms the frame `[-25, 34.5, 36, 71.5]` from degrees (converted to source arcseconds), densifies each edge with 101 intermediate points, makes the projected bounding box square, and scales its side by 0.92. The resulting JPEG extent in easting/northing order is:

```text
x min: 1413353.745234925 m   x max: 6465832.445449768 m
y min:  954179.124379448 m   y max: 6006657.824594291 m
pixel size: 1233.515307670 m
```

`assets/europe-relief.metadata.json` records these parameters and coordinate checks. `python tests/prepare_europe_map.py` reproduces the frame without reading the large GeoTIFF or requiring GIS packages, updates the embedded runtime metadata, and extracts the border asset.

## Borders and attribution

The DEM contains elevations, not political boundaries. `make_political_svg.py` identifies its input as GISCO `CNTR_RG_*_3035.geojson`; the exact edition and scale of that input are not recorded. Its output already contains 60 country/territory paths in the JPEG pixel frame. `assets/europe-borders.json` extracts those paths from `media/europe_political_4096.svg`, preserving the supplied outlines and holes. Country names are reconciled with the world dataset; Svalbard/Jan Mayen paths are grouped with Norway for gameplay coloring. No raw source SVG markup is inserted into the DOM.

European views use these GISCO paths for country fills, borders, and terrain clipping. Cities, labels, routes, and discovery bounds use the exact ellipsoidal projection. Countries outside the supplied border asset fall back to Natural Earth. World view uses Natural Earth and the original global projection without the regional raster. Country coloring, discovery, keyboard interaction, and travel gates remain dynamic.

**© EuroGeographics for the administrative boundaries.** GISCO terms and attribution are described on the [Eurostat administrative units page](https://ec.europa.eu/eurostat/en/web/gisco/geodata/administrative-units); its stated permission covers noncommercial use. The original GISCO input edition and any separately granted permissions are unknown. EuroDEM attribution and licence documents are bundled as [Attribution Statement](../docs/map-sources/EuroDEM_2023_Attribution_Statement.pdf) and [Open Data Licence](../docs/map-sources/EuroGeographics_Open_Data_Licence_2024.pdf).

The raster contains terrain for selected European countries. Some eastern land, including Ukraine and western Russia, and neighboring countries has no terrain data in the supplied image; live country vectors still provide those regions. The relief is land-clipped and blended in grayscale over country colors. Markers and labels remain above it.

`assets/map-alignment-preview.png` overlays the actual supplied GISCO paths on the unchanged raster. Regenerate with `tests/render_map_alignment.ps1` on Windows. The preview includes borders outside the raster’s terrain coverage, distinguishing missing source coverage from alignment errors. Original SVG paths are rounded to 0.1 pixel and omit closely spaced vertices; DEM and boundary coastlines can differ in detail even with identical georeferencing.
