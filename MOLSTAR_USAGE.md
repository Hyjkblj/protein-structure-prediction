# Mol* 使用指南

[Mol*](https://github.com/molstar/molstar) 是一个强大的开源工具，用于大分子结构的3D可视化和分析。它由 PDBe 和 RCSB PDB 共同开发。

## 📦 安装

本项目使用 CDN 方式加载 Mol*，无需安装 npm 包。

Mol* 库会通过 CDN 自动加载：
- CSS: `https://unpkg.com/molstar@3.7.0/build/viewer/molstar.css`
- JS: `https://unpkg.com/molstar@3.7.0/build/viewer/molstar.js`

## 🚀 快速开始

### 1. 基本使用

在 React 组件中使用 Mol* 查看器：

```jsx
import MolstarViewer from './components/MolstarViewer'

function MyPage() {
  return (
    <div>
      <h1>分子可视化</h1>
      {/* 通过 PDB ID 加载 */}
      <MolstarViewer pdbId="1crn" />
      
      {/* 或通过 URL 加载 */}
      <MolstarViewer 
        url="https://files.rcsb.org/view/1CRN.pdb" 
        format="pdb" 
      />
    </div>
  )
}
```

### 2. 加载方式

#### 通过 PDB ID 加载

```jsx
<MolstarViewer pdbId="1crn" />
```

#### 通过 URL 加载文件

```jsx
<MolstarViewer 
  url="https://files.rcsb.org/view/1CRN.pdb" 
  format="pdb" 
/>
```

#### 支持的格式

- PDB (`.pdb`)
- CIF (`.cif`)
- mmCIF (`.mmcif`)
- GRO (`.gro`)
- MOL (`.mol`)
- SDF (`.sdf`)
- 等等

### 3. 配置选项

```jsx
const plugin = new Plugin(containerRef.current, {
  layout: {
    initial: {
      isExpanded: false,
      showControls: true,
    },
  },
  viewport: {
    showExpand: true,
    showControls: true,
  },
})
```

## 🎨 样式和可视化

### 动态切换结构

```jsx
const [pdbId, setPdbId] = useState('1crn')

<MolstarViewer pdbId={pdbId} />
<button onClick={() => setPdbId('1hel')}>
  切换到 Hemoglobin
</button>
```

## 🖱️ 交互操作

- **左键拖拽**：旋转分子
- **右键拖拽**：平移视图
- **滚轮**：缩放
- **中键拖拽**：平移视图（某些浏览器）

## 📚 更多资源

- **官方文档**: https://molstar.org/docs/
- **GitHub 仓库**: https://github.com/molstar/molstar
- **示例**: https://molstar.org/viewer/
- **API 文档**: https://molstar.org/docs/api/

## 🔧 常见问题

### 1. Mol* 库未加载

如果看到"Mol* 库未加载"错误：
- 检查网络连接（需要访问 unpkg.com CDN）
- 检查浏览器控制台是否有 CORS 错误
- 尝试刷新页面

### 2. 结构加载失败

如果结构加载失败：
- 检查 PDB ID 是否正确（应该是4位字符，如 '1crn'）
- 检查 URL 是否可访问
- 查看浏览器控制台的错误信息

### 3. 性能优化

对于大型结构：
- 使用 `pdbId` 属性而不是 `url`（RCSB PDB 服务器优化更好）
- 避免同时加载多个大型结构
- 组件卸载时会自动清理资源

## 💡 示例项目

本项目已包含一个完整的 Mol* 集成示例：

- **组件**: `src/components/MolstarViewer/`
- **页面**: `src/pages/MolstarPage/`
- **路由**: `/molstar`

访问该页面可以看到完整的交互式示例。

## 📝 许可证

Mol* 使用 MIT 许可证。

