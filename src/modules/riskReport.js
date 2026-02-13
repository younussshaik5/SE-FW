// ========================================
// Module 2: Identified Risk Report
// ========================================

import GeminiService from '../services/geminiService.js';
import DemoResponses from '../data/demoResponses.js';

const RiskReport = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>⚠️ Identified Risk Report</h1>
                <p class="module-desc">Structured weekly technical assessment to identify deal blockers and technical gaps.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📋 Engagement Details</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">SE Initials</label>
                        <input id="risk-initials" class="form-input" placeholder="e.g., SY" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Customer / Deal Name</label>
                        <input id="risk-customer" class="form-input" placeholder="e.g., Acme Corp — Freshdesk Omnichannel" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Stage</label>
                        <select id="risk-stage" class="form-select">
                            <option value="discovery">Discovery</option>
                            <option value="technical-eval" selected>Technical Evaluation</option>
                            <option value="poc">POC / Trial</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Estimated Revenue (ARR)</label>
                        <input id="risk-revenue" class="form-input" type="text" placeholder="e.g., $85,000" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Use Cases Identified</label>
                        <textarea id="risk-usecases" class="form-textarea" rows="4" placeholder="List all use cases discussed...

e.g., Omnichannel ticketing, SLA management, Self-service portal, SSO integration, Custom reporting, Data migration"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Steps Taken (SE Activities)</label>
                        <textarea id="risk-steps" class="form-textarea" rows="4" placeholder="List all SE activities completed or in progress...

e.g., Discovery call, Technical deep-dive, Demo, POC setup, Agent training"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Known Gaps / Blockers</label>
                        <textarea id="risk-gaps" class="form-textarea" rows="4" placeholder="List any identified gaps, blockers, or risks...
                        
e.g., Looker integration not natively supported, SSO blocked on customer IT, Data migration not scoped"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Architecture Diagrams, RFPs)</label>
                         <input type="file" id="risk-display-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="RiskReport.generateReport()" style="width:100%">
                        ⚠️ Generate Risk Report
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📄 Risk Assessment</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="RiskReport.copyReport()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="RiskReport.shareToSlack()">💬 Slack</button>
                            <button class="btn btn-sm btn-secondary" onclick="RiskReport.exportReport()">📥 Export</button>
                        </div>
                    </div>
                    <div id="risk-result" class="result-content">
                        <div class="empty-state">
                            <div class="empty-state-icon">⚠️</div>
                            <h3>Fill in engagement details</h3>
                            <p>AI will generate a structured risk report with gap analysis and mitigation strategies.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async generateReport() {
        const data = {
            initials: document.getElementById('risk-initials').value,
            customer: document.getElementById('risk-customer').value,
            stage: document.getElementById('risk-stage').value,
            revenue: document.getElementById('risk-revenue').value,
            useCases: document.getElementById('risk-usecases').value,
            steps: document.getElementById('risk-steps').value,
            gaps: document.getElementById('risk-gaps').value
        };

        const resultEl = document.getElementById('risk-result');
        resultEl.innerHTML = '<div class="loading-shimmer" style="height:300px"></div>';

        const fileInput = document.getElementById('risk-display-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate a Technical Risk Assessment Report for:
Customer: ${data.customer}
SE: ${data.initials} | Date: ${new Date().toLocaleDateString()}
Deal Stage: ${data.stage} | Revenue: ${data.revenue}

Use Cases: ${data.useCases}
SE Steps Taken: ${data.steps}
Known Gaps: ${data.gaps}

Reference any attached diagrams or documents for deeper risk analysis.

Format with: Use cases status (✅/⏳/❌), SE steps timeline, Gap table (Gap|Impact|Status|Mitigation), and overall Risk Level (LOW/MEDIUM/HIGH).`;

        const result = await GeminiService.generateContent(prompt, 'You are a senior SE manager creating structured deal risk reports.', attachments);

        if (result.demo || !result.success) {
            resultEl.innerHTML = DemoResponses.riskReport;
        } else {
            resultEl.innerHTML = result.text;
        }
    },

    copyReport() {
        const el = document.getElementById('risk-result');
        navigator.clipboard.writeText(el.innerText).then(() => {
            window.App.showToast('Copied!', 'success');
        });
    },

    shareToSlack() {
        const el = document.getElementById('risk-result');
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`⚠️ *Risk Report*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    },

    exportReport() {
        const el = document.getElementById('risk-result');
        const blob = new Blob([el.innerText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        window.App.showToast('Report downloaded!', 'success');
    }
};

window.RiskReport = RiskReport;
export default RiskReport;
