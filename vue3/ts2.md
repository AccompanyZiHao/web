---
title: ts 语法第二部分
author: 白菜
date: '2022-05-06'
categories:
  - 'JavaScript'
tags:
  - TS
---

## 一、类型守卫

**类型保护是可执行运行时检查的一种表达式，用于确保该类型在一定的范围内。**主要就是是检测属性，方法，原型以确定如何处理值。

### 1.1 in

JavaScript 中有一个 `in` 操作符可以判断一个对象是否有对应的属性名。TypeScript 也可以通过这个收窄类型。

```typescript
type cabbageFan = {
  work: string;
  name: string;
};
type cabbageFanAction = {
  sleep: boolean;
  run: boolean;
};
type cabbage = cabbageFan | cabbageFanAction;

function getCabbage(fan: cabbage) {
  if ('name' in fan) {
    console.log(`${fan.name}'s work is ${fan.work}'`);
  } else {
    console.log(`this fan's status:${fan.sleep ? 'sleep' : 'runing'}`);
  }
}
getCabbage({ name: 'cabbage11', work: 'it' }); // "cabbage11's work is it'"
```

### 1.2 typeof 关键字

关于 `js` 本身支持的`typeof` 操作符，返回的类型有 `string`, `number`,`bigint`,`boolean`,`symbol`,`undefined`,`object`,`function`。

如果只是对基本类型使用，没啥太大的作用。

#### 对象

```typescript
const person = {
  name: 'cabbage',
  age: 18,
};

type PersonType = typeof person;

// type PersonTpe = {
// 		name: string;
// 		age: number;
// }
```

#### 数组

```typescript
const arr = ['hello', 'cabbage'];
type ArrType = typeof arr[number];

// type ArrType = "hello" | "cabbage"
```

从对象数组中获取想要的类型

```typescript
export const list = [
  {
    age: 18,
    name: 'JS',
  },
  {
    age: 19,
    name: 'TS',
  },
] as const;

type NameType = typeof list[number]['name'];

// type NameType = "JS" | "TS"
```

#### 函数

```typescript
// 和类型推断搭配使用
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>;
// type P = {
//   x: number;
//   y: number;
//}

function identity<Type>(arg: Type): Type {
  return arg;
}
type result = typeof identity;
//type result = <Type>(arg: Type) => Type
```

#### enum

在 `TypeScript` 中，`enum` 是一种新的数据类型，一般使用 `enum` 关键字定义枚举，但在具体运行的时候，它会被编译成对象。

```typescript
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

console.log(Direction.Left) // 3
// 反向映射
console.log(Direction[2]) // Down 
```

我们有一个数值枚举，其中 `Up` 用1初始化。从该点开始，下列所有成员都将自动递增。即 `Up = 1, Down = 2, Left = 3, Right = 4`。

上面的会被编译成为

```javascript
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
    Direction[Direction["Right"] = 4] = "Right";
})(Direction || (Direction = {}));
```



对一个 `enum` 类型只使用 `typeof` 一般没什么用，通常会搭配 `keyof` 操作符用于获取属性名的联合字符串。

```typescript
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}
 
