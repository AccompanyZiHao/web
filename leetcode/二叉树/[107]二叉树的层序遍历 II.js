//给你二叉树的根节点 root ，返回其节点值 自底向上的层序遍历 。 （即按从叶子节点所在层到根节点所在的层，逐层从左向右遍历）
//
//
//
// 示例 1：
//
//
//输入：root = [3,9,20,null,null,15,7]
//输出：[[15,7],[9,20],[3]]
//
//
// 示例 2：
//
//
//输入：root = [1]
//输出：[[1]]
//
//
// 示例 3：
//
//
//输入：root = []
//输出：[]
//
//
//
//
// 提示：
//
//
// 树中节点数目在范围 [0, 2000] 内
// -1000 <= Node.val <= 1000
//
//
// Related Topics 树 广度优先搜索 二叉树 👍 726 👎 0


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
 * @return {number[][]}
 */
var levelOrderBottom = function (root) {
  let res = [];
  let stack = [];
  if (root === null) return res;

  stack.push(root);
  while (stack.length) {
    const len = stack.length;

    let curLevel = [];
    for (let i = 0; i < len; i++) {
      const node = stack.shift();
      curLevel.push(node.val);
      if (node.left) stack.push(node.left);
      if (node.right) stack.push(node.right);
    }
    console.log('curLevel', curLevel);
    res.unshift(curLevel)
  }
  return res;
};

function DFS(res, node, level) {
  if (node === null) return;
  if (res.length === level) {
    res.unshift([]);
  }
  res[0].push(node.val);
  console.log('//node ==', node, '//node.left ==', node.left, '//node.right ==', node.right, '//level ==', level);
  if (node.left) DFS(res, node.left, level + 1);
  if (node.right) DFS(res, node.right, level + 1);
}

//leetcode submit region end(Prohibit modification and deletion)
