//给你二叉树的根节点 root ，返回它节点值的 前序 遍历。
//
//
//
// 示例 1：
//
//
//输入：root = [1,null,2,3]
//输出：[1,2,3]
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
// 示例 4：
//
//
//输入：root = [1,2]
//输出：[1,2]
//
//
// 示例 5：
//
//
//输入：root = [1,null,2]
//输出：[1,2]
//
//
//
//
// 提示：
//
//
// 树中节点数目在范围 [0, 100] 内
// -100 <= Node.val <= 100
//
//
//
//
// 进阶：递归算法很简单，你可以通过迭代算法完成吗？
//
// Related Topics 栈 树 深度优先搜索 二叉树 👍 1138 👎 0


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
var preorderTraversal = function (root) {
//输入：root = [1,null,2,3]
//输出：[1,2,3]
//   中 左 右
  let stack = [];
  deep(root);
  return stack;
  function deep(root) {
    if (root === null) return [];
    stack.push(root.val);
    deep(root.left);
    deep(root.right);
  }
};

var preorderTraversal = function (root) {
  let stack = [root];
  let res = [];
  while (stack.length){
    if(!root) return;
    const node = stack.pop();
    res.push(node.val)
    node.right && stack.push(node.right)
    node.left && stack.push(node.left)
  }
  return res;
}

// 迭代法  栈
// 入栈：右 左
// 出栈： 中 左 右
var preorderTraversal = function (root) {
  let stack = [root];
  let res = [];
  let cur = null;
  while (stack.length){
    if(!root) return;
    const cur = stack.pop();
    res.push(cur.val)
    cur.right && stack.push(cur.right)
    cur.left && stack.push(cur.left)
  }
  return res;
}

// 统一迭代
// 前序遍历：中左右
// 压栈顺序：右左中
var preorderTraversal = function(root) {
  let res = []
  if(!root) return res;
  const stack = [root];

  while(stack.length) {
    const node = stack.pop();
    if(!node) {
      res.push(stack.pop().val);
      continue;
    }
    if (node.right) stack.push(node.right); // 右
    if (node.left) stack.push(node.left); // 左
    stack.push(node); // 中
    stack.push(null);
  };
  return res;
};


//leetcode submit region end(Prohibit modification and deletion)
