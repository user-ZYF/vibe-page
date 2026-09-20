/** 代码解析渲染示例 - 默认 HTML */
export const CODE_PARSER_SAMPLE_HTML = `<div class="card">
  <h2 class="card-title">解析渲染示例</h2>
  <p class="card-desc">这段 HTML 由用户输入，经解析后生成画布元素</p>
  <button class="card-btn" onclick="alert('clicked')">点击按钮</button>
  <ul class="card-list">
    <li>列表项一</li>
    <li>列表项二</li>
    <li>列表项三</li>
  </ul>
</div>`;

/** 代码解析渲染示例 - 默认 CSS */
export const CODE_PARSER_SAMPLE_CSS = `.card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  max-width: 320px;
  font-family: sans-serif;
}
.card-title {
  margin: 0 0 8px;
  color: #111827;
  font-size: 18px;
}
.card-desc {
  margin: 0 0 12px;
  color: #6b7280;
  font-size: 14px;
}
.card-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
.card-btn:hover {
  background: #1d4ed8;
}
.card-list {
  margin: 12px 0 0;
  padding-left: 20px;
  color: #374151;
  font-size: 14px;
}
@media (max-width: 400px) {
  .card {
    padding: 12px;
  }
}`;
