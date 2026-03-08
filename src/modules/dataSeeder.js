// ========================================
// Module 7: Intelligent Data Seeder
// ========================================

import GeminiService from '../services/geminiService.js';
import FreshworksService from '../services/freshworksService.js';

const DataSeeder = {
    generatedData: null,

    // Validation rules for different data types
    validationRules: {
        tickets: {
            required: ['subject', 'description', 'priority', 'status'],
            priority: ['1', '2', '3', '4'],
            status: ['Open', 'Pending', 'Resolved', 'Closed']
        },
        contacts: {
            required: ['name', 'email'],
            emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        companies: {
            required: ['name'],
            nameMinLength: 3
        }
    },

    // Validate generated data
    validateData(data, type) {
        const rules = this.validationRules[type];
        if (!rules) return { valid: true, errors: [] };

        const errors = [];

        data.forEach((record, index) => {
            // Check required fields
            rules.required.forEach(field => {
                if (!record[field] || record[field].toString().trim() === '') {
                    errors.push(`Record ${index + 1}: Missing required field '${field}'`);
                }
            });

            // Type-specific validation
            if (type === 'tickets') {
                if (record.priority && !rules.priority.includes(record.priority.toString())) {
                    errors.push(`Record ${index + 1}: Invalid priority '${record.priority}'`);
                }
                if (record.status && !rules.status.includes(record.status)) {
                    errors.push(`Record ${index + 1}: Invalid status '${record.status}'`);
                }
            }

            if (type === 'contacts') {
                if (record.email && !rules.emailRegex.test(record.email)) {
                    errors.push(`Record ${index + 1}: Invalid email format '${record.email}'`);
                }
            }

            if (type === 'companies') {
                if (record.name && record.name.length < rules.nameMinLength) {
                    errors.push(`Record ${index + 1}: Company name too short (min ${rules.nameMinLength} chars)`);
                }
            }
        });

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    // Fix common validation issues
    fixData(data, type) {
        return data.map(record => {
            const fixed = { ...record };

            // Fix tickets
            if (type === 'tickets') {
                if (!fixed.priority) fixed.priority = '2';
                if (!fixed.status) fixed.status = 'Open';
                if (fixed.description && fixed.description.length < 10) {
                    fixed.description = fixed.description + ' This is a detailed description of the issue with more context and information.';
                }
            }

            // Fix contacts
            if (type === 'contacts') {
                if (fixed.email && !this.validationRules.contacts.emailRegex.test(fixed.email)) {
                    // Generate a valid email from name
                    const namePart = fixed.name ? fixed.name.toLowerCase().replace(/\s+/g, '.') : 'user';
                    fixed.email = `${namePart}@example.com`;
                }
            }

            // Fix companies
            if (type === 'companies') {
                if (fixed.name && fixed.name.length < 3) {
                    fixed.name = fixed.name + ' Corp';
                }
            }

            return fixed;
        });
    },

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

        const prompt = `Generate an Exhaustive Realistic Dataset for Freshworks Instance with 10-30 Detailed Points per Record:

Industry: ${industry}
Data Type: ${type}
Count: ${count}
Scenario: ${scenario || 'Standard enterprise scenario'}

**Requirements:**
1. Generate ${count} highly realistic records with 10-30 detailed data points per record
2. Ensure diversity in data (names, scenarios, dates, statuses, etc.)
3. Include all standard fields plus 5+ custom fields per record
4. Reflect real enterprise complexity with variations
5. Use industry-specific terminology and scenarios

**Schema Requirements with 10-30 Points:**

For Tickets (15-25 points per record):
- subject (realistic, scenario-specific)
- description (multi-paragraph, 3-5 paragraphs with details)
- priority (1-4 with realistic distribution)
- status (2-5 different statuses across dataset)
- type (5-7 different types)
- tags (array, 3-5 tags per ticket)
- custom_fields (JSON with 5+ fields):
  - customer_segment (enterprise/mid-market/smb)
  - product_area (billing/support/technical)
  - escalation_level (1-5)
  - sla_breach_risk (high/medium/low)
  - estimated_resolution_time (hours)
  - business_impact (revenue/critical/operational)
  - affected_users (number)
  - root_cause_category
  - workaround_available (boolean)
  - customer_satisfaction_impact (1-10)

For Contacts (10-15 points per record):
- name (realistic, diverse)
- email (corporate domain)
- phone (formatted)
- company_id (reference)
- description (background, 2-3 sentences)
- job_title (role-specific)
- twitter_id (optional)
- department (5-7 different departments)
- location (city, country)
- timezone
- language
- preferred_contact_method
- last_contact_date
- lead_score (1-100)

For Companies (12-18 points per record):
- name (realistic enterprise names)
- domains (array, 1-3 domains)
- description (company background, 2-3 sentences)
- industry (from ${industry})
- health_score (1-10)
- renewal_date (future dates)
- annual_revenue (realistic ranges)
- employee_count (realistic ranges)
- website
- phone
- address (city, state, country)
- contract_value (ARR)
- contract_start_date
- contract_end_date
- account_owner
- tier (enterprise/premium/standard)
- region (NA/EMEA/APAC)
- strategic_account (boolean)

**Data Quality Requirements:**
- 10-30 unique data points per record
- Realistic variation across all records
- Industry-specific scenarios and terminology
- Proper data types (strings, numbers, dates, booleans, arrays)
- No duplicate records
- Consistent but diverse patterns

Return ONLY the JSON array, no other text. Ensure perfect JSON syntax with proper escaping.`;

        const result = await GeminiService.generateContent(prompt, 'Generate realistic data. Return only valid JSON array.', attachments);

        let data;
        if (result.success) {
            try {
                const jsonStr = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                data = JSON.parse(jsonStr);

                // Validate the generated data
                const validation = this.validateData(data, type);
                if (!validation.valid) {
                    window.App.showToast(`Validation warnings: ${validation.errors.length} issues found`, 'warning');
                    // Fix common issues
                    data = this.fixData(data, type);
                }

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
