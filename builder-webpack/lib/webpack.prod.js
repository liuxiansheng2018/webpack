const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = require('cssnano');
const merge = require('webpack-merge');
// const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const baseConfig = require('./webpack.base');

const prodConfig = {
  mode: 'production',
  plugins: [
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g, // 全局匹配
      cssProcessor: cssnano, // 进行压缩
    }),
  ],
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
        vendors: {
          test: /(react|react-dom)/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
module.exports = merge(baseConfig, prodConfig);
