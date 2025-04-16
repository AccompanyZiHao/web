const State = {
  // 初始状态
  initial: 1,
  // 标签开始
  tagOpen: 2,
  // 标签名称
  tagName: 3,
  // 文本状态
  text: 4,
  // 标签结束
  tagEnd: 5,
  // 结束标签名称状态
  tagEndName: 6,
};

// 是否是字母
function isAlpha(char) {
  return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
}

/*
* 解析模板字符串，生成 token
* @params str 字符串模板
* */
function tokenzie(str) {
  // 初始化状态机的状态
  let currentState = State.initial;
  // 缓存字符串
  let chars = [];
  // 生成的 token 数组 作为函数的返回值
  let tokens = [];

  // 只要模板字符串有字符，就一直循环
  while (str) {
    // 获取第一字符
    const char = str[0];

    // 匹配状态机的状态
    switch (currentState) {
      // 初始状态
      case State.initial:
        if (char === '<') {
          // 如果是 <，则进入标签开始状态
          currentState = State.tagOpen;
          // 删除第一个字符
          str = str.slice(1);
        } else if (isAlpha(char)) {
          // 标签结束的时候，会初始化
          // 如果是字母，则进入文本状态
          currentState = State.text;
          // 文本内容放入 chars 中
          chars.push(char);
          str = str.slice(1);
        }
        break;

      // 标签开始状态
      case State.tagOpen:
        if (isAlpha(char)) {
          // 如果是字母，则进入标签名称状态
          currentState = State.tagName;
          // 标签名称放入 chars 中
          chars.push(char);
          str = str.slice(1);
        } else if (char === '/') {
          // 结束标签
          currentState = State.tagEnd;
          str = str.slice(1);
        }
        break;

      // 标签名称状态
      case State.tagName:
        if (isAlpha(char)) {
          // 如果是字母，则继续
          chars.push(char);
          str = str.slice(1);
        } else if (char === '>') {
          // 如果是 >，则切换到初始状态
          currentState = State.initial;

          // 创建一个标签放入 tokens 中， 此时 chars 数组中缓存的内容就是标签的名称
          tokens.push({
            type: 'tag',
            name: chars.join('')
          });

          // 由于 chars 内容已被使用，这里需要清空
          chars = [];
          str = str.slice(1);
        }
        break;

      // 文本状态
      case State.text:
        if (isAlpha(char)) {
          // 如果是字母，则继续
          chars.push(char);
          str = str.slice(1);
        } else if (char === '<') {
          // 如果是 <，则切换到标签开始状态
          currentState = State.tagOpen;

          // 创建一个文本节点放入 tokens 中， 此时 chars 数组中缓存的内容就是文本内容
          tokens.push({
            type: 'text',
            content: chars.join('')
          });

          chars = [];
          str = str.slice(1);
        }
        break;

      // 标签结束状态
      case State.tagEnd:
        if (isAlpha(char)) {
          // 如果是字母，则进入结束标签名称状态
          currentState = State.tagEndName;
          // 结束标签名称放入 chars 中
          chars.push(char);
          str = str.slice(1);
        }
        break;

      // 结束标签名称状态
      case State.tagEndName:
        if (isAlpha(char)) {
          // 如果是字母，则继续
          chars.push(char);
          str = str.slice(1);
        } else if (char === '>') {
          // 如果是 >，则切换到初始状态
          currentState = State.initial;

          // 创建一个结束标签放入 tokens 中， 此时 chars 数组中缓存的内容就是结束标签的名称
          tokens.push({
            type: 'tagEnd',
            name: chars.join('')
          });

          chars = [];
          str = str.slice(1);
        }
        break;
    }
  }

  return tokens;
}


module.exports = tokenzie
