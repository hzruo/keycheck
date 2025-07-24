addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 只处理 GET 请求
  if (request.method !== "GET") {
    return new Response("Not Found", { status: 404 });
  }
  
  // 根据路径返回不同的文件
  switch (pathname) {
    case "/":
    case "/index.html":
      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    case "/styles.css":
      return new Response(cssContent, {
        headers: { "Content-Type": "text/css;charset=UTF-8" },
      });
    case "/script.js":
      return new Response(scriptContent, {
        headers: { "Content-Type": "application/javascript;charset=UTF-8" },
      });
    case "/api-checkers.js":
      return new Response(apiCheckersContent, {
        headers: { "Content-Type": "application/javascript;charset=UTF-8" },
      });
    default:
      return new Response("Not Found", { status: 404 });
  }
}

// HTML内容
const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>API KEY检测工具</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🔑</div>
      <h1>API KEY检测工具</h1>
      <p class="subtitle">支持多种AI服务的API KEY有效性检测</p>
    </div>

    <div class="input-section">
      <label>API 提供商</label>
      <div class="provider-options">
        <label class="radio-option">
          <input type="radio" name="provider" value="openai" checked>
          <span class="radio-custom"></span>
          <span class="radio-label">OpenAI 通用</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="provider" value="silicoflow">
          <span class="radio-custom"></span>
          <span class="radio-label">硅基流动</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="provider" value="gemini">
          <span class="radio-custom"></span>
          <span class="radio-label">Google Gemini</span>
        </label>
      </div>
    </div>

    <div class="input-section" id="openaiConfig" style="display: block;">
      <div class="config-row">
        <div class="config-item">
          <label for="baseUrl">Base URL</label>
          <input type="text" id="baseUrl" value="https://api.openai.com/v1" placeholder="API Base URL">
        </div>
        <div class="config-item">
          <label for="testModel">测试模型</label>
          <input type="text" id="testModel" value="gpt-4o-mini" placeholder="测试用的模型名称">
        </div>
      </div>
    </div>

    <div class="input-section" id="geminiConfig" style="display: none;">
      <div class="config-row">
        <div class="config-item">
          <label for="geminiProxy">Gemini Proxy 地址</label>
          <input type="text" id="geminiProxy" value="" placeholder="留空使用官方地址，填写格式：https://your-proxy.com">
        </div>
        <div class="config-item">
          <label for="geminiModel">Gemini 模型</label>
          <input type="text" id="geminiModel" value="" placeholder="留空使用 gemini-1.5-flash-8b，可选：gemini-1.5-pro 等">
        </div>
      </div>
    </div>

    <div class="input-section">
      <div class="input-header">
        <label for="tokens">API KEYS</label>
        <button type="button" class="import-btn" id="importBtn">
          📁 导入文件
        </button>
        <input type="file" id="fileInput" accept=".txt" style="display: none;">
      </div>
      <textarea
        id="tokens"
        placeholder="请输入 API KEY，多个以英文逗号、分号或换行分隔&#10;&#10;示例格式：&#10;key1,key2&#10;key3;key4&#10;key5"
      ></textarea>
    </div>

    <div class="control-panel">
      <div id="thresholdSection">
        <label for="threshold">最低余额阈值</label>
        <input
          id="threshold"
          type="number"
          value="1"
          min="0"
          step="0.1"
        />
      </div>
      <div>
        <label for="concurrency">并发请求数</label>
        <input
          id="concurrency"
          type="number"
          value="5"
          min="1"
          max="10"
        />
      </div>
    </div>

    <div class="actions-container">
      <button id="checkButton" class="button primary-button">
        开始检测KEY
      </button>
    </div>

    <div class="results-section">
      <div class="results-header">
        <div class="results-title-group">
          <span id="validTitle" class="results-title">有效KEY (余额 ≥ 阈值)</span>
          <span id="validCount" class="counter">0</span>
        </div>
        <div class="card-actions" id="validActions" style="display: none;">
          <div class="copy-options-inline">
            <label class="checkbox-inline" id="balanceCheckbox">
              <input type="checkbox" id="includeBalance">
              <span class="checkbox-custom"></span>
              <span>含余额</span>
            </label>
            <label class="checkbox-inline">
              <input type="checkbox" id="commaSeparated">
              <span class="checkbox-custom"></span>
              <span>逗号分隔</span>
            </label>
          </div>
          <button class="copy-btn" id="copyValidBtn">
            📋 复制
          </button>
        </div>
      </div>
      <div id="validResults" class="results-content"></div>
    </div>

    <div class="results-section" id="lowBalanceSection">
      <div class="results-header">
        <div class="results-title-group">
          <span class="results-title">低余额KEY</span>
          <span id="lowBalanceCount" class="counter">0</span>
        </div>
      </div>
      <div id="lowBalanceResults" class="results-content"></div>
    </div>

    <div class="results-section" id="zeroBalanceSection">
      <div class="results-header">
        <div class="results-title-group">
          <span class="results-title">零余额KEY</span>
          <span id="zeroBalanceCount" class="counter">0</span>
        </div>
      </div>
      <div id="zeroBalanceResults" class="results-content"></div>
    </div>

    <div class="results-section">
      <div class="results-header">
        <div class="results-title-group">
          <span class="results-title">限流KEY</span>
          <span id="rateLimitCount" class="counter">0</span>
        </div>
        <div class="card-actions" id="rateLimitActions" style="display: none;">
          <div class="copy-options-inline">
            <label class="checkbox-inline">
              <input type="checkbox" id="rateLimitCommaSeparated">
              <span class="checkbox-custom"></span>
              <span>逗号分隔</span>
            </label>
          </div>
          <button class="copy-btn copy-btn-warning" id="copyRateLimitBtn">
            📋 复制
          </button>
        </div>
      </div>
      <div id="rateLimitResults" class="results-content"></div>
    </div>

    <div class="results-section">
      <div class="results-header">
        <div class="results-title-group">
          <span class="results-title">无效KEY</span>
          <span id="invalidCount" class="counter">0</span>
        </div>
      </div>
      <div id="invalidResults" class="results-content"></div>
    </div>

    <div class="results-section">
      <div class="results-header">
        <div class="results-title-group">
          <span class="results-title">重复KEY</span>
          <span id="duplicateCount" class="counter">0</span>
        </div>
      </div>
      <div id="duplicateResults" class="results-content"></div>
    </div>

    <div class="footer">
      <p>© 2025 API KEY 检测工具 | 支持多种AI服务提供商 技术支持：云胡不喜</p>
    </div>
  </div>

  <!-- 自定义弹窗 -->
  <div id="customModal" class="custom-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div id="modalIcon" class="modal-icon success">✓</div>
        <h3 id="modalTitle" class="modal-title">操作成功</h3>
      </div>
      <div id="modalMessage" class="modal-message">
        操作已成功完成
      </div>
      <div class="modal-actions">
        <button class="modal-btn primary" id="modalCloseBtn">确定</button>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
  <script src="api-checkers.js"></script>
