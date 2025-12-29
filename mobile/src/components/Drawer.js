import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import Sidebar from './Sidebar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 抽屉组件
 * 支持左右滑动，自动适配屏幕大小
 */
function Drawer({ isOpen, onClose, onNavigate, position = 'left' }) {
  const sidebarWidth = Math.min(SCREEN_WIDTH * 0.75, 320);
  const translateX = React.useRef(new Animated.Value(position === 'left' ? -sidebarWidth : sidebarWidth)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      // 打开动画
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 关闭动画
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: position === 'left' ? -sidebarWidth : sidebarWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, sidebarWidth, position]);

  if (!isOpen) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* 遮罩层 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: opacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* 侧边栏 */}
      <Animated.View
        style={[
          styles.sidebarContainer,
          {
            width: sidebarWidth,
            [position]: 0,
            transform: [{ translateX }],
          },
        ]}
      >
        <Sidebar onClose={onClose} onNavigate={onNavigate} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});

export default Drawer;
