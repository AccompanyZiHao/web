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
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) {
      this.reject(error);
    }
  }

  resolve(value) {
    if (this.status === PENDING) {
      this.status = FULFILLED;
      this.value = value;
      this.FULFILLED_TASK.forEach((fn) => fn());
    }
  }

  reject(reason) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.REJECTED_TASK.forEach((fn) => fn());
    }
  }

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

  static all(list) {
    return new MyPromise(function (resolve, reject) {
      if (!list || typeof list[Symbol.iterator] !== 'function') {
        return reject(new TypeError('arguments must be iterable'));
      }
      const l = list.length;
      let num = 0;
      for (let i = 0; i < l; i++) {
        // 4. 参数类型期约化
        MyPromise.resolve(anyList[i])
          .then((value) => {
            num++;
            // 5. 不能用push，因为结果顺序与参数一一对应
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
