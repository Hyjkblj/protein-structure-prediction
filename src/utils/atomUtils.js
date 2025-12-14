/**
 * 原子坐标和距离计算工具函数
 */

/**
 * 从 PDB 数据中提取指定残基的所有原子坐标
 * @param {string} pdbData - PDB 格式的字符串
 * @param {number} residueIndex - 残基在序列中的索引（0-based）
 * @param {Array} residues - 从 extractSequenceFromPdb 获取的 residues 数组
 * @returns {Array} 原子信息数组 [{atomName, x, y, z, element, ...}]
 */
export function extractResidueAtoms(pdbData, residueIndex, residues) {
  if (!pdbData || !residues || residueIndex < 0 || residueIndex >= residues.length) {
    return []
  }

  const targetResidue = residues[residueIndex]
  if (!targetResidue) {
    return []
  }

  const lines = pdbData.split('\n')
  const atoms = []

  for (const line of lines) {
    if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
      const chainId = line.substring(21, 22).trim() || 'A'
      const residueNumber = parseInt(line.substring(22, 26).trim())
      const atomName = line.substring(12, 16).trim()
      const element = line.substring(76, 78).trim() || atomName[0] // 元素符号
      
      // 检查是否匹配目标残基
      if (chainId === targetResidue.chainId && residueNumber === targetResidue.pdbIndex) {
        const x = parseFloat(line.substring(30, 38).trim())
        const y = parseFloat(line.substring(38, 46).trim())
        const z = parseFloat(line.substring(46, 54).trim())
        const occupancy = parseFloat(line.substring(54, 60).trim()) || 1.0
        const bFactor = parseFloat(line.substring(60, 66).trim()) || 0.0

        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          atoms.push({
            atomName: atomName,
            element: element,
            x: x,
            y: y,
            z: z,
            occupancy: occupancy,
            bFactor: bFactor,
            residueName: targetResidue.residueName,
            residueIndex: residueIndex,
            pdbIndex: residueNumber,
            chainId: chainId
          })
        }
      }
    }
  }

  return atoms
}

/**
 * 计算两个原子之间的欧氏距离（单位：Å）
 * @param {Object} atom1 - 原子对象 {x, y, z}
 * @param {Object} atom2 - 原子对象 {x, y, z}
 * @returns {number} 距离（Å）
 */
export function calculateDistance(atom1, atom2) {
  if (!atom1 || !atom2) {
    return NaN
  }

  const dx = atom1.x - atom2.x
  const dy = atom1.y - atom2.y
  const dz = atom1.z - atom2.z

  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * 计算选定残基中所有原子对之间的距离
 * @param {Array} atoms - 原子数组
 * @returns {Array} 距离信息数组 [{atom1, atom2, distance}]
 */
export function calculateAtomDistances(atoms) {
  if (!atoms || atoms.length < 2) {
    return []
  }

  const distances = []

  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const atom1 = atoms[i]
      const atom2 = atoms[j]
      const distance = calculateDistance(atom1, atom2)

      distances.push({
        atom1: atom1.atomName,
        atom2: atom2.atomName,
        element1: atom1.element,
        element2: atom2.element,
        distance: distance,
        atom1Full: atom1,
        atom2Full: atom2
      })
    }
  }

  // 按距离排序
  distances.sort((a, b) => a.distance - b.distance)

  return distances
}

/**
 * 获取特定原子对的距离
 * @param {Array} atoms - 原子数组
 * @param {string} atomName1 - 第一个原子名称（如 'CB', 'H'）
 * @param {string} atomName2 - 第二个原子名称
 * @returns {Object|null} 距离信息或 null
 */
export function getAtomPairDistance(atoms, atomName1, atomName2) {
  const atom1 = atoms.find(a => a.atomName === atomName1 || a.atomName.trim() === atomName1)
  const atom2 = atoms.find(a => a.atomName === atomName2 || a.atomName.trim() === atomName2)

  if (!atom1 || !atom2) {
    return null
  }

  return {
    atom1: atom1,
    atom2: atom2,
    distance: calculateDistance(atom1, atom2)
  }
}

/**
 * 计算残基的几何中心（所有原子的质心）
 * @param {Array} atoms - 原子数组
 * @returns {Object} {x, y, z} 质心坐标
 */
export function calculateCentroid(atoms) {
  if (!atoms || atoms.length === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  let sumX = 0, sumY = 0, sumZ = 0
  for (const atom of atoms) {
    sumX += atom.x
    sumY += atom.y
    sumZ += atom.z
  }

  return {
    x: sumX / atoms.length,
    y: sumY / atoms.length,
    z: sumZ / atoms.length
  }
}

/**
 * 格式化坐标显示
 * @param {number} coord - 坐标值
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的字符串
 */
export function formatCoordinate(coord, decimals = 3) {
  return coord.toFixed(decimals)
}

/**
 * 格式化距离显示
 * @param {number} distance - 距离值
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的字符串
 */
export function formatDistance(distance, decimals = 3) {
  return `${distance.toFixed(decimals)} Å`
}

