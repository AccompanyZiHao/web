---
title: leetcode 435 无重叠区间
date: 2022-7-19 19:39:58
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

做项目的时候，有个需求就是给用户发放奖励，不同等级区间奖励不同，前端需要校验填写的区间有没有重复的，发现 `leetcode` 刚好有这道题，就顺手写一下。

## 示例 1：

```
输入: intervals = [[1,2],[2,3],[3,4],[1,3]]
输出: 1
解释: 移除 [1,3] 后，剩下的区间没有重叠。
```

## 示例 2：

```
输入: intervals = [ [1,2], [1,2], [1,2] ]
输出: 2
解释: 你需要移除两个 [1,2] 来使剩下的区间没有重叠。
```

## 示例 3：

```
输入: intervals = [ [1,2], [2,3] ]
输出: 0
解释: 你不需要移除任何区间，因为它们已经是无重叠的了
```

## 提示：

- 1 <= intervals.length <= 105
- intervals[i].length == 2
- -5 _ 104 <= starti < endi <= 5 _ 104

## 解题思路

1. 先排序，最大值从小到大排序
2. 下一个区间的最小值大于当前区间的最大值

```javascript
/*
 * @lc app=leetcode.cn id=435 lang=javascript
 *
 * [435] 无重叠区间
 */

/**
 * @param {number[][]} intervals
 * @return {number}
 */

var eraseOverlapIntervals = function (intervals) {
  intervals.sort(([a1, a2], [b1, b2]) => a2 - b2);

  let preRight = intervals[0][1];
  let n = 0;
  for (let i = 1; i < intervals.length; i++) {
    const cur = intervals[i];
    let nextLeft = cur[0];
    if (nextLeft < preRight) {
      n++;
    } else {
      preRight = cur[1];
    }
  }
  return n;
};
// @lc code=end
```
