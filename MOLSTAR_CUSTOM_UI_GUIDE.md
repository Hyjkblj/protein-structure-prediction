# 创建自定义 Molstar 可视化页面指南

## 📋 概述

完全可以使用 Molstar 的核心渲染引擎（**Canvas3D**）而不使用其内置 UI，创建功能完全相同的自定义可视化页面。

## ✅ 可行性

**完全可以做到！** Molstar 的设计是模块化的：
- **核心渲染引擎**：`Canvas3D` - 独立的 WebGL 渲染器
- **数据加载系统**：`PluginContext` + `StateTransforms` - 数据管道
- **UI 组件**：`Plugin` + `Layout` - 可选的界面层

你可以只使用核心功能，自己实现所有 UI 组件。

---

## 🔧 前提条件

### 1. **技术栈要求**
- ✅ React 18+ / Vue 3+ / 原生 JavaScript
- ✅ TypeScript（推荐，Molstar 提供完整的类型定义）
- ✅ 了解 WebGL / Three.js 基础概念（有助于理解渲染流程）

### 2. **Molstar 核心模块依赖**

需要导入的核心模块：

```javascript
// 核心渲染引擎
import { Canvas3D } from 'molstar/lib/mol-canvas3d/canvas3d'

// 数据加载和管理
import { PluginContext } from 'molstar/lib/mol-plugin/context'
import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec'

// 数据转换
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'

// 结构表示
import { RepresentationRegistry } from 'molstar/lib/mol-repr/registry'

// 交互控制
import { TrackballControls } from 'molstar/lib/mol-canvas3d/controls/trackball'
```

### 3. **需要实现的功能模块**

为了达到与内置 UI 相同的功能，需要实现以下模块：

#### A. 3D 渲染器（必需）
- Canvas3D 初始化
- 视口管理
- 相机控制（旋转、缩放、平移）
- 渲染循环

#### B. 数据加载系统（必需）
- 文件下载/上传
- PDB/CIF 格式解析
- 结构数据转换
- 错误处理

#### C. 结构表示系统（必需）
- 表示类型切换（Cartoon, Surface, Ball-and-Stick 等）
- 颜色方案应用
- 透明度控制
- 选择和高亮

#### D. 序列查看器（可选但常用）
- 氨基酸序列显示
- 残基选择和定位
- 序列与结构联动

#### E. 控制面板（必需）
- 下载结构
- 应用样式
- 组件管理
- 测量工具

#### F. 日志系统（可选）
- 操作记录
- 错误提示
- 加载状态

---

## 🏗️ 架构设计

### 方案一：完全自定义（推荐用于学习）

```javascript
// 完全自主实现所有 UI
import { Canvas3D } from 'molstar/lib/mol-canvas3d/canvas3d'
import { PluginContext } from 'molstar/lib/mol-plugin/context'

// 自己创建 React 组件来替代所有 UI
function CustomMolstarViewer() {
  // 1. 创建 PluginContext（不包含 UI）
  const plugin = useMemo(() => {
    const spec = DefaultPluginSpec() // 不是 DefaultPluginUISpec
    return new PluginContext(spec) // 不是 PluginUIContext
  }, [])
  
  // 2. 创建 Canvas3D
  const canvas3dRef = useRef(null)
  
  useEffect(() => {
    const canvas = document.createElement('canvas')
    containerRef.current.appendChild(canvas)
    
    canvas3dRef.current = new Canvas3D(canvas, {
      // Canvas3D 配置
    })
    
    plugin.init().then(() => {
      canvas3dRef.current.init()
    })
  }, [])
  
  // 3. 加载结构
  const loadStructure = async (pdbId) => {
    // 使用 StateTransforms 加载数据
    const data = await plugin.build().toRoot()
      .apply(StateTransforms.Data.Download, { url: `...` })
      .apply(StateTransforms.Model.TrajectoryFromPDB)
      .apply(StateTransforms.Model.StructureFromTrajectory)
      .apply(StateTransforms.Representation.StructureRepresentation3D, {
        type: 'cartoon'
      })
      .commit()
    
    // 添加到 Canvas3D
    canvas3dRef.current.add(data.repr)
  }
  
  // 4. 自定义 UI 组件
  return (
    <div className="custom-viewer">
      <div ref={containerRef} className="canvas-container" />
      <CustomControlPanel onLoad={loadStructure} />
      <CustomSequenceViewer />
      <CustomStylePanel />
    </div>
  )
}
```

### 方案二：混合方案（推荐用于生产）

```javascript
// 使用 PluginContext 但不渲染 Plugin UI
import { PluginContext } from 'molstar/lib/mol-plugin/context'
import { DefaultPluginSpec } from 'molstar/lib/mol-plugin/spec'

function HybridViewer() {
  const pluginRef = useRef(null)
  const canvas3dRef = useRef(null)
  
  useEffect(() => {
    // 1. 创建 PluginContext（后台管理数据，不渲染 UI）
    const spec = DefaultPluginSpec()
    pluginRef.current = new PluginContext(spec)
    
    // 2. 手动创建和挂载 Canvas3D
    const canvas = createCanvas()
    canvas3dRef.current = new Canvas3D(canvas)
    
    // 3. 连接 Plugin 和 Canvas3D
    pluginRef.current.init().then(() => {
      // 获取或创建 Canvas3D 的引用
      // 通过 plugin.canvas3d 或手动创建
    })
  }, [])
  
  // 4. 使用 Plugin 的 API 加载数据（这会自动渲染到 Canvas3D）
  const loadStructure = async (pdbId) => {
    await pluginRef.current.build().toRoot()
      .apply(StateTransforms.Data.Download, { url: `...` })
      // ... 其他转换
      .commit()
  }
  
  // 5. 自定义 UI 但使用 Plugin 的功能
  return (
    <div>
      <CustomUI />
      <div ref={canvasContainer} />
    </div>
  )
}
```

