# Build the Svelte app
npm run build-pages --prefix "./web"

if (Test-Path "../skogsaas.github.io/build") {
  Remove-Item "../skogsaas.github.io/build" -Recurse -Force
} 

Copy-Item -Path "./web/build" -Destination "../skogsaas.github.io/build" -Recurse