# Diagnostic preview: actual fitted vector outlines over the unchanged source image.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$workspace = Split-Path -Parent $PSScriptRoot
$code = Get-Content -LiteralPath (Join-Path $workspace 'relief.js') -Raw
$calibration = ([regex]::Match($code, 'const calibration=(\{.*\});').Groups[1].Value | ConvertFrom-Json)
$data = Get-Content -LiteralPath (Join-Path $workspace 'assets/world-countries.geojson') -Raw | ConvertFrom-Json
$bitmap = [System.Drawing.Bitmap]::new((Join-Path $workspace 'media/europe-blank-physical-hd.jpg'))
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = 'AntiAlias'
$pen = [System.Drawing.Pen]::new([System.Drawing.Color]::Magenta, 1.2)
try {
 foreach ($feature in $data.features) {
  if ($feature.properties.CONTINENT -ne 'Europe' -and $feature.properties.ADMIN -notin @('Turkey','Morocco','Algeria','Tunisia')) { continue }
  if ($feature.geometry.type -eq 'Polygon') { $polygons = ,$feature.geometry.coordinates } else { $polygons = $feature.geometry.coordinates }
  foreach ($polygon in $polygons) { foreach ($ring in $polygon) {
   $points = foreach ($coordinate in $ring) {
    $phi = [Math]::Max(-85.0,[Math]::Min(85.0,[double]$coordinate[1])) * [Math]::PI / 180
    $rho = [Math]::Pow([Math]::Tan([Math]::PI / 4 + $phi / 2), -$calibration.n) / $calibration.n
    $theta = $calibration.n * $coordinate[0] * [Math]::PI / 180
    $p = @(($rho * [Math]::Sin($theta)), (-$rho * [Math]::Cos($theta)), 1)
    $x = $calibration.coefficients[0][0]*$p[0] + $calibration.coefficients[0][1]*$p[1] + $calibration.coefficients[0][2]
    $y = $calibration.coefficients[1][0]*$p[0] + $calibration.coefficients[1][1]*$p[1] + $calibration.coefficients[1][2]
    [System.Drawing.PointF]::new([float]$x,[float]$y)
   }
   if ($points.Count -gt 1) { $graphics.DrawLines($pen,[System.Drawing.PointF[]]$points) }
  } }
 }
 $bitmap.Save((Join-Path $workspace 'assets/map-alignment-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png)
} finally { $pen.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
