export function Vue(options = {}) {
  this.__init(options);
}

// init
Vue.prototype.__init = function(options) {
  // 合并选项
  this.$options = options;
  this.$el = options.el;
  this.$data = options.data;
  this.$methods = options.methods;
  // 生命周期 等等
  // beforeCreate -- initState -- initData

  // 代理
  proxy(this, this.$data);
  // 观察数据
  observer(this.$data);
  // 编译
  new Compiler(this)
}

// this.$data.message -- this.message
// 把 data 里面的数据，代理到 vm.$data
function proxy(target, data) {
  Object.keys(data).forEach(key => {
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        return data[key]
      },
      set(newVal) {
        // NaN
        if(newVal !== data[key]) {
          data[key] = newVal
        }
      }
    })
  })
}

function observer(data) { new Observer(data) }

class Observer {
  constructor(data) {
    this.walk(data)
  }
  // 递归调用，把所有的数据，都添加上 get set
  // data.a.b.c.d
  walk(data) {
    if(data && typeof data === "object") {
      Object.keys(data).forEach(key => this.defineReactive(data, key, data[key]))
    }
  }
  // 把每一个 data 里面的数据，都收集起来
  defineReactive(obj, key, value) {
    let that = this;
    // 接着往下走
    this.walk(value);

    let dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 只收集有响应式的数据的依赖
        if(Dep.target) {
          dep.add(Dep.target)
        }
        return value;
      },
      set(newVal) {
        // NaN
        if(newVal !== value) {
          value = newVal;
          that.walk(newVal);
          // 执行收集依赖的函数
          dep.notify()
        }
      }
    })
  }
}

// 视图怎么更新？数据的改变，视图才会更新，需要去观察
// watcher 去初始化，有个 cb 函数，这个函数，就是更新界面的！！！
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm; // vue的实例
    this.key = key;
    this.cb = cb;
    Dep.target = this;
    // 触发这个值的get函数
    this.__old = vm[key];
    Dep.target = null;
  }

  update() {
    let newVal = this.vm[this.key];
    if(this.__old !== newVal) this.cb(newVal)
  }
}


// 每一个数据，都有一个依赖
// [ watcher: {update}, watcher: {update}, watcher: {update} ]
// update 就是，你 new Watcher(..., cb)
// cb 就是改变界面的函数
class Dep {
  constructor() {
    this.watchers = new Set();
  }

  add(watcher) {
    if(watcher && watcher.update) this.watchers.add(watcher);
  }

  notify() {
    this.watchers.forEach(watc => watc.update())
  }
}

/*
* 比如：
* <h1>{{message}}</h1> //// -> new Watcher() -> 👿 -> cb
* 初始化 先生成一个 Watcher，添加一个观察者，如果有触发 set，执行 notify，然后执行 cb
*/


//
class Compiler {
  constructor(vm) {
    this.el = vm.$el;
    this.vm = vm;
    this.methods = vm.$methods;

    this.compile(vm.$el)
  }

  compile(el) {
    let childNodes = el.childNodes;
    // 类数组
    Array.from(childNodes).forEach(node => {
      // 如果是文本节点
      if(node.nodeType === 3) {
        this.compileText(node)
      } else if(node.nodeType === 1) {
        this.compileElement(node)
      }

      if(node.childNodes && node.childNodes.length) this.compile(node);
    })
  }

  compileText(node) {
    // 我们只考虑 {{ message }}
    let reg = /\{\{(.+?)\}\}/;
    let value = node.textContent;
    if(reg.test(value)) {
      let key = RegExp.$1.trim();
      // 开始时，先赋值 key -> message
      node.textContent = value.replace(reg, this.vm[key]);
      // 添加观察者
      new Watcher(this.vm, key, val => {
        // render 函数
        node.textContent = val;
      })
    }
  }

  compileElement(node) {
    //  只匹配一下 v-on v-model
    if(node.attributes.length) {
      Array.from(node.attributes).forEach(attr => {
        let attrName = attr.name;
        if(attrName.startsWith('v-')) {
          // v- 匹配成功，可能是 v-on:, v-model
          attrName = attrName.indexOf(':') > -1 ? attrName.substr(5): attrName.substr(2);
          let key = attr.value;
          //
          this.update(node, key, attrName, this.vm[key])
        }
      })
    }
  }

  update(node, key, attrName, value) {
    if(attrName === "model") {
      node.value = value;
      new Watcher(this.vm, key, val => node.value = val);
      node.addEventListener('input', () => {
        this.vm[key] = node.value
      })
    }else if(attrName === 'click') {
      node.addEventListener(attrName, this.methods[key].bind(this.vm))
    }
  }
}