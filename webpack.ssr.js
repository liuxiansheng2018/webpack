 "use strict";
const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugins = require("mini-css-extract-plugin"); //把我们的css从build里面提取出来，所以需要删除我们的style-loader,添加我们的插件的loader
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin"); // 对css进行压缩
const HtmlWebpackPlugin = require('html-webpack-plugin');  //生成html文件
const {CleanWebpackPlugin} = require("clean-webpack-plugin"); //清除dist文件夹
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin'); //抽离出公共组件
/**多页面打包 */
const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index-server.js'));

  Object.keys(entryFiles)
      .map((index) => {
          const entryFile = entryFiles[index];
          const match = entryFile.match(/src\/(.*)\/index-server\.js/);
          const pageName = match && match[1];
          if(pageName) {
            entry[pageName] = entryFile;
          htmlWebpackPlugins.push(
              new HtmlWebpackPlugin({
                  inlineSource: '.css$',
                  template: path.join(__dirname, `src/${pageName}/index.html`),
                  filename: `${pageName}.html`,
                  chunks: ['vendors', pageName],
                  inject: true,
                  minify: {
                      html5: true,
                      collapseWhitespace: true,
                      preserveLineBreaks: false,
                      minifyCSS: true,
                      minifyJS: true,
                      removeComments: false
                  }
              })
            );
          }
          
      });

  return {
      entry,
      htmlWebpackPlugins
  }
}

const { entry, htmlWebpackPlugins } = setMPA();
module.exports={
  entry: entry,
  output:{
    path: path.join(__dirname, 'dist'),
    filename: '[name]-server.js',
    libraryTarget: 'umd'
  },
  mode: 'production',
  module:{
    rules: [
      {
        test: /.js$/,
        use: 'babel-loader'
      },
      {
        test: /.css$/,
        use:[
          MiniCssExtractPlugins.loader,
          'css-loader'
        ]
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugins.loader,
          'css-loader',

          {
            loader: 'postcss-loader',
            options:{
              plugins: ()=>[
                require("autoprefixer")({
                  overrideBrowserslist: ['last 2 version', '>1%' , 'ios 7']
                })
              ]
            }
          },
          {
            loader: 'px2rem-loader',
            options: {
              
                remUnit: 75,
                remPrecision: 8
            }
        },
        'less-loader',
        ]
      },

      {
        test: /.(jpg|png|jpeg|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: "[name]_[hash:8].[ext]"
          }
        }]
      },
      {
        test: /.(woff|woff2|eot|ttf|otf|ttf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: "[name]_[hash:8].[ext]"
          }
        }]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugins({
      filename: '[name]_[contenthash:8].css'
    }),
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g, //全局匹配
      cssProcessor: require('cssnano') //进行压缩
    }),
    new CleanWebpackPlugin()
  ].concat(htmlWebpackPlugins)

}