---
title: ts 语法一
author: 白菜
date: '2022-05-06'
categories:
  - 'JavaScript'
tags:
  - TS
issueId: 15
---

## 一. 基础类型

### 1. boolean 类型

```JavaScript
let isStart: boolean = true
```

### 2. number 类型

```JavaScript
let count: number = 6;
```

### 3. string 类型

```JavaScript
let name: string = "baicai";
```

### 4. Array 类型

```JavaScript
let list: number[] = [1, 2, 3];
// or 使用数组泛型
let list: Array<number> = [1, 2, 3];
```

### 5. Tuple 类型

一般数组是由同种类型的元素组成，当其中某个元素需要存储不同类型的值的时候，我们就可以使用元组。

```JavaScript
let arr: [string, number];
arr = ['hello', 10]; // OK
arr = [10, 'hello']; // Error
```

如果修改数组的元素的类型与初始化的 Tuple 类型不匹配就会报错。

```JavaScript
arr[0] = 1; // Error
arr[1] = 6; // OK
```

这个数组的长度是 2，如果往里面添加的时候我们需要添加 `string | number` 联合类型，联合类型还有面会讲到。

> 当访问一个越界的元素，会使用联合类型替代。

```JavaScript
arr[3] = 'world' // OK
arr[4] = 11      // OK
arr[5] = true    // Error
```

### 6. emnu 类型

枚举可以让我们定义一组带名字的常量用例，目前仅支持 `string` 和 `number` 类型。

```JavaScript
enum Color {Red, Green, Blue}
let c: Color = Color.Green;
console.log(c) // 1
```

上面的程序编译后

```JavaScript
var Color;
(function (Color) {
    Color[Color["Red"] = 0] = "Red";
    Color[Color["Green"] = 1] = "Green";
    Color[Color["Blue"] = 2] = "Blue";
})(Color || (Color = {}));
let c = Color.Green;
```

默认情况下，从 0 开始为元素编号,也可以手动指定元素的数值。

```JavaScript
enum Color {Red = 1, Green, Blue = 'str'}
let c: Color = Color.Green;
let d: Color = Color.Blue;
console.log(c) // 2
console.log(d) // str
```

### 7. any 类型

当你不清楚某个变量的类型的时候可以使用 any 来标记这些变量。

```JavaScript
let list: any[] = [1, true, "free"];
list[1] = 100;
```

`any` 类型的变量只是允许你给它赋任意值

```JavaScript
let notSure: any = 666;
notSure = '888'
notSure = true
```

`any` 类型本质上是类型系统的一个逃逸舱, 允许开发者对该类型执行任何的赋值操作，却不需要任何形式检查，这样就无法使用 `TypeScript` 提供的检查保护机制，为了解决 `any` 带来的问题， `TypeScript` 提供了一个新的类型 `unknown`

### 8. unknown 类型

unknown 和 any 类型类似，所有类型都可以赋值给 unknown

```JavaScript
let value: unknown;

value = true;           // OK
value = 42;             // OK
value = "Hello World";  // OK
value = [];             // OK
value = {};             // OK
```

赋值没问题，我们尝试将类型为 `unknown` 的值赋值给其他类型的变量时会发生什么？

```JavaScript
let value: unknown;

let value1: unknown = value; // OK
let value2: any = value;     // OK
let value3: boolean = value; // Error
Type 'unknown' is not assignable to type 'boolean'
```

`unknown` 类型只能被赋值给 `any` 类型和 `unknown` 类型本身, 如果其他类型也可以赋值的话那不就是乱套了嘛，毕竟我们也不知道 `value` 是什么类型的

### 9. Void 类型

它表示没有任何类型。 当一个函数没有返回值时，你通常会见到其返回值类型是 void：

```JavaScript
function warnUser(): void {
    alert("This is my warning message");
}
```

需要注意的是，声明一个 void 类型的变量没有什么作用，因为它的值只能为 undefined 或 null：

```JavaScript
let unusable: void = undefined;
```

### 10. Null 和 Undefined 类型

`undefined` 和 `null` 两者各自有自己的类型分别叫做 `undefined` 和 `null` 。 和`void`相似，它们的本身的类型用处不是很大

```JavaScript
let u: undefined = undefined;
let n: null = null;
```

### 11. Never 类型

`never` 类型表示的是那些永不存在的值的类型。

例如，`never` 类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型

```JavaScript
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
    throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
    return error("Something failed");
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
    while (true) {
    }
}
```

### 类型断言

当你比`TypeScript`更了解某个值的比它现有类型更确切的类型的时候可以使用断言，类型断言好比其它语言里的类型转换，但是不进行特殊的数据检查和解构。 它没有运行时的影响，只是在编译阶段起作用。 `TypeScript`会假设你已经进行了必须的检查。

类型断言有两种形式。

1. `<>` 语法：

```JavaScript
let str: any = "this is a string";

let strLength: number = (<string>str).length;
```

2. `as` 语法

```JavaScript
let str: any = "this is a string";

let strLength: number = (str as string).length;
```

**_注意_**： 当在`TypeScript`里使用`JSX`时，只有`as`语法断言是被允许的。

## 二. interface 接口

```JavaScript
interface Person {
  name: string;
  age: number;
}

let bc: Person = {
  name: "baiCai",
  age: 18,
};
```

