const path = require('path');
const tsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const mode = process.env['NODE_ENV'] == 'production' ? 'production' : 'development';
const devtool = mode == 'production' ? 'source-map' : 'inline-cheap-module-source-map';

const root = (...args) => path.resolve(__dirname, ...args);

module.exports = {
  mode,
  devtool,
  target: 'electron-renderer',
  entry: './ui/main.tsx',
  output: {
    path: root('build'),
    filename: 'ui.bundle.js'
  },
  module: {
    rules: [
      { test: /\.tsx?/, use: 'ts-loader', exclude: /node_modules/ },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [ new tsConfigPathsPlugin() ]
  }
};