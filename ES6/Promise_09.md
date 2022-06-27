---
title: 'Promise'
author: 白菜
date: '2022-05-20 16:56:18'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'Promise ES6 前端'
  - name: keywords
    content: 'Promise ES6 前端'
#issueId:
---

:::tip
Promise 的基本用法。
:::

<!-- more -->

## 什么是 Promise

`Promise` 对象代表了未来将要发生的事件，用来传递异步操作的消息。

## 特点

1. `Promise` 的状态不受外界影响，它代表一个异步操作，有三种状态：

- pending: 进行中，不是成功或失败状态
- fulfilled: 操作成功
- rejected: 操作失败

只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。

2. 一旦状态改变，就不会再变。状态改变只有两种：

- 从 pending 变为 fulfilled
- 从 pending 变为 rejected

只有这两个结果产生，就不会再变，一直保值这个状态。

这与事件`（Event）`完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

### 优点

1. Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。
2. Promise 对象提供统一的接口，使得控制异步操作更加容易。

### 缺点

1. 无法取消 `Promise`，一旦新建它就会立即执行，无法中途取消。
2. 如果不设置回调函数，`Promise` 内部抛出的错误，不会反应到外部。
3. 当处于 `Pending` 状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## 用法

用 new 来调用 `Promise` 的构造器来进行实例化。
`Promise` 构造函数接受一个函数作为参数，这个函数包含 `resolve` 和 `reject` 两个参数。

`resolve` 函数的作用是，将 `Promise` 对象的状态从 `pending` 变为 `resolved`，在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；

`reject` 函数的作用是，将 `Promise` 对象的状态从 `pending` 变为 `rejected`，在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

```javascript
const promise = new Promise(function (resolve, reject) {
  setTimeout((status, data, error) => {
    //当异步代码执行成功时，我们才会调用resolve(...), 当异步代码失败时就会调用reject(...)
    //在本例中，我们使用setTimeout(...)来模拟异步代码，实际编码时可能是XHR请求或是HTML5的一些API方法.
    if (status) {
      // 成功
      resolve(data);
    } else {
      // 失败
      reject(error);
    }
  }, 1000);
});
```

`Promise` 实例生成以后，可以用 `then` 方法分别指定 `resolved` 状态和 `rejected` 状态的回调函数。

`promise.then() `是 `Promise` 最为常用的方法。

```javascript
promise.then(onFulfilled, onRejected);
```

`promise` 简化了对 `error` 的处理，上面的代码我们也可以这样写：

```javascript
promise.then(onFulfilled).catch(onRejected);
```

下面是一个 `Promise` 对象的例子。

```javascript
let promise = new Promise(function (resolve, reject) {
  console.log('Promise');
  resolve();
});

promise.then(function () {
  console.log('resolved.');
});

console.log('Hi!');
// Promise
// Hi!
// resolved
```

`Promise` 新建后就会立即执行。所以会先打印 `'Promise'` , 然后，`then` 方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行，所以 `resolved` 最后输出。

<!-- 链式调用中的 promise 们就像俄罗斯套娃一样，是嵌套起来的，但又像是一个栈，每个都必须从顶端被弹出。链式调用中的第一个 promise 是嵌套最深的一个，也将是第一个被弹出的。 -->

## 方法

### Promise.all()

参数： 接受一个数组作为参数，数组中的每个元素都必须是 `Promise` 对象的实例。
返回一个新的 `Promise` 实例。

`Promise.all()` 方法只适合所有异步操作都成功的情况，如果有一个操作失败，就无法满足要求。但是只要有一个请求失败，它就会报错，而不管另外的请求是否结束。

```javascript
var p = Promise.all([p1, p2, p3]);
```

`p` 的状态由 `p1`、`p2`、`p3` 决定，分成两种情况。

1. 只有 p1、p2、p3 的状态都变成 fulfilled，p 的状态才会变成 fulfilled，此时 p1、p2、p3 的返回值组成一个数组，传递给 p 的回调函数。
2. 只要 p1、p2、p3 之中有一个被 rejected，p 的状态就变成 rejected，此时第一个被 reject 的实例的返回值，会传递给 p 的回调函数。

```javascript
const p1 = new Promise((resolve, reject) => {
  resolve('resolve 1');
}).then((result) => result);

const p2 = new Promise((resolve, reject) => {
  resolve('resolve 2');
}).then((result) => result);

const p5 = new Promise((resolve, reject) => {
  throw new Error('报错了');
}).then((result) => result);

// 'catch3 =>', 'reject';
```

1. `p1` 和 `p2` 都是 `fulfilled` 状态，进入 `then` 方法。

```javascript
Promise.all([p1, p2])
  .then((result) => console.log('result1 =>', result))
  .catch((e) => console.log('catch1 =>', e));

// 'result1 =>', ['resolve 1', 'resolve 2'];
```

2. 加入 `p3` ，它是一个 `rejected` 状态，进入 `catch` 方法。

```javascript
const p3 = new Promise((resolve, reject) => {
  reject('reject 1');
}).then((result) => result);

Promise.all([p1, p2, p3])
  .then((result) => console.log('result2 =>', result))
  .catch((e) => console.log('catch2 =>', e));

// 'catch2 =>', 'reject 1';
```

3. 加入 `p4` ，这里它有两个 `rejected` 状态（ `p3， p4`）， `catch` 输出的是第一个 `reject` 也就是 `p3` 的 `reject` 。

