/*
* 解析 tokens，生成 ast
* @params tokens token 数组
* */
function parse(tokens) {
  // 创建一个根节点
  const root = {
    type: 'root',
    children: []
  };

  // 将根节点压入栈中
  const elementStack = [root];

  // 扫描 tokens
  while (tokens.length) {
    // 获取当前栈顶的节点作为父节点
    const parent = elementStack[elementStack.length - 1];

    // 获取第一个 token
    const token = tokens.shift();

    switch (token.type) {
      case 'tag':
        // 创建一个元素节点
        const elementNode = {
          type: 'element',
          tagName: token.name,
          children: []
        };

        // 将元素节点添加到父级节点的 children 中
        parent.children.push(elementNode);
        // 将当前节点压入栈中
        elementStack.push(elementNode);

        break;

      case 'text':
        // 创建一个文本节点
        const textNode = {
          type: 'text',
          content: token.content
        };

        // 将文本节点添加到父级节点的 children 中
        parent.children.push(textNode);
        break;

      case 'tagEnd':
        // 弹出栈顶的节点
        elementStack.pop();
        break;
    }
  }

  return root;
}

module.exports = parse