</body>
</html>
`;

// CSS内容
const cssContent = `/* 优化全局样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #2c3e50;
  line-height: 1.6;
  padding: 16px;
  min-height: 100vh;
  margin: 0;
}

/* 主容器样式优化 */
.container {
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 头部样式 */
.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 72px;
  margin-bottom: 20px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

h1 {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 12px;
  font-weight: 700;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 输入区域样式 */
.input-section {
  margin-bottom: 28px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.input-section:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

textarea, input, select {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

textarea:focus, input:focus, select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
  outline: none;
  transform: translateY(-1px);
}

textarea {
  height: 180px;
  resize: vertical;
  font-family: monospace;
  line-height: 1.5;
}

/* 控制面板样式 */
.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

/* 按钮样式优化 */
.button {
  width: 100%;
  height: 56px;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 32px;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  color: white;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.button:hover::before {
  left: 100%;
}

.primary-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.primary-button:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.copy-button {
  background: linear-gradient(135deg, #56ab2f, #a8e6cf);
}

.copy-button:hover {
  background: linear-gradient(135deg, #4e9a2a, #95d3b8);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(86, 171, 47, 0.4);
}

/* 复选框容器样式 */
.checkbox-container {
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  padding: 0;
}

.checkbox-container input[type="checkbox"] {
  margin-right: 6px;
}

/* 结果区域样式优化 */
.results-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f2f5;
  flex-wrap: wrap;
}

.results-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.results-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.counter {
  background: #f0f2f5;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #666;
}

.results-content {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

/* 复制选项样式 */
.copy-options {
  background: #f0f4f8;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  border: 1px solid #e2e8f0;
}

.copy-options .checkbox-container {
  margin: 0;
  font-size: 0.9rem;
  color: #4a5568;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.copy-options .checkbox-container:hover {
  background: #f7fafc;
  border-color: #3498db;
}

.copy-options .checkbox-container input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.1);
}

/* 卡片内操作区域样式 */
.card-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  min-height: 40px; /* 确保最小高度一致 */
}

.copy-options-inline {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center; /* 确保内部元素垂直居中 */
}

.checkbox-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #475569;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: 32px; /* 固定高度确保对齐 */
  box-sizing: border-box;
}

.checkbox-inline::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.checkbox-inline:hover {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  border-color: #667eea;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.checkbox-inline:hover::before {
  left: 100%;
}

.checkbox-inline input[type="checkbox"] {
  display: none;
}

.checkbox-inline .checkbox-custom {
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
}

.checkbox-inline .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  color: white;
  font-size: 10px;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.checkbox-inline input[type="checkbox"]:checked + .checkbox-custom {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}

.checkbox-inline input[type="checkbox"]:checked + .checkbox-custom::after {
  transform: translate(-50%, -50%) scale(1);
}

.checkbox-inline span {
  font-weight: 600;
  transition: color 0.3s ease;
}

.checkbox-inline input[type="checkbox"]:checked ~ span {
  color: #667eea;
}

/* 卡片内复制按钮 */
.copy-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  height: 32px; /* 与复选框相同高度 */
  box-sizing: border-box;
  white-space: nowrap; /* 防止文字换行 */
}

.copy-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.copy-btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
  height: 32px; /* 确保警告按钮也有相同高度 */
}

