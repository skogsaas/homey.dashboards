# Build the Svelte app
npm run build --prefix "./web"

# Compress the build folder and copy to the Homey app
Compress-Archive -Path "./web/build/*" -CompressionLevel "Fastest" -DestinationPath "./app/assets/build.zip" -Force

# Publish the Homey App
Push-Location "./app"
homey app install
Pop-Location