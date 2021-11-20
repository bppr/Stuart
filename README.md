# IRSDK-Electron
A very basic IRSDK-JS-Electron proof of concept

To start, install NodeJS/NPM. Then run `npm install` in this directory to install electron+irsdk bindings and webpack to build the UI.

## Building the UI code
The UI code needs to be built using Webpack. Run `npx webpack` to do so, or `npx webpack --watch` to rebuild files on changes. This currently isn't strictly needed but the infrastructure is there for when I start adding UI elements.

## Running the Electron App

Run `npx electron .` to run the app. It currently only logs incidents to the console, so you'll have to show the developer tools in the `View` menu or use Ctrl+Shift+I.

## Issues with Node Module Version?

Run `.\node_modules\.bin\electron-rebuild.cmd` and it should fix it. You may have to nuke and reinstall node modules, then run this command, who knows, npm is wack.
