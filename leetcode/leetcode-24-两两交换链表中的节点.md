---
title: leetcode 24 两两交换链表中的节点
date: 2022-02-09 09:47:10
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。

## 示例 1：

```
输入：head = [1,2,3,4]
输出：[2,1,4,3]
```

## 示例 2：

```
输入：head = []
输出：[]
```

## 示例 3：

```
输入：head = [1]
输出：[1]
```

## 提示：

链表中节点的数目在范围 [0, 100] 内
0 <= `Node.val` <= 100

先理清楚一下思路

1. 如果是空链表直接返回 `null`
2. 由于我们需要操作头节点，因此设置一个虚拟头节点，即`let ret = new ListNode(-1, head)`
3. 两两交换一般呢都是需要三个变量来存储，`temp`, `pre`, `cur`
4. 返回 `ret.next`

我们首先用 `temp` 来存放一下我们新建立的链表，接着我们重点来看一下第三步，我们需要先循环链表，循环终止的条件就是这个链表的长度至少为 2 我们才交换，比如 `[1,2,3]`这样的链表，我们交换完前两个，发现还有一个节点，那我就不去去处理了，因此我们需要保证 `temp` 的后两个节点是存在的，即 `temp.next && temp.next.next` 存在

确定了循环条件，我们看下循环体的内容。我们用示例一的链表`[1,2,3,4]`来举例

确定初始位置

```
// temp -1 1 2 3 4
pre = temp.next;      // pre 1 2 3 4
cur = temp.next.next  // cur 2 3 4
```

开始两两交换链表, 把 1 指向 3，

```
pre.next = cur.next  // pre 1 3 4
cur.next = pre       // cur 2 1 3 4
temp.next = cur      //temp -1 2 1 3 4
// 重置 temp
temp = pre           //temp 1 3 4
```

```
/*
 * @lc app=leetcode.cn id=24 lang=javascript
 *
 * [24] 两两交换链表中的节点
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function(head) {
 if(!head) return null
 let ret = new ListNode(-1, head)
 let temp = ret
// 12345
 while (temp.next && temp.next.next) {
  let pre = temp.next // 12345
  let cur = temp.next.next // 2345
  pre.next = cur.next // pre 1 345
  cur.next = pre // cur 2 1345
  temp.next = cur // temp -1 21345
  temp = pre // tem 1345
 }
 return ret.next
};
pre 1 2 3 4
cur 234
pre 134
cur 2134
tem -1 2134
tem 134
// @lc code=end

```
