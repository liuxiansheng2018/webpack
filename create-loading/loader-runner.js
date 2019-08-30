const path = require('path');
const {runLoaders}  = require('loader-runner');
const fs = require('fs');
/**
 * @resource  String
 */

runLoaders({
  resource: "./loaders/index.css",
  loaders: [
    path.resolve(__dirname, "./loaders/sprite-loader")
  ],
   readResource: fs.readFile.bind(fs)
}, (err, result) => {
  err ? console.log(err) : console.log(result) 
})