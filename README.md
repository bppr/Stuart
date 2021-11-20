# IRSDK-Electron
A very basic IRSDK-JS-Electron proof of concept

To start, install NodeJS/NPM. Then run `npm install` in this directory to install electron+irsdk bindings.

Then run `npx electron .` to start the app. If you see a Node versioning error, remove your node modules directory, `npm i`, and then run `.\node_modules\.bin\electron-rebuild.cmd` to rebuild the native bindings.
