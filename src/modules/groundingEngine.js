// ========================================
// Module 9: Grounding Engine
// ========================================

import GeminiService from '../services/geminiService.js';
import DemoResponses from '../data/demoResponses.js';

const GroundingEngine = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>📚 Grounding Engine</h1>
                <p class="module-desc">RAG backbone for AI accuracy — index knowledge sources to ground all AI responses.</p>
            </div>

            <div class="stat-cards" style="margin-bottom:var(--space-6)">
                <div class="stat-card">
                    <div class="stat-value">6</div>
                    <div class="stat-label">Knowledge Sources</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="background:var(--success);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">4</div>
                    <div class="stat-label">Indexed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="background:var(--warning);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">2</div>
                    <div class="stat-label">Pending</div>
                </div>
            </div>

            <div class="glass-card module-panel module-full" style="margin-bottom:var(--space-6)">
                <div class="result-header">
                    <h2>📂 Knowledge Sources</h2>
                    <button class="btn btn-sm btn-primary" onclick="GroundingEngine.addSource()">+ Add Source</button>
                </div>
                <div id="ge-sources" class="result-content" style="max-height:400px;">
                    <!-- Sources rendered here -->
                </div>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>🔍 Test Grounded Query</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Ask a question grounded in your knowledge sources</label>
                        <textarea id="ge-query" class="form-textarea" rows="3" placeholder="e.g., What SLA options are available in Freshdesk Enterprise?"></textarea>
                    </div>
                    <button class="btn btn-primary" onclick="GroundingEngine.testQuery()">🔍 Test Query</button>
                </div>
                <div class="glass-card module-panel">
                    <h2>💬 Grounded Response</h2>
                    <div id="ge-response" class="result-content">
                        <div class="empty-state">
                            <div class="empty-state-icon">🔍</div>
                            <h3>Ask a question</h3>
                            <p>AI will answer using only your indexed knowledge sources.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() {
        this.renderSources();
    },

    indexedDocs: [],

    addSource() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.txt,.md,.json,.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const processed = await window.App.readFile(file);
            // Simulate indexing by storing base64 data
            this.indexedDocs.push({
                name: file.name,
                mime_type: processed.mimeType,
                data: processed.data
            });

            window.App.showToast(`Indexed ${file.name}`, 'success');
            this.renderSources();
        };
        input.click();
    },

    renderSources() {
        const container = document.getElementById('ge-sources');
        if (!container) return;

        const demoSources = DemoResponses.groundingEngine;
        // Combine demo sources with user-uploaded "indexed" docs
        const allSources = [
            ...demoSources,
            ...this.indexedDocs.map(d => ({
                icon: '📄',
                name: d.name,
                type: 'Document',
                items: '1 doc',
                status: 'Indexed',
                lastIndexed: 'Just now'
            }))
        ];

        container.innerHTML = `
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid var(--border-primary);">
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Source</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Type</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Items</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Status</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Last Indexed</th>
                    </tr>
                </thead>
                <tbody>
                    ${allSources.map(s => `
                        <tr style="border-bottom:1px solid var(--border-muted);">
                            <td style="padding:var(--space-3);">
                                <div style="font-weight:600;">${s.icon} ${s.name}</div>
                                <div style="font-size:var(--font-xs);color:var(--text-tertiary);">${s.url || ''}</div>
                            </td>
                            <td style="padding:var(--space-3);color:var(--text-secondary);">${s.type}</td>
                            <td style="padding:var(--space-3);color:var(--text-secondary);">${s.items}</td>
                            <td style="padding:var(--space-3);">
                                <span class="chip ${s.status === 'Indexed' ? 'selected' : ''}" style="font-size:var(--font-xs);">
                                    ${s.status === 'Indexed' ? '✅' : '⏳'} ${s.status}
                                </span>
                            </td>
                            <td style="padding:var(--space-3);color:var(--text-tertiary);font-size:var(--font-sm);">${s.lastIndexed}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    async testQuery() {
        const query = document.getElementById('ge-query').value;
        const responseEl = document.getElementById('ge-response');

        if (!query.trim()) {
            window.App.showToast('Enter a question', 'warning');
            return;
        }

        responseEl.innerHTML = '<div class="loading-shimmer" style="height:200px"></div>';

        // Prepare attachments from indexed docs
        const attachments = this.indexedDocs.map(d => ({
            mimeType: d.mime_type,
            data: d.data
        }));

        const result = await GeminiService.generateContent(
            `Answer this question using Freshworks product knowledge and any attached context: ${query}. Cite specific features and documentation.`,
            'You are a Freshworks knowledge base. Answer accurately with specific product details.',
            attachments
        );

        if (result.demo || !result.success) {
            responseEl.innerHTML = `
                <div style="color:var(--text-primary);line-height:1.6;">
                    <p><strong>📚 Grounded Response (Demo):</strong></p>
                    <p>Based on the indexed knowledge sources, Freshdesk Enterprise offers comprehensive SLA management including:</p>
                    <ul style="margin:var(--space-3) 0;padding-left:var(--space-5);">
                        <li>Multiple SLA policies with priority-based rules</li>
                        <li>Business hour and calendar hour SLAs</li>
                        <li>Escalation rules with up to 4 levels</li>
                        <li>SLA violation alerts via email and Slack</li>
                        <li>SLA performance analytics dashboard</li>
                    </ul>
                    <p style="font-size:var(--font-sm);color:var(--text-tertiary);margin-top:var(--space-4);">
                        📖 Sources: Freshdesk Admin Guide (Section 5.2), Freshdesk API Docs, G2 Reviews
                    </p>
                </div>`;
        } else {
            responseEl.innerHTML = `<div style="line-height:1.6;">${result.text}</div>`;
        }
    }
};

window.GroundingEngine = GroundingEngine;
export default GroundingEngine;
