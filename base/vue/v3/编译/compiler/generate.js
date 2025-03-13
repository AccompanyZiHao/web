/*
* 代码升成
* @params node jsNode
* */
function generate(node) {
  const context = {
    // 最终生成的渲染函数代码
    code: '',
    // 代码拼接方法
    push(code) {
      context.code += code;
    },
    /*代码美化，增加可读性*/
    // 代码缩进的级别
    currentIndent: 0,
    // 换行, 换行之后增加 2 个空格字符
    newline() {
      context.code += `\n${ '  '.repeat(context.currentIndent) }`;
    },
    // 缩进函数
    indent() {
      context.currentIndent++;
      context.newline();
    },
    // 取消缩进
    dedent() {
      context.currentIndent--;
      context.newline();
    }
  };

  generateNode(node, context);

  return context.code;
}

/*
  * 匹配节点类型，并调用对应函数
  * */
function generateNode(node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      generateFunctionDel(node, context);
      break;
    case 'ReturnStatement':
      generateReturnStatement(node, context);
      break;
    case 'CallExpression':
      generateCallExpression(node, context);
      break;
    case 'StringLiteral':
      generateStringLiteral(node, context);
      break;
    case 'ArrayExpression':
      generateArrayExpression(node, context);
      break;
  }
}


/*
* 函数声明语句
* */
function generateFunctionDel(node, context) {
  const {
    push,
    indent,
    dedent
  } = context;

  // 函数名
  push(`function ${ node.id.name }`);
  push(`(`);

  // 函数的参数
  generateNodeList(node.params, context);
  push(`) {`);

  // 缩进
  indent();
  // 为函数体生成代码
  node.body.forEach((node) => generateNode(node, context));

  // 取消缩进
  dedent();
  push(`}`);

  /*
  *  function render () { .... }
  * */
}

/*
* 函数参数
* 1. 节点数组为 [node1, node2], 生成代码为 node1, node2
* 2. 如果节点前后添加 ()， 则生成代码为 (node1, node2) 可能用于参数声明
* 3. 如果节点前后添加 [] ，则生成代码为 [node1, node2] 仍是一个数组
* */
function generateNodeList(node, context) {
  const {push} = context;

  for (let i = 0; i < node.length; i++) {
    const item = node[i];
    generateNode(item, context);
    if (i < node.length - 1) {
      push(`, `);
    }
  }
}

// renter 语句
function generateReturnStatement(node, context) {
  const {push} = context;
  // 添加 return 和 空格
  push(`return `);

  // 递归调用 升成返回值的代码
  generateNode(node.return, context);
}

//
function generateCallExpression(node, context){
  const {push} = context;

  // 获取函数名 和 参数
  const {callee, arguments: arg} = node;
  // 函数名
  push(`${ callee.name }(`);
  // 生成参数
  generateNodeList(arg, context)

  // 补全括号
  push(`)`);
}

// 数组表达式
function generateArrayExpression(node, context) {
  const {push} = context;

  push(`[`)
  // 生成数组元素的代码
  generateNodeList(node.elements, context);
}

function generateStringLiteral(node, context) {
  const {push} = context;
  // 字符串则直接追加
  push(`'${ node.value }'`);
}

//  最终生成代码
// function render() {
//   return h('div', [h('p', 'vue'), h('p', 'template')])
// }

module.exports = generate;
