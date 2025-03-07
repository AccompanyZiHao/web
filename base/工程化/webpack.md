
## 性能优化

1. 代码分割：通过动态导入或入口配置，将应用拆分成多个小块，按需加载，提高首次加载速度。
2. 资源压缩：使用 `TerserWebpackPlugin` 对 `JavaScript` 进行压缩，使用 `css-minimizer-webpack-plugin` 压缩
`CSS`，减少文件体积。
3. 图片优化：使用 `image-webpack-loader` 压缩图片，降低加载时间，改善用户体验。
4. 预加载和预取：使用 `Webpack` 的 `webpackPrefetch` 和 `webpackPreload` 提高资源加载效率。
5. 缓存管理：设置合适的缓存策略，通过 `hash` 文件名管理缓存，避免用户下载过期资源。
6. `Tree Shaking`：通过 `ES6` 模块的静态分析，去除未使用的代码，减小打包后的体积。
7. 配置 `externals` (运行时从 `CDN` 加载) 和 `alias` (缩短引用路径，提高打包速度)。
8. 配置 `contenthash` 来缓存资源，避免重复下载。

```js

// 该插件用于压缩 JavaScript 代码，减小文件体积，
const TerserPlugin = require('terser-webpack-plugin');
// 该插件将 CSS 从 JavaScript 文件中提取到单独的文件中，从而减少了 CSS 文件的内联
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 压缩
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
// 压缩
const CompressionWebpackPlugin = require("compression-webpack-plugin")
// 该插件自动生成一个 HTML 文件，并自动将打包好的 JS 文件插入到这个 HTML 文件中。适用于自动化管理 HTML文件与打包文件之间的关系。
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 该插件在每次构建之前，删除 dist 目录下的旧文件，确保输出文件夹干净。
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  optimization: {
    // 开启压缩
    minimize: true, // 压缩⼯具
    minimizer: [
      // webpack5 的话通过 terser-webpack-plugin 来压缩 JS，但在配置了 mode: production 时，会默认开启
      new TerserPlugin({}),
      new cssMinimizerPlugin({}),
    ],
    splitChunks: {
      chunks: 'async', // 值有 all，async 和 initial
      minSize: 20000, // ⽣成 chunk 的最⼩体积（以 bytes 为单位）。
      minRemainingSize: 0,
      minChunks: 1, // 拆分前必须共享模块的最⼩ chunks 数。
      maxAsyncRequests: 30, // 按需加载时的最⼤并⾏请求数。
      maxInitialRequests: 30, // ⼊⼝点的最⼤并⾏请求数。
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\/]node_modules[\/]/, //第三⽅模块拆出来 
          priority: -10, 
          chunks: 'all', // 提取所有 chunks 同步和异步模块  //  async  | initial | all 异步 ｜ 同步 ｜ 所有
          name: 'vendor', // 输出的文件名
          reuseExistingChunk: true,
        },
        'util.vendors': {
            test: /[\/]utils[\/]/,  //公共模块拆出来 
            minChunks: 2, // 至少被 2 个模块共享的代码才会被提取
            priority: -20, // 设置优先级
            reuseExistingChunk: true, // 复用已有模块
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 提取成单独的⽂件
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
        exclude: /node_modules/
      },
       {
          // 匹配所有 .css 文件
          test: /\.css$/,
          // 使用 style-loader 和 css-loader
          use: [
            'style-loader',
             'css-loader',
             'postcss-loader', // 添加 PostCSS 支持
          ], 
       },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // 定义输出⽂件名和⽬录
      filename: 'asset/css/main.css',
    }),
    new HtmlWebpackPlugin({// 动态⽣成 html ⽂件
      template: "./index.html",
      minify: {// 压缩 HTML
        removeComments: true, // 移除 HTML 中的注释
        collapseWhitespace: true, // 删除空⽩符与换⾏符
        minifyCSS: true // 压缩内联 css
      },
    }), 
    new CleanWebpackPlugin(),
    new CompressionWebpackPlugin(),
    // 开启 Scope Hoisting 功能
    new webpack.optimize.ModuleConcatenationPlugin(),
    // 该插件自动加载模块， 而不需要在每个文件中显式地引入它们。 它可以在整个应用中提供全局变量， 比如 jQuery、 React 等。
    new webpack.ProvidePlugin({
        React: 'react',
        $: 'jquery',
     }),
     // 该插件用于创建全局常量，通常用于设置不同环境下的配置（如开发环境和生产环境）。
     new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
     })
  ],
  output: {
    filename: '[name].[contenthash].js'
    ,
    path: path.resolve(dirname, 'dist'),
  },
};
```

