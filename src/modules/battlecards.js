// ========================================
// Module 4: Competitive Battlecards
// ========================================

import GeminiService from '../services/geminiService.js';

const Battlecards = {
    // Custom competitors storage
    customCompetitors: [],

    // Load custom competitors from localStorage
    loadCustomCompetitors() {
        const stored = localStorage.getItem('customCompetitors');
        if (stored) {
            try {
                this.customCompetitors = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load custom competitors:', e);
                this.customCompetitors = [];
            }
        }
    },

    // Save custom competitors to localStorage
    saveCustomCompetitors() {
        localStorage.setItem('customCompetitors', JSON.stringify(this.customCompetitors));
    },

    // Add custom competitor
    addCustomCompetitor(name, category = 'Other') {
        if (!name || this.customCompetitors.find(c => c.name.toLowerCase() === name.toLowerCase())) {
            window.App.showToast('Invalid or duplicate competitor name', 'warning');
            return;
        }

        this.customCompetitors.push({
            id: Date.now(),
            name: name,
            category: category,
            added: new Date().toISOString()
        });

        this.saveCustomCompetitors();
        this.refreshCompetitorSelect();
        window.App.showToast(`Added competitor: ${name}`, 'success');
    },

    // Remove custom competitor
    removeCustomCompetitor(id) {
        this.customCompetitors = this.customCompetitors.filter(c => c.id !== id);
        this.saveCustomCompetitors();
        this.refreshCompetitorSelect();
        window.App.showToast('Competitor removed', 'success');
    },

    // Refresh the competitor select dropdown
    refreshCompetitorSelect() {
        const select = document.getElementById('battle-competitor');
        if (!select) return;

        // Find the "Other" option and add custom competitors after it
        const otherOption = select.querySelector('option[value="other"]');
        if (!otherOption) return;

        // Remove any existing custom competitor options
        select.querySelectorAll('.custom-competitor').forEach(opt => opt.remove());

        // Add custom competitors
        this.customCompetitors.forEach(comp => {
            const option = document.createElement('option');
            option.value = `custom-${comp.id}`;
            option.textContent = comp.name;
            option.className = 'custom-competitor';
            option.dataset.customId = comp.id;
            select.insertBefore(option, otherOption);
        });
    },

    render() {
        // Load custom competitors on render
        this.loadCustomCompetitors();

        return `
        <div class="module-page">
            <div class="module-header">
                <h1>⚔️ Competitive Battlecards</h1>
                <p class="module-desc">Real-time competitive intelligence for incumbent displacement or greenfield defense.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>🎯 Generate Battlecard</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Competitor</label>
                        <select id="battle-competitor" class="form-select">
                            <optgroup label="— CX (Customer Experience) —">
                                <option value="zendesk">Zendesk</option>
                                <option value="salesforce-service">Salesforce Service Cloud</option>
                                <option value="servicenow-csm">ServiceNow CSM</option>
                                <option value="intercom">Intercom</option>
                                <option value="hubspot-service">HubSpot Service Hub</option>
                                <option value="zoho-desk">Zoho Desk</option>
                                <option value="kayako">Kayako</option>
                                <option value="helpscout">Help Scout</option>
                                <option value="gladly">Gladly</option>
                                <option value="kustomer">Kustomer</option>
                                <option value="dixa">Dixa</option>
                                <option value="front">Front</option>
                                <option value="gorgias">Gorgias</option>
                                <option value="liveagent">LiveAgent</option>
                                <option value="tidio">Tidio</option>
                                <option value="sprinklr">Sprinklr</option>
                                <option value="genesys">Genesys Cloud CX</option>
                                <option value="nice">NICE CXone</option>
                                <option value="talkdesk">Talkdesk</option>
                                <option value="five9">Five9</option>
                                <option value="usepylon">usepylon</option>
                            </optgroup>
                            <optgroup label="— EX / ITSM (Employee Experience) —">
                                <option value="servicenow-itsm">ServiceNow ITSM</option>
                                <option value="jira-sm">Jira Service Management</option>
                                <option value="bmc-helix">BMC Helix</option>
                                <option value="ivanti">Ivanti</option>
                                <option value="manageengine">ManageEngine ServiceDesk Plus</option>
                                <option value="sysaid">SysAid</option>
                                <option value="solarwinds">SolarWinds Service Desk</option>
                                <option value="topdesk">TOPdesk</option>
                                <option value="halo-itsm">Halo ITSM</option>
                                <option value="cherwell">Cherwell (Ivanti)</option>
                            </optgroup>
                            <optgroup label="— CRM —">
                                <option value="salesforce-sales">Salesforce Sales Cloud</option>
                                <option value="hubspot-crm">HubSpot CRM</option>
                                <option value="zoho-crm">Zoho CRM</option>
                                <option value="pipedrive">Pipedrive</option>
                                <option value="dynamics365">Microsoft Dynamics 365</option>
                                <option value="sugarcrm">SugarCRM</option>
                                <option value="monday-crm">Monday Sales CRM</option>
                            </optgroup>
                            <option value="other">Other (specify below)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Custom Competitor (if Other)</label>
                        <input id="battle-custom" class="form-input" placeholder="e.g., Kayako, Help Scout" />
                        <div style="margin-top:var(--space-2); display:flex; gap:var(--space-2);">
                            <button class="btn btn-sm btn-primary" onclick="Battlecards.addCustomCompetitor(document.getElementById('battle-custom').value)">➕ Add to Database</button>
                            <button class="btn btn-sm btn-secondary" onclick="Battlecards.showCustomCompetitors()">📋 Manage</button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Freshworks Product to Compare</label>
                        <select id="battle-product" class="form-select">
                            <option value="freshdesk">Freshdesk</option>
                            <option value="freshservice">Freshservice</option>
                            <option value="freshsales">Freshsales Suite</option>
                            <option value="freshchat">Freshchat</option>
                            <option value="freshmarketer">Freshmarketer</option>
                            <option value="freshcaller">Freshcaller (Contact Center)</option>
                            <option value="freshworks-css">Freshworks FreshDesk Omni</option>
                            <option value="freshworks-crm">Freshworks CRM</option>
                            <option value="freshteam">Freshteam</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Context (optional)</label>
                        <textarea id="battle-context" class="form-textarea" rows="3" placeholder="Any deal-specific context...
                        
e.g., Customer is evaluating Zendesk vs Freshdesk, 150 agents, main concern is pricing and ease of migration"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Competitor Proposal, Features List)</label>
                         <input type="file" id="battle-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="Battlecards.generate()" style="width:100%">
                        ⚔️ Generate Battlecard
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📄 Battlecard</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="Battlecards.copy()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="Battlecards.slack()">💬 Slack</button>
                        </div>
                    </div>
                    <div id="battle-result" class="result-content" style="max-height:600px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">⚔️</div>
                            <h3>Select a competitor</h3>
                            <p>AI will generate pricing comparison, G2 sentiment, technical weaknesses, and trap-setting questions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() {
        // Load custom competitors and refresh select
        this.loadCustomCompetitors();
        this.refreshCompetitorSelect();
    },

    showCustomCompetitors() {
        if (this.customCompetitors.length === 0) {
            window.App.showToast('No custom competitors added yet', 'info');
            return;
        }

        let html = '<div style="padding:var(--space-4); max-height:300px; overflow-y:auto;">';
        html += '<h3 style="margin-bottom:var(--space-3);">Custom Competitors</h3>';
        html += '<table style="width:100%; border-collapse:collapse;">';
        html += '<thead><tr style="border-bottom:1px solid var(--border-primary);"><th style="text-align:left; padding:var(--space-2);">Name</th><th style="text-align:left; padding:var(--space-2);">Category</th><th style="text-align:right; padding:var(--space-2);">Action</th></tr></thead>';
        html += '<tbody>';

        this.customCompetitors.forEach(comp => {
            html += `<tr style="border-bottom:1px solid var(--border-muted);">`;
            html += `<td style="padding:var(--space-2);">${comp.name}</td>`;
            html += `<td style="padding:var(--space-2);">${comp.category}</td>`;
            html += `<td style="padding:var(--space-2); text-align:right;"><button class="btn btn-sm btn-danger" onclick="Battlecards.removeCustomCompetitor(${comp.id})">Remove</button></td>`;
            html += `</tr>`;
        });

        html += '</tbody></table></div>';

        // Show in result area
        const resultEl = document.getElementById('battle-result');
        resultEl.innerHTML = html;
    },

    async generate() {
        const competitor = document.getElementById('battle-competitor').value;
        const custom = document.getElementById('battle-custom').value;
        const product = document.getElementById('battle-product').value;
        const context = document.getElementById('battle-context').value;
        const resultEl = document.getElementById('battle-result');

        let competitorName;
        if (competitor.startsWith('custom-')) {
            const customId = parseInt(competitor.replace('custom-', ''));
            const customComp = this.customCompetitors.find(c => c.id === customId);
            competitorName = customComp ? customComp.name : custom;
        } else if (competitor === 'other') {
            competitorName = custom;
        } else {
            competitorName = competitor.charAt(0).toUpperCase() + competitor.slice(1);
        }

        if (!competitorName.trim()) {
            window.App.showToast('Please select or enter a competitor', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const fileInput = document.getElementById('battle-file');
        const attachments = [];
        if (fileInput && fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate a Comprehensive Competitive Battlecard: Freshworks ${product} vs ${competitorName} with 10-30 detailed points per section.

**Required output structure with Markdown tables and 10-30 detailed points per section:**

## Executive Summary (10-15 points)
- **Overall Competitive Position:** (5-7 points)
- **Key Differentiators:** (5-7 points)
- **Recommended Strategy:** (3-5 points)
- **Win Probability:** (with rationale)
- **Critical Success Factors:** (3-5 points)

## 1. Pricing Comparison (15-20 points)
| Tier / Plan | Freshworks (${product}) | ${competitorName} | Savings % | Features Included | Limitations |
| --- | --- | --- | --- | --- | --- |
(Compare tier-by-tier with actual pricing from official sources - 10-15 detailed comparisons)

### Pricing Analysis (10-15 points)
| Cost Component | Freshworks | ${competitorName} | Difference | Notes |
| --- | --- | --- | --- | --- |
(5-7 cost components with detailed analysis)

## 2. G2 Sentiment Analysis (15-20 points)
| Category | Freshworks | ${competitorName} | Advantage | Evidence | Trend |
| --- | --- | --- | --- | --- | --- |
| Overall Rating | ... | ... | ... | ... | ... |
| Ease of Use | ... | ... | ... | ... | ... |
| Quality of Support | ... | ... | ... | ... | ... |
| Setup Time | ... | ... | ... | ... | ... |
| Value for Money | ... | ... | ... | ... | ... |
| Functionality | ... | ... | ... | ... | ... |
| Integration | ... | ... | ... | ... | ... |
(10-15 sentiment categories with detailed analysis)

### Review Analysis (10-15 points)
| Review Source | Freshworks Sentiment | ${competitorName} Sentiment | Key Themes | Evidence |
| --- | --- | --- | --- | --- |
(5-7 review sources with detailed sentiment analysis)

## 3. Technical Comparison (20-25 points)
| Feature Category | Freshworks | ${competitorName} | Advantage | Evidence | Implementation Complexity |
| --- | --- | --- | --- | --- | --- |
(10-15 feature categories with detailed technical comparison)

### Technical Weaknesses of ${competitorName} (15-20 points)
| Weakness Category | Specific Weakness | Evidence | Impact | Freshworks Advantage |
| --- | --- | --- | --- | --- |
(10-15 specific weaknesses with detailed evidence and impact analysis)

### Technical Strengths of Freshworks (10-15 points)
| Strength Category | Specific Strength | Evidence | Competitive Advantage |
| --- | --- | --- | --- |
(5-7 specific strengths with detailed evidence)

## 4. Trap-Setting Discovery Questions (15-20 points)
| Question | Intent | Expected Weakness Exposed | Follow-up Questions | Evidence to Gather |
| --- | --- | --- | --- | --- |
(10-15 questions designed to surface ${competitorName}'s weaknesses naturally in conversation)

## 5. Competitive Positioning (10-15 points)
| Dimension | Freshworks Position | ${competitorName} Position | Our Advantage | Proof Points |
| --- | --- | --- | --- | --- |
(5-7 positioning dimensions with detailed analysis)

## 6. Win Themes & Messaging (10-15 points)
| Theme | Freshworks Message | ${competitorName} Counter | Our Response | Evidence |
| --- | --- | --- | --- | --- |
(5-7 win themes with detailed messaging strategy)

## 7. Objection Handling (10-15 points)
| Objection Category | Specific Objection | ${competitorName} Position | Freshworks Response | Proof Point |
| --- | --- | --- | --- | --- |
(5-7 objection categories with 2-3 specific objections each)

## 8. Implementation Comparison (10-15 points)
| Aspect | Freshworks | ${competitorName} | Advantage | Timeline Impact |
| --- | --- | --- | --- | --- |
(5-7 implementation aspects with detailed comparison)

## 9. Integration Ecosystem (10-15 points)
| Integration Category | Freshworks | ${competitorName} | Advantage | Key Integrations |
| --- | --- | --- | --- | --- |
(5-7 integration categories with detailed analysis)

## 10. Customer Success & Support (10-15 points)
| Aspect | Freshworks | ${competitorName} | Advantage | Evidence |
| --- | --- | --- | --- | --- |
(5-7 customer success aspects with detailed comparison)

${context ? `Deal context: ${context}` : ''}

Cross-check all pricing and G2 data with official sources. Cite sources where possible.
Ensure output is highly structured with Markdown tables and 10-30 detailed points per section.`;

        const result = await GeminiService.generateContent(prompt, 'You are a competitive intelligence expert for Freshworks pre-sales.', attachments);

        const badge = window.App.getAiBadge(result);

        if (result.success) {
            resultEl.innerHTML = `
                <div class="result-body">${window.MarkdownRenderer.parse(result.text)}</div>
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

    copy() {
        window.App.copyToClipboard('battle-result');
    },

    slack() {
        const el = document.getElementById('battle-result');
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`⚔️ *Competitive Battlecard*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    }
};

window.Battlecards = Battlecards;
export default Battlecards;
