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

# new Promise 接受一个 executor 执行器，该执行器有 2 个参数 resolve reject

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

这样一个简易版的 `Promise` 就完成了。 简易版的完整代码：[点这里](https://github.com/AccompanyZiHao/web/blob/master/javaScript/Promise_01.js)

上面的只能实现一个 `then` 的方法，当我连续链式调用的时候就会报错，我们来修改一下代码。

```javascript
class MyPromise {
  FULFILLED_STASH = [];
  REJECTED_STASH = [];

  resolve(value) {
    if (this.status == PENDING) {
      ...
      this.FULFILLED_STASH.forEach((fn) => fn()); // 执行队列中的任务
    }
  }

  reject(reason) {
    ...
      this.REJECTED_STASH.forEach((fn) => fn());
  }

  then(onFulfilled, onRejected) {
    ...
     if (this.status === PENDING) {
        this.FULFILLED_TASK.push(onFulfilled)
        this.REJECTED_TASK.push(onRejected)
      }
  }
}
```

当我们在链式调用的时候用队列存储起来， 在执行 `resolve` 的时候依次调用，但是有个问题，这个时候我们 value 只有一个，在连续调用的时候会不会被覆盖呢？

```javascript
function p1(val) {
  return new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve(val);
    }, 1000);
  });
}

function p2(val) {
  return new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve(val);
    }, 1000);
  });
}

p1('xiaobaicai')
  .then((value) => {
    console.log('p1 value', value);
    return p2('data333');
  })
  .then((val) => {
    console.log('p2', val);
  });

// xiaobaicai
```

关于 then 的调用时机

```javascript
then(onFulfilled, onRejected) {
    // 这两个不是函数就忽略
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value;
    onRejected = isFunction(onRejected) ? onRejected : (reason) => reason;

    const p = new MyPromise((resolve, reject) => {
      const fulfilledMicrotask = () => {
        queueMicrotask(() => {
          let x = onFulfilled(this.value);
          this.resolvePromise(p, x, resolve, reject);
        });
      };
      const rejectedMicrotask = () => {
        queueMicrotask(() => {
          let x = onRejected(this.reason);
          this.resolvePromise(p, x, resolve, reject);
        });
      };
      if (this.status === FULFILLED) {
        fulfilledMicrotask();
      } else if (this.status === REJECTED) {
        rejectedMicrotask();
      } else {
        this.FULFILLED_TASK.push(fulfilledMicrotask);
        this.REJECTED_TASK.push(rejectedMicrotask);
      }
    });
    return p;
  }
```

```javascript
  resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
      return reject(new TypeError('is circle'));
    }
    if (isFunction(x) || (typeof x === 'object' && x !== null)) {
      let tag = false; // 只能调用一次
      try {
        let then = x.then;
        if (isFunction(then)) {
          then.call(
            x,
            (y) => {
              if (tag) return;
              tag = true;
              this.resolvePromise(promise, y, resolve, reject);
            },
            (reason) => {
              if (tag) return;
              tag = true;
              reject(reason);
            }
          );
        } else {
          if (tag) return;
          tag = true;
          resolve(x);
        }
      } catch (error) {
        if (tag) return;
        tag = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  }
```

完整版的代码：[点这里](https://github.com/AccompanyZiHao/web/blob/master/javaScript/Promise_03.js)