环境变量管理：`DefinePlugin` 和 `EnvironmentPlugin` 都是用于在构建过程中注入环境变量。

`DefinePlugin` 允许你创建自定义的全局常量，而 `EnvironmentPlugin` 则是将 `process.env` 中的环境变量注入到代码中。

### prefetch 和 preload

- `prefetch`：将来可能需要⼀些模块资源（⼀般是其他⻚⾯的代码），在核⼼代码加载完成之后,带宽空闲的时候再去加载需要⽤到的模块代码。
- `preload`：当前核⼼代码加载期间可能需要模块资源（当前⻚⾯需要的但暂时还没使⽤到的），其是和核⼼代码⽂件⼀起去加载的。 

```js
document.getElementById('btn1').onclick = function() {import(
/* webpackChunkName: "btnChunk" /
* /* webpackPrefetch: true*/
  './module1.js'
).then(fn => fn.default());
}
```

浏览器空闲时加载 `module1.js` 模块，并且单独拆⼀个 `chunk`， 叫做 `btnChunk` 可以看到 ， 在 `head` ⾥⾯，我们的懒加载模块被直接引⼊了，并且加上了 `rel='prefetch'`。 这样，⻚⾯⾸次加载的时候，浏览器空闲的会, 后会提前加载 `module1.js` 。当我们点击按钮的时候，会直接从缓存中读取该⽂件，因此速度⾮常快。

### hash 缓存

1. `Content Hash`
   - 用途：用于生成基于文件内容的哈希值。
   - 特点：只有当文件内容发生变化时，`contenthash` 才会变化。这有助于缓存管理，因为只有当文件内容真正改变时，浏览器才会重新下载文件。
   - 适用场景：适用于 CSS 和 JavaScript 文件，特别是当你希望利用浏览器缓存来提高性能时。
2. `Chunk Hash`：
    - 用途：用于生成基于 `chunk` 内容的哈希值。
    - 特点：当 `chunk` 内容发生变化时，`chunkhash` 会变化。`chunk` 是指 `Webpack` 在构建过程中生成的代码块。
    - 适用场景：适用于需要按 `chunk` 进行缓存管理的情况。
3. `Named Chunk Hash`：适用于需要更细粒度控制缓存的情况，结合 chunk 名称和内容生成哈希值。
    - 用途：类似于 `chunkhash`，但使用 `chunk` 的名称作为哈希的一部分。
    - 特点：当 `chunk` 名称或内容发生变化时，`namedChunkhash` 会变化。
4. `Hash`
    - 用途：用于生成基于整个构建过程的哈希值。
    - 特点：只要构建过程中有任何文件发生变化，`hash` 就会变化。这意味着所有文件的哈希值都会更新，即使只有一个小文件发生了变化。
    - 适用场景：适用于简单的项目或不需要细粒度缓存管理的情况。

### tree shaking

1. 只对 `ESM` ⽣效
2. 只能是静态声明和引⽤的 `ES6` 模块，不能是动态引⼊和声明的。
3. 只能处理模块级别，不能处理函数级别的冗余。
4. 只能处理 `JS` 相关冗余代码，不能处理 `CSS` 冗余代码。 

⽽可能样式⽂件⾥⾯有些代码我们也没有使⽤，我们可以通过 `purgecss-webpack-plugin` 插件来对 `css` 进⾏ `tree shaking`

