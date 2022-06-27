---
title: 'Generator 生成器'
author: 白菜
date: '2022-05-24 17:59:29'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Generator 生成器 ES6 JavaScript 前端 js'
  - name: keywords
    content: 'Generator 生成器 ES6 JavaScript 前端 js'
#issueId:
---

## 函数组成

1. 一是在 function 后面，函数名之前有个 \*
2. 函数内部有 yield 表达式。

```JavaScript
function* func(){
 console.log("one");
 yield '1';
 console.log("two");
 yield '2';

 console.log("three");
 return '3';
}
```

## 执行机制

调用 `Generator` 函数和调用普通函数一样，在函数名后面加上()即可，但是 `Generator` 函数不会像普通函数一样立即执行，而是返回一个指向内部状态对象的指针，所以要调用遍历器对象 `Iterator` 的 `next` 方法，指针就会从函数头部或者上一次停下来的地方开始执行。

```javascript
var f = func();
f.next();
// one
// {value: "1", done: false}

f.next();
// two
// {value: "2", done: false}

f.next();
// three
// {value: "3", done: true}

f.next();
// {value: undefined, done: true}
```

第一次调用 `next` 方法时，从 `Generator` 函数的头部开始执行，先是打印了 `one` ,执行到 `yield` 就停下来，并将 `yield` 后边表达式的值 '1'，作为返回对象的 `value` 属性值，此时函数还没有执行完， 返回对象的 `done` 属性值是 `false` 。

第二次调用 `next` 方法时，同上步 。

第三次调用 `next` 方法时，先是打印了 `three` ，然后执行了函数的返回操作，并将 `return` 后面的表达式的值，作为返回对象的 `value` 属性值，此时函数已经结束，多以 done 属性值为 true 。

第四次调用 `next` 方法时， 此时函数已经执行完了，所以返回 `value` 属性值是 `undefined` ，`done` 属性值是 `true` 。如果执行第三步时，没有 `return` 语句的话，就直接返回 `{value: undefined, done: true}`。

## 函数返回的遍历器对象的方法

### next 方法

`next` 方法不传入参数的时候， `yield` 表达式的返回值是 `undefined` 。当 `next` 传入参数的时候，该参数会作为上一步`yield`的返回值。

```javascript
function* sendParameter() {
  console.log('start');
  const x = yield '2';
  console.log('one:' + x);
  const y = yield '3';
  console.log('two:' + y);
  console.log('total:' + (x + y));
}
```

next 不传参

```javascript
const sendp1 = sendParameter();
console.log(sendp1.next());
// start
// {value: "2", done: false}
console.log(sendp1.next());
// one:undefined
// {value: "3", done: false}
console.log(sendp1.next());
// two:undefined
// total:NaN
// {value: undefined, done: true}
```

next 传参

```javascript
const sendp2 = sendParameter();
console.log(sendp2.next(10););
// start
// {value: "2", done: false}
console.log(sendp2.next(20););
// one:20
// {value: "3", done: false}
console.log(sendp2.next(30););
// two:30
// total:50
// {value: undefined, done: true}
```

分析一下 `next` 传参的情况，第一次调用 `sendp2.next` 返回 2，

第二次调用 `sendp2.next` 将上一次 `yield` 表达式的值设为 20，即 `one` 等于 20

第三次调用 `sendp2.next` 将上一次 `yield` 表达式的值设为 30，即 `two` 等于 30

那么 `total` 等于 50 ；

遍历器对象的 next 方法的运行逻辑如下。

（1）遇到 yield 表达式，就暂停执行后面的操作，并将紧跟在 yield 后面的那个表达式的值，作为返回的对象的 value 属性值。

（2）下一次调用 next 方法时，再继续往下执行，直到遇到下一个 yield 表达式。

（3）如果没有再遇到新的 yield 表达式，就一直运行到函数结束，直到 return 语句为止，并将 return 语句后面的表达式的值，作为返回的对象的 value 属性值。

（4）如果该函数没有 return 语句，则返回的对象的 value 属性值为 undefined。

### return 方法

