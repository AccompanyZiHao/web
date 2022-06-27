---
title: vue3 Composition API
author: 白菜
date: '2022-04-20'
issueId: 7
---

<!--
https://v3-migration.vuejs.org/breaking-changes/

Composition API
SFC Composition API Syntax Sugar (<script setup>)
Teleport
Fragments
Emits Component Option
createRenderer API from @vue/runtime-core to create custom renderers
SFC State-driven CSS Variables (v-bind in <style>)
SFC <style scoped> can now include global rules or rules that target only slotted content
Suspense experimental -->

组合式 API 是一系列 API 的集合，使我们可以使用函数而不是声明选项的方式书写 Vue 组件


更好的逻辑复用

组合式 API 最基本的优势是它使我们能够通过组合函数来实现更加简洁高效的逻辑复用。它解决了所有 mixins 的缺陷，那是选项式 API 中一种逻辑复用机制。
