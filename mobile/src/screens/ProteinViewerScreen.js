import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import ProteinWebView from '../components/ProteinWebView';
import Drawer from '../components/Drawer';

/**
 * 蛋白质查看器主屏幕
 */
function ProteinViewerScreen() {
  const [webViewKey, setWebViewKey] = useState(0); // 用于强制重新加载 WebView
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // WebView 消息处理
  const handleWebViewMessage = (data) => {
    console.log('收到 WebView 消息:', data);
    
    switch (data.type) {
      case 'LOADED':
        console.log('Web 应用加载完成');
        setIsLoading(false);
        setHasError(false);
        break;
      case 'ERROR':
        setHasError(true);
        setIsLoading(false);
        break;
      default:
        console.log('未知消息类型:', data.type);
    }
  };

  // WebView 加载开始
  const handleLoadStart = () => {
    console.log('开始加载 Web 应用');
    setIsLoading(true);
    setHasError(false);
  };

  // WebView 加载完成
  const handleLoadEnd = () => {
    console.log('Web 应用加载完成');
    setIsLoading(false);
  };

  // WebView 错误处理
  const handleError = (error) => {
    console.error('WebView 错误:', error);
    setIsLoading(false);
    setHasError(true);
    
    if (error.nativeEvent?.description) {
      const errorMsg = error.nativeEvent.description;
      // 不显示 Alert，只在界面上显示错误提示
      console.error('加载失败:', errorMsg);
    }
  };

  // 重新加载 WebView
  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    setWebViewKey(prev => prev + 1);
  };

  // 打开/关闭侧边栏
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // 处理侧边栏导航
  const handleNavigate = (route) => {
    console.log('导航到:', route);
    // 这里可以添加导航逻辑
    // 目前只是关闭侧边栏
    setIsDrawerOpen(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#646cff" translucent={false} />
      
      {/* 精简的顶部控制栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDrawer}
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          蛋白质3D结构查看器
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleReload}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>刷新</Text>
        </TouchableOpacity>
      </View>

      {/* WebView 容器 - 占据剩余所有空间 */}
      <View style={styles.webviewContainer}>
        <ProteinWebView
          key={webViewKey}
          style={styles.webview}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={handleWebViewMessage}
        />
        
        {/* 加载指示器 */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#646cff" />
            <Text style={styles.loadingText}>正在加载...</Text>
          </View>
        )}

        {/* 错误提示 */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>加载失败</Text>
            <Text style={styles.errorMessage}>
              无法连接到 Web 应用
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleReload}
            >
              <Text style={styles.retryButtonText}>重试</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 侧边栏抽屉 */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        position="left"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#646cff',
    borderBottomWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginHorizontal: 8,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginLeft: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#646cff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProteinViewerScreen;
