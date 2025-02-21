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

function trick(target, key, value, receiver) {
  const _depMap = targetMap.get(target);
  if (!_depMap) return;

  const _deps = _depMap.get(key);
  if (!_deps) return;

  _deps.forEach(effectFn => effectFn && effectFn());
}

const effectStack = [];

function effect(fn) {
  const effectFn = () => {
    try {
      effectStack.push(effectFn);
      activeEffect = effectFn;
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn();
  return effectFn;
}

const state = reactive({
  course1: 100,
  course2: 99,
});
effect(() => {
  console.log(`course1: ${ state.course1 }`);
});
effect(() => {
  console.log(`course2: ${ state.course2 }`);
});

state.course1 = 99;
state.course2 = 100;
