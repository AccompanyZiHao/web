---
title: 'Object.setPrototypeOf 和 Object.create 的区别'
author: 白菜
date: '2022-06-09 14:47:22'
categories:
  - 'JavaScript'
tags:
  - 'JavaScript'
#issueId:
---

他们两个都可以设置对象的原型，但是還是有一些区别的。

## Object.setPrototypeOf()

### 描述

> 该方法设置一个指定的对象的原型 ( 即，内部 `[[Prototype]]` 属性）到另一个对象或 `null`。

### 语法

`Object.setPrototypeOf(obj, prototype)`

- obj 要设置其原型的对象。
- prototype 该对象的新原型 (一个对象 或 null)。

### Object.setPrototypeOf() 使用

#### 向一个原型附加一个链

```javascript
function Parent() {
  this.name = 'parent';
}

function Action() {
  this.say = true;
}

Parent.prototype = new Action();
Parent.prototype.constructor = Parent;

var p = new Parent();

console.log(p.say); // true

function OtherAction() {
  this.breathing = true;
}

Object.setPrototypeOf(p, new OtherAction());

console.log(p.breathing); // true
```

#### 将一个基本类型转化为对应的对象类型并添加到原型链上

```javascript
function Symbol() {
  this.isSymbol = 'yes';
}

var nPrime = 17;

console.log(typeof nPrime); // 'number'

var oPrime = Object.appendChain(nPrime, new Symbol());

console.log(oPrime); // '17'
console.log(oPrime.isSymbol); // 'yes'
console.log(typeof oPrime); // 'object'
```

#### 给函数类型的对象添加一个链，并添加一个新的方法到那个链上

```javascript
function Person(sName) {
  this.identity = sName;
}

var george = Object.appendChain(
  new Person('George'),
  'console.log("Hello guys!!");'
);

console.log(george.identity); // 'George'
george(); // 'Hello guys!!'
```

## Object.create()

### 描述

> 创建一个新对象，使用现有的对象来提供新创建的对象的 **proto** （请打开浏览器控制台以查看运行结果。）

### 语法

`Object.create(proto，[propertiesObject])`

- proto 新创建对象的原型对象。
- propertiesObject 可选。需要传入一个对象，该对象的属性类型参照 Object.defineProperties()的第二个参数。如果该参数被指定且不为 undefined，该传入对象的自有可枚举属性 (即其自身定义的属性，而不是其原型链上的枚举属性) 将为新创建的对象添加指定的属性值和对应的属性描述符。

### 返回值

一个新对象，带着指定的原型对象和属性。

## 对比例子

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.say = function (str) {
  console.log(this.name, ' say ', str);
};

function Child(name) {
  this.name = name;
}

Child.prototype.eat = function (food) {
  console.log(this.name, ' eat ', food);
};

var c = new Child('baicai');
```

定义了 Person 和 Child 两个函数，并且他们的原型都有一些方法。

使用 Object.setPrototypeOf

```javascript
Object.setPrototypeOf(Child.prototype, Person.prototype);
// Child.prototype
Person {eat: ƒ, constructor: ƒ}
  eat: ƒ (food)
  constructor: ƒ Child(name)
  [[Prototype]]: Object
    say: ƒ (str)
    constructor: ƒ Person(name)
    [[Prototype]]: Object

c.say('good') // baicai  say  good
c.eat('apple') // baicai  eat  apple
```

使用 Object.create

```javascript
Child.prototype = Object.create(Person.prototype)

// Child.prototype
Person {}  // 指向一个空对象
  [[Prototype]]: Object // 原型
    say: ƒ (str)
    constructor: ƒ Person(name)
      arguments: null
      caller: null
      length: 1
      name: "Person"
      prototype: {say: ƒ, constructor: ƒ}
  [[Prototype]]: Object

var c2 = new Child('wxb');

c.eat('apple') // baicai  eat  apple
c2.say('hello') // wxb  say  hello
c2.eat('') // Uncaught TypeError: c2.eat is not a function
```

## 小结

使用`setPrototypeOf`, `Child.prototype` 会先指向自身的 `prototype`, 然后他的 `prototype` 再指向 `Person.prototype`。

使用 `Object.create`, `Child.prototype` 将会指向一个空对象，该空对象的原型属性指向 `Person` 的 `prototytpe`。
此时我们已经不能再访问 `Child.prototype`原有的属性(`eat`)。

`Object.setPrototypeOf(obj, prototype)` 他是将 `prototype` 作为已知对象 `obj` 的原型
`Object.create(prototype)` 是创建一个以 `prototype` 为原型的对象

参考链接： https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
