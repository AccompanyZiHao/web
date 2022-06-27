---
title: leetcode 859 亲密字符串
date: 2022-02-19 17:47:16
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

给你两个字符串 `s` 和 `goal` ，只要我们可以通过交换 `s` 中的两个字母得到与 `goal` 相等的结果，就返回 `true` ；否则返回 `false` 。

交换字母的定义是：取两个下标 `i` 和 `j` （下标从 0 开始）且满足 `i` != `j` ，接着交换 `s[i]` 和 `s[j]` 处的字符。

例如，在 `"abcd"` 中交换下标 0 和下标 2 的元素可以生成 `"cbad"` 。

## 示例 1：

```
输入：s = "ab", goal = "ba"
输出：true
解释：你可以交换 s[0] = 'a' 和 s[1] = 'b' 生成 "ba"，此时 s 和 goal 相等。
```

## 示例 2：

```
输入：s = "ab", goal = "ab"
输出：false
解释：你只能交换 s[0] = 'a' 和 s[1] = 'b' 生成 "ba"，此时 s 和 goal 不相等。
```

## 示例 3：

```
输入：s = "aa", goal = "aa"
输出：true
解释：你可以交换 s[0] = 'a' 和 s[1] = 'a' 生成 "aa"，此时 s 和 goal 相等。
```

## 示例 4：

```
输入：s = "aaaaaaabc", goal = "aaaaaaacb"
输出：true
```

## 提示：

- 1 <= s.length, goal.length <= 2 \* 104
- s 和 goal 由小写英文字母组成

## 题目分析

1. 字符串长度不相等，肯定不是亲密关系，直接返回 false
2. 如果两个字符串相等有两种情况，'aa' 和 'aa', 'abc' 和 'abc'两种，第一种我们直接用 set 去重，如果去重后的长度小于原来的长度就说明是字符串中含有相同的字符那就是亲密关系了,长度如果一样的话那就是不是亲密关系了
3. 不相等的话，我们就把他们的下标用 stash 存起来，如果要是亲密关系，那么要满足下面几个条件
   1. 只有两个字符串不同
   2. s.charAt(stash[0]) == goal.charAt(stash[1])
   3. s.charAt(stash[1]) == goal.charAt(stash[0])

## solution

```
/*
 * @lc app=leetcode.cn id=859 lang=javascript
 *
 * [859] 亲密字符串
 */

// @lc code=start
/**
 * @param {string} s
 * @param {string} goal
 * @return {boolean}
 */
var buddyStrings = function(s, goal) {
  const l = s.length
  if(l != goal.length) return false

  if(s == goal) return new Set(s).size < l

  let stash = []
  for(let i = 0; i < l; i ++){
    if(s.charAt(i) != goal.charAt(i)){
      stash.push(i)
    }
  }
  return stash.length == 2 && s.charAt(stash[0]) == goal.charAt(stash[1]) && s.charAt(stash[1]) == goal.charAt(stash[0])
};
// @lc code=end

```
