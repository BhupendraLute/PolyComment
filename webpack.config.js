const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
  target: 'node', // extensions run in a node context
  mode: 'none', // this leaves the code readable while we debug
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '..[resource-path]'
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is provided by the editor
  },
  resolve: {
    extensions: ['.ts', '.js'],
    mainFields: ['module', 'main'] // prefer ESM versions of dependencies
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  }
};
