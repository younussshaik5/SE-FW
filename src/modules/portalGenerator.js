// ========================================
// Customer Portal Generator
// ========================================

import GeminiService from '../services/geminiService.js';

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
        this.messages = [{ role: 'ai', text: "🌐 Welcome to the Portal Generator! I'll help you create a branded customer support portal.\n\n**What's the company name and their primary brand color?**" }];
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('pg-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.role === 'ai' ? 'ai' : 'user'}">
                <div class="chat-avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
                <div class="chat-bubble">
                    ${msg.text}
                    ${msg.badge ? `<div class="result-meta" style="margin-top:var(--space-2); opacity:0.7;">${msg.badge}</div>` : ''}
                </div>
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
        if (result.success) {
            aiText = result.text;
            const badge = window.App.getAiBadge(result);
            this.messages[this.messages.length - 1].badge = badge;

            // Try to extract HTML from the response
            const htmlMatch = result.text.match(/```html\n([\s\S]*?)\n```/);
            if (htmlMatch) {
                this.portalHTML = htmlMatch[1];
                this.renderPreview(this.portalHTML);
            }
        } else {
            aiText = `❌ AI Generation Failed: ${result.error || 'Unknown error'}. Please check your configuration.`;
        }

        this.messages.push({ role: 'ai', text: aiText });
        this.renderMessages();
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
