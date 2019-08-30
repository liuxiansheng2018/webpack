const path = require('path');
const fs = require('fs');
const Spritesmith = require('spritesmith');

module.exports = function (source) {
  const callback = this.async();
  const imgs = source.match(/url\((\S*)\?__sprite/g);
  const matchedImgs = [];

  for (let i = 0 ; i < imgs.length ; i ++) {
    const img = imgs[i].match(/url\((\S*)\?__sprite/)[1];
    matchedImgs.push(path.join(__dirname, img));
  }
    Spritesmith.run({
      src: matchedImgs
    }, (err, result)=> {
      if( err ) {console.log(err)}else {console.log(1)};
        fs.writeFileSync(path.join(process.cwd(), 'dist/sprite.jpg'), result.image);
        source = source.replace(/url\((\S*)\?__sprite/g, (match) => {
          return `url("dist/sprite.jpg"`
        })
        console.log(1)
      fs.writeFileSync(path.join(process.cwd(), 'dist/index.css'), source);
      fs.copyFileSync(path.join(process.cwd(), "loaders/index.html"), path.join(process.cwd(), "dist/index.html") );
    callback(null, source)
  })

}