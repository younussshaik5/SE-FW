// ========================================
// Module 9: Grounding Engine
// ========================================

import GeminiService from '../services/geminiService.js';

const GroundingEngine = {
    // Enhanced document processing for better RAG
    indexedDocs: [],
    documentChunks: [], // For semantic search simulation

    // Process document text into chunks for better retrieval
    processDocumentChunks(text, chunkSize = 500) {
        const words = text.split(/\s+/);
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        return chunks;
    },

    // Simple semantic search simulation (keyword-based)
    searchDocuments(query, topK = 5) {
        const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        const scores = [];

        this.documentChunks.forEach((chunk, index) => {
            let score = 0;
            const chunkText = chunk.text.toLowerCase();

            queryWords.forEach(word => {
                if (chunkText.includes(word)) {
                    score += 1;
                    // Boost score for exact phrase matches
                    if (chunkText.includes(query.toLowerCase())) {
                        score += 2;
                    }
                }
            });

            if (score > 0) {
                scores.push({ chunk, score, index });
            }
        });

        // Sort by score and return top K
        return scores.sort((a, b) => b.score - a.score).slice(0, topK);
    },

    // Add web page source
    async addWebSource(url) {
        try {
            const response = await fetch(url);
            const text = await response.text();

            // Extract main content (simplified)
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const mainContent = doc.querySelector('main') || doc.querySelector('article') || doc.body;
            const content = mainContent.textContent.substring(0, 5000); // Limit size

            this.indexedDocs.push({
                name: url,
                mime_type: 'text/html',
                data: btoa(unescape(encodeURIComponent(content))),
                url: url
            });

            // Process into chunks
            const chunks = this.processDocumentChunks(content);
            chunks.forEach(chunkText => {
                this.documentChunks.push({
                    text: chunkText,
                    source: url,
                    docIndex: this.indexedDocs.length - 1
                });
            });

            window.App.showToast(`Indexed web page: ${url}`, 'success');
            this.renderSources();
        } catch (error) {
            window.App.showToast(`Failed to index web page: ${error.message}`, 'error');
        }
    },

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>📚 Grounding Engine</h1>
                <p class="module-desc">RAG backbone for AI accuracy — index knowledge sources to ground all AI responses.</p>
            </div>

            <div class="stat-cards" style="margin-bottom:var(--space-6)">
                <div class="stat-card">
                    <div class="stat-value" id="ge-total-sources">0</div>
                    <div class="stat-label">Knowledge Sources</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="background:var(--success);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" id="ge-indexed-chunks">0</div>
                    <div class="stat-label">Indexed Chunks</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="background:var(--warning);-webkit-background-clip:text;-webkit-text-fill-color:transparent;" id="ge-searchable">0</div>
                    <div class="stat-label">Searchable</div>
                </div>
            </div>

            <div class="glass-card module-panel module-full" style="margin-bottom:var(--space-6)">
                <div class="result-header">
                    <h2>📂 Knowledge Sources</h2>
                    <div style="display:flex; gap:var(--space-2);">
                        <button class="btn btn-sm btn-primary" onclick="GroundingEngine.addSource()">+ Add File</button>
                        <button class="btn btn-sm btn-secondary" onclick="GroundingEngine.addWebSourcePrompt()">🌐 Add Web Page</button>
                    </div>
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
        this.updateStats();
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
            // Decode base64 data to text
            const text = atob(processed.data);

            // Store document
            this.indexedDocs.push({
                name: file.name,
                mime_type: processed.mimeType,
                data: processed.data
            });

            // Process into chunks for semantic search
            const chunks = this.processDocumentChunks(text);
            chunks.forEach(chunkText => {
                this.documentChunks.push({
                    text: chunkText,
                    source: file.name,
                    docIndex: this.indexedDocs.length - 1
                });
            });

            window.App.showToast(`Indexed ${file.name} (${chunks.length} chunks)`, 'success');
            this.renderSources();
            this.updateStats();
        };
        input.click();
    },

    addWebSourcePrompt() {
        const url = prompt('Enter URL to index (e.g., https://example.com/docs):');
        if (url && url.trim()) {
            this.addWebSource(url.trim());
        }
    },

    updateStats() {
        const totalSourcesEl = document.getElementById('ge-total-sources');
        const indexedChunksEl = document.getElementById('ge-indexed-chunks');
        const searchableEl = document.getElementById('ge-searchable');

        if (totalSourcesEl) totalSourcesEl.textContent = this.indexedDocs.length;
        if (indexedChunksEl) indexedChunksEl.textContent = this.documentChunks.length;
        if (searchableEl) searchableEl.textContent = this.documentChunks.length > 0 ? 'Yes' : 'No';
    },

    renderSources() {
        const container = document.getElementById('ge-sources');
        if (!container) return;

        // Render user-uploaded "indexed" docs with chunk info
        const allSources = this.indexedDocs.map((d, index) => {
            const chunkCount = this.documentChunks.filter(c => c.docIndex === index).length;
            return {
                icon: '📄',
                name: d.name,
                type: d.mime_type.includes('html') ? 'Web Page' : 'Document',
                items: `${chunkCount} chunks`,
                status: 'Indexed',
                lastIndexed: 'Just now',
                url: d.url || ''
            };
        });

        if (allSources.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📂</div>
                    <h3>No knowledge sources yet</h3>
                    <p>Add documents or web pages to build your RAG knowledge base.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="border-bottom:1px solid var(--border-primary);">
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Source</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Type</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Chunks</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Status</th>
                        <th style="text-align:left;padding:var(--space-3);color:var(--text-secondary);font-weight:500;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allSources.map((s, i) => `
                        <tr style="border-bottom:1px solid var(--border-muted);">
                            <td style="padding:var(--space-3);">
                                <div style="font-weight:600;">${s.icon} ${s.name}</div>
                                <div style="font-size:var(--font-xs);color:var(--text-tertiary);">${s.url}</div>
                            </td>
                            <td style="padding:var(--space-3);color:var(--text-secondary);">${s.type}</td>
                            <td style="padding:var(--space-3);color:var(--text-secondary);">${s.items}</td>
                            <td style="padding:var(--space-3);">
                                <span class="chip selected" style="font-size:var(--font-xs);">
                                    ✅ ${s.status}
                                </span>
                            </td>
                            <td style="padding:var(--space-3);">
                                <button class="btn btn-sm btn-danger" onclick="GroundingEngine.removeSource(${i})">Remove</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    removeSource(index) {
        if (!confirm('Remove this source and all its chunks?')) return;

        const doc = this.indexedDocs[index];

        // Remove chunks for this document
        this.documentChunks = this.documentChunks.filter(c => c.docIndex !== index);

        // Update docIndex for remaining chunks
        this.documentChunks.forEach(c => {
            if (c.docIndex > index) c.docIndex--;
        });

        // Remove document
        this.indexedDocs.splice(index, 1);

        window.App.showToast('Source removed', 'success');
        this.renderSources();
        this.updateStats();
    },

    async testQuery() {
        const query = document.getElementById('ge-query').value;
        const responseEl = document.getElementById('ge-response');

        if (!query.trim()) {
            window.App.showToast('Enter a question', 'warning');
            return;
        }

        if (this.documentChunks.length === 0) {
            window.App.showToast('No indexed knowledge sources. Add documents first.', 'warning');
            return;
        }

        responseEl.innerHTML = '<div class="loading-shimmer" style="height:200px"></div>';

        // Perform semantic search to find relevant chunks
        const searchResults = this.searchDocuments(query, 5);

        if (searchResults.length === 0) {
            responseEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No relevant information found</h3>
                    <p>The query doesn't match any indexed content. Try a different question or add more sources.</p>
                </div>
            `;
            return;
        }

        // Build context from top search results
        const context = searchResults.map((result, i) => {
            return `Source ${i + 1} (${result.chunk.source}):
${result.chunk.text}

`;
        }).join('\n');

        // Prepare attachments from indexed docs
        const attachments = this.indexedDocs.map(d => ({
            mimeType: d.mime_type,
            data: d.data
        }));

        const result = await GeminiService.generateContent(
            `Answer this question using ONLY the following indexed knowledge sources. Cite specific sources for each claim.

**RELEVANT CONTEXT FROM KNOWLEDGE BASE:**
${context}

**USER QUESTION:**
${query}

**REQUIRED OUTPUT STRUCTURE WITH 10-30 DETAILED POINTS:**

## Executive Summary (10-15 points)
- **Direct Answer:** (3-5 points, citing sources)
- **Key Findings:** (3-5 points, citing sources)
- **Relevance to Question:** (2-3 points)
- **Confidence Level:** (with rationale based on source quality)

## Detailed Response (20-25 points)
| Aspect | Detail | Evidence (Source) | Freshworks Feature | Documentation Reference |
| --- | --- | --- | --- | --- |
(10-15 aspects with detailed information, citing specific sources)

## Source Analysis (10-15 points)
| Source | Key Information | Relevance | Reliability | Application |
| --- | --- | --- | --- | --- |
(5-7 sources with detailed analysis)

## Feature Specifications (15-20 points)
| Feature | Description | Capability | Limitations | Workarounds |
| --- | --- | --- | --- | --- |
(5-7 features with detailed specifications)

## Implementation Details (10-15 points)
| Step | Action | Prerequisites | Configuration | Validation |
| --- | --- | --- | --- | --- |
(5-7 implementation steps with detailed actions)

## Best Practices (10-15 points)
| Practice | Rationale | Implementation | Benefits | Common Pitfalls |
| --- | --- | --- | --- | --- |
(5-7 best practices with detailed explanations)

## Troubleshooting (10-15 points)
| Issue | Symptoms | Root Cause | Solution | Prevention |
| --- | --- | --- | --- | --- |
(5-7 common issues with detailed troubleshooting)

**IMPORTANT:**
- Use ONLY information from the provided context
- Cite specific sources for each claim (e.g., "Source 1", "Source 2")
- If information is not in the context, state "Not found in indexed sources"
- Reference official Freshworks documentation where possible
- Ensure output is highly structured with Markdown tables and 10-30 detailed points per section`,
            'You are a Freshworks knowledge base expert. Answer accurately using ONLY the provided indexed knowledge sources. Cite sources for every claim. If information is not in the sources, state that clearly.',
            attachments
        );

        if (result.success) {
            // Add source citations to the response
            const sourceCitations = searchResults.map((r, i) =>
                `[${i + 1}] ${r.chunk.source} (Relevance Score: ${r.score})`
            ).join('\n');

            responseEl.innerHTML = `
                <div class="result-body">${window.MarkdownRenderer.parse(result.text)}</div>
                <div style="margin-top:var(--space-4); padding:var(--space-3); background:var(--bg-secondary); border-radius:var(--radius-md);">
                    <strong>📚 Sources Used:</strong><br>
                    <pre style="margin:0; white-space:pre-wrap; font-size:var(--font-sm);">${sourceCitations}</pre>
                </div>
            `;
        } else {
            responseEl.innerHTML = `
                <div class="error-container" style="padding:var(--space-4); background:rgba(239,68,68,0.1); border-radius:var(--radius-md); border:1px solid rgba(239,68,68,0.2);">
                    <div style="color:#f87171; font-weight:600; margin-bottom:var(--space-2);">❌ AI Generation Failed</div>
                    <div style="color:var(--text-secondary); font-size:var(--font-sm);">${result.error || 'Unknown error occurred'}</div>
                </div>
            `;
        }
    }
};

window.GroundingEngine = GroundingEngine;
export default GroundingEngine;
