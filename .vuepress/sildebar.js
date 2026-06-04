const fs = require('fs');
const path = require('path');
const process = require('process');

const workPath = path.join(process.cwd() + '/docs');
const ignoreFileList = ['.vuepress', 'public'];

const HomeTitle = '欢迎';

function buildSidebar(path, parentName = '') {
  const files = fs.readdirSync(path);
  let result = [];
  files.forEach((file) => {
    if (ignoreFileList.includes(file)) return;
    const suffixName = file.slice(-3);
    let title;
    let index;
    if (suffixName === '.md') {
      const fileName = file.slice(0, -3);
      [title, index] = fileName.split('_');
    } else {
      title = file;
    }
    const current = { title, index };
    const subPath = `${path}/${file}`;
    if (fs.statSync(subPath).isDirectory()) {
      current.children = buildSidebar(subPath, `${parentName}/${file}`);
    } else {
      if (file === 'README.md') {
        current.path = `${parentName}/`;
        current.title = HomeTitle;
      } else {
        if (suffixName !== '.md') return;
        current.path = `${parentName}/${file.slice(0, -3)}`;
      }
    }
    result.push(current);
  });
  return result;
}
const sidebar = buildSidebar(workPath);

// 设置 ID
function setID(item) {
  switch (item.title) {
    case HomeTitle:
      item.id = 1;
      break;
    case 'ES6':
      item.id = 2;
      break;
    case 'vue3':
      item.id = 3;
      break;
    case 'other':
      item.id = 4;
      break;
    default:
      break;
  }
}

// 排序
function sort(arr = sidebar) {
  return arr
    .map((item) => {
      item.children?.sort((a, b) => a.index - b.index);
      setID(item);
      return item;
    })
    .sort((a, b) => a.id - b.id);
}

module.exports = {
  sidebar: sort(),
};