.copy-btn-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

/* Radio 按钮样式 */
.provider-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 140px;
}

.radio-option:hover {
  border-color: #667eea;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-custom::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #667eea;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.2s ease;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #667eea;
  background: #f0f4ff;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  transform: translate(-50%, -50%) scale(1);
}

.radio-option input[type="radio"]:checked ~ .radio-label {
  color: #667eea;
  font-weight: 600;
}

.radio-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.3s ease;
}

/* 配置行样式 */
.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0;
}

.config-item input {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

/* 输入头部样式 */
.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.import-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.import-btn:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
}

/* 自定义弹窗样式 */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.custom-modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  transform: scale(0.8) translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.custom-modal.show .modal-content {
  transform: scale(1) translateY(0);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.modal-icon.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.modal-icon.error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.modal-icon.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.modal-icon.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-message {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
  white-space: pre-line;
  text-align: center;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.modal-btn.primary:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  transform: translateY(-1px);
}

.modal-btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.modal-btn.secondary:hover {
  background: #e5e7eb;
}

/* 加载动画优化 */
.loader {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 底部样式 */
.footer {
  text-align: center;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  color: #666;
  font-size: 0.9rem;
}

.footer a {
  color: #3498db;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

/* 按钮区域样式优化 */
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
}

/* 撒花动画样式 */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  font-size: 24px;
  animation: confetti-fall linear;
  opacity: 0.9;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti-piece:nth-child(odd) {
  animation-duration: 3s;
}

.confetti-piece:nth-child(even) {
  animation-duration: 2.5s;
}

.confetti-piece:nth-child(3n) {
  animation-duration: 4s;
}

.confetti-piece:nth-child(4n) {
  animation-duration: 3.5s;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  body {
    padding: 12px;
  }

  .container {
    padding: 24px;
    border-radius: 16px;
    margin: 0;
  }

  .control-panel {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  h1 {
    font-size: 2rem;
  }

  .logo {
    font-size: 56px;
  }

  .input-section {
    padding: 20px;
  }

  textarea, input, select {
    padding: 14px;
    font-size: 16px; /* 防止iOS缩放 */
  }

  .button {
    height: 52px;
    font-size: 1rem;
  }

  .copy-options {
    flex-direction: column;
    gap: 12px;
  }

  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .card-actions {
    width: 100%;
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
  }

  .copy-options-inline {
    flex: 1;
    align-items: center;
  }

  .provider-options {
    flex-direction: column;
    gap: 12px;
  }

  .radio-option {
    min-width: auto;
  }

  .config-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 20px;
  }

  h1 {
    font-size: 1.8rem;
  }

  .logo {
    font-size: 48px;
  }

  .subtitle {
    font-size: 1rem;
  }

  .input-section {
    padding: 16px;
  }

  .button {
    height: 48px;
    padding: 12px 20px;
  }
}
`;

// JavaScript内容
const scriptContent = `// API 提供商配置
const API_PROVIDERS = {
  openai: {
    name: "OpenAI 通用",
    placeholder: "请输入 OpenAI API KEY，多个以英文逗号、分号或换行分隔\\n\\n示例格式：\\nsk-xxx1,sk-xxx2\\nsk-xxx3;sk-xxx4\\nsk-xxx5",
    hasBalance: false,
    checkFunction: "checkOpenAIToken"
  },
  silicoflow: {
    name: "硅基流动",
    placeholder: "请输入硅基流动 API KEY，多个以英文逗号、分号或换行分隔\\n\\n示例格式：\\nsk-xxx1,sk-xxx2\\nsk-xxx3;sk-xxx4\\nsk-xxx5",
    hasBalance: true,
    checkFunction: "checkSilicoFlowToken"
  },
  gemini: {
    name: "Google Gemini",
    placeholder: "请输入 Google Gemini API KEY，多个以英文逗号、分号或换行分隔\\n\\n示例格式：\\nAIzaSyXXX1,AIzaSyXXX2\\nAIzaSyXXX3;AIzaSyXXX4\\nAIzaSyXXX5",
    hasBalance: false,
    checkFunction: "checkGeminiToken"
  }
};

// 全局函数定义
function updatePlaceholder() {
  const provider = document.querySelector('input[name="provider"]:checked').value;
  const tokensTextarea = document.getElementById('tokens');
  const thresholdSection = document.getElementById('thresholdSection');
  const balanceCheckbox = document.getElementById('balanceCheckbox');
  const validTitle = document.getElementById('validTitle');
  const lowBalanceSection = document.getElementById('lowBalanceSection');
  const zeroBalanceSection = document.getElementById('zeroBalanceSection');
  const openaiConfig = document.getElementById('openaiConfig');

  const config = API_PROVIDERS[provider];
  if (!config) return;

  tokensTextarea.placeholder = config.placeholder;

  // 清空之前的测试结果
  clearResults();

  // 显示/隐藏配置区域
  const geminiConfig = document.getElementById('geminiConfig');
  if (provider === 'openai') {
    openaiConfig.style.display = 'block';
    geminiConfig.style.display = 'none';
  } else if (provider === 'gemini') {
    openaiConfig.style.display = 'none';
    geminiConfig.style.display = 'block';
  } else {
    openaiConfig.style.display = 'none';
    geminiConfig.style.display = 'none';
  }

  // 根据是否支持余额查询来显示/隐藏相关元素
  if (config.hasBalance) {
    thresholdSection.style.display = 'block';
    balanceCheckbox.style.display = 'inline-flex';
    validTitle.textContent = '有效KEY (余额 ≥ 阈值)';
    lowBalanceSection.style.display = 'block';
    zeroBalanceSection.style.display = 'block';
  } else {
    thresholdSection.style.display = 'none';
    balanceCheckbox.style.display = 'none';
    validTitle.textContent = '有效KEY';
    lowBalanceSection.style.display = 'none';
    zeroBalanceSection.style.display = 'none';
  }
}

function clearResults() {
  // 清空所有结果显示区域
  const resultElements = [
    'validResults', 'lowBalanceResults', 'zeroBalanceResults',
    'rateLimitResults', 'invalidResults', 'duplicateResults'
  ];

  resultElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = '';
  });

  // 重置所有计数器
  const counterElements = [
    'validCount', 'lowBalanceCount', 'zeroBalanceCount',
    'rateLimitCount', 'invalidCount', 'duplicateCount'
  ];

  counterElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.textContent = '0';
  });

  // 隐藏所有复制操作
  const actionElements = ['validActions', 'rateLimitActions'];
  actionElements.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.style.display = 'none';
  });

  // 清空全局变量
  if (typeof window !== 'undefined') {
    window.__VALID_TOKENS_FOR_COPY__ = [];
    window.__RATE_LIMIT_TOKENS_FOR_COPY__ = [];
  }
}

