//你可以选择使用单链表或者双链表，设计并实现自己的链表。
//
// 单链表中的节点应该具备两个属性：val 和 next 。val 是当前节点的值，next 是指向下一个节点的指针/引用。
//
// 如果是双向链表，则还需要属性 prev 以指示链表中的上一个节点。假设链表中的所有节点下标从 0 开始。
//
// 实现 MyLinkedList 类：
//
//
// MyLinkedList() 初始化 MyLinkedList 对象。
// int get(int index) 获取链表中下标为 index 的节点的值。如果下标无效，则返回 -1 。
// void addAtHead(int val) 将一个值为 val 的节点插入到链表中第一个元素之前。在插入完成后，新节点会成为链表的第一个节点。
// void addAtTail(int val) 将一个值为 val 的节点追加到链表中作为链表的最后一个元素。
// void addAtIndex(int index, int val) 将一个值为 val 的节点插入到链表中下标为 index 的节点之前。如果
//index 等于链表的长度，那么该节点会被追加到链表的末尾。如果 index 比长度更大，该节点将 不会插入 到链表中。
// void deleteAtIndex(int index) 如果下标有效，则删除链表中下标为 index 的节点。
//
//
//
//
// 示例：
//
//
//输入
//["MyLinkedList", "addAtHead", "addAtTail", "addAtIndex", "get",
//"deleteAtIndex", "get"]
//[[], [1], [3], [1, 2], [1], [1], [1]]
//输出
//[null, null, null, null, 2, null, 3]
//
//解释
//MyLinkedList myLinkedList = new MyLinkedList();
//myLinkedList.addAtHead(1);
//myLinkedList.addAtTail(3);
//myLinkedList.addAtIndex(1, 2);    // 链表变为 1->2->3
//myLinkedList.get(1);              // 返回 2
//myLinkedList.deleteAtIndex(1);    // 现在，链表变为 1->3
//myLinkedList.get(1);              // 返回 3
//
//
//
//
// 提示：
//
//
// 0 <= index, val <= 1000
// 请不要使用内置的 LinkedList 库。
// 调用 get、addAtHead、addAtTail、addAtIndex 和 deleteAtIndex 的次数不超过 2000 。
//
//
// Related Topics 设计 链表 👍 895 👎 0


//leetcode submit region begin(Prohibit modification and deletion)
class LinkNode {
  constructor(val, next) {
    this.val = val;
    this.next = next;
  }
}

var MyLinkedList = function () {
  this._size = 0;
  this._head = null;
};

MyLinkedList.prototype.getNode = function (index) {
  if (index < 0 || index >= this._size) return null;
  // 虚拟头节点
  let cur = new LinkNode(0, this._head);
  for (let i = 0; i < index + 1; i++) {
    cur = cur.next;
  }
  return cur;
};

/**
 * @param {number} index
 * @return {number}
 */
MyLinkedList.prototype.get = function (index) {
  // int get(int index) 获取链表中下标为 index 的节点的值。如果下标无效，则返回 -1 。
  return index >= 0 && index < this._size ? this.getNode(index).val : -1;
};

/**
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtHead = function (val) {
// void addAtHead(int val) 将一个值为 val 的节点插入到链表中第一个元素之前。在插入完成后，新节点会成为链表的第一个节点。
  this._head = new LinkNode(val, this._head);
  this._size++;
};

/**
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtTail = function (val) {
  // void addAtTail(int val) 将一个值为 val 的节点追加到链表中作为链表的最后一个元素。
  if (!this._head) {
    this._head = new LinkNode(val, null);
    this._size++;
    return;
  }
  let cur = this.getNode(this._size - 1);
  cur.next = new LinkNode(val, null);
  this._size++;
};

/**
 * @param {number} index
 * @param {number} val
 * @return {void}
 */
MyLinkedList.prototype.addAtIndex = function (index, val) {
// void addAtIndex(int index, int val) 将一个值为 val 的节点插入到链表中下标为 index 的节点之前。如果
  //index 等于链表的长度，那么该节点会被追加到链表的末尾。如果 index 比长度更大，该节点将 不会插入 到链表中。
  if (index > this._size) return;
  if (index === 0) {
    this.addAtHead(val);
    return;
  }
  let pre = this.getNode(index - 1);
  let cur = pre.next;
  pre.next = new LinkNode(val, cur);
  this._size++;
};

/**
 * @param {number} index
 * @return {void}
 */
MyLinkedList.prototype.deleteAtIndex = function (index) {
// void deleteAtIndex(int index) 如果下标有效，则删除链表中下标为 index 的节点。
  if (index === 0) {
    this._head = this._head.next;
    this._size--;
    return;
  }
  let pre = this.getNode(index - 1);
  if (!pre || !pre.next) return;
  let cur = pre.next;
  pre.next = cur.next;
  this._size--;
};

/**
 * Your MyLinkedList object will be instantiated and called as such:
 * var obj = new MyLinkedList()
 * var param_1 = obj.get(index)
 * obj.addAtHead(val)
 * obj.addAtTail(val)
 * obj.addAtIndex(index,val)
 * obj.deleteAtIndex(index)
 */
//leetcode submit region end(Prohibit modification and deletion)
// ["MyLinkedList","addAtHead","addAtTail","addAtIndex","get","deleteAtIndex","get"]
//   [[],[1],[3],[1,2],[1],[1],[1]]
var obj = new MyLinkedList();
// obj.addAtHead(1)
// obj.addAtTail(3)
// obj.addAtIndex(1,2)
// obj.get(1)
// obj.deleteAtIndex(1)
// obj.get(1)
//   ["MyLinkedList","addAtTail","get"]
//   [[],[1],[0]]
obj.addAtTail(1);
obj.get(0);
// obj.deleteAtIndex(0)


// Your input:["MyLinkedList","addAtHead","deleteAtIndex"]
//   [[],[1],[0]]
console.log('obj', obj);
