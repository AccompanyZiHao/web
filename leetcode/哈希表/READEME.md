
常见的哈希组合
1. 数组
2. set（集合）
3. map（映射）

## 两数之和

用对象存储，`key` 为数组元素，`value` 为数组下标

```js
var obj = {
  [nums[i]]: i
}

if (target - nums[i]) {
  return [obj[target - nums[i]], i]
}
```

## 三数之和

两层`for`循环确定 `a` 和 `b` ，用哈希法来确定 `0-(a+b)` 但是会超时。

使用双指针

1. 先对数组按照从小到大的顺序排序；
2. 循环数组，定义指针 `left = i + 1`, `right` 数组的长度 -1 ；
3. 如果 `nums[i] + nums[left] + nums[right] > 0`，则 `right--`；
4. 如果 `nums[i] + nums[left] + nums[right] < 0`，则 `left++`；
5. 如果 `nums[i] + nums[left] + nums[right] === 0`，则 `left++`，`right--`，并且判断 `left` 和 `right` 是否和前面的数相等，如果相等则继续 `left++`，`right--`。

优化：

1. 如果 `nums[i] > 0`，则 `break`；
2. 如果 `nums[i] === nums[i - 1]`，则 `continue`，避免重复。
3. 如果 `nums[i] + nums[left] + nums[right] > 0`，则 `break`，因为已经排序了，所以后面的数只会更大。

去重：

1. 如果 `nums[left] === nums[left + 1]`，则 `left++`，避免重复；
2. 如果 `nums[right] === nums[right - 1]`，则 `right--`，避免重复。

## 四数之和

逻辑与三数之和相同，只是多了一重循环。

## 快乐数

1. 求平方和
2. 用对象存储每一次的平方和，如果出现重复的平方和，则不是快乐数

```js
function getSum(n) {
  let sum = 0;
  while (n) {
    // 从后往前取
    sum = sum + (n % 10) * (n % 10);
    n = Math.floor(n / 10);
  }
  return sum;
}
```

## 有效的字母异位词

1. 用对象存第一个字符串每个字符出现的次数
2. 遍历第二个字符串，如果对象中没有该字符，则返回 `false`，如果有，则将该字符出现的次数减一
3. 遍历对象，如果对象中有字符出现的次数不为 0，则返回 `false`

## 两个数组的交集

1. 去重
2. 遍历第一个数组，判断第二个数组中是否有该元素，如果有，则将该元素放入结果数组中


## 赎金信

思路与有效的字母异位词相同

## 四数相加

1. 两两相加，将结果存入对象中， `key` 为两数之和，`value` 为出现的次数
2. 再两两相加，判断对象中是否有 `0 - (c + d)`，如果有，则将该值的出现次数加入结果中



