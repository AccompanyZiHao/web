/*
*
* 1. 通过 proxy 实现对数据的拦截
*   - get 方法，拦截读取操作
*   - set 方法，拦截写入操作
* 2. 依赖的收集 通过 track 实现， 建立 targetMap 和 effectFn 的映射关系
* 3. 依赖的派发 通过 trick 实现
*     - 依赖清除； 三元表达式，对不需要的依赖的清除
*     - 无线递归调用：当前的副作用函数和正在执行的副作用函数相同，则不重新添加 例如：effect 中的 state.level +=1;
*     - 有调度器，则使用调度器的回调函数
* 4. 通过 effect 实现对数据的追踪
*     - 通过栈来解决循环嵌套的问题，栈底是最外层，栈顶是最内层
*     - computed：通过 options.lazy 来判断是否立即调用回调，从而实现 computed， effect 的回调的返回值作为计算属性的返回值
*     - 通过不同的调度器来实现计算和侦听
* */
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {

      const res = Reflect.get(target, key);

      track(target, key);

      return res;
    },

    set(target, key, newValue, receiver) {

      const res = Reflect.set(target, key, newValue, receiver);

      trick(target, key);

      return res;
    }
  });
}

let activeEffect = null;

/*
* targetMap 的 key 是 target, val 是个 map
* map 的 key 是 target 的 key, val 是个 set，存放着与 target key 有关联的 effect
*
* targetMpa = {
*   [target]: {
*       // set 类型
*       [target.key]: effect
*   }
* }
*
*
* weakMap 是个弱引用，不影响垃圾回收器的工作
* */
const targetMap = new WeakMap();

function track(target, key) {
  if(!activeEffect) return

  let _depMap = targetMap.get(target);
  // 如果不存在 depMap 则重新建立一个 map 并和 target 关联起来
  if (!_depMap) {
    _depMap = new Map();
    targetMap.set(target, _depMap);
  }

  // 存放着与 target key 有关联的 effect
  let _deps = _depMap.get(key);
  if (!_deps) {
    _deps = new Set();
    _depMap.set(key, _deps);
  }

  // 当前正在执行的 effect
  _deps.add(activeEffect);

  // 收集依赖
  activeEffect.deps.push(_deps)
}

function trick(target, key, value, receiver) {
  const _depMap = targetMap.get(target);
  if (!_depMap) return;

  const _deps = _depMap.get(key);
  if (!_deps) return;

  // _deps.forEach(effectFn => effectFn && effectFn());
  // 原因见 vue/v3/响应式的实现/demo/forEach.js
  // 版本二 依赖清除
  // const effectTask = new Set(_deps);
  // effectTask && effectTask.forEach(effectFn => effectFn && effectFn());

  // 版本三 无线循环递归调用
  const effectTask = new Set();
  _deps.forEach(effectFn => {
    // 如果 trick 触发的 effect 与当前正在执行的 effect 不同，则添加到任务中区
    if(effectFn !== activeEffect){
      effectTask.add(effectFn)
    }
  });
  // effectTask && effectTask.forEach(effectFn => effectFn && effectFn());

  // 调度器
  effectTask.forEach(effectFn =>{
    // 如果存在调度器，则使用该调度器，并把副作用函数作为参数传递
    if(effectFn.options && effectFn.options.scheduler){
      effectFn.options.scheduler(effectFn)
    }else{
      effectFn && effectFn()
    }
  })
}

// 通过建立一个栈来保存 effect 函数，解决 effect 嵌套的问题，确保 activeEffect 始终指向当前正在执行的 effect
const effectStack = [];

function effect(fn, options) {
  const effectFn = () => {
    try {
      effectStack.push(effectFn);
      activeEffect = effectFn;
      // 清除
      cleanup(effectFn)
      // fn();
      // 为实现计算属性，需要返回 fn() 的结果
      return fn()
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn.options = options
  effectFn.deps = []

  // 只有 lazy 不存在 时才执行
  if(!options || !options.lazy){
    effectFn();
  }
  return effectFn;
}

// 清除依赖
function cleanup(effectFn){
  effectFn.deps.forEach(dep => dep.delete(effectFn))

  effectFn.deps = []
}

// 实现一个调度器
const jobQueue = new Set();
// 将任务添加到微队列
const p = Promise.resolve();
// 是否正在刷新
let isFlushing = false;
function flush() {
  if(isFlushing) return
  isFlushing = true;

  p.then(() => {
    jobQueue.forEach(job => job())
  }).finally(() => {
    isFlushing = false
  })
}


const state = reactive({
  course1: 100,
  course2: 99,
  ok: true,
  level: 1,
});
// effect(() => {
//   console.log(`course1: ${ state.course1 }`);
// });
// effect(() => {
//   console.log(`course2: ${ state.course2 }`);
// });

// 分支切换
// effect(()=>{
//   console.log(`state branch: ${ state.ok ? state.level : 'bad' }`);
// })

// state.course1 = 99;
// state.course2 = 100;

/*当 state.ok 的状态为 false 的时候，避免修改 state.level 触发分支切换函数的副作用*/
// state.level = 2
// state.ok = false
// console.log('====');
// state.level = 4

// 无限循环
// effect(()=>{
//   if(state.level > 5){
//     throw new Error('state.level 无限循环')
//   }
//   console.log('state.level 无限循环', state.level);
//   state.level +=1
// })

function scheduler(fn){
  jobQueue.add(fn)
  flush()
}

// 任务调度
effect(()=>{
  // 多次改变执行一次，异步操作
  console.log('state.level', state.level);
}, {
  scheduler
})

// state.level++;
// state.level++;

module.exports = {
  reactive,
  effect,
  track,
  trick,
}
