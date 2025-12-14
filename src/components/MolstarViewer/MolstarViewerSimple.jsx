import { useEffect, useRef, useState } from 'react'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import 'molstar/build/viewer/molstar.css'
import './MolstarViewer.css'

/**
 * 简化版的 Molstar Viewer
 * 使用最简单可靠的方法加载结构
 */
function MolstarViewerSimple({ 
  pdbId, 
  url,
  options = {}
}) {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 初始化 Plugin
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // 创建 Plugin 配置
    const spec = DefaultPluginUISpec()
    
    // 创建 Plugin 实例
    const plugin = new PluginUIContext(spec, container)
    pluginRef.current = plugin

    // 初始化
    plugin.init().then(() => {
      setIsLoading(false)
      console.log('Molstar Plugin 初始化成功')
    }).catch((err) => {
      console.error('Plugin 初始化失败:', err)
      setError(`初始化失败: ${err.message}`)
      setIsLoading(false)
    })

    // 清理
    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
    }
  }, [])

  // 加载结构
  useEffect(() => {
    if (!pluginRef.current || isLoading || !containerRef.current) return

    const plugin = pluginRef.current
    setIsLoading(true)
    setError(null)

    const loadStructure = async () => {
      try {
        let structureUrl = null

        if (pdbId) {
          structureUrl = `https://files.rcsb.org/view/${pdbId.toUpperCase()}.pdb`
        } else if (url) {
          structureUrl = url
        } else {
          structureUrl = 'https://files.rcsb.org/view/1CRN.pdb'
        }

        console.log('加载结构:', structureUrl)

        // 使用最简单的 API
        const data = await plugin.builders.data.download({ 
          url: structureUrl, 
          isBinary: false 
        })

        if (!data) {
          throw new Error('数据下载失败')
        }

        console.log('数据下载成功，创建结构...')

        // 使用 applyPreset 自动创建结构
        await plugin.builders.structure.hierarchy.applyPreset(data, 'default')

        console.log('结构加载成功')
        setIsLoading(false)
      } catch (err) {
        console.error('加载结构失败:', err)
        setError(`加载失败: ${err.message || '未知错误'}`)
        setIsLoading(false)
      }
    }

    loadStructure()
  }, [pdbId, url, isLoading])

  return (
    <div className="molstar-viewer-wrapper">
      <div className="molstar-viewer-container">
        {error ? (
          <div className="molstar-error">
            <h3>❌ 错误</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="molstar-viewer"
            style={{ 
              width: '100%', 
              height: '100%', 
              minHeight: '600px',
              position: 'relative'
            }}
          />
        )}
        {isLoading && (
          <div className="molstar-loading">
            <div className="loading-spinner"></div>
            <p>正在加载分子结构...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MolstarViewerSimple

