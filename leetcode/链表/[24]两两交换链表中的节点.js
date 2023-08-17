//给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。 
//
// 
//
// 示例 1： 
// 
// 
//输入：head = [1,2,3,4]
//输出：[2,1,4,3]
// 
//
// 示例 2： 
//
// 
//输入：head = []
//输出：[]
// 
//
// 示例 3： 
//
// 
//输入：head = [1]
//输出：[1]
// 
//
// 
//
// 提示： 
//
// 
// 链表中节点的数目在范围 [0, 100] 内 
// 0 <= Node.val <= 100 
// 
//
// Related Topics 递归 链表 👍 1977 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var swapPairs = function(head) {
  //输入：head = [1,2,3,4]
  //输出：[2,1,4,3]
  if(!head) return head;
  let ret = new ListNode(-1, head);
  let temp = ret; // -1 1 2 3 4
  while (temp.next && temp.next.next){
    // 临时节点
    let pre = temp.next; // 1 2 3 4
    console.log('pre', pre);
    let cur = temp.next.next; // 2 3 4

    // 交换
    pre.next = cur.next;  // 3 4
    cur.next = pre; //  1 3 4

    // 移动
    temp.next = cur; // 2 1 3 4
    temp = pre;  // 1 3 4
  }
  return ret.next;
};

//leetcode submit region end(Prohibit modification and deletion)
