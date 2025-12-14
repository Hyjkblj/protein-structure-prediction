import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import './Protein3DViewer.css'

/**
 * 纯前端的蛋白质3D查看器
 * 使用 3Dmol.js 库，无需后端，无需 iframe
 */
const Protein3DViewer = forwardRef(function Protein3DViewer({ pdbId, url, pdbData }, ref) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [style, setStyle] = useState('cartoon') // cartoon, stick, sphere, surface
  const [highlightedResidue, setHighlightedResidue] = useState(null)

  // 等待 3Dmol.js 库加载和容器准备好
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 50 // 最多等待5秒
    let isInitialized = false
    
    const checkReady = () => {
      // 如果已经初始化，不再重试
      if (isInitialized) return
      
      // 检查容器和库是否都准备好了
      const containerReady = containerRef.current !== null
      const $3Dmol = window.$3Dmol
      
      if (retryCount === 0) {
        console.log('开始检查容器和库状态...')
      }
      
      if ($3Dmol && containerReady) {
        console.log('✅ 3Dmol.js 已加载，容器已准备好')
        console.log('容器元素:', containerRef.current)
        console.log('容器尺寸:', {
          width: containerRef.current?.offsetWidth,
          height: containerRef.current?.offsetHeight
        })
        isInitialized = true
        initializeViewer()
      } else {
        retryCount++
        if (retryCount < maxRetries) {
          // 每10次重试输出一次状态
          if (retryCount % 10 === 0) {
            console.log(`检查中... (${retryCount}/${maxRetries})`, {
              $3Dmol: !!$3Dmol,
              containerReady,
              containerElement: containerRef.current
            })
          }
          // 如果还没准备好，等待一段时间后重试
          setTimeout(checkReady, 100)
        } else {
          console.error('初始化超时', {
            $3Dmol: !!$3Dmol,
            containerReady,
            containerElement: containerRef.current
          })
          if (!$3Dmol) {
            console.error('3Dmol.js 加载失败')
            setError('3Dmol.js 库加载超时，请检查网络连接或刷新页面重试')
          } else if (!containerReady) {
            console.error('容器未准备好')
            setError('容器初始化失败，请刷新页面重试')
          }
          setIsLoading(false)
        }
      }
    }

    // 延迟一点时间，确保 DOM 已渲染
    setTimeout(checkReady, 100)
    
    // 清理函数
    return () => {
      isInitialized = true // 防止在组件卸载后继续重试
    }
  }, [])

  // 初始化 3Dmol 查看器
  const initializeViewer = () => {
    if (!containerRef.current) {
      console.warn('容器未准备好')
      return
    }

    const $3Dmol = window.$3Dmol
    
    if (!$3Dmol) {
      setError('3Dmol.js 库未加载，请检查网络连接。请刷新页面重试。')
      setIsLoading(false)
      return
    }

    try {
      // 如果查看器已存在，先清理
      if (viewerRef.current) {
        try {
          viewerRef.current.clear()
        } catch (e) {
          console.warn('清理旧查看器时出错:', e)
        }
      }

      console.log('创建 3Dmol 查看器...')
      console.log('容器尺寸:', {
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      })

      // 确保容器有尺寸
      if (containerRef.current.offsetWidth === 0 || containerRef.current.offsetHeight === 0) {
        console.warn('容器尺寸为0，等待容器渲染...')
        setTimeout(() => initializeViewer(), 200)
        return
      }

      // 创建 3Dmol 查看器
      // 3Dmol.js 返回的是 Module 对象，需要访问其属性
      console.log('$3Dmol 对象:', $3Dmol)
      console.log('createViewer 方法:', $3Dmol.createViewer)
      
      if (!$3Dmol.createViewer) {
        console.error('找不到 createViewer 方法')
        console.error('$3Dmol 的键:', Object.keys($3Dmol))
        throw new Error('3Dmol.js API 不正确，找不到 createViewer 方法')
      }
      
      const viewer = $3Dmol.createViewer(containerRef.current, {
        defaultcolors: $3Dmol.rasmolElementColors || $3Dmol.elementColors,
        backgroundColor: 0x1a1a1a
      })

      viewerRef.current = viewer
      console.log('查看器创建成功')

      // 加载结构
      loadStructure(viewer)
    } catch (err) {
      console.error('创建 3D 查看器失败:', err)
      setError(`初始化失败: ${err.message || '未知错误'}`)
      setIsLoading(false)
    }
  }

  // 加载结构数据
  const loadStructure = async (viewer) => {
    if (!viewer) {
      console.error('Viewer 未初始化')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let pdbContent = null

      if (pdbData) {
        // 直接使用提供的 PDB 数据
        console.log('使用提供的 PDB 数据，长度:', pdbData.length)
        pdbContent = pdbData
      } else if (pdbId) {
        // 从 PDB ID 加载
        console.log('从 PDB ID 加载:', pdbId)
        const response = await fetch(`https://files.rcsb.org/view/${pdbId.toUpperCase()}.pdb`)
        if (response.ok) {
          pdbContent = await response.text()
        } else {
          throw new Error(`无法加载 PDB 结构: ${pdbId}`)
        }
      } else if (url) {
        // 从 URL 加载
        console.log('从 URL 加载:', url)
        const response = await fetch(url)
        if (response.ok) {
          pdbContent = await response.text()
        } else {
          throw new Error('无法从 URL 加载结构')
        }
      } else {
        // 默认示例结构
        console.log('使用默认示例结构')
        pdbContent = getDefaultPDB()
      }

      if (pdbContent) {
        console.log('PDB 内容长度:', pdbContent.length)
        console.log('PDB 内容前200字符:', pdbContent.substring(0, 200))
        
        // 清除之前的模型
        viewer.clear()
        
        try {
          // 添加新模型
          viewer.addModel(pdbContent, 'pdb')
          console.log('模型添加成功')
          
          // 设置样式
          viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
          console.log('样式设置成功')
          
          // 缩放和渲染
          viewer.zoomTo()
          console.log('缩放设置成功')
          
          viewer.render()
          console.log('渲染完成')
          
          // 确保容器可见
          if (containerRef.current) {
            containerRef.current.style.display = 'block'
            containerRef.current.style.width = '100%'
            containerRef.current.style.height = '100%'
          }
        } catch (modelError) {
          console.error('添加模型时出错:', modelError)
          throw new Error(`模型加载失败: ${modelError.message}`)
        }
      } else {
        throw new Error('未获取到 PDB 内容')
      }
    } catch (err) {
      console.error('加载结构失败:', err)
      setError(`加载失败: ${err.message || '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 应用样式
  const applyStyle = (viewer, styleType) => {
    if (!viewer) return

    viewer.setStyle({}, {})

    switch (styleType) {
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
        break
      case 'stick':
        viewer.setStyle({}, { stick: { radius: 0.15, color: 'element' } })
        break
      case 'sphere':
        viewer.setStyle({}, { sphere: { radius: 1.0, color: 'element' } })
        break
      case 'surface':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
        viewer.addSurface(window.$3Dmol.SurfaceType.VDW, {
          opacity: 0.7,
          color: 'white'
        })
        break
      default:
        viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
    }

    viewer.render()
  }

  // 当数据改变时重新加载
  useEffect(() => {
    if (viewerRef.current && typeof window.$3Dmol !== 'undefined') {
      if (pdbId || url || pdbData) {
        console.log('数据改变，重新加载结构:', { pdbId, url, hasPdbData: !!pdbData })
        loadStructure(viewerRef.current)
      }
    }
  }, [pdbId, url, pdbData])

  // 当样式改变时重新应用
  useEffect(() => {
    if (viewerRef.current) {
      applyStyle(viewerRef.current, style)
      // 如果当前有高亮的残基，重新应用高亮
      if (highlightedResidue !== null) {
        const viewer = viewerRef.current
        // 先应用基础样式
        applyStyle(viewer, style)
        // 然后重新高亮选中的残基
        viewer.setStyle(
          { resi: highlightedResidue },
          { 
            cartoon: { color: 'red' },
            stick: { radius: 0.3, color: 'red' },
            sphere: { radius: 1.5, color: 'red' }
          }
        )
        viewer.render()
      }
    }
  }, [style, highlightedResidue])

  // 默认 PDB 结构（示例）
  const getDefaultPDB = () => {
    return `HEADER    DEMO PROTEIN STRUCTURE
TITLE     EXAMPLE STRUCTURE
REMARK   1 This is a demo structure
ATOM      1  N   ALA A   1      20.154  16.967  25.468  1.00 30.00           N
ATOM      2  CA  ALA A   1      19.032  16.967  24.468  1.00 30.00           C
ATOM      3  C   ALA A   1      17.632  16.967  25.468  1.00 30.00           C
ATOM      4  O   ALA A   1      17.432  16.967  26.468  1.00 30.00           O
ATOM      5  CB  ALA A   1      19.032  18.367  23.468  1.00 30.00           C
ATOM      6  N   GLY A   2      16.632  16.967  24.468  1.00 30.00           N
ATOM      7  CA  GLY A   2      15.232  16.967  25.468  1.00 30.00           C
ATOM      8  C   GLY A   2      13.832  16.967  24.468  1.00 30.00           C
ATOM      9  O   GLY A   2      13.632  16.967  23.468  1.00 30.00           O
ATOM     10  N   VAL A   3      12.832  16.967  25.468  1.00 30.00           N
ATOM     11  CA  VAL A   3      11.432  16.967  24.468  1.00 30.00           C
ATOM     12  C   VAL A   3      10.032  16.967  25.468  1.00 30.00           C
ATOM     13  O   VAL A   3       9.832  16.967  26.468  1.00 30.00           O
ATOM     14  CB  VAL A   3      11.432  18.367  23.468  1.00 30.00           C
ATOM     15  CG1 VAL A   3      10.032  18.367  22.468  1.00 30.00           C
ATOM     16  CG2 VAL A   3      12.832  18.367  22.468  1.00 30.00           C
END
`
  }

  // 导出样式设置函数
  const handleStyleChange = (newStyle) => {
    setStyle(newStyle)
  }

  // 重置视图
  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo()
      viewerRef.current.render()
    }
  }

  // 高亮特定残基
  const highlightResidue = (residueNumber) => {
    if (!viewerRef.current) {
      console.warn('查看器未初始化')
      return
    }

    try {
      const viewer = viewerRef.current
      const currentStyle = style // 使用当前的样式状态
      
      // 清除之前的高亮
      if (highlightedResidue !== null) {
        // 恢复之前的样式
        applyStyle(viewer, currentStyle)
      }

      // 高亮选中的残基
      if (residueNumber !== null && residueNumber > 0) {
        setHighlightedResidue(residueNumber)
        
        // 先应用基础样式到所有残基
        applyStyle(viewer, currentStyle)
        
        // 然后高亮特定残基（使用红色高亮）
        viewer.setStyle(
          { resi: residueNumber },
          { 
            cartoon: { color: 'red' },
            stick: { radius: 0.3, color: 'red' },
            sphere: { radius: 1.5, color: 'red' }
          }
        )
        
        // 缩放到该残基
        viewer.zoomTo({ resi: residueNumber }, 1000) // 1000ms 动画时间
        
        viewer.render()
        console.log(`高亮残基 ${residueNumber}`)
      } else {
        // 清除高亮
        setHighlightedResidue(null)
        applyStyle(viewer, currentStyle)
        viewer.render()
      }
    } catch (err) {
      console.error('高亮残基失败:', err)
    }
  }

  // 使用 useImperativeHandle 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    highlightResidue,
    resetView,
    viewer: viewerRef.current
  }))

  return (
    <div className="protein-3d-viewer-wrapper">
      <div className="protein-3d-viewer-container">
        {/* 容器始终渲染，这样 ref 才能被设置 */}
        <div 
          ref={containerRef} 
          className="protein-3d-viewer"
          style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative'
          }}
        />
        {/* 加载和错误状态作为覆盖层 */}
        {error && (
          <div className="viewer-error" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
            <h3>错误</h3>
            <p>{error}</p>
            <p className="error-hint">
              请确保已连接到互联网，3Dmol.js 库需要从 CDN 加载
            </p>
          </div>
        )}
        {isLoading && !error && (
          <div className="viewer-loading" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
            <div className="loading-spinner"></div>
            <p>正在加载3D结构...</p>
            {pdbId && <p className="loading-info">PDB ID: {pdbId}</p>}
          </div>
        )}
      </div>
      {!error && !isLoading && (
        <div className="viewer-controls-panel">
          <div className="control-section">
            <h4>显示样式</h4>
            <div className="style-buttons">
              <button
                className={style === 'cartoon' ? 'active' : ''}
                onClick={() => handleStyleChange('cartoon')}
              >
                Cartoon
              </button>
              <button
                className={style === 'stick' ? 'active' : ''}
                onClick={() => handleStyleChange('stick')}
              >
                Stick
              </button>
              <button
                className={style === 'sphere' ? 'active' : ''}
                onClick={() => handleStyleChange('sphere')}
              >
                Sphere
              </button>
              <button
                className={style === 'surface' ? 'active' : ''}
                onClick={() => handleStyleChange('surface')}
              >
                Surface
              </button>
            </div>
          </div>
          <div className="control-section">
            <h4>视图控制</h4>
            <button onClick={resetView} className="control-btn">
              🔄 重置视图
            </button>
          </div>
          <div className="control-section">
            <h4>操作提示</h4>
            <ul className="hint-list">
              <li>🖱️ 左键拖拽：旋转</li>
              <li>🖱️ 右键拖拽：平移</li>
              <li>🖱️ 滚轮：缩放</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default Protein3DViewer

