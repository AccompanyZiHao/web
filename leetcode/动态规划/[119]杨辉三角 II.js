//给定一个非负索引 rowIndex，返回「杨辉三角」的第 rowIndex 行。 
//
// 在「杨辉三角」中，每个数是它左上方和右上方的数的和。 
//
// 
//
// 
//
// 示例 1: 
//
// 
//输入: rowIndex = 3
//输出: [1,3,3,1]
// 
//
// 示例 2: 
//
// 
//输入: rowIndex = 0
//输出: [1]
// 
//
// 示例 3: 
//
// 
//输入: rowIndex = 1
//输出: [1,1]
// 
//
// 
//
// 提示: 
//
// 
// 0 <= rowIndex <= 33 
// 
//
// 
//
// 进阶： 
//
// 你可以优化你的算法到 O(rowIndex) 空间复杂度吗？ 
//
// Related Topics 数组 动态规划 👍 488 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {number} rowIndex
 * @return {number[]}
 */
var getRow1 = function (rowIndex) {
  if (rowIndex === 0) return [1];
  if (rowIndex === 1) return [1, 1];
  let arr = [1, 1];
  for (let i = 2; i <= rowIndex; i++) {
    let temp = [1];
    for (let j = 1; j < i; j++) {
      temp.push(arr[j - 1] + arr[j]);
    }
    temp.push(1);
    arr = temp;
  }
  return arr;
};

// 线性递推 只计算一半的
var getRow = function(rowIndex) {
  const row = new Array(rowIndex + 1).fill(0);
  row[0] = 1;
  for (let i = 1; i <= rowIndex; ++i) {
    row[i] = row[i - 1] * (rowIndex - i + 1) / i;
  }
  return row;
};

getRow(3);
//leetcode submit region end(Prohibit modification and deletion)
