//给你二叉树的根节点 root ，返回其节点值的 层序遍历 。 （即逐层地，从左到右访问所有节点）。
//
//
//
// 示例 1：
//
//
//输入：root = [3,9,20,null,null,15,7]
//输出：[[3],[9,20],[15,7]]
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
// Related Topics 树 广度优先搜索 二叉树 👍 1805 👎 0


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
var levelOrder = function (root) {
//输入：root = [3,9,20,null,null,15,7]
//输出：[[3],[9,20],[15,7]]
//   1 2 4 8
  let res = [];
  let queue = [];
  if (root == null) return res;
  //  根节点入队
  queue.push(root);
  while (queue.length > 0) {
    // 记录当前层级节点数量
    const len = queue.length;
    //存放每一层的节点
    let curLevel = [];
    for (let i = 0; i < len; i++) {
      const node = queue.shift();
      curLevel.push(node.val);
      // 存放当前层下一层的节点
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(curLevel);
  }
  return res;
};

var levelOrder = function (root) {
  var result = [];
  if (root == null) {
    return [];
  }
  BFS(result, root, 0);
  return result;
};

function BFS(result, node, level) {
  if (node == null) return;
  // 初始化当前层级节点
  if (result.length == level) result.push([]);
  // 将当前节点推入当前层级节点
  result[level].push(node.val);
  // 递归左节点
  if (node.left) BFS(result, node.left, level + 1);
  // 递归右节点
  if (node.right) BFS(result, node.right, level + 1);
}

//leetcode submit region end(Prohibit modification and deletion)
