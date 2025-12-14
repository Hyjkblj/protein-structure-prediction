import { useState } from 'react'
import Button from '../Button'
import './SequenceInput.css'

/**
 * 氨基酸序列输入组件
 * 支持输入肽链序列，然后预测或查找对应的3D结构
 */
function SequenceInput({ onSequenceSubmit, onPdbIdSubmit, onResidueClick, currentSequence, onError }) {
  const [sequence, setSequence] = useState('')
  const [sequenceType, setSequenceType] = useState('one-letter') // one-letter 或 three-letter
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedResidueIndex, setSelectedResidueIndex] = useState(null)

  // 验证氨基酸序列
  const validateSequence = (seq) => {
    if (!seq || seq.trim().length === 0) {
      return { valid: false, error: '序列不能为空' }
    }

    const cleanedSeq = seq.trim().toUpperCase().replace(/\s+/g, '')
    
    if (sequenceType === 'one-letter') {
      // 单字母代码：A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y
      const validLetters = /^[ACDEFGHIKLMNPQRSTVWY]+$/
      if (!validLetters.test(cleanedSeq)) {
        return { 
          valid: false, 
          error: '序列包含无效的氨基酸代码。单字母代码应为：A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y' 
        }
      }
    } else {
      // 三字母代码验证（简化版）
      const validThreeLetter = /^[A-Z]{3}(\s+[A-Z]{3})*$/
      if (!validThreeLetter.test(cleanedSeq)) {
        return { 
          valid: false, 
          error: '三字母代码格式不正确，应为：ALA GLY VAL 等' 
        }
      }
    }

    return { valid: true, sequence: cleanedSeq }
  }

  // 处理序列提交
  const handleSubmit = async () => {
    const validation = validateSequence(sequence)
    
    if (!validation.valid) {
      // 使用提示框而不是 alert
      if (onError) {
        onError(validation.error)
      } else {
        alert(validation.error) // 降级方案
      }
      return
    }

    setIsProcessing(true)
    setSelectedResidueIndex(null) // 清除之前的选择
    
    try {
      // 直接生成演示结构（纯前端 demo）
      if (onSequenceSubmit) {
        await onSequenceSubmit(validation.sequence)
      }
    } catch (error) {
      console.error('处理序列失败:', error)
      // 使用提示框而不是 alert
      if (onError) {
        onError('处理序列时出错：' + error.message)
      } else {
        alert('处理序列时出错：' + error.message) // 降级方案
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // 在PDB中搜索序列（简化版，实际搜索在主函数中完成）
  const searchPdbBySequence = async (seq) => {
    // 这个函数现在不再使用，搜索逻辑在 structurePrediction.js 中
    // 保留是为了兼容性
    return null
  }

  // 示例序列
  const exampleSequences = [
    { name: '胰岛素', sequence: 'MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN' },
    { name: '小蛋白示例', sequence: 'MKTAYIAKQRQISFVKSHFSRQLEERLGLIEVQAPILSRVGDGTQDNLSGAEKAVQVKVKALPDAQFEVVHSLAKWKRQTLGQHDFSAGEGLYTHMKALRPDEDRLSPLHSVYVDQWDWERVMGDGERQFSTLKSTVEAIWAGIKATEAAVSEEFGLAPFLPDQIHFVHSQELLSRYPDLDAKGRERAIAKDLGAVFLVGIGGKLSDGHRHDVRAPDYDDWSTPSELGHAGLNGDILVWNPVLEDAFELSSMGIRVDADTLKHQLALTGDEDRLELEWHQALLRGEMPQTIGGGIGQSRLTMLLLQLPHIGQVQAGVWPAAVRESVPSLL' },
    { name: '短肽链', sequence: 'MKTAYIAKQRQISFVKSHFSRQ' }
  ]

  const loadExample = (exampleSeq) => {
    setSequence(exampleSeq)
  }

  return (
    <div className="sequence-input-container">
      <h3>输入氨基酸序列</h3>
      
      <div className="input-options">
        <label>
          <input
            type="radio"
            value="one-letter"
            checked={sequenceType === 'one-letter'}
            onChange={(e) => setSequenceType(e.target.value)}
          />
          单字母代码 (A, C, D, E, ...)
        </label>
        <label>
          <input
            type="radio"
            value="three-letter"
            checked={sequenceType === 'three-letter'}
            onChange={(e) => setSequenceType(e.target.value)}
          />
          三字母代码 (ALA, GLY, VAL, ...)
        </label>
      </div>

      <textarea
        className="sequence-textarea"
        placeholder={
          sequenceType === 'one-letter'
            ? '输入氨基酸序列（单字母代码），例如：MKTAYIAKQRQISFVKSHFSRQ...'
            : '输入氨基酸序列（三字母代码），例如：MET LYS THR ALA TYR...'
        }
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        rows={6}
      />

      {/* 可点击的序列显示（仅在序列已提交后显示） */}
      {currentSequence && currentSequence.length > 0 && (
        <div className="clickable-sequence-container">
          <h4>点击序列中的氨基酸以在3D结构中高亮：</h4>
          <div className="clickable-sequence">
            {currentSequence.split('').map((aa, index) => {
              const residueNumber = index + 1 // PDB 中残基编号从1开始
              const isSelected = selectedResidueIndex === index
              
              return (
                <span
                  key={index}
                  className={`sequence-aa ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedResidueIndex(index)
                    if (onResidueClick) {
                      onResidueClick(residueNumber, aa, index)
                    }
                  }}
                  title={`残基 ${residueNumber}: ${aa}`}
                >
                  {aa}
                </span>
              )
            })}
          </div>
          {selectedResidueIndex !== null && (
            <div className="sequence-selection-info">
              已选择: 位置 {selectedResidueIndex + 1} ({currentSequence[selectedResidueIndex]})
            </div>
          )}
        </div>
      )}

      <div className="sequence-info">
        {sequence && (
          <div className="sequence-stats">
            <span>序列长度: {sequence.replace(/\s+/g, '').length} 个氨基酸</span>
          </div>
        )}
      </div>

      <div className="example-sequences">
        <h4>示例序列：</h4>
        <div className="example-buttons">
          {exampleSequences.map((example, index) => (
            <button
              key={index}
              className="example-btn"
              onClick={() => loadExample(example.sequence)}
            >
              {example.name}
            </button>
          ))}
        </div>
      </div>

      <div className="submit-section">
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !sequence.trim()}
        >
          {isProcessing ? '处理中...' : '生成3D结构'}
        </Button>
      </div>
    </div>
  )
}

export default SequenceInput

