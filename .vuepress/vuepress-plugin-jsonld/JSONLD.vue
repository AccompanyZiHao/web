<template></template>

<script>
export default {
  created() {
    if (typeof this.$ssrContext !== 'undefined') {
      this.$ssrContext.userHeadTags += `<script type='application/ld+json'>
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "${this.$page.title}",
            "url": "${'https://wuxiaobai.cn' + this.$page.path}",
            "image": [
              "https://p26-passport.byteacctimg.com/img/user-avatar/4df5fcbe927ed531544e53686055b6e0~300x300.image"
              ],
            "datePublished": "${
              this.$page.frontmatter.date &&
              new Date(this.$page.frontmatter.date).toISOString()
            }",
            "dateModified": "${
              this.$page.lastUpdated &&
              new Date(this.$page.lastUpdated).toISOString()
            }",
            "author": [{
                "@type": "Person",
                "name": "吴小白",
                "url": "https://github.com/AccompanyZiHao/study"
            }]
          }
      <\/script>`;
    }
  },
};
</script>
