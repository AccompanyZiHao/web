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
* 5. 新增通过 ownKeys 来进行拦截，同时为 track 收集依赖的函数创建一个唯一的 key, 在 set 的时候，再触发一次副作用函数
* 6. 删除通过 deleteProperty 进行拦截，同新增
* 7. 修改判断值是否相同，不同再修改，注意 NaN 的判断
* 8. 对于修改原型的方法，通过拦截器的 receiver.raw 来判断是否是代理对象，如果是的话则不更新
* 9. 数组的修改
*     - length 修改，只对索引大于当前最新值的索引，才修改
*     - 遍历数组 ownKeys 通过 length 建立联系； 无论 for  of 还是 array.values 最终都会访问 symbol.iterator 属性，因此需要拦截，不需要建立响应式的关系
*     - 查找 includes, indexOf, lastIndexOf, 由于这些方法内部的 this 指向的是一个新的代理对象，为了避免为同一个对象创建新的代理，通过 map 来进行存储；由于 arr 内部是个代理对象，通过原始对象去查找的时候，会找不到，因此需要改写这些方法
*     - 隐式修改数组长度 pop, shift, unshift, splice, 这些会触发 length 的修改， 因此需要拦截
*     - 更多方法： https://github.com/vuejs/core/blob/main/packages/reactivity/src/arrayInstrumentations.ts
*
* */

const TriggerType = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
};
// 拦截 for in 操作，设置的唯一 key
const ITERATE_KEY = Symbol();
// map 的 keys 只关心数据键的变化，而不关心值的变化
const MAP_KEYS_ITERATE_KEY = Symbol();

// 存储原始对象到代理对象的映射
const reactiveMap = new Map();

// 数组修改的方法
const arrayMethods = {};

['includes', 'indexOf', 'lastIndexOf'].forEach((methodName) => {
  // 原始方法
  const originMethods = Array.prototype[methodName];

  arrayMethods[methodName] = function (...args) {
    // this 是代理对象，先在代理对象中查找
    let res = originMethods.apply(this, args);
    if (res === false) {
      // 没找到，则去 this.raw 的原始数组中找
      res = originMethods.apply(this.raw, args);
    }

    return res;
  };
});

// 是否进行追踪
let shouldTrack = true;
/*
* 这些方法会间接的改变数组的长度，从而读取 length 属性，并且还会设置 length 的值
* 理论上，我们只需要屏蔽对 length 属性的读取就可以了，从而避免它与副作用函数之间建立联系
* 但是这些操作语意上是 set 操作，为了避免建立响应式的联系不产生其他的副作用，因此对这些方法进行了拦截修改
* */

['pop', 'push', 'shift', 'unshift', 'splice'].forEach((methodName) => {
  const originMethods = Array.prototype[methodName];

  arrayMethods[methodName] = function (...args) {
    shouldTrack = false;
    // 此方法会修改数组的 length 触发 trick
    const res = originMethods.apply(this, args);
    shouldTrack = true;

    return res;
  };
});

