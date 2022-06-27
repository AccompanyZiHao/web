---
title: leetcode 933 最近的请求次数
date: 2022-02-17 21:18:53
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

写一个 RecentCounter 类来计算特定时间范围内最近的请求。

请你实现 RecentCounter 类：

- RecentCounter() 初始化计数器，请求数为 0 。
- int ping(int t) 在时间 t 添加一个新请求，其中 t 表示以毫秒为单位的某个时间，并返回过去 3000 毫秒内发生的所有请求数（包括新请求）。确切地说，返回在 [t-3000, t] 内发生的请求数。
  保证 每次对 ping 的调用都使用比之前更大的 t 值。

## 示例 1：

```
输入：
["RecentCounter", "ping", "ping", "ping", "ping"]
[[], [1], [100], [3001], [3002]]
输出：
[null, 1, 2, 3, 3]

解释：
RecentCounter recentCounter = new RecentCounter();
recentCounter.ping(1);     // requests = [1]，范围是 [-2999,1]，返回 1
recentCounter.ping(100);   // requests = [1, 100]，范围是 [-2900,100]，返回 2
recentCounter.ping(3001);  // requests = [1, 100, 3001]，范围是 [1,3001]，返回 3
recentCounter.ping(3002);  // requests = [1, 100, 3001, 3002]，范围是 [2,3002]，返回 3
```

## 提示：

- 1 <= t <= 109
- 保证每次对 ping 调用所使用的 t 值都 严格递增
- 至多调用 ping 方法 104 次

看到这个题就想到了一个有意思的事情：
比如说我开了一家公司，每个月都要招几个人，可是由于 money 有限，所以再招新人的时候需要把老员工给干掉也就是辞退了，那辞退的条件是什么嘛，那就是超过 3 年吧，也就是 36 个月

比如 2019 年我才开了加公司，这个时候我還时个光杆司令，员工呢除了我也就是 0
到 2019 年 1 月招一个人 打工仔也就是 1 个
到 2020 年 1 月又招一个人 打工仔就变成了 2 个
到 2021 年 1 月招 3 个人 打工仔就有 5 个了
到 2022 年 1 月招 1 个人 打工仔共有 6 个
到 2022 年 2 月我又想招 1 个人 这个时候我就要把 3 年前的老员工给辞掉了这个时候呢 打工仔一共还有 6 个

这样子解释是不是就很清楚了

1. 开始的时候定义一个空数组，每次招人的时候就往里面添加元素
2. 每次招人的时候都看一下有没有到 3 年，到了 3 年我就辞退别人，从第一个开始辞退
3. 返回的就是现在公司的人数，

```
/*
 * @lc app=leetcode.cn id=933 lang=javascript
 *
 * [933] 最近的请求次数
 */

// @lc code=start

var RecentCounter = function() {
  this.pingArr = []
};

/**
 * @param {number} t
 * @return {number}
 */
RecentCounter.prototype.ping = function(t) {
  this.ping.push(t)
  while (this.pingArr[0] - 3000) {
    this.pingArr.shift()
  }
  return this.pingArr.length
};

/**
 * Your RecentCounter object will be instantiated and called as such:
 * var obj = new RecentCounter()
 * var param_1 = obj.ping(t)
 */
// @lc code=end


```
