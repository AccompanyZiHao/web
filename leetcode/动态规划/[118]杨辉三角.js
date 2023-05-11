//给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。 
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
//输入: numRows = 5
//输出: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
// 
//
// 示例 2: 
//
// 
//输入: numRows = 1
//输出: [[1]]
// 
//
// 
//
// 提示: 
//
// 
// 1 <= numRows <= 30 
// 
//
// Related Topics 数组 动态规划 👍 985 👎 0


// 1. 每一行的第一个和最后一个数都是1
// 2. 从第三行开始, 中间的数是上一行的前一个数和当前数的和

//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {number} numRows
 * @return {number[][]}
 */
var generate = function(numRows) {
    if(numRows === 1) return [[1]]
    if(numRows === 2) return [[1],[1,1]]
    let res = [[1],[1,1]]

    for(let i = 2; i < numRows; i++) {
      let temp = [1]
      for(let j = 1; j < i; j++) {
        temp.push(res[i-1][j-1] + res[i-1][j])
      }
      temp.push(1)
      res.push(temp)
    }
    return res
};
//leetcode submit region end(Prohibit modification and deletion)
