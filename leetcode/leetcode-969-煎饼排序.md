---
title: leetcode 969 煎饼排序
date: 2022-02-22 19:48:24
tags:
  - 算法
  - leetcode
author: 白菜
categories:
  - leetcode
#issueId:
---

先吐槽一下，这个题指定有毛病，`test` 测试的时候，不通过，浪费我不少时间，看了不少别人的解题，寻思着自己的思路没啥问题，咋不行呢，于是 `submit` 试一下，结果，一点毛病都没有，哎，生活不易，白菜叹气！这个示例有问题，可以直接跳过示例查看思路。

给你一个整数数组 `arr` ，请使用 煎饼翻转 完成对数组的排序。

一次煎饼翻转的执行过程如下：

1. 选择一个整数 k ，1 <= k <= arr.length
2. 反转子数组 arr[0...k-1]（下标从 0 开始）
3. 例如，arr = [3,2,1,4] ，选择 k = 3 进行一次煎饼翻转，反转子数组 [3,2,1] ，得到 arr = [1,2,3,4] 。

以数组形式返回能使 `arr` 有序的煎饼翻转操作所对应的 k 值序列。任何将数组排序且翻转次数在  10 \* `arr.length` 范围内的有效答案都将被判断为正确。



## 示例 1：

```
输入：[3,2,4,1]
输出：[4,2,4,3]
解释：
我们执行 4 次煎饼翻转，k 值分别为 4，2，4，和 3。
初始状态 arr = [3, 2, 4, 1]
第一次翻转后（k = 4）：arr = [1, 4, 2, 3]
第二次翻转后（k = 2）：arr = [4, 1, 2, 3]
第三次翻转后（k = 4）：arr = [3, 2, 1, 4]
第四次翻转后（k = 3）：arr = [1, 2, 3, 4]，此时已完成排序。
```

## 示例 2：

```
输入：[1,2,3]
输出：[]
解释：
输入已经排序，因此不需要翻转任何内容。
请注意，其他可能的答案，如 [3，3] ，也将被判断为正确。
```



## 提示：

- 1 <= arr.length <= 100
- 1 <= arr[i] <= arr.length
- arr 中的所有整数互不相同（即，arr 是从 1 到 arr.length 整数的一个排列）
  通过次数 38,953

## 解题思路

先理解这个题，意思就是说每次找到最大的值，先把他放在头部，然后反转，放到尾部，k 呢就是这个最大值的下标加 1；
找到最大的然后找第二大的，继续上面的过程

1. 找到最大值
2. 对称翻转数组, 把最大的放在头部
3. 再次翻转，把最大的放在尾部
4. 删除最后一个

```
/*
 * @lc app=leetcode.cn id=969 lang=javascript
 *
 * [969] 煎饼排序
 */

// @lc code=start
/**
 * @param {number[]} arr
 * @return {number[]}
 */
var pancakeSort = function (arr) {
    // 3,2,4,1
    let stash = [], maxIndex;
    while (arr.length > 1) {
        maxIndex = findMaxIndex(arr)
        if(maxIndex > 0){
            stash.push(maxIndex + 1)
        }
        reverse(arr, maxIndex)
        reverse(arr, arr.length -1)
        stash.push(arr.length)
        arr.pop()
    }
    return stash
};

function reverse(arr, k) {
    if (k < 1) return
    let i = 0;
    let j = k;
    while (i < j) {
        [arr[i], arr[j]] = [arr[j], arr[i]]
        i++
        j--
    }
}

function findMaxIndex(arr) {
    let index = 0
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > arr[index]) {
            index = i
        }
    }
    return index
}
// @lc code=end

```
