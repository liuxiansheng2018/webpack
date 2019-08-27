const glob = require('glob');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugins = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'));

  Object.keys(entryFiles).map((index) => {
    const entryFile = entryFiles[index];
    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];

    entry[pageName] = entryFile;
    return htmlWebpackPlugins.push(
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
          removeComments: false,
        },
      }),
    );
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
};
const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].[ext]',
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: 'babel-loader',
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugins.loader,
          'css-loader',
        ],
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugins.loader,
          'css-loader',

          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer({
                  overrideBrowserslist: ['last 2 version', '>1%', 'ios 7'],
                }),
              ],
            },
          },
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,
              remPrecision: 8,
            },
          },
          'less-loader',
        ],
      },
      {
        test: /.(jpg|png|jpeg|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]_[hash:8].[ext]',
          },
        }],
      },
      {
        test: /.(woff|woff2|eot|ttf|otf|ttf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name]_[hash:8].[ext]',
          },
        }],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugins({
      filename: '[name]_[contenthash:8].css',
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    function errorPlugin() {
      this.hooks.done.tap('done', (stats) => {
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          // eslint-disable-line的作用是可以忽略检查
          console.log('build error'); //eslint-disable-line  
          process.exit(1);
        }
      });
    },
  ].concat(htmlWebpackPlugins),
};
