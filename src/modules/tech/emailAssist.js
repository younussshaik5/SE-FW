// ========================================
// Tech Utility: Email Assist
// ========================================

import GeminiService from '../../services/geminiService.js';
import DemoResponses from '../../data/demoResponses.js';

const EmailAssist = {
    render() {
        return `
        <div class="module-grid">
            <div class="glass-card module-panel">
                <h2>✉️ Email Context</h2>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Email Type</label>
                    <select id="email-type" class="form-select">
                        <option value="technical-reply">Technical Reply / Answer</option>
                        <option value="follow-up">Post-Meeting Follow-up</option>
                        <option value="poc-kickoff">POC Kickoff</option>
                        <option value="exec-intro">Executive Introduction</option>
                        <option value="proposal">Proposal Cover</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Context / Thread</label>
                    <textarea id="email-context" class="form-textarea" rows="8" placeholder="Paste the customer's email or describe the situation..."></textarea>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Key Points to Cover</label>
                    <textarea id="email-points" class="form-textarea" rows="3" placeholder="- Confirm SSO works with Okta&#10;- Attach Security Whitepaper&#10;- Propose call next Tuesday"></textarea>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Tone</label>
                    <select id="email-tone" class="form-select">
                        <option value="professional">Professional & Direct</option>
                        <option value="friendly">Friendly & Collaborative</option>
                        <option value="executive">Executive / Concise</option>
                        <option value="empathetic">Empathetic (for issues)</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Attachments (Reference Docs)</label>
                    <input type="file" id="email-file" class="form-input" multiple />
                </div>
                <button class="btn btn-primary" onclick="EmailAssist.generate()">✉️ Draft Reply</button>
            </div>
            <div class="glass-card module-panel">
                <div class="result-header">
                    <h2>📝 Draft</h2>
                    <div class="result-actions">
                         <button class="btn btn-sm btn-secondary" onclick="EmailAssist.copy()">📋 Copy</button>
                    </div>
                </div>
                <div id="email-result" class="result-content" style="min-height:300px;white-space:pre-wrap;">
                    <div class="empty-state"><div class="empty-state-icon">✉️</div><h3>Paste context</h3><p>AI will draft a professional reply for you.</p></div>
                </div>
            </div>
        </div>`;
    },

    async generate() {
        const type = document.getElementById('email-type').value;
        const context = document.getElementById('email-context').value;
        const points = document.getElementById('email-points').value;
        const tone = document.getElementById('email-tone').value;
        const resultEl = document.getElementById('email-result');
        const fileInput = document.getElementById('email-file');

        if (!context.trim()) { window.App.showToast('Paste email context', 'warning'); return; }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:200px"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Draft a ${tone} email (${type}) for a Freshworks SE.
        
Context/Thread:
"${context}"

Key Points to Cover:
${points}

Requirements:
- Subject line included
- Clear structure
- Professional closing`;

        const result = await GeminiService.generateContent(
            prompt,
            'You are a Freshworks Solution Engineer writing professional, technical emails.',
            attachments
        );

        const content = (result.demo || !result.success) ? (DemoResponses.techUtilities?.email || "Demo Response") : result.text;
        resultEl.innerHTML = window.MarkdownRenderer.parse(content);
    },

    copy() {
        const el = document.getElementById('email-result');
        navigator.clipboard.writeText(el.innerText).then(() => window.App.showToast('Copied!', 'success'));
    }
};

window.EmailAssist = EmailAssist;
export default EmailAssist;
