import { createElement, render, Component } from "./toy-react";

class MyComponent extends Component {
  render(){
    return (
      <div >
        <h1>MyComponent</h1>
        {this.children}
      </div>
    )
  }
}


window.a = <MyComponent id="a" class="c">
  <div class="234">asd</div>
  <div class="234">asd</div>
  <div class="234">asd</div>
</MyComponent>;

render(a, document.body);