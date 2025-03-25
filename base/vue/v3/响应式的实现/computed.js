const {
  reactive,
  effect,
  trick,
  track
} = require("../effect&reactive");

/*
* 1. 通过添加 dirty 属性判断是否需要计算
* 2. 修改 effect ，把当前函数的返回值传递出来，用于计算
* 3. 当 dirty 为 true 的时候，执行 effectFn ，并把返回值赋值给 value
* 4. 添加缓存，添加 value 字段
* 5. 添加 scheduler ，当依赖项变化时，重新计算
* 6. 嵌套 effect 的计算属性，需要手动触发
*
* computed(obj)
*   -- value
*       -- effect
*
* * targetWeakMpa = {
*   [computed(即：obj)]: {
*       // set 类型
*       [target.key(即：value)]: effect
*   }
* }
* */

const state2 = reactive({
  firstName: 'wu',
  lastName: 'xiaoBai'
});

function computed(getter) {
  let value;
  // 是否需要计算
  let dirty = true;

  const effectFn = effect(getter, {
    lazy: true,
    // 添加 scheduler ，当依赖项变化时，重新计算
    scheduler: (fn) => {
      dirty = true;

      // 依赖发生变化，触发依赖
      trick(obj, 'value');
    }
  });

  const obj = {
    // 在读取值的时候 再执行 fn
    get value() {
      // 没有缓存
      // return effectFn
      if (dirty) {
        // effect 中 的 fn 的返回值
        value = effectFn();
        // 计算完成，设置 dirty 为 false，如果值没更改，直接使用 value
        dirty = false;
      }

      // 读取时 手动调用
      track(obj, 'value');
      return value;
    }
  };

  return obj;
}

const fullName = computed(() => state2.firstName + state2.lastName);

console.log('fullName==', fullName.value);

// 依赖更改重新计算
console.log('---');
state2.firstName = 'wu2';
console.log('fullName==', fullName.value);

// 嵌套了 effect 的依赖的重新读取
effect(() => {
  console.log('fullName in effect ==', fullName.value);
});

state2.firstName = 'wu3';
