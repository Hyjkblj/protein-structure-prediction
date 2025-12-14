# 项目依赖包说明

本文档详细说明项目中每个 npm 包的作用和用途。

## 📦 生产依赖 (dependencies)

这些包会被打包到最终的生产环境中。

### 1. `react` (^18.2.0)
**作用**: React 核心库
- **功能**: 提供组件化开发的基础框架
- **用途**: 
  - 创建和管理 React 组件
  - 处理组件状态和生命周期
  - 实现虚拟 DOM 和高效的 UI 更新
- **为什么需要**: 这是整个项目的基础框架，所有组件都基于 React

### 2. `react-dom` (^18.2.0)
**作用**: React DOM 渲染库
- **功能**: 将 React 组件渲染到浏览器 DOM 中
- **用途**:
  - 提供 `ReactDOM.render()` 等方法
  - 处理浏览器特定的 DOM 操作
  - 连接 React 组件树和实际 DOM
- **为什么需要**: React 本身不直接操作 DOM，需要通过 react-dom 来渲染

### 3. `react-router-dom` (^6.20.0)
**作用**: React 路由库
- **功能**: 实现单页应用（SPA）的路由导航
- **用途**:
  - 定义不同 URL 路径对应的页面组件
  - 实现页面间的无刷新跳转
  - 处理浏览器前进/后退按钮
  - 支持路由参数和查询字符串
- **为什么需要**: 本项目有多个页面（首页、关于页、3D查看页等），需要路由来管理页面切换
- **使用示例**: 
  - `<BrowserRouter>` - 路由容器
  - `<Routes>` 和 `<Route>` - 定义路由规则
  - `<Link>` - 导航链接

---

## 🛠️ 开发依赖 (devDependencies)

这些包只在开发时使用，不会打包到生产环境。

### 1. `vite` (^5.0.8)
**作用**: 现代化的前端构建工具
- **功能**: 
  - 快速的开发服务器（热模块替换 HMR）
  - 高效的代码打包和构建
  - 优化的生产环境构建
- **用途**:
  - `npm run dev` - 启动开发服务器
  - `npm run build` - 构建生产版本
  - `npm run preview` - 预览生产构建
- **为什么需要**: 替代传统的 Webpack，提供更快的开发体验和构建速度
- **优势**: 
  - 使用原生 ES 模块，启动速度快
  - 热更新几乎瞬间完成
  - 生产构建使用 Rollup，体积更小

### 2. `@vitejs/plugin-react` (^4.2.1)
**作用**: Vite 的 React 插件
- **功能**: 让 Vite 能够处理 React 代码
- **用途**:
  - 支持 JSX 语法转换
  - 启用 Fast Refresh（快速刷新）
  - 优化 React 组件的热更新
- **为什么需要**: Vite 本身不直接支持 React，需要这个插件来编译 JSX 和优化开发体验

### 3. `eslint` (^8.55.0)
**作用**: JavaScript/JSX 代码检查工具
- **功能**: 
  - 静态代码分析
  - 发现代码中的潜在问题
  - 强制执行代码风格规范
- **用途**:
  - `npm run lint` - 检查代码质量
  - 在开发时实时提示代码问题
  - 确保代码符合最佳实践
- **为什么需要**: 提高代码质量，减少 bug，保持代码风格一致

### 4. `eslint-plugin-react` (^7.33.2)
**作用**: ESLint 的 React 规则插件
- **功能**: 提供 React 特定的代码检查规则
- **用途**:
  - 检查 React 组件的常见错误
  - 验证 props 的使用
  - 检查组件命名规范
  - 发现 React API 的错误使用
- **为什么需要**: React 有特定的最佳实践，这个插件帮助确保代码符合 React 规范

### 5. `eslint-plugin-react-hooks` (^4.6.0)
**作用**: React Hooks 规则检查插件
- **功能**: 专门检查 React Hooks 的使用
- **用途**:
  - 确保 Hooks 的使用符合规则（如只在顶层调用）
  - 检查依赖数组是否正确
  - 发现可能导致 bug 的 Hooks 使用模式
- **为什么需要**: Hooks 有严格的规则，违反会导致 bug，这个插件帮助避免常见错误

### 6. `eslint-plugin-react-refresh` (^0.4.5)
**作用**: React Fast Refresh 规则插件
- **功能**: 确保代码兼容 React Fast Refresh
- **用途**:
  - 检查可能导致 Fast Refresh 失败的代码模式
  - 确保组件可以正确热更新
- **为什么需要**: 与 Vite 的 Fast Refresh 配合，确保热更新功能正常工作

### 7. `@types/react` (^18.2.43)
**作用**: React 的 TypeScript 类型定义
- **功能**: 为 React 提供类型支持（即使项目使用 JavaScript）
- **用途**:
  - IDE 智能提示和自动补全
  - 类型检查（如果使用 TypeScript）
  - 更好的开发体验
- **为什么需要**: 即使项目是 JavaScript，这些类型定义也能提供更好的 IDE 支持

### 8. `@types/react-dom` (^18.2.17)
**作用**: React DOM 的 TypeScript 类型定义
- **功能**: 为 react-dom 提供类型支持
- **用途**: 与 `@types/react` 类似，提供 react-dom API 的类型信息
- **为什么需要**: 完善 React 生态系统的类型支持

---

## 📊 依赖关系图

```
项目
├── react (核心框架)
├── react-dom (DOM 渲染)
└── react-router-dom (路由)

开发工具链
├── vite (构建工具)
│   └── @vitejs/plugin-react (React 支持)
└── eslint (代码检查)
    ├── eslint-plugin-react (React 规则)
    ├── eslint-plugin-react-hooks (Hooks 规则)
    └── eslint-plugin-react-refresh (Fast Refresh 规则)
```

---

## 🔍 为什么没有某些常见的包？

### 没有 `axios` 或 `fetch` 库？
- **原因**: 使用浏览器原生的 `fetch` API，无需额外依赖

### 没有 `lodash` 或工具库？
- **原因**: 项目规模较小，使用原生 JavaScript 和自定义工具函数即可

### 没有状态管理库（如 Redux）？
- **原因**: 项目使用 React 的 `useState` 和 `useContext` 即可满足需求

### 没有 UI 组件库（如 Material-UI）？
- **原因**: 项目使用自定义 CSS 实现 UI，保持轻量级

---

## 📝 总结

- **核心框架**: React + React DOM
- **路由**: React Router DOM
- **构建工具**: Vite + React 插件
- **代码质量**: ESLint + React 相关插件
- **类型支持**: TypeScript 类型定义（用于 IDE 支持）

这是一个轻量级、现代化的 React 项目架构，专注于核心功能，避免不必要的依赖。

