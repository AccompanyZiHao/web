// 简易版
function isFunction(param) {
  return typeof param === 'function';
}

// 定义状态
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
  status = PENDING;
  FULFILLED_TASK = null;
  REJECTED_TASK = null;
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
      this.FULFILLED_TASK && this.FULFILLED_TASK(value);
    }
  }

  reject(reason) {
    if (this.status === PENDING) {
      this.status = REJECTED;
      this.reason = reason;
      this.REJECTED_TASK && this.REJECTED_TASK();
    }
  }

  then(onFulfilled, onRejected) {
    // 这两个不是函数就忽略
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (value) => value;
    onRejected = isFunction(onRejected) ? onRejected : (reason) => reason;

    const p = new MyPromise((reslove, inject) => {
      if (this.status === PENDING) {
        this.FULFILLED_TASK = onFulfilled;
        this.REJECTED_TASK = onRejected;
      }
    });
    return p;
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
