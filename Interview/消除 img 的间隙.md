---
title: '消除 img 的底部间隙'
author: 白菜
date: '2022-5-31 17:22:48'
categories:
  - css
  - 面试
tags:
  - css
  - 面试
#issueId:
---

## 问题描述

`img`和 `p` 之间有一行空白间隙，在浏览查看了盒模型，发现没有设置任何的 `padding` 和 `margin` 。

![alt](./../public/images/2022/interview/01.png '图片间隙')

## 解决方案

1. 把图片设置为块元素

```css
img {
  display: block;
}
```

2. 外层父元素设置 `font-size: 0`

```css
div {
  font-size: 0;
}
```

3. 修改 `img` 的 `vertical-align` 属性

```css
img {
  vertical-align: bottom;
}
img {
  vertical-align: middle;
}
img {
  vertical-align: top;
}
```

4. 浮动。

## 原因

当父元素没有设置高度的时候，父元素被子元素的高度撑开就会出现这种情况。

在 `css` 中， `inline-block` 的默认垂直对齐方式是基于基线对齐 `vertical-align: baseline`，因此修改基线对齐方式就可以改变这种情况。

既然是行内基线问题导致的，那么修改它的行内属性也可以解决。

那为什么 `font-size: 0` 可以解决呢?

它可以消除行内标签之间因为换行产生的间隙，比如我们在写 `html` 的时候，为了格式化代码，保持代码的美观与可读性，标签之间会有换行，并不会挨着写，这个时候 `font-size: 0` 就可以发挥作用了。

