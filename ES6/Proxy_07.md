---
title: 'Proxy'
author: 白菜
date: '2022-05-18 10:27:27'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Proxy ES6 前端'
  - name: keywords
    content: 'Proxy ES6 前端'
#issueId:
---

:::tip
Proxy 接受两个参数 `target`, `handler`。Proxy 代理对象的 this 指向问题。
:::

<!-- more -->

`Proxy` 这个词的原意是代理，用在这里表示由它来“代理”某些操作。比如 vue3 使用的就是 `Proxy` 去为目标对象做一层拦截。

## 用法

`Proxy` 接受两个参数 `target`, `handler`

- target: 要使用 `Proxy` 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）。
- handler: 一个通常以函数作为属性的对象，各属性中的函数分别定义了在执行各种操作时代理的行为。

```javascript
var obj = new Proxy(
  {},
  {
    get: function (target, propKey, receiver) {
      console.log(`getting ${propKey}!`);
      return Reflect.get(target, propKey, receiver);
    },
    set: function (target, propKey, value, receiver) {
      console.log(`setting ${propKey}!, value is ${value}`);
      return Reflect.set(target, propKey, value, receiver);
    },
  }
);

obj.count = 1; // setting count!, value is 1
++obj.count;
// getting count!
// setting count!, value is 2
```

看下下面的例子

```javascript
const handler = {
  get: function (obj, prop) {
    return prop in obj ? obj[prop] : 37;
  },
  set: function (obj, key, value) {
    if (!obj['key']) {
      obj['key'] = [];
    }
    obj['key'].push(key);
    obj[key] = value;
    return true;
  },
};

const p = new Proxy({}, handler);
p.a = 1;
p.b = undefined;

console.log(p.a, p.b); // 1, undefined
console.log('c' in p, p.c); // false, 37
console.log('p.key', p.key); // p.key, ['a', 'b', 'c']
```

## 方法

```javascript
var p = new Proxy(
  {},
  {
    // 拦截对象属性的读取，比如proxy.foo和proxy['foo']。
    get: function (target, key) {
      return target[key] || target.getItem(key) || undefined;
    },
    // 拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。
    set: function (target, key, value) {
      if (key in target) {
        return false;
      }
      return target.setItem(key, value);
    },
    // 拦截delete proxy[propKey]的操作，返回一个布尔值。
    deleteProperty: function (target, key) {
      if (key in target) {
        return false;
      }
      return target.removeItem(key);
    },
    // 拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。
    construct: function (target, args) {
      return { value: args[1] };
    },
    // 拦截 Proxy 实例作为函数调用的操作，
    // 比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。
    apply: function (target, that, args) {
      return args[0];
    },
    // 拦截Object.isExtensible(proxy)，返回一个布尔值。
    isExtensible: function (target) {
      return true;
    },
    /*
    拦截Object.getOwnPropertyNames(proxy)、
    Object.getOwnPropertySymbols(proxy)、
    Object.keys(proxy)、
    for...in循环，返回一个数组。

    该方法返回目标对象所有自身的属性的属性名，
    而Object.keys()的返回结果仅包括目标对象自身的可遍历属性。
    */
    ownKeys: function (target, key) {
      return target.keys();
    },
    // 拦截propKey in proxy的操作，返回一个布尔值
    has: function (target, key) {
      return key in target || target.hasItem(key);
    },

    /*
    拦截Object.defineProperty(proxy, propKey, propDesc）、
    Object.defineProperties(proxy, propDescs)，返回一个布尔值
    */
    defineProperty: function (target, key, oDesc) {
      if (oDesc && 'value' in oDesc) {
        target.setItem(key, oDesc.value);
      }
      return target;
    },
    // 拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。
    getOwnPropertyDescriptor: function (target, key) {
      var value = target.getItem(key);
      return value
        ? {
            value: value,
            writable: true,
            enumerable: true,
            configurable: false,
          }
        : undefined;
    },
  }
);
```

## Proxy 的 this 指向

1. 在 `Proxy` 代理的情况下，目标对象内部的`this`关键字会指向 `Proxy` 代理。

```javascript
const target = {
  m: function () {
    console.log(this === proxy);
  },
};
const proxy = new Proxy(target, {});

target.m(); // false
proxy.m(); // true
```

2. 由于 this 指向的变化，导致 Proxy 无法代理目标对象。

```javascript
const _name = new WeakMap();

class Person {
  constructor(name) {
    _name.set(this, name);
  }
  get name() {
    return _name.get(this);
  }
}

const p = new Person('wxb');
p.name; // 'wxb'

const proxy = new Proxy(p, {});
proxy.name; // undefined
```

这是因为 `p` 的 `name` 属性，实际保存在外部 `WeakMap` 对象 `_name` 上面，通过`proxy.name` 访问时，`this`指向`proxy`，导致无法取到值。

3. 原生对象的 this

```javascript
const target = new Date();
const proxy = new Proxy(target, {});

proxy.getDate(); // this is not a Date object.
```

`getDate()`方法只能在`Date`对象实例上面拿到，如果`this`不是`Date`对象实例就会报错。这时，this 绑定原始对象，就可以解决这个问题。

```javascript
const target = new Date();
const handler = {
  get(target, prop) {
    if (prop === 'getDate') {
      return target.getDate.bind(target);
    }
    return Reflect.get(target, prop);
  },
};
const proxy = new Proxy(target, handler);

proxy.getDate(); // 18
```

4. Proxy 拦截函数内部的 this

```javascript
const handler = {
  get: function (target, key, receiver) {
    console.log(this === handler);
    return 'Hello, ' + key;
  },
  set: function (target, key, value) {
    console.log(this === handler);
    target[key] = value;
    return true;
  },
};

const proxy = new Proxy({}, handler);

proxy.foo;
// true
// Hello, foo

proxy.foo = 1;
// true
```

`get()`和`set()`拦截函数内部的`this`，指向的都是`handler`对象。
