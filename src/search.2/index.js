import React from 'react';
import ReactDom from 'react-dom';
// import axios from 'axios'
import "../../common"
import {a} from './tree-shaking';
import "../css/search.less"
import largeNumber from 'lagerxiaos';
import logo from "../assets/image/logo.jpeg" 
class Search extends React.PureComponent{
  constructor(){
    super(...arguments)
    this.state={
      Text: null
    }
  }
  hanleClick(){
    import('./text.js').then((Text)=>{
      this.setState({
        Text: Text.default
      })
    })
  }
  render () {
    // const A = a()
    let {Text} = this.state;
    const addResult = largeNumber('999', '1');
    return (
      <div className="search-Text" onClick={this.hanleClick.bind(this)}>
          {
            Text && <Text />
          }
          {
            addResult
          }
        你好，欢迎来到webpack的世界,在这里我添加了webpack --watch
        在这里我是通过webpack中设置了文件监听的方法，实现的方法是的
        <img src={logo} alt="logo"/>
      </div>
    )
  }
}
ReactDom.render(
  <Search />,
  document.getElementById("root")
)