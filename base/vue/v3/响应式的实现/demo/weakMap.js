const map = new Map();
const weakMap = new WeakMap();

(function (){
  const obj = {
    age: 18
  }

  const obj2 = {
    age: 40
  }

  map.set(obj, 1)
  weakMap.set(obj2, 2)
})()

// 可以获取到对应的 key
console.log(map.keys());
// 无法获取到对应的 key
console.log(weakMap);
