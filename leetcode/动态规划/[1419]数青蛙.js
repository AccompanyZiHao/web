//给你一个字符串 croakOfFrogs，它表示不同青蛙发出的蛙鸣声（字符串 "croak" ）的组合。由于同一时间可以有多只青蛙呱呱作响，所以 
//croakOfFrogs 中会混合多个 “croak” 。 
//
// 请你返回模拟字符串中所有蛙鸣所需不同青蛙的最少数目。 
//
// 要想发出蛙鸣 "croak"，青蛙必须 依序 输出 ‘c’, ’r’, ’o’, ’a’, ’k’ 这 5 个字母。如果没有输出全部五个字母，那么它就不会
//发出声音。如果字符串 croakOfFrogs 不是由若干有效的 "croak" 字符混合而成，请返回 -1 。 
//
// 
//
// 示例 1： 
//
// 
//输入：croakOfFrogs = "croakcroak"
//输出：1 
//解释：一只青蛙 “呱呱” 两次
// 
//
// 示例 2： 
//
// 
//输入：croakOfFrogs = "crcoakroak"
//输出：2 
//解释：最少需要两只青蛙，“呱呱” 声用黑体标注
//第一只青蛙 "crcoakroak"
//第二只青蛙 "crcoakroak"
// 
//
// 示例 3： 
//
// 
//输入：croakOfFrogs = "croakcrook"
//输出：-1
//解释：给出的字符串不是 "croak" 的有效组合。
// 
//
// 
//
// 提示： 
//
// 
// 1 <= croakOfFrogs.length <= 10⁵ 
// 字符串中的字符只有 'c', 'r', 'o', 'a' 或者 'k' 
// 
//
// Related Topics 字符串 计数 👍 130 👎 0


// 1. 如果不能被 5 整除，第一个字符不是 c，最后一个字符不是 k，说明不是有效组合，返回 -1
// 2. 遍历字符串，记录 c r o a k 出现的次数，同时记录最大值
// 3. 如果 c < r < o < a < k，说明不是有效组合，返回 -1
// 4. 如果 k === 1，说明一组 croak 完成，c r o a k 各自减 1
// 5. 最后判断 c r o a k 是否都为 0，是则返回最大值，否则返回 -1

//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {string} croakOfFrogs
 * @return {number}
 */
var minNumberOfFrogs = function (croakOfFrogs) {
  const len = croakOfFrogs.length;
  if (len % 5 != 0 || croakOfFrogs[0] !== "c" || croakOfFrogs[len - 1] !== "k") {
    return -1;
  }
  let c = 0, r = 0, o = 0, a = 0, k = 0;
  let max = 0;
  for (let i = 0; i < len; i++) {
    const ch = croakOfFrogs[i];
    if (ch === "c") c++;
    if (ch === "r") r++;
    if (ch === "o") o++;
    if (ch === "a") a++;
    if (ch === "k") k++;
    if (c < r || r < o || o < a || a < k) return -1;
    if (k === 1) {
      c--;
      r--;
      o--;
      a--;
      k--;
    }
    max = Math.max(max, c);
  }
  return c === 0 && r === 0 && o === 0 && a === 0 && k === 0 ? max : -1;
};
//leetcode submit region end(Prohibit modification and deletion)
