//给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。
//
// 
// 
// 
// 
// 
//
// 示例 1： 
// 
// 
//输入：head = [1,2,3,4,5]
//输出：[5,4,3,2,1]
// 
//
// 示例 2： 
// 
// 
//输入：head = [1,2]
//输出：[2,1]
// 
//
// 示例 3： 
//
// 
//输入：head = []
//输出：[]
// 
//
// 
//
// 提示： 
//
// 
// 链表中节点的数目范围是 [0, 5000] 
// -5000 <= Node.val <= 5000 
// 
//
// 
//
// 进阶：链表可以选用迭代或递归方式完成反转。你能否用两种方法解决这道题？ 
//
// Related Topics 递归 链表 👍 3285 👎 0


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
var reverseList = function (head) {
  // 首先判断是否为空链表或者只有一个元素的链表的情况
  if (!head || !head.next) return head;
  let cur = head;
  let pre = null;
  // 1 2 3 4 5
  while (cur) {
    let temp = null;

    // 2345 => 345
    temp = cur.next;
    // null => 1
    // 开始反转链表方向
    cur.next = pre;
    console.log('cur', cur);
    // 1 => 2
    // 为下一个节点的指向调转做准备 移动指针
    pre = cur;
    // 2345 => 345
    // 移动到下一个节点
    cur = temp;

    // [cur.next, pre, cur] = [pre, cur, cur.next]
  }
  return pre;
};

var reverseList = function (head) {
  if (head === null || head.next === null) return head;

  let next = head.next;
  let newList = reverseList(next);
  // 把当前的断开
  head.next = null;
  // 把前面的放到后面去
  next.next = head;
  return newList;
};


function reverse(pre, cur) {
  if (!cur) return pre;
  let next = cur.next;
  cur.next = pre;
  pre = cur;
  return reverse(pre, next);
}
var reverseList = function (head) {
  return reverse(null, head);
}
//leetcode submit region end(Prohibit modification and deletion)
