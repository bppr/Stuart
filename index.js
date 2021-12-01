// TODO: this is fine for dev but we may want to compile TS AOT
const tsConfig = require('./tsconfig.json')
require('ts-node').register({ files: true, baseUrl: "./", paths: tsConfig.compilerOptions.paths })
require('tsconfig-paths/register');

const { app } = require('electron');
const { start } = require('./app/start.ts');

app.on('ready', start)