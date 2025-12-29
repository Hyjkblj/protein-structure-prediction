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

/**
 * 调用后端进行蛋白质结构预测
 * @param {object} params - 预测参数
 * @param {string} params.sequence - 氨基酸序列（可选）
 * @param {object} params.config - 预测配置（可选）
 * @param {AbortSignal} signal - 可选的 AbortSignal 用于取消请求
 * @returns {Promise<string>} PDB 文件内容（文本格式）
 */
export async function predictStructure(params = {}, signal = null) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
  const url = `${API_BASE_URL}/predict`
  
  const defaultOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  }

  // 添加 abort signal
  if (signal) {
    defaultOptions.signal = signal
  }

  // 如果有 token，添加到 headers
  const token = localStorage.getItem('token')
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`预测失败: ${response.status} - ${errorText}`)
    }

    // 检查响应类型
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      // JSON 格式响应
      const data = await response.json()
      
      // 尝试多种可能的字段名
      if (data.pdbData) {
        return data.pdbData
      } else if (data.pdb) {
        return data.pdb
      } else if (data.data) {
        return data.data
      } else if (typeof data === 'string') {
        return data
      } else {
        throw new Error('响应格式不正确：未找到 PDB 数据')
      }
    } else {
      // 直接返回 PDB 文本
      const pdbText = await response.text()
      return pdbText
    }
  } catch (error) {
    console.error('结构预测 API 调用失败:', error)
    throw error
  }
}

