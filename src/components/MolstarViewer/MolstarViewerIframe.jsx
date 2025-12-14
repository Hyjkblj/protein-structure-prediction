import { useState } from 'react'
import './MolstarViewer.css'

/**
 * 使用 iframe 嵌入 RCSB PDB 查看器的替代方案
 * 解决 Tracking Prevention 问题
 */
function MolstarViewerIframe({ pdbId, url }) {
  const [iframeUrl, setIframeUrl] = useState('')

  // 构建 iframe URL
  const buildIframeUrl = () => {
    if (pdbId) {
      // 使用 RCSB PDB 的嵌入查看器
      return `https://www.rcsb.org/3d-view/${pdbId.toUpperCase()}?preset=default`
    } else if (url) {
      // 如果有 URL，可以尝试其他查看器
      return url
    }
    return `https://www.rcsb.org/3d-view/1CRN?preset=default`
  }

  const currentUrl = buildIframeUrl()

  return (
    <div className="molstar-viewer-container">
      <iframe
        src={currentUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
        title="Mol* Viewer"
        allowFullScreen
      />
    </div>
  )
}

export default MolstarViewerIframe

