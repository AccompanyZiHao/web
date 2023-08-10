//给你一个正整数 n ，生成一个包含 1 到 n² 所有元素，且元素按顺时针顺序螺旋排列的 n x n 正方形矩阵 matrix 。 
//
// 
//
// 示例 1： 
// 
// 
//输入：n = 3
//输出：[[1,2,3],[8,9,4],[7,6,5]]
// 
//
// 示例 2： 
//
// 
//输入：n = 1
//输出：[[1]]
// 
//
// 
//
// 提示： 
//
// 
// 1 <= n <= 20 
// 
//
// Related Topics 数组 矩阵 模拟 👍 1117 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {number} n
 * @return {number[][]}
 */
var generateMatrix = function (n) {

  // 存储每一次循环开始的坐标 【starx，stary】
  // loop 循环次数
  // offset 偏移量
  let startX = 0, startY = 0, mid = loop = Math.floor(n / 2), offset = 1;
  let matrix = new Array(n).fill(0).map(() => new Array(n).fill(0));

  let i, j;
  // 从1开始,计数
  let count = 1;

  // 循环次数
  while (loop--) {
    // 遵循顺时针方向，每次循环都是从左到右，从上到下，从右到左，从下到上，以及左闭右开的原则

    j = startY;
    i = startX;
    // 从左到右
    for (; j < startY + n - offset; j++) {
      matrix[i][j] = count++;
    }
    // 从上到下
    for (; i < startX + n - offset; i++) {
      matrix[i][j] = count++;
    }
    // 从右到左
    for (; j > startY; j--) {
      matrix[i][j] = count++;
    }
    // 从下到上
    for (; i > startX; i--) {
      matrix[i][j] = count++;
    }

    // 每次循环结束，偏移量都要加2
    offset += 2;
    // 每次循环结束，起始坐标都要向右下方移动一位
    startX++;
    startY++;
  }

  if (n % 2 === 1) {
    matrix[mid][mid] = count;
  }
  return matrix;
};
generateMatrix(3);
//leetcode submit region end(Prohibit modification and deletion)
