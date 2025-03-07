## 1. 减少 dom 操作的性能开销

标签相同，只需要更新标签的文本内容，不需要先卸载，再挂载，

新旧节点的数量不同，跟新较短的那一组，剩下的挂载或者卸载。

```html
<!-- 旧的节点-->
<p>1</p>
<p>2</p>
<p>3</p>

<!-- 新的节点-->
<p>4</p>
<p>5</p>
<p>6</p>
```

### 节点数量相同：

如果进行先卸载载更新，需要执行 6 次 `dom` 操作，而 `diff` 算法只需要执行 3 次 `dom` 操作。

### 节点数量不同：

1. 旧的节点多，那么就把旧的节点给卸载了 `unmount`
2. 新的节点多，那么就把新的节点给挂载了 `mount`

节点数量不同的时候，应该遍历节点数量少的节点，然后进行打补丁操作。

```js
function patchChildren(n1,n2,container){
  if(typeof n2.children === 'string'){
    // ...
  }else if(Array.isArray(n2.children)){
    // 新节点是数组
    // 旧节点也是数组
    if(Array.isArray(n1.children)){
      // 先全部卸载 再从新挂载
      // n1.children.forEach(c => unmount(c))
      // n2.children.forEach(c => patch(null, c, container))
      // 可使用 diff 算法优化
      const oldChildren = n1.children
      const newChildren = n2.children
      const oldLen = oldChildren.length
      const newLen = newChildren.length
      // 最短的子节点长度
      const commonLength = Math.min(oldLen, newLen)
      for(let i = 0; i <= commonLenth; i ++){
        patch(oldChildren[i], newChildren[i], container)
      }
      // 挂载新的节点 
      if(newLen > oldLen){
        for(let i = commonLenth; i <= newLen; i ++){
          patch(null, newChildren[i], container)
        }
      }else if(newLen < oldLen){
        // 卸载旧的的节点
        for(let i = commonLenth; i <= newLen; i ++){
          unmount(oldChildren[i])
        }
      }
    }else{
      // 旧节点要么是文本子节点，要么不存在, 
      // 先清空，然后将新的一组子节点逐个挂载
      setElementText(container, '')
      n2.children.forEach(c => patch(null, c, container))
    }
  }else{
    // ...
  }
}
```

## 2. Dom 复用与 key 的作用

当 `vnode` 的 `type` 和 `key` 都相同，那么我们就认为它们两个是相同的，即可以复用。比如新旧节点的顺序错乱的时候。

`dom` 可以复用，并不意味着不需要更新。

```js
const oldVnode = {type: 'p', key: 1, children: 'baicai 1'}
const newVnode = {type: 'p', key: 1, children: 'baicai 2'}
```

上面的代码仍需要通过打补丁的操作, 先打完补丁，然后再移动到对应的位置。

```js
const oldVnode = {type: 'div', children: [ 
    {type: 'p', key: 1, children: 'baicai 1'},
    {type: 'p', key: 2, children: 'baicai 2'},
    {type: 'p', key: 3, children: 'baicai 3'}
  ]}

const newVnode = {type: 'div', children: [ 
    {type: 'p', key: 3, children: 'hello'},
    {type: 'p', key: 1, children: 'baicai 1'},
    {type: 'p', key: 2, children: 'baicai 2'},
  ]}

render.render(oldVnode, document.querySelector('#app'))

setTimeout(()=>{
  render.render(newVnode, document.querySelector('#app'))
}, 1000)
```

1 秒之后，`key` 为 3的节点的值将会由 `baicai 3` 变为 `hello`。

1. 在新的节点数组中取第一个，找到 `key` 为 3 的节点，尝试在旧的节点中寻找具有相同 `key` 的节点，如果找到了，就进行打补丁操作，把 `key` 为 3 的虚拟节点对应的 dom 的文本内容进行更改
2. 在新的节点数组中取第二个，找到 `key` 为 2 的节点，尝试在旧的节点中寻找具有相同 `key` 的节点，如果找到了，就进行打补丁操作，发现他们的值是一样的，就不会操作
3. 在新的节点数组中取第三个，找到 `key` 为 1 的节点，同第二步

跟新完之后，发现 `key` 为 3 的节点，它的值变成了 `hello`，但是它对应真实的 `dom` 并没有移动，节点的位置顺序仍然保持着旧的节点的位置。

## 3.找到需要移动的元素

```js
const oldVnode = {type: 'div', children: [ 
  {type: 'p', key: 1, children: 'baicai 1'},
  {type: 'p', key: 2, children: 'baicai 2'},
  {type: 'p', key: 3, children: 'baicai 3'}
]}
const newVnode = {type: 'div', children: [ 
  {type: 'p', key: 3, children: 'baicai 3'},
  {type: 'p', key: 2, children: 'baicai 2'},
  {type: 'p', key: 1, children: 'hello'}
]}
```

