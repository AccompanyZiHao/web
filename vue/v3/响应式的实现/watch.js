const {
  reactive,
  effect,
} = require("../effect&reactive");

/*
* 本质：同 computed 一样，也是利用了 effect 和 scheduler
*
* 1. 判断 source 类型
* 2. 创建一个 effect，添加 scheduler， scheduler 里面重新执行副作用所获得的数据就是 newVal, 手动调用 effectFn 获取的则是旧的值
* 3. 获取新值和旧值，执行回调函数，并且更新 oldVal
* 4. immediate: 是否立即执行回调函数，如果是立即执行，则没有旧值 即： oldValue 为 undefined
* 5. flush
*   - pre: 再 watch 创建的时候执行一次，即：组件更新前
*   - post: scheduler 里面重新执行副作用放入微任务队列，并等待 dom 更新再执行，即：组件更新后
*   - sync: 同步执行，同本例子
* 6. 过期函数处理，再第一次执行的时候，注册过期回调，第二次调用 watch 的时候，会先执行过期回调，这会使第一次执行副作用的函数的内闭包的变量 expired 变为 ture，从而抛弃 fetch 请求的返回值，从而避免因为竞态导致的副作用函数数据异常的问题。
* */

// function watch1(source, cb){
//   effect(()=> source.age, {
//     scheduler(newValue, oldValue){
//       cb(newValue, oldValue)
//     }
//   })
// }


function watch(source, cb, options = {}) {
  let getter = null;

  // 如果是函数 说明是个 getter
  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);
  }

  // 过期函数的回调
  let cleanup;

  let oldValue, newValue;
  const effectFn = effect(() => getter(), {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'post') {
        // queueMicrotask(scheduler);
        const p = Promise.resolve();
        p.then(scheduler());
      } else {
        // 相当于 sync
        scheduler();
      }
    }
  });


  if (options.immediate) {
    scheduler();
  } else {
    // 手动调用的就是旧的值
    oldValue = effectFn();
  }

  function scheduler() {
    // 重新执行的副作用函数即 新的值
    newValue = effectFn();

    // 再调用回调函数之前，先调用过期函数
    if(cleanup){
      cleanup();
    }

    // 回调函数
    cb(newValue, oldValue, onCleanup);
    // 把新的值重新赋值给旧的值
    oldValue = newValue;
  }

  function onCleanup(fn) {
    cleanup = fn
  }
}

/*
* 递归读取对象的属性
* value 观测的数据
* seen 是否读取过
* */
function traverse(value, seen = new Set()) {
  // 如果读取的数据是原始值 ｜ 已经被读取过了 ｜
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  // 添加到 seen 中
  seen.add(value);

  // 递归调用
  for (let key in value) {
    traverse(value[key], seen);
  }
  return value;
}

const state2 = reactive({
  age: 18
});

// watch1(state2, (newValue, oldValue)=>{
//   console.log(`age change`);
// })


watch(() => state2.age, async(newValue, oldValue, onCleanup) => {
  console.log('age change', newValue, oldValue);

  let expired = false;
  onCleanup(()=>{
    expired = true;
  })

  const res  = await fetch()
  // 如果没有这个判断，返回 3 次
  if(!expired){
    console.log('res', res);
  }
}, {
  flush: 'post'
});

state2.age = 19;
state2.age = 20;

setTimeout(()=>{
  state2.age = 21;
}, 300)

function fetch(){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const res = Math.random()
      console.log('fetch res', res);
      resolve(res);
    },1000)
  })
}
/*
* onWatcherCleanup
* 过期副用的的清除 https://github.com/vuejs/core/blob/main/packages/reactivity/src/watch.ts#L103
* */
