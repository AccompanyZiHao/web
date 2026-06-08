const { themeConfig } = require('./themeConfig');

module.exports = {
  title: '吴小白 blog',
  // , 学习笔记，日常记录
  description: "wu xiao bai's blog， 一个前端小白，记录日常遇到的问题以及解决方案，总结归纳成文档以方便后续的查找阅读，寻找一起发现未来的新大陆的你。",
  head: [
    ['meta', { name: 'keywords', content: '吴小白，wuxiaobai，javascript，ES6，js，博客，总结，前端，归纳。 ' }],
    ['meta', { name: 'description', content: "" }],
    [
      'meta',
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    ['meta', { name: 'baidu-site-verification', content: 'code-hp6IEwjoOt' }],
    ['meta', { name: '360-site-verification', content: '19d8a61398aa8dafb3c57808fdec09fd' }],
    ['meta', { name: 'msvalidate.01', content: 'BCD4672E3D575EA13E440C8FCAF8ACED' }],
    [
      'link',
      {
        href: 'https://cdn.jsdelivr.net/npm/@docsearch/css@alpha',
        rel: 'stylesheet',
      },
    ],
    ['script', { src: 'https://cdn.jsdelivr.net/npm/@docsearch/js@alpha' }],
    [
      'script',
      {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?248d9036a61108ac328748f98ff1dcb0";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
      `,
    ],
    [
      'script', {}, `
      (function() {
         if (location.href.indexOf('github.io') > -1 || location.href.indexOf('gitee.io') > -1) {
             location.href = 'https://blog.haol.top'
         }
      })();
      `
    ]
  ],
  markdown: {
    externalLinks: { target: '_blank', rel: 'nofollow noopener noreferrer' },
  },
  theme: 'reco',
  themeConfig,
  locales: {
    '/': {
      lang: 'zh-CN',
    },
  },
  base: '',
  plugins: [
    [require('./vuepress-plugin-jsonld')],
    ['permalink-pinyin'],
    ['vuepress-reco/vuepress-plugin-loading-page'],
    [
      '@vuepress/last-updated',
      {
        transformer: (timestamp, lang) => {
          // 不要忘了安装 moment
          // return new Date(timestamp).toLocaleDateString();
          const moment = require('moment');
          moment.locale(lang);
          return moment(timestamp).format('YYYY/MM/DD/ HH:mm:ss');
        },
      },
    ],
    [
      require('./vuepress-plugin-code-copy'),
      {
        copyButtonText: '复制',
        copiedButtonText: '已复制！',
      },
    ],
    [
      'copyright',
      {
        authorName: '白菜', // 选中的文字将无法被复制
        minLength: 30, // 如果长度超过  30 个字符
      },
    ],
    // 鼠标点击效果
    [
      'cursor-effects',
      {
        size: 2, // size of the particle, default: 2
        shape: 'circle', // ['star' | 'circle'], // shape of the particle, default: 'star'
        zIndex: 999999999, // z-index property of the canvas, default: 999999999
      },
    ],
    [
      'dynamic-title',
      {
        showIcon:
          'https://p26-passport.byteacctimg.com/img/user-avatar/4df5fcbe927ed531544e53686055b6e0~300x300.image',
        showText: '客官欢迎回来~',
        hideIcon:
          'https://p26-passport.byteacctimg.com/img/user-avatar/4df5fcbe927ed531544e53686055b6e0~300x300.image',
        hideText: '客官不要走嘛~',
        recoverTime: 2000,
      },
    ],
    // https://ziyuan.baidu.com/https/index 百度站点收录
    // https://search.google.com/search-console/sitemaps goole
    [
      'sitemap',
      {
        hostname: 'https://blog.haol.top',
        // hostname: 'http://120.79.115.41/',
        // hostname: 'http://120.77.19.27/'
      },
    ],
    [
      'seo',
      {
        siteTitle: (_, $site) => 'wuxiaobai`s blog',
        title: ($page) => $page.title,
        description: ($page) => $page.frontmatter.description,
        author: (_, $site) => '吴小白',
        type: ($page) => 'article',
        url: (_, $site, path) => 'https://blog.haol.top' + path,
        image: ($page, $site) =>
          'https://p26-passport.byteacctimg.com/img/user-avatar/4df5fcbe927ed531544e53686055b6e0~300x300.image',
        publishedAt: ($page) =>
          $page.frontmatter.date && new Date($page.frontmatter.date),
        modifiedAt: ($page) => $page.lastUpdated && new Date($page.lastUpdated),
      },
    ],
  ],
  configureWebpack: () => {
    // 生产环境资源从博客自身域名加载，不再走 jsdelivr CDN
  },
};