`return` 方法返回给定值，并结束遍历 `Generator` 函数。

`return` 方法提供参数时，返回该参数；不提供参数时，返回 `undefined` 。

```javascript
function* foo(x) {
  var y = 2 * (yield x + 1);
  var z = yield y / 3;
  return x + y + z;
  console.log('打印不出来'])
}

var b = foo(5);
console.log(b.next()); // { value:6, done:false }
console.log(b.next(12)); // { value:8, done:false }
console.log(b.next(13));// { value: 42, done: true }
console.log(b.next());// { value: undefined, done: true }
```

第一次调用`b`的`next`方法时，返回`x+1`的值 6；

第二次调用`next`方法，将上一次 `yield` 表达式的值设为 12，因此 y 等于 24，返回`y / 3`的值 8；

第三次调用`next`方法，将上一次 `yield` 表达式的值设为 13，因此 z 等于 13，这时`x`等于 5，`y`等于 24，

所以`return`语句的值等于 42。

`return` 之后就结束了该方法，因此最后一个 `console.log('打印不出来')` 并没有执行。

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
}
var f = foo();
f.next();
// {value: 1, done: false}
f.return('foo');
// {value: "foo", done: true}
f.next();
// {value: undefined, done: true}
```

### throw 方法

`throw` 方法可以再 `Generator` 函数体外面抛出异常，再函数体内部捕获

```javascript
var g = function* () {
  try {
    yield;
  } catch (e) {
    console.log('catch inner', e);
  }
};

var i = g();
i.next();

try {
  i.throw('a');
  i.throw('b');
} catch (e) {
  console.log('catch outside', e);
}
// catch inner a
// catch outside b
```

遍历器对象抛出了两个错误，第一个被 `Generator` 函数内部捕获，第二个因为函数体内部的 `catch` 函数已经执行过了，不会再捕获这个错误，所以这个错误就抛出 `Generator` 函数体，被函数体外的 `catch` 捕获。

### yield\* 表达式

```javascript
function* foo() {
  yield 'a';
  yield 'b';
}

function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  yield 'a';
  yield 'b';
  yield 'y';
}

// 等同于
function* bar() {
  yield 'x';
  for (let v of foo()) {
    yield v;
  }
  yield 'y';
}

for (let v of bar()) {
  console.log(v);
}
// "x"
// "a"
// "b"
// "y"
```

`foo` 和 `bar` 都是 `Generator` 函数，在 `bar` 里面调用 `foo` ，就需要手动遍历 `foo` 。如果有多个 `Generator` 函数嵌套，写起来就非常麻烦。
因此有了 `yield*` 表达式。

```javascript
function* gen() {
  yield* ['a', 'b', 'c'];
}
gen().next(); // { value:"a", done:false }

var a = gen();
a.next();
// {value: 'a', done: false}
a.next();
// {value: 'b', done: false}
a.next();
// {value: 'c', done: false}
a.next();
// {value: undefined, done: true}
```

`yield` 命令后面如果不加星号，返回的是整个数组，加了星号就表示返回的是数组的遍历器对象。

```javascript
function* gen() {
  yield ['a', 'b', 'c'];
}
gen().next(); // {value:  ['a', 'b', 'c'], done: false}

var a = gen();
a.next();
// {value: ['a', 'b', 'c'], done: false}

a.next();
// {value: undefined, done: true}
```

## 使用

### Generator 函数的数据交换

`next` 返回值的 `value` 属性，是 `Generator` 函数向外输出数据；

通过 `next` 传参的方法，改变返回值，向 `Generator` 函数体内输入数据。

### 协程

`yield` 命令是异步两个阶段的分界线，它表示执行到此处，执行权将交给其他协程。

协程遇到 `yield` 命令就暂停，等到执行权返回，再从暂停的地方继续往后执行。代码的写法非常像同步操作。

### 错误处理

`throw` 方法抛出的错误，可以被函数体内的`try...catch`代码块捕获。

参考链接：

- https://www.runoob.com/w3cnote/es6-generator.html
- https://es6.ruanyifeng.com/#docs/generator
