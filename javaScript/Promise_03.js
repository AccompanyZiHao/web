//
https://github.com/promises-aplus/promises-spec Promises/A+ 代码仓库

/*
步骤：
1. new Promise 时，需要传递一个 executor 执行器，执行器立刻执行；
2. 该执行器接受两个参数 resolve 和 reject；
3. promise 的状态 从 pending => fulfilled 或者 从 pending => fulfilled  一旦确认，就不会再改变；
4. promise.then  接受两个参数（可选） onFulfilled 成功的回调, onRejected 失败的回调； 返回一个新的 promise；
*/

/*
then 实现
 1. onFulfilled 和都是onRejected 可选参数,如果不是不是函数，则必须忽略它
 2. 如果是一个函数，则必须在 promise 完成/被拒绝 后调用，并以promise' valuereason 作为它的第一个参数；不能在 完成/被拒绝 之前调用；不能多次调用它。
 3. then 可以多次连续调用, 当 promise 完成/被拒绝时，onFulfilled/onRejected 必须和他们的 then 一一对应
 4. 返回一个新的 promise
  1. 如果其中一个onFulfilled或onRejected返回一个值x，则运行 Promise Resolution Procedure [[Resolve]](promise2, x)。
  2. 如果其中一个onFulfilled或onRejected抛出异常e，则promise2必须以拒绝e为理由。
  3. 如果onFulfilled不是一个函数并且promise1被满足，则promise2必须以与 相同的值来满足promise1。
  如果onRejected不是函数并且promise1被拒绝，则promise2必须以与 相同的原因被拒绝promise1。
*/

/*
The Promise Resolution Procedure
一个抽想操作，将promise 和 值输入，即 [[Resolve]](promise, x)
1. 如果promise 和 x 引用同一个对象，promise则以一个TypeError为理由拒绝。
2. 如果 x 是一个 promise, 使用当前的状态
  1. x 处于 peding 状态，它必须保持这个状态，知道 x 完成/被拒绝
  2. x 处于 fulfilled 状态，将返回一个 
  3. x 处于 fulfilled 状态，将返回一个 
3. 如果x是一个对象或函数
  1. 把 x.then 赋值给 then
  2. 如果检索属性 x.then 导致抛出异常 e，则以 e 为理由拒绝 promise。
  3. 如果这是一个函数，那么将 x 作为 this, 第一个参数 resolvePromise， 第二个参数 rejectPromise
    如果/何时resolvePromise使用值调用y，则运行[[Resolve]](promise, y)。
    如果/何时rejectPromise以 理由 调用，则以r拒绝。promiser
    如果同时调用resolvePromiseandrejectPromise或多次调用同一个参数，则第一个调用优先，并且任何进一步的调用都将被忽略。
    如果调用then抛出异常e，
      如果resolvePromise或rejectPromise已被调用，请忽略它。
      promise否则，以拒绝e为理由。
  4. 如果then不是函数，则用 promise 完成x
4. 如果x不是对象或函数，则promise使用x

*/

// https://blog.csdn.net/lunahaijiao/article/details/122872075

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
    // 如果promise 和 x 引用同一个对象
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

  static resolve(value) {
    // 若已经是promise
    if (value instanceof MyPromise) {
      return value;
    }
    // 否则返回一个promise，状态依赖value
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(reason) {
    // 返回一个拒绝的promise，注意是个新的 promise
    return new MyPromise((resolve, reject) => {
      reject(reason);
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