### gzip 压缩

浏览器和服务端是如何通信来⽀持 `Gzip` 呢？

1. 请求头 (Accept-Encoding):

   浏览器在发起 HTTP 请求时，会在请求头中包含 Accept-Encoding 字段，表明它支持的压缩算法。

   例如：Accept-Encoding: gzip, deflate, br 表示浏览器支持 gzip、deflate 和 brotli 压缩。
 
2. 服务端响应:

    服务端接收到请求后，检查 Accept-Encoding 头，确定客户端支持的压缩算法。

    如果服务端支持并配置了相应的压缩算法（如 gzip），它会使用该算法对响应内容进行压缩。

3. 响应头 (Content-Encoding):

    服务端在返回响应时，会在响应头中添加 Content-Encoding 字段，告知浏览器响应内容已被压缩。

    例如：Content-Encoding: gzip 表示响应内容是通过 gzip 压缩的。

4. 浏览器解压:

    浏览器接收到响应后，根据 Content-Encoding 头中的信息，自动解压响应内容。
    
    解压后的数据会被浏览器正常处理，用户无需进行额外操作。

 ⼀般情况下我们并不会让服务器实时 `Gzip` 压缩，⽽是利⽤ `webpack` 提前将静态资源进⾏ `Gzip` 压缩，然后将 `Gzip` 资源放到服务器，当请求需要的时候直接将 `Gzip` 资源发送给客⼾端。 我们只需要安装 `compression-webpack-plugin` 并在 `plugins` 配置就可以了

### scope hoisting 作用域提升

概念：将多个模块的作用域合并到一个大的作用域中，从而减少函数包裹的数量。

主要目的是减少打包后代码的体积并提高执行效率

实现方式：通过静态分析依赖关系图，确定哪些模块可以在同一个作用域中执行。构建后的代码会按照引⼊顺序放到⼀个函数作⽤域⾥，通过适当重命名某些变量以防⽌变量名冲突，从⽽减少函数声明和内存花销。

优点：
1. 减少函数调用开销
2. 减少生成的代码量
3. 提高代码执行速度

限制：源码必须采⽤ ES6 模块化语法(需要进行静态分析), 只能对没有副作用的代码进行优化，确保不会改变程序的行为。

## Live-Reload 自动刷新与 HRM 热模块替换的区别

`Live-Reload`: 是一种简单的自动刷新机制，当文件发生变化时，它会自动刷新整个页面。通常，开发服务器会监控文件变化，当文件变化时，会通知浏览器重新加载整个页面。

`HMR` 是一种更为高效的机制，它只会替换更新的模块，而不需要重新加载整个页面。`HMR` 能够在不丢失当前应用状态的情况下，替换、更新代码，极大提升开发体验。

### 工作原理

`Live-Reload` 主要通过监控文件系统上的变化，当文件发生变化时，触发浏览器的刷新请求。它一般依赖于开发服务器，开发服务器会监听源文件的更改（例如，通过 `webpack-dev-server` 或其他工具）。当文件被修改时，服务器会通知浏览器进行刷新。

优点：实现简单、开箱即用，支持所有类型的文件修改。

缺点：每次修改都会刷新整个页面，状态丢失，页面加载时间较长。

 
`HMR` 通过 `Webpack` 或其他模块打包工具集成，基于模块系统，它会监控每个模块的变化。当某个模块发生变化时，只替换该模块，而不重新加载整个页面。`HMR` 需要浏览器和开发服务器之间有更紧密的配合，通常需要通过 `WebSocket` 或服务器推送的方式来实现。

优点：页面不会完全刷新，能够保留应用状态。对于大型应用来说，`HMR` 能显著提高开发效率。

缺点：实现相对复杂，对于一些变化（例如：改变了模块之间的依赖关系，或大规模改动）可能无法完美替换，依然需要刷新。

### `Live-Reload` 与 `HMR` 的对比：

