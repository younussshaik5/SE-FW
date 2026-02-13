// ========================================
// FDK App Builder (Intelligent Version)
// ========================================

import GeminiService from '../services/geminiService.js';
import FdkKnowledge from '../data/fdkKnowledge.js';

const FdkBuilder = {
    state: {
        step: 0, // 0: Input, 1: Analysis, 2: Generation, 3: Done
        analysis: null,
        logs: [],
        generatedFiles: {}
    },

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🔧 Intelligent FDK Builder</h1>
                <p class="module-desc">Architect and build complex Freshworks apps with logic-driven AI.</p>
            </div>

            <!-- Progress Tracker -->
            <div class="progress-steps" style="margin-bottom:var(--space-6)">
                <div class="progress-step ${this.state.step >= 0 ? 'active' : ''} ${this.state.step > 0 ? 'completed' : ''}">
                    <div class="step-dot">1</div>
                    <div class="step-label">Requirements</div>
                </div>
                <div class="step-connector ${this.state.step > 0 ? 'completed' : ''}"></div>
                <div class="progress-step ${this.state.step >= 1 ? 'active' : ''} ${this.state.step > 1 ? 'completed' : ''}">
                    <div class="step-dot">2</div>
                    <div class="step-label">Analysis</div>
                </div>
                <div class="step-connector ${this.state.step > 1 ? 'completed' : ''}"></div>
                <div class="progress-step ${this.state.step >= 2 ? 'active' : ''} ${this.state.step > 2 ? 'completed' : ''}">
                    <div class="step-dot">3</div>
                    <div class="step-label">Generation</div>
                </div>
                <div class="step-connector ${this.state.step > 2 ? 'completed' : ''}"></div>
                <div class="progress-step ${this.state.step >= 3 ? 'active' : ''}">
                    <div class="step-dot">4</div>
                    <div class="step-label">Result</div>
                </div>
            </div>

            <!-- Step 1: Input -->
            <div id="step-input" class="glass-card module-panel" style="display:${this.state.step === 0 ? 'block' : 'none'}">
                <h2>📝 App Requirements</h2>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Describe your app functionality in detail</label>
                    <textarea id="fdk-desc" class="form-textarea" rows="6" placeholder="e.g., I need a serverless app for Freshdesk that listens for 'High Priority' ticket creation events. When triggered, it should query an external CRM API (https://api.crm.com) to get customer details and add a private note to the ticket with those details."></textarea>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Attachments (PRD / Specs)</label>
                    <input type="file" id="fdk-file" class="form-input" multiple />
                </div>
                <button class="btn btn-primary" onclick="FdkBuilder.startAnalysis()">🔍 Analyze Requirements</button>
            </div>

            <!-- Step 2: Analysis Result -->
            <div id="step-analysis" class="module-grid" style="display:${this.state.step === 1 ? 'grid' : 'none'}">
                <div class="glass-card module-panel">
                    <h2>🧠 Architecture Plan</h2>
                    <div id="analysis-content">
                        ${this.state.analysis ? this.renderAnalysis(this.state.analysis) : '<div class="loading-shimmer" style="height:200px"></div>'}
                    </div>
                    <div style="margin-top:var(--space-4);display:flex;gap:var(--space-3)">
                        <button class="btn btn-primary" onclick="FdkBuilder.startGeneration()">⚙️ Generate Code</button>
                        <button class="btn btn-secondary" onclick="FdkBuilder.reset()">Modify</button>
                    </div>
                </div>
                 <div class="glass-card module-panel">
                    <h2>📋 Components Identified</h2>
                    <ul id="analysis-components" style="list-style:none;padding:0;">
                         ${this.state.analysis ? this.renderComponentsList(this.state.analysis) : ''}
                    </ul>
                </div>
            </div>

            <!-- Step 3: Generation Logs -->
            <div id="step-generation" class="glass-card module-panel" style="display:${this.state.step === 2 ? 'block' : 'none'}">
                <h2>⚙️ Building App...</h2>
                <div id="build-logs" style="background:#0d1117;padding:var(--space-4);border-radius:var(--radius-md);font-family:monospace;height:300px;overflow-y:auto;color:#7ee787;">
                    ${this.state.logs.map(l => `<div>> ${l}</div>`).join('')}
                </div>
            </div>

            <!-- Step 4: Result -->
            <div id="step-result" class="glass-card module-panel" style="display:${this.state.step === 3 ? 'block' : 'none'}">
                <div class="result-header">
                    <h2>🎉 App Generated Successfully</h2>
                    <div class="result-actions">
                        <button class="btn btn-sm btn-primary" onclick="FdkBuilder.downloadZip()">📥 Download Bundle (JSON)</button>
                        <button class="btn btn-sm btn-secondary" onclick="FdkBuilder.reset()">Start Over</button>
                    </div>
                </div>
                
                <div class="tabs" style="margin-bottom:var(--space-4)">
                    <button class="tab active" onclick="FdkBuilder.showFile('manifest')">manifest.json</button>
                    <button class="tab" onclick="FdkBuilder.showFile('server')">server.js</button>
                    <button class="tab" onclick="FdkBuilder.showFile('html')">index.html</button>
                    <button class="tab" onclick="FdkBuilder.showFile('js')">app.js</button>
                     <button class="tab" onclick="FdkBuilder.showFile('iparams')">iparams.json</button>
                </div>
                
                <div id="code-viewer" class="code-output" style="min-height:400px;">
                    ${this.state.generatedFiles.manifest ? window.MarkdownRenderer.parse('```json\n' + this.state.generatedFiles.manifest + '\n```') : ''}
                </div>
            </div>
        </div>`;
    },

    renderAnalysis(analysis) {
        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);margin-bottom:var(--space-4)">
                <div>
                    <strong>Product:</strong> <span class="chip">${analysis.product}</span>
                </div>
                <div>
                    <strong>Complexity:</strong> <span class="chip" style="background:${analysis.complexity === 'high' ? 'var(--danger-glow)' : 'var(--bg-tertiary)'}">${analysis.complexity}</span>
                </div>
            </div>
            <p style="color:var(--text-secondary);margin-bottom:var(--space-4)">${analysis.reasoning}</p>
        `;
    },

    renderComponentsList(analysis) {
        let html = '';
        if (analysis.locations?.length) {
            html += `<li><strong>📍 Locations:</strong> ${analysis.locations.join(', ')}</li>`;
        }
        if (analysis.events?.length) {
            html += `<li><strong>⚡ Events:</strong> ${analysis.events.join(', ')}</li>`;
        }
        if (analysis.apis?.length) {
            html += `<li><strong>🔗 External APIs:</strong> ${analysis.apis.join(', ')}</li>`;
        }
        if (analysis.features?.includes('data_storage')) {
            html += `<li><strong>💾 Data Storage:</strong> db.set / db.get</li>`;
        }
        return html;
    },

    init() { },

    async startAnalysis() {
        const desc = document.getElementById('fdk-desc').value;
        if (!desc.trim()) {
            window.App.showToast('Please describe your app', 'warning');
            return;
        }

        this.state.step = 1;
        this.updateUI();

        // Simulate Analysis or call AI
        this.addLog('Analyzing requirements...');

        const prompt = FdkKnowledge.prompts.analyzeParams + desc;
        const result = await GeminiService.generateContent(prompt, "You are a Senior FDK Architect. Output valid JSON only.", []);

        if (result.success) {
            try {
                const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                this.state.analysis = JSON.parse(jsonStr);
                this.addLog(`AI Analysis complete via ${result.source}`);
            } catch (e) {
                console.error("JSON Parse Error", e);
                this.addLog('❌ AI returned invalid JSON analysis. Please refine your description.');
                this.state.step = 0;
                this.updateUI();
                return;
            }
        } else {
            this.addLog(`❌ AI Analysis Failed: ${result.error || 'Unknown error'}`);
            this.state.step = 0;
            this.updateUI();
            return;
        }

        this.updateUI();
    },

    async startGeneration() {
        this.state.step = 2;
        this.updateUI();
        this.state.logs = [];

        await this.log('🚀 Starting generation process...');
        await this.log(`📋 Plan: ${this.state.analysis.product} app with ${this.state.analysis.locations.join(', ')}`);

        // 1. Generate Manifest
        await this.log('📄 Generating manifest.json...');
        await this.generateFile('manifest',
            `Generate manifest.json for ${this.state.analysis.product} with locations: ${this.state.analysis.locations.join(', ')}. 
             Include whitelisted-domains: ${this.state.analysis.apis?.join(', ')}.
             Include events: ${this.state.analysis.events?.join(', ')}.
             Use best practices. Return ONLY JSON.`);

        // 2. Generate Server (if needed)
        if (this.state.analysis.locations?.includes('serverless_app') || this.state.analysis.events?.length > 0) {
            await this.log('⚡ Generating server/server.js...');
            await this.generateFile('server',
                `Generate server.js for Freshworks serverless app.
                 Handlers needed: ${this.state.analysis.events?.join(', ')}.
                 Logic: ${this.state.analysis.reasoning}.
                 Use modern JS. Return ONLY code.`);
        } else {
            await this.log('⏭️ Skipping server.js (Frontend only app)');
        }

        // 3. Generate Frontend
        if (this.state.analysis.locations?.some(l => l.includes('sidebar') || l.includes('page'))) {
            await this.log('🎨 Generating app/index.html...');
            await this.generateFile('html',
                `Generate index.html for Freshworks frontend app.
                 Include: Freshworks SDK script, styles, minimal UI based on requirement.
                 Return ONLY HTML.`);

            await this.log('📜 Generating app/app.js...');
            await this.generateFile('js',
                `Generate app.js for Freshworks frontend.
                 Initialize client.
                 Implement logic for: ${this.state.analysis.reasoning}.
                 Use client.request or client.db if mentioned.
                 Return ONLY JS.`);
        }

        // 4. Iparams
        await this.log('⚙️ Generating config/iparams.json...');
        await this.generateFile('iparams',
            `Generate iparams.json.
             If APIs are used, ask for API Key.
             If domain is needed, ask for Domain.
             Return ONLY JSON.`);

        await this.log('✅ Build Complete!');
        setTimeout(() => {
            this.state.step = 3;
            this.updateUI();
        }, 1000);
    },

    async generateFile(type, prompt) {
        const result = await GeminiService.generateContent(prompt, "You are a code generator. Output only the file content. No markdown blocks if possible.");
        let content = result.text || '// Error generating code';

        // Clean markdown
        if (type === 'manifest' || type === 'iparams') {
            content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else {
            content = content.replace(/```\w*\n?/g, '').replace(/```\n?/g, '').trim();
        }

        this.state.generatedFiles[type] = content;
        await new Promise(r => setTimeout(r, 800)); // Simul delay
    },

    async log(msg) {
        this.state.logs.push(msg);
        this.updateUI(); // Inefficient but functional for this scale
        // Scroll to bottom
        const logEl = document.getElementById('build-logs');
        if (logEl) logEl.scrollTop = logEl.scrollHeight;
        await new Promise(r => setTimeout(r, 100));
    },

    reset() {
        this.state.step = 0;
        this.state.analysis = null;
        this.state.generatedFiles = {};
        this.state.logs = [];
        this.updateUI();
    },

    showFile(type) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        let content = this.state.generatedFiles[type] || '// File not created';
        let lang = 'javascript';
        if (type === 'manifest' || type === 'iparams') lang = 'json';
        if (type === 'html') lang = 'html';

        const view = document.getElementById('code-viewer');
        view.innerHTML = window.MarkdownRenderer.parse('```' + lang + '\n' + content + '\n```');
    },

    downloadZip() {
        // Simple text download for now as prototype
        const manifest = this.state.generatedFiles.manifest;
        if (!manifest) return;

        const blob = new Blob([JSON.stringify(this.state.generatedFiles, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fdk-app-bundle.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.App.showToast('Bundle JSON downloaded!', 'success');
    },

    updateUI() {
        // Re-render whole module container
        const container = document.getElementById('module-container');
        if (container) container.innerHTML = this.render();

        // Restore scroll position of logs if generating
        if (this.state.step === 2) {
            const logEl = document.getElementById('build-logs');
            if (logEl) logEl.scrollTop = logEl.scrollHeight;
        }
    }
};

window.FdkBuilder = FdkBuilder;
export default FdkBuilder;
