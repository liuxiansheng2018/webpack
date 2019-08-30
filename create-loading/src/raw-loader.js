const LoaderUtils = require('loader-utils'); // 解析传递参数
const fs = require('fs');
const path = require('path');
module.exports = function (source) {
  const {name} = LoaderUtils.getOptions(this);  //获取参数
  this.cacheable(false); //关闭缓存
  const callback = this.async();
  var json = source.replace(/f/g, 'g')
                   .replace(/B/g, 'b');
  //在loader里面抛出异常有两种方法 1. throw Error('error')    2. this.callback(new Error('error') , json),
  //   throw Error('Error')
  //this.callback函数里面可以传递多个参数，但是一个参数一定是一个error，（null, json ,1,2,34,）
  //this.callback(null, json)

  /* 异步
  fs.readFile(path.join(__dirname, "./async.txt"),'utf-8' , (err, data) => {
    if (err) {
      callback(err, '');
    } else {
      callback(null, data)
    }
  })
  */

  //文件写入 在有webpack的情况下起作用，loader-runner中没有this.emitFile方法函数
  // const interpolateName = LoaderUtils.interpolateName(this, '[name].[ext]', source);
  // console.log(interpolateName,"===++" )
  // this.emitFile(path.join(__dirname, `dist/${interpolateName}`), source);
  // return source;
}