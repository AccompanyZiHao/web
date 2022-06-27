---
title: leetcode 86 分隔链表
date: 2022-02-13 19:54:54
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给你一个链表的头节点 head 和一个特定值 x ，请你对链表进行分隔，使得所有 小于 x 的节点都出现在 大于或等于 x 的节点之前。

你应当 保留 两个分区中每个节点的初始相对位置。

## 示例 1：

```
输入：head = [1,4,3,2,5,2], x = 3
输出：[1,2,2,4,3,5]
```

## 示例 2：

```
输入：head = [2,1], x = 2
输出：[1,2]
```

## 提示：

- 链表中节点的数目在范围 [0, 200] 内
- -100 <= Node.val <= 100
- -200 <= x <= 200

看到这个题不就是一个排序嘛，类似快速排序的那种，给你一个中间值，比他小的放左边，比它大的放右边，这个题呢只不过是找出比给定的值小的节点放在前面，如果比给定的值大的话则保持原来的相对位置。

思路分析：

1. 判断链表是否为空
2. 定义连个链表 big, small, 分别用来存放比 x 大的和比 x 小的链表

用实例一来演示

```
// 初始值 [1 4 3 2 5 2]    x = 3
// 循环链表
for(let cur = head, next; cur; cur = next){
  // cur 当前的指针， next 下一个指针
  next = cur.next // next [4 3 2 5 2]
  // next 指针定义完 断开 cur 这个指针
  cur.next  = null // cur [1]
  // 当前值 2 小于 x  3
  if(cur.val < x){
    smallNode.next = cur
    smallNode = cur
  }else{
    bigNode.next = cur
    bigNode = cur
  }
}

```

```
初始值
samll     [0]
big       [0]
第一轮 1
smallNode [1]
small     [0 ,1]
big       [0]
第二轮 4
bigNode   [4]
small     [0 ,1]
big       [0, 4]
第三轮 3
bigNode   [3]
small     [0 ,1]
big       [0, 4, 3]
第四轮 2
smallNode   [2]
small     [0 ,1, 2]
big       [0, 4, 3]
第五轮 5
bigNode   [5]
small     [0 ,1, 2]
big       [0, 4, 3, 5]
第六轮 2
smallNode   [2]
small     [0 ,1, 2, 2]
big       [0, 4, 3, 5]
```

循环结束的时候，我们把 `smallNode.next` 指向 `big.next`,这个时候 `samll.next` 的链表就是我们想要的了即 `[1,2,2,4,3,5]`

```
/*
 * @lc app=leetcode.cn id=86 lang=javascript
 *
 * [86] 分隔链表
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
 * @param {number} x
 * @return {ListNode}
 */
var partition = function(head, x) {
  if(!head) return null
  // 创建两个链表 一个链表存储比 x 小的元素 一个存储比 x 大的元素
  let big = new ListNode()
  let small = new ListNode()
  // 定义两个指针
  let bigNode = big
  let smallNode = small
  for(let cur = head, next; cur; cur = next){
    next  = cur.next
    cur.next = null
    if(cur.val < x){
      smallNode.next = cur
      smallNode = cur
    }else{
      bigNode.next = cur
      bigNode = cur
    }
  }
  smallNode.next = big.next
  return small.next
};
// @lc code=end

```