/**
 * This is equivalent to:
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof LogLevel;
 
function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  if (num <= LogLevel.WARN) {
    console.log("Log level key is:", key); // ERROR
    console.log("Log level value is:", num); // 0
    console.log("Log level message is:", message); // This is a message
  }
}
printImportant("ERROR", "This is a message");
```

### 1.3 instanceof

```typescript
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
  } else {
    console.log(x.toUpperCase()); 
  }
}

logValue(new Date()) // Mon, 06 Mar 2023 11:29:20 GMT
logValue('bai cai') // BAI CAI
```

### 1.4 用户自定义类型保护

```typescript
function isNumber(x:any): x is number {
  return typeof x === "number"
}

function isString(x: any): x is string {
  return typeof x === "string";
}

function log(msg: string | number) {
  if (isNumber(msg)) {
    console.log("this is number:", msg);
  }
  if (isString(msg)) {
    console.log("this is string", msg);
  }
}

log(1) // "this is number:",  1 
log('bai cai') // "this is string",  "bai cai" 

```

- 这里的`is`的意思就是指定参数是具体的类型，才能校验通过。

## 二、泛型

用来创建可复用组件的工具，我们称之为泛型，利用泛型，我们可以创建一个支持众多类型的组件，这让用户可以使用自己的类型消费这些组件。

### 1. 语法

```typescript
function log(arg: any): any {
	return arg
}
```

函数 `log` 接受一个任意类型的 `arg` 参数，返回一个任意类型的值。这让我丢失了函数返回的类型信息，而我们使用泛型的就可以解决这个问题。

```typescript
function log<T>(arg: T): T {
  return arg;
}
```

`<T>` 内部的 `T` 被称为类型变量，它是我们希望传递给 `log` 函数的类型占位符，这个 `T` 允许我们捕获用户提供的类型，使得我们在接下来可以使用这个类型，同时再次将 `T` 作为返回值的类型。

```typescript
// 方式一
let output = log<string>("bai cai"); // let output: string
// 方式二
let output = identity("bai cai"); // let output: string
```

方式一： 我们在编写 `output` 的时候，预先定义了参数的类型`string`

方式二： 在没有使用`<>`明确的传入类型的时候，编译器看到传入的参数`bai cai`就会自动的设置`T`的类型(`string`)

参数推断可以让我们少去一些不必要的类型输入，让我们的代码更简短易读，但是在一些复杂的例子中，编辑器的类型推断可能会失败，这个时候你才需要像上面的方式一一样传入明确的参数类型。

其中 `T` 代表 **`Type`**，在定义泛型时常用作第一个类型变量的名称。但实际上 `T` 可以用任何有效名称代替。除了 `T` 之外，以下是常见泛型变量代表的意思：

- K（Key）：表示对象中的键类型；
- V（Value）：表示对象中的值类型；
- E（Element）：表示元素类型。

```typescript
function identity <T, U>(value: T, message: U) : T {
  console.log(message);
  return value;
}

identity(18, "cabbage")
// function identity<18, string>(value: 18, message: string): 18
```

这个时候编辑器就能自动推断出 `T` 和 `U`的类型，而不需要开发人员显示的定义它们。



使用类型变量

当我们获取参数的长度的时候，一般会这样写

```typescript

function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  // Property 'length' does not exist on type 'Type'.
  return arg;
}
```

这个时候编译器就会告诉我们一个错误，由于我们之前并没有对这些类型变量做任何的定义，而这个函数的参数可能是一个 `number` 类型的，因此就会出现一个错误。

如果我们传入的事一个数字类型的数组，并且将数字类型的数组返回。

```typescript
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length);
  return arg;
}
```

此时，`type`将会被当做`number`传入，这个时候我们使用的变量类型`type`，是作为整体类型的一部分，而不是之前的一整个类型，给我提供了极大的灵活度。

### 2. 泛型类型

泛型类型的参数名字可以不一样，但是要保证数量和使用方式一致即可。

```typescript
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: <Type>(arg: Type) => Type = identity;

```

```typescript
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: <Input>(arg: Input) => Input = identity;

```

那我们来编写一个泛型接口

```typescript
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}
 
function identity<Type>(arg: Type): Type {
  return arg;
}
 
let myIdentity: GenericIdentityFn<number> = identity;
```

这样子我们可以清楚的知道参数的类型，



---

```
https://juejin.cn/post/7096869746481561608
```

官网文档： https://www.typescriptlang.org/docs/handbook/2/narrowing.html#typeof-type-guards

https://ts.yayujs.com/handbook/Generics.html#%E4%BD%BF%E7%94%A8%E6%B3%9B%E5%9E%8B%E7%B1%BB%E5%9E%8B%E5%8F%98%E9%87%8F-working-with-generic-type-variables

 

https://juejin.cn/post/6872111128135073806#heading-87

