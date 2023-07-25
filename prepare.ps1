# Build the Svelte app
npm run build --prefix "./web"

if (Test-Path "./app/assets/dashboard") {
  Remove-Item "./app/assets/dashboard" -Recurse -Force
}

Copy-Item -Path "./web/build/*" -Destination "./app/assets/dashboard"
Copy-Item -Path "./web/build/_app" -Destination "./app/assets/dashboard" -Recurse