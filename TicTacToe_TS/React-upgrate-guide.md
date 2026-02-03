项目原始React的主版本为15.4.2，不支持Hooks。
为了使用useState、useEffect这两个hook，以将React类组件转换为函数组件，必须升级React的主版本，并同步升级相关依赖。

第一步：`npm install`升级
```bash
npm install react@^17.0.2 react-dom@^17.0.2
npm install @types/react@^17.0.0
npm install @types/react-dom@^17.0.0
```
第二步：更新`webpack.config.js`，删去`externals`

第三步：更新`index.html`，删去对两个JS的导入：`./node_modules/xxx/dist/xxx.js`

第四步：更新`tsconfig.json`，在"compilerOptions"中增加"esModuleInterop"

------

类组件向函数组件转换指南：
1. import React from 'react'; 声明组件的类型为`React.FC`
2. 使用useState、useEffect改写相关逻辑：
  1. import { useState, useEffect } from "react"; 
  2. 将`React.Component<CompProps, CompState>`中的CompProps转移到函数组件入参，作为props对象的类型，props对象需包含接口中的所有属性。去掉所有prop引用前的`this.props.`。
  3. 将`React.Component<CompProps, CompState>`中的CompState、this.state，this.setState转移到useState语句。如果this.setState的第二个参数(callback，在重新渲染完成后调用)不为空，则需将其逻辑转移到一个依赖为state的effect中，并按需改写（示例见`board.tsx`）。
3. 生命周期处理：使用一个依赖数组为空的effect，将componentDidMount的内容转移到effect的主体逻辑，componentWillUnmount的内容转移到effect的清理函数。
4. 将类中的方法转换为内部函数，去掉所有函数调用前的`this.`。
5. 将render方法的内容拿出来。