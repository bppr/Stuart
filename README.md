# Stuart
A stewarding helper application for iRacing, built with Electron/Node and the iRacing SDK.

To start, install NodeJS/NPM. Then run `npm install` in this directory to install electron+irsdk bindings and webpack to build the UI.

## Building the UI code

The UI code needs to be built using Webpack. Run `npx webpack` to do so, or `npx webpack --watch` to rebuild files on changes.

## Running the Electron App

Run `npm run dev` to run the app.

### Logging and replaying telemetry

Use environment variables to log or replay telemetry files.

`STUART_WRITE_LOG=./telemetry.log npm run dev` to write telemetry data to a file
`STUART_READ_LOG=./telemetry.log npm run dev` to read telemetry data in from a file. (will not attach to iRacing)

## Issues with Node Module Version?

Run `.\node_modules\.bin\electron-rebuild.cmd` and it should fix it. 