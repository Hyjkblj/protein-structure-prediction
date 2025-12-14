/**
 * API 基础配置
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

/**
 * 通用请求函数
 * @param {string} endpoint - API 端点
 * @param {object} options - 请求选项
 * @returns {Promise} 响应数据
 */
export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // 如果有 token，添加到 headers
  const token = localStorage.getItem('token')
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

/**
 * GET 请求
 */
export function get(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export function post(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * PUT 请求
 */
export function put(endpoint, data, options = {}) {
  return request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * DELETE 请求
 */
export function del(endpoint, options = {}) {
  return request(endpoint, { ...options, method: 'DELETE' })
}

