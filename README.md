# 蛋白质分子结构预测应用

一个基于 React 和 Mol* 的蛋白质分子结构预测与可视化应用，支持从氨基酸序列生成3D结构，或通过 PDB ID 加载现有结构。

## 🚀 技术栈

- **React 18** - 最新的 React 版本
- **React Router** - 路由管理
- **Vite** - 快速的前端构建工具
- **ESLint** - 代码质量检查
- **Mol*** - 大分子3D可视化库

## 📁 项目结构

```
react-standard-project/
├── public/              # 静态资源文件
│   ├── index.html      # HTML 模板
│   └── vite.svg        # 网站图标
├── src/
│   ├── api/            # API 配置和请求函数
│   │   └── index.js
│   ├── components/     # 可复用组件
│   │   ├── Button/     # 按钮组件
│   │   └── Layout/     # 布局组件
│   ├── hooks/          # 自定义 Hooks
│   │   ├── useLocalStorage.js
│   │   └── index.js
│   ├── pages/          # 页面组件
│   │   ├── HomePage/   # 首页
│   │   ├── AboutPage/  # 关于页
│   │   ├── MolstarPage/ # Mol* 可视化页面
│   │   └── NotFoundPage/ # 404 页
│   ├── components/
│   │   ├── MolstarViewer/ # Mol* 查看器组件
│   ├── utils/          # 工具函数
│   │   └── index.js
│   ├── App.jsx         # 主应用组件
│   ├── main.jsx        # 入口文件
│   └── index.css      # 全局样式
├── .eslintrc.cjs       # ESLint 配置
├── .gitignore          # Git 忽略文件
├── package.json        # 项目依赖
├── vite.config.js      # Vite 配置
└── README.md           # 项目说明
```

## 🛠️ 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 📝 功能特性

- ✅ **蛋白质3D结构可视化** - 使用 Mol* 库进行高质量的3D分子结构展示
- ✅ **序列到结构生成** - 从氨基酸序列自动生成3D结构（纯前端实现）
- ✅ **后端预测实验** - 调用后端 AI4S 服务进行结构预测，支持返回 PDB 文件并自动渲染
- ✅ **PDB ID 快速加载** - 直接从 RCSB Protein Data Bank 加载结构
- ✅ **横向布局设计** - 优化的用户界面，输入区域与查看器并排显示
- ✅ **序列编辑功能** - 支持片段替换和结构重新生成
- ✅ **响应式设计** - 适配不同屏幕尺寸
- ✅ **现代化技术栈** - React 18 + Vite + Mol*

## 🎯 目录说明

### `/src/components`
存放可复用的 React 组件。每个组件都有自己的文件夹，包含组件文件和样式文件。

### `/src/pages`
存放页面级组件，通常对应路由中的页面。

### `/src/hooks`
存放自定义 React Hooks，可以在多个组件中复用。

### `/src/utils`
存放工具函数，如日期格式化、防抖节流等。

### `/src/api`
存放 API 相关的配置和请求函数。

## 🧬 Mol* 分子可视化

项目已集成 [Mol*](https://github.com/molstar/molstar)，一个强大的大分子结构可视化库。

### 使用方式

1. 访问主页查看蛋白质结构预测界面
2. 输入氨基酸序列或 PDB ID 来加载/生成3D结构
3. 点击"后端预测实验"按钮调用后端服务进行结构预测
4. 在3D查看器中交互式查看和操作分子结构

详细使用说明请参考 [MOLSTAR_USAGE.md](./MOLSTAR_USAGE.md)

### 后端预测功能

项目支持调用后端 AI4S 服务进行蛋白质结构预测：

1. **输入序列**: 在序列输入框中输入氨基酸序列
2. **启动预测**: 点击"🚀 后端预测实验"按钮
3. **等待结果**: 系统会显示预测进度，完成后自动渲染3D模型

**后端接口要求**:
- 接口地址: `POST /api/predict`
- 请求格式: `{ "sequence": "MKTAYIAKQRQISFVKSHFSRQ" }`
- 响应格式: JSON `{ "pdbData": "..." }` 或纯文本 PDB 文件

详细的后端接口说明请参考 [BACKEND_API.md](./BACKEND_API.md)

**配置后端地址**:
创建 `.env` 文件并设置：
```
VITE_API_BASE_URL=http://localhost:3001/api
```

## 📚 扩展建议

1. **状态管理**: 如需全局状态管理，可以添加 Redux 或 Zustand
2. **UI 组件库**: 可以集成 Ant Design、Material-UI 等组件库
3. **TypeScript**: 如需类型安全，可以迁移到 TypeScript
4. **测试**: 可以添加 Jest 和 React Testing Library 进行单元测试
5. **样式方案**: 可以使用 CSS Modules、Styled Components 或 Tailwind CSS

## 📄 许可证

MIT

