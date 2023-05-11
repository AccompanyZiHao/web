//给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。 
//
// 你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。 
//
// 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。 
//
// 
//
// 示例 1： 
//
// 
//输入：[7,1,5,3,6,4]
//输出：5
//解释：在第 2 天（股票价格 = 1）的时候买入，在第 5 天（股票价格 = 6）的时候卖出，最大利润 = 6-1 = 5 。
//     注意利润不能是 7-1 = 6, 因为卖出价格需要大于买入价格；同时，你不能在买入前卖出股票。
// 
//
// 示例 2： 
//
// 
//输入：prices = [7,6,4,3,1]
//输出：0
//解释：在这种情况下, 没有交易完成, 所以最大利润为 0。
// 
//
// 
//
// 提示： 
//
// 
// 1 <= prices.length <= 10⁵ 
// 0 <= prices[i] <= 10⁴ 
// 
//
// Related Topics 数组 动态规划 👍 2960 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {number[]} prices
 * @return {number}
 */
// 超时了 我淦
var maxProfit1 = function (prices) {
  let max = 0;
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      if (prices[j] - prices[i] > max) {
        max = prices[j] - prices[i];
      }
    }
  }
  return max;
};

// 贪心 左边找做小的，取到右的最大值
var maxProfit2 = function (prices) {
  let max = 0;
  let min = prices[0];
  for (let i = 1; i < prices.length; i++) {
    min = Math.min(min, prices[i]);
    max = Math.max(max, prices[i] - min);
  }
  return max;
};

// dp[i][0] 第i天持有股票所得最多现金
// 1. 昨天持有股票，今天不卖  dp[i - 1][0]
// 2. 昨天不持有股票，今天买入 -prices[i]
// dp[i][1] 第i天不持有股票所得最多现金
// 1. 昨天不持有股票，今天不买 dp[i - 1][1]
// 2. 昨天持有股票，今天卖出 prices[i] + dp[i - 1][0]

// [-7, 0] [-1, 0] [-1,4] [-1.4] [-1,5] [-1,5]
var maxProfit = function (prices) {
  let len = prices.length;
  const dp = new Array(len).fill([0, 0]);
  dp[0] = [-prices[0], 0];
  for (let i = 1; i < len; i++) {
    dp[i] = [
      Math.max(dp[i - 1][0], -prices[i]),
      Math.max(dp[i - 1][1], prices[i] + dp[i - 1][0]),
    ];
  }
  return dp[len - 1][1];
};

maxProfit([7, 1, 5, 3, 6, 4]);
//leetcode submit region end(Prohibit modification and deletion)
