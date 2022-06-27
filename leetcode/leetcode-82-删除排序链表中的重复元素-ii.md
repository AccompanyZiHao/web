---
title: leetcode 82 删除排序链表中的重复元素 ii
date: 2022-02-09 16:32:18
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给定一个已排序的链表的头 `head` ， 删除原始链表中所有重复数字的节点，只留下不同的数字。返回已排序的链表 。

## 示例 1：

```
输入：head = [1,2,3,3,4,4,5]
输出：[1,2,5]
```

## 示例 2：

```
输入：head = [1,1,1,2,3]
输出：[2,3]
```

## 提示：

- 链表中节点数目在范围 [0, 300] 内
- -100 <= Node.val <= 100
- 题目数据保证链表已经按升序 排列

我们先来分析

1. 链表为空，返回 null
2. 由于可能链表的前两个重复，那就需要操作头节点，因此我们搞个虚拟头节点 `let ret = new ListNode(-1, head)`
3. 定义两个指针来循环这个链表， `pre = ret`, `cur = ret.next`
4. 当慢指针的值不等于快指针的值即`pre.val != cur.val`，那快慢指针就各自走一步；如果相等，慢指针原地休息，快指针往后走，走到不想等时候， 慢指针指向快指针

我们用示例 2 的例子来演示一下

```
let pre = ret        // pre -1,1,1,1,2,3
let cur = ret.next   // cur    1,1,1,2,3
第一轮 pre.next.val == cur.next.val 值相等，快指针向后走，直到他们值不等
while (cur && cur.next && pre.next.val == cur.next.val) {
  cur = cur.next
}
1.1 轮
// pre -1 1 1 1 2 3
// cur 1 1 2 3
1.2 轮
// pre -1 1 1 1 2 3
// cur 1 1 2 3
1.3 轮
// pre -1 1 1 1 2 3
// cur 1 2 3
此时值不相等跳出当前循环
pre.next = cur.next
cur = cur.next
// pre -1 2 3
// cur 2 3
第二轮 值不等
// pre 2 3
// cur 3
第三轮 值不等
// pre 3
// cur null
```

## solution

```
/*
 * @lc app=leetcode.cn id=82 lang=javascript
 *
 * [82] 删除排序链表中的重复元素 II
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
var deleteDuplicates = function(head) {
  if(!head) return null
  let ret = new ListNode(-1, head)
  // pre 的下一个等于 cur 下一个, 移动 cur，不相等 pre.next 指向 cur.next
  // 不相等往后移
  let pre  = ret
  let cur = ret.next
  while (cur && cur.next) {
    if(pre.next.val == cur.next.val){
      while (cur && cur.next && pre.next.val == cur.next.val) {
        cur = cur.next
      }
      pre.next = cur.next
      cur = cur.next
    }else{
      cur = cur.next
      pre = pre.next
    }
  }
  return ret.next
};
// @lc code=end


```