// 文件导入功能
function importFromFile() {
  document.getElementById('fileInput').click();
}

function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.toLowerCase().endsWith('.txt')) {
    showCustomModal('请选择 .txt 格式的文件', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const tokensTextarea = document.getElementById('tokens');

    // 处理文件内容，按换行或逗号分隔
    const cleanContent = content
      .split(new RegExp('[,\\\\n\\\\r]+'))
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('\\n');

    // 如果文本框已有内容，则追加
    if (tokensTextarea.value.trim()) {
      tokensTextarea.value += '\\n' + cleanContent;
    } else {
      tokensTextarea.value = cleanContent;
    }

    showCustomModal('文件导入成功！共导入 ' + cleanContent.split('\\n').length + ' 个KEY', 'success');
  };

  reader.onerror = function() {
    showCustomModal('文件读取失败，请重试', 'error');
  };

  reader.readAsText(file);
}

// 自定义弹窗函数
function showCustomModal(message, type = 'success', title = '') {
  const modal = document.getElementById('customModal');
  const icon = document.getElementById('modalIcon');
  const titleEl = document.getElementById('modalTitle');
  const messageEl = document.getElementById('modalMessage');

  // 设置图标和样式
  icon.className = "modal-icon " + type;
  switch(type) {
    case 'success':
      icon.textContent = '✓';
      titleEl.textContent = title || '操作成功';
      break;
    case 'error':
      icon.textContent = '✕';
      titleEl.textContent = title || '操作失败';
      break;
    case 'warning':
      icon.textContent = '⚠';
      titleEl.textContent = title || '注意';
      break;
    case 'info':
      icon.textContent = 'ℹ';
      titleEl.textContent = title || '提示';
      break;
  }

  messageEl.textContent = message;
  modal.classList.add('show');

  // 检测完成的弹窗延长显示时间
  const autoCloseTime = type === 'success' && title.includes('完成') ? 5000 : 3000;
  setTimeout(() => {
    closeCustomModal();
  }, autoCloseTime);
}

