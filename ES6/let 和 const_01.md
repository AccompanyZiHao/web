---
title: let 和 const
author: 白菜
date: '2022-04-27'
categories:
  - 'JavaScript'
tags:
  - ES6
issueId: 16
---

## 什么是 ES6？

`ECMAScript 6.0`（以下简称 `ES6`）是 `JavaScript` 语言的下一代标准, 是由标准化组织 `ECMA`制定的。

## 块级作用域

`ES5` 只有全局作用域和函数作用域，没有块级作用域，这带来很多不合理的场景。

### 为什么会出现会块级作用域?

1. 内层变量可能会覆盖外层变量。

```javascript
var tmp = 1;

function f(tag = false) {
  console.log(tmp);
  if (tag) {
    var tmp = '2';
  }
}

f(); // undefined
```

函数 `f` 执行之后，变量提升，导致内层的 `tmp` 变量覆盖了外层的 `tmp` 变量

2. 用来计数的循环变量泄露为全局变量。

```javascript
var s = 'hello';

for (var i = 0; i < s.length; i++) {
  console.log(s[i]);
}

console.log(i); // 5
```

变量`i`只用来控制循环，但是循环结束后，它并没有消失，泄露成了全局变量。

## let 和 const

`ES6` 新增了`let`命令，用来声明变量。它的用法类似于`var`，但是所声明的变量，只在`let`命令所在的代码块内有效。

1. 不会变量提升

```javascript
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```

```javascript
for (var i = 0; i < 10; i++) {
    ...
}
console.log(i); // 10

for (let j = 0; j < 10; j++) {
    ...
}
console.log(j); // Uncaught ReferenceError: j is not defined
```

2. 重复声明报错

```javascript
var a = 1;
let a = 2; // Uncaught SyntaxError: Identifier 'a' has already been declared

// 报错
function func() {
  let a = 10;
  var a = 1;
}

// 报错
function func() {
  let a = 10;
  let a = 1;
}

function func(arg) {
  let arg;
}
func(); // 报错
```

3. 不绑定全局作用域

```javascript
let a = 1;
console.log(window.a); // undefined

b = 2;
window.b; // 2
```

## 暂时性死区

暂时性死区（`temporal dead zone`，简称 `TDZ`）。

```javascript
var tmp = 123;

if (true) {
  tmp = 'abc'; // ReferenceError
  let tmp;
}
```

`ES6` 明确规定，如果区块中存在`let` 或 `const` 命令，这个区块对这些命令声明的变量，从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错。

这是因为 `JavaScript` 引擎在扫描代码发现变量声明时，要么将它们提升到作用域顶部(遇到 `var` 声明)，要么将声明放在 `TDZ` 中(遇到 `let` 和 `const` 声明)。访问 `TDZ` 中的变量会触发运行时错误。只有执行过变量声明语句后，变量才会从 `TDZ` 中移出，然后才可以访问。

## const 和 let 的不同

只声明不赋值，就会报错

```javascript
const a;
```

`const` 声明一个只读的常量。一旦声明，常量的值就不能改变。

`const` 实际上保证的并不是变量的值不能改变，而是变量指向的那个内存地址所保存的数据不得改动。

```javascript
const data = {
  value: 1,
};

// 没有问题
data.value = 2;
data.num = 3;

// 报错
data = {}; // Uncaught TypeError: Assignment to constant variable.
```

## ES6 声明变量的六种方法

`ES5` 只有两种声明变量的方法：`var` 和 `function`。`ES6` 除了添加`let`和`const`，还有另外两种声明变量的方法：`import`和`class`（这两种目前我用的比较少）。

## 循环中的块级作用域

```javascript
var arr = [];
for (var i = 0; i < 3; i++) {
  arr[i] = function () {
    console.log(i);
  };
}
arr[0](); // 3
```

解决方案：

```javascript
var arr = [];
for (var i = 0; i < 3; i++) {
  arr[i] = (function (i) {
    return function () {
      console.log(i);
    };
  })(i);
}
arr[0](); // 0

// or ES6 let
var arr = [];
for (let i = 0; i < 3; i++) {
  arr[i] = function () {
    console.log(i);
  };
}
arr[0](); // 0
```

看到这里有两个问题：

1. let 这里是不是重复声明了？
2. 为什么使用了 let , `arr[0]()` 的值为什么可以正确输出呢？

```javascript
for (let i = 0; i < 3; i++) {
  let i = 'abc';
  console.log(i);
}

// abc
// abc
// abc
```

这里说明了设置循环变量的那部分是个单独的父作用域，循环体是一个单独的子作用域

如果用`var` 是什么情况呢？

```javascript
for (var i = 0; i < 3; i++) {
  var i = 'abc';
  console.log(i);
}
// abc
```

循环中使用 let 的时候，可以理解为每次迭代循环时都会创建一个新的变量，并以之前迭代中同名变量的值将其初始化。

```javascript
var arr = [];
for (let i = 0; i < 3; i++) {
  arr[i] = function () {
    console.log(i);
  };
}
arr[0](); // 0
```

利用伪代码实现：

```javascript
(let i = 0) {
    arr[0] = function() {
        console.log(i)
    };
}

(let i = 1) {
    arr[1] = function() {
        console.log(i)
    };
}

(let i = 2) {
    arr[2] = function() {
        console.log(i)
    };
};
```

## 小结

我们在开发的时候，应该默认使用 `let`, 而不是使用 `var` , 当遇到不需要改变变量的值的时候使用 `const`。
