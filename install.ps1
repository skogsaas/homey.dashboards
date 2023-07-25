# Build the Svelte app
& ./prepare.ps1

# Publish the Homey App
Push-Location "./app"
homey app install
Pop-Location