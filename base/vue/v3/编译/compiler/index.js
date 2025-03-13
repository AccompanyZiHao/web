const tokenzie = require('./tokenzie');
const parse = require('./parse');
const transform = require('./transform');
const generate = require('./generate');

const template = '<div><p>Vue</p><p>React</p></div>';

const tokens = tokenzie(template);
console.log(tokens);

const ast = parse(tokens);
console.dir(ast, {depth: 99});

transform(ast);
console.dir(ast.jsNode, {depth: 99});

const code = generate(ast.jsNode);
console.log(code);
