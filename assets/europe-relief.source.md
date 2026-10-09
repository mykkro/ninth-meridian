# European relief layer

The active layer uses the user-supplied `media/europe-blank-physical-hd.jpg` (1100 × 867), unchanged. Its original source, license, and projection were not supplied.

`relief.js` stores a fitted Lambert-style conic projection, a global affine calibration, and 26 manually estimated coastal landmarks. It projects the vectors into the image's coordinate system; the image remains a single raster at its original aspect ratio. Calibration has approximately 17 pixels RMS residual at the original image resolution. This is a measured approximation, not an identified original CRS or an exact georeference. The low-resolution Natural Earth outlines also simplify coastlines. Exact alignment would require a georeferenced source raster or reliable original projection and extent metadata.

Projection background: [PROJ documentation](https://proj.org/en/stable/operations/projections/lcc.html). The fitted parameters do not imply that the source image was actually made using that projection.

`assets/map-alignment-preview.png` overlays the actual projected outlines directly on the unchanged image. Regenerate it with `tests/render_map_alignment.ps1` on Windows. European views use this calibration; World view uses the global projection without the regional image.

The SVG clips the unchanged image to the projected country land shapes and applies a translucent grayscale multiply blend. This keeps unvisited countries gray and visited colors visible. Labels, routes, and clickable destinations stay above the terrain. No external tile service is needed.

The earlier stylized `europe-relief.svg` remains an unused asset.
