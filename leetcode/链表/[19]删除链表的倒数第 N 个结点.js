//给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。 
//
// 
//
// 示例 1： 
// 
// 
//输入：head = [1,2,3,4,5], n = 2
//输出：[1,2,3,5]
// 
//
// 示例 2： 
//
// 
//输入：head = [1], n = 1
//输出：[]
// 
//
// 示例 3： 
//
// 
//输入：head = [1,2], n = 1
//输出：[1]
// 
//
// 
//
// 提示： 
//
// 
// 链表中结点的数目为 sz 
// 1 <= sz <= 30 
// 0 <= Node.val <= 100 
// 1 <= n <= sz 
// 
//
// 
//
// 进阶：你能尝试使用一趟扫描实现吗？ 
//
// Related Topics 链表 双指针 👍 2637 👎 0


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
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function(head, n) {
  //输入：head = [1,2,3,4,5], n = 2
  //输出：[1,2,3,5]
  let dummy = new ListNode(0, head);
  let fast = dummy;
  let slow = dummy;
  // 快指针先走n步
  // 快指针走到最后一个节点时，慢指针的下一个节点就是要删除的节点
  while (n--) {
    fast = fast.next;
  }
  while (fast.next) {
    fast = fast.next;
    slow = slow.next;
  }
  slow.next = slow.next.next;

  return dummy.next;
};
// 节点计数
var removeNthFromEnd = function(head, n) {
  let size = 0;
  let cur = head;
  while (cur) {
    cur = cur.next;
    size++;
  }

  // 删除头节点
  if (size === n) {
    return head.next;
  }
  // 删除非头节点
  cur = head;
  while (size - n - 1){
    cur = cur.next;
    size--;
  }

  cur.next = cur.next.next;
  return head;
}

// 递归倒退n法
var removeNthFromEnd = function(head, n) {
  const dummy = new ListNode(0, head);
  let index = 0;
  recur(dummy);
  return dummy.next;
  function recur(node){
    if(!node) return

    console.log('cc', node);
    recur(node.next); // 递归到最后一个节点

    console.log(111, index, n, node)

    // 从最后一个节点开始计数，当index === n时，删除下一个节点
    if(index === n){
      node.next = node.next.next;
    }
    index++;
  }
}



//leetcode submit region end(Prohibit modification and deletion)
