// 辅助打印日志函数
function dump(node, indent = 0) {
  const type = node.type;
  // 根节点没有描述
  // 如果是 element 节点，使用 node.tag
  // 如果是 text 节点，使用 node.content

  const desc = type === 'root' ? '' : type === 'element' ? node.tagName : node.content;

  console.log('  '.repeat(indent) + '- ' + type + ': ' + desc);

  if (node.children) {
    node.children.forEach(n => dump(n, indent + 2));
  }
}


function transform1(ast) {
  traverseNode(ast);

  console.log(dump(ast));

  function traverseNode(ast) {
    let currentNode = ast;

    // 替换标签名
    if (currentNode.type === 'element' && currentNode.tagName === 'p') {
      currentNode.tagName = 'h1';
    }

    // 转化文本
    if (currentNode.type === 'text') {
      currentNode.content = currentNode.content.toUpperCase();
    }
    // ...

    if (currentNode.children) {
      currentNode.children.forEach(n => traverseNode(n));
    }
  }
}

// 优化 解耦操作
function transform2() {

  traverseNode2(ast, {
    nodeTransforms: [
      // 转换标签
      transformElement,
      // 转换文本
      transformText,
    ]
  });

  dump(ast);

  function traverseNode2(ast, context) {
    let currentNode = ast;

    const transform = context.nodeTransforms;
    transform.forEach(fn => fn(currentNode, context));

    if (currentNode.children) {
      currentNode.children.forEach(n => traverseNode2(n, context));
    }

  }

  function transformElement(node) {
    if (node.type === 'element' && node.tagName === 'p') {
      node.tagName = 'h2';
    }
  }

  function transformText(node) {
    if (node.type === 'text') {
      node.content = node.content.toUpperCase();
    }
  }
}

// 增加删除，替换
function transform3() {
  const context = {
    // 当前正在转换的节点
    currentNode: null,
    // 当前节点在父节点的 children 中的索引
    childIndex: 0,
    // 当前转换的父节点
    parent: null,
    replaceNode(node) {
      // 找到当前节点在父节点中的位置然后替换节点
      context.parent.children[context.childIndex] = node;
      // 跟新当前节点
      context.currentNode = node;
    },
    // 移除
    removeNode(node) {
      if (context.parent) {
        // 找到当前节点在父节点中的位置然后 删除当前节点
        context.parent.children.splice(context.childIndex, 1);

        context.currentNode = null;
      }
    },
    nodeTransforms: [
      // 转换标签
      transformElement,
      // 转换文本
      transformText,
    ]
  };

  traverseNode(ast, context);

  dump(ast);

  function traverseNode(ast, context) {
    // 设置当前节点
    context.currentNode = ast;
    const {nodeTransforms} = context;

    // nodeTransforms.forEach(fn => fn(context.currentNode, context));
    for (let i = 0; i < nodeTransforms.length; i++) {
      nodeTransforms[i](context.currentNode, context);
      // 转换函数可能删除节点，每次转换完之后都要检查
      // 如果当前节点被删除了 直接 返回
      if (!context.currentNode) return;
    }

    const {children} = context.currentNode;
    if (children) {
      children.forEach((child, index) => {
        // 设置当前节点的父节点和索引
        context.parent = context.currentNode;
        context.childIndex = index;

        // 递归调用
        traverseNode(child, context);
      });
    }
  }

  function transformElement(node) {
    if (node.type === 'element' && node.tagName === 'p') {
      node.tagName = 'h2';
    }
  }

  function transformText(node, context) {
    if (node.type === 'text') {
      // 修改
      // node.content = node.content.toUpperCase();

      // 替换
      // context.replaceNode({
      //   type: 'element',
      //   tagName: 'span'
      // });

      // 删除
      context.removeNode();
    }
  }
}

// 增加进入，退出
function transform4() {
  const context = {
    // 当前正在转换的节点
    currentNode: null,
    // 当前节点在父节点的 children 中的索引
    childIndex: 0,
    // 当前转换的父节点
    parent: null,
    replaceNode(node) {
      // 找到当前节点在父节点中的位置然后替换节点
      context.parent.children[context.childIndex] = node;
      // 跟新当前节点
      context.currentNode = node;
    },
    // 移除
    removeNode(node) {
      if (context.parent) {
        // 找到当前节点在父节点中的位置然后 删除当前节点
        context.parent.children.splice(context.childIndex, 1);

        context.currentNode = null;
      }
    },
    nodeTransforms: [
      // 转换标签
      transformElement,
      // 转换文本
      transformText,
    ]
  };

  traverseNode(ast, context);

  dump(ast);

  function traverseNode(ast, context) {
    context.currentNode = ast;

    // 增加退出阶段的回调函数组
    let exitFns = [];

    const {nodeTransforms} = context;
    for (let i = 0; i < nodeTransforms.length; i++) {
      // 转换函数返回的函数 作为 退出阶段的回调函数
      const onExit = nodeTransforms[i](context.currentNode, context);

      if (onExit) {
        // 将退出阶段的回调函数放入数组中
        exitFns.push(onExit);
      }

      if (!context.currentNode) {
        // 如果当前节点被删除了，跳出循环
        break;
      }
    }

    const children = context.currentNode.children;
    if (children) {
      children.forEach((child, index) => {
        context.parent = context.currentNode;
        context.childIndex = index;

        traverseNode(child, context);
      });
    }

    // 退出阶段 从后往前执行，这样就保证了当前节点在退出之前，当前访问的节点所有的子节点都已经处理了
    for (let i = exitFns.length - 1; i > 0; i--) {
      exitFns[i]();
    }
  }

  function transformElement(node) {
    console.log('进入节点 transformElement ===', node.type, node.tagName);
    if (node.type === 'element' && node.tagName === 'p') {
      node.tagName = 'h2';
    }

    return () => {
      console.log('退出节点 transformElement ==>', node.type, node.tagName);
    };
  }

  function transformText(node, context) {
    console.log('进入节点 transformText===', node.type, node.tagName);
    if (node.type === 'text') {
      // 修改
      node.content = node.content.toUpperCase();

      // 替换
      // context.replaceNode({
      //   type: 'element',
      //   tagName: 'span'
      // });

      // 删除
      // context.removeNode()
    }

    return () => {
      console.log('退出节点 transformText ==>', node.type, node.tagName);
    };
  }
}


