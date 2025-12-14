import { useEffect, useRef, useState, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { PluginCommands } from 'molstar/lib/mol-plugin/commands'
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin'
import 'molstar/build/viewer/molstar.css'
import './MolstarViewer.css'

/**
 * 自定义 Molstar 查看器 - 混合方案
 * 
 * 使用 PluginUIContext 获取渲染能力，但通过隐藏大部分 UI 来实现自定义界面
 * 这是一个实用的折中方案，既保证了渲染功能，又能自定义 UI
 */
function MolstarViewerCustom({ 
  pdbId, 
  url, 
  pdbData,
  format = 'pdb',
  onStructureLoaded 
}) {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const rootRef = useRef(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStyle, setCurrentStyle] = useState('cartoon')
  const [currentStructure, setCurrentStructure] = useState(null)
  const [isReady, setIsReady] = useState(false)

  // 1. 初始化 PluginUIContext（使用 UI 能力但隐藏 UI）
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth || container.clientWidth
    const containerHeight = container.offsetHeight || container.clientHeight

    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('⚠️ 容器尺寸为 0，等待容器渲染...')
      const timer = setTimeout(() => setIsReady(false), 500)
      return () => clearTimeout(timer)
    }

    // 创建 Plugin 配置 - 隐藏大部分 UI
    const spec = DefaultPluginUISpec()
    spec.layout = {
      initial: {
        isExpanded: false,
        showControls: false,
        showLeftPanel: false,
        showRightPanel: false,
        showBottom: false,
        showSequence: false,
        showLog: false,
      }
    }

    const plugin = new PluginUIContext(spec)
    pluginRef.current = plugin

    plugin.init().then(async () => {
      console.log('开始渲染 Plugin UI...')

      // 检查是否已有 root，避免重复创建
      if (!rootRef.current) {
        const root = createRoot(container)
        rootRef.current = root
      }
      
      // 直接渲染 Plugin 组件到容器（但会通过 CSS 隐藏不需要的部分）
      rootRef.current.render(createElement(Plugin, { plugin }))

      // 等待 Canvas3D 初始化
      try {
        await plugin.canvas3dInitialized
        console.log('✅ Canvas3D 已初始化')

        setIsReady(true)
        setIsLoading(false)
      } catch (err) {
        console.warn('Canvas3D 初始化失败:', err)
        setIsReady(true)
        setIsLoading(false)
      }
    }).catch((err) => {
      console.error('❌ Plugin 初始化失败:', err)
      setError(`初始化失败: ${err.message}`)
      setIsLoading(false)
    })

    return () => {
      // 清理时先卸载 root，再 dispose plugin
      if (rootRef.current) {
        try {
          rootRef.current.unmount()
        } catch (e) {
          console.warn('卸载 root 时出错:', e)
        }
        rootRef.current = null
      }
      if (pluginRef.current) {
        try {
          // 先清除所有结构
          const roots = pluginRef.current.state.data.roots
          if (roots && (Array.isArray(roots) || roots.size > 0)) {
            const rootsArray = Array.isArray(roots) ? roots : Array.from(roots)
            for (const rootRef of rootsArray) {
              try {
                pluginRef.current.build().to(rootRef).delete()
              } catch (e) {
                // 忽略删除错误
              }
            }
          }
          pluginRef.current.dispose()
        } catch (e) {
          console.warn('清理 plugin 时出错:', e)
        }
        pluginRef.current = null
      }
    }
  }, [])

  // 2. 加载结构数据
  useEffect(() => {
    if (!pluginRef.current || !isReady) {
      console.log('⏳ 等待 Plugin 准备就绪...')
      return
    }

    const plugin = pluginRef.current

    // 如果没有提供任何数据源，清除已加载的结构
    if (!pdbData && !pdbId && !url) {
      console.log('⏸️ 未提供结构数据，清除已加载的结构')
      try {
        // 正确获取 roots（可能是 Set 或其他可迭代对象）
        const roots = plugin.state.data.roots
        if (roots && (Array.isArray(roots) || roots.size > 0)) {
          const rootsArray = Array.isArray(roots) ? roots : Array.from(roots)
          for (const rootRef of rootsArray) {
            try {
              plugin.build().to(rootRef).delete()
            } catch (e) {
              // 忽略删除错误
            }
          }
        }
        if (plugin.canvas3d) {
          plugin.canvas3d.clear()
          plugin.canvas3d.requestDraw()
        }
        setCurrentStructure(null)
        console.log('✅ 已清除所有结构')
      } catch (e) {
        console.warn('清除结构时出错:', e)
      }
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const loadStructure = async () => {
      try {
        // 先清除旧结构
        console.log('🗑️ 清除旧结构...')
        try {
          const roots = plugin.state.data.roots
          if (roots && (Array.isArray(roots) || roots.size > 0)) {
            const rootsArray = Array.isArray(roots) ? roots : Array.from(roots)
            for (const rootRef of rootsArray) {
              try {
                plugin.build().to(rootRef).delete()
              } catch (e) {
                // 忽略删除错误
              }
            }
          }
          if (plugin.canvas3d) {
            plugin.canvas3d.clear()
          }
        } catch (e) {
          console.warn('清除旧结构时出错:', e)
        }

        let formatType = format
        let data = null

        // 优先级：pdbData > pdbId > url
        if (pdbData) {
          console.log('📥 开始加载结构: 使用直接数据')
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.ImportString, {
              data: typeof pdbData === 'string' ? pdbData : String(pdbData),
              label: 'PDB Structure'
            })
            .commit()
        } else if (pdbId) {
          const pdbIdUpper = pdbId.toUpperCase()
          const structureUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
          formatType = 'pdb'
          console.log('📥 开始加载结构:', structureUrl)
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.Download, {
              url: structureUrl,
              isBinary: false
            })
            .commit()
        } else if (url) {
          console.log('📥 开始加载结构:', url)
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.Download, {
              url: url,
              isBinary: false
            })
            .commit()
        }

        if (!data || !data.ref) {
          throw new Error('数据加载失败')
        }

        // 创建轨迹
        console.log('📦 创建轨迹...')
        let trajectory
        if (formatType === 'mmcif' || formatType === 'cif') {
          const cifData = await plugin.build()
            .to(data)
            .apply(StateTransforms.Data.ParseCif)
            .commit()
          trajectory = await plugin.build()
            .to(cifData)
            .apply(StateTransforms.Model.TrajectoryFromMmCif)
            .commit()
        } else {
          trajectory = await plugin.build()
            .to(data)
            .apply(StateTransforms.Model.TrajectoryFromPDB)
            .commit()
        }

        if (!trajectory || !trajectory.ref) {
          throw new Error('轨迹创建失败')
        }

        // 创建结构
        console.log('🔬 创建结构...')
        const structure = await plugin.build()
          .to(trajectory)
          .apply(StateTransforms.Model.StructureFromTrajectory)
          .commit()

        if (!structure || !structure.ref) {
          throw new Error('结构创建失败')
        }

        // 添加表示方式
        console.log('🎨 添加表示方式...')
        const representation = await plugin.build()
          .to(structure)
          .apply(StateTransforms.Representation.StructureRepresentation3D, {
            type: {
              name: currentStyle,
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

        if (representation?.ref) {
          // 等待表示创建完成
          await new Promise(resolve => setTimeout(resolve, 300))

          const cell = plugin.state.data.cells.get(representation.ref)
          if (cell && cell.obj?.data?.repr && plugin.canvas3d) {
            try {
              plugin.canvas3d.add(cell.obj.data.repr)
              plugin.canvas3d.requestDraw()
              console.log('✅ 表示已添加到渲染层')
            } catch (addError) {
              console.warn('添加表示失败（可能已存在）:', addError)
            }
          }

          setCurrentStructure(representation)

          // 重置相机
          if (plugin.canvas3d) {
            await PluginCommands.Camera.Reset(plugin, {})
          }

          if (onStructureLoaded) {
            onStructureLoaded(representation)
          }

          console.log('✅ 结构加载完成!')
        }

        setIsLoading(false)
      } catch (err) {
        console.error('❌ 加载结构失败:', err)
        setError(`加载失败: ${err.message || '未知错误'}`)
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      loadStructure()
    }, 200)

    return () => clearTimeout(timer)
  }, [pdbId, url, pdbData, format, isReady, currentStyle])

  // 3. 切换表示类型
  const changeStyle = async (style) => {
    if (!currentStructure || !pluginRef.current) return

    setCurrentStyle(style)
    const plugin = pluginRef.current

    try {
      await plugin.build().to(currentStructure)
        .update(StateTransforms.Representation.StructureRepresentation3D, {
          type: {
            name: style,
            params: {}
          },
          colorTheme: {
            name: 'chain-id',
            params: {}
          }
        })
        .commit()

      // 等待更新完成
      await new Promise(resolve => setTimeout(resolve, 300))
      if (plugin.canvas3d) {
        plugin.canvas3d.requestDraw()
      }
    } catch (err) {
      console.error('切换样式失败:', err)
      setError(`切换样式失败: ${err.message}`)
    }
  }

  // 4. 相机控制
  const resetCamera = () => {
    if (pluginRef.current?.canvas3d) {
      PluginCommands.Camera.Reset(pluginRef.current, {})
    }
  }

  const focusStructure = () => {
    if (currentStructure && pluginRef.current) {
      const plugin = pluginRef.current
      const cell = plugin.state.data.cells.get(currentStructure.ref)
      if (cell?.obj?.data?.structure) {
        PluginCommands.Camera.Focus(plugin, {
          loci: cell.obj.data.structure.loci
        })
      }
    }
  }

  return (
    <div className="molstar-custom-viewer">
      {/* 自定义控制面板 */}
      <div className="custom-controls">
        <div className="control-group">
          <label>表示类型：</label>
          <div className="style-buttons">
            {['cartoon', 'surface', 'ball-and-stick', 'spacefill'].map(style => (
              <button
                key={style}
                className={currentStyle === style ? 'active' : ''}
                onClick={() => changeStyle(style)}
                disabled={isLoading || !isReady}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <button onClick={resetCamera} disabled={isLoading || !isReady}>
            重置相机
          </button>
          <button onClick={focusStructure} disabled={!currentStructure || isLoading || !isReady}>
            聚焦结构
          </button>
        </div>
      </div>

      {/* 渲染容器 */}
      <div
        ref={containerRef}
        className="molstar-custom-canvas-container"
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
          background: '#1a1a1a',
          overflow: 'hidden'
        }}
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>正在加载结构...</p>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="error-overlay">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>关闭</button>
        </div>
      )}
    </div>
  )
}

export default MolstarViewerCustom