function closeCustomModal() {
  const modal = document.getElementById('customModal');
  modal.classList.remove('show');
}

// 撒花动画函数
function createConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  document.body.appendChild(confettiContainer);

  const emojis = ['🎉', '🎊', '✨', '🎈', '🌟', '💫', '🎆', '🎇', '🏆', '👏'];
  const numPieces = 50;

  for (let i = 0; i < numPieces; i++) {
    const confettiPiece = document.createElement('div');
    confettiPiece.className = 'confetti-piece';
    confettiPiece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    // 随机位置
    confettiPiece.style.left = Math.random() * 100 + '%';
    confettiPiece.style.animationDelay = Math.random() * 2 + 's';
    
    // 随机大小
    const size = Math.random() * 16 + 16; // 16px到32px
    confettiPiece.style.fontSize = size + 'px';
    
    confettiContainer.appendChild(confettiPiece);
  }

  // 5秒后清理
  setTimeout(() => {
    if (confettiContainer && confettiContainer.parentNode) {
      confettiContainer.parentNode.removeChild(confettiContainer);
    }
  }, 5000);
}

// 检测完成庆祝函数
function celebrateCompletion(validCount, totalCount) {
  if (totalCount > 0) {
    createConfetti();
    
    // 计算成功率
    const successRate = Math.round((validCount / totalCount) * 100);
    const invalidCount = totalCount - validCount;
    
    // 创建紧凑的文本格式消息
    let message = \`🎉 检测任务完成！\\n\\n\`;
    message += \`📊 总共检测：\${totalCount} 个KEY\\n\`;
    message += \`✅ 有效KEY：\${validCount} 个\\n\`;
    message += \`❌ 无效KEY：\${invalidCount} 个\\n\`;
    message += \`📈 成功率：\${successRate}%\`;
    
    // 根据成功率添加庆祝文字
    if (successRate >= 80) {
      message += \`\\n\\n🏆 太棒了！成功率超高！\`;
    } else if (successRate >= 50) {
      message += \`\\n\\n👍 不错的结果！\`;
    } else if (successRate > 0) {
      message += \`\\n\\n💪 继续加油！\`;
    } else {
      message += \`\\n\\n🔍 建议检查KEY格式或来源\`;
    }
    
    setTimeout(() => {
      showCustomModal(message, 'success', '检测完成');
    }, 500);
  }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
  // 绑定provider选择器的事件处理器
  const providerRadios = document.querySelectorAll('input[name="provider"]');
  providerRadios.forEach(radio => {
    radio.addEventListener('change', updatePlaceholder);
  });

  // 绑定其他事件处理器
  document.getElementById('importBtn').addEventListener('click', importFromFile);
  document.getElementById('fileInput').addEventListener('change', handleFileImport);
  document.getElementById('checkButton').addEventListener('click', checkTokens);
  document.getElementById('copyValidBtn').addEventListener('click', copyValidTokens);
  document.getElementById('copyRateLimitBtn').addEventListener('click', copyRateLimitTokens);
  document.getElementById('modalCloseBtn').addEventListener('click', closeCustomModal);

  // 初始化placeholder
  updatePlaceholder();
});

// 并发执行工具函数：按 concurrency 数量并行执行 tasks
async function runWithConcurrencyLimit(tasks, concurrency, onResult) {
  return new Promise((resolve) => {
    let i = 0;
    let running = 0;
    const results = [];

    function runNext() {
      while (running < concurrency && i < tasks.length) {
        const currentIndex = i++;
        const task = tasks[currentIndex];
        running++;

        task()
          .then((result) => {
            results[currentIndex] = result;
            onResult(result, currentIndex);
          })
          .catch((err) => {
            const e = { error: err.message };
            results[currentIndex] = e;
            onResult(e, currentIndex);
          })
          .finally(() => {
            running--;
            if (i === tasks.length && running === 0) {
              resolve(results);
            } else {
              runNext();
            }
          });
      }
    }
    runNext();
  });
}

async function checkTokens() {
  // 获取DOM
  const tokensTextarea = document.getElementById("tokens");
  const thresholdInput = document.getElementById("threshold");
  const concurrencyInput = document.getElementById("concurrency");
  const checkButton = document.getElementById("checkButton");
  const validActions = document.getElementById("validActions");
  const rateLimitActions = document.getElementById("rateLimitActions");

  // 计数器DOM
  const validCountEl = document.getElementById("validCount");
  const lowBalanceCountEl = document.getElementById("lowBalanceCount");
  const zeroBalanceCountEl = document.getElementById("zeroBalanceCount");
  const rateLimitCountEl = document.getElementById("rateLimitCount");
  const invalidCountEl = document.getElementById("invalidCount");
  const duplicateCountEl = document.getElementById("duplicateCount");

  // 显示器DOM
  const validResEl = document.getElementById("validResults");
  const lowBalResEl = document.getElementById("lowBalanceResults");
  const zeroBalResEl = document.getElementById("zeroBalanceResults");
  const rateLimitResEl = document.getElementById("rateLimitResults");
  const invalidResEl = document.getElementById("invalidResults");
  const duplicatesResEl = document.getElementById("duplicateResults");

  // 初始化计数器
  let validCount = 0;
  let lowBalanceCount = 0;
  let zeroBalanceCount = 0;
  let rateLimitCount = 0;
  let invalidCount = 0;

  const tokensInput = tokensTextarea.value.trim();
  if (!tokensInput) {
    showCustomModal("请输入至少一个 API KEY", "warning");
    return;
  }

  const provider = document.querySelector('input[name="provider"]:checked').value;
  
  // 如果是 Gemini 提供商，提前校验配置格式
  if (provider === 'gemini') {
    const geminiProxy = document.getElementById('geminiProxy')?.value.trim();
    const geminiModel = document.getElementById('geminiModel')?.value.trim();
    
    // 校验 Proxy 地址格式
    if (geminiProxy) {
      const urlPattern = /^https?:\\/\\/.+/i;
      if (!urlPattern.test(geminiProxy)) {
        showCustomModal("Proxy地址格式无效！\\n必须以 http:// 或 https:// 开头\\n\\n示例：https://your-proxy.com", "error");
        return;
      }
    }
    
    // 校验模型名称格式
    if (geminiModel && !geminiModel.toLowerCase().startsWith('gemini')) {
      showCustomModal("模型名称格式无效！\\n必须以 'gemini' 开头\\n\\n示例：gemini-1.5-flash-8b", "error");
      return;
    }
  }
  const providerConfig = API_PROVIDERS[provider];
  const threshold = parseFloat(thresholdInput.value) || 1;
  const concurrency = parseInt(concurrencyInput.value) || 5;

  // 分割+去重
  let tokensRaw = tokensInput
    .split(new RegExp('[,;\\\\s\\\\n\\\\r]+'))
    .map(t => t.trim())
    .filter(t => t !== "");
  let seen = new Set();
  let duplicates = [];
  let uniqueTokens = [];
  tokensRaw.forEach(token => {
    if (seen.has(token)) {
      duplicates.push(token);
    } else {
      seen.add(token);
      uniqueTokens.push(token);
    }
  });

  // 重复计数
  duplicateCountEl.textContent = duplicates.length.toString();
  duplicatesResEl.textContent = duplicates.length ? duplicates.join("\\n") : "无";

  // 初始化UI
  checkButton.disabled = true;
  checkButton.innerHTML = '<span class="loader"></span>检测中...';

  validResEl.textContent = "";
  lowBalResEl.textContent = "";
  zeroBalResEl.textContent = "";
  rateLimitResEl.textContent = "";
  invalidResEl.textContent = "";

  validCountEl.textContent = "0";
  lowBalanceCountEl.textContent = "0";
  zeroBalanceCountEl.textContent = "0";
  rateLimitCountEl.textContent = "0";
  invalidCountEl.textContent = "0";

  validActions.style.display = "none";
  rateLimitActions.style.display = "none";

  // 存放可复制token(≥阈值)
  let validTokensForCopy = [];
  // 存放限流token
  let rateLimitTokensForCopy = [];

  // 构建任务数组
  const tasks = uniqueTokens.map(token => () => {
    switch(provider) {
      case 'openai':
        return checkOpenAIToken(token);
      case 'silicoflow':
        return checkSilicoFlowToken(token);
      case 'gemini':
        return checkGeminiToken(token);
      default:
        return Promise.resolve({ token, isValid: false, message: "未知提供商" });
    }
  });

  // 单次结果处理
  function onSingleResult(res) {
    if (!res || res.error) {
      // 网络/请求出错 => 无效
      invalidCount++;
      invalidCountEl.textContent = invalidCount.toString();
      invalidResEl.textContent += "未知KEY(请求失败): " + (res && res.error || "unknown") + "\\n";
      return;
    }
    if (!res.isValid) {
      // 检查是否是429限流错误
      if (res.message && res.message.includes("429")) {
        rateLimitCount++;
        rateLimitCountEl.textContent = rateLimitCount.toString();
        rateLimitResEl.textContent += res.token + " (" + res.message + ")\\n";
        rateLimitTokensForCopy.push(res.token);
        if (rateLimitCount === 1) {
          rateLimitActions.style.display = "flex";
        }
      } else {
        invalidCount++;
        invalidCountEl.textContent = invalidCount.toString();
        invalidResEl.textContent += res.token + " (" + res.message + ")\\n";
      }
      return;
    }

    // 有效的Key
    if (providerConfig.hasBalance) {
      // 支持余额查询的提供商
      const bal = res.balance;
      const display = res.token + " (余额:" + bal + ")";
      if (bal === 0) {
        zeroBalanceCount++;
        zeroBalanceCountEl.textContent = zeroBalanceCount.toString();
        zeroBalResEl.textContent += display + "\\n";
      } else if (bal < threshold) {
        lowBalanceCount++;
        lowBalanceCountEl.textContent = lowBalanceCount.toString();
        lowBalResEl.textContent += display + "\\n";
      } else {
        validCount++;
        validCountEl.textContent = validCount.toString();
        validResEl.textContent += display + "\\n";
        validTokensForCopy.push(res.token);
        if (validCount === 1) {
          validActions.style.display = "flex";
        }
      }
    } else {
      // 不支持余额查询的提供商，所有有效Key都算作有效
      validCount++;
      validCountEl.textContent = validCount.toString();
      const display = res.token + " (状态: 有效)";
      validResEl.textContent += display + "\\n";
      validTokensForCopy.push(res.token);
      if (validCount === 1) {
        validActions.style.display = "flex";
      }
    }
  }

  try {
    // 并发执行
    await runWithConcurrencyLimit(tasks, concurrency, onSingleResult);
    
    // 检测完成后触发庆祝动画
    // 对于支持余额查询的提供商，所有余额查询成功的都算有效KEY
    // 对于不支持余额查询的提供商，只有validCount
    const totalValidCount = providerConfig.hasBalance 
      ? validCount + lowBalanceCount + zeroBalanceCount 
      : validCount;
    celebrateCompletion(totalValidCount, uniqueTokens.length);
    
  } catch (err) {
    showCustomModal("检测失败: " + err.message, "error");
    console.error(err);
  } finally {
    checkButton.disabled = false;
    checkButton.textContent = "开始检测KEY";
  }

  // 记录可复制列表
  window.__VALID_TOKENS_FOR_COPY__ = validTokensForCopy;
  window.__RATE_LIMIT_TOKENS_FOR_COPY__ = rateLimitTokensForCopy;
}
`;

// API检测器内容
const apiCheckersContent = `// OpenAI 通用TOKEN检测
async function checkOpenAIToken(token) {
  try {
    const baseUrl = document.getElementById('baseUrl').value.trim() || 'https://api.openai.com/v1';
    const testModel = document.getElementById('testModel').value.trim() || 'gpt-4o-mini';

    // 确保 baseUrl 以正确格式结尾
    const apiUrl = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        model: testModel,
        messages: [
          {
            role: "user",
            content: "Hello"
          }
        ],
        max_tokens: 1
      })
    });

    if (response.ok) {
      return {
        token: token,
        isValid: true,
        message: "有效"
      };
    } else {
      const errorData = await response.json().catch(() => null);
      let message = "无效";
      
      if (response.status === 429) {
        message = "429 - 请求过于频繁";
      } else if (response.status === 401) {
        message = "401 - 认证失败";
      } else if (response.status === 403) {
        message = "403 - 权限不足";
      } else if (errorData && errorData.error && errorData.error.message) {
        message = errorData.error.message;
      }

      return {
        token: token,
        isValid: false,
        message: message
      };
    }
  } catch (error) {
    return {
      token: token,
      isValid: false,
      message: "网络错误: " + error.message
    };
  }
}

// 硅基流动TOKEN检测
async function checkSilicoFlowToken(token) {
  // 1. 验证token
  const resp1 = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "Qwen/Qwen2.5-7B-Instruct",
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 100,
      stream: false
    })
  });

  if (!resp1.ok) {
    const errData = await resp1.json().catch(() => null);
    return {
      token,
      isValid: false,
      message: errData && errData.message ? errData.message : "验证失败"
    };
  }

  // 2. 查询余额
  const resp2 = await fetch("https://api.siliconflow.cn/v1/user/info", {
    method: "GET",
    headers: { "Authorization": "Bearer " + token }
  });

  if (!resp2.ok) {
    return {
      token,
      isValid: true,
      balance: -1,
      message: "有效但无法获取余额"
    };
  }

  const data2 = await resp2.json();
  const balance = data2.data && data2.data.balance !== undefined ? data2.data.balance : -1;

  return {
    token,
    isValid: true,
    balance: balance,
    message: "有效"
  };
}

// Google Gemini TOKEN检测
async function checkGeminiToken(token) {
  try {
    // 获取 proxy 配置，如果有配置则使用 proxy，否则使用官方地址
    const geminiProxy = document.getElementById('geminiProxy')?.value.trim();
    const baseUrl = geminiProxy || 'https://generativelanguage.googleapis.com';
    
    // 获取模型配置，如果留空则使用默认模型
    const geminiModel = document.getElementById('geminiModel')?.value.trim() || 'gemini-1.5-flash-8b';
    
    // 确保 baseUrl 以正确格式结尾
    const apiUrl = baseUrl.endsWith('/') 
      ? \`\${baseUrl}v1beta/models/\${geminiModel}:generateContent?key=\${token}\`
      : \`\${baseUrl}/v1beta/models/\${geminiModel}:generateContent?key=\${token}\`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello"
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1
        }
      })
    });

    if (response.ok) {
      return {
        token: token,
        isValid: true,
        message: "有效"
      };
    } else {
      const errorData = await response.json().catch(() => null);
      let message = "无效";
      
      if (response.status === 429) {
        message = "429 - 请求过于频繁";
      } else if (response.status === 400) {
        message = "400 - API KEY无效";
      } else if (response.status === 403) {
        message = "403 - API KEY被禁用或权限不足";
      } else if (errorData && errorData.error && errorData.error.message) {
        message = errorData.error.message;
      }

      return {
        token: token,
        isValid: false,
        message: message
      };
    }
  } catch (error) {
    return {
      token: token,
      isValid: false,
      message: "网络错误: " + error.message
    };
  }
}

// 复制有效KEY
function copyValidTokens() {
  const validTokens = window.__VALID_TOKENS_FOR_COPY__ || [];
  if (!validTokens.length) {
    showCustomModal("没有可复制的有效KEY", "warning");
    return;
  }

  const provider = document.querySelector('input[name="provider"]:checked').value;
  const providerConfig = API_PROVIDERS[provider];
  const includeBalance = document.getElementById("includeBalance").checked;
  const commaSeparated = document.getElementById("commaSeparated").checked;

  const processedTokens = validTokens.map(token => {
    if (includeBalance && providerConfig.hasBalance) {
      const balanceInfo = document.getElementById("validResults").textContent
        .split("\\n")
        .find(line => line.startsWith(token));
      return balanceInfo || token;
    }
    return token;
  });

  const separator = commaSeparated ? ", " : "\\n";
  const joined = processedTokens.join(separator);

  const textArea = document.createElement("textarea");
  textArea.value = joined;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  const formatText = commaSeparated ? "逗号分隔" : "换行分隔";
  showCustomModal("有效KEY已复制到剪贴板 (" + formatText + ")", "success");
}

// 复制限流KEY
function copyRateLimitTokens() {
  const rateLimitTokens = window.__RATE_LIMIT_TOKENS_FOR_COPY__ || [];
  if (!rateLimitTokens.length) {
    showCustomModal("没有可复制的限流KEY", "warning");
    return;
  }

  const commaSeparated = document.getElementById("rateLimitCommaSeparated").checked;
  const separator = commaSeparated ? ", " : "\\n";
  const joined = rateLimitTokens.join(separator);

  const textArea = document.createElement("textarea");
  textArea.value = joined;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  const formatText = commaSeparated ? "逗号分隔" : "换行分隔";
  showCustomModal("限流KEY已复制到剪贴板 (" + formatText + ")", "success");
}
`;