接口就好比一个名字，用来描述上面例子里的要求, 类型检查器不会去检查属性的顺序，只要相应的属性存在并且类型也是对的就可以。

### 可选属性

```JavaScript
interface Person {
  name: string;
  age?: number;
}
```

### 只读属性

```JavaScript
interface Person {
  name: string;
  age?: number;
  readonly sex: string;
}
```

只读属性保证了一些对象属性只能在对象刚刚创建的时候修改其值。

`TypeScript`具有`ReadonlyArray<T>`类型，它与`Array<T>`相似，只是把所有可变方法去掉了，因此可以确保数组创建后再也不能被修改：

```JavaScript
let a: number[] = [1, 2, 3, 4];
let ro: ReadonlyArray<number> = a;
ro[0] = 12; // error!
ro.push(5); // error!
ro.length = 100; // error!
a = ro; // error!
```

当我们把 `ReadonlyArray` 赋值到一个普通数组也是不可以的。 但是我们可以用类型断言重写：

```JavaScript
a = ro as number[];
```

### 额外的属性

```JavaScript
interface Person {
  name: string;
  age?: number;
  readonly sex: string;
  [propName: string]: any;
}
```

### 函数类型

接口能够描述 `JavaScript` 中对象拥有的各种各样的外形。 除了描述带有属性的普通对象外，接口也可以描述函数类型。

```JavaScript
interface SearchFunc {
  (source: string, subString: string): boolean;
}
let mySearch: SearchFunc;
mySearch = function(source: string, subString: string) {
  let result = source.search(subString);
  return result > -1;
}
// or
// 对于函数类型的类型检查来说，函数的参数名不需要与接口里定义的名字相匹配
let mySearch: SearchFunc;
mySearch = function(src, sub) {
    let result = src.search(sub);
    return result > -1;
}
```

### 继承接口

```JavaScript
interface Shape {
    color: string;
}

interface Square extends Shape {
    sideLength: number;
}

let square = <Square>{};
square.color = "blue";
square.sideLength = 10;
```

### 混合类型

一个对象可以同时做为函数和对象使用，并带有额外的属性。

```JavaScript
interface Counter {
    (start: number): string;
    interval: number;
    reset(): void;
}

function getCounter(): Counter {
    let counter = <Counter>function (start: number) { };
    counter.interval = 123;
    counter.reset = function () { };
    return counter;
}
```

## 三. 函数

### 函数表达式

用函数表达式描述一个函数

```ts
type fnType = (a: string) => void;
```

上面的语法表示类型是字符串类型，但是没有任何返回值。

函数类型包含参数类型和返回值类型

```JavaScript
let myAdd = function(x: number, y: number): number { return x + y; };
```

### 可选参数和默认参数

```JavaScript
function buildName(firstName: string = 'bai', lastName?: string) {
    if (lastName){
        return firstName + " " + lastName;
    } else {
        return firstName;
    }
}
```

### 剩余参数

```JavaScript
function push(array, ...items) {
  items.forEach(function (item) {
    array.push(item);
  });
}

let arr = [];
push(arr, 1, 2, 3);
```

### 函数重载

函数签名 = 函数名称+函数参数+函数参数类型+返回值类型四者合成，包含了实现签名和重载签名

函数根据传入不同的参数而返回不同类型的数据。

```JavaScript
function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: string, b: number): string;
function add(a: number, b: string): string;
function add(a: Combinable, b: Combinable) {
  if (typeof a === "string" || typeof b === "string") {
    return a.toString() + b.toString();
  }
  return a + b;
}
```

为了让编译器能够选择正确的检查类型，查找重载列表，尝试使用第一个重载定义。 如果匹配的话就使用这个。 因此，在定义重载的时候，一定要把最精确的定义放在最前面。

## 四. 断言

有时候 `TypeScript` 无法知道的有关值类型的信息,比如，在使用`document.getElementById`的时候， TS 只知道是某种类型的 `HTMLElement`, 但是你知道它是一个 `HTMLCanvasElement`类型的，这个时候就可以用到断言。
断言就是告诉编辑器，我知道我自己再干什么。

### 类型断言

`<>` 语法

```typescript
const myCanvas = <HTMLCanvasElement>document.getElementById('main_canvas');
```

`as` 语法

```typescript
const myCanvas = document.getElementById('main_canvas') as HTMLCanvasElement;
```

### 非空断言

当上下文价检查器无法断定类型的时候，就需要在表达是后加一个**！** 表示对象是非`null`和非`undefined`类型的。

```typescript
function liveDangerously(x?: number | null) {
  // 报错 'x' is possibly 'null' or 'undefined'.
  console.log(x.toFixed());
  // No error
  console.log(x!.toFixed());
}
```

有时候会遇到一些迷之操作。我们使用了非空断言，但是嘞，在编译之后，非空断言给移除了。比如下面的

```typescript
const a: number | undefined = undefined;
const b: number = a!;
console.log(b); // undefined
```

编译之后的代码

```javascript
'use strict';
const a = undefined;
const b = a;
console.log(b);
```

### 确定赋值断言

```typescript
let x: number;
init();
// Variable 'x' is used before being assigned.(2454)
console.log(2 * x); // Error

function init() {
  x = 10;
}
```

我们可以告诉编译器，在使用之前已经赋值了

```typescript
let x!: number;
...
```

<!-- https://juejin.cn/post/6872111128135073806#heading-30 -->
