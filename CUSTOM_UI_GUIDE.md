# 创建自定义 Molstar UI 指南

## 📋 可行性分析

**答案：完全可以做到！** Molstar 提供了底层 API，允许你只使用其核心渲染引擎，而自己实现所有 UI 组件。

---

## ✅ 前提条件

### 1. **技术栈要求**
- ✅ React 基础（或 Vue/Angular/原生 JS）
- ✅ WebGL 基础知识（了解即可，Molstar 已封装）
- ✅ 分子生物学基础（理解 PDB、序列等概念）
- ⚠️ TypeScript（可选但推荐，Molstar 使用 TS）

### 2. **Molstar 核心 API 理解**
需要掌握以下 Molstar API：

#### 核心类：
- `PluginSpec` / `DefaultPluginSpec` - 插件规格定义
- `PluginUIContext` - 插件上下文（包含状态管理）
- `StateTransforms` - 状态转换（加载、解析、表示等）
- `Canvas3D` - 3D 渲染画布
- `PluginCommands` - 命令系统

#### 关键模块：
- `mol-plugin-state` - 状态管理
- `mol-plugin` - 核心插件系统
- `mol-repr` - 表示系统（cartoon、spacefill 等）
- `mol-model` - 分子模型处理
- `mol-geo` - 几何计算

---

## 🏗️ 架构设计

### 方案对比

| 特性 | 内置 UI (`Plugin` 组件) | 自定义 UI (仅 `PluginUIContext`) |
|------|------------------------|--------------------------------|
| UI 控制 | ❌ Molstar 控制 | ✅ 完全自定义 |
| 渲染引擎 | ✅ WebGL | ✅ WebGL |
| 功能完整性 | ✅ 完整 | ✅ 完整（需自己实现） |
| 开发工作量 | ⭐ 低 | ⭐⭐⭐⭐ 高 |
| 灵活性 | ⭐⭐ 中等 | ⭐⭐⭐⭐⭐ 极高 |

### 推荐架构

```
自定义 React UI
    ↓
PluginUIContext (无 UI，只有状态管理)
    ↓
Canvas3D (纯渲染画布)
    ↓
StateTransforms (数据加载和转换)
```

---

## 🔧 实现步骤

### 步骤 1：创建自定义 Plugin Context

```javascript
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec'

// 创建无 UI 的 Plugin Context
const spec = DefaultPluginSpec() // 只使用核心功能，不包括 UI
const plugin = new PluginUIContext(spec, {
  // 关键：不渲染 Plugin 组件，只使用底层 API
})
await plugin.init()
```

### 步骤 2：手动创建 Canvas3D

```javascript
import { Canvas3D } from 'molstar/lib/mol-canvas3d/canvas3d'

const canvas = new Canvas3D(containerElement, {
  // 配置选项
  pixelRatio: window.devicePixelRatio,
  preserveDrawingBuffer: false,
})

// 等待初始化
await canvas.init()
```

### 步骤 3：手动加载结构

```javascript
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'

// 方式 1: 从 PDB ID 加载
const dataRef = await plugin.build()
  .toRoot()
  .apply(StateTransforms.Data.Download, {
    url: `https://files.rcsb.org/view/${pdbId}.pdb`,
    isBinary: false
  })

// 方式 2: 从字符串加载
const dataRef = await plugin.build()
  .toRoot()
  .apply(StateTransforms.Data.ImportString, {
    data: pdbDataString,
    format: 'pdb'
  })

// 解析 PDB
const modelRef = await plugin.build()
  .to(dataRef)
  .apply(StateTransforms.Model.TrajectoryFromPDB)

// 创建结构
const structureRef = await plugin.build()
  .to(modelRef)
  .apply(StateTransforms.Model.StructureFromModel)

// 创建 3D 表示
const reprRef = await plugin.build()
  .to(structureRef)
  .apply(StateTransforms.Representation.StructureRepresentation3D, {
    type: 'cartoon', // 'cartoon', 'ball-and-stick', 'spacefill' 等
  })