设置初始值 `let lastIndex = 0`

循环旧节点，如果旧节点的索引小于 `lastIndex` 则说明节点需要引动，否则，就把当前的索引复制给 `lastIndex`

```js

function patchChildren(n1, n2, container){
  if(typeof n2.children === 'string'){
    // ...
  }else if(Array.isArray(n2.children)){
    const oldChildren = n1.children
    const newChildren = n2.children
    const oldLen = oldChildren.length
    const newLen = newChildren.length
    // 存储寻找过程中的最大索引值
    let lastIndex = 0
    for(let i = 0; i< newLen; i++){
      const newVnode = newChildren[i]
      for(let j=0; j< oldLen; j++){
        const oldVnode = oldChildren[i]
        // 具有相同的 key 需要打补丁
        if(newVode.key === oldVnode.key){
          path(oldVnode, newVnode, container)
          if(j < lastIndex){
            // 旧节点的索引小于最大索引， 该节点需要移动
          }else{
            // 不需要移动 更新 lastIndex
            lastIndex = j
          }
          break;
        }
      }
    }

  }else{
    // ...
  }
}
```

## 4. 如何移动元素

移动节点：移动一个虚拟节点对应的真实 `DOM` 节点，而不是移动虚拟节点本身。

虚拟节点和真实节点的关系：一个虚拟节点被挂载后，它的真实 `DOM` 会储存在它的 `vnode.el` 属性中。

通过旧节点获取真的的 `DOM`

```js
function pathcElement(n1, n2){
  // 新的 vnode 也引用真实的 dom 元素 即 dom 元素的复用
  const el = n2.el = n1.el
  //   ...
}
```

```js

if(j < lastIndex){
  // 旧节点的索引小于最大索引， 该节点需要移动
  // 获取 newVnode 的前一个
  const preVnode = newChildren[i -1]
  // 如果不存在，说明它是第一个不需要移动，
  if(preVnode){
    // 将该节点移动到 preVnode 所对应的真实 DOM 的后面
    // 将 preVnode 所对应真实 DOM 的下一个兄弟节点 作为锚点
    const anchor = preVnode.el.nextSibling
    // 将该节点插入到 newVnode 对应的 DOM 里面
    insert(newVnode.el, container, anchor)
  }
}else{
  // 不需要移动 更新 lastIndex
  lastIndex = j
}

function insert(el, parent, anchor = null){
  parent.insertBefore(el, anchor)
}
```

## 5. 添加新元素

找到新增节点，并将其挂载到正确的位置

```js

for(let i = 0; i< newLen; i++){
  const newVnode = newChildren[i]
  // 定义一个初始值, 表示没有在 旧的节点中找到可以复用的
  let find = false
  for(let j=0; j< oldLen; j++){
    const oldVnode = oldChildren[i]
    const oldVnode = oldChildren[i]
    // 具有相同的 key 需要打补丁
    if(newVode.key === oldVnode.key){
      // 找到了
      find = true
      // ...
    }
  }
  // 没找到，需要添加
  if(!find){
    // 获取 newVnode 的前一个
    const preVnode = newChildren[i -1]
    let anchor = null
    if(preVnode){
      // 不是第一个节点，那么就使用前一个节点的 下一个兄弟元素作为锚点元素
      anchor = preVnode.el.nextSibling
    }else{
      // 说明是第一个节点，就使用容器的 firstChild 作为锚点元素
      anchor = container.firstChild
    }
    // 挂载, patch 方法需要添加一个参数 锚点元素
    patch(null, newVnode, container, anchor)
  }
}
```

## 6.移除不存在的元素

这个就很简单了，判断新的节点里面是否含有当前旧节点元素，如果没有，就卸载 `unmount(oldVnode)`

## 小结

遍历新旧两组组结点的数量较多的那一组，逐个调用 `patch` 函数进行打补丁，比较两组的子节点的数量，新的一组子节点多则需要挂载，否则需要卸载。

渲染器通过 `key` 找到可复用的结点，通过 `dom` 移动来完成更新，避免过多的对 `dom` 进行销毁和重建。

移动节点：拿新的一组子节点去旧的一组子节点中去寻找可以复用的结点，找到了，记录该位置的索引，把它称为最大索引，如果旧节点的索引小于最大索引，说明该结点需要移动。

简单 `diff` 算法是利用节点的 `key` 属性，尽可能的复用 `dom` 元素，并通过移动 `dom` 的方式来完成更新，从而减少不断创建和销毁 `dom` 元素带来的性能开销。 
