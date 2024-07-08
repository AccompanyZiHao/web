//给定一个二叉树的根节点 root ，返回 它的 中序 遍历 。
//
//
//
// 示例 1：
//
//
//输入：root = [1,null,2,3]
//输出：[1,3,2]
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
// 树中节点数目在范围 [0, 100] 内
// -100 <= Node.val <= 100
//
//
//
//
// 进阶: 递归算法很简单，你可以通过迭代算法完成吗？
//
// Related Topics 栈 树 深度优先搜索 二叉树 👍 1918 👎 0


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
var inorderTraversal = function (root) {
  let stack = [];
  deep(root);
  return stack;

  function deep(node) {
    if (node === null) return;
    deep(node.left);
    stack.push(node.val);
    deep(node.right);
  }
};

// 入栈 左 -> 右
// 出栈 左 -> 中 -> 右
var inorderTraversal = function (root) {
  let res = [];
  let stack = [];

  let cur = root;
  while (stack.length || cur) {
    if(cur){
      stack.push(cur);
      cur = cur.left;
    }else{
      const node = stack.pop();
      res.push(node.val);
      cur = node.right;
    }
  }
  return res;
};
//  中序遍历：左中右
//  压栈顺序：右中左
// 要处理的节点放入栈之后，紧接着放入一个空指针作为标记。 这种方法也可以叫做标记法。

var inorderTraversal = function(root, res = []) {
  const stack = [];
  if (root) stack.push(root);
  while(stack.length) {
    const node = stack.pop();
    if(!node) {
      res.push(stack.pop().val);
      continue;
    }
    if (node.right) stack.push(node.right); // 右
    // 添加中节点
    stack.push(node); // 中
    // 加入空节点做为标记。
    stack.push(null);
    if (node.left) stack.push(node.left); // 左
  };
  return res;
};
//leetcode submit region end(Prohibit modification and deletion)
