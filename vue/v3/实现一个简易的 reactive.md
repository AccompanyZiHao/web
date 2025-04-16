## reactive 函数

通过 `reactive` 函数创建一个新的 `Proxy` 对象，用于拦截对象的读取和设置操作。在 `get` 拦截器中，使用 `track` 函数追踪对象属性的依赖关系。在 `set` 拦截器中，使用 `trigger` 函数触发所有依赖于该属性的副作用。

```js
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

function track(target, key) {

}

function trick(target, key, value, receiver) {

}
```

## track 收集依赖

`track` 函数负责追踪目标对象上的依赖关系。它通过检查 `targetMap` 来获取或创建目标对象和属性的依赖映射。然后，它将当前的 `activeEffect` 添加到该映射中，这样，当属性的值发生变化时，所有依赖于该属性的副作用函数都可以被触发。

```js
let activeEffect = null;

const targetMap = new WeakMap();

function track(target, key) {
  let _depMap = targetMap.get(target);
  if (!_depMap) {
    _depMap = new Map();
    targetMap.set(target, _depMap);
  }

  let _deps = _depMap.get(key);
  if (!_deps) {
    _deps = new Set();
    _depMap.set(key, _deps);
  }

  // 当前正在执行的 effect
  _deps.add(activeEffect);
}
```

## trigger 派发更新

`trigger` 函数用于触发目标对象上特定属性的所有依赖副作用。它通过遍历 `targetMap` 中该目标对象的属性依赖集合，调用集合中的每个副作用函数来实现。

```js
function trick(target, key, value, receiver) {
  const _depMap = targetMap.get(target);
  if (!_depMap) return;

  const _deps = _depMap.get(key);
  if (!_deps) return;

  _deps.forEach(effectFn => effectFn && effectFn());
}
```

## effect 副作用

`effect` 函数创建并执行一个副作用函数。这个副作用函数会被包裹在一个 `try-finally` 块中，以确保在执行完毕后，`activeEffect` 变量能够恢复到之前的值，从而确保了每个 `effect` 执行完毕后 `activeEffect` 都能正确地指向上一个 `effect`。

```js
function effect(fn) {
  const effectFn = () =>{
    try {
      effectStack.push(effectFn);
      activeEffect = effectFn;
      fn();
    }finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  }
  effectFn()
  return effectFn;
}
```

## 测试

```js
const state = reactive({
  course1: 100,
  course2: 99,
});
effect(() => {
  console.log( `course1: ${state.course1}`);
});
effect(() => {
  console.log(`course2: ${state.course2}`);
});

state.course1 = 99;
state.course2 = 100;
```

[完整代码](effect&reactive.js)
