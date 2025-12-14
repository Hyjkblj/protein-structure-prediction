import { useEffect, useRef, useState, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { PluginConfig } from 'molstar/lib/mol-plugin/config'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { PluginCommands } from 'molstar/lib/mol-plugin/commands'
import 'molstar/build/viewer/molstar.css'
import './MolstarViewer.css'

/**
 * Molstar Viewer - 使用官方 Plugin API
 * 
 * 基于 https://github.com/molstar/molstar 官方实现
 * 
 * @param {string} pdbId - PDB ID（如 '1crn'）
 * @param {string} url - 分子文件 URL
 * @param {string} format - 文件格式（'pdb' | 'cif' | 'mmcif'）
 * @param {object} options - 配置选项
 * @param {function} onPluginReady - Plugin 准备就绪时的回调
 */
function MolstarViewerOfficial({ 
  pdbId, 
  url, 
  pdbData,  // 直接传递 PDB 数据字符串
  format = 'pdb',
  options = {},
  onPluginReady
}) {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const rootRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  // 初始化 Plugin
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    
    // 检查容器尺寸 - 如果容器尺寸为 0，viewport 可能不会初始化
    const containerWidth = container.offsetWidth || container.clientWidth
    const containerHeight = container.offsetHeight || container.clientHeight
    
    console.log('容器尺寸检查:', {
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight,
      clientWidth: container.clientHeight,
      clientHeight: container.clientHeight,
      computed: {
        width: containerWidth,
        height: containerHeight
      }
    })
    
    // 如果容器尺寸为 0，等待一下
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('⚠️ 容器尺寸为 0，等待容器渲染...')
      const timer = setTimeout(() => {
        // 重新触发初始化（通过改变依赖）
        setIsReady(false)
      }, 500)
      return () => clearTimeout(timer)
    }

    // 创建 Plugin 配置
    const spec = DefaultPluginUISpec()
    
    // 合并用户配置
    spec.config = [
      [PluginConfig.Viewport.ShowExpand, options.showExpand !== false],
      [PluginConfig.Viewport.ShowControls, options.showControls !== false],
      [PluginConfig.Viewport.ShowSettings, options.showSettings !== false],
      [PluginConfig.Viewport.ShowSelectionMode, options.showSelectionMode !== false],
      ...(options.config || [])
    ]

    // 确保 layout 中有 viewport（Canvas3D 需要 viewport 才能创建）
    if (options.layout) {
      spec.layout = {
        ...spec.layout,
        ...options.layout
      }
    } else {
      // 使用默认布局，确保包含 viewport
      spec.layout = {
        initial: {
          isExpanded: false,
          showControls: true,
          ...options.layout?.initial
        }
      }
    }
    
    // 确保 layout 包含 viewport（这是必需的，Canvas3D 在其中创建）
    // DefaultPluginUISpec 应该已经包含了 viewport，但确保 layout 配置正确
    console.log('Plugin Spec 检查:', {
      hasLayout: !!spec.layout,
      hasComponents: !!spec.components,
      components: spec.components ? spec.components.length : 0
    })

    // 确保容器有正确的样式和尺寸
    if (container) {
      // 强制设置容器尺寸（如果还没有）
      const computedStyle = window.getComputedStyle(container)
      const width = container.offsetWidth || parseInt(computedStyle.width) || 800
      const height = container.offsetHeight || parseInt(computedStyle.height) || 600
      
      console.log('容器最终尺寸:', { width, height, computedWidth: computedStyle.width, computedHeight: computedStyle.height })
      
      // 确保容器有明确的尺寸
      if (width === 0 || height === 0) {
        console.warn('⚠️ 容器尺寸仍然为 0，设置默认值')
        container.style.width = '800px'
        container.style.height = '600px'
      }
    }
    
    // 创建 Plugin 实例
    const plugin = new PluginUIContext(spec)
    pluginRef.current = plugin
    
    console.log('Plugin 实例已创建，容器:', {
      element: container,
      tagName: container?.tagName,
      className: container?.className,
      width: container?.offsetWidth,
      height: container?.offsetHeight,
      style: window.getComputedStyle(container).width,
      styleHeight: window.getComputedStyle(container).height
    })

    // 初始化 Plugin
    plugin.init().then(async () => {
      // 关键：需要手动渲染 Plugin React 组件
      console.log('开始渲染 Plugin UI...')
      const root = createRoot(container)
      rootRef.current = root
      
      root.render(createElement(Plugin, { plugin }))
      
      console.log('Plugin UI 已渲染')
      
      // 等待 Canvas3D 初始化
      try {
        await plugin.canvas3dInitialized
        console.log('✅ Canvas3D 已初始化')
      } catch (err) {
        console.warn('Canvas3D 初始化失败:', err)
      }
      
    }).then(() => {
      // 立即检查 DOM 中是否有渲染的元素
      const initialElements = container.querySelectorAll('*')
      console.log('初始化后容器中的元素数量:', initialElements.length)
      if (initialElements.length > 0) {
        console.log('前5个元素:', Array.from(initialElements).slice(0, 5).map(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id
        })))
      }
      // 检查 DOM - viewport 应该被渲染到这里
      const checkDOM = () => {
        const molstarElements = container.querySelectorAll('[class*="msp"], canvas, [id*="molstar"]')
        return molstarElements.length > 0
      }
      
      // 等待 DOM 渲染（最多等待 2 秒）
      return new Promise((resolve) => {
        let attempts = 0
        const maxAttempts = 20
        
        const check = () => {
          attempts++
          
          // 检查 Canvas3D
          if (plugin.canvas3d) {
            resolve(true)
            return
          }
          
          // 检查 DOM 是否有 Molstar 元素
          if (checkDOM()) {
            // DOM 有元素但 Canvas3D 还不存在，再等一下
            if (attempts < maxAttempts) {
              setTimeout(check, 100)
            } else {
              // DOM 有元素但 Canvas3D 仍不存在，继续执行
              resolve(false)
            }
          } else if (attempts < maxAttempts) {
            // DOM 还没有元素，继续等待
            setTimeout(check, 100)
          } else {
            // DOM 一直没有元素，说明 viewport 没有被渲染
            resolve(false)
          }
        }
        
        check()
      })
    }).then((hasCanvas3D) => {
      if (hasCanvas3D) {
        setIsReady(true)
        setIsLoading(false)
      } else {
        // 即使没有 Canvas3D，也标记为 ready，让加载结构的代码尝试创建
        setIsReady(true)
        setIsLoading(false)
      }
      
      if (onPluginReady) {
        onPluginReady(plugin)
      }
    }).catch((err) => {
      console.error('❌ Plugin 初始化失败:', err)
      setError(`初始化失败: ${err.message}`)
      setIsLoading(false)
    })

    // 清理函数
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount()
        rootRef.current = null
      }
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
    }
  }, [])

  // 加载结构
  useEffect(() => {
    if (!pluginRef.current || !isReady) {
      console.log('⏳ 等待 Plugin 准备就绪...', { 
        hasPlugin: !!pluginRef.current, 
        isReady 
      })
      return
    }

    const plugin = pluginRef.current

    // 如果没有提供任何数据源，清除已加载的结构
    if (!pdbData && !pdbId && !url) {
      console.log('⏸️ 未提供结构数据，清除已加载的结构')
      
      // 清除所有已加载的结构
      try {
        // 清除所有数据单元格
        const root = plugin.state.data.roots
        for (const rootRef of root) {
          try {
            plugin.build().to(rootRef).delete()
          } catch (e) {
            // 忽略删除错误
          }
        }
        
        // 清除 Canvas3D 中的表示
        if (plugin.canvas3d) {
          plugin.canvas3d.clear()
          plugin.canvas3d.requestDraw()
        }
        
        console.log('✅ 已清除所有结构')
      } catch (e) {
        console.warn('清除结构时出错:', e)
      }
      
      setIsLoading(false)
      return
    }

    const container = containerRef.current
    setIsLoading(true)
    setError(null)

    const loadStructure = async () => {
      try {
        let formatType = format
        let data = null
        
        // 优先级：pdbData > pdbId > url
        if (pdbData) {
          // 直接使用字符串数据（避免 Blob URL 失效问题）
          console.log('📥 开始加载结构: 使用直接数据')
          console.log('📋 格式:', formatType)
          console.log('📄 数据长度:', typeof pdbData === 'string' ? pdbData.length : 'N/A')
          
          console.log('📦 导入数据...')
          
          // 步骤 1: 导入字符串数据
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.ImportString, {
              data: typeof pdbData === 'string' ? pdbData : String(pdbData),
              label: 'PDB Structure'
            })
            .commit()
          
          console.log('✅ 数据导入完成:', data)
        } else if (pdbId) {
          // 从 PDB ID 加载
          const pdbIdUpper = pdbId.toUpperCase()
          const structureUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
          formatType = 'pdb'
          
          console.log('📥 开始加载结构:', structureUrl)
          console.log('📋 格式:', formatType)
          
          console.log('⬇️ 下载数据...')
          
          // 步骤 1: 下载数据（文本格式）
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.Download, {
              url: structureUrl,
              isBinary: false
            })
            .commit()
          
          console.log('✅ 数据下载完成:', data)
        } else if (url) {
          // 从 URL 加载
          console.log('📥 开始加载结构:', url)
          console.log('📋 格式:', formatType)
          
          console.log('⬇️ 下载数据...')
          
          // 步骤 1: 下载数据（文本格式）
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.Download, {
              url: url,
              isBinary: false
            })
            .commit()
          
          console.log('✅ 数据下载完成:', data)
        }

        if (!data || !data.ref) {
          throw new Error('数据加载失败')
        }

        // 步骤 2: 根据格式创建轨迹
        console.log('📦 创建轨迹...')
        
        let trajectory
        if (formatType === 'mmcif' || formatType === 'cif') {
          // 对于 mmCIF，需要先解析 CIF
          const cifData = await plugin.build()
            .to(data)
            .apply(StateTransforms.Data.ParseCif)
            .commit()
          
          trajectory = await plugin.build()
            .to(cifData)
            .apply(StateTransforms.Model.TrajectoryFromMmCif)
            .commit()
        } else {
          // 对于 PDB，直接从字符串创建轨迹
          trajectory = await plugin.build()
            .to(data)
            .apply(StateTransforms.Model.TrajectoryFromPDB)
            .commit()
        }

        if (!trajectory || !trajectory.ref) {
          throw new Error('轨迹创建失败')
        }

        console.log('✅ 轨迹创建完成:', trajectory)

        // 步骤 3: 从轨迹创建结构
        console.log('🔬 创建结构...')
        const structure = await plugin.build()
          .to(trajectory)
          .apply(StateTransforms.Model.StructureFromTrajectory)
          .commit()

        if (!structure || !structure.ref) {
          throw new Error('结构创建失败')
        }

        console.log('✅ 结构创建完成:', structure)

        // 步骤 4: 添加表示方式
        console.log('🎨 添加表示方式...')
        
        const representationType = options.representation || 'cartoon'
        
        // 使用 StateTransforms 创建表示（正确的参数格式）
        const representation = await plugin.build()
          .to(structure)
          .apply(StateTransforms.Representation.StructureRepresentation3D, {
            type: { 
              name: representationType, 
              params: {} 
            },
            colorTheme: {
              name: 'chain-id',
              params: {}
            },
            sizeTheme: {
              name: 'uniform',
              params: {}
            }
          })
          .commit()
        
        console.log('✅ 表示方式创建完成:', representation?.ref)
        
        // 步骤 5: 确保表示被添加到渲染层
        console.log('🖼️ 检查渲染状态...')
        
        // 尝试通过创建表示来触发 Canvas3D 的创建
        // 有时表示创建会自动初始化 Canvas3D
        if (!plugin.canvas3d) {
          console.log('⚠️ Canvas3D 不存在，尝试通过表示创建触发...')
          
          // 等待一下，看看表示创建是否会触发 Canvas3D
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // 再次检查
          if (!plugin.canvas3d) {
            // 尝试通过 layout 获取或创建 viewport
            if (plugin.layout) {
              console.log('尝试通过 layout 访问 viewport...')
              try {
                // 检查是否可以触发 viewport 的创建
                if (plugin.layout.getAll()) {
                  const regions = plugin.layout.getAll()
                  console.log('Layout regions:', regions)
                  
                  // 查找 viewport region
                  for (const region of regions) {
                    if (region && region.viewport) {
                      console.log('找到 viewport region:', region)
                      if (region.viewport.canvas3d) {
                        console.log('✅ 在 viewport region 中找到 Canvas3D!')
                        // 尝试设置 plugin.canvas3d
                        if (!plugin.canvas3d && region.viewport.canvas3d) {
                          console.log('注意：Canvas3D 在 viewport 中，但 plugin.canvas3d 未设置')
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                console.warn('检查 layout regions 时出错:', e)
              }
            }
            
            // 不再等待，直接继续 - 表示创建可能会触发 Canvas3D 的创建
            // 检查 DOM 中是否有 Molstar 相关的元素
            const molstarElements = container.querySelectorAll('[class*="msp"], canvas')
            if (molstarElements.length === 0) {
              // DOM 中没有元素，说明 PluginUIContext 根本没有渲染 UI
              // 这可能是因为容器尺寸问题或初始化时机问题
              console.warn('⚠️ DOM 中没有 Molstar 元素，但继续尝试加载结构')
              
              // 等待一下，看看是否会渲染
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        }
        
        // 步骤 5.5: 继续处理表示，即使 Canvas3D 暂时不存在
        // 表示会在 Canvas3D 创建后自动渲染
        
        if (representation?.ref) {
          // 等待表示创建完成
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // 检查表示是否在状态中
          const cell = plugin.state.data.cells.get(representation.ref)
          console.log('表示单元格:', cell ? '存在' : '不存在')
          
          if (cell && cell.obj) {
            console.log('表示对象类型:', cell.obj.type)
            console.log('表示标签:', cell.obj.label)
            
            // 检查表示数据
            if (cell.obj.data) {
              console.log('表示数据存在')
              console.log('表示 repr:', cell.obj.data.repr ? '存在' : '不存在')
              
              // 表示数据已创建，会在 Canvas3D 可用时自动添加到渲染层
              // 如果 Canvas3D 存在，立即添加；否则等待 Canvas3D 创建
              if (plugin.canvas3d && cell.obj.data.repr) {
                try {
                  plugin.canvas3d.add(cell.obj.data.repr)
                  console.log('✅ 表示已添加到渲染层')
                  plugin.canvas3d.requestDraw()
                } catch (addError) {
                  console.warn('添加表示失败（可能已存在）:', addError)
                }
              } else if (cell.obj.data.repr) {
                // Canvas3D 不存在，但表示已创建
                // 设置一个监听器，当 Canvas3D 创建时自动添加
                console.log('表示已创建，等待 Canvas3D 可用...')
                
                // 轮询检查 Canvas3D（最多 5 秒）
                let pollCount = 0
                const pollInterval = setInterval(() => {
                  pollCount++
                  if (plugin.canvas3d && cell.obj.data.repr) {
                    try {
                      plugin.canvas3d.add(cell.obj.data.repr)
                      plugin.canvas3d.requestDraw()
                      plugin.canvas3d.requestCameraReset()
                      console.log('✅ Canvas3D 已创建，表示已添加')
                    } catch (e) {
                      console.warn('添加表示失败:', e)
                    }
                    clearInterval(pollInterval)
                  } else if (pollCount >= 25) {
                    console.warn('⚠️ 等待 Canvas3D 超时')
                    clearInterval(pollInterval)
                  }
                }, 200)
              }
            } else {
              console.warn('⚠️ 表示数据不存在')
            }
          } else {
            console.warn('⚠️ 表示单元格不存在')
          }
          
        }
        
        // 步骤 6: 重置相机并聚焦到结构（如果 Canvas3D 可用）
        if (plugin.canvas3d) {
          await new Promise(resolve => setTimeout(resolve, 300))
          try {
            await PluginCommands.Camera.Reset(plugin, {})
          } catch (camError) {
            plugin.canvas3d.requestCameraReset()
            plugin.canvas3d.requestDraw()
          }
        }

        console.log('✅ 结构加载完成!')
        setIsLoading(false)
      } catch (err) {
        console.error('❌ 加载结构失败:', err)
        console.error('错误详情:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
        setError(`加载失败: ${err.message || '未知错误'}`)
        setIsLoading(false)
      }
    }

    // 延迟一点时间确保 Plugin 完全准备好
    const timer = setTimeout(() => {
      loadStructure()
    }, 200)

    return () => clearTimeout(timer)
  }, [pdbId, url, pdbData, format, isReady, options.representation])

  return (
    <div className="molstar-viewer-wrapper">
      <div className="molstar-viewer-container">
        {error ? (
          <div className="molstar-error">
            <h3>❌ 错误</h3>
            <p>{error}</p>
            <div className="error-hint">
              <p>请检查：</p>
              <ul>
                <li>网络连接是否正常</li>
                <li>PDB ID 或 URL 是否正确</li>
                <li>浏览器控制台的错误信息</li>
              </ul>
            </div>
          </div>
        ) : (
          <div 
            ref={containerRef} 
            className="molstar-viewer"
            style={{ 
              width: '100%', 
              height: '100%', 
              minHeight: '600px',
              position: 'relative',
              display: 'block',
              overflow: 'hidden'
            }}
          />
        )}
        {isLoading && (
          <div className="molstar-loading">
            <div className="loading-spinner"></div>
            <p>正在加载分子结构...</p>
            {pdbId && <p className="loading-info">PDB ID: {pdbId.toUpperCase()}</p>}
            {url && <p className="loading-info">URL: {url}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

export default MolstarViewerOfficial


