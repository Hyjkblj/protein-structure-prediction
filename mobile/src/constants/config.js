/**
 * 应用配置
 */

// Web 应用 URL（如果已部署）
export const WEB_APP_URL = 'https://your-web-app.com';

// 本地开发服务器 URL（开发时使用）
// 注意：需要使用你的 IP 地址，而不是 localhost
// Windows: 运行 ipconfig 查找 IPv4 地址
// Mac/Linux: 运行 ifconfig 查找 inet 地址
export const LOCAL_DEV_URL = 'http://10.60.243.245:3000'; // 替换为你的 IP 地址和端口（注意：Vite 配置的端口是 3000）

// 是否使用本地 HTML（打包后的静态文件）
export const USE_LOCAL_HTML = false;

// API 基础 URL
export const API_BASE_URL = 'http://localhost:3001/api';

// WebView 配置
export const WEBVIEW_CONFIG = {
  javaScriptEnabled: true,
  domStorageEnabled: true,
  allowsInlineMediaPlayback: true,
  mediaPlaybackRequiresUserAction: false,
  startInLoadingState: true,
  // Android 硬件加速
  androidHardwareAccelerationDisabled: false,
  // 缓存策略
  cacheEnabled: true,
  cacheMode: 'LOAD_DEFAULT',
  // 用户代理
  userAgent: 'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36',
};

// 环境：development | production
export const ENV = __DEV__ ? 'development' : 'production';

// 根据环境选择 URL
export function getWebViewUrl() {
  if (USE_LOCAL_HTML) {
    // 使用本地 HTML（需要打包）
    return null; // 返回 null 表示使用 html source
  }
  
  if (ENV === 'development') {
    return LOCAL_DEV_URL;
  }
  
  return WEB_APP_URL;
}
