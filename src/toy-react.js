export class Component {
  constructor(type) {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(child) {
    this.children.push(child);
  }

  get root(){
    if (!this._root) {
      this._root = this.render().root;
    }
    return this._root;
  }
}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(child) {
    this.root.appendChild(child.root);
  }
}

class TextWrapper {
  constructor(content){
    this.root = document.createTextNode(content);
  }
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
  parentElement.appendChild(component.root);
}