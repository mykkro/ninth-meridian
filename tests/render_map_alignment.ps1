# Diagnostic preview: supplied GISCO outlines over their original EuroDEM raster.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspace = Split-Path -Parent $PSScriptRoot
$data = Get-Content -LiteralPath (Join-Path $workspace 'assets/europe-borders.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$bitmap = [System.Drawing.Bitmap]::new((Join-Path $workspace 'media/europe_relief_4096.jpg'))
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = 'AntiAlias'
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::Magenta, 1.2)
$culture = [System.Globalization.CultureInfo]::InvariantCulture
try {
 foreach ($country in $data.countries) {
  foreach ($ring in ($country.path -split 'Z')) {
   $points = foreach ($match in [regex]::Matches($ring, '[ML](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)')) {
    [System.Drawing.PointF]::new([float]::Parse($match.Groups[1].Value,$culture), [float]::Parse($match.Groups[2].Value,$culture))
   }
   if ($points.Count -ge 3) { $graphics.DrawPolygon($pen,[System.Drawing.PointF[]]$points) }
  }
 }
 $bitmap.Save((Join-Path $workspace 'assets/map-alignment-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
} finally { $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
