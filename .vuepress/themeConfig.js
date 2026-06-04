// const { sidebar } = require('./sildebar');
// 本地运行不自动创建 Issue
const autoCreateIssue = process.env.npm_lifecycle_event.indexOf('build') > -1;

const themeConfig = {
  // valineConfig: {
  //   appId: '9ducOkS9KRIyOjYFJp1deov5-gzGzoHsz',// your appId
  //   appKey: 'MCFrl9mz7q078JP7zPh0d2sO', // your appKey
  // },
  vssueConfig: {
    isShowComments: true,
    autoCreateIssue: false,
    // admins: ['AccompanyZiHao'],
    platform: 'github',
    owner: 'AccompanyZiHao',
    repo: 'study',
    clientId: 'c6fac5a50d918399ae1f',
    // clientSecret: 'cc02f13b994e9285d82adab983368274e4255319',
    clientSecret: '6e70b95dbb18083819c54d53ec8b599776e30204',
  },
  type: 'blog',
  subSidebar: 'auto',
  nav: [
    { text: '首页', link: '/' },
    {
      text: '吴小白的博客',
      items: [
        { text: 'Github', link: 'https://github.com/AccompanyZiHao' },
        {
          text: '掘金',
          link: 'https://juejin.cn/user/2559318799689463',
        },
        // {
        //   text: '语雀',
        //   link: 'https://www.yuque.com/wuxiaobai-knowledge',
        // }
      ],
    },
    { text: 'TimeLine', link: '/timeline/', icon: 'reco-date' },
    { text: 'About', link: '/about/', icon: 'reco-account' },
  ],
  authorAvatar:
    'https://p26-passport.byteacctimg.com/img/user-avatar/4df5fcbe927ed531544e53686055b6e0~300x300.image',
  blogConfig: {
    category: {
      location: 2, // 在导航栏菜单中所占的位置，默认2
      text: 'Category', // 默认文案 “分类”
    },
    tag: {
      location: 3, // 在导航栏菜单中所占的位置，默认3
      text: 'Tag', // 默认文案 “标签”
    },
    // socialLinks: [     // 信息栏展示社交信息
    //   { icon: 'reco-github', link: 'ttps://github.com/AccompanyZiHao' },
    //   { icon: 'reco-npm', link: 'https://juejin.cn/user/2559318799689463' }
    // ]
  },
  record: '粤ICP备2022056635号',
  recordLink: 'http://beian.miit.gov.cn/',
  // cyberSecurityRecord: '公安部备案文案',
  // cyberSecurityLink: '公安部备案指向链接',
  // sidebar,
  // sidebar: [
  //   {
  //     title: '欢迎',
  //     path: '/',
  //     collapsable: false, // 不折叠
  //     // children: [{ title: 'about', path: '/' }],
  //   },
  //   {
  //     title: 'vue3',
  //     path: '/vue3/projectInit',
  //     collapsable: false, // 不折叠
  //     children: [
  //       { title: '项目搭建', path: '/vue3/projectInit' },
  //       { title: 'newFeatures', path: '/vue3/newFeatures' },
  //       { title: '源码解析一', path: '/vue3/source1' },
  //     ],
  //   },
  // ],
  // subSidebar: 'atuo',
  // lastUpdated: true, // string | boolean
};

module.exports = {
  themeConfig,
};
