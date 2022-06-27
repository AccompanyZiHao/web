---
title: 'Symbol'
author: 白菜
date: '2022-05-16 17:27:40'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'ES6 Symbol'
  - name: keywords
    content: 'ES6 Symbol'
issueId: 24
---

:::tip
1、`Symbol` 的参数可以为 字符串/对象；2、相同参数的返回值不同；3、不能与其他类型的值进行运算；4、可以显式转为字符串；5、可以转为布尔值, 但是不能转为数值；6、可以使用 `description`；7、作为属性名使用；8、属性名的遍历。
:::

<!-- more -->

## 为什么要有 Symbol?

因为在 `ES6` 之前，对象的属性名都是字符串，如果有人使用了你提供的对象，并且需要对这个对象拓展一个新的方法，那么新的方法就有可能与现有的方法名冲突，这个时候如果可以创造一个独一无二的属性名的方法就好了，因此诞生了 `Symbol` 。

## Symbol 的生成

`Symbol` 是一种新的数据类型。是由 `Symbol()` 函数生成的。

```javascript
let s = Symbol();

console.log(typeof s); // 'symbol'
```

## Symbol 的类型

`Symbol` 函数前不能使用 `new` 命令，否则会报错。这是因为生成的 `Symbol` 是一个原始类型的值，不是对象。

## Symbol 使用

### 参数为字符串

`Symbol` 函数可以接受一个字符串作为参数，表示对 `Symbol` 实例的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。

```javascript
let s1 = Symbol('baicai');
console.log(s1); // Symbol(baicai)

s1.toString(); // "Symbol(baicai)"
```

### 参数为对象

如果 `Symbol` 的参数是一个对象，就会调用该对象的 `toString()` 方法，将其转为字符串，然后再生成一个 `Symbol` 值。

```javascript
const foo = {
  toString() {
    return 'wuxiaobai';
  },
};
const s = Symbol(foo);
s; // Symbol(wuxiaobai)

const bar = {
  x: '123',
};
const s1 = Symbol(bar);
s1; // Symbol([object Object])
```

### 相同参数的返回值不同

`Symbol` 函数的参数只是表示对当前 `Symbol` 值的描述，因此相同参数的`Symbol` 函数的返回值是不相等的。

```javascript
// 没有参数的情况
let s1 = Symbol();
let s2 = Symbol();

s1 === s2; // false

// 有参数的情况
let s1 = Symbol('foo');
let s2 = Symbol('foo');

s1 === s2; // false
```

### 不能与其他类型的值进行运算

`Symbol` 值不能与其他类型的值进行运算，会报错。

```javascript
let sym = Symbol('My symbol');

'your symbol is ' + sym;
// TypeError: can't convert symbol to string
```

### 可以显式转为字符串

`Symbol` 值可以显式转为字符串。

```javascript
let sym = Symbol('My symbol');

console.log(String(sym)); // 'Symbol(My symbol)'
console.log(sym.toString()); // 'Symbol(My symbol)'
```

### 可以转为布尔值, 但是不能转为数值

```javascript
let sym = Symbol();
Boolean(sym); // true
!sym; // false

Number(sym); // TypeError
sym + 2; // TypeError
```

### 使用 description

```javascript
const sym = Symbol('foo');
console.log(sym.description); // "foo"
```

创建 `Symbol` 的时候，可以添加一个描述，上面代码中，`sym` 的描述就是字符串`foo`。

### 作为属性名使用

由于 `Symbol` 值可以作为标识符又是唯一的，用于对象的属性名使用的时候可以保证不会出现同名的属性。

```javascript
let mySymbol = Symbol();

// 第一种写法
let a = {};
a[mySymbol] = 'Hello!';

// 第二种写法
let a = {
  [mySymbol]: 'Hello!',
};

// 第三种写法
let a = {};
Object.defineProperty(a, mySymbol, { value: 'Hello!' });

// 以上写法都得到同样结果
console.log(a[mySymbol]); // "Hello!"
```

当你这样写的时候就可能读取不到到它的值。

```javascript
let mySymbol = Symbol();
const a = {};

a.mySymbol = 'Hello!';

// 以上写法都得到同样结果
console.log(a[mySymbol]); // undefined
console.log(a['mySymbol']); // "Hello!"
console.log(a); // {mySymbol: "Hello!"}
```

因为点运算符后面总是字符串，所以不会读取 `mySymbol` 作为标识名所指代的那个值，导致`a`的属性名实际上是一个字符串，而不是一个 `Symbol` 值。

### 属性名的遍历

`Symbol` 作为属性名，该属性不会出现在 `for...in`、`for...of` 循环中，也不会被 `Object.keys()`、`Object.getOwnPropertyNames()`、`JSON.stringify()` 返回。但是，它也不是私有属性，有一个 `Object.getOwnPropertySymbols` 方法，可以获取指定对象的所有 `Symbol` 属性名。

