# 3Dmol.js 测试指南

如果 3D 模型没有显示，请按以下步骤排查：

## 1. 检查浏览器控制台

打开浏览器控制台（F12），查看：
- 是否有 JavaScript 错误
- `3Dmol.js 已加载` 的日志
- `查看器创建成功` 的日志
- `结构加载完成` 的日志

## 2. 检查 3Dmol.js 是否加载

在控制台运行：
```javascript
console.log(window.$3Dmol)
console.log(typeof window.$3Dmol)
```

如果显示 `undefined`，说明库未加载。

## 3. 手动测试

在控制台运行：
```javascript
// 检查容器
const container = document.querySelector('.protein-3d-viewer')
console.log('容器:', container)
console.log('容器尺寸:', container?.offsetWidth, container?.offsetHeight)

// 检查 3Dmol
if (window.$3Dmol) {
  const viewer = window.$3Dmol.createViewer(container, {
    backgroundColor: 0x1a1a1a
  })
  const pdb = `ATOM      1  N   ALA A   1      20.154  16.967  25.468  1.00 30.00           N
ATOM      2  CA  ALA A   1      19.032  16.967  24.468  1.00 30.00           C
ATOM      3  C   ALA A   1      17.632  16.967  25.468  1.00 30.00           C
END`
  viewer.addModel(pdb, 'pdb')
  viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
  viewer.zoomTo()
  viewer.render()
  console.log('测试结构已加载')
}
```

## 4. 常见问题

### 问题：库未加载
**解决**：检查网络连接，确保可以访问 CDN

### 问题：容器尺寸为 0
**解决**：确保容器有明确的宽高

### 问题：PDB 格式错误
**解决**：检查生成的 PDB 内容格式是否正确

