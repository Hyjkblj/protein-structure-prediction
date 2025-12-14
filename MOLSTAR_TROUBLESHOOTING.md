# Molstar 3D 结构生成故障排除指南

## 🔍 当前问题

如果遇到"无法正确生成3D结构"的问题，请按以下步骤排查：

## 📋 检查清单

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看控制台输出：

- ✅ **Plugin 初始化成功** - 正常
- ❌ **Plugin 初始化失败** - 检查错误信息
- ✅ **数据下载完成** - 正常
- ❌ **数据下载失败** - 检查网络连接
- ✅ **结构加载成功** - 正常
- ❌ **结构加载失败** - 检查错误详情

### 2. 常见错误及解决方案

#### 错误 1: `Cannot read properties of undefined (reading 'ref')`

**原因**: 数据下载失败或返回格式不正确

**解决**:
- 检查网络连接
- 确认 PDB ID 或 URL 是否正确
- 查看浏览器控制台的详细错误

#### 错误 2: `Molstar builders API 不可用`

**原因**: Plugin 未完全初始化

**解决**:
- 刷新页面（强制刷新：Ctrl + Shift + R）
- 检查是否成功导入了 Molstar CSS
- 查看控制台是否有初始化错误

#### 错误 3: 结构显示空白

**原因**: 
- 数据加载成功但渲染失败
- 容器大小问题
- WebGL 不支持

**解决**:
- 检查容器是否有明确的高度（至少 400px）
- 检查浏览器是否支持 WebGL
- 尝试不同的 PDB ID

### 3. 测试步骤

1. **测试基本功能**:
   ```jsx
   <MolstarViewerOfficial pdbId="1crn" />
   ```

2. **检查控制台输出**:
   - 应该看到 "✅ Molstar Plugin 初始化成功"
   - 应该看到 "📥 开始加载结构"
   - 应该看到 "✅ 结构加载成功!"

3. **如果失败**:
   - 复制控制台的完整错误信息
   - 检查网络请求（Network 标签）是否成功
   - 检查 PDB URL 是否可访问

### 4. 手动测试 URL

在浏览器中直接访问 PDB URL 测试：
- https://files.rcsb.org/view/1CRN.pdb
- 应该能看到 PDB 文件内容

### 5. 检查依赖

确认已正确安装：
```bash
npm list molstar
```

应该显示 `molstar@5.4.2` 或类似版本。

### 6. 清除缓存重新安装

如果问题持续：

```bash
# 清除 node_modules 和缓存
rm -rf node_modules
rm -rf node_modules/.vite
rm package-lock.json

# 重新安装
npm install

# 重新启动开发服务器
npm run dev
```

### 7. 使用简化版本测试

如果官方版本有问题，可以尝试使用简化版本：

```jsx
import MolstarViewerSimple from './components/MolstarViewer/MolstarViewerSimple'

<MolstarViewerSimple pdbId="1crn" />
```

## 🐛 调试技巧

### 启用详细日志

代码中已添加详细的 console.log，查看浏览器控制台：
- 📥 开始加载
- ⬇️ 下载数据
- ✅ 成功
- ❌ 错误

### 检查 Plugin 对象

在浏览器控制台中运行：
```javascript
// 如果 Plugin 已经初始化
const plugin = document.querySelector('.molstar-viewer').__molstar_plugin
console.log('Plugin:', plugin)
console.log('Builders:', plugin?.builders)
```

### 检查网络请求

在浏览器开发者工具的 Network 标签中：
- 查看是否有对 `files.rcsb.org` 的请求
- 检查请求状态码（应该是 200）
- 查看响应内容是否是 PDB 格式

## 💡 备用方案

如果 Molstar 仍然无法工作，可以考虑：

1. **使用在线查看器**:
   - https://molstar.org/viewer/
   - 上传 PDB 文件查看

2. **使用简化查看器**:
   - 暂时使用 iframe 嵌入在线查看器
   - 或使用其他库（如 3Dmol.js）

## 📞 获取帮助

如果以上方法都无法解决：

1. **收集信息**:
   - 浏览器控制台的完整错误信息
   - 网络请求的详情
   - 使用的 PDB ID 或 URL

2. **检查官方文档**:
   - https://molstar.org/docs/
   - https://github.com/molstar/molstar/issues

3. **查看示例**:
   - https://molstar.org/viewer/
   - https://github.com/molstar/molstar/tree/master/examples