- 刷新范围：`Live-Reload` 会刷新整个页面，而 `HMR` 只更新变动的部分（模块）。
- 开发体验：`HMR` 提供了更快的开发反馈，不会丢失页面的状态；`Live-Reload` 会导致页面重载，丢失当前的状态。
- 适用场景： `Live-Reload` 更适合简单应用或纯前端项目， 而 `HMR` 更适合大型应用、 复杂前端框架 （如 `React`、 `Vue` 等）开发，因为它可以保留状态，提高开发效率。

### 配置使用

``` 
// Live-Reload
devServer: {
   contentBase: './dist',
   liveReload: true,
}
```

```
// HRM
devServer: {
   hot: true,
},
plugins: [
   new webpack.HotModuleReplacementPlugin()
]
```

## Webpack 和 Rollup、 Parcel 构建工具有什么区别? 各自的优缺点是什么?

### webpack

主要特点
- 功能强大：`Webpack` 是最流行的构建工具之一，具有广泛的功能，支持 `JavaScript`、`CSS`、图片等多种资源的打包。
- 模块化和插件生态：`Webpack` 提供了高度的模块化机制，支持各种插件和加载器（`loaders`）来处理不同类型的文件。
- 灵活性：`Webpack` 配置非常灵活，可以满足各种复杂的需求，如代码分割、懒加载、热更新等。

优点
1. 强大的生态和社区支持：`Webpack` 拥有广泛的插件和 `loaders` 生态，几乎能满足所有前端构建需求。
2. 高度自定义和灵活性：可以根据项目的需求，配置各种功能，包括代码分割、树摇（`Tree Shaking`）等。
3. 兼容性好：能够处理各种文件类型（如 `CSS`、`SASS`、`TypeScript`、图片、字体等）。
4. 广泛的使用场景：适用于复杂的应用程序、企业级项目等。

缺点
1. 配置复杂：`Webpack` 的配置相对较复杂，尤其对于初学者来说，需要花费较多的时间去理解和配置。
2. 构建速度慢：在大规模应用中，`Webpack` 的构建速度可能比较慢，尤其是在没有使用合适优化的情况下。
3. 学习曲线较陡：由于其灵活性，`Webpack` 的学习曲线相对较陡，尤其在需要自定义配置时。

### rollup

主要特点
- 专注于 `ES` 模块：`Rollup` 主要是为现代 `JavaScript`（尤其是 `ES6` 模块）打包而设计的，特别适合用于构建库和组件。
- 优化效果好：`Rollup` 提供出色的 `Tree Shaking`（树摇），可以移除未使用的代码，从而生成更小的打包文件。
- 输出格式多样：`Rollup` 支持多种输出格式，如 `CommonJS`、`ESM`、`IIFE`、`UMD` 等。

优点
1. 更小的输出文件：`Rollup` 在打包时，能够更好地做 `Tree Shaking`，移除未使用的代码，生成更加精简的输出。
2. 适用于库和组件开发：`Rollup` 特别适合用于构建 `JavaScript` 库，因为它对模块化支持得非常好，能够生成优化的、轻量的代码。
3. 构建速度快：相对于 `Webpack`，`Rollup` 在构建速度上表现得更好，尤其是在构建库时，能够显著提高效率。

缺点
1. 插件生态较弱：虽然 `Rollup` 的插件生态逐渐完善，但相比 `Webpack`，它的插件数量和功能仍然较少。
2. 配置不如 Webpack 灵活：`Rollup` 在处理 `CSS`、图片等资源时，比 `Webpack` 要逊色一些。需要额外的插件来扩展功能。
3. 不适合大型单页应用：`Rollup` 的目标是针对库或模块，虽然可以处理大型应用，但不如 `Webpack` 那么高效。

### parcel

主要特点
- 零配置：`Parcel` 包。是一款开箱即用的构建工具，无需任何配置就能开始使用。 它通过自动检测项目中的依赖， 自动进行打包。
- 高效的构建速度：`Parcel` 利用多核 `CPU` 进行并行构建，因此它的构建速度非常快，特别适用于快速开发和原型设计。
- 内置支持类型：`Parcel` 内置支持 `TypeScript`、`JSX`、`SASS` 等常见的前端技术，无需额外安装插件。

