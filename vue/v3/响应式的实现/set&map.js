const {
  track,
  effect,
  trick,
  ITERATE_KEY,
} = require('./../effect&reactive');
const {MAP_KEYS_ITERATE_KEY} = require("../effect&reactive");

// https://github.dev/vuejs/core/blob/main/packages/reactivity/src/collectionHandlers.ts

/*
* 1. set/map 方法的 get 处理 需要注意 this 的指向问题，通过 get 去收集依赖
* 2. add ,get delete, set 方法，需要手动触发依赖
* 3. 数据污染的问题：需要在 set 的时候判断是否是代理数据
* 4. forEach set 的时候，需要触发 forEach 的读取， forEach 中的非原始数据都应该是响应式的
* 5. 迭代器 entries keys values 的迭代器，需要拦截，触发使用原始数据的迭代器，并且触发副作用的执行；
* */

// 拦截方法并触发依赖的响应
const instrumentations = {
  // values(){
  //   const target = this.raw;
  //
  //   // map
  //
  //   // 获取原始的迭代器
  //   // const iterator = target[Symbol.iterator]();
  //   const iterator = target.values();
  //
  //   const wrap = (val) => (typeof val === 'object' ? reactive(val) : val);
  //
  //
  //   // 建立响应式关系
  //   // keys 的操作与 values entries 的方法对比，keys 并不关心值的的变化，它值关心数据的键的变化
  //   trick(target,  ITERATE_KEY);
  //
  //   // 返回一个自定义的迭代器
  //   return {
  //     // 迭代器协议
  //     next() {
  //       const {
  //         value,
  //         done
  //       } = iterator.next();
  //
  //       return {
  //         value: wrap(value),
  //         done
  //       };
  //     },
  //     // 可迭代协议
  //     [Symbol.iterator]() {
  //       return this;
  //     }
  //   };
  // },
  forEach(callback, thisArg) {
    const target = this.raw;
    // 获取原始数据
    const rawTarget = target.raw || target;
    // 包裹一层，把 foreach 内的可代理的数据转换为响应式的
    // 注意：此处的 reactive 方法只能代理 set/map ，这里的是单独为 set/map 写的一个方法
    const wrap = (val) => (typeof val === 'object' ? reactive(val) : val);
    // 建立响应式的关系
    track(target, ITERATE_KEY);
    // 遍历原始数据
    return rawTarget.forEach((value, key) => {
      // 手动调用 callback 实现深度响应
      // callback(wrap(value), wrap(key), this);
      // 通过 .call 传递 this 的值
      callback.call(thisArg, value, key, target);
    });
  },
  add(key) {
    //  this 执行代理对象， 同过 raw 获取原始对象
    const target = this.raw;

    let hasKey = target.has(key);
    // 不存在再触发
    if (!hasKey) {
      // 通过原始对象执行 add 方法
      target.add(key);

      // 触发响应
      trick(target, key, 'ADD');
    }

    return this;
  },
  delete(key) {
    const target = this.raw;
    let hadKey = target.has(key);

    // 通过原始对象执行 delete 方法
    let res = target.delete(key);
    if (hadKey) {
      // 触发响应
      trick(target, key, 'DELETE');
    }
    return res;
  },
  get(key) {
    const target = this.raw;

    track(target, key);

    let hasKey = target.has(key);
    // 如果存在则返回
    // 如果返回的结果是个可代理的对象，则返回一个代理对象
    if (hasKey) {
      const res = target.get(key);

      return typeof res === 'object' ? reactive(res) : res;
    }
  },
  set(key, value) {
    const target = this.raw;
    // 获取旧的值
    const oldValue = target.get(key);

    // 通过原始对象执行 set 方法，会产生数据污染
    // target.set(key, value);

    //  获取原始数据， 如果存在 .raw 则是代理数据，否则就是原始数据
    const rawValue = value.raw || value;
    target.set(key, rawValue);

    let hadKey = target.has(key);
    if (!hadKey) {
      // 不存在，即新增
      trick(target, key, 'ADD');
    } else if (oldValue !== value || (oldValue === oldValue && value === value)) {
      // 存在 & 值改变了，即修改
      trick(target, key, 'UPDATE');
    }
  },
};

