// TODO: this is fine for dev but we may want to compile TS AOT
require('ts-node').register({ files: true })
require('tsconfig-paths/register');

const { app } = require('electron');
const { start } = require('./app/start.ts');

app.on('ready', start)