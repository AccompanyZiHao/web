---
title: leetcode 860 柠檬水找零
date: 2022-02-19 18:33:20
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

在柠檬水摊上，每一杯柠檬水的售价为 5 美元。顾客排队购买你的产品，（按账单 bills 支付的顺序）一次购买一杯。

每位顾客只买一杯柠檬水，然后向你付 5 美元、10 美元或 20 美元。你必须给每个顾客正确找零，也就是说净交易是每位顾客向你支付 5 美元。

注意，一开始你手头没有任何零钱。

给你一个整数数组 `bills` ，其中 `bills[i]` 是第 i 位顾客付的账。如果你能给每位顾客正确找零，返回 `true` ，否则返回 `false` 。

## 示例 1：

```
输入：bills = [5,5,5,10,20]
输出：true
解释：
前 3 位顾客那里，我们按顺序收取 3 张 5 美元的钞票。
第 4 位顾客那里，我们收取一张 10 美元的钞票，并返还 5 美元。
第 5 位顾客那里，我们找还一张 10 美元的钞票和一张 5 美元的钞票。
由于所有客户都得到了正确的找零，所以我们输出 true。
```

## 示例 2：

```
输入：bills = [5,5,10,10,20]
输出：false
解释：
前 2 位顾客那里，我们按顺序收取 2 张 5 美元的钞票。
对于接下来的 2 位顾客，我们收取一张 10 美元的钞票，然后返还 5 美元。
对于最后一位顾客，我们无法退回 15 美元，因为我们现在只有两张 10 美元的钞票。
由于不是每位顾客都得到了正确的找零，所以答案是 false。
```

## 示例 3：

```
输入：bills = [5,5,10]
输出：true
```

## 示例 4：

```
输入：bills = [10,10]
输出：false
```

## 提示：

- 1 <= bills.length <= 105
- bills[i] 不是 5 就是 10 或是 20

## 題目分析

1. 先把手上的 5 元的和 10 元的分别给存起来
2. 每次顾客给的钱我们都看手上钱够不够找零
   1. 5 元的直接存
   2. 10 元的只能找 5 元的
   3. 20 的可以找一个 10 元和一个 5 元也可以找 3 个 5 元的
3. 每次找完手上有剩的就返回 ture, 否则返回 false

## solution

```
/*
 * @lc app=leetcode.cn id=860 lang=javascript
 *
 * [860] 柠檬水找零
 */

// @lc code=start
/**
 * @param {number[]} bills
 * @return {boolean}
 */
var lemonadeChange = function (bills) {
  let five = 0;
  let ten = 0;
  for (let i = 0; i < bills.length; i++) {
    const bill = bills[i]
    if (bill == 5) {
      five++
    } else if (bill == 10) {
      five -= 1
      if (five < 0) {
        return false
      }
      ten++
    } else {
      if (ten > 0 && five > 0) {
        ten -= 1
        five -= 1
      } else if (five >= 3) {
        five -= 3
      } else {
        return false
      }
    }
  }
  return true
};
// @lc code=end

```
