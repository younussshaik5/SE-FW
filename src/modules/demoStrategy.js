// ========================================
// Module 1: Demo Strategy (Discovery, Build, Script)
// ========================================

import GeminiService from '../services/geminiService.js';
import DemoResponses from '../data/demoResponses.js';

const DemoStrategy = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🎯 Demo Strategy</h1>
                <p class="module-desc">Architect the end-to-end technical sales motion — from value discovery to slide-specific talk tracks.</p>
            </div>

            <div class="tabs">
                <button class="tab active" data-tab="discovery">Discovery</button>
                <button class="tab" data-tab="build">Build</button>
                <button class="tab" data-tab="script">Script</button>
            </div>

            <!-- Discovery Tab -->
            <div id="tab-discovery" class="tab-content active">
                <div class="module-grid">
                    <div class="glass-card module-panel">
                        <h2>📋 Discovery Input</h2>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Paste Discovery Transcript / Notes</label>
                            <textarea id="discovery-input" class="form-textarea" rows="8" placeholder="Paste your discovery call transcript or meeting notes here...

Example: 'Customer mentioned they use 4 different tools for support — Zendesk for email, Intercom for chat, Talkdesk for phone. Agents waste 15-20 minutes per ticket switching between tools. VP of Support said SLA visibility is their #1 pain...'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Attachments (Transcripts, Emails, Docs)</label>
                            <input type="file" id="discovery-file" class="form-input" multiple />
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Industry</label>
                            <select id="discovery-industry" class="form-select">
                                <option value="">Select industry...</option>
                                <option value="fintech">FinTech / Payments</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="ecommerce">eCommerce / Retail</option>
                                <option value="saas">SaaS / Technology</option>
                                <option value="education">Education</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="DemoStrategy.analyzeDiscovery()">
                            🔍 Analyze Discovery
                        </button>
                    </div>
                    <div class="glass-card module-panel">
                        <div class="result-header">
                            <h2>📊 Analysis</h2>
                            <div class="result-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.copyResult('discovery')">📋 Copy</button>
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.shareToSlack('discovery')">💬 Slack</button>
                            </div>
                        </div>
                        <div id="discovery-result" class="result-content">
                            <div class="empty-state">
                                <div class="empty-state-icon">🔍</div>
                                <h3>Paste your discovery notes</h3>
                                <p>AI will map customer pains to business outcomes and recommend Freshworks solutions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Build Tab -->
            <div id="tab-build" class="tab-content">
                <div class="module-grid">
                    <div class="glass-card module-panel">
                        <h2>🏗️ Build Input</h2>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">What do you need to configure?</label>
                            <textarea id="build-input" class="form-textarea" rows="6" placeholder="Describe what you need to set up...

Example: 'Set up omnichannel ticketing with email, chat, and phone. Need SLA policies for 4 priority levels. Auto-routing for billing and technical tickets.'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Attachments (Architecture Diagrams, Specs)</label>
                            <input type="file" id="build-file" class="form-input" multiple />
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Product</label>
                            <select id="build-product" class="form-select">
                                <option value="freshdesk">Freshdesk</option>
                                <option value="freshservice">Freshservice</option>
                                <option value="freshsales">Freshsales</option>
                                <option value="freshchat">Freshchat</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="DemoStrategy.generateBuild()">
                            🏗️ Generate Click-Paths
                        </button>
                    </div>
                    <div class="glass-card module-panel">
                        <div class="result-header">
                            <h2>📖 Admin Click-Paths</h2>
                            <div class="result-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.copyResult('build')">📋 Copy</button>
                            </div>
                        </div>
                        <div id="build-result" class="result-content">
                            <div class="empty-state">
                                <div class="empty-state-icon">🏗️</div>
                                <h3>Describe your configuration needs</h3>
                                <p>AI will generate exact admin click-paths referencing Freshworks solution articles.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Script Tab -->
            <div id="tab-script" class="tab-content">
                <div class="module-grid">
                    <div class="glass-card module-panel">
                        <h2>🎬 Script Input</h2>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Demo Duration (minutes)</label>
                            <select id="script-duration" class="form-select">
                                <option value="15">15 minutes</option>
                                <option value="25" selected>25 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">60 minutes</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Key Features to Demo</label>
                            <textarea id="script-features" class="form-textarea" rows="4" placeholder="List the key features to cover...

