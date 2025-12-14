# 启动开发服务器指南

## 方法1：在终端中运行（推荐）

1. 打开终端（PowerShell 或 CMD）
2. 进入项目目录：
   ```bash
   cd react-standard-project
   ```
3. 启动服务器：
   ```bash
   npm run dev
   ```
4. 等待看到以下输出：
   ```
   VITE v5.4.21  ready in XXX ms
   ➜  Local:   http://localhost:3000/
   ```
5. 在浏览器中访问：`http://localhost:3000/`

## 方法2：如果遇到404错误

### 检查步骤：

1. **确认服务器正在运行**
   - 终端应该显示 "VITE v5.4.21 ready"
   - 不应该有错误信息

2. **清除浏览器缓存**
   - 按 `Ctrl + Shift + Delete` 清除缓存
   - 或使用无痕模式访问

3. **检查端口是否被占用**
   ```bash
   netstat -ano | findstr :3000
   ```
   如果端口被占用，可以修改 `vite.config.js` 中的端口号

4. **尝试其他端口**
   如果3000端口有问题，可以修改 `vite.config.js`：
   ```js
   server: {
     port: 5173,  // Vite 默认端口
     open: true,
   },
   ```

## 常见问题

### 问题：404 Not Found
**解决方案：**
- 确保在 `react-standard-project` 目录下运行命令
- 确保 `public/index.html` 文件存在
- 清除浏览器缓存

### 问题：端口被占用
**解决方案：**
- 修改 `vite.config.js` 中的端口号
- 或关闭占用端口的程序

### 问题：模块找不到
**解决方案：**
- 运行 `npm install` 重新安装依赖
- 检查 `node_modules` 文件夹是否存在

## 验证服务器是否正常运行

访问以下URL应该都能正常显示：
- `http://localhost:3000/` - 首页
- `http://localhost:3000/about` - 关于页面
- `http://localhost:3000/molstar` - Mol* 页面

如果仍然有问题，请检查：
1. 浏览器控制台（F12）是否有错误信息
2. 终端是否有编译错误
3. 网络连接是否正常

