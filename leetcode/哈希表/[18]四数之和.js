//给你一个由 n 个整数组成的数组 nums ，和一个目标值 target 。请你找出并返回满足下述全部条件且不重复的四元组 [nums[a], nums[
//b], nums[c], nums[d]] （若两个四元组元素一一对应，则认为两个四元组重复）：
//
//
// 0 <= a, b, c, d < n
// a、b、c 和 d 互不相同
// nums[a] + nums[b] + nums[c] + nums[d] == target
//
//
// 你可以按 任意顺序 返回答案 。
//
//
//
// 示例 1：
//
//
//输入：nums = [1,0,-1,0,-2,2], target = 0
//输出：[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]
//
//
// 示例 2：
//
//
//输入：nums = [2,2,2,2,2], target = 8
//输出：[[2,2,2,2]]
//
//
//
//
// 提示：
//
//
// 1 <= nums.length <= 200
// -10⁹ <= nums[i] <= 10⁹
// -10⁹ <= target <= 10⁹
//
//
// Related Topics 数组 双指针 排序 👍 1727 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function(nums, target) {
  let res = [];
  let len = nums.length;
  if(len < 4) return res;
  // 排序
  nums.sort((a, b) => a - b);

  // 临界条件 [1,-2,-5,-4,-3,3,3,5] -11 有负数的情况不太合适
  // if (nums[0] > target) return [];
  // 如果最小的四个数相加都大于target，或者最大的四个数相加都小于target，直接返回空数组
  if(nums[0] * 4 > target || nums[len - 1] * 4 < target) return res;

  for (let i = 0; i < len - 3; i++) {
    // 如果当前元素和前一个元素相同，跳过
    if(i > 0 && nums[i] === nums[i - 1]) continue;
    // 如果当前元素和后三个元素相加大于target，那么后面的元素都不用看了，直接跳出循环
    if(nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3] > target) break;
    // 如果当前元素和后三个元素相加小于target，那么当前元素不用看了，直接进入下一次循环
    if(nums[i] + nums[len - 1] + nums[len - 2] + nums[len - 3] < target) continue;

    for (let j = i + 1; j < len - 2; j++) {
      // 如果当前元素和前一个元素相同，跳过
      if(j > i + 1 && nums[j] === nums[j - 1]) continue;
      let left = j + 1;
      let right = len - 1;
      // 如果当前元素和后两个元素相加大于target，那么后面的元素都不用看了，直接跳出循环
      if(nums[i] + nums[j] + nums[j + 1] + nums[j + 2] > target) break;
      // 如果当前元素和后两个元素相加小于target，那么当前元素不用看了，直接进入下一次循环
      if(nums[i] + nums[j] + nums[len - 1] + nums[len - 2] < target) continue;

      while (left < right) {
        let sum = nums[i] + nums[j] + nums[left] + nums[right];
        if(sum === target) {
          res.push([nums[i], nums[j], nums[left], nums[right]]);
          // 如果当前元素和后一个元素相同，跳过
          while (left < right && nums[left] === nums[left + 1]) left++;
          // 如果当前元素和前一个元素相同，跳过
          while (left < right && nums[right] === nums[right - 1]) right--;
          left++;
          right--;
        } else if(sum < target) {
          left++;
        } else {
          right--;
        }
      }

    }
  }

  return res;
};
fourSum([1,-2,-5,-4,-3,3,3,5], -11)
//leetcode submit region end(Prohibit modification and deletion)