function reactive(target, isShallow = false, isReadonly = false) {

  // 通过原始对象寻找原来的代理对象。找到了直接返回
  const existProxy = reactiveMap.get(target);
  if (existProxy) return existProxy;

  const proxy = new Proxy(target, {
    // 对象读取操作： in 操作符拦截
    has(target, key) {
      console.log('this is in operate, has,  key is ==', key);
      track(target, key);

      return Reflect.has(target, key);
    },
    ownKeys(target) {
      // for in 触发的场景
      // 收集依赖的时候，key 为 symbol, 新增一个属性
      // track(target, ITERATE_KEY);
      // 如果是数组，用 length 作为 key 建立联系
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
    },
    // 删除 操作符拦截
    deleteProperty(target, key) {
      if (isReadonly) {
        console.warn('this is readonly, set, key is ==', key);
        return true;
      }

      // 判断属性是否存在
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);

      // 当被删除的属性存在，并且删除成功才触发更新
      if (hadKey && res) {
        trick(target, key, TriggerType.DELETE);
      }
      return res;
    },
    // 对象读取操作：属性读取 obj.foo
    get(target, key) {

      const res = Reflect.get(target, key);

      // 比如 map set 类型的
      if (Object.prototype.toString.call(target) === '[object Map]' ||
        Object.prototype.toString.call(target) === '[object Set]') {
        // todo
      }

      // 代理对象可以通过 raw 属性访问原始对象
      if (key === 'raw') {
        return target;
      }

      // 浅响应式的直接返回原始值
      if (isShallow) {
        return res;
      }

      // 如果对象是数组，并且 key 值存在 arrayMethods 中，返回 arrayMethods 的值
      if (Array.isArray(target) && arrayMethods.hasOwnProperty(key)) {
        return Reflect.get(arrayMethods, key, target);
      }

      // 只有只读的时候，没有必要建立响应式的联系
      // 无论数组使用 for of 还是 ,values 的方式都会读取 symbol.iterator 属性，为避免发生意外，需要排除掉
      // 副作用函数不应该与 symbol.iterator 之间建立联系
      if (!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      // 如果是对象的多成嵌套，则递归调用 reactive，使其成为响应式
      if (typeof res === 'object' && res !== null) {
        // return reactive(res);
        // 深度只读处理
        return isReadonly ? reactive(res, isShallow, true) : reactive(res);
      }

      return res;
    },

    set(target, key, newValue, receiver) {
      if (isReadonly) {
        console.warn('this is readonly, set, key is ==', key);
        return true;
      }

      const oldValue = target[key];

      // // 判断新增还是修改
      // const type = Object.prototype.hasOwnProperty.call(target, key)? TriggerType.UPDATE: TriggerType.ADD;

      // 添加数组的判断
      const type = Array.isArray(target)
        // 检测数组的索引是否小于数组的长度，小于则修改，否则是新增 ,key: 索引
        ? Number(key) < target.length ? TriggerType.UPDATE : TriggerType.ADD
        // 对象的检测
        : Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.UPDATE : TriggerType.ADD;

      const res = Reflect.set(target, key, newValue, receiver);

      // 只有 receiver 是 target 的代理对象时，才触发更新
      if (target === receiver.raw) {
        // 旧的值不等于新的值 并且 值不等于 NaN
        if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
          trick(target, key, type, newValue);
        }
      }

      return res;
    }
  });

  // 没找到则添加
  reactiveMap.set(target, proxy);
  return proxy;
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
  if (!activeEffect || !shouldTrack) return;

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
  activeEffect.deps.push(_deps);
}

function trick(target, key, type, newValue) {
  const _depMap = targetMap.get(target);
  if (!_depMap) return;

  const _deps = _depMap.get(key);
  // if (!_deps) return;

  // _deps.forEach(effectFn => effectFn && effectFn());
  // 原因见 vue/v3/响应式的实现/demo/forEach.js
  // 版本二 依赖清除
  // const effectTask = new Set(_deps);
  // effectTask && effectTask.forEach(effectFn => effectFn && effectFn());

  // 版本三 无线循环递归调用
  const effectTask = new Set();
  _deps && _deps.forEach(effectFn => {
    // 如果 trick 触发的 effect 与当前正在执行的 effect 不同，则添加到任务中区
    if (effectFn !== activeEffect) {
      effectTask.add(effectFn);
    }
  });
  // effectTask && effectTask.forEach(effectFn => effectFn && effectFn());

  // 如果修改了数组的 length
  if (Array.isArray(target) && key === 'length') {
    _depMap.forEach((effects, key) => {
      // 只需要对索引大于新的 length 副作用重新执行
      if (key >= newValue) {
        effects.forEach(effectFn => {
          if (effectFn !== activeEffect) {
            effectTask.add(effectFn);
          }
        });
      }
    });
  }

  // 数组的新增
  if (type === TriggerType.ADD && Array.isArray(target)) {
    // 获取与 length 相关的 effect
    const lengthEffects = _depMap.get('length');
    lengthEffects && lengthEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectTask.add(effectFn);
      }
    });
  } else if (type === TriggerType.ADD || type === TriggerType.DELETE ||
    // 跟新操作的 map 类型的数据需要重新执行
    (type === TriggerType.UPDATE && Object.prototype.toString.call(target) === '[object Map]')) {

    const iterateEffects = _depMap.get(ITERATE_KEY);
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectTask.add(effectFn);
      }
    });
  } else if ((type === TriggerType.ADD || type === TriggerType.DELETE) && Object.prototype.toString.call(target) === '[object Map]') {
    const iterateEffects = _depMap.get(MAP_KEYS_ITERATE_KEY);
    iterateEffects && iterateEffects.forEach(effectFn => {
      if (effectFn !== activeEffect) {
        effectTask.add(effectFn);
      }
    });
  }

  // 调度器
  effectTask.forEach(effectFn => {
    // 如果存在调度器，则使用该调度器，并把副作用函数作为参数传递
    if (effectFn.options && effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn);
    } else {
      effectFn && effectFn();
    }
  });
}