// 迭代器方法
function createIterableMethod(method) {
  {
    return function () {
      const target = this.raw;

      // map
      const isPair = method === 'entries' || method === Symbol.iterator;

      // 获取原始的迭代器
      // const iterator = target[Symbol.iterator]();
      const iterator = target[method]();

      const wrap = (val) => (typeof val === 'object' ? reactive(val) : val);

      // 建立响应式关系
      // keys 的操作与 values entries 的方法对比，keys 并不关心值的的变化，它值关心数据的键的变化
      trick(target, method === 'keys' ? MAP_KEYS_ITERATE_KEY : ITERATE_KEY);

      // 返回一个自定义的迭代器
      return {
        // 迭代器协议
        next() {
          const {
            value,
            done
          } = iterator.next();
          if (!done) {
            // 触发读取
            track(target, ITERATE_KEY);
          }

          // values & key 的 value 是个值，而非键值对
          let val = wrap(value);
          if (isPair) {
            // 如果不是 undefined，则返回 wrap 后的值，否则返回原始的值
            val = value ? [wrap(value[0]), wrap(value[1])] : value;
          }
          return {
            value: val,
            done
          };
        },
        // 可迭代协议
        [Symbol.iterator]() {
          return this;
        }
      };
    };
  }
}

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {

      // 如果 key === 'raw'，则返回原始对象，否则返回代理对象
      if (key === 'raw') {
        return target;
      }

      if (key === 'size') {
        track(target, ITERATE_KEY);

        // 因为 map/set 类型的 size 是一个访问器， receiver 代理中不存在，因此需要更改 this 指向
        return Reflect.get(target, key, target);
      }

      // return Reflect.get(target, key, receiver);
      // 当调用 set 的方法的时候， this 指向当前的代理对象，并非 map/set
      // return target[key].bind(target);

      const iteratorMethods = [
        'keys',
        'values',
        'entries',
        Symbol.iterator,
      ];

      iteratorMethods.forEach(method => {
        instrumentations[method] = createIterableMethod(method);
      });

      // 对方法的改写
      return instrumentations[key];
    },
    // set(target, key, value, receiver) {
    //   const ret = Reflect.set(target, key, value, receiver);
    //  return ret;
    // }
  });
}


// const setData = new Set([1, 2, 3]);
// const stateSet = reactive(setData);

// effect(() => {
//   console.log('set size', stateSet.size);
// });
// stateMap.remove('age')
// stateMap.set('age', 19)
// console.log('add', stateSet.add(4)); // 新增完之后会再次触发 size
// console.log('del', stateSet.delete(4));

/*
* mapData 既能操作原始数据，也能操作代理数据，产生了数据污染
* */
// const mapData = new Map([['age', 18]])
// const stateMap = reactive(mapData);
// const stateMap2 = reactive(new Map([['name', 'wu']]));
// stateMap.set('map2', stateMap2)
// effect(()=>{
//   console.log('mapData', mapData);
// })
// mapData.get('map2').set('level', '19')


/*
* forEach
* */
// const key = {key: 'a'};
// const value = new Set([1, 2, 3]);
// const state = reactive(new Map([[key, value]]));
// effect(() => {
//   state.forEach((v, k) => {
//     console.log(v, k);
//   });
// });
//
// state.set('b', new Set([4, 5, 6]));


/*
* 迭代器
* */
const state = reactive(new Map([['a', 1], ['b', 2], ['c', 3]]));
effect(()=>{
  // 同 symbol.iterator
  for (const [key, value] of state){
    console.log(key, value);
  }
})
// effect(() => {
//   for (const val of state.values()) {
//     console.log(val);
//   }
// });
// effect(() => {
//   for (const key of state.keys()) {
//     console.log(key);
//   }
// });
state.set('a', '11');
