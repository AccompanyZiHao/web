---
title: tsx 初体验
author: 白菜
date: '2022-05-06'
categories:
  - 'JavaScript'
tags:
  - vue3
issueId: 14
---

## 为什么使用 tsx

一开始的时候只是好奇想多掌握一种技能，直到后来 `vue3` 问世之后，越来越多的越来越多的 ui 组件库都是用 `tsx` ，于是就赶紧体验一波。

怎么实现不重要，重要的是你能不能在众多的方案中寻找到一个最优解，这个才是最重要的。

话不多说代码先撸起来，下面是我常用的一些 `tsx` 的语法。

## tsx 配置

```JavaScript
$ npm install @vitejs/plugin-vue-jsx -D
# or
$ yarn add @vitejs/plugin-vue-jsx -D
```

安装完之后在`vite.config.ts`进行插件使用，代码如下：

```JavaScript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  plugins: [
    vue(),
    vueJsx() //插件使用
  ],
});
```

**tsconfig.json**:

```JavaScript
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```

## 语法

### 在 TSX 中嵌入表达式

```JavaScript
function double (value: number){
  return 2 * value
}
const person = {
  name: '白菜',
  age: 9,
  avatarUrl: '',
}
const app = (
  <h1>
    Hello, {person.name} age is {double(person.age)}!
  </h1>
);
```

`tsx` 也可以是一个表达式

```JavaScript
function h1Dom(person) {
  if (person) {
    return <h1>Hello, {person.name} age is {double(person.age)}!!</h1>;
  }
  return <h1>Hello, handsome young man</h1>;
}
```

### Fragment

vue3 的模板中是支持多节点的写法的

```JavaScript
<template>
  <div></div>
  <div></div>
</template>
```

但是 tsx 還是不支持这种写的，必须要只有一个很节点

```JavaScript
const app = () => (
  <>
    <div>tsx</div>
    <div>Fragment</div>
  </>
);
```

### v-bind

```JavaScript
const avatarUrl = <img src={person.avatarUrl}></img>;
// or
const avatarUrl = <img src={person.avatarUrl}/>;
```

### 事件处理

```JavaScript
let num = 1
<button onClick={double(num)}>
  {{ num }}
</button>
```

自定义事件: 子组件向父组件传值，如： `onSuccess`

```JavaScript
export default defineComponent({
  name: 'Top',
  props: ['reward', 'diamond', 'rate', 'isDisabled', 'userId', 'language'],
  setup(props, { emit }) {
    return () => (
      <section>
        <top
          language={props.language}
          reward={props.reward}
          userId={props.userId}
          is-disabled={props.isDisabled}
          onSuccess={()=>{emit('success')}}
        ></top>
        <bot
          language={props.language}
          diamond={props.diamond}
          rate={props.rate}
        ></bot>
      </section>
    );
  },
});
```

### v-model

在 `vue3` + vite 里面可以使用 `v-model`, 也可以使用 `@input` + `:value` 的组合

### v-for

```JavaScript
const arr = [1,2,3,4]
const list = arr.map(v => <li>v</li>)

<ul>{list}</li>
```

### v-if/v-show

```JavaScript
const length = <div>this length is {str.length}</div>
<>
  {str.length && length}
  <div>hellow</div>
</>
```

`v-show` 则是通过 `display: none;/display: block;` 样式控制来实现的

### Slot

```JavaScript
const A = (props, { slots }) => (
  <>
    <h1>{ slots.default ? slots.default() : 'foo' }</h1>
    <h2>{ slots.bar?.() }</h2>
  </>
);

const App = {
  setup() {
    const slots = {
      bar: () => <span>B</span>,
    };
    return () => (
      <A v-slots={slots}>
        <div>A</div>
      </A>
    );
  },
};

// or

const App = {
  setup() {
    const slots = {
      default: () => <div>A</div>,
      bar: () => <span>B</span>,
    };
    return () => <A v-slots={slots} />;
  },
};

// or you can use object slots when `enableObjectSlots` is not false.
const App = {
  setup() {
    return () => (
      <>
        <A>
          {{
            default: () => <div>A</div>,
            bar: () => <span>B</span>,
          }}
        </A>
        <B>{() => "foo"}</B>
      </>
    );
  },
};
```
