//给定两个字符串 s 和 t ，编写一个函数来判断 t 是否是 s 的字母异位词。
//
// 注意：若 s 和 t 中每个字符出现的次数都相同，则称 s 和 t 互为字母异位词。
//
//
//
// 示例 1:
//
//
//输入: s = "anagram", t = "nagaram"
//输出: true
//
//
// 示例 2:
//
//
//输入: s = "rat", t = "car"
//输出: false
//
//
//
// 提示:
//
//
// 1 <= s.length, t.length <= 5 * 10⁴
// s 和 t 仅包含小写字母
//
//
//
//
// 进阶: 如果输入字符串包含 unicode 字符怎么办？你能否调整你的解法来应对这种情况？
//
// Related Topics 哈希表 字符串 排序 👍 828 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function (s, t) {
  // 用对象存每个字符出现的次数
  let obj = {};
  for (let i = 0; i < s.length; i++) {
    if (obj[s[i]]) {
      obj[s[i]]++;
    } else {
      obj[s[i]] = 1;
    }
  }

  for (let i = 0; i < t.length; i++) {
    // 如果有不同的字符，直接返回false
    // 如果有相同的字符，减去次数
    if (obj[t[i]]) {
      obj[t[i]]--;
    } else {
      return false;
    }
  }
  return Object.values(obj).every(item => item === 0);
};
//leetcode submit region end(Prohibit modification and deletion)
