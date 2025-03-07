## 相同的前置和后置元素

包含预处理步骤，借鉴了纯本文 diff 算法的思路。在进行核心 diff 算法之前，对两段文本进行预处理。

```html
use vue for app
use react for app
```
只需要对 `vue` 和 `react` 进行替换

```html
i like you 
i like you too
```

预处理完之后发现，只需要添加 `too`

同理来处理元素节点

```html
<!--旧的-->
<p>1</p>
<p>2</p>
<p>3</p>

<!--新的-->
<p>1</p>
<p>4</p>
<p>2</p>
<p>3</p>
```

```js
function patchKeyedChildren(n1, n2, container){
  const newChildren = n2.children
  const oldChildren = n1.children
  
  let j = 0;
  let oldVnode = oldChildren[j]
  let newVnode = newChildren[j]
  // 更新相同的前置节点，向后遍历
  while(oldVnode.key === newVnode.key){
    // 打补丁更新
    patch(oldVnode, newVnode, container)
    // 更新索引，递增
    j++;
    oldVnode = oldChildren[j]
    newVnode = newChildren[j]
  }
  
  // 更新相同的后置节点，向前遍历
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1
  
  oldEndVnode = oldChildren[oldEndIndex]
  newEndVnode = newChildren[newEndIndex]
  while (oldVnode.key === newVnode.key){
    // 打补丁更新
    patch(oldVnode, newVnode, container)
    // 更新索引，递减
    oldEndIndex--;
    newEndIndex--;
    oldVnode = oldChildren[oldEndIndex]
    newVnode = newChildren[newEndIndex]
  }
  
  // 预处理结束后，
  if(j > oldEndIndex && j <= newEndIndex){
    // 结束 && 新的元素组里面有多余的节点 新增
    // 锚点的索引
    const anchorIndex = newEndIndex + 1
    // 锚点元素
    // 如果 anchorIndex < newChildren.length 说明锚点元素在新的一组元素里面，否则则说明， newEndIndex 已经是数组的最后一个元素了
    const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
    // 逐个挂载
    while (j<= newEndIndex){
      patch(null, newChildren[j++], container, anchor)
    }
  }else if(j > newEndIndex && j <= oldEndIndex){
    // 卸载多余的节点
    while (j <= oldEndIndex){
      unmount(oldChildren[j++])
    }
  }
}
```

## dom 移动的判断

前面的是比较理想化的状态，可以进行新增和卸载，

```html
<!--旧的-->
<p>1</p>
<p>2</p>
<p>3</p>
<p>4</p>
<p>6</p>
<p>5</p>

<!--新的-->
<p>1</p>
<p>3</p>
<p>4</p>
<p>2</p>
<p>7</p>
<p>5</p>
```

这个例子中只有相同的前置节点 1 和相同的后置节点 5， 但是中间的部分却无法处理。

```js
if(j > oldEndIndex && j <= newEndIndex){
  // 新增
}else if(j > newEndIndex && j <= oldEndIndex){
  // 移除  
}else{
  const count = newEndIndex - j + 1
  const source = new Array(count)
  source.fill(-1)
  
  let oldStartIndex = j
  let newStartIndex = j
  
  // 循环旧的节点
  for (let i = oldStartIndex; i < oldEndIndex; i++){
    const oldVnode = oldChildren[i]
    // 循环新的节点
    for (let k = newStartIndex; k <= newEndIndex; k++){
      const newVnode = newChildren[k]
       // 有相同 key 值的可复用节点
       if(oldVnode.key === newVnode.key){
         patch(oldVnode, newVnode, container)
         // 填充 source
         source[k - newStartIndex] = i
       }
    }
  }
}
```

通过建立索引表，来优化 2 层循环
```js
// 索引表 key: 新元素的 key 值，value: 新元素在新的一组子节点中的位置索引
const keyIndex = {}
for (let i = newStartIndex; i <= newEndIndex; i++){
  keyIndex[newChildren[i].key] = i
}

// 遍历旧的一组节点中未处理的节点
for (let i = oldStartIndex; i <= oldEndIndex; i++){
  oldVnode = oldChildren[i]
  // 通过索引表快速找到当前节点在新的一组子节点中的位置索引
  const k = keyIndex[oldVnode.key]
  if(typeof k !== 'undefined'){
    newVnode = newChildren[k]
    patch(oldVnode, newVnode, container)
    // 填充数组
    source[k - newStartIndex] = i
  } else{
    unmount(oldVnode)
  }
}
```

是否需要移动

```js
// 是否需要移动
let moved = false
// 遍历旧的一组子节点过程中遇到的最大索引值 k 值， 如果是递增的则不需要移动，否则需要移动
let pos = 0

if(k < pos){
  moved = true
}else{
  post = k
}
```

