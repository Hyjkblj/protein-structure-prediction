# 项目目录结构详细说明

本文档详细说明 `react-standard-project` 目录下每个文件夹和文件的作用。

## 📁 根目录文件

### 配置文件

#### `package.json`
- **作用**: 项目配置文件，定义项目元数据和依赖
- **内容**: 
  - 项目名称、版本、描述
  - npm 脚本命令（dev, build, lint 等）
  - 生产依赖和开发依赖列表
- **重要性**: ⭐⭐⭐⭐⭐ 核心配置文件

#### `package-lock.json`
- **作用**: 锁定依赖版本，确保团队成员安装相同版本的依赖
- **内容**: 完整的依赖树和版本信息
- **重要性**: ⭐⭐⭐⭐ 不要手动修改，由 npm 自动生成

#### `vite.config.js`
- **作用**: Vite 构建工具的配置文件
- **内容**: 
  - 路径别名配置（如 `@/src`）
  - 开发服务器配置（端口、代理等）
  - 构建优化配置
- **重要性**: ⭐⭐⭐⭐ 构建工具的核心配置

#### `.eslintrc.cjs`
- **作用**: ESLint 代码检查工具的配置文件
- **内容**: 
  - 代码检查规则
  - React 相关插件配置
  - 代码风格规范
- **重要性**: ⭐⭐⭐ 确保代码质量

#### `.gitignore`
- **作用**: Git 版本控制忽略文件配置
- **内容**: 指定哪些文件/文件夹不需要提交到 Git
- **忽略项**: 
  - `node_modules/` - 依赖包
  - `dist/` - 构建产物
  - `.env` - 环境变量
- **重要性**: ⭐⭐⭐⭐ 避免提交不必要的文件

### HTML 入口文件

#### `index.html`
- **作用**: Vite 项目的 HTML 入口文件
- **内容**: 
  - HTML 结构
  - 3Dmol.js CDN 链接（用于3D分子可视化）
  - React 应用的挂载点 `<div id="root">`
- **重要性**: ⭐⭐⭐⭐⭐ 应用的入口点

### 文档文件

#### `README.md`
- **作用**: 项目说明文档
- **内容**: 
  - 项目介绍
  - 技术栈说明
  - 安装和使用指南
  - 项目结构概览
- **重要性**: ⭐⭐⭐⭐ 项目文档

#### `MOLSTAR_USAGE.md`
- **作用**: Mol* 库的使用指南
- **内容**: 
  - Mol* 集成说明
  - API 使用方法
  - 示例代码
- **重要性**: ⭐⭐ 特定功能的文档

#### `PDB_FUNCTIONALITY.md`
- **作用**: PDB（蛋白质数据库）功能说明文档
- **内容**: 
  - PDB 搜索功能说明
  - 结构预测功能说明
- **重要性**: ⭐⭐ 特定功能的文档

#### `START_SERVER.md`
- **作用**: 服务器启动指南
- **内容**: 
  - 如何启动开发服务器
  - 常见问题解决
- **重要性**: ⭐⭐ 开发指南

#### `TEST_3DMOL.md`
- **作用**: 3Dmol.js 测试和调试指南
- **内容**: 
  - 3D 模型显示问题排查
  - 测试步骤
- **重要性**: ⭐⭐ 调试文档

#### `PACKAGE_DESCRIPTION.md`
- **作用**: npm 包依赖说明文档
- **内容**: 
  - 每个 npm 包的详细作用
  - 依赖关系说明
- **重要性**: ⭐⭐ 依赖说明文档

#### `PROJECT_STRUCTURE.md`（本文件）
- **作用**: 项目目录结构详细说明
- **内容**: 每个文件夹和文件的作用
- **重要性**: ⭐⭐⭐ 项目结构文档

### 依赖文件夹

#### `node_modules/`
- **作用**: npm 安装的所有依赖包
- **内容**: 所有第三方库的源代码
- **大小**: 通常很大（几十到几百 MB）
- **重要性**: ⭐⭐⭐⭐ 不要手动修改，由 npm 管理
- **注意**: 已添加到 `.gitignore`，不会提交到 Git

---

## 📁 public/ 目录

存放静态资源文件，这些文件会被直接复制到构建输出目录。

#### `public/index.html`
- **作用**: 备用 HTML 模板（可能未使用）
- **注意**: Vite 项目通常使用根目录的 `index.html`

#### `public/vite.svg`
- **作用**: Vite 的默认图标
- **用途**: 网站 favicon 或占位图片

#### `public/test.html`
- **作用**: 测试用的 HTML 文件
- **用途**: 可能用于测试某些功能

---

## 📁 src/ 目录

源代码目录，包含所有应用代码。

### 入口文件

#### `src/main.jsx`
- **作用**: React 应用的入口文件
- **内容**: 
  - 导入 React 和 ReactDOM
  - 导入根组件 `App`
  - 渲染应用到 DOM
  - 配置 React Router
