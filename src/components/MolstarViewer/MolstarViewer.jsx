import { useEffect, useRef, useState } from 'react'
import MolstarControls from './MolstarControls'
import './MolstarViewer.css'

// 检查是否可以使用 iframe 模式（解决 Tracking Prevention 问题）
const USE_IFRAME_MODE = true // 设置为 true 使用 iframe，false 使用 CDN

/**
 * Mol* 分子可视化组件
 * 使用 CDN 方式加载 Mol*
 * 
 * @param {string} pdbId - PDB ID（可选，如 '1crn'）
 * @param {string} url - 分子文件URL（可选）
 * @param {string} format - 文件格式（'pdb' | 'cif' | 'mmcif'）
 * @param {object} options - 其他配置选项
 */
function MolstarViewer({ pdbId, url, format = 'pdb', options = {} }) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [molstarLoaded, setMolstarLoaded] = useState(false)
  const [currentStyle, setCurrentStyle] = useState('cartoon')
  const [debugInfo, setDebugInfo] = useState(null)

  // 应用样式函数
  const applyStyle = (style) => {
    if (!viewerRef.current) return

    try {
      const viewer = viewerRef.current
      
      // 注意：Mol* Viewer API 可能不同，这里使用通用方法
      // 实际实现可能需要根据 Mol* 的具体 API 调整
      setCurrentStyle(style)
      
      // 如果 viewer 有相应的方法，可以调用
      // 例如：viewer.setStyle(style) 或类似的方法
      console.log('应用样式:', style)
    } catch (err) {
      console.error('应用样式失败:', err)
    }
  }

  // 动态加载 Mol* 库
  useEffect(() => {
    // 检查是否已经加载
    if (window.Molstar) {
      setMolstarLoaded(true)
      return
    }

    // 检查脚本是否已经在加载
    if (document.querySelector('script[src*="molstar"]')) {
      // 等待脚本加载完成
      const checkInterval = setInterval(() => {
        if (window.Molstar) {
          setMolstarLoaded(true)
          clearInterval(checkInterval)
        }
      }, 100)

      return () => clearInterval(checkInterval)
    }

    // 加载 Mol* 脚本
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/molstar@3.7.0/build/viewer/molstar.js'
    script.async = true
    script.onload = () => {
      if (window.Molstar) {
        setMolstarLoaded(true)
      } else {
        setError('Mol* 库加载失败，请检查网络连接')
        setIsLoading(false)
      }
    }
    script.onerror = () => {
      setError('无法加载 Mol* 库，请检查网络连接')
      setIsLoading(false)
    }
    document.body.appendChild(script)

    return () => {
      // 清理脚本（可选）
    }
  }, [])

  // 初始化 Mol* Viewer
  useEffect(() => {
    if (!molstarLoaded || !containerRef.current) return

    const Molstar = window.Molstar
    const container = containerRef.current

    // 调试：检查 Mol* 对象
    console.log('Mol* 对象:', Molstar)
    console.log('Mol* 可用方法:', Object.keys(Molstar || {}))
    
    // 保存调试信息
    setDebugInfo({
      molstarExists: !!Molstar,
      molstarKeys: Molstar ? Object.keys(Molstar) : [],
      viewerExists: !!(Molstar && Molstar.Viewer),
      containerExists: !!container,
      containerSize: container ? {
        width: container.offsetWidth,
        height: container.offsetHeight
      } : null
    })

    // 创建 Mol* Viewer 实例
    try {
      // 尝试不同的初始化方式
      let viewer = null
      
      // 方式1：使用 Viewer 构造函数
      if (Molstar && Molstar.Viewer) {
        try {
          viewer = new Molstar.Viewer(container, {
            layoutIsExpanded: false,
            layoutShowControls: true,
            layoutShowRemoteState: false,
            layoutShowSequence: true,
            layoutShowLog: false,
            layoutShowLeftPanel: true,
            ...options,
          })
          console.log('使用 Viewer 构造函数创建成功')
        } catch (e) {
          console.warn('Viewer 构造函数失败:', e)
        }
      }
      
      // 方式2：如果 Viewer 不存在，尝试其他方式
      if (!viewer && Molstar) {
        // 检查是否有其他可用的构造函数
        console.log('尝试查找其他初始化方法...')
        // 可能需要使用 Plugin 或其他 API
      }

      if (!viewer) {
        throw new Error('无法创建 Mol* Viewer 实例，请检查 API')
      }

      viewerRef.current = viewer
      console.log('Viewer 实例:', viewer)

      // 加载分子结构
      const loadStructure = async () => {
        try {
          setIsLoading(true)
          setError(null)

          let loadSuccess = false

          if (pdbId) {
            // 从 PDB ID 加载 - 尝试多种方式
            const pdbIdUpper = pdbId.toUpperCase()
            console.log('尝试加载 PDB ID:', pdbIdUpper)
            
            // 方式1：直接使用 loadPdb 方法
            if (viewer.loadPdb) {
              try {
                await viewer.loadPdb(pdbIdUpper)
                loadSuccess = true
                console.log('使用 loadPdb 方法加载成功')
              } catch (e) {
                console.warn('loadPdb 方法失败:', e)
              }
            }
            
            // 方式2：通过 URL 加载
            if (!loadSuccess) {
              try {
                const pdbUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
                console.log('尝试通过 URL 加载:', pdbUrl)
                
                if (viewer.loadStructureFromUrl) {
                  await viewer.loadStructureFromUrl(pdbUrl, 'pdb')
                  loadSuccess = true
                  console.log('通过 URL 加载成功')
                } else if (viewer.loadUrl) {
                  await viewer.loadUrl(pdbUrl)
                  loadSuccess = true
                  console.log('使用 loadUrl 方法加载成功')
                }
              } catch (e) {
                console.warn('URL 加载失败:', e)
              }
            }
            
            // 方式3：使用 fetch 然后加载数据
            if (!loadSuccess) {
              try {
                const pdbUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
                const response = await fetch(pdbUrl)
                const text = await response.text()
                
                if (viewer.loadData) {
                  await viewer.loadData(text, 'pdb')
                  loadSuccess = true
                  console.log('使用 loadData 方法加载成功')
                } else if (viewer.load) {
                  await viewer.load(text, 'pdb')
                  loadSuccess = true
                  console.log('使用 load 方法加载成功')
                }
              } catch (e) {
                console.warn('fetch 加载失败:', e)
              }
            }
          } else if (url) {
            // 从 URL 加载
            console.log('尝试加载 URL:', url)
            if (viewer.loadStructureFromUrl) {
              await viewer.loadStructureFromUrl(url, format)
              loadSuccess = true
            } else if (viewer.loadUrl) {
              await viewer.loadUrl(url)
              loadSuccess = true
            } else {
              const response = await fetch(url)
              const text = await response.text()
              if (viewer.loadData) {
                await viewer.loadData(text, format)
                loadSuccess = true
              }
            }
          } else {
            // 默认加载示例结构
            const defaultUrl = 'https://files.rcsb.org/view/1CRN.pdb'
            console.log('加载默认结构:', defaultUrl)
            const response = await fetch(defaultUrl)
            const text = await response.text()
            if (viewer.loadData) {
              await viewer.loadData(text, 'pdb')
              loadSuccess = true
            } else if (viewer.load) {
              await viewer.load(text, 'pdb')
              loadSuccess = true
            }
          }

          if (!loadSuccess) {
            throw new Error('所有加载方法都失败了，请检查 Mol* API')
          }

          // 应用默认样式
          applyStyle('cartoon')
          setIsLoading(false)
          console.log('结构加载完成')
        } catch (err) {
          console.error('加载分子结构失败:', err)
          setError(`加载失败: ${err.message || '未知错误'}`)
          setIsLoading(false)
        }
      }

      loadStructure()

      // 清理函数
      return () => {
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy()
          } catch (e) {
            console.error('清理 Mol* viewer 失败:', e)
          }
          viewerRef.current = null
        }
      }
    } catch (err) {
      console.error('创建 Mol* viewer 失败:', err)
      setError(`初始化失败: ${err.message || '未知错误'}`)
      setIsLoading(false)
    }
  }, [molstarLoaded, options])

  // 当 pdbId 或 url 改变时重新加载
  useEffect(() => {
    if (!viewerRef.current || isLoading || !molstarLoaded) return

    const loadStructure = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const viewer = viewerRef.current

        let loadSuccess = false

        if (pdbId) {
          const pdbIdUpper = pdbId.toUpperCase()
          const pdbUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
          
          // 尝试多种加载方式
          if (viewer.loadPdb) {
            try {
              await viewer.loadPdb(pdbIdUpper)
              loadSuccess = true
            } catch (e) {
              console.warn('loadPdb 失败，尝试 URL 方式')
            }
          }
          
          if (!loadSuccess) {
            try {
              const response = await fetch(pdbUrl)
              const text = await response.text()
              if (viewer.loadData) {
                await viewer.loadData(text, 'pdb')
                loadSuccess = true
              } else if (viewer.load) {
                await viewer.load(text, 'pdb')
                loadSuccess = true
              }
            } catch (e) {
              console.error('URL 加载失败:', e)
            }
          }
        } else if (url) {
          try {
            const response = await fetch(url)
            const text = await response.text()
            if (viewer.loadData) {
              await viewer.loadData(text, format)
              loadSuccess = true
            } else if (viewer.load) {
              await viewer.load(text, format)
              loadSuccess = true
            }
          } catch (e) {
            console.error('URL 加载失败:', e)
          }
        }

        if (!loadSuccess) {
          throw new Error('无法加载结构')
        }

        setIsLoading(false)
      } catch (err) {
        console.error('重新加载分子结构失败:', err)
        setError(`加载失败: ${err.message || '未知错误'}`)
        setIsLoading(false)
      }
    }

    loadStructure()
  }, [pdbId, url, format, molstarLoaded, isLoading])

  // 处理样式变更
  const handleStyleChange = (style) => {
    applyStyle(style)
  }

  // 处理导出
  const handleExport = (format) => {
    if (!viewerRef.current) return

    try {
      const viewer = viewerRef.current
      
      switch (format) {
        case 'image':
          // 导出图片
          if (viewer.exportImage) {
            viewer.exportImage().then((blob) => {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${pdbId || 'structure'}.png`
              a.click()
              URL.revokeObjectURL(url)
            })
          } else {
            alert('导出图片功能需要 Mol* API 支持')
          }
          break
        case 'model':
          alert('导出模型功能开发中...')
          break
        case 'animation':
          alert('导出动画功能开发中...')
          break
        default:
          break
      }
    } catch (err) {
      console.error('导出失败:', err)
      alert('导出失败: ' + err.message)
    }
  }

  // 如果使用 iframe 模式（解决 Tracking Prevention 问题）
  if (USE_IFRAME_MODE) {
    const buildIframeUrl = () => {
      if (pdbId) {
        return `https://www.rcsb.org/3d-view/${pdbId.toUpperCase()}?preset=default`
      } else if (url) {
        // 如果是 blob URL（本地生成的 PDB 文件），需要使用其他查看器
        // 对于 blob URL，我们无法直接在 iframe 中使用 RCSB 查看器
        // 所以返回 null，让下面的代码处理
        return null
      }
      return `https://www.rcsb.org/3d-view/1CRN?preset=default`
    }

    const iframeUrl = buildIframeUrl()
    
    // 如果有 PDB ID，使用 iframe
    if (iframeUrl) {
      return (
        <div className="molstar-viewer-wrapper">
          <div className="molstar-viewer-container">
            <iframe
              src={iframeUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              title="Mol* Viewer"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="iframe-notice" style={{
            background: 'rgba(100, 108, 255, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(100, 108, 255, 0.3)',
            maxWidth: '350px'
          }}>
            <h3 style={{ marginTop: 0, color: '#646cff' }}>使用 RCSB PDB 查看器</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              当前查看 PDB 结构：<strong>{pdbId?.toUpperCase()}</strong>
            </p>
          </div>
        </div>
      )
    }
    
    // 如果是本地生成的 PDB 文件（blob URL），使用在线 PDB 查看器
    if (url && url.startsWith('blob:')) {
      return (
        <div className="molstar-viewer-wrapper">
          <div className="molstar-viewer-container">
            <iframe
              src={`https://www.rcsb.org/3d-view/viewer.html?url=${encodeURIComponent(url)}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              title="Mol* Viewer"
              allowFullScreen
              loading="lazy"
            />
          </div>
          <div className="iframe-notice" style={{
            background: 'rgba(76, 175, 80, 0.1)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            maxWidth: '350px'
          }}>
            <h3 style={{ marginTop: 0, color: '#4caf50' }}>演示结构查看器</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              正在显示从序列生成的演示结构（α-螺旋模型）
            </p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
              💡 这是前端 demo 生成的演示结构
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="molstar-viewer-wrapper">
      <div className="molstar-viewer-container">
        {error ? (
          <div className="molstar-error">
            <h3>错误</h3>
            <p>{error}</p>
            <p className="error-hint">
              请确保已连接到互联网，Mol* 库需要从 CDN 加载
            </p>
            <p className="error-hint" style={{ marginTop: '1rem', color: '#646cff' }}>
              💡 提示：如果遇到跟踪防护问题，可以尝试禁用浏览器的跟踪防护功能
            </p>
          </div>
        ) : isLoading ? (
          <div className="molstar-loading">
            <div className="loading-spinner"></div>
            <p>正在加载分子结构...</p>
            {pdbId && <p className="loading-info">PDB ID: {pdbId}</p>}
            {url && <p className="loading-info">URL: {url}</p>}
          </div>
        ) : (
          <div ref={containerRef} className="molstar-viewer" />
        )}
      </div>
      {!error && !isLoading && (
        <>
          <MolstarControls
            viewer={viewerRef.current}
            pdbId={pdbId}
            onStyleChange={handleStyleChange}
            onExport={handleExport}
          />
          {debugInfo && (
            <div className="debug-panel" style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              maxWidth: '300px',
              zIndex: 1000
            }}>
              <strong>调试信息:</strong>
              <div>Mol* 存在: {debugInfo.molstarExists ? '是' : '否'}</div>
              <div>Viewer 存在: {debugInfo.viewerExists ? '是' : '否'}</div>
              <div>容器大小: {debugInfo.containerSize ? `${debugInfo.containerSize.width}x${debugInfo.containerSize.height}` : 'N/A'}</div>
              <div>可用方法: {debugInfo.molstarKeys.join(', ')}</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MolstarViewer
