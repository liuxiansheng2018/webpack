const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base');

const devConfig = {
  mode: 'develoption',
  devServer: {
    contentBase: './dist',
    hot: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: 'source-map',
};

module.exports = merge(baseConfig, devConfig);