/* ===================== 转换辅助函数 start ===================== */
function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value
  };
}

function createIdentifier(name) {
  return {
    type: 'Identifier',
    name
  };
}

function createCallExpression(callee, arguments) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments
  };
}

function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements
  };
}

/* ===================== 转换辅助函数 end ===================== */

function transformText(node) {
  if (node.type !== 'text') return;

  // 文本节点对应的 jsAst 就是一个字符串的字面量
  // 通过 node.content 创建一个 StringLiteral 的节点
  // 将文本对应的节点添加到 node.jsNode 属性中
  node.jsNode = createStringLiteral(node.content);
}

function transformElement(node) {

  // 将转化代码写在退出阶段的回调函数中
  return () => {
    if (node.type !== 'element') {
      return;
    }

    // 创建 h 函数的调用语句， 第一个参数是 标签名
    const callExp = createCallExpression('h', [createStringLiteral(node.tagName)]);

    // 处理 h 函数的调用的参数
    if (node.children.length === 1) {
      // 如果是一个直接使用子节点的 node
      callExp.arguments.push(node.children[0].jsNode);
    } else {
      // 多个子节点则使用 createArrayExpression 节点作为参数，数组的每个元素都是子节点的 jsNode
      callExp.arguments.push(createArrayExpression(node.children.map(child => child.jsNode)));
    }

    // 讲当前标签节点对应的 jsAst 添加到 node.jsNode 属性中
    node.jsNode = callExp;
  };
}

function transformRoot(node) {
  return () => {
    if (node.type !== 'root') {
      return;
    }

    console.log('node.type transformRoot', node.type);

    // 当只有一个根节点的时候
    const vnodeJsAst = node.children[0].jsNode;

    node.jsNode = {
      type: 'FunctionDecl',
      id: createIdentifier('render'),
      params: [],
      body: [
        {
          type: 'ReturnStatement',
          return: vnodeJsAst
        }
      ]
    };
  };
}

function transform(ast) {
  const context = {
    // 当前正在转换的节点
    currentNode: null,
    // 当前节点在父节点的 children 中的索引
    childIndex: 0,
    // 当前转换的父节点
    parent: null,
    replaceNode(node) {
      // 找到当前节点在父节点中的位置然后替换节点
      context.parent.children[context.childIndex] = node;
      // 跟新当前节点
      context.currentNode = node;
    },
    // 移除
    removeNode(node) {
      if (context.parent) {
        // 找到当前节点在父节点中的位置然后 删除当前节点
        context.parent.children.splice(context.childIndex, 1);

        context.currentNode = null;
      }
    },
    nodeTransforms: [
      transformRoot,
      // 转换标签
      transformElement,
      // 转换文本
      transformText,
    ]
  };

  traverseNode(ast, context);

  dump(ast);

  function traverseNode(ast, context) {
    context.currentNode = ast;

    // 增加退出阶段的回调函数组
    let exitFns = [];

    const {nodeTransforms} = context;
    for (let i = 0; i < nodeTransforms.length; i++) {
      // 转换函数返回的函数 作为 退出阶段的回调函数
      const onExit = nodeTransforms[i](context.currentNode, context);

      if (onExit) {
        // 将退出阶段的回调函数放入数组中
        exitFns.push(onExit);
      }

      if (!context.currentNode) {
        // 如果当前节点被删除了，跳出循环
        break;
      }
    }

    const children = context.currentNode.children;
    if (children) {
      children.forEach((child, index) => {
        context.parent = context.currentNode;
        context.childIndex = index;

        traverseNode(child, context);
      });
    }

    // 退出阶段 从后往前执行，这样就保证了当前节点在退出之前，当前访问的节点所有的子节点都已经处理了
    for (let i = exitFns.length - 1; i >= 0; i--) {
      exitFns[i]();
    }
  }
}

module.exports = transform
