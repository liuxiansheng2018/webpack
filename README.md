> 如果我们想要解析es6的语法的，我们需要通过babel-loader的形式进行转换，但是babel-loader又是依赖与babel的配置文件， 所以我们首先需要安装依赖 cnpm i @babel/core @babel/preset-env babel-loader -D, 其次在创建babelrc文件， 在present属性里写上我们的解析依赖

>webpack中热更新的原理、
    "我们使用热更新的时候其实不会刷新我们的浏览器，不会输出文件，放在内存当中进行使用，要配合HotModuleReplacementPlugin插件进行使用的"
    当我们第一次运行webpack的时候，我们的wwebpack会通过webpack.compiler将我们的js文件编译成bundle.js文件，  将我们构建的文件传输给bundle Server服务器，让我们的代码可以在服务器上访问，如果本地文件更新的时候还是会经过webpack.compiler编译，编译之后，会把代码发送个HMR server服务器，HMR就可以知道我们源代码那些部分进行了修改，HMR Serve会去通知我们的HMR Runtime（客户端）那些文件发生了变化，通常以json的形式传递，HMR RunTime会更新我们的代码，最终会进行改变，HotModuleReplacementPlugin就是将HMR Runtime会在开发打包的阶段会被注入到浏览器端的build.js里面， 这样浏览器的bundle.js就会与服务器进行websoket连接， 当收到文件变化之后，就会自动更新我们的代码

>文件指纹
>  Hash： 每次我们项目有文件进行修改的时候，整个文件构建的hash值都会发生
      "a文件进行修改， b文件不变，如果使用hash的话， 会导致a，b文件的hash值都会进行改变"

>  Chunkhash: 和webpack打包的chunk相关， 不同的entry会生成不同的chunkHash
      "一个文件的变化， 不会影响其他文件的hash, 用于jshash"

>  Contenthash: 根据文件的内容来定义， 文件内容如果没有变化的话， 则hash是不会有变化的
      "一个页面中同时引用了js，css文件，如果js文件进行修改的话，假设使用的chunkhash的话，css虽然没有修改，但是hash值也会改变，所以css可以使用ContentHash"
>  webpack的chunkhash无法和HotModuleReplacementPLugins一起使用的  


>html -- css 压缩 -- js
>   js压缩：
        “由于我们使用的webpack4的情况，所以当我们在使用正式的构建的时候，webpack会自动帮我们构建的，uglifyjs-webpack-plugin”

>   css压缩
      在webpack1.0的时候压缩我们的css的时候可以通过css-loader里面通过设置参数，来进行压缩，后被废除，在最新的webpack当中我们需要
      使用optimize-css-assets-webpack-plugin这个插件来结合cssnano来配合使用css压缩

>   html压缩
        html压缩我们可以使用html-webpack-plugin插件进行使用，但是这个插件仅仅是帮我们生成html文件的， 如果想要压缩我们的html文件的话，需要设定特定的参数，列入temaplate, filename, chunks, inject, minify参数， 其中minify是个对象，我们可以在里面设置我的html压缩， 去除注释， 压缩html中的css， js等内容

>自动补全css前缀问题
      首先安装npm i postcss-loader autoprefixer的安装包， 设置参数
>px自动转换为rem
      在之前的项目中, 我们一般在设计图中量出宽度，前端在通过手头计算得出rem的值，来进行适配， 但是这张方法的适配是存在一个问题， 就是前端同学需要进行大量的计算， 而这些计算本该由我们的代码来实现的， 所以在webpack中我们可以通过px转换rem的功能来帮我们实现， 这个插件就是px2rem-loader
      1. 首先npm i px2rem-loader， 但是在我们使用这个loader的时候，要注意的一点就是这个loder要放在less-loader之后，不然会导致less嵌套里面的内容无法解析导致报错，
      2. 这个px2rem-loader需要结合我们的lib-flexible来使用， 在我们的html代码中内联进去手淘的lib-flexible的库，帮我们计算font-size的值， 因为loader只是帮我们把px转换成rem， 无法计算px 与 rem的转换关系（之所以用手淘，因为手淘里面🈶️解决1px像素的问题）
      3. 当我们在less样式当中，我们如果不需要把px转换成rem的话我们需要通过设置/*no*/来防止转换  font-size: 12px /*no*/；
      4. 缺点： 如果我们在html内联样式里面写入了我们的px的话， 我们需要在手写一个loader库去实现匹配解析html文件， 在将html里面的px转换成rem
>资源内联
      从代码层面， 
            如页面框架初始化脚本， 如通过lib-flexlib来计算我们font-size的值
            上报点相关
                  css的初始化， css加载完成，js的初始化，js加载完成
            css内联避免页面闪动
      请求层面
            减少http的请求数量，例如小图片和文字（url-loader）
