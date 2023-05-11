//输入一个整型数组，数组中的一个或连续多个整数组成一个子数组。求所有子数组的和的最大值。 
//
// 要求时间复杂度为O(n)。 
//
// 
//
// 示例1: 
//
// 输入: nums = [-2,1,-3,4,-1,2,1,-5,4]
//输出: 6
//解释: 连续子数组 [4,-1,2,1] 的和最大，为 6。 
//
// 
//
// 提示： 
//
// 
// 1 <= arr.length <= 10^5 
// -100 <= arr[i] <= 100 
// 
//
// 注意：本题与主站 53 题相同：https://leetcode-cn.com/problems/maximum-subarray/ 
//
// 
//
// Related Topics 数组 分治 动态规划 👍 693 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
import et from "../../../../work/guochao/popo-active/dist/assets/index.21c3dfa0";

/**
 * @param {number[]} nums
 * @return {number}
 */

// dp(i) = dp(i-1) + nums[i]
var maxSubArray = function (nums) {
  // dp[i] = Math.max(dp[i - 1] + nums[i], nums[i])
  let n = nums.length;
  let sum = 0;
  let max = nums[0];
  for (let i = 0; i < n; i++) {
    sum += nums[i];
    max = Math.max(max, sum);
    if (sum < 0) {
      sum = 0;
    }
    // [dp0, dp1] = [dp1, Math.max(dp1 + nums[i], nums[i])]
  }
  return max;
};
//leetcode submit region end(Prohibit modification and deletion)