- **重要性**: ⭐⭐⭐⭐⭐ 应用启动入口

#### `src/index.css`
- **作用**: 全局样式文件
- **内容**: 
  - CSS 重置样式
  - 全局变量定义
  - 通用样式类
- **重要性**: ⭐⭐⭐⭐ 全局样式

#### `src/App.jsx`
- **作用**: 根组件，定义应用的路由结构
- **内容**: 
  - React Router 配置
  - 路由定义（/, /about, /molstar, 404）
  - Layout 组件包装
- **重要性**: ⭐⭐⭐⭐⭐ 应用核心组件

---

### 📁 src/components/ 目录

存放可复用的 React 组件。

#### `src/components/Button/`
- **作用**: 按钮组件
- **文件**:
  - `Button.jsx` - 按钮组件逻辑
  - `Button.css` - 按钮样式
  - `index.js` - 导出文件，方便导入
- **用途**: 统一的按钮样式和行为

#### `src/components/Layout/`
- **作用**: 页面布局组件
- **文件**:
  - `index.jsx` - 布局组件（包含导航栏、页脚等）
  - `Layout.css` - 布局样式
- **用途**: 为所有页面提供统一的布局结构

#### `src/components/MolstarViewer/`
- **作用**: Mol* 3D 分子查看器组件（旧版本）
- **文件**:
  - `MolstarViewer.jsx` - 主查看器组件
  - `MolstarViewer.css` - 查看器样式
  - `MolstarControls.jsx` - 控制面板组件
  - `MolstarControls.css` - 控制面板样式
  - `MolstarViewerIframe.jsx` - iframe 版本的查看器
  - `index.js` - 导出文件
- **状态**: ⚠️ 可能已被 `Protein3DViewer` 替代
- **用途**: 使用 Mol* 库显示3D分子结构

#### `src/components/Protein3DViewer/`
- **作用**: 纯前端的蛋白质3D查看器组件（当前使用）
- **文件**:
  - `Protein3DViewer.jsx` - 3D查看器组件，使用 3Dmol.js
  - `Protein3DViewer.css` - 查看器样式
  - `index.js` - 导出文件
- **功能**: 
  - 显示3D蛋白质结构
  - 支持多种显示样式（cartoon, stick, sphere, surface）
  - 支持高亮特定残基
  - 支持从 PDB ID、URL 或 PDB 数据加载结构
- **重要性**: ⭐⭐⭐⭐⭐ 核心功能组件

#### `src/components/SequenceInput/`
- **作用**: 氨基酸序列输入组件
- **文件**:
  - `SequenceInput.jsx` - 序列输入组件
  - `SequenceInput.css` - 输入框样式
  - `index.js` - 导出文件
- **功能**: 
  - 输入氨基酸序列（单字母或三字母代码）
  - 序列验证
  - 可点击的序列显示（用于高亮3D结构中的残基）
  - 示例序列快速加载
- **重要性**: ⭐⭐⭐⭐⭐ 核心功能组件

---

### 📁 src/pages/ 目录

存放页面级组件，通常对应路由中的页面。

#### `src/pages/HomePage/`
- **作用**: 首页组件
- **文件**:
  - `index.jsx` - 首页组件（包含计数器示例）
  - `HomePage.css` - 首页样式
- **路由**: `/`
- **用途**: 应用的主页

#### `src/pages/AboutPage/`
- **作用**: 关于页面组件
- **文件**:
  - `index.jsx` - 关于页组件
  - `AboutPage.css` - 关于页样式
- **路由**: `/about`
- **用途**: 项目介绍和说明

#### `src/pages/MolstarPage/`
- **作用**: 3D分子可视化页面（主要功能页面）
- **文件**:
  - `index.jsx` - 主页面组件
  - `MolstarPage.css` - 页面样式
- **路由**: `/molstar`
- **功能**: 
  - 序列输入和3D结构生成
  - PDB ID 加载
  - 3D结构可视化
  - 序列与3D结构的交互（点击高亮）
- **重要性**: ⭐⭐⭐⭐⭐ 核心功能页面

#### `src/pages/NotFoundPage/`
- **作用**: 404 错误页面
- **文件**:
  - `index.jsx` - 404页面组件
  - `NotFoundPage.css` - 404页面样式
- **路由**: `*` (所有未匹配的路由)
- **用途**: 显示页面未找到的错误信息

---

### 📁 src/utils/ 目录

存放工具函数和辅助代码。

#### `src/utils/index.js`
- **作用**: 工具函数集合
- **内容**: 通用的工具函数（如日期格式化、字符串处理等）
- **用途**: 在多个组件中复用的工具函数

