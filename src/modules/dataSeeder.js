// ========================================
// Module 7: Intelligent Data Seeder
// ========================================

import GeminiService from '../services/geminiService.js';
import FreshworksService from '../services/freshworksService.js';

const DataSeeder = {
    generatedData: null,

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🌱 Intelligent Data Seeder</h1>
                <p class="module-desc">Populate trial instances with industry-relevant dummy data via API.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>⚙️ Configuration</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Industry</label>
                        <select id="seed-industry" class="form-select">
                            <option value="fintech">FinTech / Payments</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="ecommerce">eCommerce / Retail</option>
                            <option value="saas">SaaS / Technology</option>
                            <option value="education">Education</option>
                            <option value="manufacturing">Manufacturing</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Data Type</label>
                        <select id="seed-type" class="form-select">
                            <option value="tickets">Support Tickets</option>
                            <option value="contacts">Contacts</option>
                            <option value="companies">Companies</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Number of Records</label>
                        <select id="seed-count" class="form-select">
                            <option value="5" selected>5 records</option>
                            <option value="10">10 records</option>
                            <option value="25">25 records</option>
                            <option value="50">50 records</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Custom Scenario (optional)</label>
                        <input id="seed-scenario" class="form-input" placeholder="e.g., FinTech refund issues, HIPAA compliance tickets" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Schema / Example JSON)</label>
                         <input type="file" id="seed-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="DataSeeder.generate()" style="width:100%">
                        🌱 Generate Data
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📦 Generated Data</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="DataSeeder.copyJSON()">📋 Copy JSON</button>
                            <button class="btn btn-sm btn-secondary" onclick="DataSeeder.downloadJSON()">📥 Download</button>
                        </div>
                    </div>
                    <div id="seed-preview" class="json-preview" style="min-height:200px;">
                        <span style="color:var(--text-tertiary)">// Generated data will appear here...</span>
                    </div>
                </div>
            </div>

            <div id="seed-push-section" class="glass-card module-panel module-full" style="margin-top:var(--space-6);display:none;">
                <h2>🚀 Push to Freshworks Instance</h2>
                <div class="stat-cards">
                    <div class="stat-card">
                        <div class="stat-value" id="push-total">0</div>
                        <div class="stat-label">Total Records</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="push-success" style="background:var(--success);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">0</div>
                        <div class="stat-label">Successful</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="push-failed" style="background:var(--danger);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">0</div>
                        <div class="stat-label">Failed</div>
                    </div>
                </div>
                <div id="push-status" style="margin-bottom:var(--space-4);color:var(--text-secondary);font-size:var(--font-sm);"></div>
                <button class="btn btn-success btn-lg" onclick="DataSeeder.pushToInstance()" id="push-btn">
                    🚀 Push to Instance
                </button>
            </div>
        </div>`;
    },

    init() { },

    async generate() {
        const industry = document.getElementById('seed-industry').value;
        const type = document.getElementById('seed-type').value;
        const count = parseInt(document.getElementById('seed-count').value);
        const scenario = document.getElementById('seed-scenario').value;
        const previewEl = document.getElementById('seed-preview');

        previewEl.innerHTML = '<div class="loading-shimmer" style="height:200px"></div>';

        const fileInput = document.getElementById('seed-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate ${count} realistic ${type} for a ${industry} company in valid JSON array format. Each record should have appropriate fields for the Freshworks API.
${scenario ? `Specific scenario: ${scenario}` : ''}

Use any attached examples or schemas to structure the JSON.

For tickets, use fields: subject, description, priority (1-4), status (2=open), type, tags (array).
For contacts, use fields: name, email, phone, company_id, description.
For companies, use fields: name, domains (array), description, industry.

Return ONLY the JSON array, no other text.`;

        const result = await GeminiService.generateContent(prompt, 'Generate realistic data. Return only valid JSON array.', attachments);

        let data;
        if (result.success) {
            try {
                const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                data = JSON.parse(jsonStr);

                const badge = window.App.getAiBadge(result);
                window.App.showToast(`Data generated via ${result.source}`, 'success');
                // Could display badge in UI if needed, for JSON preview it's less standard
            } catch (e) {
                window.App.showToast('AI returned invalid JSON. Please try again.', 'error');
                previewEl.innerHTML = '<div class="error-container">❌ Invalid JSON generated by AI</div>';
                return;
            }
        } else {
            window.App.showToast(result.error || 'Data generation failed', 'error');
            previewEl.innerHTML = `<div class="error-container">❌ ${result.error || 'AI Generation Failed'}</div>`;
            return;
        }

        this.generatedData = data;
        previewEl.textContent = JSON.stringify(data, null, 2);

        // Show push section
        document.getElementById('seed-push-section').style.display = 'block';
        document.getElementById('push-total').textContent = data.length;
        document.getElementById('push-success').textContent = '0';
        document.getElementById('push-failed').textContent = '0';
        document.getElementById('push-status').textContent = 'Ready to push to your Freshworks instance.';
    },

    async pushToInstance() {
        if (!this.generatedData) return;

        if (!FreshworksService.isConnected()) {
            window.App.showToast('Configure Freshworks credentials in Settings first', 'warning');
            return;
        }

        const type = document.getElementById('seed-type').value;
        const btn = document.getElementById('push-btn');
        btn.disabled = true;
        btn.textContent = '⏳ Pushing...';

        let success = 0, failed = 0;

        for (const record of this.generatedData) {
            try {
                let result;
                if (type === 'tickets') {
                    result = await FreshworksService.createTicket(record);
                } else if (type === 'contacts') {
                    result = await FreshworksService.createContact(record);
                }

                if (result && result.success) {
                    success++;
                } else {
                    failed++;
                }
            } catch (err) {
                console.error("Push Error:", err);
                failed++;
            }

            document.getElementById('push-success').textContent = success;
            document.getElementById('push-failed').textContent = failed;
            document.getElementById('push-status').textContent = `Processing ${success + failed}/${this.generatedData.length}...`;

            // Add slight delay to be nice to API rate limits
            await new Promise(r => setTimeout(r, 200));
        }

        btn.disabled = false;
        btn.textContent = '🚀 Push to Instance';

        let msg = `Done! ${success} created, ${failed} failed.`;
        if (failed > 0) msg += " Check console for details.";

        document.getElementById('push-status').textContent = msg;
        window.App.showToast(`Push Complete: ${success} Success, ${failed} Failed`, failed > 0 ? 'warning' : 'success');
    },

    copyJSON() {
        if (!this.generatedData) return;
        window.App.copyToClipboard('seed-preview');
    },

    downloadJSON() {
        if (!this.generatedData) return;
        const blob = new Blob([JSON.stringify(this.generatedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seed-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

window.DataSeeder = DataSeeder;
export default DataSeeder;
