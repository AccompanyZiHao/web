
## 原理

双端算法：对新旧两组子节点的两个端点进行比较。因此需要 4 个索引

```js
function patchKeyedChildren(n1, n2, container){
  const oldChildren = n1.children
  const newChildren = n2.children
  
  // 定义索引
  let oldStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newStartIndex = 0
  let newEndIndex = newChildren.length - 1
  
  // 索引指向的 vnode 节点
  let oldStartVnode = oldChildren[oldStartIndex]
  let oldEndVnode = oldChildren[oldEndIndex]
  let newStartVnode = newChildren[newStartIndex]
  let newEndVnode = newChildren[newEndIndex]
  
  while (oldStartIndex <= oldEndIndex || newStartIndex <= newEndIndex){
    if(oldStartVnode.key === newStartVnode.key){
      // 都是头部节点，不需要移动，直接打补丁
      patch(oldStartVnode, newStartVnode, container)
      // 更新索引并指向下一个位置
      oldStartVnode = oldChildren[++oldStartVnode]
      newStartIndex = newChildren[++newStartIndex]
    }else if(oldEndVnode.key === newEndVnode.key){
      // 都是尾部节点，不需要移动，直接打补丁
      patch(oldEndVnode, newEndVnode, container)
      // 更新索引并指向下一个位置
      oldEndVnode = oldChildren[--oldStartVnode]
      newEndVnode = newChildren[--newStartIndex]
    }else if(oldStartVnode.key === newEndVnode.key){
      patch(oldEndVnode, newEndVnode, container)
      // 移动 dom 把旧的头部节点对应的真实 dom (oldStarVnode.el) 移动到旧的尾部节点对应的真实 dom (oldEndVnode.el) 的后面
      insert(oldStartVnode.el, container, oldEndVnode.el.nextSibling)
      // 更新索引并指向下一个位置
      oldEndVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[--oldStartIndex]
    }else if(oldEndVnode.key === newStartVnode.key){
      patch(oldEndVnode, newEndVnode, container)
      // 移动 dom， 将 oldEndVnode.el 移动到 oldStartVnode.el 前面
      insert(oldEndVnode.el, container, oldStartVnode.el)
      // 更新索引并指向下一个位置
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }
  }
}

```

## 优势

```html
<!--旧的-->
<p>1</p>
<p>2</p>
<p>3</p>

<!--新的-->
<p>3</p>
<p>1</p>
<p>2</p>
```

简单的 `diff` 算法需要移动 2 次（把 1 移动到 3 的后面，再把 2 移动到 1 的后面），而双端则需要移动一次（把 3 移动到 1 的前面）

## 非理想状况的处理

理想情况下，每一轮都会命中 4 个步骤中的一个。如下面的例子，无法命中任何一步。

```html
<!--旧的-->
<p>1</p>
<p>2</p>
<p>3</p>
<p>4</p>

<!--新的-->
<p>2</p>
<p>4</p
<p>1</p>
<p>3</p>
```
尝试看非头部，非尾部的节点能否复用。用新的一组的子节点的头部节点去旧的一组的子节点中查找。如果找到，我们就把这个索引存储起来。

```js
while (oldStartIndex <= oldEndIndex || newStartIndex <= newEndIndex){
    if(oldStartVnode.key === newStartVnode.key){
      
    }else if(oldEndVnode.key === newEndVnode.key){
      
    }else if(oldStartVnode.key === newEndVnode.key){
      
    }else if(oldEndVnode.key === newStartVnode.key){
      
    }else{
      // 在旧的节点中寻找，与 newStartVnode 拥有相同 key 的元素
      const idxInOld = oldChildren.findIndex(node => node.key === newStartVnode.key)
      // 说明找到了，需要将其对应的真实 dom 移动到头部，并且把旧的节点设置为 undefined
      if(idxInOld > 0){
        const vnodeMove = oldChildren[idxInOld]
        // 打补丁
        patch(vnodeMove, newStartVnode, container)
        // 把找到的节点对应的真实 dom 移动到头部之前
        insert(vnodeMove.el, container, oldStartVnode.el)
        // 由于处于 idxInOld 位置的节点已被移走，这里设置为 undefined
        oldStartVnode[idxInOld] = undefined
        // 更新新的元素的开始索引
        newStartVnode = newChildren[++newStartIndex]
      }
    }
  }
```

由于把旧的头部节点设置为了 `undefined`，说明我们已经处理过这个节点了，遇到了之后就不需要在处理了

```js
if(!oldStartVnode){
  oldStartVnode = oldChildren[++oldStartIndex]
}else if(!oldEndVnode){
  oldEndVnode = oldChildren[--oldEndIndex]
}
```

## 添加新元素

当 `indInOld > 0` 不成立时，说明  `newStartVnode` 是个新节点

### 场景一 双端 4 个元素比较都不相同
```html
<!--旧的-->
<p>1</p>
<p>2</p>
<p>3</p>

<!--新的-->
<p>4</p>
<p>1</p>
<p>3</p>
<p>2</p>
```

```js
if(idxInOld > 0){
  
}else{
  // 将 newStartVnode 作为新节点挂载到头部，把当前的头部节点 oldStartVnode.el 座位锚点
  patch(null, newStartVnode, container, oldStartVnode.el)
  newStartVnode = newChildren[++newStartIndex]
}
```

### 场景二 双端 4 个元素的比较符合其中一步
```html
<!--旧的-->
<p>1</p>
<p>2</p>
<p>3</p>

<!--新的-->
<p>4</p>
<p>1</p>
<p>2</p>
<p>3</p>
```

