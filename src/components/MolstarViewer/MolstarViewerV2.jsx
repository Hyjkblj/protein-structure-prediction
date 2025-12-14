import { useEffect, useRef, useState } from 'react'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { PluginConfig } from 'molstar/lib/mol-plugin/config'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { PluginCommands } from 'molstar/lib/mol-plugin/commands'
import 'molstar/build/viewer/molstar.css'
import './MolstarViewer.css'

/**
 * Molstar Viewer V2 - 使用官方 Plugin API
 * 
 * 使用说明：
 * 1. 确保已安装: npm install molstar
 * 2. 导入 CSS: import 'molstar/build/viewer/molstar.css'
 * 
 * @param {string} pdbId - PDB ID（可选，如 '1crn'）
 * @param {string} url - 分子文件URL（可选）
 * @param {string} format - 文件格式（'pdb' | 'cif' | 'mmcif'）
 * @param {object} options - 其他配置选项
 */
function MolstarViewerV2({ 
  pdbId, 
  url, 
  format = 'pdb', 
  options = {},
  onPluginReady
}) {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  // 初始化 Plugin
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // 创建 Plugin 配置
    const spec = {
      ...DefaultPluginUISpec(),
      config: [
        [PluginConfig.Viewport.ShowExpand, true],
        [PluginConfig.Viewport.ShowControls, true],
        ...(options.config || [])
      ],
      layout: {
        initial: {
          isExpanded: false,
          showControls: true,
          ...options.layout?.initial
        },
        ...options.layout
      }
    }

    // 创建 Plugin 实例，并将容器传入
    const plugin = new PluginUIContext(spec, container)
    
    pluginRef.current = plugin

    // 初始化 Plugin
    plugin.init().then(() => {
      setIsReady(true)
      setIsLoading(false)
      
      if (onPluginReady) {
        onPluginReady(plugin)
      }
    }).catch((err) => {
      console.error('Plugin 初始化失败:', err)
      setError(`初始化失败: ${err.message}`)
      setIsLoading(false)
    })

    // 清理函数
    return () => {
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
    }
  }, [])

  // 加载结构
  useEffect(() => {
    if (!pluginRef.current || !isReady) return

    const plugin = pluginRef.current
    setIsLoading(true)
    setError(null)

    const loadStructure = async () => {
      try {
        let structureUrl = null

        if (pdbId) {
          // 从 PDB ID 加载
          const pdbIdUpper = pdbId.toUpperCase()
          structureUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
        } else if (url) {
          structureUrl = url
        } else {
          // 默认加载示例结构
          structureUrl = 'https://files.rcsb.org/view/1CRN.pdb'
        }

        // 使用 Plugin 的 state management 加载结构
        // 清除现有结构
        try {
          const dataRefs = plugin.state.data.select(StateTransforms.Data.Download)
          if (dataRefs.length > 0) {
            await PluginCommands.State.RemoveObject(plugin, {
              state: plugin.state.data,
              ref: dataRefs[0].ref
            })
          }
        } catch (e) {
          // 忽略清除错误
        }

        // 加载新结构
        await plugin.build()
          .toRoot()
          .apply(StateTransforms.Data.Download, {
            url: structureUrl,
            isBinary: false
          })
          .apply(StateTransforms.Model.ProviderFromData, {
            format: format === 'pdb' ? 'pdb' : format === 'cif' ? 'mmcif' : format
          })
          .apply(StateTransforms.Model.StructureFromModel)
          .apply(StateTransforms.Representation.StructureRepresentation3D, {
            type: options.representation || 'cartoon'
          })
          .commit()

        setIsLoading(false)
      } catch (err) {
        console.error('加载结构失败:', err)
        setError(`加载失败: ${err.message || '未知错误'}`)
        setIsLoading(false)
      }
    }

    loadStructure()
  }, [pdbId, url, format, isReady])

  return (
    <div className="molstar-viewer-wrapper">
      <div className="molstar-viewer-container">
        {error ? (
          <div className="molstar-error">
            <h3>错误</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="molstar-viewer"
            style={{ width: '100%', height: '100%', minHeight: '600px' }}
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

export default MolstarViewerV2

