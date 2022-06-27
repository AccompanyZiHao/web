---
title: leetcode 83 删除排序链表中的重复元素
date: 2022-02-09 15:56:35
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给定一个已排序的链表的头 `head` ， 删除所有重复的元素，使每个元素只出现一次 。返回已排序的链表 。

## 示例 1：

```
输入：head = [1,1,2]
输出：[1,2]
```

## 示例 2：

```
输入：head = [1,1,2,3,3]
输出：[1,2,3]
```

## 提示：

- 链表中节点数目在范围 [0, 300] 内
- -100 <= Node.val <= 100
- 题目数据保证链表已经按升序排列

由于这是一个有序的链表，我们只是做个去重。

思路分析：

1. 链表为空，返回 `null`
2. 定义快慢指针，快指针比慢指针多走一步，如果快指针的值与慢指针的值相等就让快指针往下走；如果不相等则慢指针的 `next` 指向 快指针，慢指针也指向快指针，快指针往下走一步
3. 当快指针指向 `null`的时候，说明链表已经走完了，此事的慢指针 `next` 也需要指向 `null`

下面我们用示例 2 来分析一下

```
// 输入：head = [1,1,2,3,3]
// 输出：[1,2,3]
// 初始时
pre = head         // pre 1 1 2 3 3
cur = head.next    // cur   1 2 3 3

第一轮 值相等， per 原地不动，cur 往下走
// pre 1 1 2 3 3
// cur   2 3 3
第二轮
// 值不相等的时候 移动 pre
if(pre.val != cur.val){
  pre.next = cur // pre  1 2 3 3
  pre = cur // pre 2 3 3
}
cur = cur.next
// cur 3 3

第三轮 值相等， per 原地不动，cur 往下走
// pre 3 3
// cur 3
第四轮 cur 为 null 链表走完，结束之后 pre.next == null
// pre 3
// cur null
pre.next == null
```

## solution

```
/*
 * @lc app=leetcode.cn id=83 lang=javascript
 *
 * [83] 删除排序链表中的重复元素
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
  let pre = head
  let cur = head.next
  while (cur) {
    if(pre.val != cur.val){
      pre.next = cur
      pre = cur
    }
    cur = cur.next
  }
  pre.next = null
  return head
};
// @lc code=end

```
