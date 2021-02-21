const RENDER_TO_DOM = Symbol('render to dom');
export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  [RENDER_TO_DOM](range){
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }

  update() {
    const isSameNode = (oldNode, newNode) => {
      // type
      if (oldNode.type !== newNode.type) return false;
      // props
      for (let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) {
          return false;
        }
      }
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
        return false;
      }

      if (newNode.type === '#text') {
        if (newNode.content !== oldNode.content){
          return false;
        }
      }

      return true;
    } 
    const update = (oldNode, newNode) => {
      // type, props, chidren
      // #text content
      if (isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode._range;

      let newChildren = newNode.vchildren;
      let oldChildren = oldNode.vchildren;
      if (!newChildren || !newChildren.length) {
        return;
      }
      let tailRange = oldChildren[oldChildren.length - 1]._range;
      for (let i=0; i<newChildren.length; i++) {
        let newChild = newChildren[i];
        let oldChild = oldChildren[i];
        if (i < oldChildren.length){
          update(oldChild, newChild);
        } else {
            let range = document.createRange();
            range.setStart(tailRange.endContainer, tailRange.endOffset);
            range.setEnd(tailRange.endContainer, tail.endOffset);
            newChild[RENDER_TO_DOM](range);
            tailRange = range;
        }
      } 
    }

    let vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;
  }


  setState(newState) {
    if (typeof this.state !== 'object' || this.state === null) {
      this.state = newState;
      this.rerender();
      return;
    }
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p]);
        }
      }
    }
    merge(this.state, newState);
    this.update();
  }

  get vdom() {
    return this.render().vdom;
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super();
    this.type = type;
  }

  /* setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)/)) {
      this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
    }else {
      if (name === 'className') {
        name = 'class';
      }
      this.root.setAttribute(name, value);
    }
  }

  appendChild(component) {
    let range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);

    component[RENDER_TO_DOM](range);
  } */

  [RENDER_TO_DOM](range){
    this._range = range;

    const root = document.createElement(this.type);
    // hanle props
    for (let name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
      }else {
        if (name === 'className') {
          name = 'class';
        }
        root.setAttribute(name, value);
      }
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }

    for (let child of this.children) {
      let childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);

      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }
  get vdom() {
    this.vchildren = this.children.map(child => child.vdom);
    return this;
    /* return {
      type: this.type,
      props: this.props,
      children: this.children.map(child => child.vdom),
    } */

  }
}

class TextWrapper extends Component {
  constructor(content){
    super();
    this.type = '#text';
    this.content = content;
  }

  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range){
    const root = document.createTextNode(this.content);
    this._range = range;

    replaceContent(range, root);;
  }

  get vdom() {
    return this;
  }
}

function replaceContent(range, node) {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();
  range.setStartBefore(node);
  range.setEndAfter(node);
}

export function createElement(type, attributes, ...children) {
  let e;
  if (typeof type === 'string') {
    e = new ElementWrapper(type);
  } else {
    e = new type;
  }

  for (let p in attributes) {
    e.setAttribute(p, attributes[p]);
  }

  let insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      if (child === null) {
        continue;
      }
      if (typeof child === 'object' && child instanceof Array) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      }
    }
  }
  insertChildren(children);
  
  return e;
}


/**
 * 
 * @param {*} component 
 * @param {Element} parentElement 
 */
export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}