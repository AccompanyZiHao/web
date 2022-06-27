---
title: 'Class 的继承'
author: 白菜
date: '2022-05-31 22:19:55'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Class 的继承'
  - name: keywords
    content: 'Class 的继承'
#issueId:
---

### extends

Class 可以通过 extends 关键字实现继承，让子类继承父类的属性和方法。extends 的写法比 ES5 的原型链继承，要清晰和方便很多。

```javascript
class Parent {
  constructor(name) {
    this.name = name;
  }
}

class Children extends Parent {
  constructor(name, sex) {
    super(name);
    this.sex = sex;
  }
}

const c = new Children('baicai', 'man');
console.log('c =>', c); // c => Children { name: 'baicai', sex: 'man' }
```

子类 `constructor` 方法中必须有 `super` ，且必须出现在 `this` 之前。否则就会报错。

```javascript
class Parent1 {
  /* ... */
}

// 当 constructor 存在是没有 super
class Children1 extends Parent1 {
  constructor() {}
}

// this 出现在 super 之前
class Children1 extends Parent1 {
  constructor(name) {
    this.name = name;
    super();
  }
}

let C1 = new Children1();
// Must call super constructor in derived class before accessing 'this' or returning from derived constructor at new Children1
```

报错的意思是说： 在访问 `'this'` 或从派生构造函数返回 `new Children1` 之前，必须在派生类中调用超级构造函数。

> super 关键字用于访问和调用一个对象的父对象上的函数。

由此可以看出，子类的 `this` 对象，必须在父类的构造函数完成之后，获得与父类同样的实例属性和方法（父类的 `this` 对象），然后再对其进行加工，再添加子类自己的实例属性和方法。如果不调用 `super()` 方法，子类就得不到自己的 `this` 对象。

看个例子：

```javascript
class Foo {
  constructor() {
    console.log(1);
  }
}

class Bar extends Foo {
  constructor() {
    super();
    console.log(2);
  }
}

const bar = new Bar();
// 1
// 2
```

上面的例子，会依次输出 1 和 2。

原因就是子类构造函数调用 super()时，会执行一次父类构造函数。

为什么呢？我们先看下一开始的那个 `Parent` 类， 如果用 `ES5` 怎么写。

```javascript
function Parent(name) {
  this.name = name;
}

function Children(name, sex) {
  Parent.call(this, name);
  this.sex = sex;
}

// 让他们的原型保持一致
Children.prototype = Object.create(Parent.prototype);

var c = new Children('baicai', 'man');
console.log('c :>> ', c); // Children { name: 'baicai', sex: 'man' }
```

> Object.create() 方法创建一个新对象，使用现有的对象来提供新创建的对象的 **proto**。

`ES5` 先创造子类实例对象 `Children` ，然后再将父类的方法添加到这个对象上面.即'实例在前，继承在后'；

`ES6` 则是先把父类的属性和方法加到一个空对象上，再将该对象作为子类的实例，即'继承在前，实例在后'

如何判断子类是否继承了另一类呢？可以使用 `Object.getPrototypeOf()` 方法

```javascript
Object.getPrototypeOf(Children) === Parent;
```

不能继承常规对象。
```javascript
var Father = {
    // ...
}
class Children extends Father {
     // ...
}
// Uncaught TypeError: Class extends value #<Object> is not a constructor or null

// 解决方案
Object.setPrototypeOf(Child.prototype, Father);
```

> Object.setPrototypeOf(obj, prototype) 方法设置一个指定的对象的原型 ( 即，内部 [[Prototype]] 属性）到另一个对象或  null。

### 静态方法的继承

```javascript
class Parent {
  static say() {
    return 'hellow';
  }
}

class Children extends Parent {
  constructor() {
    super();
  }

  static say2() {
    return super.say() + ' baicai';
  }
}

console.log('Children.say() :>> ', Children.say()); // Children.say() :>>  'hellow'
console.log('Children.say2() :>> ', Children.say2()); // Children.say2() :>>  hellow baicai
```
