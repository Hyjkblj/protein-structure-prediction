/**
 * 序列处理工具函数
 */

/**
 * 从 PDB 数据中提取序列
 * @param {string} pdbData - PDB 格式的字符串
 * @returns {Object} { sequence: string, residues: Array<{index: number, residue: string, pdbIndex: number}> }
 */
export function extractSequenceFromPdb(pdbData) {
  if (!pdbData || typeof pdbData !== 'string') {
    return { sequence: '', residues: [] }
  }

  const lines = pdbData.split('\n')
  const residues = []
  const seenResidues = new Set()
  
  // 氨基酸三字母到单字母的映射
  const aa3to1 = {
    'ALA': 'A', 'ARG': 'R', 'ASN': 'N', 'ASP': 'D', 'CYS': 'C',
    'GLN': 'Q', 'GLU': 'E', 'GLY': 'G', 'HIS': 'H', 'ILE': 'I',
    'LEU': 'L', 'LYS': 'K', 'MET': 'M', 'PHE': 'F', 'PRO': 'P',
    'SER': 'S', 'THR': 'T', 'TRP': 'W', 'TYR': 'Y', 'VAL': 'V',
    'ASX': 'B', 'GLX': 'Z', 'XAA': 'X', 'UNK': 'X'
  }

  for (const line of lines) {
    if (line.startsWith('ATOM') && line.substring(12, 16).trim() === 'CA') {
      const residueName = line.substring(17, 20).trim()
      const residueNumber = parseInt(line.substring(22, 26).trim())
      const chainId = line.substring(21, 22).trim() || 'A'
      
      const key = `${chainId}_${residueNumber}`
      if (!seenResidues.has(key)) {
        seenResidues.add(key)
        const singleLetter = aa3to1[residueName] || 'X'
        residues.push({
          index: residues.length,
          residue: singleLetter,
          residueName: residueName,
          pdbIndex: residueNumber,
          chainId: chainId
        })
      }
    }
  }

  const sequence = residues.map(r => r.residue).join('')
  
  return {
    sequence,
    residues,
    length: sequence.length
  }
}

/**
 * 替换序列中的片段
 * @param {string} originalSequence - 原始序列
 * @param {number} startIndex - 起始位置（0-based）
 * @param {number} endIndex - 结束位置（0-based，不包含）
 * @param {string} newFragment - 新的片段序列
 * @returns {string} 替换后的完整序列
 */
export function replaceSequenceFragment(originalSequence, startIndex, endIndex, newFragment) {
  if (startIndex < 0 || endIndex > originalSequence.length || startIndex >= endIndex) {
    throw new Error('无效的片段范围')
  }

  const before = originalSequence.substring(0, startIndex)
  const after = originalSequence.substring(endIndex)
  
  return before + newFragment + after
}

/**
 * 验证氨基酸序列
 * @param {string} sequence - 氨基酸序列
 * @returns {boolean} 是否为有效序列
 */
export function isValidAminoAcidSequence(sequence) {
  if (!sequence || typeof sequence !== 'string') {
    return false
  }
  
  const validAAs = /^[ACDEFGHIKLMNPQRSTVWYXZ]*$/i
  return validAAs.test(sequence) && sequence.length > 0
}

/**
 * 格式化序列显示（每行固定长度）
 * @param {string} sequence - 序列
 * @param {number} lineLength - 每行长度
 * @returns {string} 格式化后的序列
 */
export function formatSequence(sequence, lineLength = 60) {
  if (!sequence) return ''
  
  const lines = []
  for (let i = 0; i < sequence.length; i += lineLength) {
    lines.push(sequence.substring(i, i + lineLength))
  }
  return lines.join('\n')
}

