---
title: 'set 和 map '
author: 白菜
date: '2022-05-17 14:08:33'
categories:
  - JavaScript
tags:
  - ES6
meta:
  - name: description
    content: 'JavaScript 前端 ES6 set 和 map '
  - name: keywords
    content: 'JavaScript 前端 ES6 set 和 map '
#issueId:
---

:::tip
  Set 和 Map 的增删查，以及遍历方法。
:::

<!-- more -->

## Set

`ES6` 提供了新的数据结构 `Set`。它类似于数组，但是成员的值都是唯一的，没有重复的值。

`Set` 本身是一个构造函数，用来生成 `Set` 数据结构。

`Set` 函数可以接受一个数组（或者具有 `iterable` 接口的其他数据结构）作为参数，用来初始化。

### 用法

由于 `Set` 成员的值都是唯一的，他可以用来去重。

```javascript
let set = new Set([1, 2, 3, 3, 4]);
console.log(set); // Set(4) {1, 2, 3, 4}

// Array.from方法可以将 Set 结构转为数组。
Array.from(set)); // [1, 2, 3, 4]

[...new Set('ababbc')].join(''); // 'abc'

set = new Set(document.querySelectorAll('div'));
console.log(set.size); // 88

set = new Set(new Set([1, 2, 3, 4]));
console.log(set.size); // 4
```

### 属性和方法

![alt](./../public/images/2022/ES6/set_01.png 'set.prototype')

属性：

- Set.prototype.constructor：构造函数，默认就是 Set 函数。
- Set.prototype.size：返回 Set 实例的成员总数。

操作方法：

- Set.prototype.add(value)：添加某个值，返回 Set 结构本身。
- Set.prototype.delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
- Set.prototype.has(value)：返回一个布尔值，表示该值是否为 Set 的成员。
- Set.prototype.clear()：清除所有成员，没有返回值。

```javascript
let set = new Set();
console.log(set.add(1).add(2)); // Set [ 1, 2 ]

console.log(set.delete(2)); // true
console.log(set.has(2)); // false

console.log(set.clear()); // undefined
console.log(set.has(1)); // false
```

遍历方法：

- Set.prototype.keys()：返回键名的遍历器
- Set.prototype.values()：返回键值的遍历器
- Set.prototype.entries()：返回键值对的遍历器
- Set.prototype.forEach()：使用回调函数遍历每个成员

```javascript
let set = new Set(['a', 'b', 'c']);
console.log(set.keys()); // SetIterator {"a", "b", "c"}
console.log([...set.keys()]); // ["a", "b", "c"]

console.log(set.values()); // SetIterator {"a", "b", "c"}
console.log([...set.values()]); // ["a", "b", "c"]

console.log(set.entries()); // SetIterator {"a", "b", "c"}
console.log([...set.entries()]); // [["a", "a"], ["b", "b"], ["c", "c"]]
```

![alt](../../docs/public/images/2022/ES6/set_02.png 'set')

```javascript
let set = new Set(['a', 'b', 'c']);
set.forEach((value, key) => console.log(key + ': ' + value));
// a: a
// b: b
// c: c

[...set].forEach((value, key) => console.log(key + ': ' + value));
// 0: a
// 1: b
// 2: c
```

## Map

`ES6` 提供了新的数据结构 `Map` 。它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键，即“值—值”的对应。

### 用法

```javascript
const map = new Map([
  ['name', 'wxb'],
  ['title', 'map'],
]);

console.log(map); // Map(2) {'name' => '张三', 'title' => 'Author'}
map.size; // 2
map.has('name'); // true
map.get('name'); // "wxb"
map.has('title'); // true
map.get('title'); // "map"
```

上面的用法相当于

```javascript
const items = [
  ['name', 'wxb'],
  ['title', 'map'],
];

const map = new Map();

items.forEach(([key, value]) => map.set(key, value));
```

### 属性和方法

![alt](../../docs/public/images/2022/ES6/map_01.jpg 'map.prototype')

属性：

- Map.prototype.constructor：构造函数，默认就是 Map 函数。
- Map.prototype.size：返回 Map 实例的成员总数。

操作方法：

- Map.prototype.set(key, value)：添加某键值对，返回 Map 结构本身。如果 key 已经有值，则键值会被更新，否则就新生成该键。
- Map.prototype.get(key)：返回获取某个键对应的值。如果找不到 key，返回 undefined。
- Map.prototype.delete(value)：删除某个值，返回一个布尔值，表示删除是否成功。
- Map.prototype.has(value)：返回一个布尔值，表示该值是否为 Map 的成员。
- Map.prototype.clear()：清除所有成员，没有返回值。

```javascript
let map = new Map();
console.log(map.set('a', 'a1').set('a', 'a2')); // map  'a' => 'a2'

console.log(map.has(2)); // false
console.log(map.get(2)); // undefined
console.log(map.get('a')); // a2
console.log(map.delete(2)); // false
console.log(map.delete('a')); // true
console.log(map.clear()); // undefined
```

上面代码对键 `a` 连续赋值两次，后一次的值覆盖前一次的值。

遍历方法：

- Map.prototype.keys()：返回键名的遍历器。
- Map.prototype.values()：返回键值的遍历器。
- Map.prototype.entries()：返回所有成员的遍历器。
- Map.prototype.forEach()：遍历 Map 的所有成员。

```javascript
const map = new Map([
  ['F', 'no'],
  ['T', 'yes'],
]);

for (let key of map.keys()) {
  console.log(key);
}
// "F"
// "T"

for (let value of map.values()) {
  console.log(value);
}
// "no"
// "yes"

for (let item of map.entries()) {
  console.log(item[0], item[1]);
}
// "F" "no"
// "T" "yes"

// 或者
for (let [key, value] of map.entries()) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"

// 等同于使用map.entries()
for (let [key, value] of map) {
  console.log(key, value);
}
// "F" "no"
// "T" "yes"
```

`Map` 结构转为数组结构

```javascript
const map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

console.log(map); // Map(3) {1 => 'one', 2 => 'two', 3 => 'three'}
console.log(map.keys); // MapIterator {1, 2, 3}
console.log([...map.keys()]); // [1, 2, 3]
```
