/**
 * 移动端专用CSS样式
 * 这些样式只在移动端WebView中生效，不影响Web端
 */
export const MOBILE_CSS = `
    /* 页面标题区域 - 移动端优化 */
    .page-header {
      padding: 0.75rem 1rem;
      margin-bottom: 0.75rem;
    }
    
    .page-header h1 {
      font-size: 1.5rem !important;
      margin-bottom: 0.75rem !important;
    }
    
    .header-actions {
      margin-top: 0.5rem;
    }
    
    .generate-structure-btn {
      padding: 0.75rem 1.5rem !important;
      font-size: 1rem !important;
      width: 100%;
      max-width: 300px;
    }
    
    /* 主布局 - 移动端纵向布局 */
    .molstar-custom-page {
      padding: 0.75rem !important;
    }
    
    .main-layout {
      flex-direction: column !important;
      gap: 1rem !important;
    }
    
    /* 输入区域 - 移动端优化 */
    .input-section {
      width: 100% !important;
      max-width: 100% !important;
      flex: none !important;
      padding: 1rem !important;
      max-height: none !important;
    }
    
    .input-group {
      margin-bottom: 1rem !important;
    }
    
    .input-group h3 {
      font-size: 1rem !important;
    }
    
    /* 查看器区域 - 移动端优化 */
    .viewer-section {
      width: 100% !important;
    }
    
    .viewer-section h2 {
      font-size: 1rem !important;
    }
    
    .viewer-wrapper {
      height: 400px !important;
      min-height: 400px !important;
    }
    
    /* 按钮和输入框 - 移动端优化 */
    .pdb-input-group,
    .url-input-group {
      flex-direction: column !important;
      gap: 0.75rem !important;
    }
    
    .pdb-input,
    .url-input {
      width: 100% !important;
      font-size: 1rem !important;
      padding: 0.875rem !important;
    }
    
    /* 序列输入框 - 移动端优化 */
    .sequence-textarea {
      font-size: 0.9rem !important;
      min-height: 100px !important;
      padding: 0.75rem !important;
    }
    
    /* 示例按钮 - 移动端优化 */
    .example-btn {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.85rem !important;
    }
    
    /* 状态消息 - 移动端优化 */
    .status-message {
      padding: 0.75rem 1rem !important;
      font-size: 0.9rem !important;
      margin-bottom: 0.75rem !important;
    }
    
    /* 后端预测按钮 - 移动端优化 */
    .backend-prediction-section {
      padding: 0.75rem !important;
    }
    
    .backend-prediction-btn {
      font-size: 0.95rem !important;
      padding: 0.75rem 1.25rem !important;
    }
    
    /* 清除按钮 - 移动端优化 */
    .clear-btn {
      width: 100% !important;
      padding: 0.75rem 1.5rem !important;
    }
`;