Example: 'Omnichannel inbox, Freddy AI, SLA tracking, Knowledge base, Automations, Analytics dashboard'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Audience</label>
                            <select id="script-audience" class="form-select">
                                <option value="support-team">Support Team</option>
                                <option value="management">Management / VP</option>
                                <option value="executive">C-Level Executive</option>
                                <option value="technical">Technical / IT Team</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Attachments (Screenshots, Slide Deck)</label>
                            <input type="file" id="script-file" class="form-input" multiple />
                        </div>
                        <button class="btn btn-primary" onclick="DemoStrategy.generateScript()">
                            🎬 Generate Script
                        </button>
                    </div>
                    <div class="glass-card module-panel">
                        <div class="result-header">
                            <h2>📝 Click-Track-Talk</h2>
                            <div class="result-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.copyResult('script')">📋 Copy</button>
                            </div>
                        </div>
                        <div id="script-result" class="result-content">
                            <div class="empty-state">
                                <div class="empty-state-icon">🎬</div>
                                <h3>Configure your demo parameters</h3>
                                <p>AI will generate a timed Click-Track-Talk framework for your presentation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
            });
        });
    },

    async analyzeDiscovery() {
        const input = document.getElementById('discovery-input').value;
        const fileInput = document.getElementById('discovery-file');
        const resultEl = document.getElementById('discovery-result');

        if (!input.trim() && (!fileInput.files || fileInput.files.length === 0)) {
            window.App.showToast('Please paste discovery notes or attach a file', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height: 200px;"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `You are a Freshworks Solutions Engineer AI assistant. Analyze this discovery transcript and any attached documents:\n1. Identify key customer pains\n2. Map each pain to a business outcome\n3. Recommend specific Freshworks products and features\n4. Write a value proposition statement\n\nTranscript:\n${input}`,
            'You are an expert Freshworks Solutions Engineer. Always reference specific Freshworks products and features.',
            attachments
        );

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${result.text}</div>
                <div class="result-meta">${badge}</div>
            `;
        } else if (result.demo) {
            resultEl.innerHTML = `
                <div class="result-body">${DemoResponses.demoStrategy.discovery}</div>
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

    async generateBuild() {
        const input = document.getElementById('build-input').value;
        const product = document.getElementById('build-product').value;
        const fileInput = document.getElementById('build-file');
        const resultEl = document.getElementById('build-result');

        if (!input.trim() && (!fileInput.files || fileInput.files.length === 0)) {
            window.App.showToast('Describe what you need to configure or attach specs', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height: 200px;"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `Generate exact admin click-paths for ${product} to configure: ${input}. Use any attached diagrams or specs for context. Format as a step-by-step guide with Admin menu paths.`,
            'You are a Freshworks admin configuration expert. Provide exact navigation paths like: Admin → Settings → ...',
            attachments
        );

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${result.text}</div>
                <div class="result-meta">${badge}</div>
            `;
        } else if (result.demo) {
            resultEl.innerHTML = `
                <div class="result-body">${DemoResponses.demoStrategy.build}</div>
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

    async generateScript() {
        const duration = document.getElementById('script-duration').value;
        const features = document.getElementById('script-features').value;
        const audience = document.getElementById('script-audience').value;
        const fileInput = document.getElementById('script-file');
        const resultEl = document.getElementById('script-result');

        resultEl.innerHTML = '<div class="loading-shimmer" style="height: 200px;"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `Generate a ${duration}-minute demo script for a ${audience} audience covering: ${features || 'standard Freshdesk features'}. Use any attached screenshots or slides as visual cues. Use the Click-Track-Talk framework with columns: Time, Click (what to show), Track (key feature), Talk (what to say).`,
            'You are a Freshworks demo expert. Create engaging, timed demo scripts.',
            attachments
        );

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${result.text}</div>
                <div class="result-meta">${badge}</div>
            `;
        } else if (result.demo) {
            resultEl.innerHTML = `
                <div class="result-body">${DemoResponses.demoStrategy.script}</div>
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

    copyResult(type) {
        const el = document.getElementById(`${type}-result`);
        navigator.clipboard.writeText(el.innerText).then(() => {
            window.App.showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            // Clipboard fallback
            const range = document.createRange();
            range.selectNodeContents(el);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
            window.App.showToast('Copied to clipboard!', 'success');
        });
    },

    shareToSlack(type) {
        const el = document.getElementById(`${type}-result`);
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`📊 *Demo Strategy — Discovery Analysis*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    }
};

window.DemoStrategy = DemoStrategy;
export default DemoStrategy;
