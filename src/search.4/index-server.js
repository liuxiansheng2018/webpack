const React = require('react');
require("../../common");
require("../css/search.less");
const largeNumber = require('lagerxiaos');
const logo = require("../assets/image/logo.jpeg") 
class Search extends React.Component{
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
module.exports = <Search />