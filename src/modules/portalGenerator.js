// ========================================
// Customer Portal Generator
// ========================================

import GeminiService from '../services/geminiService.js';
import DemoResponses from '../data/demoResponses.js';

const PortalGenerator = {
    messages: [],

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🌐 Portal Generator</h1>
                <p class="module-desc">Generate branded customer support portals through conversational AI.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card" style="border-radius:var(--radius-lg);overflow:hidden;">
                    <div class="chat-container" style="height:calc(100vh - 300px);">
                        <div class="chat-messages" id="pg-messages"></div>
                        <div class="chat-input-area">
                            <input type="text" class="chat-input" id="pg-input" placeholder="Describe your portal requirements..." onkeydown="if(event.key==='Enter')PortalGenerator.send()" />
                            <input type="file" id="pg-file" style="display:none" onchange="PortalGenerator.handleFileSelect()" multiple />
                            <button class="chat-send" onclick="document.getElementById('pg-file').click()" style="margin-right:0.5rem;background:var(--surface-3);color:var(--text-primary)">📎</button>
                            <button class="chat-send" onclick="PortalGenerator.send()">➤</button>
                        </div>
                        <div id="pg-file-preview" style="padding:0 1rem 0.5rem;color:var(--text-secondary);font-size:0.8rem;display:none;"></div>
                    </div>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>👁️ Portal Preview</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="PortalGenerator.copyCode()">📋 Copy HTML</button>
                            <button class="btn btn-sm btn-primary" onclick="PortalGenerator.download()">📥 Download</button>
                        </div>
                    </div>
                    <div id="pg-preview" class="portal-preview">
                        <div style="display:flex;align-items:center;justify-content:center;height:400px;color:#666;font-family:sans-serif;">
                            <div style="text-align:center;">
                                <div style="font-size:3rem;margin-bottom:1rem;">🌐</div>
                                <p>Chat with AI to generate your portal</p>
                                <p style="font-size:0.8rem;margin-top:0.5rem;">Preview will appear here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    portalHTML: '',

    init() {
        this.messages = [];
        this.attachments = [];
        if (!GeminiService.isLiveMode()) {
            this.messages = DemoResponses.portalGenerator.map(m => ({ ...m }));
        } else {
            this.messages = [{ role: 'ai', text: "🌐 Welcome to the Portal Generator! I'll help you create a branded customer support portal.\n\n**What's the company name and their primary brand color?**" }];
        }
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('pg-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.role === 'ai' ? 'ai' : 'user'}">
                <div class="chat-avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
                <div class="chat-bubble">${msg.text}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    },

    async send() {
        const input = document.getElementById('pg-input');
        const text = input.value.trim();
        if (!text && this.attachments.length === 0) return;

        input.value = '';
        this.messages.push({ role: 'user', text: text + (this.attachments.length > 0 ? `\n[Attached: ${this.attachments.map(f => f.name).join(', ')}]` : '') });
        const currentAttachments = [...this.attachments];
        this.attachments = []; // Clear
        document.getElementById('pg-file-preview').style.display = 'none';
        document.getElementById('pg-file').value = '';
        this.renderMessages();

        const container = document.getElementById('pg-messages');
        container.insertAdjacentHTML('beforeend', `
            <div class="chat-message ai" id="pg-loading">
                <div class="chat-avatar">🤖</div>
                <div class="chat-bubble"><span class="loading-dots">Generating</span></div>
            </div>
        `);
        container.scrollTop = container.scrollHeight;

        const history = this.messages.map(m => `${m.role === 'ai' ? 'AI' : 'User'}: ${m.text}`).join('\n');

        const result = await GeminiService.generateContent(
            `You are a customer portal designer. Based on this conversation and attachments:\n${history}\n\nEither ask for more details about the portal design OR if you have enough info, generate the complete HTML/CSS for a customer support portal. If generating code, wrap it in \`\`\`html code blocks.`,
            'Generate beautiful, responsive customer portal HTML with inline CSS.',
            currentAttachments.map(a => a.data)
        );

        document.getElementById('pg-loading')?.remove();

        let aiText;
        if (result.demo || !result.success) {
            aiText = "I've gathered your requirements! In live mode, I'll generate the complete HTML/CSS portal with your branding. Connect your Gemini API to enable live portal generation.\n\n*Here's a preview of what the generated portal will look like.*";
            // Show a sample portal preview
            this.showSamplePreview();
        } else {
            aiText = result.text;
            // Try to extract HTML from the response
            const htmlMatch = result.text.match(/```html\n([\s\S]*?)\n```/);
            if (htmlMatch) {
                this.portalHTML = htmlMatch[1];
                this.renderPreview(this.portalHTML);
            }
        }

        this.messages.push({ role: 'ai', text: aiText });
        this.renderMessages();
    },

    showSamplePreview() {
        const sampleHTML = `<!DOCTYPE html>
<html><head><style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif}
body{background:#f8fafc}
.header{background:linear-gradient(135deg,#2563EB,#1d4ed8);color:white;padding:3rem 2rem;text-align:center}
.header h1{font-size:1.8rem;margin-bottom:0.5rem}
.header p{opacity:0.9;font-size:0.95rem}
.search{max-width:500px;margin:1.5rem auto 0;position:relative}
.search input{width:100%;padding:0.8rem 1.2rem;border:none;border-radius:8px;font-size:1rem}
.categories{max-width:900px;margin:2rem auto;padding:0 1rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem}
.cat-card{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;text-align:center;cursor:pointer;transition:all 0.2s}
.cat-card:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1);transform:translateY(-2px)}
.cat-icon{font-size:2rem;margin-bottom:0.5rem}
.cat-title{font-weight:600;color:#1e293b;margin-bottom:0.25rem}
.cat-count{font-size:0.8rem;color:#64748b}
.footer{text-align:center;padding:2rem;color:#94a3b8;font-size:0.8rem;border-top:1px solid #e2e8f0;margin-top:2rem}
</style></head><body>
<div class="header">
    <h1>NovaPay Help Center</h1>
    <p>How can we help you today?</p>
    <div class="search"><input type="text" placeholder="Search for articles..." /></div>
</div>
<div class="categories">
    <div class="cat-card"><div class="cat-icon">💳</div><div class="cat-title">Payments</div><div class="cat-count">24 articles</div></div>
    <div class="cat-card"><div class="cat-icon">🔒</div><div class="cat-title">Account & Security</div><div class="cat-count">18 articles</div></div>
    <div class="cat-card"><div class="cat-icon">💰</div><div class="cat-title">Billing</div><div class="cat-count">12 articles</div></div>
    <div class="cat-card"><div class="cat-icon">🔗</div><div class="cat-title">API & Integrations</div><div class="cat-count">31 articles</div></div>
</div>
<div class="footer">© 2026 NovaPay. All rights reserved. | <a href="#" style="color:#2563EB;">Contact Support</a></div>
</body></html>`;
        this.portalHTML = sampleHTML;
        this.renderPreview(sampleHTML);
    },

    renderPreview(html) {
        const previewEl = document.getElementById('pg-preview');
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '400px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = 'var(--radius-md)';
        previewEl.innerHTML = '';
        previewEl.appendChild(iframe);
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();
    },

    copyCode() {
        if (this.portalHTML) {
            navigator.clipboard.writeText(this.portalHTML).then(() => window.App.showToast('HTML copied!', 'success'));
        }
    },

    download() {
        if (!this.portalHTML) return;
        const blob = new Blob([this.portalHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'customer-portal.html';
        a.click();
        URL.revokeObjectURL(url);
    },

    attachments: [],

    async handleFileSelect() {
        const fileInput = document.getElementById('pg-file');
        const previewEl = document.getElementById('pg-file-preview');

        if (fileInput.files.length > 0) {
            this.attachments = [];
            const names = [];
            for (const file of fileInput.files) {
                const processed = await window.App.readFile(file);
                this.attachments.push({ name: file.name, data: processed });
                names.push(file.name);
            }
            previewEl.textContent = `📎 Attached: ${names.join(', ')}`;
            previewEl.style.display = 'block';
        }
    }
};

window.PortalGenerator = PortalGenerator;
export default PortalGenerator;
