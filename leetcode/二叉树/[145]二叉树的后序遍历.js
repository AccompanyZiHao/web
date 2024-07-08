//给你一棵二叉树的根节点 root ，返回其节点值的 后序遍历 。
//
//
//
// 示例 1：
//
//
//输入：root = [1,null,2,3]
//输出：[3,2,1]
//
//
// 示例 2：
//
//
//输入：root = []
//输出：[]
//
//
// 示例 3：
//
//
//输入：root = [1]
//输出：[1]
//
//
//
//
// 提示：
//
//
// 树中节点的数目在范围 [0, 100] 内
// -100 <= Node.val <= 100
//
//
//
//
// 进阶：递归算法很简单，你可以通过迭代算法完成吗？
//
// Related Topics 栈 树 深度优先搜索 二叉树 👍 1091 👎 0


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
var postorderTraversal = function (root) {
//输入：root = [1,null,2,3]
//输出：[3,2,1]
  const stack = [];
  deep(root);
  return  stack;
  function deep(root) {
    if (root === null) return;
    deep(root.left);
    deep(root.right);
    stack.push(root.val);
  }
};
// 左 右 中
// 入栈 左 -> 右
// 出栈 中 -> 右 -> 左 结果翻转
var postorderTraversal = function (root) {
  if (root === null) return [];
  const stack = [root];
  const res = [];
  while (stack.length) {
    const node = stack.pop();
    // 入栈
    res.unshift(node.val);
    // 左
    if (node.left) stack.push(node.left);
    // 右
    if (node.right) stack.push(node.right);
  }
  return res
}
// 后续遍历：左右中
// 压栈顺序：中右左
var postorderTraversal = function(root, res = []) {
  const stack = [];
  if (root) stack.push(root);
  while(stack.length) {
    const node = stack.pop();
    if(!node) {
      res.push(stack.pop().val);
      continue;
    }
    stack.push(node); // 中
    stack.push(null);
    if (node.right) stack.push(node.right); // 右
    if (node.left) stack.push(node.left); // 左
  };
  return res;
};
//leetcode submit region end(Prohibit modification and deletion)
