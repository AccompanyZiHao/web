
https://github.com/promises-aplus/promises-spec Promises/A+ 代码仓库

// 完整版
function isFunction(param) {
  return typeof param === 'function';
}

// 定义状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  status = PENDING;
  FULFILLED_TASK = [];
  REJECTED_TASK = [];
  constructor(executor) {
    this.value = '';
    this.reason = '';
    try {
      // `this` 会指向该方法运行时所在的环境, 而 `class` 内部是严格模式，所以 `this` 实际指向的是 `undefined`，具体看一查看另一 todo
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (this.status === PENDING) {
      this.status = FULFILLED; // 状态流传
      this.value = value; // 传递参数
      this.FULFILLED_TASK.forEach((fn) => fn()); // 多个链式调用执行
    }
  }

  reject(reason) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.REJECTED_TASK.forEach((fn) => fn());
    }
  }

  // onFulfilled 和 onRejected 都是可选参数：
  then(onFulfilled, onRejected) {
    // 这两个不是函数就忽略
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value;
    onRejected = isFunction(onRejected) ? onRejected : (reason) => reason;

    // 返回一个新的 promise
    const p = new MyPromise((resolve, reject) => {
      // 这里可以使用 setTimeout， setImmediate 或者微任务 queueMicrotask
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
        // onFulfilled 和 onRejected 并不是 promise 解决或者拒绝后就立即调用的，而是放到的任务队列中，具体何时执行需要根据实现的机制来
        // 若状态是 pending，则先缓存回调
        // 在 pending 状态变更之前，then 可以被多次调用，所以要用队列来维护回调
        this.FULFILLED_TASK.push(fulfilledMicrotask);
        this.REJECTED_TASK.push(rejectedMicrotask);
      }
    });
    return p;
  }

  resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
      return reject(new TypeError('is circle'));
    }
    // 如果 x 是一个对象或者函数
    if (isFunction(x) || (typeof x === 'object' && x !== null)) {
      let tag = false; // 只能调用一次
      try {
        let then = x.then;
        // 如果 then 是函数，将 x 作为函数的作用域 this 调用。
        // 传递两个回调函数作为参数，  resolvePromise， rejectPromise
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

  static all(list) {
    return new MyPromise(function (resolve, reject) {
      // 是个可迭代的对象
      if (!list || typeof list[Symbol.iterator] !== 'function') {
        return reject(new TypeError('arguments must be iterable'));
      }
      const l = list.length;
      // 因为是异步的 当 i== l 的时候，不能确定它是执行的最后一个，因此额外声明一个 num
      let num = 0;
      for (let i = 0; i < l; i++) {
        MyPromise.resolve(list[i])
          .then((value) => {
            num++;
            // 不能用push，因为结果顺序与参数一一对应
            res[i] = value;
            // 等待所有结果成功返回后解决
            if (counter === num) {
              resolve(res);
            }
          })
          .catch((reason) => {
            reject(reason);
          });
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

function p2(val) {
  return new MyPromise(function (resolve, reject) {
    setTimeout(() => {
      resolve(val);
    }, 1000);
  });
}

p1('xiaobaicai')
  .then((value) => {
    console.log('then value', value);
    return p2('data333');
  })
  .then((val) => {
    console.log('val2', val);
  });
