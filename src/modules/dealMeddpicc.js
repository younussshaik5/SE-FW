// ========================================
// Module 5: Deal MEDDPICC Analyzer
// ========================================

import GeminiService from '../services/geminiService.js';
import DemoResponses from '../data/demoResponses.js';

const DealMeddpicc = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>📊 Deal MEDDPICC</h1>
                <p class="module-desc">Enterprise-grade qualification framework to assess deal health and next best actions.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📋 Deal Information</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Name</label>
                        <input id="meddpicc-deal" class="form-input" placeholder="e.g., Acme Corp — Freshdesk Omnichannel" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Value (ARR)</label>
                        <input id="meddpicc-value" class="form-input" placeholder="e.g., $85,000" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Discovery Notes / Deal Context</label>
                        <textarea id="meddpicc-notes" class="form-textarea" rows="10" placeholder="Paste all discovery notes, meeting summaries, and deal context here...

Include details about:
• Key stakeholders and their roles
• Customer pain points and metrics
• Decision criteria and process
• Competition in the deal
• Champion details
• Timeline and next steps"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Account Plan, Org Chart)</label>
                         <input type="file" id="meddpicc-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="DealMeddpicc.analyze()" style="width:100%">
                        📊 Analyze Deal
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>🎯 MEDDPICC Analysis</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="DealMeddpicc.copy()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="DealMeddpicc.slack()">💬 Slack</button>
                        </div>
                    </div>
                    <div id="meddpicc-result" class="result-content" style="max-height:600px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">📊</div>
                            <h3>Enter deal information</h3>
                            <p>AI will evaluate across all MEDDPICC dimensions with scores, gap analysis, and recommended actions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async analyze() {
        const deal = document.getElementById('meddpicc-deal').value;
        const value = document.getElementById('meddpicc-value').value;
        const notes = document.getElementById('meddpicc-notes').value;
        const resultEl = document.getElementById('meddpicc-result');

        if (!notes.trim()) {
            window.App.showToast('Please enter discovery notes', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const fileInput = document.getElementById('meddpicc-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Perform a MEDDPICC analysis for this deal:

Deal: ${deal} | Value: ${value}

Discovery Notes:
${notes}

Analyze any attached account plans or org charts to populate the dimensions.

For each MEDDPICC dimension (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Paper Process, Implicate Pain, Champion), provide:
1. Score out of 10 with emoji (🟢 7-10, 🟡 4-6, 🔴 1-3)
2. Assessment paragraph
3. Specific ACTION item if score < 7

End with:
- Overall deal health score out of 100
- Top 3 priority actions with urgency indicators (🔴/🟡)

Format as a table + detailed breakdown.`;

        const result = await GeminiService.generateContent(prompt, 'You are a MEDDPICC methodology expert evaluating enterprise technology deals.', attachments);

        if (result.demo || !result.success) {
            resultEl.innerHTML = DemoResponses.dealMeddpicc;
        } else {
            resultEl.innerHTML = result.text;
        }
    },

    copy() {
        const el = document.getElementById('meddpicc-result');
        navigator.clipboard.writeText(el.innerText).then(() => window.App.showToast('Copied!', 'success'));
    },

    slack() {
        const el = document.getElementById('meddpicc-result');
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`📊 *MEDDPICC Analysis*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    }
};

window.DealMeddpicc = DealMeddpicc;
export default DealMeddpicc;