```

### 步骤 4：将表示添加到 Canvas3D

```javascript
const repr = plugin.state.data.select(reprRef)[0]?.obj?.data?.repr
if (repr) {
  canvas.add(repr)
  canvas.requestDraw()
  
  // 重置相机
  canvas.requestCameraReset()
}
```

### 步骤 5：实现自定义控制面板

创建自己的 React 组件：

```jsx
function CustomControls({ plugin, canvas }) {
  const [representation, setRepresentation] = useState('cartoon')
  
  const changeRepresentation = async (type) => {
    // 更新表示类型
    // ... 使用 StateTransforms.Representation 更新
  }
  
  return (
    <div className="custom-controls">
      <button onClick={() => changeRepresentation('cartoon')}>
        Cartoon
      </button>
      <button onClick={() => changeRepresentation('ball-and-stick')}>
        Ball & Stick
      </button>
      <button onClick={() => changeRepresentation('spacefill')}>
        Spacefill
      </button>
    </div>
  )
}
```

---

## 📦 需要的 Molstar 包

```json
{
  "dependencies": {
    "molstar": "^3.0.0"
  }
}
```

关键导入：
- `molstar/lib/mol-plugin-ui/context` - PluginUIContext
- `molstar/lib/mol-plugin/spec` - PluginSpec
- `molstar/lib/mol-plugin-state/transforms` - StateTransforms
- `molstar/lib/mol-canvas3d/canvas3d` - Canvas3D
- `molstar/lib/mol-plugin/commands` - PluginCommands

---

## 🎯 核心功能实现清单

要实现与内置 UI 相同的功能，需要自己实现：

### ✅ 必需功能
- [x] **3D 渲染** - 使用 `Canvas3D`
- [x] **加载结构** - 使用 `StateTransforms.Data`
- [x] **解析数据** - 使用 `StateTransforms.Model`
- [x] **创建表示** - 使用 `StateTransforms.Representation`
- [x] **相机控制** - `Canvas3D.requestCameraReset()`

### 🔧 可选功能（需要自己实现 UI）
- [ ] **序列查看器** - 需要从结构提取序列并渲染
- [ ] **结构工具面板** - 组件管理、测量、样式切换
- [ ] **下载结构** - 使用 `StateActions.Structure.DownloadStructure`
- [ ] **文件上传** - 使用 `StateTransforms.Data.ImportString`
- [ ] **轨迹播放** - 使用轨迹相关的 Transform
- [ ] **状态保存/加载** - 使用 `PluginState` 序列化

---

## 💡 简化方案：隐藏内置 UI，使用自定义覆盖

如果你只是想改变 UI 外观，可以考虑：

```javascript
// 隐藏内置 UI 元素
.msp-plugin {
  /* 隐藏左侧面板 */
  .msp-layout-left {
    display: none;
  }
  
  /* 隐藏右侧面板 */
  .msp-layout-right {
    display: none;
  }
  
  /* 只保留 3D 视图 */
  .msp-layout-main {
    width: 100%;
  }
}

// 然后在上面叠加你的自定义控制面板
<div className="custom-ui-overlay">
  <CustomControls />
</div>
```

---

## 📚 参考资源

1. **Molstar 官方文档**
   - https://molstar.org/docs/
   - https://github.com/molstar/molstar

2. **API 文档**
   - `mol-plugin-state/transforms` - 状态转换
   - `mol-plugin/commands` - 命令系统
   - `mol-canvas3d` - 3D 渲染

3. **示例代码**
   - Molstar GitHub 仓库中的示例
   - `examples/` 目录下的自定义实现

---

## ⚠️ 注意事项

1. **复杂度**：实现完整功能需要大量工作（估计 2-4 周）
2. **维护成本**：Molstar 更新时可能需要适配
3. **功能差距**：某些高级功能可能需要深入理解 Molstar 内部机制
4. **性能**：自定义实现需要优化才能达到内置 UI 的性能

---

## 🚀 快速开始示例

查看 `src/components/MolstarViewer/MolstarViewerCustom.jsx`（如果存在）获取完整实现示例。