```javascript
const p4 = new Promise((resolve, reject) => {
  reject('reject 2');
}).then((result) => result);

Promise.all([p1, p2, p3, p4])
  .then((result) => console.log('result3 =>', result))
  .catch((e) => console.log('catch3 =>', e));

// "catch3 =>",  "reject 1"
```

4. 如果 `Promise(p3)` 有自己的 `catch` 方法，那么就不会执行 `Promise.all` 的 `catch`。

```javascript
// 修改 p3 并且添加 catch 方法
const p3 = new Promise((resolve, reject) => {
  reject('reject');
}).then((result) => result).catch(err => console.log(' p3 catch =>> ', err);)

Promise.all([p1, p2, p3, p4])
  .then((result) => console.log('result3 =>', result))
  .catch((e) => console.log('catch3 =>', e));

  // " p3 catch =>>",  "reject 1"
  // "catch3 =>",  "reject 2"
```

上面的程序， `p3` 走的是自己的 `catch` ， `p4` 由于没有自己的 `catch` 它就进入了 `Promise.all` 的 `catch`。

### Promise.race()

参数： 接受一个数组作为参数，数组中的每个元素都必须是 `Promise` 对象的实例。
返回一个新的 `Promise` 实例。

与 `Promise.all` 不同的是，他只返回一个的是 参数中最快的那个 `Promise` 。

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('resolve 1');
  }, 200);
}).then((result) => result);

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('resolve 2');
  }, 100);
}).then((result) => result);

Promise.race([p1, p2])
  .then((result) => console.log('result =>', result))
  .catch((e) => console.log('catch =>', e));

//  "result =>",  "resolve 2"
```

### Promise.resolve()

它的作用就是将现有对象转为 `Promise` 对象

1. 如果参数不是 `Promise` ，它将会解析成为一个 `Promise` 对象并返回；

```javascript
Promise.resolve('foo');
// 等价于
new Promise((resolve) => resolve('foo'));
```

2. 如果参数是一个 `Promise` ，那么将返回这个 `Promise` ；
3. 如果这个值是 `thenable`（即带有 `then` 方法），返回的 `Promise` 会“跟随”这个 thenable 的对象，采用它的最终状态；否则返回的 `Promise` 将以此值完成。

```javascript
let thenable = {
  then: function (resolve, reject) {
    resolve(11);
  },
};
```

`Promise.resolve()` 方法会将 `thenable` 对象转为 `Promise` 对象，然后就立即执行 `thenable` 对象的 `then()` 方法, 对象 `p1` 的状态就变为 `resolved` 。

```javascript
let p1 = Promise.resolve(thenable);
p1.then(function (value) {
  console.log(value); // 11
});
```

### Promise.reject()

返回一个新的 `Promise` 实例，该实例的状态为 `rejected`。

```javascript
const p = Promise.reject('this is error');
// 等同于
const p = new Promise((resolve, reject) => reject('this is error'));
```

### Promise.allSettled()

该方法，用来确定每一个异步操作是否都结束了（不管成功或失败）。

返回一个在所有给定的 `promise` 都已经 `fulfilled` 或 `rejected` 后的 `promise` ，并带有一个对象数组，每个对象表示对应的 `promise` 结果。

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('resolve 1');
  }, 500);
}).then((result) => result);

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('resolve 2');
  }, 200);
}).then((result) => result);

const p3 = new Promise((resolve, reject) => {
  reject('reject 1');
}).then((result) => result);

Promise.allSettled([p1, p2, p3])
  .then((result) => console.log('result =>', result))
  .catch((e) => console.log('catch =>', e));

// [{
//   "status": "fulfilled",
//   "value": "resolve 1"
// }, {
//   "status": "fulfilled",
//   "value": "resolve 2"
// }, {
//   "status": "rejected",
//   "reason": "reject 1"
// }]
```

返回的成员对象有两种

1. `status` 属性的值为 `fulfilled` 表示成功，这个对象里面会有一个 `value` 属性值就是返回值。
2. `status` 属性的值为 `rejected` 表示失败， 这个对象里面会有一个 `reason` 属性值就是返回值。

### Promise.any()

它和 `Promise.all()` 是相反的。
`Promise.all()` 是所有 `Promise` 返回的状态都是 `fulfilled` 返回对应的 `Promise` 或者有一个失败就返回失败的那个。
`Promise.any()` 是只要有一个成功即状态是 `fulfilled` 就返回这个成功的或者所有的 `Promise` 都是失败的，它会返回一个失败的合集。

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('resolve 1');
  }, 500);
}).then((result) => result);

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('resolve 2');
  }, 200);
}).then((result) => result);

const p3 = new Promise((resolve, reject) => {
  reject('reject 1');
}).then((result) => result);

Promise.any([p1, p2, p3])
  .then((result) => console.log('result =>', result))
  .catch((e) => console.log('catch =>', e));

// "result =>",  "resolve 2"
```

即使 `p3` 返回的 `promise` 是失败的 `Promise.any()` 依然使用第一个成功状态的 `promise` 来返回。这与使用首个（无论 `rejected` 还是 `fullfiled` ） `promise` 来返回的 `Promise.race()` 相反。

```javascript
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject('reject 1');
  }, 500);
}).then((result) => result);

const p2 = new Promise((resolve, reject) => {
  reject('reject 2');
}).then((result) => result);

Promise.any([p1, p2])
  .then((result) => console.log('result =>', result))
  .catch((e) => console.log('catch =>', e));

// "catch =>",  All promises were rejected
```
