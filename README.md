_Dashboards_ is a customizable dashboard for Homey. It allows you to add widgets to a grid. Each widget can have custom positions and sizes.

# Getting started
As the app is currently not reviewed by Homey, it has to be compiled and installed manually.

- Install Homey CLI: https://apps.developer.homey.app/the-basics/getting-started
- Login using the command `homey login`
- Clone or download this repository
- Run `npm ci --prefix ./app` to install dependencies for the Homey app
- Run `npm ci --prefix ./web` to install dependencies for the SvelteKit web app
- Install the app on your Homey using the `install.ps1` powershell script

# Widgets
These are the currently supported widgets. More will come as the project progresses.

## Capability
Allows the user to select a capability for a device to display and control if it's setable.

Currently supports displaying `string`, `boolean` and `number` values. Currently supports controlling `boolean` and `number` values.

Known limitations include displaying and controlling RGB values.

## Insight
Allows the user to select a capability for a device to display historic insight. That means that only capabilities with values that are supported by Homey Insight can be displayed.

Currently supports displaying historic values as a line chart.

Known limitations include automatic update of times series values from. The dashboard has to be refreshed to retrieve updates.

## Image
Allows the user to select an image to be displayed from a device. This includes static images stored by other apps, and camera snapshots. In order to support camera snapshots, the widget can automatically refresh the image everything from every 5 seconds up to 24 hours.