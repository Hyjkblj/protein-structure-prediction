import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Alert,
  Platform 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { getWebViewUrl, WEBVIEW_CONFIG, USE_LOCAL_HTML } from '../constants/config';
import { MOBILE_CSS } from '../utils/mobileStyles';

/**
 * 蛋白质 WebView 组件
 * 用于嵌入 Web 应用的 3D 查看器
 */
function ProteinWebView({ 
  style,
  onLoadStart,
  onLoadEnd,
  onError,
  onMessage,
}) {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const webViewUrl = getWebViewUrl();

  // 处理加载开始
  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
    if (onLoadStart) onLoadStart();
  };

  // 处理加载完成
  const handleLoadEnd = () => {
    setLoading(false);
    if (onLoadEnd) onLoadEnd();
    
    // 注入移动端专用CSS
    if (webViewRef.current) {
      injectMobileStyles();
    }
  };
  
  // 注入移动端专用样式
  const injectMobileStyles = () => {
    if (webViewRef.current) {
      // 构建注入脚本
      const injectScript = `
        (function() {
          // 移除旧的样式（如果存在）
          const oldStyle = document.getElementById('mobile-override-styles');
          if (oldStyle) oldStyle.remove();
          
          // 创建新的样式元素
          const style = document.createElement('style');
          style.id = 'mobile-override-styles';
          style.innerHTML = ${JSON.stringify(MOBILE_CSS)};
          document.head.appendChild(style);
          console.log('✅ 移动端样式已注入');
        })();
        true;
      `;
      
      // 延迟注入，确保DOM已加载完成
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(injectScript);
      }, 300);
    }
  };

  // 处理错误
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setLoading(false);
    const errorMessage = nativeEvent.description || '加载失败，请检查网络连接';
    setError(errorMessage);
    
    console.error('WebView 错误:', nativeEvent);
    
    if (onError) {
      onError(nativeEvent);
    } else {
      // 默认错误处理
      if (Platform.OS === 'ios') {
        Alert.alert('加载失败', errorMessage);
      }
    }
  };

  // 处理 HTTP 错误
  const handleHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView HTTP 错误:', nativeEvent);
    
    if (nativeEvent.statusCode >= 400) {
      setError(`HTTP 错误 ${nativeEvent.statusCode}`);
      setLoading(false);
    }
  };

  // 处理来自 WebView 的消息
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('收到 WebView 消息:', data);
      
      if (onMessage) {
        onMessage(data);
      }
    } catch (err) {
      console.error('解析 WebView 消息失败:', err);
    }
  };


  // 如果使用本地 HTML，这里可以加载 HTML 内容
  // 目前使用 URL 方式
  if (!webViewUrl && !USE_LOCAL_HTML) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            请配置 Web 应用 URL 或启用本地 HTML
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        style={styles.webview}
        {...WEBVIEW_CONFIG}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        onMessage={handleMessage}
        // Android 特定配置
        androidLayerType="hardware"
        // iOS 特定配置
        bounces={false}
        scrollEnabled={true}
        // 允许的导航
        allowsBackForwardNavigationGestures={false}
        // 缩放设置
        scalesPageToFit={true}
        // 自动调整内容
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ProteinWebView;
