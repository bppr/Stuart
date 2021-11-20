const { app } = require('electron');
const { start } = require('./app/start.js');

app.on('ready', start)