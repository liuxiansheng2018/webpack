const path = require('path');
const webpack = require('webpack'); 
module.exports = {
  entry: {
    library: [
      'react',
      "react-dom"
    ]
  },
  output: {
    filename: '[name]_[hash].dll.js',
    path: path.join(__dirname, 'build/library'),
    library: '[name]' //到时候暴露出来库的名字
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]__[hash]',
      path: path.join(__dirname, 'build/library/[name].json'),
    })
  ]
}