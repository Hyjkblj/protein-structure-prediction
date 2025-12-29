import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 侧边栏组件
 * 适配不同屏幕尺寸
 */
function Sidebar({ onClose, onNavigate }) {
  // 根据屏幕宽度计算侧边栏宽度
  const sidebarWidth = Math.min(SCREEN_WIDTH * 0.75, 320); // 最大320px，或屏幕的75%

  const menuItems = [
    { id: 'home', title: '🏠 首页', action: () => onNavigate('home') },
    { id: 'about', title: 'ℹ️ 关于', action: () => onNavigate('about') },
    { id: 'settings', title: '⚙️ 设置', action: () => onNavigate('settings') },
    { id: 'help', title: '❓ 帮助', action: () => onNavigate('help') },
  ];

  return (
    <View style={[styles.container, { width: sidebarWidth }]}>
      {/* 侧边栏头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>菜单</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 菜单项列表 */}
      <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              item.action();
              onClose();
            }}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>蛋白质3D查看器</Text>
        <Text style={styles.footerVersion}>版本 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#646cff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#999',
  },
});

export default Sidebar;
