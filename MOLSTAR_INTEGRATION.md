# Molstar 集成指南

根据 [Molstar GitHub](https://github.com/molstar/molstar) 官方文档，本指南介绍如何在 React 项目中使用 Molstar。

## ✅ 已安装

本项目已经安装了 Molstar：

```bash
npm install molstar
```

当前最新版本：`v5.4.2`（2025年12月发布）

## 📁 项目结构

项目包含以下 Molstar 相关文件：

- `src/components/MolstarViewer/MolstarViewer.jsx` - 原始版本（CDN 方式）
- `src/components/MolstarViewer/MolstarViewerV2.jsx` - V2 版本（已更新为 Plugin API）
- `src/components/MolstarViewer/MolstarViewerOfficial.jsx` - **推荐使用**（官方 API）
- `src/pages/MolstarExamplePage/` - 完整的使用示例页面

## 🚀 快速开始

### 方法 1：使用封装好的组件（推荐）⭐

最简单的方式是使用我们已经封装好的 `MolstarViewerOfficial` 组件：

```jsx
import MolstarViewerOfficial from './components/MolstarViewer/MolstarViewerOfficial'

function MyPage() {
  return (
    <MolstarViewerOfficial 
      pdbId="1crn"
      options={{
        representation: 'cartoon',
        showExpand: true,
        showControls: true
      }}
    />
  )
}
```

### 方法 2：直接使用 Plugin API

如果您需要更多控制，可以直接使用 Molstar 的 Plugin API：

```jsx
import { useEffect, useRef } from 'react'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
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
          url: `https://files.rcsb.org/view/${pdbId.toUpperCase()}.pdb`,
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

## 🎨 功能特性

- ✅ 支持 PDB、CIF、mmCIF、GRO、MOL、SDF 等格式
- ✅ 通过 PDB ID 或 URL 加载结构
- ✅ 完整的 3D 交互（旋转、缩放、平移）
- ✅ 多种可视化样式（Cartoon、Surface、Ball & Stick 等）
- ✅ 结构分析工具
- ✅ 导出图片和动画

## 📚 官方资源

- **GitHub**: https://github.com/molstar/molstar
- **在线查看器**: https://molstar.org/viewer/
- **文档**: https://molstar.org/docs/
- **示例**: https://github.com/molstar/molstar/tree/master/examples

## 🔧 注意事项

1. **CSS 样式**：需要导入 Molstar 的 CSS 文件：
   ```jsx
   import 'molstar/build/viewer/molstar.css'
   ```

2. **TypeScript**：Molstar 使用 TypeScript 编写，但也可以用于 JavaScript 项目

3. **性能**：对于大型结构，建议使用 WebWorker 和状态管理优化

4. **浏览器兼容性**：需要 WebGL 支持（现代浏览器都支持）

