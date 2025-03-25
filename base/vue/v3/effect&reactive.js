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
  effectTask && effectTask.forEach(effectFn => effectFn && effectFn());
}

// 通过建立一个栈来保存 effect 函数，解决 effect 嵌套的问题，确保 activeEffect 始终指向当前正在执行的 effect
const effectStack = [];

function effect(fn) {
  const effectFn = () => {
    try {
      effectStack.push(effectFn);
      activeEffect = effectFn;
      // 清除
      cleanup(effectFn)
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn.deps = []
  effectFn();
  return effectFn;
}

// 清除依赖
function cleanup(effectFn){
  effectFn.deps.forEach(dep => dep.delete(effectFn))

  effectFn.deps = []
}

const state = reactive({
  course1: 100,
  course2: 99,
  ok: true,
  level: 1,
});
effect(() => {
  console.log(`course1: ${ state.course1 }`);
});
effect(() => {
  console.log(`course2: ${ state.course2 }`);
});

// 分支切换
effect(()=>{
  console.log(`state: ${ state.ok ? state.level : 'bad' }`);
})

// state.course1 = 99;
// state.course2 = 100;

/*当 state.ok 的状态为 false 的时候，避免修改 state.level 触发分支切换函数的副作用*/
// state.level = 2
// state.ok = false
// console.log('====');
// state.level = 4

// 无限循环
effect(()=>{
  if(state.level > 5){
    throw new Error('state.level 无限循环')
  }
  console.log('state.level 无限循环', state.level);
  state.level +=1
})
