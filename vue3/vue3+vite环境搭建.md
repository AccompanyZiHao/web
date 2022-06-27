---
title: vue3 + vite 环境搭建
author: 白菜
date: '2022-01-21'
categories:
  - 'JavaScript'
tags:
  - vue3
  - vite
issueId: 6
---

今天起床就看到尤大大更新了微博具体详情[戳这里](https://zhuanlan.zhihu.com/p/460055155)，`Vue3` 将在 2022 年 2 月 7 日 成为新的默认版本。`vue3` 要上位了呀，现在的你没有用过 `vue3` 嘛，用过的小伙伴已经可以忽略了，还没用过的小伙伴可以看一下这篇文章，使用 `vite` 和 `vue3` 创建一个项目。

## 初始化项目

```JavaScript
$ npm init vite@latest <project-name>

$ cd <project-name>
$ npm install
$ npm run dev
```

![alr](./../public/images/2022/vue3_create.jpg 'vue3-init')

## 安装路由

`npm i vue-router@next`

src 文件夹下新建 router/index

```JavaScript
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: `/hellWord`,
    name: 'hellWord',
    component: () => import('../components/HelloWorld.vue'),
  },
  {
    path: `/upload`,
    name: 'upload',
    component: () => import('../views/upload/index.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

export default router;
```

路由有三种模式

1. createWebHistory 创建 history 路由模式
2. createWebHashHistory 创建 hash 路由模式
3. createMemoryHistory 创建基于内存的历史记录

在 `main` 中使用路由

```JavaScript
import { createApp } from "vue";
import App from "./App.vue";
import router from './router/index'

createApp(App).use(router).mount("#app");
```

在 `app.vue` 中添加 `router-view`

```JavaScript
<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <router-link :to="'/hellWord'">hellWord</router-link><br>
  <router-link :to="'/upload'">upload</router-link><br>
  <router-view></router-view>
</template>
```

## 项目配置

```JavaScript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
// const path = require('path')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // 打包路径
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    extensions: ['.js', '.json', '.ts']
  },
  server: {
    port: 4000, // 服务端口号
    open: false, // 服务启动时是否自动打开浏览器
    cors: true, // 允许跨域
    proxy: {
      '/api':{
        target: 'http://192.168.2.156/',
        changeOrigin: true,
        rewrite: (path) => path.replace('^/api', '/api')
      }
    }
  },
})
```

这里使用 `require` 会报错，需要安装 `@types/node`

`npm i --save-dev @types/node`

然后 `npm run dev`， 这样子项目就跑起来了

结果如图所示
![alr](./../public/images/2022/vue3demo01_1.jpg 'demo')

关于个 `vuex` ，个人感觉在 `vue3` 中的作用暂时还不是很大，当然可能是我的项目比较简单，暂时没有用到吧，关于项目搭建的话就先介绍到这里，项目搭建其实还是没有多少坑的，相对而言比较简单。

## 使用 pnpm

通过 npm 全局安装， 这个 node 版本是有要求的

```javascript
npm install -g pnpm
```

查看镜像

```javascript
pnpm config get registry
```

设置淘宝镜像

```javascript
pnpm config set registry http://registry.npm.taobao.org
```

```javascript
pnpm create vite mobile
```

![alt](./../public/images/2022/vue3/init01.jpg 'init')

```javascript
cd mobile
pnpm install
pnpm run dev
```
