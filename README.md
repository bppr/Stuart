# Stuart
A stewarding helper application for iRacing, built with Electron/Node and the iRacing SDK.

To start, install NodeJS/NPM. Then run `npm install` in this directory to install electron+irsdk bindings and webpack to build the UI.

## Building the UI code

The UI code needs to be built using Webpack. Run `npx webpack` to do so, or `npx webpack --watch` to rebuild files on changes.

## Running the Electron App

Run `npx electron .` to run the app.

## Issues with Node Module Version?

Run `.\node_modules\.bin\electron-rebuild.cmd` and it should fix it. You may have to nuke and reinstall node modules, then run this command, who knows, npm is wack.
