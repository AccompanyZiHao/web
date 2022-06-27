---
title: 'Class'
author: 白菜
date: '2022-5-28 10:19:26'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Class JavaScript ES6 前端'
  - name: keywords
    content: 'Class JavaScript ES6 前端'
#issueId:
---

:::tip
简介
静态方法
实例属性的新写法
静态属性
私有方法和私有属性
静态块
new.target 属性
:::

<!-- more -->

## 什么是 Class ?

在`ES6`中，`class` (类)作为对象的模板被引入，可以通过 `class` 关键字定义类。

`class` 的本质是 `function`。

它可以看作一个语法糖，让对象原型的写法更加清晰、更像面向对象编程的语法。

## 基础用法

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.say = function (msg) {
  console.log(`${this.name} say ${msg}`);
};

var p = new Person('baicai');
p.say('hellow');
// baicai say hellow
```

使用 `Class` 之后

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
  say(msg) {
    console.log(`${this.name} say ${msg}`);
  }
}

var p = new Person('baicai');
p.say('hello class');
// baicai say hello class
```

类的数据类型是函数，类本身就指向构造函数

```javascript
typeof Person; // "function"
Person === Person.prototype.constructor; // true
```

类的实例的调用方法，其实就是调用原型上的方法

```javascript
p.constructor === Person.prototype.constructor; // true
```

`prototype` 仍旧存在，虽然可以直接自类中定义方法，但是其实方法还是定义在 `prototype` 上的。因此可以使用 `Object` 的一些方法。

`Object.assign()` 覆盖方法 / 初始化时添加方法

```javascript
Object.assign(Person.prototype, { sex: 'man' }, { age: '18' });
// {sex: 'man', age: '18', constructor: ƒ, say: ƒ}
```

类的内部所有定义的方法，都是不可枚举的( `constructor` / `say`)

```javascript
Object.keys(Person.prototype); // ['sex', 'age']

Object.getOwnPropertyNames(Person.prototype); // ['constructor', 'say', 'sex', 'age']
```

**注意**

1. 类名不能重复；

```javascript
let Demo = class {};
class Demo {}
// Uncaught SyntaxError: Identifier 'Demo' has already been declared
```

2. 类的定义不会提升, 必须先定义后使用。

## 类的实例

类的实例化必须通过 `new` 关键字。

```javascript
class Person {}
let p = Person();
// Uncaught TypeError: Class constructor Person cannot be invoked without 'new'
```

类的所有实例共享一个原型对象

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}

var p1 = new Person('xiaobai');
var p2 = new Person('xiaohei');

Object.getPrototypeOf(p1) == Object.getPrototypeOf(p2); // true
// 或者在浏览器中
p1.__proto__ === p2.__proto__; // true
```

## 类的主体

### 方法

#### constructor

类的默认方法，创建类的实例化对象时被调用，返回实例对象（即 this），也可以指定返回另外一个对象。

```javascript
class Test {
  constructor() {
    // 默认返回实例对象 this
  }
}
console.log(new Test() instanceof Test); // true

class Demo {
  constructor() {
    // 指定返回对象
    return new Test();
  }
}
console.log(new Demo() instanceof Demo); // false
```

### 静态方法

类通过 static 关键字定义静态方法，改该方法不会被实例继承，只能通过类来调用。

```javascript
class Person {
  constructor() {}
  static firstName() {
    return 'wu';
  }
}

Person.firstName(); // 'wu'
var p = new Person();
p.firstName(); // Uncaught TypeError: p.firstName is not a function
```

静态方法调用同一个类中的其他静态方法，可使用 this 关键字。

```javascript
class Person {
  constructor() {}
  static firstName() {
    return 'wu';
  }
  static age() {
    return 18;
  }
  static info() {
    return `userInfo: name: ${this.firstName()}, age: ${this.age()}`;
  }
}

class Child extends Person {
  static parentAge() {
    return super.age();
  }
}

Person.info(); // 'userInfo: name: wu, age: 18'

// 父类的静态方法，可以被子类继承。
Child.info(); // 'userInfo: name: wu, age: 18'

// 静态方法也是可以从super对象上调用的。
Child.parentAge(); // 18
```

## 属性

### 静态属性

静态属性指的是 `Class` 本身的属性，即 `Class.propName`，而不是定义在实例对上的属性。

```javascript
class Person {
  static age = 18;
}
Person.sex = 'man';
```

### name 属性

返回跟在 `class` 后的类名

```javascript
class Person {}
Person.name; // 'Person'
```

### 实例属性

属性也可以定义在类的最顶层

```javascript
class Person {
  age = 18;
  constructor() {
    console.log(this.age);
  }
}

new Person(); // console.log(this.age);
```

### this 的使用

类的方法内部如果含有 this，它默认指向类的实例

```javascript
class Person {
  getName() {
    console.log('this.firstName() :>> ', this.firstName());
  }

  firstName() {
    return 'wu';
  }
}
var p = new Person();
p.getName(); // this.firstName() :>>  wu
```

当你想通过结构的方式使用的时候

```javascript
var { getName } = p;
getName(); // Cannot read properties of undefined (reading 'firstName')
```

`this` 会指向该方法运行时所在的环境, 而 `class` 内部是严格模式，所以 `this` 实际指向的是 `undefined` ，从而导致找不到 `firstName` 方法而报错。

解决方案
使用 `bind` , 在构造方法中绑定 `this`

```javascript
class Person {
  constructor() {
    this.getName = this.getName.bind(this);
  }
  getName() {
    console.log('this.firstName() :>> ', this.firstName());
  }

  firstName() {
    return 'wu';
  }
}
var p = new Person();
var { getName } = p;
getName(); // VM698:6 this.firstName() :>>  wu
```

使用箭头函数，箭头函数内部的 `this` 总是指向定义时所在的对象

```javascript
class Person {
  constructor() {
    this.getName = () => console.log('this.firstName() :>> ', this.firstName());
  }
  // getName(){
  //   console.log('this.firstName() :>> ', this.firstName());
  // }

  firstName() {
    return 'wu';
  }
}
var p = new Person();
var { getName } = p;
getName(); // this.firstName() :>>  wu
```
