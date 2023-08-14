# Build the Svelte app
npm run build --prefix "./web"

if (Test-Path "./app/assets/dashboard") {
  Remove-Item "./app/assets/dashboard" -Recurse -Force
} 

Copy-Item -Path "./web/build" -Destination "./app/assets" -Recurse
Rename-Item -Path "./app/assets/build" -NewName "dashboard"