这个时候，通过双端的算法会把其中一个新增的 4 给漏掉，因此在循环结束之后，需要再检查一下

```js
while (oldStartIndex <= oldEndIndex || newStartIndex <= newEndIndex){
  // ...
}

if(oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex){
  // 说明有遗漏，遗漏的元素个数为 n = newEndIndex - newStartIndex, 挂载的锚点则是 oldStartVnode.el
  for (let i = newStartIndex; i<= newEndIndex; i++){
    patch(null, newChildren[i], container, oldStartVnode.el)
  }
}
```

## 移除新元素

```js
if(oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex){
  // 新增
}else if(newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex){
  // 删除
  for(let i = oldEndIndex; i<= oldEndIndex; i++){
    unmount(oldChildren[i])
  }
}
```

完整代码
```js
function patchKeyedChildren(n1, n2, container){
  const oldChildren = n1.children
  const newChildren = n2.children
  
  // 定义索引
  let oldStartIndex = 0
  let oldEndIndex = oldChildren.length - 1
  let newStartIndex = 0
  let newEndIndex = newChildren.length - 1
  
  // 索引指向的 vnode 节点
  let oldStartVnode = oldChildren[oldStartIndex]
  let oldEndVnode = oldChildren[oldEndIndex]
  let newStartVnode = newChildren[newStartIndex]
  let newEndVnode = newChildren[newEndIndex]
  
  while (oldStartIndex <= oldEndIndex || newStartIndex <= newEndIndex){
    if(!oldStartVnode){
      oldStartVnode = oldChildren[++oldStartIndex]
    }else if(!oldEndVnode){
      oldEndVnode = oldChildren[--oldEndIndex]
    }else if(oldStartVnode.key === newStartVnode.key){
      // 都是头部节点，不需要移动，直接打补丁
      patch(oldStartVnode, newStartVnode, container)
      // 更新索引并指向下一个位置
      oldStartVnode = oldChildren[++oldStartVnode]
      newStartIndex = newChildren[++newStartIndex]
    }else if(oldEndVnode.key === newEndVnode.key){
      // 都是尾部节点，不需要移动，直接打补丁
      patch(oldEndVnode, newEndVnode, container)
      // 更新索引并指向下一个位置
      oldEndVnode = oldChildren[--oldStartVnode]
      newEndVnode = newChildren[--newStartIndex]
    }else if(oldStartVnode.key === newEndVnode.key){
      patch(oldEndVnode, newEndVnode, container)
      // 移动 dom 把旧的头部节点对应的真实 dom (oldStarVnode.el) 移动到旧的尾部节点对应的真实 dom (oldEndVnode.el) 的后面
      insert(oldStartVnode.el, container, oldEndVnode.el.nextSibling)
      // 更新索引并指向下一个位置
      oldEndVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[--oldStartIndex]
    }else if(oldEndVnode.key === newStartVnode.key){
      patch(oldEndVnode, newEndVnode, container)
      // 移动 dom， 将 oldEndVnode.el 移动到 oldStartVnode.el 前面
      insert(oldEndVnode.el, container, oldStartVnode.el)
      // 更新索引并指向下一个位置
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }else{
      // 在旧的节点中寻找，与 newStartVnode 拥有相同 key 的元素
      const idxInOld = oldChildren.findIndex(node => node.key === newStartVnode.key)
      // 说明找到了，需要将其对应的真实 dom 移动到头部，并且把旧的节点设置为 undefined
      if(idxInOld > 0){
        const vnodeMove = oldChildren[idxInOld]
        // 打补丁
        patch(vnodeMove, newStartVnode, container)
        // 把找到的节点对应的真实 dom 移动到头部之前
        insert(vnodeMove.el, container, oldStartVnode.el)
        // 由于处于 idxInOld 位置的节点已被移走，这里设置为 undefined
        oldStartVnode[idxInOld] = undefined
        // 更新新的元素的开始索引
        newStartVnode = newChildren[++newStartIndex]
      }else{
        // 新增
        // 将 newStartVnode 作为新节点挂载到头部，把当前的头部节点 oldStartVnode.el 座位锚点
        patch(null, newStartVnode, container, oldStartVnode.el)
        newStartVnode = newChildren[++newStartIndex]
      }
    }
  }

  if(oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex){
    // 新增
    // 说明有遗漏，遗漏的元素个数为 n = newEndIndex - newStartIndex, 挂载的锚点则是 oldStartVnode.el
    for (let i = newStartIndex; i<= newEndIndex; i++){
      patch(null, newChildren[i], container, oldStartVnode.el)
    }
  }else if(newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex){
    // 删除
    for(let i = oldEndIndex; i<= oldEndIndex; i++){
      unmount(oldChildren[i])
    }
  }
}
```

## 总结

对简单 `diff` 算法的 `dom` 的移动进行了优化。

每次循环尝试匹配四种情况：
- 头部节点匹配：直接打补丁并更新索引。
- 尾部节点匹配：直接打补丁并更新索引。
- 旧头部与新尾部匹配：移动 `DOM` 并更新索引。
- 旧尾部与新头部匹配：移动 `DOM` 并更新索引。

找不到则用新元素数组的第一个节点与旧的元素进行匹配，配不到则为新增，匹配到则移动 `dom` 并更新索引。

双端循环结束，如果 `oldEndIndex < oldStartIndex && newStartIndex <= newEndIndex` 则说明有遗漏的新增元素，需要挂载。

如果 `newEndIndex < newStartIndex && oldStartIndex <= oldEndIndex` 则说明有遗漏的删除元素，需要删除。

