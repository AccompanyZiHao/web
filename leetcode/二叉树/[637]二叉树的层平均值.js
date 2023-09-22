//给定一个非空二叉树的根节点
// root , 以数组的形式返回每一层节点的平均值。与实际答案相差 10⁻⁵ 以内的答案可以被接受。
//
//
//
// 示例 1：
//
//
//
//
//输入：root = [3,9,20,null,null,15,7]
//输出：[3.00000,14.50000,11.00000]
//解释：第 0 层的平均值为 3,第 1 层的平均值为 14.5,第 2 层的平均值为 11 。
//因此返回 [3, 14.5, 11] 。
//
//
// 示例 2:
//
//
//
//
//输入：root = [3,9,20,15,7]
//输出：[3.00000,14.50000,11.00000]
//
//
//
//
// 提示：
//
//
//
//
//
// 树中节点数量在 [1, 10⁴] 范围内
// -2³¹ <= Node.val <= 2³¹ - 1
//
//
// Related Topics 树 深度优先搜索 广度优先搜索 二叉树 👍 452 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var averageOfLevels = function (root) {
  let res = [];
  let queue = [];
  queue.push(root);
  let total = 0;
  while (queue.length) {
    let len = queue.length;
    total = len;
    //  求每一层的和
    let sum = 0;
    while (len--) {
      const node = queue.shift();
      sum += node.val;
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push((sum / total).toFixed(6));
  }
  return res;
};

var averageOfLevels = function (root) {
  //层级平均值
  let res = [], queue = [];
  queue.push(root);

  while (queue.length) {
    //每一层节点个数
    let length = queue.length;
    //sum记录每一层的和
    let sum = 0;
    for (let i = 0; i < length; i++) {
      let node = queue.shift();
      sum += node.val;
      node.left && queue.push(node.left);
      node.right && queue.push(node.right);
    }
    console.log(sum, length);
    //每一层的平均值存入数组res
    res.push(sum / length);
  }

  return res;
};
//leetcode submit region end(Prohibit modification and deletion)
