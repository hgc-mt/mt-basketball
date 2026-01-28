/**
 * 添加谈判详情弹窗样式到CSS文件
 */
const fs = require('fs');

// 读取现有CSS内容
const cssFilePath = 'E:/basketball game/mt basketball/styles.css';
const cssContent = fs.readFileSync(cssFilePath, 'utf8');

// 定义要添加的样式
const newStyles = `
/* 谈判详情弹窗样式 */
.negotiation-details-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.negotiation-details-content {
    background: var(--card-bg);
    border-radius: 12px;
    width: 800px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
}

.negotiation-details-content .modal-header {
    padding: 20px 25px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, var(--primary-gradient-start), var(--primary-gradient-end));
    border-radius: 12px 12px 0 0;
}

.negotiation-details-content .modal-header h3 {
    margin: 0;
    color: white;
    font-size: 1.4rem;
}

.negotiation-details-content .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background 0.2s;
}

.negotiation-details-content .close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.details-body {
    padding: 25px;
    overflow-y: auto;
    flex: 1;
}

.detail-section {
    margin-bottom: 25px;
    padding: 15px;
    background: var(--background-color);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.detail-section h4 {
    margin: 0 0 15px 0;
    color: var(--primary-color);
    font-size: 1.2rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-row .label {
    font-weight: 600;
    color: var(--text-color);
}

.detail-row .probability {
    font-weight: 700;
    color: var(--success-color);
}

.status-active {
    color: var(--success-color);
    font-weight: 600;
}

.status-counter {
    color: var(--warning-color);
    font-weight: 600;
}

.status-accepted {
    color: var(--success-color);
    font-weight: 600;
}

.status-failed {
    color: var(--danger-color);
    font-weight: 600;
}

.preferences-list {
    margin-top: 10px;
}

.preference-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.preference-item:last-child {
    margin-bottom: 0;
}

.preference-name {
    width: 120px;
    font-weight: 600;
    color: var(--text-color);
}

.preference-bar {
    flex: 1;
    height: 10px;
    background: var(--background-color);
    border-radius: 5px;
    margin: 0 10px;
    overflow: hidden;
    position: relative;
}

.preference-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-gradient-end));
    border-radius: 5px;
    transition: width 0.3s ease;
}

.preference-value {
    min-width: 40px;
    text-align: right;
    font-weight: 600;
    color: var(--primary-color);
}

.modal-footer {
    padding: 20px 25px;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    background: var(--background-color);
    border-radius: 0 0 12px 12px;
}
`;

// 将新样式追加到现有内容
const updatedContent = cssContent + '\n' + newStyles;

// 写回文件
fs.writeFileSync(cssFilePath, updatedContent, 'utf8');

console.log('谈判详情弹窗样式已成功添加到CSS文件中！');