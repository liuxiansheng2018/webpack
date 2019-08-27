// "use strict";
const glob = require('glob');
const path = require('path');
const HappyPack = require('happypack'); //多线程提高构建速度
const TerserWebpackPlugin = require("terser-webpack-plugin");//多线程进行压缩，提高构建速度
const webpack = require('webpack');
const MiniCssExtractPlugins = require("mini-css-extract-plugin"); //把我们的css从build里面提取出来，所以需要删除我们的style-loader,添加我们的插件的loader
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin"); // 对css进行压缩
const HtmlWebpackPlugin = require('html-webpack-plugin');  //生成html文件
const {CleanWebpackPlugin} = require("clean-webpack-plugin"); //清除dist文件夹
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin'); //抽离出公共组件
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin'); //如果构建失败和成功，警告等信息
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");     //查看具体每个loader和plugin的花费时间
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;  //会帮我们打开一个服务器查看文件的大小，压缩后的大小
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin'); //通过设置压缩缓存来提高二次构建速度
const PurgecssPlugin = require('purgecss-webpack-plugin'); // 去除无用的组件中没有用到css

//const smp = new SpeedMeasureWebpackPlugin();
const PATHS = {
  src: path.join(__dirname, "src")
}
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
                  chunks: ['vendors','commons', pageName],
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
//module.exports=smp.wrap({
module.exports={

  // entry: {
  //   index: "./src/index.js",
  //   search: "./src/search.js"
  // },
  entry: entry,
  output:{
    path: path.join(__dirname, 'dist'),
    //给js生成chunkhash指纹
    filename: '[name]_[chunkhash:8].js'
  },
  mode: 'none',
  module:{
    rules: [
      {
        test: /.js$/,
        // use: 'babel-loader'
        // use:[
        //   {loader: 'thread-loader', options:{workers: 5}},  //使用webpack4多进程
        //   'babel-loader'
        // ]
        include: path.resolve('src'),  //只解析src里面的js文件
        use: 'happypack/loader',  //用作happypack
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
                //css前缀自动补全
                require("autoprefixer")({
                  //需要兼容的版本
                  // browsers: ['last 2 version', '>1%' , 'ios 7']
                  //最新版本支持这样编写，最新版本的autoprefixer建议吧browserlist写在packages.json里面或者browserslistrc文件里面不过可以直接吧browsers直接换成overrideBrowserslist
                  overrideBrowserslist: ['last 2 version', '>1%' , 'ios 7']
                })
              ]
            }
          },
          {
            loader: 'px2rem-loader',
            options: {
              //remUnit设置代码75时，在750的设计图时字体时24px,就写24px，在iphone上实际时12px， 如果
              //remUnit设置了37.5时， 在375的设计图上字体是12px, 就写12px(实际在iphone上是12px),以iphone 6为参考
                remUnit: 75,  //设计图 / 10 
                remPrecision: 8 //px转换rem的后8位
            }
        },
        'less-loader',
        ]
      },
      // {
      //   test: /.(jpg|png|jpeg|svg)$/,
      //   use: [{
      //     loader: 'url-loader',
      //     //参数， 对图片不超过10kb的图片进行压缩成base64的形式
      //     options: {
      //       limit: 10240
      //     }
      //   }]
      // },
      {
        test: /.(jpg|png|jpeg|svg)$/,
        use: [{
          loader: 'file-loader',
          //参数， 图片的文件指纹
          options: {
            name: "[name]_[hash:8].[ext]"
          }
        },
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
              quality: 65
            },
            // optipng.enabled: false will disable optipng
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: '65-90',
              speed: 4
            },
            gifsicle: {
              interlaced: false,
            },
            // the webp option will enable WEBP
            webp: {
              quality: 75
            }
          }
        },
      ]
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

  plugins: [
    new MiniCssExtractPlugins({
      filename: '[name]_[contenthash:8].css'
    }),
    new OptimizeCssAssetsWebpackPlugin({
      assetNameRegExp: /\.css$/g, //全局匹配
      cssProcessor: require('cssnano') //进行压缩
    }),
    new HappyPack({
      //cacheDirectory=true是用来进行2次提升构建速度
      loaders: [ 'babel-loader?cacheDirectory=true']
    }),
    new HardSourceWebpackPlugin(),
    /* 分离打包cdn引入的react, react-dom*/
    // new HtmlWebpackExternalsPlugin({
    //   externals: [
    //     {
    //       module: 'react',
    //       entry: 'https://cdn.bootcss.com/react/16.9.0-alpha.0/cjs/react.production.min.js',
    //       global: 'React',
    //     },
    //     {
    //       module: 'react-dom',
    //       entry: 'https://cdn.bootcss.com/react-dom/16.9.0-alpha.0/cjs/react-dom-server.browser.production.min.js',
    //       global: 'ReactDOM',
    //     },
    //   ],
    // }),
    /*自己手写的webpack构建异常时上报信息* */
      //this是代表我们的一个compiler，compiler是我们webpack中的一个实列,
      //这是在webpack4中的一个配置， 如果是在webpack3中则要把this.hook.done.tap 替换成this.plugin
      function() {
        this.hooks.done.tap('done', (stats) => {
            if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') == -1)
            {
                console.log('build error');
                process.exit(1);
            }
        })
    },    
    /*
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "/src/search.html"), //找到我们模版
      filename: 'search.html',
      chunks: ['search'],   //如果不设置的话，会把页面中所有的js文件都会给引用进来，
      inject: true,   //当为true的时候， 我们的js文件插入到我们的html文件中,位于html底部
      minify: {
        collapseWhitespace: true,    //html中去除空格
        html5: true,
        preserveLineBreaks: false,  //如果设置为ture的话构建后的html页面不会压缩， 当为false的时候，页面代码会进行压缩
        minifyCSS: true,  //压缩html里面的css,默认为false
        minifyJS: true,  //压缩html里面的js
        removeComments: false //是否移除注释
      }

    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "/src/index.html"), //找到我们模版
      filename: 'index.html',
      chunks: ['index'],
      inject: true,   //当为true的时候， 我们的js文件插入到我们的html文件中,位于html底部
      minify: {
        collapseWhitespace: true,    //html中去除空格
        html5: true,
        preserveLineBreaks: false,
        minifyCSS: true,  //压缩html里面的css,默认为false
        minifyJS: true,  //压缩html里面的js
        removeComments: false //是否移除注释
      }
    }),
    */
    new CleanWebpackPlugin(),
   new FriendlyErrorsWebpackPlugin(),
   new webpack.DllReferencePlugin({
     manifest: require('./build/library/library.json')
   }),
   new PurgecssPlugin({
     paths: glob.sync(`${PATHS.src}/**/*`, {nodir: true})
   })
  //  new WebpackBundleAnalyzer()
  ].concat(htmlWebpackPlugins),
  /**抽离公共组件 */
  /*
   optimization: {
     //并行压缩
     minimizer: [
          new TerserWebpackPlugin({
            parallel:true,
            cache: true //设置缓存用作2次构建提升速度
          })
        ],
        splitChunks: {
            minSize: 0,
            cacheGroups: {
                commons: {
                    name: 'commons',
                    chunks: 'all',
                    minChunks: 2
                },
                  vendors: {
                    test: /(react|react-dom)/,
                    name: 'vendors',  
                    chunks: 'all'
                  },
            }
        },
        
    },
    */
    /*
  optimization:{
    splitChunks: {
      minSize: 30000,   //当这个文件的大小这个设置的值为不抽离
      cacheGroups:{
        commons: {
          name: 'commons',    //无论异步还是同步都可以被构建
          chunks: 'all',
          minChunks: 2        //当这个模块引用到二次的时候会会抽离出来
        }
      }
    }
  }
    
  *//*
      cacheGroups: {
        commons: {
          test: /(react|react-dom)/,
          name: 'vendors',
          chunks: 'all'
        }
      }
      */
  //   }
  // },
  //设置source map
  /**
   * eval  不会独立的打包出map文件， 在打包的js文件可以看到我们我们eval包裹着的模块代码
   * source-map 会独立的打出一个.js.map文件出来, 可以帮我们定位到我们内容
   * inline-source-map: 我们的js和.js.map文件合并在一起，但是会导致我们的文件会很大，
   * cheap-source-map代码报错之后，只能看到行的错误堆栈， 无法看到列的错误堆栈，如果这行的代码有很多的话， 也是无法马上定位到消息
   */
   devtool: 'source-map',
  //  stats: 'errors-only' //当构建失败的时候，会有报错提示显示
// })
      //如果在组件里面碰到react， reat-dom可以减少收缩范围
      resolve: {
            alias: {
                'react': path.resolve(__dirname, './node_modules/react/umd/react.production.min.js'),
                'react-dom': path.resolve(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js'),
            },
            extensions: ['.js'],
            mainFields: ['main']
        }
}