// 通过建立一个栈来保存 effect 函数，解决 effect 嵌套的问题，确保 activeEffect 始终指向当前正在执行的 effect
const effectStack = [];

function effect(fn, options) {
  const effectFn = () => {
    try {
      effectStack.push(effectFn);
      activeEffect = effectFn;
      // 清除
      cleanup(effectFn);
      // fn();
      // 为实现计算属性，需要返回 fn() 的结果
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn.options = options;
  effectFn.deps = [];

  // 只有 lazy 不存在 时才执行
  if (!options || !options.lazy) {
    effectFn();
  }
  return effectFn;
}

// 清除依赖
function cleanup(effectFn) {
  effectFn.deps.forEach(dep => dep.delete(effectFn));

  effectFn.deps = [];
}

// 实现一个调度器
const jobQueue = new Set();
// 将任务添加到微队列
const p = Promise.resolve();
// 是否正在刷新
let isFlushing = false;

function flush() {
  if (isFlushing) return;
  isFlushing = true;

  p.then(() => {
    jobQueue.forEach(job => job());
  }).finally(() => {
    isFlushing = false;
  });
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

// function scheduler(fn) {
//   jobQueue.add(fn);
//   flush();
// }

// 任务调度
// effect(() => {
//   // 多次改变执行一次，异步操作
//   console.log('state.level', state.level);
// }, {
//   scheduler
// });

// state.level++;
// state.level++;

// effect(()=>{
//   for(const key in state){
//     console.log('this is in, key', key, state[key]);
//   }
// })
// setTimeout(()=>{
//   console.log('新增');
//   state.name = 'gg'
//   console.log('删除');
//   delete state.name
// }, 2000)

/*
* 如果设置的属性不在对象是上，那么就会调用原型上的 set 即 parent 的set，而 parent 是个代理对象，又执行了它的 set 方法
* 而读取的时候 不仅会收集 child.foo 方法，也会收集 parent.foo 方法，
* 因此导致了修改 child.foo 方法，使副作用函数执行了二次
* 屏蔽 parent.foo 触发的更新，
*
* */
// const obj = {}
// const proto = {foo: "1"}
// const child = reactive(obj)
// const parent = reactive(proto)
// // parent 作为 child 的原型
// Object.setPrototypeOf(child, parent)
// effect(()=>{
//   console.log('child.foo', child.foo);
// })
// child.foo = '2'
// console.log('child.raw', child.raw === obj); // true
// console.log('parent.raw', parent.raw === proto); // true

/*
* 多层嵌套的
* */
// const obj = reactive({
//   foo: {
//     bar: 1
//   }
// })
// effect(()=>{
//   console.log('obj.foo.bar', obj.foo.bar);
// })
// obj.foo.bar = 2


/*
* 数组长度和索引
* */
// const arr = reactive(['a', 'b', 'c']);
// effect(() => {
//   console.log('arr[i]', i, arr[i]);
// });
// arr['length'] = 0;
// setTimeout(() => {
//   arr.length = 1;
// }, 1000);


/*
* 数组循环
* */
// const arr = reactive(['a', 'b', 'c']);
// effect(() => {
//   // for (const item in arr){
//   //   console.log('item', item, arr[item]);
//   // }
//   for (const item of arr.values()) {
//     console.log(item);
//   }
// });
// // arr[3] = 'd'
// arr.length = 1;

/*
* 数组查找
* */
// const obj = [{}];
// const arr = reactive([obj]);
// console.log(arr.includes(arr[0])); // true
// console.log(arr.includes(obj)); // false 需要改写 includes 方法, 该写完之后为 true

/*
* 隐式修改数组长度
* */
// const arr = reactive([1, 2, 3]);
// effect(() => {
//   arr.push('a');
// });
// effect(() => {
//   arr.push('b');
// });
// effect(()=>{
//   console.log('arr', arr);
// })
// 未修改之前，连续调用会陷入死循环


module.exports = {
  reactive,
  effect,
  track,
  trick,
  ITERATE_KEY,
  MAP_KEYS_ITERATE_KEY,
  TriggerType,
};
