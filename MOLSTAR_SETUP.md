# Molstar 集成完整指南

基于 [Molstar GitHub](https://github.com/molstar/molstar) 官方文档，本指南详细介绍如何在 React 项目中使用 Molstar。

## 📦 安装

### 方法 1：npm 安装（推荐）

```bash
npm install molstar
```

这会安装最新版本的 Molstar（当前 v5.4.2）。

### 方法 2：CDN 方式

如果您不想安装 npm 包，可以使用 CDN：

```html
<link rel="stylesheet" href="https://unpkg.com/molstar@5.4.2/build/viewer/molstar.css">
<script src="https://unpkg.com/molstar@5.4.2/build/viewer/molstar.js"></script>
```

**但推荐使用 npm 安装**，因为：
- 更好的类型支持
- 更小的打包体积
- 更好的 Tree-shaking 支持

## 🚀 快速开始

### 步骤 1：导入 CSS

在任何使用 Molstar 的文件中导入 CSS：

```jsx
import 'molstar/build/viewer/molstar.css'
```

### 步骤 2：使用组件

```jsx
import { useEffect, useRef } from 'react'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import 'molstar/build/viewer/molstar.css'

function MyViewer({ pdbId }) {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建 Plugin
    const plugin = new PluginUIContext(DefaultPluginUISpec())
    pluginRef.current = plugin

    plugin.init().then(() => {
      // 加载结构
      plugin.build()
        .toRoot()
        .apply(StateTransforms.Data.Download, {
          url: `https://files.rcsb.org/view/${pdbId}.pdb`,
          isBinary: false
        })
        .apply(StateTransforms.Model.ProviderFromData)
        .apply(StateTransforms.Model.StructureFromModel)
        .apply(StateTransforms.Representation.StructureRepresentation3D)
        .commit()
    })

    plugin.render(containerRef.current)

    return () => {
      plugin.dispose()
    }
  }, [pdbId])

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />
}
```

### 步骤 3：使用封装好的组件（推荐）

我们提供了完整的封装组件 `MolstarViewerOfficial.jsx`：

```jsx
import MolstarViewerOfficial from './components/MolstarViewer/MolstarViewerOfficial'

function MyPage() {
  return (
    <MolstarViewerOfficial 
      pdbId="1crn"
      options={{
        showExpand: true,
        showControls: true,
        representation: 'cartoon'
      }}
    />
  )
}
```

## 📚 API 参考

### 组件 Props

| Prop | 类型 | 说明 |
|------|------|------|
| `pdbId` | `string` | PDB ID（如 '1crn'） |
| `url` | `string` | 分子文件 URL |
| `format` | `string` | 文件格式：'pdb' \| 'cif' \| 'mmcif' |
| `options` | `object` | 配置选项 |
| `onPluginReady` | `function` | Plugin 准备就绪时的回调 |

### Options 配置

```jsx
{
  showExpand: true,           // 显示展开按钮
  showControls: true,         // 显示控制面板
  showSettings: true,         // 显示设置按钮
  representation: 'cartoon',  // 默认表示方式：'cartoon' | 'ball-and-stick' | 'surface' 等
  layout: {                   // 布局配置
    initial: {
      isExpanded: false,
      showControls: true
    }
  },
  config: []                  // 额外的 Plugin 配置
}
```

## 🎨 支持的格式

- **PDB** (`.pdb`)
- **CIF** (`.cif`)
- **mmCIF** (`.mmcif`)
- **GRO** (`.gro`) - GROMACS
- **MOL** (`.mol`) - MDL Molfile
- **SDF** (`.sdf`) - Structure-Data File
- **XYZ** (`.xyz`)
- **MOL2** (`.mol2`)
- 等等

## 💡 使用示例

### 示例 1：从 PDB ID 加载

```jsx
<MolstarViewerOfficial pdbId="1crn" />
```

### 示例 2：从 URL 加载

```jsx
<MolstarViewerOfficial 
  url="https://files.rcsb.org/view/1CRN.pdb"
  format="pdb"
/>
```

### 示例 3：自定义配置

```jsx
<MolstarViewerOfficial 
  pdbId="1hel"
  options={{
    representation: 'ball-and-stick',
    showExpand: false,
    showControls: true
  }}
  onPluginReady={(plugin) => {
    console.log('Plugin 已准备就绪:', plugin)
  }}
/>
```

### 示例 4：动态切换结构

```jsx
function ViewerPage() {
  const [pdbId, setPdbId] = useState('1crn')

  return (
    <div>
      <button onClick={() => setPdbId('1hel')}>
        切换到 Hemoglobin
      </button>
      <button onClick={() => setPdbId('1lyz')}>
        切换到 Lysozyme
      </button>
      
      <MolstarViewerOfficial pdbId={pdbId} />
    </div>
  )
}
```

## 🖱️ 交互操作

- **左键拖拽**：旋转分子
- **右键拖拽**：平移视图
- **滚轮**：缩放
- **双击**：重置视图

## 🔧 高级用法

### 程序化控制

```jsx
function ViewerWithControls({ pdbId }) {
  const pluginRef = useRef(null)

  const handlePluginReady = (plugin) => {
    pluginRef.current = plugin
  }

  const changeRepresentation = (type) => {
    if (!pluginRef.current) return
    
    // 更改表示方式
    pluginRef.current.build()
      .to(pluginRef.current.state.data.select().refs[0])
      .update(StateTransforms.Representation.StructureRepresentation3D, {
        type: type
      })
      .commit()
  }

  return (
    <div>
      <button onClick={() => changeRepresentation('cartoon')}>
        Cartoon
      </button>
      <button onClick={() => changeRepresentation('ball-and-stick')}>
        Ball & Stick
      </button>
      
      <MolstarViewerOfficial 
        pdbId={pdbId}
        onPluginReady={handlePluginReady}
      />
    </div>
  )
}
```

### 加载本地文件

```jsx
function LocalFileViewer() {
  const [file, setFile] = useState(null)
  const [blobUrl, setBlobUrl] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setBlobUrl(url)
    }
  }

  return (
    <div>
      <input 
        type="file" 
        accept=".pdb,.cif,.mmcif" 
        onChange={handleFileChange}
      />
      
      {blobUrl && (
        <MolstarViewerOfficial 
          url={blobUrl}
          format="pdb"
        />
      )}
    </div>
  )
}
```

## 📖 官方资源

- **GitHub**: https://github.com/molstar/molstar
- **在线查看器**: https://molstar.org/viewer/
- **文档**: https://molstar.org/docs/
- **API 参考**: https://molstar.org/docs/api/
- **示例**: https://github.com/molstar/molstar/tree/master/examples

## ⚠️ 注意事项

1. **CSS 导入**：必须导入 CSS 文件，否则样式不会生效
2. **容器大小**：确保容器有明确的高度，否则可能无法显示
3. **清理资源**：组件卸载时会自动清理 Plugin，无需手动处理
4. **性能**：对于大型结构（>10,000 残基），可能需要优化
5. **浏览器兼容性**：需要 WebGL 支持（所有现代浏览器都支持）

## 🐛 故障排除

### 问题 1：样式不显示

**解决方案**：确保导入了 CSS 文件：
```jsx
import 'molstar/build/viewer/molstar.css'
```

### 问题 2：结构加载失败

**检查**：
- 网络连接
- PDB ID 或 URL 是否正确
- 浏览器控制台的错误信息

### 问题 3：性能问题

**优化**：
- 使用较小的结构进行测试
- 考虑使用 `isGhost: true` 选项
- 关闭不必要的表示方式

## 📝 许可证

Molstar 使用 **MIT 许可证**，可以自由使用。

