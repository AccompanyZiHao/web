---
title: leetcode 141.环形链表
date: 2022-01-24 17:06:34
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给你一个链表的头节点 `head` ，判断链表中是否有环。

如果链表中有某个节点，可以通过连续跟踪 `next` 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 `pos` 来表示链表尾连接到链表中的位置（索引从 0 开始）。如果 `pos` 是 -`1，则在该链表中没有环。注意：pos` 不作为参数进行传递，仅仅是为了标识链表的实际情况。

如果链表中存在环，则返回 `true` 。 否则，返回 `false` 。

## 示例 1：

![alt](./../public/images/2022/leetcode/link-list01.jpg)

```
输入：head = [3,2,0,-4], pos = 1
输出：true
```

解释：链表中有一个环，其尾部连接到第二个节点。

## 示例 2：

![alt](./../public/images/2022/leetcode/link-list03.jpg)

```
输入：head = [1,2], pos = 0
输出：true
```

解释：链表中有一个环，其尾部连接到第一个节点。

## 示例 3：

![alt](./../public/images/2022/leetcode/link-list02.jpg)

```
输入：head = [1], pos = -1
输出：false
```

解释：链表中没有环。

这道题可以理解为我们小时候常做的一道数学题，小白每分钟跑 100 米，小菘每分钟 200 米，他们能够相遇，就说明这个跑道是个圆的也就是环形，遇不到的话那可能就是没缘分吧，可能要跑一辈子了，当然要是没有路的话那肯定就不用跑了，也可以遇到，但是说明了这个路线就不是一个环形的.

那转换为程序我们要怎么去写呢？链表的内容我们就先不在这里介绍，这道题就是利用了一个快慢指针去解决，当他们相遇的时候，值肯定就是相等的，如果不相等那就一直跑下去，直到链表的终结也就是 `null`

```
/*
 * @lc app=leetcode.cn id=141 lang=javascript
 *
 * [141] 环形链表
 */

// @lc code=start
/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  if (!head) return false
  let pre = head
  let cur = head
  while (cur && cur.next) {
    pre = pre.next
    cur = cur.next.next
    if (pre == cur) {
      return true
    }
  }
  return false
};
// @lc code=end

```
