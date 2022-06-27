---
title: '手写一个Promise'
author: 白菜
date: '2022-06-15 18:20:20'
categories:
  - JavaScript
tags:
  - ES6
  - JavaScript
#issueId:
---

# 1. new Promise 接受一个 executor 执行器，该执行器有 2 个参数 resolve reject

```javascript
// 定义状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class mPromise {
  status = PENDING;
  constructor(executor) {
    try {
      // `this` 会指向该方法运行时所在的环境, 而 `class` 内部是严格模式，所以 `this` 实际指向的是 `undefined`，具体看一查看另一 todo
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  resolve() {}

  reject() {}
}
```

# 实现 resolve 和 reject

`promise` 只能从 `pending` 到 `rejected`, 或者从 `pending` 到 `fulfilled`

`promise` 的状态一旦确认，就不会再改变

```javascript
class mPromise {
  static status = PENDING;
  constructor(executor) {
    this.value = '';
    this.reason = '';
    try {
      // `this` 会指向该方法运行时所在的环境, 而 `class` 内部是严格模式，所以 `this` 实际指向的是 `undefined`，具体看一查看另一 todo
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  // reslove 接受一个参数 value
  resolve(value) {
    if (this.status == PENDING) {
      this.status = FULFILLED; // 改变状态
      this.value = value; // 传递参数
    }
  }

  // reject 接受一个参数 reason
  reject(reason) {
    if (this.status == PENDING) {
      this.status = REJECTED;
      this.value = reason;
    }
  }
}
```

# 实现 then

1. 接受两个参数 onFulfilled 和 onRejected 都是可选参数
2. 返回一个 Promise 对象
```javascript
function isFunction(param) {
  return typeof param === 'function';
}

// 定义状态
class MyPromise {
  FULFILLED_TASK = null;
  REJECTED_TASK = null;

  ...

  resolve(value) {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.FULFILLED_TASK && this.FULFILLED_TASK(value);
    }
  }

  reject(reason) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.REJECTED_TASK && this.REJECTED_TASK(reason);
    }
  }

  then(onFulfilled, onRejected) {
    // 这两个不是函数就忽略
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value;
    onRejected = isFunction(onRejected) ? onRejected : (reason) => reason;

    return new MyPromise((reslove, inject) => {
      if (this.status === PENDING) {
        this.FULFILLED_TASK = onFulfilled
        this.REJECTED_TASK = onRejected
      }
    });
  }
}

function p1(val) {
  return new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve(val);
    }, 1000);
  });
}

p1('xiaobaicai').then((value) => {
  console.log('then value', value);
});

```

这样一个简易版的 `Promise` 就完成了。 简易版的完整代码：[点这里](https://github.com/AccompanyZiHao/vuepress/blob/master/docs/javaScript/Promise_01.js)

> Here “platform code” means engine, environment, and promise implementation code. In practice, this requirement ensures that onFulfilled and onRejected execute asynchronously, after the event loop turn in which then is called, and with a fresh stack. This can be implemented with either a “macro-task” mechanism such as setTimeout or setImmediate, or with a “micro-task” mechanism such as MutationObserver or process.nextTick. Since the promise implementation is considered platform code, it may itself contain a task-scheduling queue or “trampoline” in which the handlers are called.
