



## 准备工作

### 拉取代码

去 `github` 上拉取 `webpack`到本地。

```
git clone https://github.com/webpack/webpack.git
```

### 建立测试文件

我们先建个 `demo` 目录

先初始化一下并且装一个插件

```sh
npm init -y
yarn add clean-webpack-plugin
```

新建4个文件

`demo/index.js`

```js
import {moduleName} from './module';

console.log('hi, webpack, this is ' + moduleName);
```

`demo/module.js`

```js
export const moduleName = 'module';
```

`demo/star.js`

```js
const webpack = require("../lib/webpack");
const config = require("./webpack.config");

// compiler 是 webpack 的启动入口，直接调用即可
const compiler = webpack(config);
compiler.run();
```



`demo/webpack.config.js`

```js
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	// 选择调试开发环境
	mode: "development",
	devtool: "source-map",
	entry: "./index.js",
	// 在 demo 目录下会生成一个 dist 目录，打包完成后会生成一个main.js文件
	output: {
		path: path.join(__dirname, "./dist")
	},
	plugins: [new CleanWebpackPlugin()]
};
```

### 测试文件

检测自己是否全局安装 `webpack`,如果有跳过，没有得话全局安装一下

```sh
yarn global add webpack webpack-cli
```

Mac 的坑： todo



在 `webpack` 根目录下运行一下

```sh
webpack ./demo/index.js --config ./demo/webpack.config.js
```

运行完之后，你会在 `demo/dist` 目录下看到一个 `main.js` 的文件，然后把里面的代码复制粘贴到浏览器控制台，运行之后会正确打印出 `hi, webpack, this is module`

到这里，准备工作算是完成了，剩下的就交给调试了。

## 调试阶段

在 `demo/start.js` 先打个断点，然后进入 `lib/webpack.js`

### webpack.js

直接看最后一行，它导出了一个 `webpack`

```js
module.exports = webpack;
```

然后看 `webpack` 的定义，由于我们在 `start.js` 中只穿了 `config` 一个参数，所以先看 `else` 里面的内容，它调用了一个 `create()` 的方法，说明了创建的时候，它会产生一个 `compiler`。

```js
const webpack = /** @type {WebpackFunctionSingle & WebpackFunctionMulti} */ (
	/**
	 * @param {WebpackOptions | (ReadonlyArray<WebpackOptions> & MultiCompilerOptions)} options options
	 * @param {Callback<Stats> & Callback<MultiStats>=} callback callback
	 * @returns {Compiler | MultiCompiler} Compiler or MultiCompiler
	 */
	(options, callback) => {
    // ...
		const create = () => {
      //...
      let compiler;
			let watch = false;
      // ...
      const webpackOptions = /** @type {WebpackOptions} */ (options);
				/** @type {Compiler} */
				compiler = createCompiler(webpackOptions);
				watch = webpackOptions.watch;
				watchOptions = webpackOptions.watchOptions || {};
      
			return { compiler, watch, watchOptions };
    }
    if(callback){
      //...
    }else{
			const { compiler, watch } = create();
			if (watch) {
				util.deprecate(
					() => {},
					"A 'callback' argument needs to be provided to the 'webpack(options, callback)' function when the 'watch' option is set. There is no way to handle the 'watch' option without a callback.",
					"DEP_WEBPACK_WATCH_WITHOUT_CALLBACK"
				)();
			}
			return compiler;
    }
  }
```

这个编译程序(`compiler`) 则是通过 `createCompiler()` 方法产生的。



```js
const createCompiler = rawOptions => {
	const options = getNormalizedWebpackOptions(rawOptions);
	applyWebpackOptionsBaseDefaults(options);
	const compiler = new Compiler(options.context, options);
	new NodeEnvironmentPlugin({
		infrastructureLogging: options.infrastructureLogging
	}).apply(compiler);
	if (Array.isArray(options.plugins)) {
		for (const plugin of options.plugins) {
			if (typeof plugin === "function") {
				plugin.call(compiler, compiler);
			} else {
				plugin.apply(compiler);
			}
		}
	}
	applyWebpackOptionsDefaults(options);
	compiler.hooks.environment.call();
	compiler.hooks.afterEnvironment.call();
	new WebpackOptionsApply().process(options, compiler);
	compiler.hooks.initialize.call();
	return compiler;
};
```

 



## 小结