#### `src/utils/structurePrediction.js`
- **作用**: 蛋白质结构预测工具
- **功能**: 
  - `generatePlaceholderStructure()` - 生成演示用的 α-螺旋结构
  - `generateStructureFromSequence()` - 从序列生成结构（主函数）
  - `searchPdbBySequence()` - 在 PDB 中搜索序列（已禁用）
- **重要性**: ⭐⭐⭐⭐ 核心业务逻辑

---

### 📁 src/api/ 目录

存放 API 相关的配置和请求函数。

#### `src/api/index.js`
- **作用**: API 配置和请求封装
- **内容**: 
  - API 基础 URL 配置
  - 请求拦截器
  - 通用请求函数（GET, POST 等）
- **用途**: 统一管理 API 请求

---

### 📁 src/hooks/ 目录

存放自定义 React Hooks。

#### `src/hooks/useLocalStorage.js`
- **作用**: 本地存储的 Hook
- **功能**: 
  - 将状态同步到 localStorage
  - 页面刷新后保持状态
- **用途**: 持久化存储用户数据

#### `src/hooks/index.js`
- **作用**: Hooks 导出文件
- **内容**: 统一导出所有自定义 Hooks
- **用途**: 方便导入使用

---

## 📊 目录结构总结

```
react-standard-project/
│
├── 📄 配置文件
│   ├── package.json          # 项目配置和依赖
│   ├── vite.config.js        # Vite 构建配置
│   ├── .eslintrc.cjs         # ESLint 代码检查配置
│   └── .gitignore           # Git 忽略配置
│
├── 📄 入口文件
│   └── index.html            # HTML 入口（包含 3Dmol.js CDN）
│
├── 📁 public/                # 静态资源
│   ├── vite.svg             # 图标
│   └── test.html            # 测试文件
│
├── 📁 src/                   # 源代码目录
│   ├── main.jsx             # React 入口
│   ├── App.jsx              # 根组件（路由配置）
│   ├── index.css            # 全局样式
│   │
│   ├── 📁 components/       # 可复用组件
│   │   ├── Button/          # 按钮组件
│   │   ├── Layout/          # 布局组件
│   │   ├── MolstarViewer/  # Mol* 查看器（旧）
│   │   ├── Protein3DViewer/ # 3Dmol.js 查看器（当前）
│   │   └── SequenceInput/  # 序列输入组件
│   │
│   ├── 📁 pages/            # 页面组件
│   │   ├── HomePage/       # 首页
│   │   ├── AboutPage/      # 关于页
│   │   ├── MolstarPage/    # 3D可视化页（核心）
│   │   └── NotFoundPage/   # 404页
│   │
│   ├── 📁 utils/            # 工具函数
│   │   ├── index.js        # 通用工具
│   │   └── structurePrediction.js # 结构预测逻辑
│   │
│   ├── 📁 api/              # API 配置
│   │   └── index.js        # API 请求封装
│   │
│   └── 📁 hooks/            # 自定义 Hooks
│       ├── useLocalStorage.js # 本地存储 Hook
│       └── index.js        # Hooks 导出
│
├── 📁 node_modules/         # npm 依赖（不提交到 Git）
│
└── 📄 文档文件
    ├── README.md            # 项目说明
    ├── MOLSTAR_USAGE.md     # Mol* 使用指南
    ├── PDB_FUNCTIONALITY.md  # PDB 功能说明
    ├── START_SERVER.md      # 启动指南
    ├── TEST_3DMOL.md        # 3Dmol 测试指南
    ├── PACKAGE_DESCRIPTION.md # 依赖包说明
    └── PROJECT_STRUCTURE.md  # 本文件
```

---

## 🎯 核心功能流程

1. **用户输入序列** → `SequenceInput` 组件
2. **生成结构** → `structurePrediction.js` 工具函数
3. **显示3D结构** → `Protein3DViewer` 组件
4. **点击序列高亮** → `MolstarPage` 协调两个组件

---

## 📝 注意事项

1. **不要修改 `node_modules/`**: 依赖包由 npm 管理
2. **不要删除 `package-lock.json`**: 确保依赖版本一致
3. **组件命名**: 使用 PascalCase（如 `Button.jsx`）
4. **文件组织**: 每个组件有自己的文件夹，包含 `.jsx`、`.css` 和 `index.js`
5. **路由配置**: 在 `App.jsx` 中统一管理

---

## 🔍 快速查找

- **想修改路由？** → `src/App.jsx`
- **想添加新页面？** → `src/pages/` 创建新文件夹
- **想添加新组件？** → `src/components/` 创建新文件夹
- **想修改3D查看器？** → `src/components/Protein3DViewer/`
- **想修改序列输入？** → `src/components/SequenceInput/`
- **想修改结构生成逻辑？** → `src/utils/structurePrediction.js`
- **想修改全局样式？** → `src/index.css`
- **想修改构建配置？** → `vite.config.js`

