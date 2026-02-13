// ========================================
// Module 4: Competitive Battlecards
// ========================================

import GeminiService from '../services/geminiService.js';

const Battlecards = {
    render() {
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

    init() { },

    async generate() {
        const competitor = document.getElementById('battle-competitor').value;
        const custom = document.getElementById('battle-custom').value;
        const product = document.getElementById('battle-product').value;
        const context = document.getElementById('battle-context').value;
        const resultEl = document.getElementById('battle-result');

        const competitorName = competitor === 'other' ? custom : competitor.charAt(0).toUpperCase() + competitor.slice(1);

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const fileInput = document.getElementById('battle-file');
        const attachments = [];
        if (fileInput && fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate a competitive battlecard: Freshworks ${product} vs ${competitorName}.

**Required output structure with Markdown tables:**

## 1. Pricing Comparison
| Tier / Plan | Freshworks (${product}) | ${competitorName} | Savings % |
| --- | --- | --- | --- |
(Compare tier-by-tier with actual pricing from official sources)

## 2. G2 Sentiment Analysis
| Category | Freshworks | ${competitorName} | Advantage |
| --- | --- | --- | --- |
| Overall Rating | ... | ... | ... |
| Ease of Use | ... | ... | ... |
| Quality of Support | ... | ... | ... |
| Setup Time | ... | ... | ... |

## 3. Technical Weaknesses of ${competitorName}
List 5 specific, detailed weaknesses with evidence. Format as numbered list with **bold titles**.

## 4. Trap-Setting Discovery Questions
| Question | Intent | Expected Weakness Exposed |
| --- | --- | --- |
(5 questions designed to surface ${competitorName}'s weaknesses naturally in conversation)

${context ? `Deal context: ${context}` : ''}

Cross-check all pricing and G2 data with official sources. Cite sources where possible.`;

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
