# React Native 移动端应用

基于 WebView 的移动端实现，嵌入现有的 Web 应用。

## 📋 项目结构

```
mobile/
├── App.js                    # 应用入口
├── package.json             # 依赖配置
├── app.json                 # Expo 配置
├── src/
│   ├── screens/
│   │   └── ProteinViewerScreen.js
│   ├── components/
│   │   └── ProteinWebView.js
│   └── constants/
│       └── config.js
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd mobile
npm install
```

### 2. 启动应用

```bash
# 启动 Expo
npx expo start

# 在另一个终端，启动 Web 应用（如果使用本地开发服务器）
cd ..
npm run dev
```

### 3. 运行

- 扫描二维码在手机上运行（需要 Expo Go 应用）
- 或按 `i` 打开 iOS 模拟器
- 或按 `a` 打开 Android 模拟器

## ⚙️ 配置

在 `src/constants/config.js` 中配置：

- `WEB_APP_URL`: Web 应用的 URL（如果已部署）
- `USE_LOCAL_HTML`: 是否使用本地 HTML
- `API_BASE_URL`: API 基础 URL

## 📱 使用方法

### 方案 1: 使用本地开发服务器

1. 确保手机和电脑在同一 WiFi 网络
2. 获取电脑的 IP 地址
3. 在 `config.js` 中配置 IP 地址

### 方案 2: 使用部署的 Web 应用

在 `config.js` 中配置部署的 URL

### 方案 3: 使用打包的 HTML

将 Web 应用打包后放入 `assets/web/` 目录

## 📝 注意事项

- 确保 Web 应用可以正常访问
- 检查网络权限配置
- iOS 需要配置 ATS（如果使用 HTTP）