---

## 📝 核心 API 使用示例

### 1. 初始化 Canvas3D（不依赖 UI）

```javascript
import { Canvas3D } from 'molstar/lib/mol-canvas3d/canvas3d'

const canvas = document.createElement('canvas')
canvas.width = 800
canvas.height = 600
container.appendChild(canvas)

const canvas3d = new Canvas3D(canvas, {
  // 配置选项
  antialias: true,
  preserveDrawingBuffer: false,
  pixelScale: window.devicePixelRatio || 1
})

canvas3d.init()
```

### 2. 加载结构数据

```javascript
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { PluginContext } from 'molstar/lib/mol-plugin/context'

const plugin = new PluginContext(DefaultPluginSpec())
await plugin.init()

// 加载 PDB 文件
const dataRef = await plugin.build().toRoot()
  .apply(StateTransforms.Data.Download, {
    url: 'https://files.rcsb.org/view/1CRN.pdb',
    isBinary: false
  })
  .apply(StateTransforms.Model.TrajectoryFromPDB)
  .apply(StateTransforms.Model.StructureFromTrajectory)
  .apply(StateTransforms.Representation.StructureRepresentation3D, {
    type: 'cartoon',
    colorTheme: { name: 'chain-id' }
  })
  .commit()

// 获取表示对象并添加到 Canvas3D
const repr = dataRef.obj?.data?.repr
if (repr) {
  canvas3d.add(repr)
  canvas3d.requestCameraReset()
}
```

### 3. 切换表示类型

```javascript
// 更新表示
await plugin.build().to(dataRef)
  .update(StateTransforms.Representation.StructureRepresentation3D, {
    type: 'surface', // 切换到表面表示
    colorTheme: { name: 'element-symbol' }
  })
  .commit()
```

### 4. 相机控制

```javascript
import { PluginCommands } from 'molstar/lib/mol-plugin/commands'

// 重置相机
PluginCommands.Camera.Reset(plugin, {})

// 聚焦到结构
PluginCommands.Camera.Focus(plugin, {
  loci: structure.loci
})
```

### 5. 交互控制

```javascript
import { TrackballControls } from 'molstar/lib/mol-canvas3d/controls/trackball'

const controls = new TrackballControls(canvas3d.input)
// 自动处理鼠标和触摸事件
```

---

## 🎨 需要实现的自定义组件

### 1. 结构下载面板
```jsx
function DownloadPanel({ onDownload }) {
  const [pdbId, setPdbId] = useState('')
  
  const handleDownload = () => {
    onDownload(pdbId)
  }
  
  return (
    <div className="download-panel">
      <input 
        value={pdbId}
        onChange={e => setPdbId(e.target.value)}
        placeholder="输入 PDB ID"
      />
      <button onClick={handleDownload}>加载</button>
    </div>
  )
}
```

### 2. 样式控制面板
```jsx
function StylePanel({ currentStyle, onChange }) {
  const styles = ['cartoon', 'surface', 'ball-and-stick', 'spacefill']
  
  return (
    <div className="style-panel">
      {styles.map(style => (
        <button
          key={style}
          className={currentStyle === style ? 'active' : ''}
          onClick={() => onChange(style)}
        >
          {style}
        </button>
      ))}
    </div>
  )
}
```

### 3. 序列查看器
```jsx
function SequenceViewer({ sequence, onResidueClick }) {
  return (
    <div className="sequence-viewer">
      {sequence.map((residue, index) => (
        <span
          key={index}
          onClick={() => onResidueClick(residue, index)}
          className="residue"
        >
          {residue.code}
        </span>
      ))}
    </div>
  )
}
```

### 4. 组件管理面板
```jsx
function ComponentPanel({ components, onRemove, onFocus }) {
  return (
    <div className="component-panel">
      {components.map(comp => (
        <div key={comp.id} className="component-item">
          <span>{comp.name}</span>
          <button onClick={() => onFocus(comp)}>聚焦</button>
          <button onClick={() => onRemove(comp.id)}>删除</button>
        </div>
      ))}
    </div>
  )
}
```

---

## ⚠️ 注意事项

### 1. **性能优化**
- Canvas3D 需要手动管理渲染循环
- 大量结构需要分块加载
- 注意内存管理，及时清理不需要的表示

### 2. **错误处理**
- 网络请求失败
- 文件格式错误
- 渲染错误
- 内存不足

### 3. **浏览器兼容性**
- WebGL 2.0 支持
- 触摸设备适配
- 移动端性能

### 4. **复杂度评估**
- **简单版本**（基础渲染 + 基本控制）：2-3 天
- **完整版本**（所有功能）：1-2 周
- **生产级别**（性能优化 + 错误处理）：2-4 周

---

## 🚀 快速开始示例

我可以在你的项目中创建一个基础的自定义查看器示例。你希望我现在就创建吗？

**优势：**
- ✅ 完全控制 UI 设计
- ✅ 可以集成到现有设计系统
- ✅ 减少不必要的 UI 组件
- ✅ 更好的性能（只加载需要的功能）

**劣势：**
- ❌ 需要更多开发时间
- ❌ 需要维护更多代码
- ❌ 需要深入理解 Molstar API

---

## 📚 参考资料

1. **Molstar 官方文档**：https://molstar.org/docs/
2. **API 参考**：https://molstar.org/viewer/docs/api/
3. **示例代码**：https://github.com/molstar/molstar/tree/master/examples
4. **核心模块源码**：
   - `lib/mol-canvas3d/` - 渲染引擎
   - `lib/mol-plugin/` - 插件系统
   - `lib/mol-plugin-state/` - 状态管理

