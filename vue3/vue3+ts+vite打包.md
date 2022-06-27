---
title: vue3 + ts + vite 打包
author: 白菜
date: '2022-05-06'
categories:
  - 'JavaScript'
tags:
  - vue3
  - vite
  - TS
issueId: 13
---

做项目的时候用 `vue3+ts+vite` 写了几个简单 h5 的页面，但是打包出来的体积却有 20M+，稍微思考了下，之前的项目也没有这么大体积呀，看了下文件，明白了可能是图片的问题，图片比较多
然后就思考怎么做优化，于是就面向 `google` 找了个还不错的插件

1. 目前 `vite2.x` 是基于 `rollup` 打包的，而不是 `esbuild，` [详见这里](https://cn.vitejs.dev/guide/why.html#slow-server-start)
2. 打包使用的是 `rollup-plugin-visualizer`（类似`webpack`的插件：`webpack-bundle-analyzer`） 进行打包分析，打包之后，会在根目录默认生成一个 `report.html` 文件

## 打包分析 `npm i rollup-plugin-visualizer -D`

```JavaScript
import analyze from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    vue(),
    analyze(),
  ],
...
// or 自定义生成的文件名
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: true, brotliSize: true, filename: 'report.html' })
  ],
...

```

打包 `npm run build`, 会在根目录生成一个 `stats.html`, 在浏览器中打开

![alt](./../public/images/2022/vue3/build01.jpg 'build01')

## 文件压缩 `npm i vite-plugin-compression -D`

```JavaScript
import viteCompression from 'vite-plugin-compression';
plugins: [
 viteCompression(),
]
```

## 压缩图片 `npm i vite-plugin-imagemin -D`

由于 `imagemin` 在国内不好安装，有以下几个方案：

1. 使用 `yarn` 在 `package.json` 内配置(推荐)

```JavaScript
"resolutions": {
  "bin-wrapper": "npm:bin-wrapper-china"
},
```

2. 使用 npm,在电脑 host 文件加上如下配置即可

```JavaScript
199.232.4.133 raw.githubusercontent.com
```

3. 使用 cnpm 安装(不推荐)

```JavaScript
import viteImagemin from 'vite-plugin-imagemin'

plugins: [
  viteImagemin({
    gifsicle: {
      optimizationLevel: 7,
      interlaced: false,
    },
    optipng: {
      optimizationLevel: 7,
    },
    webp: {
      quality: 75,
    },
    mozjpeg: {
      quality: 65,
    },
    pngquant: {
      quality: [0.65, 0.9],
      speed: 4,
    },
    svgo: {
      plugins: [
        {
          removeViewBox: false,
        },
        {
          removeEmptyAttrs: false,
        },
      ],
    },
  }),
]
```

按照这个步骤我打包并没成功，而是打包卡主了，目前并没有发现好的解决方案，然后图片就采用手动压缩的方式进行， [tinypng](https://tinypng.com/)

文件里面有几个较大的 `.gif` 图片有个`10M+`，于是就采用`cdn`的方式外部引入，这样子就减少了打包的体积。

![alt](./../public/images/2022/vue3/build02.jpg 'build02')


浏览器兼容性问题
> Vite 的默认浏览器支持基线是Native ESM,此插件为不支持本机 ESM 的旧版浏览器提供支持。
```javascript
pnpm install vite-plugin-imagemin -D
```
vite.config.js
```javascript
import legacy from '@vitejs/plugin-legacy'

export default {
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
}
```
