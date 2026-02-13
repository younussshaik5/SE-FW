// ========================================
// Instance Builder — Conversational AI Agent
// ========================================

import GeminiService from '../services/geminiService.js';
import FreshworksService from '../services/freshworksService.js';
import DemoResponses from '../data/demoResponses.js';

const InstanceBuilder = {
    messages: [],

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🏗️ Instance Builder</h1>
                <p class="module-desc">Chat with AI to configure a complete Freshworks instance based on your requirements.</p>
            </div>

            <div class="glass-card" style="border-radius:var(--radius-lg);overflow:hidden;">
                <div class="chat-container">
                    <div class="chat-messages" id="ib-messages">
                        <!-- Messages rendered here -->
                    </div>
                    <div class="chat-input-area">
                        <input type="text" class="chat-input" id="ib-input" placeholder="Describe your requirements..." onkeydown="if(event.key==='Enter')InstanceBuilder.send()" />
                        <input type="file" id="ib-file" style="display:none" onchange="InstanceBuilder.handleFileSelect()" multiple />
                        <button class="chat-send" onclick="document.getElementById('ib-file').click()" style="margin-right:0.5rem;background:var(--surface-3);color:var(--text-primary)">📎</button>
                        <button class="chat-send" onclick="InstanceBuilder.send()">➤</button>
                    </div>
                    <div id="ib-file-preview" style="padding:0 1rem 0.5rem;color:var(--text-secondary);font-size:0.8rem;display:none;"></div>
                </div>
            </div>
        </div>`;
    },

    init() {
        this.messages = [];
        this.attachments = [];
        // Load demo conversation or start fresh
        if (!GeminiService.isLiveMode()) {
            const demoMessages = DemoResponses.instanceBuilder;
            this.messages = demoMessages.map(m => ({ ...m }));
        } else {
            this.messages = [{ role: 'ai', text: "👋 Welcome to the Instance Builder! I'll help you configure a complete Freshworks instance. Let's start — **which Freshworks product** are you setting up?\n\n- Freshdesk (Customer Support)\n- Freshservice (IT Service Management)\n- Freshsales (CRM)\n- Freshchat (Messaging)" }];
        }
        this.renderMessages();
    },

    renderMessages() {
        const container = document.getElementById('ib-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.role === 'ai' ? 'ai' : 'user'}">
                <div class="chat-avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
                <div class="chat-bubble">${msg.role === 'ai' ? window.MarkdownRenderer.parse(msg.text) : msg.text}</div>
            </div>
        `).join('');

        container.scrollTop = container.scrollHeight;
    },

    async send() {
        const input = document.getElementById('ib-input');
        const text = input.value.trim();
        if (!text && this.attachments.length === 0) return;

        input.value = '';
        this.messages.push({ role: 'user', text: text + (this.attachments.length > 0 ? `\n[Attached: ${this.attachments.map(f => f.name).join(', ')}]` : '') });
        const currentAttachments = [...this.attachments];
        this.attachments = []; // Clear after sending
        document.getElementById('ib-file-preview').style.display = 'none';
        document.getElementById('ib-file').value = ''; // Reset file input
        this.renderMessages();

        // Add loading indicator
        const container = document.getElementById('ib-messages');
        container.insertAdjacentHTML('beforeend', `
            <div class="chat-message ai" id="ib-loading">
                <div class="chat-avatar">🤖</div>
                <div class="chat-bubble"><span class="loading-dots">Thinking</span></div>
            </div>
        `);
        container.scrollTop = container.scrollHeight;

        const conversationHistory = this.messages.map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');

        const result = await GeminiService.generateContent(
            `You are the Freshworks Instance Builder AI. You help SEs configure complete Freshworks instances.

Conversation so far:
${conversationHistory}

Based on the conversation, either:
1. Ask the next relevant configuration question (industry, agents, channels, SLAs, automations, etc.)
2. If you have enough info, generate a complete configuration plan showing what you'll set up
3. If the user confirms, provide API-ready configuration commands

Be conversational, use emojis, and be thorough about gathering requirements.`,
            'You are a Freshworks configuration expert helping set up instances.'
        );

        document.getElementById('ib-loading')?.remove();

        const aiText = (result.demo || !result.success)
            ? "I'd love to help configure that! In live mode, I'll ask detailed questions about your setup needs and generate the full configuration. For now, you can see the sample conversation flow.\n\n*Connect your Gemini API to enable live configuration.*"
            : result.text;

        this.messages.push({ role: 'ai', text: aiText });
        this.renderMessages();
    },

    attachments: [],

    async handleFileSelect() {
        const fileInput = document.getElementById('ib-file');
        const previewEl = document.getElementById('ib-file-preview');

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

window.InstanceBuilder = InstanceBuilder;
export default InstanceBuilder;