优点
1. 零配置，快速上手：`Parcel` 的最大优势是开箱即用，无需繁琐的配置文件。适合小型项目或快速原型开发。
2. 构建速度快：由于 `Parcel` 内置了并行处理、智能缓存和热更新等优化，它的构建速度通常比 `Webpack` 更快，尤其在开发过程中。
3. 内置支持多种文件类型：`Parcel` 可以直接处理 `JavaScript`、`TypeScript`、`CSS`、图片等资源类型，无需额外安装`loader` 或插件。

缺点
1. 功能相对简单： 虽然 `Parcel` 非常适合快速开发， 但对于大型项目或复杂的配置需求， 它的功能可能不如 `Webpack` 那么强大。
2. 插件和社区支持较少：尽管 `Parcel` 的插件系统正在逐步完善，但与 `Webpack` 相比，`Parcel` 的插件生态和社区支持还较为薄弱。
3. 缺乏高级优化控制：虽然 `Parcel` 的自动优化很强大，但它也缺乏像 `Webpack` 那样的精细化控制，不能满足某些复杂的定制需求。

### 总结

`Webpack` 适合大型项目和复杂的前端构建，支持高度自定义，但配置复杂，构建速度较慢。

`Rollup` 适合构建 `JavaScript` 库和模块，支持优秀的 `Tree Shaking` 和较小的打包体积，但插件生态较小，适用场景有限。

`Parcel` 适合快速开发和小型项目，开箱即用，构建速度快，但功能不如 `Webpack` 强大，缺乏对复杂配置的支持。

## 如何使用 Webpack 处理内联 CSS?

`style-loader`：创建 `<style>` 标签并将解析后的 `CSS` 内容插入到 `HTML` 文档的 `<head>` 中。

`css-loader`：处理 `CSS` 文件中的 `@import` 和 `url()` 等语法; 支持 `CSS` 模块化，允许你通过 `JavaScript` 导入 `CSS` 并以对象的形式使用类名; 不会直接将 `CSS` 注入到页面中，而是返回一个包含样式规则的 `JavaScript` 对象。

### 内联 css 的作用

开发环境优化： 在开发过程中， 使用 `style-loader` 内联 `CSS` 可以避免生成多个独立的 `CSS` 文件， 方便快速调试和更新样式。

样式快速加载：将 `CSS` 内联到 `JS` 中可以减少请求数量，提高页面的加载速度（尤其是小型项目）。

虽然内联 `CSS` 在开发时很方便，但在生产环境中，通常使用 `MiniCssExtractPlugin` 来提取 `CSS` 到独立文件，这样可以提高加载性能和缓存效果。

### CSS-Loader 和 Style-Loader 的区别

1. `CSS-Loader` 主要负责将 `CSS` 文件加载到 `JavaScript` 文件中。它的功能是处理 `CSS` 文件的解析，将 `CSS` 内容转换成 `JavaScript` 模块，以便其他加载器或工具进一步使用。具体来说，它会把 `CSS` 内容通过`JavaScript` 插入到 `HTML` 中。
2. `Style-Loader` 的作用是将 `CSS` 通过 `<style>` 标签插入到 `HTML` 文件的 `<head>` 中。它通常与`CSS-Loader `配合使用，`CSS-Loader `将 `CSS` 文件的内容转换为 `JavaScript` 模块，而 `Style-Loader` 负责动态地将这些内容嵌入到页面中

`CSS-Loader` 只是解析 `CSS` 文件， 而 `Style-Loader` 负责将解析后的 `CSS` 内容添加到页面的 `DOM` 中。

工作流程：

`CSS-Loader`： 首先， `CSS-Loader` 解析 `.css` 文件， 并将其中的 `CSS` 内容转换成 `JavaScript` 字符串。 如果有其他 `CSS` 文件（例如通过 `@import` 或 `url()` 引入的），它会继续递归加载并处理。

