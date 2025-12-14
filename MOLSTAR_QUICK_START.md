# Molstar 快速开始指南

## ✅ 安装状态

如果 `package.json` 中还没有 `molstar`，请运行：

```bash
npm install molstar
```

## 🚀 3 步快速开始

### 步骤 1：导入组件和样式

```jsx
import MolstarViewerOfficial from './components/MolstarViewer/MolstarViewerOfficial'
import 'molstar/build/viewer/molstar.css' // 重要：必须导入 CSS
```

### 步骤 2：使用组件

```jsx
<MolstarViewerOfficial pdbId="1crn" />
```

### 步骤 3：运行项目

```bash
npm run dev
```

## 📝 完整示例

```jsx
import { useState } from 'react'
import MolstarViewerOfficial from './components/MolstarViewer/MolstarViewerOfficial'

function App() {
  const [pdbId, setPdbId] = useState('1crn')

  return (
    <div>
      <button onClick={() => setPdbId('1hel')}>
        切换到 Hemoglobin
      </button>
      
      <MolstarViewerOfficial 
        pdbId={pdbId}
        options={{
          representation: 'cartoon',
          showExpand: true,
          showControls: true
        }}
      />
    </div>
  )
}
```

## 🎯 使用场景

### 场景 1：查看 PDB 结构

```jsx
<MolstarViewerOfficial pdbId="1crn" />
```

### 场景 2：从 URL 加载结构

```jsx
<MolstarViewerOfficial 
  url="https://files.rcsb.org/view/1CRN.pdb"
  format="pdb"
/>
```

### 场景 3：自定义样式

```jsx
<MolstarViewerOfficial 
  pdbId="1hel"
  options={{
    representation: 'ball-and-stick', // 'cartoon' | 'ball-and-stick' | 'surface'
    showExpand: true,
    showControls: true
  }}
/>
```

## 📚 更多资源

- 完整文档：`MOLSTAR_SETUP.md`
- 集成指南：`MOLSTAR_INTEGRATION.md`
- 示例页面：访问 `/molstar` 路由（如果已配置）

## ⚠️ 重要提示

1. **必须导入 CSS**：`import 'molstar/build/viewer/molstar.css'`
2. **容器需要高度**：确保容器有明确的高度（如 `height: '600px'`）
3. **浏览器兼容性**：需要 WebGL 支持（所有现代浏览器都支持）

## 🐛 常见问题

**Q: 样式不显示？**  
A: 确保导入了 CSS 文件

**Q: 结构加载失败？**  
A: 检查网络连接和 PDB ID 是否正确

**Q: 组件不显示？**  
A: 确保容器有明确的高度

