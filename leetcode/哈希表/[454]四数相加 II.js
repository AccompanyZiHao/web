//给你四个整数数组 nums1、nums2、nums3 和 nums4 ，数组长度都是 n ，请你计算有多少个元组 (i, j, k, l) 能满足：
//
//
// 0 <= i, j, k, l < n
// nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0
//
//
//
//
// 示例 1：
//
//
//输入：nums1 = [1,2], nums2 = [-2,-1], nums3 = [-1,2], nums4 = [0,2]
//输出：2
//解释：
//两个元组如下：
//1. (0, 0, 0, 1) -> nums1[0] + nums2[0] + nums3[0] + nums4[1] = 1 + (-2) + (-1)
// + 2 = 0
//2. (1, 1, 0, 0) -> nums1[1] + nums2[1] + nums3[0] + nums4[0] = 2 + (-1) + (-1)
// + 0 = 0
//
//
// 示例 2：
//
//
//输入：nums1 = [0], nums2 = [0], nums3 = [0], nums4 = [0]
//输出：1
//
//
//
//
// 提示：
//
//
// n == nums1.length
// n == nums2.length
// n == nums3.length
// n == nums4.length
// 1 <= n <= 200
// -2²⁸ <= nums1[i], nums2[i], nums3[i], nums4[i] <= 2²⁸
//
//
// Related Topics 数组 哈希表 👍 874 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @param {number[]} nums3
 * @param {number[]} nums4
 * @return {number}
 */
var fourSumCount = function(nums1, nums2, nums3, nums4) {
  let hashMap = new Map();
  // 两两相加，存入 hashMap key: 2 数之和 value: 出现次数
  for (let i = 0; i < nums1.length; i++) {
    for (let j = 0; j < nums2.length;j++) {
      let sum = nums1[i] + nums2[j];
      hashMap.set(sum, hashMap.has(sum) ? hashMap.get(sum) + 1 : 1);
    }
  }

  let count = 0;
  // 两两相加，取反查找 hashMap 是否存在 key
  for (let i = 0; i < nums3.length; i++) {
    for (let j = 0; j < nums4.length;j++) {
      let sum = nums3[i] + nums4[j];
      if (hashMap.has(-sum)) {
        count += hashMap.get(-sum);
      }
    }
  }
  return count;
};
//leetcode submit region end(Prohibit modification and deletion)
