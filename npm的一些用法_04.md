---
title: npm 的一些用法
author: 白菜
date: '2022-04-27'
categories:
  - 'npm'
tags:
  - npm
---

## 升级

```sh
npm install -g npm
npm install -g npm@版本号
```

## 切换淘宝源

```sh
npm install -g cnpm --registry=http://registry.npm.taobao.org
https://registry.npmjs.com
```

## 查看全局安装包

```sh
npm list -g --depth=0
```

![image-20230328110042494](cdn.wuxiaobai.cn/img/image-20230328110042494.png)





npm adduser/ npm login

npm version patch

npm publish

登录失败 403
切换 源 `npm config set registry https://registry.npmjs.org/`
切换 源 `npm config set registry http://registry.npm.taobao.org/`
