import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProteinViewerScreen from './src/screens/ProteinViewerScreen';

const Stack = createNativeStackNavigator();

/**
 * 主应用组件
 */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // 使用自定义头部
          animation: 'fade',
          contentStyle: {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Stack.Screen
          name="ProteinViewer"
          component={ProteinViewerScreen}
          options={{
            title: '蛋白质查看器',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
