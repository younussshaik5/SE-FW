// ========================================
// Module 4: Competitive Battlecards
// ========================================

import GeminiService from '../services/geminiService.js';

const Battlecards = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>⚔️ Competitive Battlecards</h1>
                <p class="module-desc">Real-time competitive intelligence for incumbent displacement or greenfield defense.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>🎯 Generate Battlecard</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Competitor</label>
                        <select id="battle-competitor" class="form-select">
                            <option value="zendesk">Zendesk</option>
                            <option value="servicenow">ServiceNow</option>
                            <option value="salesforce">Salesforce Service Cloud</option>
                            <option value="intercom">Intercom</option>
                            <option value="hubspot">HubSpot Service Hub</option>
                            <option value="zoho">Zoho Desk</option>
                            <option value="jira">Jira Service Management</option>
                            <option value="other">Other (specify below)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Custom Competitor (if Other)</label>
                        <input id="battle-custom" class="form-input" placeholder="e.g., Kayako, Help Scout" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Freshworks Product to Compare</label>
                        <select id="battle-product" class="form-select">
                            <option value="freshdesk">Freshdesk</option>
                            <option value="freshservice">Freshservice</option>
                            <option value="freshsales">Freshsales</option>
                            <option value="freshchat">Freshchat</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Context (optional)</label>
                        <textarea id="battle-context" class="form-textarea" rows="3" placeholder="Any deal-specific context...
                        
e.g., Customer is evaluating Zendesk vs Freshdesk, 150 agents, main concern is pricing and ease of migration"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Competitor Proposal, Features List)</label>
                         <input type="file" id="battle-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="Battlecards.generate()" style="width:100%">
                        ⚔️ Generate Battlecard
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📄 Battlecard</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="Battlecards.copy()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="Battlecards.slack()">💬 Slack</button>
                        </div>
                    </div>
                    <div id="battle-result" class="result-content" style="max-height:600px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">⚔️</div>
                            <h3>Select a competitor</h3>
                            <p>AI will generate pricing comparison, G2 sentiment, technical weaknesses, and trap-setting questions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async generate() {
        const competitor = document.getElementById('battle-competitor').value;
        const custom = document.getElementById('battle-custom').value;
        const product = document.getElementById('battle-product').value;
        const context = document.getElementById('battle-context').value;
        const resultEl = document.getElementById('battle-result');

        const competitorName = competitor === 'other' ? custom : competitor.charAt(0).toUpperCase() + competitor.slice(1);

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const fileInput = document.getElementById('battle-file');
        const attachments = [];
        if (fileInput && fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate a competitive battlecard: Freshworks ${product} vs ${competitorName}.

Include:
1. PRICING ADVANTAGE — tier-by-tier comparison table with savings %
2. G2 SENTIMENT ANALYSIS — rating comparison table (Overall, Ease of Use, Support, Setup Time)
3. TECHNICAL WEAKNESSES of ${competitorName} — 5 specific weaknesses with detail
4. TRAP-SETTING QUESTIONS — 5 questions designed to surface ${competitorName}'s weaknesses naturally in conversation, with the intended expose for each

${context ? `Deal context: ${context}` : ''}

Use any attached documents to refine the competitive analysis.
Use Google Search grounding for current pricing and G2 data.`;

        const result = await GeminiService.generateContent(prompt, 'You are a competitive intelligence expert for Freshworks pre-sales.', attachments);

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${result.text}</div>
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

    copy() {
        const el = document.getElementById('battle-result');
        navigator.clipboard.writeText(el.innerText).then(() => window.App.showToast('Copied!', 'success'));
    },

    slack() {
        const el = document.getElementById('battle-result');
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`⚔️ *Competitive Battlecard*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    }
};

window.Battlecards = Battlecards;
export default Battlecards;
