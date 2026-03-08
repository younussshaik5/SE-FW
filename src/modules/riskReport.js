// ========================================
// Module 2: Identified Risk Report
// ========================================

import GeminiService from '../services/geminiService.js';

const RiskReport = {
    // Automated risk detection patterns
    riskPatterns: [
        { pattern: /ss[oO]|single sign[- ]?on|authentication/i, category: 'Security', severity: 'high', message: 'SSO integration may require additional configuration' },
        { pattern: /data migrat|migration|import/i, category: 'Data', severity: 'high', message: 'Data migration complexity may impact timeline' },
        { pattern: /custom integrat|api|webhook/i, category: 'Integration', severity: 'medium', message: 'Custom integrations may require development effort' },
        { pattern: /legacy|old system|outdated/i, category: 'Technical Debt', severity: 'medium', message: 'Legacy systems may complicate migration' },
        { pattern: /compliance|gdpr|hipaa|soc2/i, category: 'Compliance', severity: 'high', message: 'Compliance requirements may impact configuration' },
        { pattern: /budget|cost|price|expensive/i, category: 'Financial', severity: 'medium', message: 'Budget constraints may limit scope' },
        { pattern: /timeline|deadline|urgent|rush/i, category: 'Timeline', severity: 'high', message: 'Tight timeline may require phased approach' },
        { pattern: /stakeholder|champion|decision maker/i, category: 'Stakeholder', severity: 'medium', message: 'Stakeholder alignment may be needed' },
        { pattern: /integration|connect|sync/i, category: 'Integration', severity: 'medium', message: 'Integration complexity may be underestimated' },
        { pattern: /training|adoption|change management/i, category: 'Adoption', severity: 'low', message: 'User training and adoption may be challenging' }
    ],

    // Analyze text for potential risks
    analyzeRisks(text) {
        const risks = [];
        if (!text) return risks;

        this.riskPatterns.forEach(pattern => {
            if (pattern.pattern.test(text)) {
                risks.push({
                    category: pattern.category,
                    severity: pattern.severity,
                    message: pattern.message,
                    evidence: text.match(pattern.pattern)?.[0] || ''
                });
            }
        });

        return risks;
    },

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
                    <div class="form-group" style="margin-bottom:var(--space-4)">                        <label class="form-label">Partner Activity</label>
                        <textarea id="risk-partner" class="form-textarea" rows="3" placeholder="Describe any partner engagements, joint workshops, or handoffs"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">                         <label class="form-label">Attachments (Architecture Diagrams, RFPs)</label>
                         <input type="file" id="risk-display-file" class="form-input" multiple />
                    </div>
                    <div style="display:flex; gap:var(--space-3);">
                        <button class="btn btn-primary btn-lg" onclick="RiskReport.generateReport()" style="flex:1">
                            ⚠️ Generate Risk Report
                        </button>
                        <button class="btn btn-secondary btn-lg" onclick="RiskReport.analyzeRisksUI()" style="flex:1">
                            🔍 Auto-Detect Risks
                        </button>
                    </div>
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
            gaps: document.getElementById('risk-gaps').value,
            partner: document.getElementById('risk-partner').value
        };

        // Auto-detect risks from input (include partner activity)
        const allText = `${data.useCases}\n${data.steps}\n${data.gaps}\n${data.partner}`;
        const autoDetectedRisks = this.analyzeRisks(allText);
        const autoRisksText = autoDetectedRisks.length > 0
            ? `\n\n**Automatically Detected Risks:**\n${autoDetectedRisks.map(r => `- [${r.severity.toUpperCase()}] ${r.message}`).join('\n')}`
            : '';

        const resultEl = document.getElementById('risk-result');
        resultEl.innerHTML = '<div class="loading-shimmer" style="height:300px"></div>';

        const fileInput = document.getElementById('risk-display-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `You are a senior SE manager preparing the weekly technical risk summary. Use the provided inputs to populate the sections below; be exhaustive yet concise, using bullet lists and short paragraphs. Include partner activity where relevant.

${data.initials} ${new Date().toLocaleDateString()}

Top 3 Technical Use Cases:
- (derive from: ${data.useCases})

3 Challenges we are solving for and how we are solving them:
- (pick from gaps, steps, partner activity)

What have we done so far:
- SE steps taken (include quantities where applicable – e.g. (2) Discovery, (1) Demo, etc.) based on: ${data.steps}

Stakeholders:
- Who have we met so far?
- Who are we planning to meet?

What is outstanding / next steps:
- (technical perspective; what remains after discovery and what needs to be addressed)

Technical gaps / risks:
- (summarize from: ${data.gaps})

Partner activity:
- ${data.partner}

Attachments: reference any diagrams or product gap documents attached in the Files section.

Keep the entire report crisp and to‑the‑point while still covering each bullet above. **Do not use any tables** (Markdown or HTML) whatsoever; only bullet lists, short paragraphs, and clear heading lines are allowed. Include the automatically detected risks from earlier: ${autoRisksText}`;

        const result = await GeminiService.generateContent(prompt, 'You are a senior SE manager creating structured deal risk reports.', attachments);

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

    analyzeRisksUI() {
        const useCases = document.getElementById('risk-usecases').value;
        const steps = document.getElementById('risk-steps').value;
        const gaps = document.getElementById('risk-gaps').value;
        const resultEl = document.getElementById('risk-result');

        // Analyze all text fields for risks
        const allText = `${useCases}\n${steps}\n${gaps}`;
        const detectedRisks = this.analyzeRisks(allText);

        if (detectedRisks.length === 0) {
            window.App.showToast('No automated risks detected', 'success');
            return;
        }

        // Group risks by category
        const risksByCategory = {};
        detectedRisks.forEach(risk => {
            if (!risksByCategory[risk.category]) {
                risksByCategory[risk.category] = [];
            }
            risksByCategory[risk.category].push(risk);
        });

        // Generate HTML for detected risks
        let risksHtml = '<div style="padding:var(--space-4);">';
        risksHtml += '<h3 style="margin-bottom:var(--space-3);">🔍 Automated Risk Detection</h3>';
        risksHtml += '<p style="color:var(--text-secondary); margin-bottom:var(--space-4);">The following risks were automatically detected based on your input:</p>';

        for (const [category, risks] of Object.entries(risksByCategory)) {
            risksHtml += `<div style="margin-bottom:var(--space-4);">`;
            risksHtml += `<h4 style="color:var(--text-primary); margin-bottom:var(--space-2);">${category}</h4>`;
            risksHtml += '<ul style="margin-left:var(--space-5);">';
            risks.forEach(risk => {
                const severityColor = risk.severity === 'high' ? 'var(--danger)' : risk.severity === 'medium' ? 'var(--warning)' : 'var(--success)';
                risksHtml += `<li style="margin-bottom:var(--space-2); color:${severityColor};">
                    <strong>${risk.severity.toUpperCase()}:</strong> ${risk.message}
                    ${risk.evidence ? `<br><span style="color:var(--text-tertiary); font-size:var(--font-xs);">Evidence: "${risk.evidence}"</span>` : ''}
                </li>`;
            });
            risksHtml += '</ul></div>';
        }

        risksHtml += '<p style="margin-top:var(--space-4); color:var(--text-secondary); font-size:var(--font-sm);">💡 These risks have been added to the "Known Gaps / Blockers" field for your review.</p>';
        risksHtml += '</div>';

        resultEl.innerHTML = risksHtml;

        // Auto-populate the gaps field with detected risks
        const gapsField = document.getElementById('risk-gaps');
        const existingGaps = gapsField.value;
        const newGaps = detectedRisks.map(r => `[${r.severity.toUpperCase()}] ${r.message}`).join('\n');
        gapsField.value = existingGaps ? `${existingGaps}\n\n${newGaps}` : newGaps;

        window.App.showToast(`Detected ${detectedRisks.length} potential risks`, 'success');
    },

    copyReport() {
        window.App.copyToClipboard('risk-result');
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
        const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Risk Report - ${new Date().toLocaleDateString()}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:900px;margin:2rem auto;padding:1rem;color:#1a1a2e}
table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:0.75rem;text-align:left}
th{background:#f0f0f5;font-weight:600}h1,h2,h3{color:#1a1a2e}strong{color:#333}</style></head>
<body>${el.innerHTML}</body></html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
        window.App.showToast('Report downloaded as HTML!', 'success');
    }
};

window.RiskReport = RiskReport;
export default RiskReport;
