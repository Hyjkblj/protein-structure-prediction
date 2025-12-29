# 移动端项目设置说明

## 📁 项目结构

我已经在 `react-standard-project/mobile/` 目录下创建了完整的 React Native 移动端项目。

## 🚀 快速开始（3步）

### 第 1 步：进入移动端目录并安装依赖

```bash
cd react-standard-project/mobile
npm install
```

### 第 2 步：配置 Web 应用 URL

编辑 `mobile/src/constants/config.js`:

```javascript
// 开发环境：使用本地开发服务器
// 注意：需要将 YOUR_IP 替换为你的实际 IP 地址
export const LOCAL_DEV_URL = 'http://192.168.1.100:5173'; // 替换为你的 IP

// 生产环境：如果 Web 应用已部署
export const WEB_APP_URL = 'https://your-deployed-app.com';
```

**如何获取 IP 地址**:
- Windows: 运行 `ipconfig`，查找 "IPv4 地址"
- Mac/Linux: 运行 `ifconfig`，查找 "inet" 地址

### 第 3 步：启动应用

```bash
# 终端 1: 启动移动端应用
cd react-standard-project/mobile
npx expo start

# 终端 2: 启动 Web 应用（如果使用本地开发服务器）
cd react-standard-project
npm run dev
```

然后：
- 📱 扫描二维码在手机上运行（需要安装 Expo Go）
- 🍎 按 `i` 打开 iOS 模拟器（Mac）
- 🤖 按 `a` 打开 Android 模拟器

## 📱 项目文件说明

```
mobile/
├── App.js                          # 应用入口
├── package.json                    # 依赖配置
├── app.json                        # Expo 配置
├── SETUP.md                        # 详细设置说明
├── README.md                       # 项目说明
└── src/
    ├── screens/
    │   └── ProteinViewerScreen.js  # 主屏幕组件
    ├── components/
    │   └── ProteinWebView.js       # WebView 封装组件
    └── constants/
        └── config.js               # 配置文件
```

## ⚙️ 配置选项

### 方案 1: 使用本地开发服务器（开发时）

1. 确保手机和电脑在同一 WiFi
2. 在 `config.js` 中配置电脑的 IP 地址
3. 启动 Web 应用: `npm run dev`

### 方案 2: 使用部署的 Web 应用（生产环境）

1. 部署 Web 应用到服务器
2. 在 `config.js` 中配置 `WEB_APP_URL`

### 方案 3: 使用打包的 HTML（离线使用）

1. 构建 Web 应用: `npm run build`
2. 将 `dist/` 目录内容复制到 `mobile/assets/web/`
3. 修改代码使用本地 HTML

## 🔧 重要提示

1. **网络配置**:
   - 使用本地开发服务器时，必须使用 IP 地址而不是 `localhost`
   - 确保防火墙允许访问配置的端口

2. **iOS 配置**:
   - `app.json` 中已配置允许 HTTP（开发时）
   - 生产环境建议使用 HTTPS

3. **Android 配置**:
   - 网络权限已自动配置
   - 确保设备可以访问配置的 URL

## 🐛 常见问题

### WebView 显示空白

- 检查 `config.js` 中的 URL 是否正确
- 检查 Web 应用是否正在运行
- 查看控制台错误信息

### 无法连接到本地服务器

- 确保使用 IP 地址而不是 `localhost`
- 确保手机和电脑在同一 WiFi
- 尝试在手机浏览器中直接访问 URL

### iOS 无法加载 HTTP

- `app.json` 中已配置 `NSAllowsArbitraryLoads: true`
- 如果仍有问题，检查网络设置

## 📚 更多信息

- 详细设置说明: `mobile/SETUP.md`
- 项目说明: `mobile/README.md`
- WebView 实现指南: `WEBVIEW_IMPLEMENTATION_GUIDE.md`

## ✅ 下一步

1. ✅ 安装依赖
2. ✅ 配置 URL
3. ✅ 启动应用
4. ✅ 测试功能

如果遇到问题，请查看 `mobile/SETUP.md` 中的详细说明。
