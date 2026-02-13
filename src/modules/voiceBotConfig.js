// ========================================
// Voice Bot Config (Freshcaller)
// ========================================

import GeminiService from '../services/geminiService.js';

const VoiceBotConfig = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>📞 Voice Bot Config</h1>
                <p class="module-desc">AI-guided IVR and voice bot flow configuration for Freshcaller.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📞 IVR Configuration</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Company Name</label>
                        <input id="voice-company" class="form-input" placeholder="e.g., NovaPay" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Industry</label>
                        <select id="voice-industry" class="form-select">
                            <option value="fintech">FinTech / Payments</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="ecommerce">eCommerce</option>
                            <option value="saas">SaaS</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Support Categories (for IVR menu)</label>
                        <textarea id="voice-categories" class="form-textarea" rows="3" placeholder="e.g., Payments, Account Security, Billing, Technical Support"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Languages</label>
                        <div class="chip-group" id="voice-langs">
                            <button class="chip selected" data-lang="english">🇺🇸 English</button>
                            <button class="chip" data-lang="spanish" onclick="this.classList.toggle('selected')">🇪🇸 Spanish</button>
                            <button class="chip" data-lang="french" onclick="this.classList.toggle('selected')">🇫🇷 French</button>
                            <button class="chip" data-lang="german" onclick="this.classList.toggle('selected')">🇩🇪 German</button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Business Hours</label>
                        <input id="voice-hours" class="form-input" placeholder="e.g., Mon-Fri 8am-8pm EST" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Special Requirements</label>
                        <textarea id="voice-special" class="form-textarea" rows="3" placeholder="e.g., Fraud detection queue with 30sec answer SLA, automated password reset flow"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (IVR Flow Diagram / Script)</label>
                         <input type="file" id="voice-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="VoiceBotConfig.generate()" style="width:100%">
                        📞 Generate IVR Config
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📋 IVR Flow Design</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="VoiceBotConfig.copy()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="VoiceBotConfig.download()">📥 Export</button>
                        </div>
                    </div>
                    <div id="voice-result" class="result-content" style="max-height:700px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">📞</div>
                            <h3>Configure your IVR</h3>
                            <p>AI will generate a complete IVR flow with bot configuration, routing, and after-hours handling.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async generate() {
        const company = document.getElementById('voice-company').value;
        const industry = document.getElementById('voice-industry').value;
        const categories = document.getElementById('voice-categories').value;
        const hours = document.getElementById('voice-hours').value;
        const special = document.getElementById('voice-special').value;
        const langs = [...document.querySelectorAll('#voice-langs .chip.selected')].map(c => c.dataset.lang);
        const resultEl = document.getElementById('voice-result');

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const prompt = `Generate a complete Freshcaller IVR / Voice Bot configuration for:

Company: ${company || 'Sample Company'}
Industry: ${industry}
Categories: ${categories || 'General Support, Billing, Technical'}
Languages: ${langs.join(', ')}
Business Hours: ${hours || 'Mon-Fri 9am-5pm'}
Special Requirements: ${special || 'Standard setup'}

Include:
1. Complete IVR flow diagram (using text tree format)
2. Bot configuration table (language, voice, timeout, retries, hours, after-hours)
3. Queue routing rules
4. AI bot conversation flows for self-service scenarios
5. Escalation paths`;

        const result = await GeminiService.generateContent(prompt, 'You are a Freshcaller IVR architect.');

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
        const el = document.getElementById('voice-result');
        navigator.clipboard.writeText(el.innerText).then(() => window.App.showToast('Copied!', 'success'));
    },

    download() {
        const el = document.getElementById('voice-result');
        const blob = new Blob([el.innerText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ivr-config-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

window.VoiceBotConfig = VoiceBotConfig;
export default VoiceBotConfig;
