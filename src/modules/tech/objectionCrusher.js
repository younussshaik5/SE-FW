import GeminiService from '../../services/geminiService.js';

const ObjectionCrusher = {
    render() {
        return `
        <div class="module-grid">
            <div class="glass-card module-panel">
                <h2>💪 Objection Input</h2>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">The Objection</label>
                    <textarea id="objection-input" class="form-textarea" rows="4" placeholder="e.g., Freshworks is too small compared to Zendesk. How do we know you'll be around?"></textarea>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Objection Type</label>
                    <select id="objection-type" class="form-select">
                        <option value="company-size">Company Size / Viability</option>
                        <option value="pricing">Pricing / Cost</option>
                        <option value="features">Missing Features</option>
                        <option value="security">Security / Compliance</option>
                        <option value="competition">Competitive Comparison</option>
                    </select>
                </div>
                 <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Attachments (Competitor Claims)</label>
                    <input type="file" id="objection-file" class="form-input" multiple />
                </div>
                <button class="btn btn-primary" onclick="ObjectionCrusher.generate()">💪 Crush Objection</button>
            </div>
            <div class="glass-card module-panel">
                <div class="result-header">
                    <h2>🎯 Response (EPC Framework)</h2>
                    <div class="result-actions">
                        <button class="btn btn-sm btn-secondary" onclick="ObjectionCrusher.copy()">📋 Copy</button>
                    </div>
                </div>
                <div id="objection-result" class="result-content">
                    <div class="empty-state"><div class="empty-state-icon">💪</div><h3>Enter an objection</h3><p>AI will use the Empathy-Proof-Challenger framework.</p></div>
                </div>
            </div>
        </div>`;
    },

    async generate() {
        const objection = document.getElementById('objection-input').value;
        const type = document.getElementById('objection-type').value;
        const resultEl = document.getElementById('objection-result');
        const fileInput = document.getElementById('objection-file');

        if (!objection.trim()) { window.App.showToast('Enter an objection', 'warning'); return; }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:200px"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `Handle this ${type} objection using the Empathy-Proof-Challenger framework:\n"${objection}"\n\nReference any attached competitor documents if available.\n\nFormat:\n**🤝 Empathy**: Acknowledge the concern\n**📊 Proof**: Data and evidence to counter\n**⚡ Challenger**: Reframe the conversation`,
            'You are a Freshworks competitive sales expert.',
            attachments
        );

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${window.MarkdownRenderer.parse(result.text)}</div>
                <div class="result-meta" style="margin-top:var(--space-4); opacity:0.8;">${badge}</div>
            `;
        } else {
            resultEl.innerHTML = `
                <div class="error-container" style="padding:var(--space-4); background:rgba(239,68,68,0.1); border-radius:var(--radius-md); border:1px solid rgba(239,68,68,0.2);">
                    <div style="color:#f87171; font-weight:600; margin-bottom:var(--space-2);">❌ AI Objection Crusher Failed</div>
                    <div style="color:var(--text-secondary); font-size:var(--font-sm);">${result.error || 'Unknown error occurred'}</div>
                </div>
            `;
        }
    },

    copy() {
        const el = document.getElementById('objection-result');
        navigator.clipboard.writeText(el.innerText).then(() => window.App.showToast('Copied!', 'success'));
    }
};

window.ObjectionCrusher = ObjectionCrusher;
export default ObjectionCrusher;
