// ========================================
// Module 3: Value Architecture (ROI/TCO)
// ========================================

import GeminiService from '../services/geminiService.js';

const ValueArchitecture = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>💰 Value Architecture</h1>
                <p class="module-desc">Convert operational metrics into a 3-year business case for CFO-level stakeholders.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📊 Current State Inputs</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Company Name</label>
                        <input id="roi-company" class="form-input" placeholder="e.g., Acme Corp" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Number of Agents</label>
                        <input id="roi-agents" class="form-input" type="number" placeholder="e.g., 150" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Current Tools & Annual Costs</label>
                        <textarea id="roi-current-tools" class="form-textarea" rows="4" placeholder="List current tools and costs...

e.g., Zendesk Enterprise: $270,000/yr
Talkdesk: $84,000/yr
Intercom: $48,000/yr"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Average Labor Burden Rate ($/hr)</label>
                        <input id="roi-labor-rate" class="form-input" type="number" placeholder="e.g., 35" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Manual Reporting FTEs</label>
                        <input id="roi-manual-ftes" class="form-input" type="number" step="0.5" placeholder="e.g., 2" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Proposed Freshworks Plan</label>
                        <select id="roi-plan" class="form-select">
                            <option value="growth">Growth ($18/agent/mo)</option>
                            <option value="pro" selected>Pro ($49/agent/mo)</option>
                            <option value="enterprise">Enterprise ($79/agent/mo)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Additional Context</label>
                        <textarea id="roi-context" class="form-textarea" rows="3" placeholder="Any additional context for the value analysis...
                        
e.g., Onboarding latency is 8 weeks, Q4 SLA misses caused $180K in churn"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Current Contracts, Usage Reports)</label>
                         <input type="file" id="roi-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="ValueArchitecture.generateROI()" style="width:100%">
                        💰 Generate ROI Report
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📈 3-Year Value Report</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="ValueArchitecture.copyResult()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="ValueArchitecture.exportResult()">📥 Export</button>
                        </div>
                    </div>
                    <div id="roi-result" class="result-content">
                        <div class="empty-state">
                            <div class="empty-state-icon">💰</div>
                            <h3>Enter current state metrics</h3>
                            <p>AI will calculate headcount avoidance, direct savings, and generate a CFO-ready recommendation.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async generateROI() {
        const data = {
            company: document.getElementById('roi-company').value,
            agents: document.getElementById('roi-agents').value,
            currentTools: document.getElementById('roi-current-tools').value,
            laborRate: document.getElementById('roi-labor-rate').value,
            manualFTEs: document.getElementById('roi-manual-ftes').value,
            plan: document.getElementById('roi-plan').value,
            context: document.getElementById('roi-context').value
        };

        const resultEl = document.getElementById('roi-result');
        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const planPricing = { growth: 18, pro: 49, enterprise: 79 };
        const monthlyPerAgent = planPricing[data.plan];

        const fileInput = document.getElementById('roi-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate a 3-Year Value Architecture / ROI-TCO report for:
Company: ${data.company}
Agents: ${data.agents}
Current Tools & Costs: ${data.currentTools}
Labor Rate: $${data.laborRate}/hr
Manual Reporting FTEs: ${data.manualFTEs}
Proposed: Freshworks ${data.plan} plan at $${monthlyPerAgent}/agent/month
Context: ${data.context}

Analyze any attached contracts or usage reports for more accurate cost modeling.

Include:
1. Current State cost table (Markdown table format)
2. Proposed Freshworks cost table — 3-year (Markdown table format)
3. Headcount avoidance model (Markdown table format)
4. Direct labor savings calculation
5. 3-Year value summary table:
| Metric | Year 1 | Year 2 | Year 3 | Total |
| --- | --- | --- | --- | --- |
| Direct Savings | ... | ... | ... | ... |
| Labor Savings | ... | ... | ... | ... |
| Total Value | ... | ... | ... | ... |
6. Year 1 ROI % and Payback Period
7. CFO recommendation paragraph

Present ALL financial data in Markdown tables. Use real math based on inputs. Cite Freshworks pricing from official sources.`;

        const result = await GeminiService.generateContent(prompt, 'You are a value engineering expert creating CFO-level business cases.', attachments);

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${window.MarkdownRenderer.parse(result.text)}</div>
                <div class="result-meta">${badge}</div>
            `;
        } else {
            resultEl.innerHTML = `
                <div class="error-container" style="padding:var(--space-4); background:rgba(239,68,68,0.1); border-radius:var(--radius-md); border:1px solid rgba(239,68,68,0.2);">
                    <div style="color:#f87171; font-weight:600; margin-bottom:var(--space-2);">❌ AI Generation Failed</div>
                    <div style="color:var(--text-secondary); font-size:var(--font-sm);">${result.error || 'Unknown error occurred'}</div>
                </div>
            `;
        }
    },

    copyResult() {
        window.App.copyToClipboard('roi-result');
    },

    exportResult() {
        const el = document.getElementById('roi-result');
        const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ROI Report - ${new Date().toLocaleDateString()}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:900px;margin:2rem auto;padding:1rem;color:#1a1a2e}
table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:0.75rem;text-align:left}
th{background:#f0f0f5;font-weight:600}h1,h2,h3{color:#1a1a2e}strong{color:#333}</style></head>
<body>${el.innerHTML}</body></html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roi-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

window.ValueArchitecture = ValueArchitecture;
export default ValueArchitecture;
