export default ({ router, Vue, isServer }) => {
  router.beforeEach((to, from, next) => {
    if (typeof _hmt !== "undefined") {
      if (to.path) {
        _hmt.push(["_trackPageview", to.fullPath]);
      }
    }

    next();
  });

  // 解决 theme: 'reco' 侧边栏不能正常
  router.onReady(() => {
    if (!isServer) {
      const { hash } = document.location;
      setTimeout(() => {
        if (hash.length > 1) {
          const id = decodeURIComponent(hash);
          const el = document.querySelector(`.reco-side-${decodeURIComponent(id).substring(1)}`);
          el && el.click();
        }
      }, 1000);
    }  
  });

  Vue.mixin({
    mounted() {
      // 不加 setTimeout 会有报错，但不影响效果
      setTimeout(() => {
        try {
          // docsearch({
          //   // appId: "43GX903BPS",
          //   // apiKey: "feff649032d8034cf2a636ef55d96054",
          //   // indexName: "ts-yayujs",
          //   container: '.search-box',
          //   debug: false
          // });
        } catch (e) {
          console.log(e);
        }
      }, 100)
    },
  });
};

