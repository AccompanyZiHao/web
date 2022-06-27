---
title: 'Promise 那些事'
author: 白菜
date: '2022-05-23 17:47:08'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Promise JavaScript ES6 回调地狱，手写Promise, 源码实现'
  - name: keywords
    content: 'Promise JavaScript ES6 回调地狱，手写Promise, 源码实现'
#issueId:
---

:::tip
Promise 那些事。1、回调嵌套；2、回调地狱；3、解决回调地狱的方案。
:::

<!-- more -->

## 回调嵌套

在日常开发中，可能由于业务的问题我们的程序会写成这种形式：

```javascript
doSomethingA(function (resultA) {
  doSomethingB(
    resultA,
    function (resultB) {
      doSomethingC(
        resultB,
        function (resultC) {
          console.log('finial result' + resultC);
        },
        failCallback
      );
    },
    failCallback
  );
  doSomethingD();
}, failCallback);
doSomethingE();

// 执行顺序
// doSomethingA doSomethingE doSomethingB doSomethingD doSomethingC
```

这就会有一个问题，如果 doSomethingB() 执行失败，那 doSomethingC() 就不会执行了，我们需要才去重试的机制嘛？還是进入其他的错误处理函数呢？这就有点复杂了，维护这样的代码似乎有点困难。

## 回调地狱

在使用 `JavaScript` 时，为了实现某些逻辑经常会写出层层嵌套的回调函数，如果嵌套过多，会极大影响代码可读性和逻辑，这种情况也被成为回调地狱。

```javascript
const buyFruit = function (fruit, callback) {
  setTimeout(function () {
    console.log(fruit);
    callback();
  }, 1000);
};
buyFruit('apple', function () {
  buyFruit('banana', function () {
    buyFruit('orange', function () {
      console.log('end');
    });
  });
});
// apple banana orange end
```

## 解决回调地狱的方案

### Promise.then()

```javascript
const buyFruit = function (fruit) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(fruit);
      resolve();
    }, 1000);
  });
};

buyFruit('apple')
  .then(function () {
    return buyFruit('banana');
  })
  .then(function () {
    return buyFruit('orange');
  })
  .then(function () {
    console.log('end');
  })
  .catch(function (err) {
    console.log(err);
  });

// apple banana orange end
```

### async await

`async` 和 `await` 是嵌套最深的一个 `promise` 的语法糖。

`async` 用于声明一个 `function` 是异步的，而 `async` 函数的返回值是一个 `promise` 对象。

`await` 必须在 `async` 函数中使用，会阻塞后面的异步语句，直到返回表达式结果，而后面如果是 `promise` 则会等待其变为 `resolved` 状态，并以其返回值作为运算结果。

```javascript
const buyFruit = function (fruit) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log(fruit);
      resolve(fruit);
    }, 1000);
  });
};

async function init() {
  const resA = await buyFruit('apple');
  console.log('resA =>', resA);
  await buyFruit('banana');
  await buyFruit('orange');
}

// apple
// resA => apple
// banana
// orange
```

### Generator 函数

```javascript
var sayhello = function (str, ms) {
  setTimeout(function () {
    console.log('str =>', str);
  }, ms);
};

function* genFun() {
  yield sayhello('xiaomi', 2000);
  console.log('frist');
  yield sayhello('huawei', 1000);
  console.log('second');
  yield sayhello('apple', 500);
  console.log('end');
}

const gen = genFun();
gen.next().value;
gen.next().value;
gen.next().value;
gen.next().value;
gen.next().value;

// frist
// second
// end
// str => apple
// str => huawei
// str => xiaomi
```
