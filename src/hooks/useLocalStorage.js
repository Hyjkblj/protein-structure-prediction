import { useState, useEffect } from 'react'

/**
 * 自定义 Hook：管理 localStorage
 * @param {string} key - localStorage 的 key
 * @param {any} initialValue - 初始值
 * @returns {[any, Function]} 返回 [值, 设置值的函数]
 */
export function useLocalStorage(key, initialValue) {
  // 从 localStorage 读取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  // 返回一个包装过的 setter 函数，同时更新 state 和 localStorage
  const setValue = (value) => {
    try {
      // 允许 value 是一个函数，这样我们就可以使用与 useState 相同的 API
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