`Style-Loader`：将 `CSS` 代码注入到页面中的 `<style>` 标签。在开发模式下，`Style-Loader` 会为每个变化的 `CSS` 动态更新页面，不需要刷新页面。

生产环境和开发环境的区别:

同上 [内联 css 的作用]

### postCss

进一步优化 `CSS`，可以使用 `PostCSS` 配合 `Webpack`。通过安装 `postcss-loader` 和相关插件，进行`CSS` 压缩、自动添加浏览器前缀等操作。

安装依赖：
```shell
npm install --save-dev postcss-loader autoprefixer cssnano
```

`Webpack` 配置中加入 `PostCSS` 支持, 并创建一个 `PostCSS` 配置文件 `.postcssrc.js`：

```js
module.exports = {
   plugins: [
      require('autoprefixer'), // 自动添加前缀
      require('cssnano'), // 压缩 CSS
   ],
};
```

## Webpack 中，常见的图片处理加载器有哪些

常见的图片处理加载器主要用于优化和转换图像文件。

1. `file-loader`：将图像文件复制到输出目录，并返回它们的 `URL`。适用于基本的图像处理需求。
2. `url-loader`：类似于 `file-loader`， 但支持将小图像转换为 `Base64` 格式，嵌入到 `JavaScript` 中。 可以通过配置设置大小阈值，超过该值的图像将使用 `file-loader` 处理。
3. `image-webpack-loader`： 用于对图像进行更深层次的优化， 如压缩和调整大小。 可以与 `url-loader` 或 `file-loader` 配合使用，提高图像加载性能。
4. `responsive-loader`：根据不同的视口大小生成多种尺寸的图像，适合响应式设计。支持自动生成适合不同屏幕的图片格式。

## 实现静态资源的离线缓存

使用 `Webpack` 和 `LocalStorage` 实现静态资源的离线缓存，通常结合 `Service Worker` + `LocalStorage`。 

1. 配置 `Webpack` 打包 `Service Worker`：通过 `Webpack` 配置，让项目支持 `Service Worker`，拦截网络请求，缓存静态资源。
2. 使用 `Service Worker` 缓存资源：`Service Worker` 会监听用户的网络请求，将资源缓存到浏览器，离线状态下可直接从缓存读取资源。
3. 结合 `LocalStorage` 存储数据：`LocalStorage` 存储少量的应用数据，如用户配置、上次访问时间等，保证在离线时也能获取这些数据。


### 配置 Service Worker

使用 `workbox-webpack-plugin` 插件，它能够自动生成 `Service Worker` 脚本，用于处理静态资源的缓存

```js
const path = require('path');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
   entry: './src/index.js', // 入口文件
   output: {
      filename: 'bundle.js',
      path: path.resolve(dirname,'dist'),
   },
   plugins: [
      // Workbox 插件自动生成 Service Worker
      new WorkboxPlugin.GenerateSW({
         clientsClaim: true,
         skipWaiting: true,
      }),
   ],
};
```
### 注册 Service Worker

确保浏览器在支持 `Service Worker` 时, 注册并启用离线缓存功能。

```js
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
      navigator.serviceWorker
         .register('/service-worker.js')
         .then((registration) => {
            console.log('ServiceWorker registration successful:', registration);
         })
         .catch((error) => {
            console.log('ServiceWorker registration failed:', error);
         });
   });
}
```

### 缓存策略

默认情况下，`Workbox` 会缓存所有 `Webpack` 输出的静态资源。 如果你想更具体地控制缓存策略， 比如为 `API` 请求、图片或其他资源设置不同的缓存规则，可以手动配置 `Workbox`。

```js
new WorkboxPlugin.GenerateSW({
   runtimeCaching: [
      {
         urlPattern: /\.(?:png|jpg|jpeg|svg)$/, // 匹配图片资源
         handler: 'CacheFirst', // 优先从缓存加载，缓存没有时再从网络获取
      },
      {
         urlPattern: new RegExp('/api/'), // 匹配 API 请求
         handler: 'NetworkFirst', // 优先从网络获取，失败时再从缓存获取
      },
   ],
});
```

