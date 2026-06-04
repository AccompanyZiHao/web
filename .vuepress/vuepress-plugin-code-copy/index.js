const path = require('path');

module.exports = (options, ctx) => {
  return {
    name: 'vuepress-plugin-code-copy',
    clientRootMixin: path.resolve(__dirname, 'clientRootMixin.js'),
    define: {
      copyButtonText: options.copyButtonText || 'copy',
      copiedButtonText: options.copiedButtonText || "copied!"
  },
    async ready() {
        console.log('Hello vuepress-plugin-code-copy!');
    }
  }
}