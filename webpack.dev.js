// "use strict";
const glob = require('glob');
const path = require('path');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require("clean-webpack-plugin"); //清除dist文件夹
const HtmlWebpackPlugin = require('html-webpack-plugin');  //生成html文件
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin'); //构建时的报错信息，警高信息
/**多页面打包 */
const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));

  Object.keys(entryFiles)
      .map((index) => {
          const entryFile = entryFiles[index];
          // '/Users/cpselvis/my-project/src/index/index.js'
          const match = entryFile.match(/src\/(.*)\/index\.js/);
          const pageName = match && match[1];

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
    filename: '[name].js'
  },
  mode: 'development',
  module:{
    rules: [
      {
        test: /.js$/,
        use: 'babel-loader'
      },
      {
        test: /.css$/,
        use:[
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /.(jpg|png|jpeg|svg)$/,
        use: [{
          loader: 'url-loader',
          //参数， 对图片不超过10kb的图片进行压缩成base64的形式
          options: {
            limit: 10240
          }
        }]
      },
      {
        test: /.(woff|woff2|eot|ttf|otf|ttf)$/,
        use: 'file-loader'
      },
    ]
  },
  /*
  * @ 文件监听的原理， webpack通过轮询的方法，判断文件最后的修改时间是否发生了变化，如果发生了变化，不会马上告诉监听者发生了变化，先缓存起来,会等待aggregateTimeout
    缺点： 需要自己去手动的刷新页面
    优点： 我们源文件修改的时候，本需要重新构建打包才可以看到效果， 但是我们设置了 --watch之后，会监听到我们文件发生之后，会自动帮我们构建，节省开发效率
  watch: true, // 设置文件的监听， 默认为false,如果没有设置为true的话，则下面的watchOptions则不执行
  watchOptions: {
    //默认为空不监听文件或者文件夹，正则匹配， 不监听node_module可以提高性能
    ignored: /node_module/,
    //监听到文件变化的时间之后会因为性能的问题需要等待300ms, 看文件在这段时间之内还有没有内容进行改变，默认300
    aggregateTimeout: 300,
    //判断文件是否发生变化通过不停的轮训访问系统文件有没有更改，比较他们最后的修改时间而实现， 默认是每秒访问1000次
    poll: 1000
  }
  */
 devServer: {
   contentBase: './dist',
   hot: true,
 
 },
 plugins: [
   new webpack.HotModuleReplacementPlugin(),
   new CleanWebpackPlugin(),
   new webpack.optimize.ModuleConcatenationPlugin(),
   new FriendlyErrorsWebpackPlugin()
 ].concat(htmlWebpackPlugins),
 devtool: 'inline-source-map'
}