###  结合 LocalStorage 实现数据缓存

```js
// 保存数据到 LocalStorage
function saveDataToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// 从 LocalStorage 读取数据 
function loadDataFromLocalStorage(key) {
   const data = localStorage.getItem(key);
   return data ? JSON.parse(data) : null;
}

// 示例：缓存用户设置 
const userSettings = {
   theme: 'dark',
   fontSize: '16px',
};
saveDataToLocalStorage('settings', userSettings);

// 离线时读取用户设置 
const cachedSettings = loadDataFromLocalStorage('settings');
if (cachedSettings) {
   console.log('Loaded settings from cache:', cachedSettings);
}
```

### 离线访问时的结合使用

通过 `Service Worker`，可以实现静态资源的离线缓存，保证用户在离线状态下依然可以访问网页。

`LocalStorage` 可以用于保存用户交互数据， 例如表单数据、 用户偏好等。 在离线时， 从 `LocalStorage` 获取这些数据，确保应用能继续运行。

注意：

`LocalStorage` 限制：`LocalStorage` 通常限制为 5-10MB，不适合大文件的存储。大文件资源应该通过 `IndexedDB` 或直接由 `Service Worker` 进行缓存。

`Service Worker` 生命周期：`Service Worker` 在后台运行，可能在浏览器关闭后仍然执行任务， 确保缓存策略正确以免占用过多空间或造成不必要的请求。

`Service Worker` 的生命周期主要包括以下几个阶段：

- **注册**：通过 `navigator.serviceWorker.register()` 方法来注册 `Service Worker`。此时浏览器会检查 `Service Worker` 脚本的 URL，并下载脚本。

- **安装**：当 `Service Worker` 脚本下载完成后，会触发 `install` 事件。在这个阶段可以进行一些初始化操作，比如缓存资源。如果安装成功，则进入等待状态；如果安装失败，则会被抛弃。

- **激活**：当旧版本的 `Service Worker` 不再有控制客户端时（即所有使用旧版本的页面都关闭了），新的 `Service Worker` 会触发 `activate` 事件并进入激活状态。在激活阶段可以清理不再需要的资源。

- **控制**：激活后的 `Service Worker` 开始控制那些与它关联的客户端。从这时起，`Service Worker` 可以拦截网络请求、处理推送消息等。

- **更新**：当 `Service Worker` 脚本发生变更时，浏览器会在下次访问时重新下载并安装新的 `Service Worker`。新旧 `Service Worker` 之间会有一个重叠期，在此期间旧版本仍然控制着已打开的页面，直到这些页面都被关闭后，新版本才会被激活。

- **终止**：为了节省资源，浏览器可能会在一段时间不活动后终止 `Service Worker` 的运行。当再次需要时，它会被重新启动。

更多：[Service_Worker_API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

## 异步加载

`Webpack` 实现异步加载主要通过代码分割（`Code Splitting`）和动态导入（`Dynamic Import`）来实现。

1. 动态导入

   使用 `import()` 语法实现动态导入模块：
   
   ```js
   // 异步加载模块
   
   button.onclick = () => {
      import('./module.js').then(module => {
         module.default();
      });
   }
   ```

2. 路由分割

   在路由配置中实现组件的异步加载

   ```js
   const routes = [
      {
         path: '/about',
         component: () => import('./pages/About.vue')
      }
   ]
   ```
   
3. 预加载/预获取
   使用魔法注释控制模块的加载行为：

   ```js
   // 预加载
   import(/* webpackPrefetch: true */ './module.js')
   // 预获取
   import(/* webpackPreload: true */ './module.js')
   ```
   
4. 命名和加载控制

   ```js
   // 自定义 chunk 名称
   import(/* webpackChunkName: "my-chunk" */ './module.js')
   // 设置加载模式 
   import(/* webpackMode: "lazy" */ './module.js')
   ```



