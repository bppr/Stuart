const path = require('path');
const PathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const mode = process.env['NODE_ENV'] == 'production' ? 'production' : 'development';
const devtool = mode == 'production' ? 'source-map' : 'inline-cheap-module-source-map';

const root = (...args) => path.resolve(__dirname, ...args);

module.exports = {
  mode,
  devtool,
  target: 'electron-renderer',
  entry: './ui/main.tsx',
  output: {
    path: root('build', 'ui'),
    filename: 'ui.bundle.js'
  },
  module: {
    rules: [
      { 
        test: /\.tsx?/, 
        loader: 'ts-loader', 
        options: { configFile: root('ui', 'tsconfig.webpack.json') }, 
        exclude: /node_modules/ 
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [ new PathsPlugin() ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './ui/html', to: 'html' },
        { from: './ui/styles', to: 'styles' }
      ]
    })
  ]
};