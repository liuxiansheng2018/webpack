
if (typeof window === 'undefined') {
  global.window = {};
}
const fs = require('fs');
const express = require('express');
const path = require('path');
const { renderToString } = require('react-dom/server');
const SSR = require('../dist/search-server');
const template = fs.readFileSync(path.join(__dirname, "../dist/search.html"), 'utf-8');
let app = express();
const data = require("./data");
const server = (port) => {
  
  app.use(express.static('dist'));
  
  app.get('/search', (req,res)=>{
    
    const html = renderMakeUp( renderToString(SSR) )
    res.status(200).send(html);
  })
  app.listen(port, ()=>{
    console.log(`none服务已经启动， 端口号为${port}`)
  })
}
const renderMakeUp = (str) => {
  const dataStr = JSON.stringify(data);
  return template.replace('<!--HTML_PLACEHOLDER-->', str)
                 .replace('<!--INITIAL_DATA_PLACEHOLDER-->',`<script>window.__initial_data=${dataStr}</script>`)
}
server(process.env.PORT||3000)