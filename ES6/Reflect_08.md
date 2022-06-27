---
title: 'Reflect'
author: 白菜
date: '2022-05-19 17:35:37'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Reflect ES6 JavaScript'
  - name: keywords
    content: 'Reflect ES6 JavaScript'
#issueId:
---

:::tip
`Reflect` 是一个内置的对象，它提供拦截 `JavaScript` 操作的方法。这些方法与`proxy handlers` 的方法相同。
:::

<!-- more -->

`Reflect`不是一个函数对象，因此它是不可构造的，所以不能通过`new`运算符对其进行调用，或者将`Reflect`对象作为一个函数来调用。

`Reflect`的所有属性和方法都是静态的（就像 Math 对象）。

来自 vue3 源码中对 Reflect 的使用。

```JavaScript
const shallowUnwrapHandlers: ProxyHandler<any> = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key]
    if (isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    } else {
      return Reflect.set(target, key, value, receiver)
    }
  }
}
```

1. 它拥有对象的某些方法。比如 Object.defineProperty
2. 修改某些 Object 方法的返回结果。比如： Object.defineProperty()在无法定义属性时，会抛出一个错误，而 Reflect.defineProperty()则会返回 false。
3. 写法的优化，函数行为。

```javascript
// 老写法
'assign' in Object; // true

// 新写法
Reflect.has(Object, 'assign'); // true
```

4. Reflect 对象的方法与 Proxy 对象的方法一一对应，只要是 Proxy 对象的方法，就能在 Reflect 对象上找到对应的方法。也就是说，不管 Proxy 怎么修改默认行为，你总可以在 Reflect 上获取默认行为。

## 方法

- Reflect.apply(target, thisArgument, argumentsList) 对一个函数进行调用操作，同时可以传入一个数组作为调用参数。和 Function.prototype.apply() 功能类似。
- Reflect.construct(target, args) 对构造函数进行 new 操作，相当于执行 new target(...args)。
- Reflect.get(target, name, receiver) 获取对象身上某个属性的值，类似于 target[name]。
- Reflect.set(target, name, value, receiver) 将值分配给属性的函数。返回一个 Boolean，如果更新成功，则返回 true。
- Reflect.defineProperty(target, name, desc) 和 Object.defineProperty() 类似。如果设置成功就会返回 true
- Reflect.deleteProperty(target, name) 作为函数的 delete 操作符，相当于执行 delete target[name]。
- Reflect.has(target, name) 检测一个对象是否存在特定属性
- Reflect.ownKeys(target) 返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受 enumerable 影响).
- Reflect.isExtensible(target) 类似于 Object.isExtensible(). 返回一个 Boolean。
- Reflect.preventExtensions(target) 类似于 Object.preventExtensions()。返回一个 Boolean。
- Reflect.getOwnPropertyDescriptor(target, name) 类似于 Object.getOwnPropertyDescriptor()。如果对象中存在该属性，则返回对应的属性描述符, 否则返回 undefined.
- Reflect.getPrototypeOf(target) 设置对象原型的函数. 返回一个 Boolean， 如果更新成功，则返回 true。
- Reflect.setPrototypeOf(target, prototype) 设置对象原型的函数. 返回一个 Boolean， 如果更新成功，则返回 true。

### Reflect.get(target, name, value, receiver)

查找并返回`target`对象的`name`属性，如果没有该属性，则返回`undefined`,如果第一个参数不是对象，`Reflect.get`方法会报错。

```javascript
var myObject = {
  n: 0,
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
};

var myReceiverObject = {
  foo: 3,
  bar: 4,
};

Reflect.get(myObject, 'n', myReceiverObject); // 0
Reflect.get(myObject, 's', myReceiverObject); // undefined
Reflect.get(myObject, 'baz', myReceiverObject); // 7
Reflect.get(1, 'foo'); // Reflect.get called on non-object
```

### Reflect.set(target, name, value, receiver)

设置`target`对象的`name`属性等于`value`。如果`name`属性设置了赋值函数，则赋值函数的`this`绑定`receiver`。

```javascript
var myObject = {
  foo: 1,
  set bar(value) {
    return (this.foo = value);
  },
};

console.log(myObject.foo); // 1

Reflect.set(myObject, 'foo', 2);
console.log(myObject.foo); // 2

Reflect.set(myObject, 'bar', 3);
console.log(myObject.foo); // 3

var myReceiverObject = {
  foo: 0,
};

Reflect.set(myObject, 'bar', 4, myReceiverObject);
console.log(myObject.foo); // 3
console.log(myReceiverObject.foo); // 4
```

当`Proxy`对象和` Reflect`对象一起使用的时候，如果 `set` 传入了 `receiver`，那么`Reflect.set`会触发`Proxy.defineProperty`拦截。

```javascript
let p = {
  a: 'a',
};

// 这里会触发 defineProperty
let handler = {
  set(target, key, value, receiver) {
    console.log('set');
    Reflect.set(target, key, value, receiver);
  },
  defineProperty(target, key, attribute) {
    console.log('defineProperty');
    Reflect.defineProperty(target, key, attribute);
  },
};
let obj = new Proxy(p, handler);
obj.a = 'A';
// set
// defineProperty

// 这里不会触发 defineProperty
let handler2 = {
  set(target, key, value, receiver) {
    console.log('set 2');
    Reflect.set(target, key, value);
  },
  defineProperty(target, key, attribute) {
    console.log('defineProperty 2');
    Reflect.defineProperty(target, key, attribute);
  },
};
let obj2 = new Proxy(p, handler2);
obj2.a = 'AAAA';
// set 2
```

### Reflect.has(obj, name)

`Reflect.has` 方法对应`name in obj`里面的`in`运算符。

```javascript
var myObject = {
  foo: 1,
};

'foo' in myObject; // true

Reflect.has(myObject, 'foo'); // true
```

先更新这几个常用的吧，其他的看后续用到的话会继续补充。
