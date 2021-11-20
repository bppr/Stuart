const path = require('path');

const mode = process.env['NODE_ENV'] == 'production' ? 'production' : 'development';
const devtool = mode == 'production' ? 'source-map' : 'inline-cheap-module-source-map';

module.exports = {
  mode,
  devtool,
  target: 'electron-renderer',
  entry: './ui/ui.main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'ui.bundle.js'
  }
};