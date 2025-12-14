import { useState } from 'react'
import MolstarViewerCustom from '../../components/MolstarViewer/MolstarViewerCustom'
import MolstarViewerWithEditing from '../../components/MolstarViewer/MolstarViewerWithEditing'
import SequenceInput from '../../components/SequenceInput'
import Button from '../../components/Button'
import { generateStructureFromSequence } from '../../utils/structurePrediction'
import './MolstarCustomPage.css'

// 预定义的示例 PDB ID
const EXAMPLE_PDB_IDS = [
  { id: '1crn', name: 'Crambin (小蛋白)' },
  { id: '1hel', name: 'Hemoglobin (血红蛋白)' },
  { id: '1lyz', name: 'Lysozyme (溶菌酶)' },
]

// 示例序列用于快速生成
const EXAMPLE_SEQUENCES = [
  { name: '短序列示例', sequence: 'MKTAYIAKQRQISFVKSHFSRQ' },
  { name: '中等序列', sequence: 'MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL' },
]

function MolstarCustomPage() {
  const [pdbId, setPdbId] = useState('')
  const [customPdbId, setCustomPdbId] = useState('')
  const [url, setUrl] = useState('')
  const [pdbData, setPdbData] = useState(null)
  const [predictionStatus, setPredictionStatus] = useState(null)
  const [currentSequence, setCurrentSequence] = useState('')

  const handleLoadPdb = () => {
    const trimmedPdbId = customPdbId.trim().toUpperCase()
    
    if (!trimmedPdbId) {
      setPredictionStatus({
        type: 'error',
        message: '请输入 PDB ID'
      })
      return
    }

    // 验证 PDB ID 格式（通常是4个字符，字母和数字组合）
    if (!/^[0-9][A-Z0-9]{3}$/.test(trimmedPdbId)) {
      setPredictionStatus({
        type: 'error',
        message: 'PDB ID 格式不正确，应为4个字符（如: 1CRN, 1HEL）'
      })
      return
    }

    console.log(`📥 加载 PDB ID: ${trimmedPdbId}`)
    
    // 清除旧数据
    setPdbData(null)
    setUrl('')
    setCurrentSequence('')
    
    // 设置加载状态
    setPredictionStatus({
      type: 'loading',
      message: `正在从 RCSB PDB 加载结构: ${trimmedPdbId}...`
    })
    
    // 设置新的 PDB ID（这会触发 MolstarViewerCustom 重新加载）
    setPdbId(trimmedPdbId.toLowerCase())
  }

  const handleLoadUrl = () => {
    if (url.trim()) {
      setPdbId('')
      setPdbData(null)
    }
  }

  // 处理序列提交
  const handleSequenceSubmit = async (sequence) => {
    if (!sequence || sequence.trim().length === 0) {
      setPredictionStatus({
        type: 'error',
        message: '请输入有效的氨基酸序列'
      })
      return
    }

    setPredictionStatus({ type: 'loading', message: '正在生成本地3D结构...' })
    setCurrentSequence(sequence)
    
    try {
      console.log('🧬 开始生成本地3D结构...')
      console.log(`序列长度：${sequence.length} 个氨基酸`)
      
      const result = await generateStructureFromSequence(sequence)
      
      if (result.type === 'pdb') {
        setPdbId(result.pdbId)
        setUrl('')
        setPdbData(null)
        setCurrentSequence(sequence)
        setPredictionStatus({
          type: 'success',
          message: `找到匹配的 PDB 结构：${result.pdbId}`,
          title: result.title
        })
      } else if (result.type === 'predicted' || result.type === 'placeholder' || result.type === 'demo' || result.type === 'alphafold') {
        setPdbData(result.pdbData)
        setPdbId('')
        setUrl('')
        
        setPredictionStatus({
          type: 'success',
          message: '✅ 本地3D结构生成成功！',
          note: result.note || `已生成本地3D结构（α-螺旋模型）。序列长度：${sequence.length} 个氨基酸。纯前端生成，无需调用外部服务。`
        })
      }
    } catch (error) {
      console.error('生成结构失败:', error)
      setPredictionStatus({
        type: 'error',
        message: error.message || '生成结构时出错，请检查序列格式'
      })
    }
  }

  // 快速生成示例结构
  const handleQuickGenerate = (exampleSequence) => {
    setCurrentSequence(exampleSequence.sequence)
    handleSequenceSubmit(exampleSequence.sequence)
  }

  const handleClearStructure = () => {
    console.log('🗑️ 清除当前结构')
    setPdbData(null)
    setPdbId('')
    setUrl('')
    setCustomPdbId('')
    setPredictionStatus(null)
    setCurrentSequence('')
    console.log('✅ 已清除所有状态')
  }

  // 处理错误提示
  const handleError = (errorMessage) => {
    setPredictionStatus({
      type: 'error',
      message: errorMessage
    })
  }

  return (
    <div className="molstar-custom-page">
      <div className="page-header">
        <h1>🧬 蛋白质分子结构预测</h1>
        
      </div>

      {/* 状态提示 */}
      {predictionStatus && (
        <div className={`status-message ${predictionStatus.type}`}>
          <div className="status-content">
            {predictionStatus.type === 'loading' && '⏳'}
            {predictionStatus.type === 'success' && '✅'}
            {predictionStatus.type === 'error' && '❌'}
            <span>{predictionStatus.message}</span>
          </div>
          {predictionStatus.note && (
            <div className="status-note">{predictionStatus.note}</div>
          )}
          {predictionStatus.title && (
            <div className="status-title">{predictionStatus.title}</div>
          )}
        </div>
      )}

      {/* 横向布局容器 */}
      <div className="main-layout">
        {/* 左侧：输入控制区域 */}
        <div className="input-section">
        <div className="input-tabs">
          <h2>📝 输入方式</h2>
        </div>

        {/* 序列输入 */}
        <div className="input-group">
          <h3>从氨基酸序列生成</h3>
          <SequenceInput
            onSequenceSubmit={handleSequenceSubmit}
            currentSequence={currentSequence}
            onError={handleError}
          />
          
          {/* 快速示例 */}
          <div className="quick-examples">
            <span className="example-label">快速示例：</span>
            {EXAMPLE_SEQUENCES.map((example, idx) => (
              <Button
                key={idx}
                onClick={() => handleQuickGenerate(example)}
                className="example-btn"
              >
                {example.name}
              </Button>
            ))}
          </div>
        </div>

        {/* PDB ID 输入 - 主要功能 */}
        <div className="input-group pdb-main-input">
          <h3>🔬 快速加载蛋白质结构（PDB ID）</h3>
          <p className="input-description">
            输入 PDB ID 即可直接从 RCSB Protein Data Bank 加载对应的蛋白质3D结构
          </p>
          <div className="pdb-input-group">
            <input
              type="text"
              placeholder="输入 PDB ID (如: 1CRN, 1HEL, 1LYZ)"
              value={customPdbId}
              onChange={(e) => {
                // 自动转换为大写
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                setCustomPdbId(value)
                // 清除之前的错误状态
                if (predictionStatus?.type === 'error') {
                  setPredictionStatus(null)
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLoadPdb()
                }
              }}
              className="pdb-input"
              maxLength={4}
              style={{
                fontSize: '1.2rem',
                padding: '1rem',
                textTransform: 'uppercase'
              }}
            />
            <Button 
              onClick={handleLoadPdb}
              disabled={!customPdbId.trim()}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              根据PDB ID生成
            </Button>
          </div>
          
          {/* 快速示例 */}
          <div className="pdb-examples">
            <span className="example-label">快速示例：</span>
            {EXAMPLE_PDB_IDS.map((example) => (
              <Button
                key={example.id}
                onClick={() => {
                  console.log(`📥 快速加载 PDB ID: ${example.id}`)
                  // 设置输入框的值
                  setCustomPdbId(example.id.toUpperCase())
                  // 先清除旧数据
                  setPdbData(null)
                  setUrl('')
                  setCurrentSequence('')
                  // 设置加载状态
                  setPredictionStatus({
                    type: 'loading',
                    message: `正在加载: ${example.id.toUpperCase()}...`
                  })
                  // 然后设置新的 PDB ID（这会触发 MolstarViewerCustom 重新加载）
                  setPdbId(example.id)
                }}
                className="example-btn"
              >
                {example.name} ({example.id})
              </Button>
            ))}
          </div>
        </div>

        {/* URL 输入 */}
        <div className="input-group">
          <h3>通过 URL 加载文件</h3>
          <div className="url-input-group">
            <input
              type="text"
              placeholder="输入 PDB 文件 URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
            />
            <Button onClick={handleLoadUrl}>加载</Button>
          </div>
        </div>

        {/* 清除按钮 */}
        {(pdbData || pdbId || url) && (
          <div className="clear-section">
            <Button onClick={handleClearStructure} className="clear-btn">
              清除当前结构
            </Button>
          </div>
        )}
        </div>

        {/* 中间：自定义查看器 - 支持片段编辑 */}
        <div className="viewer-section">
          <h2>🎨 增强版查看器（支持片段编辑）</h2>
          <p className="section-description">
            加载结构后，点击"编辑序列"按钮可以选择片段并替换，系统会自动生成新的3D结构
          </p>
          <div className="viewer-wrapper">
          <MolstarViewerWithEditing
            pdbId={pdbId || undefined}
            url={url || undefined}
            pdbData={pdbData || undefined}
            format="pdb"
            onStructureLoaded={(result) => {
              console.log('✅ 结构加载完成:', result)
              
              // 如果是替换后的结构
              if (result && result.modifiedSequence) {
                setPredictionStatus({
                  type: 'success',
                  message: '✅ 片段替换成功，新结构已生成！',
                  note: result.note || `已将位置 ${result.replacedRange?.start + 1}-${result.replacedRange?.end} 的 "${result.originalFragment}" 替换为 "${result.modifiedSequence?.substring(result.replacedRange?.start, result.replacedRange?.end)}"`
                })
              } else {
                // 普通加载
                if (pdbId) {
                  setPredictionStatus({
                    type: 'success',
                    message: `✅ 成功加载结构: ${pdbId.toUpperCase()}`,
                    note: '结构已成功加载并显示在3D查看器中，现在可以编辑序列了'
                  })
                } else if (pdbData) {
                  setPredictionStatus({
                    type: 'success',
                    message: '✅ 结构加载成功！',
                    note: '结构已成功加载并显示在3D查看器中，现在可以编辑序列了'
                  })
                }
              }
            }}
            onSequenceExtracted={(sequence, residues) => {
              console.log('📝 序列已提取:', sequence)
              setCurrentSequence(sequence)
            }}
            onPdbDataUpdate={(newPdbData) => {
              // 更新 pdbData 以触发重新加载
              console.log('🔄 更新 PDB 数据以重新加载结构')
              setPdbData(newPdbData)
              // 清除其他数据源，确保使用新的 pdbData
              setPdbId('')
              setUrl('')
            }}
          />
          </div>
        </div>
      </div>

    </div>
  )
}

export default MolstarCustomPage

