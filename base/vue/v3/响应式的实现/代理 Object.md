
对对象的读取操作
1. 访问属性: `obj.foo`
2. 判断对象或者原型上是否存在对应的 `key`: `key in obj`
3. `for ... in` 遍历


## 访问属性

通过 `get` 拦截实现

## 判断对象或者原型上是否存在对应的 key

[ecma-262/13.10.1 规范](https://tc39.es/ecma262/#sec-relational-operators-runtime-semantics-evaluation) 中 `in` 的 操作运算符是通过调用 `HasProperty` 的方法得到的, 因此可以通过 `has` 拦截器来实现

```js
const p = new Proxy(obj, {
  has(target, key) {
    track(target, key)
    return Reflect.has(target, key)
  }
})
```

[ecma-262/14.7.5.9 规范](https://tc39.es/ecma262/#sec-enumerate-object-properties)`for ... in` 的执行规则，最终是通过 `Reflect.ownKeys(obj)` 来获取自身的键的。

由于 `ownKeys` 方法无法获取 `key`， 因此需要通过 `Symbol` 来设置一个唯一值

```js
const p = new Proxy(obj, {
  ownKeys(target){
    track(target, Symbol())
    return Reflect.ownKeys(target)
  }
})
```

修改属性不会触发 `for ... in `, 但是新加的属性如何触发呢？无论新加还是修改都会触发 `set` 的拦截，那么在 `set` 拦截中加一个类型来区分是什么操作。如果是新增，则在 `trick` 中添加一个 `effectTask` 来触发 `for ... in`

```js
const type = Object.prototype.hasOwnProperty.call(target, key)? TriggerType.UPDATE: TriggerType.ADD;

trick(target, key, type);


function trick(target, key, type) {
  const _depMap = targetMap.get(target);
  if (!_depMap) return;
  
  // ...

  if(type === TriggerType.ADD){
    const iterateEffects = _depMap.get(ITERATE_KEY)
    iterateEffects && iterateEffects.forEach(effectFn => {
      if(effectFn !== activeEffect){
        effectTask.add(effectFn)
      }
    })
  }
  // ...
}
```

删除拦截

```js
    // 删除 操作符拦截
    deleteProperty(target, key) {
      // 判断属性是否存在
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const res = Reflect.deleteProperty(target, key);

      // 当被删除的属性存在，并且删除成功才触发更新
      if (hadKey && res) {
        trick(target, key, TriggerType.DELETE);
      }
      return res;
    },
```

新旧值是否相同，相同则不触发更新

```js
const p = new Proxy(obj, {
  set(target, key, newValue) {
    const oldValue = target[key];
    //   1 / oldValue === 1 / newValue NaN 的情况也可以通过这种形式判断
    if(oldValue === newValue && (oldValue === oldValue || newValue === newValue)){
      trick(target, key)
    }
  }
})
```

原型上的属性的改变引起的多次更新


```js
new Proxy(target, {
  get(target, key) {
    const res = Reflect.get(target, key);
    // 代理对象可以通过 raw 属性访问原始对象
    if(key === 'raw'){
      return target;
    }
    track(target, key);
    return res;
  },
  set(target, key, newValue, receiver) {
    // 如果 target === receiver.raw，则说明是修改了代理对象的属性，否则是修改了原型上的属性
    if(target === receiver.raw){
      trick(target, key);
    }
  }
})
```



