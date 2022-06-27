---
title: leetcode 19 删除链表的倒数第 n 个节点
date: 2022-02-09 14:40:33
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给你一个链表，删除链表的倒数第 `n` 个结点，并且返回链表的头结点。

## 示例 1：

```
输入：head = [1,2,3,4,5], n = 2
输出：[1,2,3,5]
```

## 示例 2：

```
输入：head = [1], n = 1
输出：[]
```

## 示例 3：

```
输入：head = [1,2], n = 1
输出：[1]
```

提示：

链表中结点的数目为 sz

- 1 <= sz <= 30
- 0 <= Node.val <= 100
- 1 <= n <= sz

进阶：你能尝试使用一趟扫描实现吗？

我们先来分析这个题目，如果用两个 `for` 循环是不是就很简单，第一次算出删除的下标，第二次就可以进行删除操作了，那用一个 `for` 循环怎么处理呢？一时之间难以下手，忽然间灵光一闪，两次循环每次用了一个指针，那可以可以用一次循环两个指针呢？如果用两个指针那他们之间的联系又是什么呢？

经过一波分析，发现当快指针走完链表的时候，可以让慢指针刚好到需要删除节点的位置，那他们中间就相差了 `n`，发现了他们的联系，我们整理一下思路

1. 空链表直接返回
2. 当 n 大于链表的长度的时候，我们之前返回这个链表
3. 当 n 小于链表长度，循环链表，直到快指针的下一个节点为 null, 我们就删除慢指针的下一个节点

这道题有了思路代码就比较简单了，我们直接整代码吧

```
/*
 * @lc app=leetcode.cn id=19 lang=javascript
 *
 * [19] 删除链表的倒数第 N 个结点
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
// 输入：head = [1,2,3,4,5], n = 2
// 输出：[1,2,3,5]
/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
  if (!head) return
  let ret = new ListNode(-1, head)
  let pre = ret
  let cur = ret.next
  // 一个指向虚拟头节点 pre，一个指向真实的节点 cur
  // cur 移动 n 步  实例 12345 当 cur 指向 null 的时候，pre 指向 3，相差2
  // pre 和 cur 一起移动，直到 cur 指向空
  // 然后删除
  let i = 0
  while (i < n) {
    cur = cur.next
    i++
  }
  if (!cur) return head.next
  while (cur) {
    pre = pre.next
    cur = cur.next
  }

  pre.next = pre.next.next

  return ret.next
};
// @lc code=end


```