1. 构造一个 source 数组，用于记录新旧两组元素的对应关系，source 数组的长度就是未处理的节点数量，source 数组中的每个元素的值为**新的一组子节点中的节点在旧的一组子节点中的位置索引**，使用它计算出一个最长递增子序列，用于辅助完成 dom 的移动操作。上面的例子中，source 数组为 [2, 3, 1, -1]，新的一组 3 在旧的一组节点的索引位置为 2，4 在旧的一组节点的索引位置为 3，2 在旧的一组节点的索引位置为 1，7 在旧的一组节点没有找到则为为 -1。
2. 2 层循环来完成填充操作，第一层遍历旧的，第二层遍历新的
3. 2 层循环的优化 复杂度 O(n1 * n2) 变为 O(n1 + n2)
4. 判断是否需要移动
5. 判断是否需要卸载 已更新的节点数量大于新的一组中需要更新的节点数量则需要卸载

```js
function patchKeyedChildren(n1, n2, container){
   // ...  
  // 预处理结束后，
  if(j > oldEndIndex && j <= newEndIndex){

  }else if(j > newEndIndex && j <= oldEndIndex){
   
  }else{
    // dom 移动的判断
    
    const count = newEndIndex - j + 1
    const source = new Array(count)
    source.fill(-1)

    let oldStartIndex = j
    let newStartIndex = j

    // 索引表 key: 新元素的 key 值，value: 新元素在新的一组子节点中的位置索引
    const keyIndex = {}
    for (let i = newStartIndex; i <= newEndIndex; i++){
      keyIndex[newChildren[i].key] = i
    }

    // 是否需要移动
    let moved = false
    // 遍历旧的一组子节点过程中遇到的最大索引值 k 值， 如果是递增的则不需要移动，否则需要移动
    let pos = 0
    
    // 更新过的节点数量
    let patched = 0;

    // 遍历旧的一组节点中未处理的节点
    for (let i = oldStartIndex; i <= oldEndIndex; i++){
      oldVnode = oldChildren[i]
      
      if(patched <= count){
        // 通过索引表快速找到当前节点在新的一组子节点中的位置索引
        const k = keyIndex[oldVnode.key]
        if(typeof k !== 'undefined'){
          newVnode = newChildren[k]
          patch(oldVnode, newVnode, container)
          // 填充数组
          source[k - newStartIndex] = i
          // 更新过的节点数量
          patched++

          // 判断节点是否需要移动
          if(k < pos){
            moved = true
          }else{
            post = k
          }
        } else{
          unmount(oldVnode)
        }
      }else{
        // 更新过的节点数量 > 需要更新的节点数量，则卸载
        unmount(oldVnode)
      }
    }
  }
}
```

1. 判断是否需要移动
2. 构建 source 数组，存储去除相同的前置/后置节点后，新的一组子节点在旧的一组子节点中的位置索引
    
## 如何移动

`source = [2, 3, 1, -1]` ,最长递增子序列为 [2, 3], 返回的是对应的索引，[0 ,1]

```js
if(moved){
  // 计算最长递增子序列
  const seq = lis(source) // [0, 1]
  // s 指向 最长递增子序列的最后一个元素
  let s = seq.length - 1
  // i 指向 新一组子节点的最后一个元素
  let i = count - 1
  // 从 source 最后一个元素开始，倒序遍历 source 数组
  for(i; i >= 0; i--){
    if(source[i] === -1){
      // 说明是全新节点，
      
      // 获取当前节点的真实索引 （source 的最后一个索引 + 前置相同的下一个元素的索引）
      const pos = i + newStartIndex
      const newVnode = newChildren[pos]
      // 下一个节点的索引
      const nextPos = pos + 1
      // 设置锚点 判断是否是最后一个
      const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
      patch(null, newVnode, container, anchor)
    }else if(i !== seq[s]){
      // 说明需要移动
      const pos = i + newStartIndex
      const newVnode = newChildren[pos]
      // 下一个节点的索引
      const nextPos = pos + 1
      // 设置锚点 判断是否是最后一个
      const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
      // 移动
      insert(newVnode.el, container, anchor)
    }else{
      // 说明 i === seq[s] 不需要移动
      s--
    }
  }
}
```

## 总结

1. 借鉴 diff 中预处理的思路，先判断前置/后置节点是否相同
2. 如果无法简单的通过挂载新节点/卸载不存在的节点来完成更新，根据节点建立索引关系表，构造一个最长递增的子序列
3. 最长递增的子序列所指向的节点，即不需要移动的节点
