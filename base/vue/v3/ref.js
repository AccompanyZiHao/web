const {
  reactive,
  effect,
} = require("./effect&reactive");

/*
*
* 1. proxy 只能代理对象，原始值需要包裹一层
* 2. 通过 defineProperty 添加 __v_isRef 来标识这个对象是 ref 对象
* 3. toRef 将对象中的某个属性代理成一个 ref 对象，通过 getter/setter 代理到对象中的某个属性，防止响应式丢失
* 4. toRefs 循环调用 toRef
* 5. 自动脱 ref 比如 template 中使用
* */
function ref(val) {
  const wrapper = {
    value: val
  };

  // 通过定义一个不可枚举的属性 __v_isRef 来标识这个对象是 ref 对象
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  });

  return reactive(wrapper);
}

function toRef(target, key) {
  const wrapper = {
    get value() {
      return target[key];
    },
    set value(newVal) {
      target[key] = newVal;
    }
  };

  // 通过定义一个不可枚举的属性 __v_isRef 来标识这个对象是 ref 对象
  Object.defineProperty(wrapper, '__v_isRef', {
    value: true
  });

  return reactive(wrapper);
}

function toRefs(target) {
  const ret = {};

  for (const key in target) {
    ret[key] = toRef(target, key);
  }

  return ret;
}

function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const val = Reflect.get(target, key, receiver);
      // 是 ref 对象，返回它的 value
      return val.__v_isRef ? val.value : val;
    },
    set(target, key, newValue, receiver) {
      const val = target[key];
      // 是 ref 对象，设置它的 value
      if (val.__v_isRef) {
        val.value = newValue;
        return true;
      }
      return Reflect.set(target, key, newValue, receiver);
    }
  });
}

const refVal1 = ref(1);
const refVal2 = reactive({
  value: 2
});

const state2 = reactive({
  age: 18,
  level: 1,
});
const ageRef = toRef(state2, 'age');
effect(() => {
  console.log('ageRef ===>', ageRef.value);
});

const stateRefs = toRefs(state2);
const {age} = {...stateRefs};
effect(() => {
  console.log('stateRefs age ===>', age.value);
});

ageRef.value = 20;


// 自动脱 ref
const count = ref(0);
const state3 = proxyRefs({
  count,
});

effect(() => {
  console.log('state3 ===>', state3.count);
});
count.value = 1;