>简单的多页面打包
      动态获取entry和设置html-webpack-plugin的数量
      利用glob这个插件来实现，以同步的形式
            entry: glob.sync(path.join(__dirname, "./src/*/index.js))
>source map
>提取页面公共资源
      方法一： html-webpack-externals-plugin
      方法二： SplitChunksPlugin进行公共脚本的分离， 这个插件是webpack4内置的，代替了CommonsChunkPlugin插件，
>tree shaking(摇树优化)
      概念：
            1个模块可能有多个方法，(如果引用了这个这个公用js，但是没有使用，也会被tree shaking) 只要其中有一个方法用到了，则整个文件都会被打包到bundle里面进去， tree shaking就是只把用到的方法打包到bundle里面，没用到的方法都会被通过uglify阶段被擦除掉。
      使用方法：
            webpack默认是在线上环境production是支持的，默认开启
            需要在.babelrc里面设置modules: false
      要求： 必须是es6的语法， cjs的方式是不支持的
>    tree shaking 原理
        DCE(Elimination)： 这个是uglify擦除的问题
            代码不会被执行到， 不可到达   含义 if(false) a();a函数不会被执行
            代码执行的结果不会被用到 含义：从cont A = a()；但是最后这个a没有被使用
            代码只会影响到死的变量（只写不读）， 含义写了一个变量，但是通过代码改变了这个变量，但是最后没有用到这个变量
        利用es6模块的特点：
            。只能作为模块顶层的语句出现 
            。import的模块名字只能是字符串常量
            。import binding是immutable的

>scoped Hoisting
      没有scoped Hoisting时我们的代码构建后存在大量的闭包代码，
      每一个js模块都是一个闭包代码，这样就会产生一个问题，大量的函数闭包包裹代码，导致体积增大（模块越多越明显），运行代码的时侯创建的函数作用的作用域越多，内存开销也是越大
>    模块转换
            import {helloworld} from './helloworld'
            import "../common"
            document.write(helloworld)
          这些模块被webpack转换之后会被带上一层包裹
          import会被转换成为__webpack.require
>    webpack模块机制 
            看项目中目录图片
            src/assets/image/WechatIMG45.jpeg
>    scope hoisting原理
            将所有的模块按照引用顺序放在一个函数作用域里面，然后适当的重命名一些变量以防止变量名冲突
      对比
            通过scope hoisting可以减少函数声明代码和内存开销，
            webpack4在production环境下是默认开启的，必须是es6语法。commonjs不支持
            webpack3中用的插件是webpack.optimize.ModuleConcatenationPlugin()

>代码分割的意义
      对于大的web应用来讲将所有的代码都放到一个文件中显然是不够有效的，特别是当你的某些代码是在某些特殊的时候开始使用，webpack有个功能就是将你的代码分割成chunks（语块），当代码用的到的时候在进行加载
            场景：
                  。抽离相同代码到一个共享块
                  。脚本懒加载，使的初始代码更小
      懒加载js脚本的方式
            commonJS: require.ensure
            es6: 动态import(目前还没有原生支持，需要babel支持)
      如何使用动态import
            安装babel插件
            cnpm install @babel/plugin-syntax-dynamic-import --save-dev
            {
                  "plugin: ['@babel/plugin-syntax-dynamic-import]
            }


>webpack实现ssr
      

>查看我们的构建文件
      缺陷： 颗粒度太粗， 无法准确的看到那个文件的内容打包出来是很大的
      1.方法一:
            在package.json文件中添加
            "webpack --config webpack.prod.js --json > stats.json"
      2.方法二:
            在node.js中引入我们构建的webpack，production设置

>查看构建时候和大小的方案
      "speed-measure-webpack-plugin"  // 查看loader, 和plugin的时间
>查看我们文件大小（体积分析）
      cnpm i webpack-bundle-analyzer文件，会帮我们打开一个服务器地址，从地址里面可以看到我的一个文件大小，
》     用来分析那些问题
            依赖第三方模块文件的大小
            业务组件里面的文件大小
>为什么要使用高版本webpack和node
      webpack的优化原因：
            1.v8引擎带来的优化（for of替代forEach，map,set代替了object, includes代替了indexof）
            2.默认使用md4的hash算法
            3.webpacks AST可以直接从loader传递给AST,减少解析时间
            4.使用字符串方法代替正则表达式
>如何加快我们的构建速度
      1.通过多进程/多实列构建，资源并行
            webpack3 使用happyPack , 已经不维护了
            happypack的原理
                  每次webpack解析一个模块，Happypack会将它所依赖的模块分配给worker的线程中
            happypack过程
                  在webpack中run方法之后，到达了happypack，happaypack会先初始化，初始化之后会创建一个线程池，会将构建任务模块里面的任务会进行分配，将某个模块或者某个依赖分配给happypack的线程，以此类推，一个happypack的线程池可能有包括多个线程，每一个线程会各自的处理这些模块和依赖,处理完成之后，她有一个通信的过程，会讲处理好的资源在传输给happypack的主进程，完成整个构建的一个过程
            webpack4 使用thread-loader 
            或者使用parallel-webpack
      2.通过多进程/多实列， 并行压缩
            方法1: 使用parallel-uglify-plugin插件
            方法2: uglifyjs-webpack-plugin开启parallel参数
            方法3: terser-webpack-plugin开启parallel参数
            terser-webpack-plugin和uglifyjs-webpack-plugin的区别是前一种可以压缩es6,后一种是不可以的

      3. 通过分包的概念来进行提升构建速度
            做法创建一个webpack.dll.js文件, 可以把我们的第三方文件或者是业务公共组件进行打包抽离出来一个manifest文件，打包出来以后通过结合webpack.DllReferencePlugin插件结合把抽离出来的第三方库引入进来达到提升构建速度， 减少构建体积的方法
      4.通过缓存来提升2次构建速度， 在一开始的构建时没有效果
            思路： 1.通过babel-loader来进行缓存
                  2.terser-webpack-plugin来进行缓存
                  3.通过cache-loader或者hard-source-webpack-plagin来进行使用
>减少我们的构建体积
      1.有可能我们切图下来图片很大，我们需要自己找个网址进行压缩图片这样会导致我们零碎， 所以我们可以通过image-webpack-loader方法把这个任务交给我们的webpack去完成

      2. css中的tree shaking
            npm install purgecss-webpack-plugin
            把里面的src中组件中没有用到的css进行去除，