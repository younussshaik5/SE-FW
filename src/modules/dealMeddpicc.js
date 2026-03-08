// ========================================
// Module 5: Deal MEDDPICC Analyzer
// ========================================

import GeminiService from '../services/geminiService.js';

const DealMeddpicc = {
    // Fetch deals from Freshworks CRM
    async fetchDealsFromCRM() {
        if (!FreshworksService.isConnected()) {
            window.App.showToast('Configure Freshworks credentials in Settings first', 'warning');
            return;
        }

        const resultEl = document.getElementById('meddpicc-result');
        resultEl.innerHTML = '<div class="loading-shimmer" style="height:200px"></div>';

        try {
            const result = await FreshworksService.getDeals(1);

            if (!result.success) {
                resultEl.innerHTML = `
                    <div class="error-container" style="padding:var(--space-4);">
                        <strong>❌ Failed to fetch deals</strong><br>
                        <span style="color:var(--text-secondary);">${result.error}</span>
                    </div>
                `;
                return;
            }

            const deals = result.data.deals || result.data || [];

            if (deals.length === 0) {
                resultEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><h3>No deals found</h3><p>Connect to Freshworks CRM to fetch deal data.</p></div>';
                return;
            }

            // Populate the form with the first deal
            const deal = deals[0];
            document.getElementById('meddpicc-deal').value = deal.name || '';
            document.getElementById('meddpicc-value').value = deal.amount ? `$${deal.amount}` : '';

            // Generate context from deal data
            let context = `Deal ID: ${deal.id || 'N/A'}\n`;
            if (deal.stage) context += `Stage: ${deal.stage}\n`;
            if (deal.probability) context += `Probability: ${deal.probability}%\n`;
            if (deal.expected_close) context += `Expected Close: ${deal.expected_close}\n`;
            if (deal.customer_id) context += `Customer ID: ${deal.customer_id}\n`;

            document.getElementById('meddpicc-notes').value = context;

            // Show deal list
            let html = '<div style="padding:var(--space-4);"><h3>📊 Deals from CRM</h3><p style="color:var(--text-secondary); margin-bottom:var(--space-3);">Selected first deal and populated form. Here are other available deals:</p>';
            html += '<div style="max-height:300px; overflow-y:auto;">';
            deals.slice(0, 10).forEach(d => {
                html += `<div style="padding:var(--space-2); border-bottom:1px solid var(--border-muted); cursor:pointer;" onclick="DealMeddpicc.selectDeal(${JSON.stringify(d).replace(/"/g, '&quot;')})">`;
                html += `<strong>${d.name || 'Untitled'}</strong> - ${d.amount ? '$' + d.amount : 'No amount'} - ${d.stage || 'No stage'}`;
                html += `</div>`;
            });
            html += '</div></div>';

            resultEl.innerHTML = html;
            window.App.showToast(`Fetched ${deals.length} deals from CRM`, 'success');

        } catch (error) {
            resultEl.innerHTML = `
                <div class="error-container" style="padding:var(--space-4);">
                    <strong>❌ Error fetching deals</strong><br>
                    <span style="color:var(--text-secondary);">${error.message}</span>
                </div>
            `;
        }
    },

    // Select a deal from the list
    selectDeal(deal) {
        document.getElementById('meddpicc-deal').value = deal.name || '';
        document.getElementById('meddpicc-value').value = deal.amount ? `$${deal.amount}` : '';

        let context = `Deal ID: ${deal.id || 'N/A'}\n`;
        if (deal.stage) context += `Stage: ${deal.stage}\n`;
        if (deal.probability) context += `Probability: ${deal.probability}%\n`;
        if (deal.expected_close) context += `Expected Close: ${deal.expected_close}\n`;
        if (deal.customer_id) context += `Customer ID: ${deal.customer_id}\n`;

        document.getElementById('meddpicc-notes').value = context;
        window.App.showToast(`Selected: ${deal.name}`, 'success');
    },

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>📊 Deal MEDDPICC</h1>
                <p class="module-desc">Enterprise-grade qualification framework to assess deal health and next best actions.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📋 Deal Information</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Name</label>
                        <input id="meddpicc-deal" class="form-input" placeholder="e.g., Acme Corp — Freshdesk Omnichannel" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Deal Value (ARR)</label>
                        <input id="meddpicc-value" class="form-input" placeholder="e.g., $85,000" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Discovery Notes / Deal Context</label>
                        <textarea id="meddpicc-notes" class="form-textarea" rows="10" placeholder="Paste all discovery notes, meeting summaries, and deal context here...

Include details about:
• Key stakeholders and their roles
• Customer pain points and metrics
• Decision criteria and process
• Competition in the deal
• Champion details
• Timeline and next steps"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Account Plan, Org Chart)</label>
                         <input type="file" id="meddpicc-file" class="form-input" multiple />
                    </div>
                    <div style="display:flex; gap:var(--space-3);">
                        <button class="btn btn-primary btn-lg" onclick="DealMeddpicc.analyze()" style="flex:1">
                            📊 Analyze Deal
                        </button>
                        <button class="btn btn-secondary btn-lg" onclick="DealMeddpicc.fetchDealsFromCRM()">
                            🔄 Fetch from CRM
                        </button>
                    </div>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>🎯 MEDDPICC Analysis</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="DealMeddpicc.copy()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="DealMeddpicc.slack()">💬 Slack</button>
                        </div>
                    </div>
                    <div id="meddpicc-result" class="result-content" style="max-height:600px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">📊</div>
                            <h3>Enter deal information</h3>
                            <p>AI will evaluate across all MEDDPICC dimensions with scores, gap analysis, and recommended actions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async analyze() {
        const deal = document.getElementById('meddpicc-deal').value;
        const value = document.getElementById('meddpicc-value').value;
        const notes = document.getElementById('meddpicc-notes').value;
        const resultEl = document.getElementById('meddpicc-result');

        if (!notes.trim()) {
            window.App.showToast('Please enter discovery notes', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const fileInput = document.getElementById('meddpicc-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Perform a Comprehensive MEDDPICC Analysis for this deal with 10-30 detailed points per section:

Deal: ${deal} | Value: ${value}

Discovery Notes:
${notes}

Analyze any attached account plans or org charts.

**Required output structure with 10-30 detailed points per section:**

## Executive Summary (10-15 points)
- **Deal Health Score:** X/100 (with detailed breakdown)
- **Risk Level:** [🔴 HIGH / 🟡 MEDIUM / 🟢 LOW]
- **Win Probability:** (percentage with rationale)
- **Critical Success Factors:** (5-7 points)
- **Top 3 Priority Actions:** (detailed 3-5 points each)
- **Timeline Risk:** (3-5 points)
- **Resource Requirements:** (3-5 points)

## MEDDPICC Scorecard (15-20 points)
| Dimension | Score /10 | Indicator | Key Finding | Evidence | Gap Analysis | Recommended Action |
| --- | --- | --- | --- | --- | --- | --- |
| **M**etrics | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **E**conomic Buyer | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **D**ecision Criteria | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **D**ecision Process | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **I**dentify Pain | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **P**aper Process | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **I**mplicate Pain | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
| **C**hampion | X/10 | 🟢/🟡/🔴 | ... | ... | ... | ... |
(Use 🟢 7-10, 🟡 4-6, 🔴 1-3)
(8 dimensions with detailed scoring, evidence, gap analysis, and recommended actions)

## Detailed Assessment by Dimension (40-50 points)

### M - Metrics (5-7 points)
- **Current Metrics:** (3-5 points)
- **Target Metrics:** (3-5 points)
- **Gap Analysis:** (3-5 points)
- **Evidence:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### E - Economic Buyer (5-7 points)
- **Identified Economic Buyer:** (3-5 points)
- **Authority Level:** (2-3 points)
- **Budget Ownership:** (2-3 points)
- **Relationship Strength:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### D - Decision Criteria (5-7 points)
- **Identified Criteria:** (3-5 points)
- **Weighting:** (2-3 points)
- **Our Position:** (2-3 points)
- **Competitor Position:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### D - Decision Process (5-7 points)
- **Process Steps:** (3-5 points)
- **Timeline:** (2-3 points)
- **Key Milestones:** (2-3 points)
- **Stakeholders:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### I - Identify Pain (5-7 points)
- **Identified Pains:** (3-5 points)
- **Business Impact:** (2-3 points)
- **Urgency:** (2-3 points)
- **Evidence:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### P - Paper Process (5-7 points)
- **Required Documents:** (3-5 points)
- **Approval Process:** (2-3 points)
- **Legal Review:** (2-3 points)
- **Timeline:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### I - Implicate Pain (5-7 points)
- **Implication Strategy:** (3-5 points)
- **Stakeholder Impact:** (2-3 points)
- **Urgency Creation:** (2-3 points)
- **Evidence:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

### C - Champion (5-7 points)
- **Champion Identification:** (3-5 points)
- **Influence Level:** (2-3 points)
- **Relationship Strength:** (2-3 points)
- **Motivation:** (2-3 points)
- **Gap Analysis:** (2-3 points)
- **Recommended Actions:** (3-5 points)

## Stakeholder Analysis (10-15 points)
| Stakeholder | Role | Influence | Engagement Level | Risk Level | Mitigation Strategy |
| --- | --- | --- | --- | --- | --- |
(5-7 stakeholders with detailed analysis)

## Competitive Landscape (10-15 points)
| Competitor | Strengths | Weaknesses | Our Advantage | Strategy |
| --- | --- | --- | --- | --- |
(3-5 competitors with detailed analysis)

## Risk Assessment (10-15 points)
| Risk Category | Specific Risk | Probability | Impact | Mitigation Strategy | Contingency Plan |
| --- | --- | --- | --- | --- | --- |
(5-7 risk categories with detailed analysis)

## Timeline & Milestones (10-15 points)
| Milestone | Date | Owner | Status | Dependencies | Risk |
| --- | --- | --- | --- | --- | --- |
(5-7 milestones with detailed tracking)

## Deal Health Summary (10-15 points)
- **Overall Score:** X/100 (with detailed breakdown)
- **Risk Level:** [🔴 HIGH / 🟡 MEDIUM / 🟢 LOW]
- **Win Probability:** (percentage with rationale)
- **Critical Success Factors:** (5-7 points)
- **Top 10 Priority Actions** (numbered list with 3-5 points each)
- **Timeline Impact:** (3-5 points)
- **Resource Impact:** (3-5 points)

## Next Steps (10-15 points)
| Action | Owner | Due Date | Status | Dependencies |
| --- | --- | --- | --- | --- |
(5-7 next steps with detailed tracking)

Ensure output is highly structured with Markdown tables and 10-30 detailed points per section.`;

        const result = await GeminiService.generateContent(prompt, 'You are a MEDDPICC methodology expert evaluating enterprise technology deals.', attachments);

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
        window.App.copyToClipboard('meddpicc-result');
    },

    slack() {
        const el = document.getElementById('meddpicc-result');
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`📊 *MEDDPICC Analysis*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    }
};

window.DealMeddpicc = DealMeddpicc;
export default DealMeddpicc;
