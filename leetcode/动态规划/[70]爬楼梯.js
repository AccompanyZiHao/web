//假设你正在爬楼梯。需要 n 阶你才能到达楼顶。 
//
// 每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？ 
//
// 
//
// 示例 1： 
//
// 
//输入：n = 2
//输出：2
//解释：有两种方法可以爬到楼顶。
//1. 1 阶 + 1 阶
//2. 2 阶 
//
// 示例 2： 
//
// 
//输入：n = 3
//输出：3
//解释：有三种方法可以爬到楼顶。
//1. 1 阶 + 1 阶 + 1 阶
//2. 1 阶 + 2 阶
//3. 2 阶 + 1 阶
// 
//
// 
//
// 提示： 
//
// 
// 1 <= n <= 45 
// 
//
// Related Topics 记忆化搜索 数学 动态规划 👍 3009 👎 0


// dp(i) = dp(i-1) + dp(i-2)
// dp(1) = 1
// dp(2) = 2
// dp(3) = 3
// dp(4) = 5
//leetcode submit region begin(Prohibit modification and deletion)

// 滚动缓存
function climbStairs(n) {
  if (n == 1) {
    return 1
  }
  let dp0 = 1;
  let dp1 = 1;
  for (let i = 2; i <= n; i++) {
    [dp0, dp1] = [dp1, dp1 + dp0];
  }
  return dp1;
}
climbStairs(4)


const cache = [];

function climbStairs1(n) {
  function dp(i) {
    switch (i) {
      case 1:
        cache[i] = 1;
        break;
      case 2:
        cache[i] = 2;
        break;
      default:
        cache[i] = cache[i - 1] + cache[i - 2];
    }

    return cache[i];
  }

// 既然用了缓存，最好自底向上递归，这样前面的缓存才能优先算出来
  for (let i = 1; i <= n; i++) {
    dp(i);
  }

  return cache[n];
};


//leetcode submit region end(Prohibit modification and deletion)