```javascript
const obj = {};
let a = Symbol('a');
let b = Symbol('b');

obj[a] = 'Hello';
obj[b] = 'World';

const objectSymbols = Object.getOwnPropertySymbols(obj);

console.log(objectSymbols);
// [Symbol(a), Symbol(b)]
```

还有一个新的 `API Reflect.ownKeys()` 它提供了一种能力, 该方法可以返回所有类型的键名，包括常规键名和 `Symbol` 键名。

```javascript
let obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3,
};

for (let i in obj) {
  console.log(i); // 无输出
}

// enum
// nonEnum
// undefined Symbol('my_key') 没有被遍历出来

console.log(Reflect.ownKeys(obj)); //  ['enum', 'nonEnum', Symbol(my_key)]
```

### Symbol.for()

`Symbol` 函数每次都生成一个新的唯一的值，那我们如果要使用同一个值怎么办呢，这个时候我们可以使用 `Symbol.for()` 。

`Symbol.for()` 接受一个字符串作为参数，然后搜索有没有以该参数作为名称的 `Symbol` 值。如果有，就返回这个 `Symbol` 值，否则就新建一个以该字符串为名称的 `Symbol` 值，并将其注册到全局。

```javascript
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');

s1 === s2; // true
```

### Symbol.keyFor()

`Symbol.keyFor()`方法返回一个已登记的 `Symbol` 类型值的`key`。

```javascript
var s1 = Symbol.for('foo');
console.log(Symbol.keyFor(s1)); // "foo"

var s2 = Symbol('foo');
console.log(Symbol.keyFor(s2)); // undefined
```

### 使用案例-消除字符串

```javascript
function calculation(type, {a, b}) {
  let res = 0;

  switch (type) {
    case 'add': // 魔术字符串
      res = a + b
      break;
    case 'min': // 魔术字符串
      res = a - b
      break;
    ...
  }

  return res;
}

calculation('add', { a: 1, b: 2 }); // 魔术字符串
calculation('min', { a: 1, b: 2 }); // 魔术字符串
```

上面的 `add` , `min` 就是字符串，它多次出现，与代码形成“强耦合”，不利于将来的修改和维护。

常用的消除魔术字符串的方法，就是把它写成一个变量。

```javascript
const calculationType = {
  add: 'add',
  min: 'min'
}

function calculation(type, {a, b}) {
  let res = 0;

  switch (type) {
    case calculationType.add: // 魔术字符串
      res = a + b
      break;
    case calculationType.min: // 魔术字符串
      res = a - b
      break;
    ...
  }

  return res;
}

calculation(calculationType.add, { a: 1, b: 2 }); // 3
calculation(calculationType.min, { a: 1, b: 2 }); // -1
```

我们发现 `calculationType.add` 和 `calculationType.min` 的值等于哪一个并不重要，只需要保证 `calculationType` 的属性值不会重复就好了，因此这里就可以使用 `Symbol`。

```javascript
const calculationType = {
  add: Symbol(),
  min: Symbol(),
};
```

### 使用案例-定义私有变量

```javascript
const AGE = Symbol();
const GET_AGE = Symbol();
class User {
  constructor(name, sex, age) {
    this.name = name;
    this.sex = sex;
    this[AGE] = age;
    this[GET_AGE] = function () {
      return this[AGE];
    };
  }
  printAge() {
    console.log(this[GET_AGE]());
  }
}

let u1 = new User('wxb', 'M', 18);
console.log(u1.name); // wxb
console.log(u1.age); // undefined
u1.printAge(); // 18
```

### 使用案例-单例模式中的使用

```javascript
class Phone {
  constructor() {
    this.name = 'Mac';
    this.price = '19999';
  }
}
let global = {};
let key = Symbol.for('Phone');

if (!global[key]) {
  global[key] = new Phone();
}
module.exports = global[key];
```

```javascript
let p1 = require('./Phone');
let p2 = require('./Phone');
console.log(p1 === p2); // true
```

### 使用案例-列表渲染

比如需要渲染下图的列表样式的时候就可以使用 `Symbol` 来完成。
![alt](./../public/images/2022/ES6/Symbol.jpg 'Symbol')

```vue
<template>
<li v-for="item in list" :key="item.key">{{ item.title }}</li>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const list = ref([
    {
      key: 'zh-cn',
      title: '简体',
    },
    {
      key: Symbol(),
      title: '|',
    },
    {
      key: 'zh-hk',
      title: '繁體',
    },
    {
      key: Symbol(),
      title: '|',
    },
    {
      key: 'en-us',
      title: 'English',
    },
  ]);
</script>
```

由于这里的 `key` 值是唯一的，我们可以使用 `Symbol`，来当做 `key`。
