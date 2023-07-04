/*
* 1. 词法分析 Lexical Analysis
*   1.1 将文本份割成一个个 Token
*   1.2 生成方式
*     1.2.1 通过正则表达式
*     1.2.2 通过有限状态机 在有限个输入的情况下，在这些状态中转移并期望最终达到终止状态。
* 2. 语法分析 Syntactic Analysis
*   2.1 将 Token流 + 结合文法规则 =》 AST(Abstract Syntax Tree) 抽象语法树
* 3. 代码转换 Code Transformation
*    3.1 将 AST 转换成另一种 AST
* 4. 代码生成 Code Generation
* */

let obj = reactive()

// 词法分析
const tokenizer = (input) => {
  // 当前索引
  let current = 0;
  // 存放token的数组
  let tokens = [];

  while (current < input.length) {
    // 当前字符串
    let char = input[current];
    // 左括号 设置一个 type 为 paren，值为 ( 的对象，然后将 current 加 1 继续循环
    if (char === '(') {
      tokens.push({
        type: 'paren',
        value: '(',
      });
      current++;
      continue;
    }
    // 右括号 设置一个 type 为 paren，值为 ( 的对象，然后将 current 加 1 继续循环
    if (char === ')') {
      tokens.push({
        type: 'paren',
        value: ')',
      });
      current++;
      continue;
    }

    // 空格则跳过
    let WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    let NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = '';
      // 如果是数字，那么就继续循环，直到不是数字为止
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value
      });
      continue;
    }

    if (char === '"') {
      let value = '';
      char = input[++current];
      // 如果是引号，那么就继续循环，直到不是引号为止
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({
        type: 'string',
        value
      });
      continue;
    }

    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';
      // 如果是字母，那么就继续循环，直到不是字母为止
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'name',
        value
      });
      continue;
    }

    throw new TypeError('I dont know what this character is: ' + char);
  }
  return tokens;
};
/*
tokenizer:

[
  { type: 'paren', value: '(' },
  { type: 'name', value: 'add' },
  { type: 'number', value: '2' },
  { type: 'paren', value: '(' },
  { type: 'name', value: 'subtract' },
  { type: 'number', value: '4' },
  { type: 'number', value: '2' },
  { type: 'paren', value: ')' },
  { type: 'paren', value: ')' }
]
*/


// 语法分析
function parser(tokens) {
  // 当前索引
  let current = 0;

  function walk() {
    let token = tokens[current];

    if (token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    if (token.type === 'string') {
      current++;
      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }

    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current];

      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };

      token = tokens[++current];
      // 递归
      while (token.type !== 'paren' || (token.type === 'paren' && token.value !== ')')) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }

    throw new TypeError(token.type);
  }

  let ast = {
    type: 'Program',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
}

/**
 *
 * ----------------------------------------------------------------------------
 *   Original AST                     |   Transformed AST
 * ----------------------------------------------------------------------------
 *   {                                |   {
 *     type: 'Program',               |     type: 'Program',
 *     body: [{                       |     body: [{
 *       type: 'CallExpression',      |       type: 'ExpressionStatement',
 *       name: 'add',                 |       expression: {
 *       params: [{                   |         type: 'CallExpression',
 *         type: 'NumberLiteral',     |         callee: {
 *         value: '2'                 |           type: 'Identifier',
 *       }, {                         |           name: 'add'
 *         type: 'CallExpression',    |         },
 *         name: 'subtract',          |         arguments: [{
 *         params: [{                 |           type: 'NumberLiteral',
 *           type: 'NumberLiteral',   |           value: '2'
 *           value: '4'               |         }, {
 *         }, {                       |           type: 'CallExpression',
 *           type: 'NumberLiteral',   |           callee: {
 *           value: '2'               |             type: 'Identifier',
 *         }]                         |             name: 'subtract'
 *       }]                           |           },
 *     }]                             |           arguments: [{
 *   }                                |             type: 'NumberLiteral',
 *                                    |             value: '4'
 * ---------------------------------- |           }, {
 *                                    |             type: 'NumberLiteral',
 *                                    |             value: '2'
 *                                    |           }]
 *  (sorry the other one is longer.)  |         }
 *                                    |       }
 *                                    |     }]
 *                                    |   }
 * ----------------------------------------------------------------------------
 */

// ast 转换 newAst
/**
 * 遍历 ast
 * @param ast
 * @param visitor
 */
function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {

    // 观察者的钩子函数
    let methods = visitor[node.type];
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    // 按节点类型分别处理
    switch (node.type) {
      case 'Program':
        traverseArray(node.body, node);
        break;

      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      case 'NumberLiteral':
      case 'StringLiteral':
        break;

      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  // 开始遍历 顶层是 null
  traverseNode(ast, null);
}

function transformer(ast) {
  let newAst = {
    type: 'Program',
    body: [],
  };

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'NumberLiteral',
          value: node.value,
        });
      },
    },
    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: 'StringLiteral',
          value: node.value,
        });
      },
    },
    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: node.name,
          },
          arguments: [],
        };

        node._context = expression.arguments;

        if (parent.type !== 'CallExpression') {
          expression = {
            type: 'ExpressionStatement',
            expression: expression,
          };
        }

        parent._context.push(expression);
      },
    },
  });

  return newAst;
}


function codeGenerator(node) {
  switch (node.type) {
    case 'Program':
      return node.body.map(codeGenerator).join('\n');

    case 'ExpressionStatement':
      return (
        codeGenerator(node.expression) + ';' // << (...because we like to code the *correct* way)
      );

    case 'CallExpression':
      return codeGenerator(node.callee) + '(' + node.arguments.map(codeGenerator).join(', ') + ')';

    case 'Identifier':
      return node.name;

    case 'NumberLiteral':
      return node.value;

    case 'StringLiteral':
      return '"' + node.value + '"';

    default:
      throw new TypeError(node.type);
  }
}

/*
* input => tokenizer => tokens; // 词法分析
* tokens => parser => ast; // 语法分析，生成AST
* ast => transformer => newAst; // 中间层代码转换
* newAst => generator => output; // 生成目标代码
* */

const input = '(add 2 (subtract 4 2))';
// const input = 'var a = 1';

function compiler(input) {
  const tokens = tokenizer(input);
  const ast = parser(tokens);
  const newAst = transformer(ast);
  const output = codeGenerator(newAst);
  console.log('ast', tokens);
  console.log('ast', JSON.stringify(ast));
  console.log('newAst', JSON.stringify(newAst));
  console.log('===');

  console.log('output', output);
  return output;
}

compiler(input);

// 原文仓库 https://github.com/jamiebuilds/the-super-tiny-compiler

