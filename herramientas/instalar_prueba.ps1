# Generates the local samples, then signs, installs and opens the test app on the TV.
$ErrorActionPreference = 'Stop'
$tizen = 'C:\tizen-studio\tools\ide\bin\tizen.bat'
$raiz = Split-Path -Parent $PSScriptRoot
$app = Join-Path $raiz 'prueba-tv'
$tv = 'UN55RU7100GXZS'
$paquete = 'PlayHomeTV.wgt'

python -I (Join-Path $PSScriptRoot 'generar_pruebas.py')

Set-Location $app
Remove-Item *.wgt, author-signature.xml, signature1.xml, .manifest.tmp -Force -ErrorAction SilentlyContinue

& $tizen package -t wgt -s PlayHomeTV -- $app
# The package takes its name from the app, and the TV rejects names with spaces.
Move-Item -Force 'PlayHome TV.wgt' $paquete

& $tizen install -n $paquete -t $tv
& $tizen run -p PlHomeTV01.PlayHomeTV -t $tv
