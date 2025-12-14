import { useState } from 'react'
import './MolstarControls.css'

/**
 * Mol* 控制面板组件
 * 提供类似 RCSB PDB 的控制功能
 */
function MolstarControls({ viewer, pdbId, onStyleChange, onExport }) {
  const [expandedSections, setExpandedSections] = useState({
    structure: true,
    components: true,
    measurements: false,
    export: false,
  })

  const [currentStyle, setCurrentStyle] = useState('cartoon')

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleStyleChange = (style) => {
    setCurrentStyle(style)
    if (onStyleChange && viewer) {
      onStyleChange(style)
    }
  }

  const handleExport = (format) => {
    if (onExport && viewer) {
      onExport(format)
    }
  }

  if (!viewer) {
    return (
      <div className="molstar-controls">
        <div className="controls-placeholder">
          <p>等待查看器加载...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="molstar-controls">
      {/* Structure 部分 */}
      <div className="control-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('structure')}
        >
          <span className="section-icon">📐</span>
          <span className="section-title">Structure</span>
          <span className="section-toggle">
            {expandedSections.structure ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.structure && (
          <div className="section-content">
            <div className="info-item">
              <strong>PDB ID:</strong> {pdbId?.toUpperCase() || 'N/A'}
            </div>
            <div className="info-item">
              <strong>Type:</strong> Assembly
            </div>
            <div className="info-item">
              <strong>View:</strong> 3D Structure
            </div>
            <div className="info-item">
              <label>
                <input 
                  type="checkbox" 
                  defaultChecked 
                />
                Dynamic Bonds
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Components 部分 */}
      <div className="control-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('components')}
        >
          <span className="section-icon">🧬</span>
          <span className="section-title">Components</span>
          <span className="section-toggle">
            {expandedSections.components ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.components && (
          <div className="section-content">
            <div className="style-presets">
              <div className="preset-buttons">
                <button
                  className={`preset-btn ${currentStyle === 'cartoon' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('cartoon')}
                >
                  Cartoon
                </button>
                <button
                  className={`preset-btn ${currentStyle === 'ball-and-stick' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('ball-and-stick')}
                >
                  Ball & Stick
                </button>
                <button
                  className={`preset-btn ${currentStyle === 'surface' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('surface')}
                >
                  Surface
                </button>
                <button
                  className={`preset-btn ${currentStyle === 'spacefill' ? 'active' : ''}`}
                  onClick={() => handleStyleChange('spacefill')}
                >
                  Spacefill
                </button>
              </div>
            </div>
            <div className="component-item">
              <div className="component-header">
                <span>Polymer</span>
                <span className="component-style">{currentStyle}</span>
              </div>
              <div className="component-actions">
                <button className="action-btn" title="Toggle visibility">👁</button>
                <button className="action-btn" title="Settings">⚙</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Measurements 部分 */}
      <div className="control-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('measurements')}
        >
          <span className="section-icon">📏</span>
          <span className="section-title">Measurements</span>
          <span className="section-toggle">
            {expandedSections.measurements ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.measurements && (
          <div className="section-content">
            <div className="measurement-tools">
              <button className="tool-btn">
                📐 Distance
              </button>
              <button className="tool-btn">
                📐 Angle
              </button>
              <button className="tool-btn">
                📐 Dihedral
              </button>
            </div>
            <p className="tooltip">
              点击工具后，在3D视图中选择原子进行测量
            </p>
          </div>
        )}
      </div>

      {/* Export 部分 */}
      <div className="control-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('export')}
        >
          <span className="section-icon">💾</span>
          <span className="section-title">Export</span>
          <span className="section-toggle">
            {expandedSections.export ? '▼' : '▶'}
          </span>
        </div>
        {expandedSections.export && (
          <div className="section-content">
            <div className="export-options">
              <button 
                className="export-btn"
                onClick={() => handleExport('image')}
              >
                📷 Export Image
              </button>
              <button 
                className="export-btn"
                onClick={() => handleExport('model')}
              >
                📦 Export Model
              </button>
              <button 
                className="export-btn"
                onClick={() => handleExport('animation')}
              >
                🎬 Export Animation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 快捷操作 */}
      <div className="control-section quick-actions">
        <div className="section-header">
          <span className="section-icon">⚡</span>
          <span className="section-title">Quick Actions</span>
        </div>
        <div className="section-content">
          <button 
            className="action-btn-full"
            onClick={() => viewer?.canvas3d?.requestCameraReset()}
          >
            🔄 Reset View
          </button>
          <button 
            className="action-btn-full"
            onClick={() => viewer?.canvas3d?.requestCameraFocus()}
          >
            🎯 Focus Structure
          </button>
        </div>
      </div>
    </div>
  )
}

export default MolstarControls

