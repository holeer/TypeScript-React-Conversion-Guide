本文档由[英文文档](./README-en.md)翻译而来。翻译辅助插件：[Immersive Translate](https://immersivetranslate.cn/)。

# TypeScript React 转换指南

这个指南说明了如何在现有的 React/Babel/Webpack 项目中采用 TypeScript。我们将以 `TicTacToe_JS` 文件夹中完全用 JavaScript 编写的**井字棋项目**为例开始。到结束时，你将拥有一个完全用 TypeScript 编写的井字棋项目。

如果你不是在转换现有项目而是在开始一个新的 React 项目，你可以使用[这个教程](https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/tutorials/React.md)。

在任何项目中采用 TypeScript 都可以分解为两个阶段：

1. 将 TypeScript 编译器（tsc）添加到你的构建流程中。
2. 将 JavaScript 文件转换为 TypeScript 文件。

## 理解现有的 JavaScript 项目

在我们深入采用 TypeScript 之前，让我们看一下井字棋应用的架构——它包含几个组件，看起来如下（无论是否使用TypeScript）。

<p align="center">
    <img src ="image/components.png"/>
</p>

如 `package.json` 所示，该应用程序已包含 React/ReactDOM、Webpack 作为打包工具和任务运行器，以及用于使用 Babel 进行 ES6 和 JSX 转换的 babel-loader Webpack 插件。在采用 TypeScript 之前，项目最初具有以下整体布局：

```txt
TicTacToe_JS /
    |---- css/			              // css 样式表
    |---- src/			              // 源文件
        |---- app.jsx		          // React组件App
        |---- board.jsx		        // 井字棋棋盘React组件
        |---- constants.js		    // 某些共享常量
        |---- gameStateBar.jsx	  // GameStatusBar React 组件
        |---- restartBtn.jsx	    // RestartBtn React 组件
    |---- .babelrc		            // babel预设列表
    |---- index.html		          // 我们应用的网页
    |---- package.json		        // node 包配置文件
    |---- webpack.config.js	      // Webpack 配置文件
```

## 添加 TypeScript 编译器到构建流水线

### 安装依赖

要开始，打开一个终端，然后 `cd TicTacToe_JS` 。安装 `package.json`中定义的所有依赖。

```sh
cd TicTacToe_JS
npm install
```

此外，安装以下开发依赖（如果在package-lock.json中没有找到它们）：TypeScript (3或更高), [ts-loader](https://www.npmjs.com/package/ts-loader) , [source-map-loader](https://www.npmjs.com/package/source-map-loader)。ts-loader 是一个 Webpack 插件，它帮助你将 TypeScript 代码编译为 JavaScript，跟 Babel 中的 babel-loader 很像。TypeScript 还有其他替代加载器！source-map-loader 为调试添加了源映射支持。

```sh
# 由于Webpack版本较老，需注意依赖版本兼容问题
npm install --save-dev typescript
npm install --save-dev ts-loader@8.4.0
npm install --save-dev source-map-loader@0.2.4
```

从 [@types](https://blogs.msdn.microsoft.com/typescript/2016/06/15/the-future-of-declaration-files/) 中获取任何正在使用的库的类型声明文件 (`.d.ts` 文件)。对于这个项目，我们有 React 和 ReactDOM。

```sh
npm install --save @types/react @types/react-dom
```

如果你使用的是与 @types 中最新的 `.d.ts` 文件不兼容的 React 或 ReacDOM 的旧版本，你可以在 `package.json` 中为 `@types/react` 或 `@types/react-dom` 指定一个版本号。

### 配置 TypeScript

接下来，通过在 `TicTacToe_JS` 目录中创建一个`tsconfig.json`文件来配置 TypeScript ，添加以下内容:

```json5
{
    "compilerOptions": {
        "outDir": "./dist/",        // 指向输出目录的路径
        "sourceMap": true,          // 启用资源图支持
        "strictNullChecks": true,   // 启用严格 null 检查作为最佳实践
        "module": "es6",            // 指定模块代码生成器
        "jsx": "react",             // 使用 typescript 将 jsx 转译为 js
        "target": "es5",            // 指定 ECMAScript 目标版本
        "allowJs": true             // 允许代码库处于半 TypeScript 半 JavaScript 状态

    },
    "include": [
        "./src/"
    ]
}
```

你可以根据你的项目需求编辑一些选项或添加更多选项。请参阅[编译器选项](https://www.typescriptlang.org/docs/handbook/compiler-options.html)的完整列表中的更多选项。

### 配置构建流水线

要添加 TypeScript 编译作为我们的构建过程的一部分，您需要修改Webpack配置文件`webpack.config.js`。这一部分是针对Webpack的。但是，如果您使用的是其他任务运行器（例如Gulp）来构建您的React/Babel 项目，其思想是相同的——用 TypeScript 替换 Babel 构建步骤，因为 TypeScript 也提供将代码转换成较低版本的 ECMAScript 和 JSX 转换，并且在大多数情况下构建时间更短。如果您愿意，您也可以保留 Babel，通过在 Babel 之前添加 TypeScript 构建步骤，并将其输出传递给 Babel。

通常，我们需要以几种方式更改 `webpack.config.js` ：

1. 扩展模块解析扩展以包含 `.ts` 和 `.tsx` 文件。
2. 用 `ts-loader` 替换 `babel-loader`。

让我们修改 `webpack.config.js`，如下所示：

```js
module.exports = {
  // 在必要时更改为 .tsx
  entry: './src/app.jsx',
  output: {
    filename: './bundle.js'
  },
  resolve: {
    // 原有扩展名: [".js", ".jsx"]
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      // 原来的配置： { test: /\.jsx?$/, use: { loader: 'babel-loader' }, exclude: /node_modules/ },
      { test: /\.(t|j)sx?$/, use: { loader: 'ts-loader' }, exclude: /node_modules/ },
    ]
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
  },
}
```

你可以删除 `.babelrc` 与`package.json`中的所有 Babel 依赖，如果你不再需要它们。

注意，如果你计划在入口文件中采用 TypeScript ，你也应该将`entry: './src/app.jsx'`更改为`entry: './src/app.tsx'`。目前，我们将保持它为`app.jsx`。

现在你已经正确设置了构建管道，TypeScript 将处理编译。尝试使用以下命令打包应用程序，然后在浏览器中打开`index.html`：

```sh
npx webpack
```

> 我们假设你在使用 `npx` 作为 `npm` 的补充，以 [直接执行npm包](http://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner)

## JS(X)向TS(X)的转换

在这一部分，我们将逐步介绍以下步骤：

1. 将一个模块转换为 TypeScript 的最小步骤。
2. 在一个模块中添加类型，以获得更丰富的类型检查。
3. 在整个代码库中充分采用 TypeScript。

虽然通过在整个代码库中全面采用 TypeScript，你可以获得 TypeScript 的最大好处，但了解这三个步骤在决定 JavaScript 代码库的某些部分（例如无人理解的遗留代码）是否保持原样时非常有用。

### 最小转换步骤

让我们看 `gameStateBar.jsx` 作为示例。

第一步是将 `gameStateBar.jsx` 重命名为 `gameStateBar.tsx`。 如果你在使用带有 TypeScript  支持的任何编辑器，比如 [Visual Studio Code](https://code.visualstudio.com/), 你应该能从你的编辑器中看到一些报错。

在第1行 `import React from "react";`，将导入声明改为 `import * as React from "react"`。这是因为在导入一个 CommonJS 模块时，Babel 假设 `modules.export` 是默认导入，而 TypeScript 不这么做。

在第3行 `export class GameStateBar extends React.Component {`, 将类声明改为 `export class GameStateBar extends React.Component<any, any> {`.  `React.Component` 的类声明使用 [泛型](https://www.typescriptlang.org/docs/handbook/generics.html) ，并要求为组件的属性和状态对象提供类型。使用 `any` 允许我们将任何值作为属性或状态对象传递，这在类型检查方面没有用处，但足以作为满足编译器要求的最小努力。

到目前为止，ts-loader 应该能够成功地将这个 TypeScript 组件编译成 JavaScript 。再次，尝试使用以下命令打包应用程序，然后在浏览器中打开`index.html`。

```sh
npx webpack
```

### 添加类型

提供给 TypeScript 的类型信息越多，它的类型检查就越强大。作为一种最佳实践，我们建议为所有声明提供类型。我们将再次以`gameStateBar`组件为例。

对于任何 `React.Component`，我们应该正确定义属性与状态对象的类型。 `gameStateBar` 组件没有属性，因此我们使用 `{}` 作为类型。

状态对象只包含一个属性 `gameState` ，即游戏状态 (无，某人赢了，绘制)。由于`gameState`只能具有某些已知的字符串字面量值，让我们使用[字符串字面量类型](https://www.typescriptlang.org/docs/handbook/advanced-types.html)，并在类声明之前定义接口。

```ts
interface GameStateBarState {
    gameState: "" | "X Wins!" | "O Wins!" | "Draw";
}
```

有了定义好的接口，更改`GameStateBar` 的类声明如下：

```ts
export class GameStateBar extends React.Component<{}, GameStateBarState> {...}
```

现在，为它的成员应用类型信息。请注意，为所有声明提供类型不是必需的，但为了更好的类型覆盖，建议提供类型。

```ts
// 为参数添加类型
constructor(props: {}) {...} // React类组件的构造器的入参类型为对象字面量
handleGameStateChange(e: CustomEvent) {...} // CustomEvent是内建类型，即自定义事件
handleRestart(e: Event) {...} // Event是内建类型，即普通事件

// 在箭头函数中添加类型
componentDidMount() {
    window.addEventListener("gameStateChange", (e: CustomEvent) => this.handleGameStateChange(e));
    window.addEventListener("restart", (e: CustomEvent) => this.handleRestart(e));
}

// 在箭头函数中添加类型
componentWillUnmount() {
    window.removeEventListener("gameStateChange", (e: CustomEvent) => this.handleGameStateChange(e));
    window.removeEventListener("restart", (e: CustomEvent) => this.handleRestart(e));
}
```

要使用更严格的类型检查，您也可以在 `tsconfig.json` 中指定有用的编译器选项。例如，`noImplicitAny` 是一个推荐的选项，它会在具有隐含 `any` 类型的表达式和声明上触发编译器报错。

你也可以为类成员添加 [private/protected 修饰符](https://www.typescriptlang.org/docs/handbook/classes.html) 以进行访问控制。让我们将 `handleGameStateChange` 与 `handleRestart` 标记为 `private` ，因为它们是 `gameStateBar`内部的。

```ts
private handleGameStateChange(e: CustomEvent) {...}
private handleRestart(e: Event) {...}
```

再次，尝试使用以下命令打包应用程序，然后在浏览器中打开 `index.html` ：

```sh
npx webpack
```

### 在整个代码库中采用 TypeScript

在整个代码库中采用 TypeScript 基本上是针对所有js(x)文件重复前两个步骤。在将完全有效的 JavaScript 转换为 TypeScript 时，您可能需要做上述更改之外的一些调整。但是，TypeScript 编译器和您的编辑器（如果它支持TypeScript）应该会为您提供有用的提示和错误信息。例如，在 JavaScript 中，参数可以是可选的，但在 TypeScript 中，所有可选参数都必须用`?`标记。

你可以在`TicTacToe_TS`目录中查看完全转换好的井字棋项目。（在该目录中）使用以下命令构建项目：

```sh
npm install
npx webpack
```

通过打开 `index.html`，运行应用。

# 附录：常见问题

Q1：`npx webpack`报错：`Error: error:0308010C:digital envelope routines::unsupported`

A1：这个错误是 Node.js 17+ 中 OpenSSL 3.0 引入的安全策略变更 导致的，与 Webpack 的默认哈希算法（如 md4）不兼容。一种临时性的解决方案是：如果你使用 Windows 命令提示符， 可执行以下命令： `set NODE_OPTIONS=--openssl-legacy-provider`
