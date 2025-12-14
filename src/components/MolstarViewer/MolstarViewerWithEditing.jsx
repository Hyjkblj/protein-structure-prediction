import { useEffect, useRef, useState, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context'
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { PluginCommands } from 'molstar/lib/mol-plugin/commands'
import { Plugin } from 'molstar/lib/mol-plugin-ui/plugin'
import { extractSequenceFromPdb, replaceSequenceFragment, isValidAminoAcidSequence } from '../../utils/sequenceUtils'
import { generateStructureFromSequence } from '../../utils/structurePrediction'
import { 
  extractResidueAtoms, 
  calculateAtomDistances, 
  getAtomPairDistance,
  calculateCentroid,
  formatCoordinate,
  formatDistance
} from '../../utils/atomUtils'
import 'molstar/build/viewer/molstar.css'
import './MolstarViewer.css'
import './MolstarViewerWithEditing.css'

/**
 * 增强版 Molstar 查看器 - 支持片段选择和替换
 */
function MolstarViewerWithEditing({ 
  pdbId, 
  url, 
  pdbData,
  format = 'pdb',
  onStructureLoaded,
  onSequenceExtracted,
  onPdbDataUpdate  // 新增：用于通知父组件更新 pdbData
}) {
  const containerRef = useRef(null)
  const pluginRef = useRef(null)
  const rootRef = useRef(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentStyle, setCurrentStyle] = useState('cartoon')
  const [currentStructure, setCurrentStructure] = useState(null)
  const [isReady, setIsReady] = useState(false)
  
  // 序列相关状态
  const [originalSequence, setOriginalSequence] = useState('')
  const [currentSequence, setCurrentSequence] = useState('')
  const [residues, setResidues] = useState([]) // 存储残基详细信息
  const [selectedRange, setSelectedRange] = useState({ start: -1, end: -1 })
  const [replacementSequence, setReplacementSequence] = useState('')
  const [showEditPanel, setShowEditPanel] = useState(false)
  const [originalPdbData, setOriginalPdbData] = useState(null)
  
  // 原子坐标相关状态
  const [selectedResidueIndex, setSelectedResidueIndex] = useState(-1) // 选定的单个残基索引
  const [residueAtoms, setResidueAtoms] = useState([]) // 选定残基的原子信息
  const [atomDistances, setAtomDistances] = useState([]) // 原子间距离
  const [showAtomInfo, setShowAtomInfo] = useState(false) // 是否显示原子信息面板

  // 1. 初始化 PluginUIContext
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

      if (!rootRef.current) {
        const root = createRoot(container)
        rootRef.current = root
      }
      
      rootRef.current.render(createElement(Plugin, { plugin }))

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
          const roots = pluginRef.current.state.data.roots
          if (roots && (Array.isArray(roots) || roots.size > 0)) {
            const rootsArray = Array.isArray(roots) ? roots : Array.from(roots)
            for (const rootRef of rootsArray) {
              try {
                pluginRef.current.build().to(rootRef).delete()
              } catch (e) {}
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

  // 2. 加载结构并提取序列
  useEffect(() => {
    if (!pluginRef.current || !isReady) {
      console.log('⏳ 等待 Plugin 准备就绪...')
      return
    }

    const plugin = pluginRef.current

    if (!pdbData && !pdbId && !url) {
      console.log('⏸️ 未提供结构数据，清除已加载的结构')
      try {
        const roots = plugin.state.data.roots
        if (roots && (Array.isArray(roots) || roots.size > 0)) {
          const rootsArray = Array.isArray(roots) ? roots : Array.from(roots)
          for (const rootRef of rootsArray) {
            try {
              plugin.build().to(rootRef).delete()
            } catch (e) {}
          }
        }
        if (plugin.canvas3d) {
          plugin.canvas3d.clear()
          plugin.canvas3d.requestDraw()
        }
        setCurrentStructure(null)
        setOriginalSequence('')
        setCurrentSequence('')
        setResidues([])
        setOriginalPdbData(null)
        setSelectedResidueIndex(-1)
        setResidueAtoms([])
        setAtomDistances([])
        setShowAtomInfo(false)
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
        // 清除旧结构
        console.log('🗑️ 清除旧结构...')
        try {
          const roots = plugin.state.data.roots
          if (roots && (Array.isArray(roots) || roots.size > 0)) {
            const rootsArray = Array.isArray(roots) ? roots : Array.from(roots)
            for (const rootRef of rootsArray) {
              try {
                plugin.build().to(rootRef).delete()
              } catch (e) {}
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
        let loadedPdbData = null

        // 加载数据
        if (pdbData) {
          console.log('📥 开始加载结构: 使用直接数据')
          loadedPdbData = typeof pdbData === 'string' ? pdbData : String(pdbData)
          setOriginalPdbData(loadedPdbData)
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.ImportString, {
              data: loadedPdbData,
              label: 'PDB Structure'
            })
            .commit()
        } else if (pdbId) {
          const pdbIdUpper = pdbId.toUpperCase()
          const structureUrl = `https://files.rcsb.org/view/${pdbIdUpper}.pdb`
          formatType = 'pdb'
          console.log('📥 开始加载结构:', structureUrl)
          
          // 下载 PDB 数据
          const response = await fetch(structureUrl)
          if (response.ok) {
            loadedPdbData = await response.text()
            setOriginalPdbData(loadedPdbData)
          }
          
          data = await plugin.build()
            .toRoot()
            .apply(StateTransforms.Data.Download, {
              url: structureUrl,
              isBinary: false
            })
            .commit()
        } else if (url) {
          console.log('📥 开始加载结构:', url)
          
          const response = await fetch(url)
          if (response.ok) {
            loadedPdbData = await response.text()
            setOriginalPdbData(loadedPdbData)
          }
          
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

        // 提取序列
        if (loadedPdbData) {
          const seqInfo = extractSequenceFromPdb(loadedPdbData)
          console.log('📝 提取序列:', seqInfo.sequence)
          setOriginalSequence(seqInfo.sequence)
          setCurrentSequence(seqInfo.sequence)
          setResidues(seqInfo.residues) // 保存残基信息
          
          if (onSequenceExtracted) {
            onSequenceExtracted(seqInfo.sequence, seqInfo.residues)
          }
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

  // 3. 选择片段（通过序列范围）
  const selectFragment = (start, end) => {
    if (start < 0 || end > currentSequence.length || start >= end) {
      setError('无效的片段范围')
      return
    }
    setSelectedRange({ start, end })
    setReplacementSequence('')
    setShowEditPanel(true)
  }

  // 3.5. 选择单个残基并提取原子信息
  const selectResidueForAtomInfo = (residueIndex) => {
    if (residueIndex < 0 || residueIndex >= residues.length || !originalPdbData) {
      setError('无法提取残基信息：数据不完整')
      return
    }

    try {
      const atoms = extractResidueAtoms(originalPdbData, residueIndex, residues)
      
      if (atoms.length === 0) {
        setError(`残基 ${residueIndex + 1} 没有找到原子信息`)
        return
      }

      // 计算所有原子对之间的距离
      const distances = calculateAtomDistances(atoms)
      
      setSelectedResidueIndex(residueIndex)
      setResidueAtoms(atoms)
      setAtomDistances(distances)
      setShowAtomInfo(true)
      
      console.log(`✅ 已提取残基 ${residueIndex + 1} (${residues[residueIndex].residueName}) 的原子信息:`, {
        atomCount: atoms.length,
        atoms: atoms,
        distances: distances
      })
    } catch (err) {
      console.error('提取原子信息失败:', err)
      setError(`提取原子信息失败: ${err.message}`)
    }
  }

  // 4. 替换片段并重新生成结构
  const handleReplaceFragment = async () => {
    if (selectedRange.start < 0 || selectedRange.end <= selectedRange.start) {
      setError('请先选择要替换的片段')
      return
    }

    if (!isValidAminoAcidSequence(replacementSequence)) {
      setError('替换序列格式无效，请输入有效的氨基酸序列')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // 替换序列
      const newSequence = replaceSequenceFragment(
        currentSequence,
        selectedRange.start,
        selectedRange.end,
        replacementSequence.toUpperCase()
      )

      console.log('🔄 替换片段:')
      console.log(`  原始: ${currentSequence.substring(selectedRange.start, selectedRange.end)}`)
      console.log(`  新序列: ${replacementSequence}`)
      console.log(`  完整新序列: ${newSequence}`)

      // 生成新结构
      console.log('🧬 生成新结构...')
      const result = await generateStructureFromSequence(newSequence)

      if (result.pdbData) {
        // 更新序列和结构
        setCurrentSequence(newSequence)
        setOriginalPdbData(result.pdbData)
        
        // 通知父组件更新 pdbData（这样会触发重新加载）
        if (onPdbDataUpdate) {
          onPdbDataUpdate(result.pdbData)
        }
        
        // 通知结构加载完成
        if (onStructureLoaded) {
          onStructureLoaded({ 
            ...result, 
            modifiedSequence: newSequence,
            replacedRange: selectedRange,
            originalFragment: currentSequence.substring(selectedRange.start, selectedRange.end)
          })
        }

        setShowEditPanel(false)
        setSelectedRange({ start: -1, end: -1 })
        setReplacementSequence('')
        
        console.log('✅ 片段替换完成，新结构已生成')
      } else {
        throw new Error('结构生成失败')
      }
    } catch (err) {
      console.error('❌ 替换片段失败:', err)
      setError(`替换失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 5. 切换表示类型
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

      await new Promise(resolve => setTimeout(resolve, 300))
      if (plugin.canvas3d) {
        plugin.canvas3d.requestDraw()
      }
    } catch (err) {
      console.error('切换样式失败:', err)
      setError(`切换样式失败: ${err.message}`)
    }
  }

  // 6. 相机控制
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
    <div className="molstar-viewer-with-editing">
      {/* 控制面板 */}
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
          {currentSequence && (
            <button 
              onClick={() => setShowEditPanel(!showEditPanel)}
              className="edit-btn"
            >
              {showEditPanel ? '关闭编辑' : '编辑序列'}
            </button>
          )}
        </div>
      </div>

      {/* 序列编辑面板 */}
      {showEditPanel && currentSequence && (
        <div className="sequence-edit-panel">
          <h3>🔧 序列编辑</h3>
          
          <div className="sequence-display">
            <label>当前序列 ({currentSequence.length} 个残基):</label>
            <div className="sequence-text">
              {currentSequence.split('').map((aa, index) => {
                const isSelected = index >= selectedRange.start && index < selectedRange.end
                const isAtomInfoSelected = selectedResidueIndex === index
                return (
                  <span
                    key={index}
                    className={`aa-residue ${isSelected ? 'selected' : ''} ${isAtomInfoSelected ? 'atom-info-selected' : ''}`}
                    onClick={(e) => {
                      // 左键点击：选择片段
                      if (e.button === 0 || !e.button) {
                        selectFragment(index, index + 1)
                      }
                    }}
                    onDoubleClick={() => {
                      // 双击：查看原子信息
                      selectResidueForAtomInfo(index)
                    }}
                    onContextMenu={(e) => {
                      // 右键点击：查看原子信息
                      e.preventDefault()
                      selectResidueForAtomInfo(index)
                    }}
                    onMouseEnter={(e) => {
                      // 鼠标悬停显示位置
                      e.target.title = `位置 ${index + 1}: ${aa} (双击或右键查看原子信息)`
                    }}
                  >
                    {aa}
                  </span>
                )
              })}
            </div>
            <div className="sequence-hint">
              <small>💡 提示：双击或右键点击残基可查看该残基的原子坐标和距离信息</small>
            </div>
          </div>

          <div className="fragment-selection">
            <label>选择片段范围:</label>
            <div className="range-inputs">
              <input
                type="number"
                min="1"
                max={currentSequence.length}
                value={selectedRange.start >= 0 ? selectedRange.start + 1 : ''}
                onChange={(e) => {
                  const start = parseInt(e.target.value) - 1
                  if (!isNaN(start) && start >= 0) {
                    setSelectedRange(prev => ({ ...prev, start }))
                  }
                }}
                placeholder="起始位置"
              />
              <span>到</span>
              <input
                type="number"
                min="1"
                max={currentSequence.length}
                value={selectedRange.end > 0 ? selectedRange.end : ''}
                onChange={(e) => {
                  const end = parseInt(e.target.value)
                  if (!isNaN(end) && end > 0) {
                    setSelectedRange(prev => ({ ...prev, end }))
                  }
                }}
                placeholder="结束位置"
              />
              {selectedRange.start >= 0 && selectedRange.end > selectedRange.start && (
                <span className="selected-fragment">
                  选中: {currentSequence.substring(selectedRange.start, selectedRange.end)}
                </span>
              )}
            </div>
          </div>

          <div className="replacement-input">
            <label>替换为 (氨基酸序列):</label>
            <input
              type="text"
              value={replacementSequence}
              onChange={(e) => setReplacementSequence(e.target.value.toUpperCase())}
              placeholder="输入新的氨基酸序列（单字母代码）"
              className="replacement-text"
            />
          </div>

          <div className="edit-actions">
            <button
              onClick={handleReplaceFragment}
              disabled={!replacementSequence || selectedRange.start < 0 || isLoading}
              className="replace-btn"
            >
              {isLoading ? '生成中...' : '替换并生成新结构'}
            </button>
            <button
              onClick={() => {
                setShowEditPanel(false)
                setSelectedRange({ start: -1, end: -1 })
                setReplacementSequence('')
              }}
            >
              取消
            </button>
          </div>

          {selectedRange.start >= 0 && selectedRange.end > selectedRange.start && (
            <div className="preview-info">
              <p>
                <strong>预览:</strong> 将位置 {selectedRange.start + 1}-{selectedRange.end} 的 
                "{currentSequence.substring(selectedRange.start, selectedRange.end)}" 
                替换为 "{replacementSequence || '(空)'}"
              </p>
              <p>
                <strong>新序列长度:</strong> {currentSequence.length - (selectedRange.end - selectedRange.start) + (replacementSequence.length || 0)} 个残基
              </p>
            </div>
          )}
        </div>
      )}

      {/* 原子信息面板 */}
      {showAtomInfo && selectedResidueIndex >= 0 && residueAtoms.length > 0 && (
        <div className="atom-info-panel">
          <div className="atom-info-header">
            <h3>🔬 残基原子信息</h3>
            <button 
              onClick={() => {
                setShowAtomInfo(false)
                setSelectedResidueIndex(-1)
                setResidueAtoms([])
                setAtomDistances([])
              }}
              className="close-btn"
            >
              ✕
            </button>
          </div>

          {residues[selectedResidueIndex] && (
            <div className="residue-info">
              <p>
                <strong>残基位置:</strong> {selectedResidueIndex + 1} / {currentSequence.length}
              </p>
              <p>
                <strong>残基名称:</strong> {residues[selectedResidueIndex].residueName} ({residues[selectedResidueIndex].residue})
              </p>
              <p>
                <strong>PDB索引:</strong> {residues[selectedResidueIndex].pdbIndex} (链 {residues[selectedResidueIndex].chainId})
              </p>
              <p>
                <strong>原子数量:</strong> {residueAtoms.length}
              </p>
            </div>
          )}

          <div className="atoms-table-section">
            <h4>📊 原子坐标</h4>
            <div className="atoms-table-wrapper">
              <table className="atoms-table">
                <thead>
                  <tr>
                    <th>原子名称</th>
                    <th>元素</th>
                    <th>X (Å)</th>
                    <th>Y (Å)</th>
                    <th>Z (Å)</th>
                    <th>B因子</th>
                  </tr>
                </thead>
                <tbody>
                  {residueAtoms.map((atom, idx) => (
                    <tr key={idx}>
                      <td><strong>{atom.atomName}</strong></td>
                      <td>{atom.element}</td>
                      <td>{formatCoordinate(atom.x)}</td>
                      <td>{formatCoordinate(atom.y)}</td>
                      <td>{formatCoordinate(atom.z)}</td>
                      <td>{formatCoordinate(atom.bFactor, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="distances-section">
            <h4>📏 原子间距离</h4>
            <div className="distances-controls">
              <label>
                快速查找:
                <input
                  type="text"
                  placeholder="例如: CB-H"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target.value.trim()
                      const parts = input.split('-')
                      if (parts.length === 2) {
                        const pair = getAtomPairDistance(residueAtoms, parts[0].trim(), parts[1].trim())
                        if (pair) {
                          alert(`${parts[0].trim()} - ${parts[1].trim()}: ${formatDistance(pair.distance)}`)
                        } else {
                          alert(`未找到原子对: ${input}`)
                        }
                      }
                    }
                  }}
                  style={{ marginLeft: '8px', padding: '4px' }}
                />
              </label>
            </div>
            <div className="distances-table-wrapper">
              <table className="distances-table">
                <thead>
                  <tr>
                    <th>原子1</th>
                    <th>原子2</th>
                    <th>距离 (Å)</th>
                  </tr>
                </thead>
                <tbody>
                  {atomDistances.slice(0, 50).map((dist, idx) => (
                    <tr key={idx}>
                      <td><strong>{dist.atom1}</strong> ({dist.element1})</td>
                      <td><strong>{dist.atom2}</strong> ({dist.element2})</td>
                      <td className="distance-value">{formatDistance(dist.distance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {atomDistances.length > 50 && (
                <p className="distances-note">
                  <small>仅显示前 50 个距离（共 {atomDistances.length} 个）</small>
                </p>
              )}
            </div>
          </div>

          {/* 特殊距离查询 */}
          <div className="special-distances">
            <h4>🔍 常用原子对距离</h4>
            <div className="special-distances-grid">
              {['CA', 'CB', 'N', 'C', 'O', 'H'].map(atomName1 => {
                return ['CA', 'CB', 'N', 'C', 'O', 'H'].map(atomName2 => {
                  if (atomName1 >= atomName2) return null
                  const pair = getAtomPairDistance(residueAtoms, atomName1, atomName2)
                  if (!pair) return null
                  return (
                    <div key={`${atomName1}-${atomName2}`} className="special-distance-item">
                      <strong>{atomName1} - {atomName2}:</strong> {formatDistance(pair.distance)}
                    </div>
                  )
                })
              }).filter(Boolean)}
            </div>
          </div>
        </div>
      )}

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

export default MolstarViewerWithEditing

