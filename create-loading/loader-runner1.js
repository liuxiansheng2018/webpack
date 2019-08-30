const path = require('path');
const {runLoaders}  = require('loader-runner');
const fs = require('fs');
/**
 * @resource  String
 */
//如果碰到有的loader会传递参数的时候， 我们需要借用loader-utils来解析得到参数内容
//如果要在loader里面进行异步处理的话需要通过this.async来返回一个异步函数，第一个参数是err， 第二个参数是返回结果
//在loader中使用缓存， webpack中默认使用了loader缓存， 可以使用this.cacheable来关闭，缓存条件loader的结果在相同的输入下有确定的输出结果 ，有依赖的loader无法使用缓存
//loader进行文件输出
runLoaders({
  resource: path.join(__dirname, "./src/demo.txt"),
  loaders: [
    //path.join(__dirname, './src/raw-loader.js') 没有参数时可以这样写
    {
      loader: path.join(__dirname, './src/raw-loader.js'),
      options: {name: 'text'}
    }  
  ],
  context: {minimize: true},
  readResource: fs.readFile.bind(fs)
}, (err, result) => {
  err ? console.log(err) : console.log(result) 
})