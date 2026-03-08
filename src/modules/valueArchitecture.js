// ========================================
// Module 3: Value Architecture (ROI/TCO)
// ========================================

import GeminiService from '../services/geminiService.js';

const ValueArchitecture = {
    // Cost database for common tools
    costDatabase: {
        'Zendesk Enterprise': { annualCost: 270000, category: 'Helpdesk' },
        'Zendesk Professional': { annualCost: 150000, category: 'Helpdesk' },
        'Salesforce Service Cloud': { annualCost: 300000, category: 'CRM' },
        'Salesforce Sales Cloud': { annualCost: 250000, category: 'CRM' },
        'ServiceNow CSM': { annualCost: 350000, category: 'CSM' },
        'ServiceNow ITSM': { annualCost: 320000, category: 'ITSM' },
        'Intercom': { annualCost: 48000, category: 'Messaging' },
        'HubSpot Service Hub': { annualCost: 120000, category: 'CRM' },
        'Talkdesk': { annualCost: 84000, category: 'Contact Center' },
        'Genesys Cloud CX': { annualCost: 200000, category: 'Contact Center' },
        'Five9': { annualCost: 180000, category: 'Contact Center' },
        'Freshdesk Enterprise': { annualCost: 150000, category: 'Helpdesk' },
        'Freshservice': { annualCost: 120000, category: 'ITSM' },
        'Freshsales Suite': { annualCost: 90000, category: 'CRM' }
    },

    // Load cost database from localStorage or use defaults
    loadCostDatabase() {
        const stored = localStorage.getItem('costDatabase');
        if (stored) {
            try {
                this.costDatabase = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load cost database:', e);
            }
        }
    },

    // Save cost database to localStorage
    saveCostDatabase() {
        localStorage.setItem('costDatabase', JSON.stringify(this.costDatabase));
    },

    // Add tool to cost database
    addToolToDatabase(name, annualCost, category) {
        this.costDatabase[name] = { annualCost: parseInt(annualCost), category: category };
        this.saveCostDatabase();
    },

    // Get tool suggestions based on input
    getToolSuggestions(input) {
        if (!input || input.length < 2) return [];
        const lowerInput = input.toLowerCase();
        return Object.keys(this.costDatabase)
            .filter(tool => tool.toLowerCase().includes(lowerInput))
            .slice(0, 5);
    },

    // Auto-fill costs based on selected tools
    autoFillCosts() {
        const toolsText = document.getElementById('roi-current-tools').value;
        const lines = toolsText.split('\n');
        let totalCost = 0;
        let updatedText = '';

        lines.forEach(line => {
            if (line.trim()) {
                // Try to match tool name with database
                let matched = false;
                for (const [toolName, data] of Object.entries(this.costDatabase)) {
                    if (line.toLowerCase().includes(toolName.toLowerCase())) {
                        // Replace with database cost
                        updatedText += `${toolName}: $${data.annualCost.toLocaleString()}/yr\n`;
                        totalCost += data.annualCost;
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    updatedText += line + '\n';
                }
            }
        });

        document.getElementById('roi-current-tools').value = updatedText.trim();
        window.App.showToast(`Auto-filled costs for tools. Total: $${totalCost.toLocaleString()}/yr`, 'success');
    },

    render() {
        // Load cost database on render
        this.loadCostDatabase();

        return `
        <div class="module-page">
            <div class="module-header">
                <h1>💰 Value Architecture</h1>
                <p class="module-desc">Convert operational metrics into a 3-year business case for CFO-level stakeholders.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📊 Current State Inputs</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Company Name</label>
                        <input id="roi-company" class="form-input" placeholder="e.g., Acme Corp" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Number of Agents</label>
                        <input id="roi-agents" class="form-input" type="number" placeholder="e.g., 150" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Current Tools & Annual Costs</label>
                        <textarea id="roi-current-tools" class="form-textarea" rows="4" placeholder="List current tools and costs...

e.g., Zendesk Enterprise: $270,000/yr
Talkdesk: $84,000/yr
Intercom: $48,000/yr"></textarea>
                        <div style="margin-top:var(--space-2);">
                            <button class="btn btn-sm btn-secondary" onclick="ValueArchitecture.autoFillCosts()">🔍 Auto-fill from Database</button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Average Labor Burden Rate ($/hr)</label>
                        <input id="roi-labor-rate" class="form-input" type="number" placeholder="e.g., 35" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Manual Reporting FTEs</label>
                        <input id="roi-manual-ftes" class="form-input" type="number" step="0.5" placeholder="e.g., 2" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Proposed Freshworks Plan</label>
                        <select id="roi-plan" class="form-select">
                            <option value="growth">Growth ($18/agent/mo)</option>
                            <option value="pro" selected>Pro ($49/agent/mo)</option>
                            <option value="enterprise">Enterprise ($79/agent/mo)</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Additional Context</label>
                        <textarea id="roi-context" class="form-textarea" rows="3" placeholder="Any additional context for the value analysis...
                        
e.g., Onboarding latency is 8 weeks, Q4 SLA misses caused $180K in churn"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (Current Contracts, Usage Reports)</label>
                         <input type="file" id="roi-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="ValueArchitecture.generateROI()" style="width:100%">
                        💰 Generate ROI Report
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📈 3-Year Value Report</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="ValueArchitecture.copyResult()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="ValueArchitecture.exportResult()">📥 Export</button>
                        </div>
                    </div>
                    <div id="roi-result" class="result-content">
                        <div class="empty-state">
                            <div class="empty-state-icon">💰</div>
                            <h3>Enter current state metrics</h3>
                            <p>AI will calculate headcount avoidance, direct savings, and generate a CFO-ready recommendation.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async generateROI() {
        const data = {
            company: document.getElementById('roi-company').value,
            agents: document.getElementById('roi-agents').value,
            currentTools: document.getElementById('roi-current-tools').value,
            laborRate: document.getElementById('roi-labor-rate').value,
            manualFTEs: document.getElementById('roi-manual-ftes').value,
            plan: document.getElementById('roi-plan').value,
            context: document.getElementById('roi-context').value
        };

        const resultEl = document.getElementById('roi-result');
        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const planPricing = { growth: 18, pro: 49, enterprise: 79 };
        const monthlyPerAgent = planPricing[data.plan];

        const fileInput = document.getElementById('roi-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const prompt = `Generate a Comprehensive 3-Year Value Architecture / ROI-TCO Report with 10-30 detailed points per section for:
Company: ${data.company}
Agents: ${data.agents}
Current Tools & Costs: ${data.currentTools}
Labor Rate: $${data.laborRate}/hr
Manual Reporting FTEs: ${data.manualFTEs}
Proposed: Freshworks ${data.plan} plan at $${monthlyPerAgent}/agent/month
Context: ${data.context}

Analyze any attached contracts or usage reports for more accurate cost modeling.

**Required output structure with 10-30 detailed points per section:**

## Executive Summary (10-15 points)
- **Total 3-Year Value:** (detailed calculation)
- **Year 1 ROI:** (percentage with breakdown)
- **Payback Period:** (months with calculation)
- **Net Present Value (NPV):** (calculation with assumptions)
- **Internal Rate of Return (IRR):** (percentage)
- **Key Value Drivers:** (5-7 points)
- **CFO Recommendation:** (detailed 3-5 points)

## Current State Analysis (15-20 points)
| Tool/Category | Annual Cost | Monthly Cost | Users | Cost per User | Notes |
| --- | --- | --- | --- | --- | --- |
(Current tools breakdown with 10-15 detailed line items)

### Current State Pain Points (10-15 points)
| Pain Point | Business Impact | Annual Cost Impact | Evidence Source |
| --- | --- | --- | --- |
(5-7 pain points with detailed cost impact analysis)

## Proposed Freshworks Solution (15-20 points)
| Product | Plan | Users | Monthly Cost | Annual Cost | 3-Year Cost |
| --- | --- | --- | --- | --- | --- |
(Freshworks cost breakdown with 10-15 detailed line items)

### Implementation Costs (10-15 points)
| Cost Category | Amount | Timeline | Notes |
| --- | --- | --- | --- |
(5-7 implementation cost categories with detailed breakdown)

## Headcount Avoidance Model (15-20 points)
| Role | Current FTEs | Proposed FTEs | Avoidance | Annual Savings | 3-Year Savings |
| --- | --- | --- | --- | --- | --- |
(10-15 roles with detailed headcount analysis)

### Labor Savings Calculation (10-15 points)
| Activity | Current Hours | Proposed Hours | Savings | Hourly Rate | Annual Savings |
| --- | --- | --- | --- | --- | --- |
(5-7 activities with detailed labor savings calculation)

## Direct Savings Analysis (15-20 points)
| Savings Category | Year 1 | Year 2 | Year 3 | Total | Calculation Basis |
| --- | --- | --- | --- | --- | --- |
(10-15 savings categories with detailed calculations)

## Indirect Benefits (10-15 points)
| Benefit Category | Description | Estimated Value | Confidence Level | Evidence |
| --- | --- | --- | --- | --- |
(5-7 indirect benefits with detailed value estimation)

## 3-Year Value Summary (15-20 points)
| Metric | Year 1 | Year 2 | Year 3 | Total | Notes |
| --- | --- | --- | --- | --- | --- |
| Direct Savings | ... | ... | ... | ... | ... |
| Labor Savings | ... | ... | ... | ... | ... |
| Headcount Avoidance | ... | ... | ... | ... | ... |
| Implementation Costs | ... | ... | ... | ... | ... |
| Total Value | ... | ... | ... | ... | ... |
| Net Value | ... | ... | ... | ... | ... |
(Detailed 3-year financial model with 10-15 metrics)

## ROI Analysis (10-15 points)
| Metric | Year 1 | Year 2 | Year 3 | Notes |
| --- | --- | --- | --- | --- |
| ROI % | ... | ... | ... | ... |
| Payback Period | ... | ... | ... | ... |
| NPV | ... | ... | ... | ... |
| IRR | ... | ... | ... | ... |
| Break-even Point | ... | ... | ... | ... |
(Detailed ROI calculations with 5-7 metrics)

## Risk-Adjusted Value (10-15 points)
| Risk Factor | Probability | Impact | Adjusted Value | Mitigation |
| --- | --- | --- | --- | --- |
(5-7 risk factors with detailed risk-adjusted value calculation)

## Sensitivity Analysis (10-15 points)
| Scenario | Assumption Change | ROI Impact | NPV Impact | Recommendation |
| --- | --- | --- | --- | --- |
(5-7 scenarios with detailed sensitivity analysis)

## CFO Recommendation (10-15 points)
- **Recommendation:** [Approve / Approve with Conditions / Reject]
- **Rationale:** (5-7 detailed points)
- **Key Assumptions:** (3-5 points)
- **Next Steps:** (3-5 points)
- **Timeline:** (3-5 points)
- **Risk Mitigation:** (3-5 points)

Present ALL financial data in Markdown tables. Use real math based on inputs. Cite Freshworks pricing from official sources.
Ensure output is highly structured with Markdown tables and 10-30 detailed points per section.`;

        const result = await GeminiService.generateContent(prompt, 'You are a value engineering expert creating CFO-level business cases.', attachments);

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

    copyResult() {
        window.App.copyToClipboard('roi-result');
    },

    exportResult() {
        const el = document.getElementById('roi-result');
        const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ROI Report - ${new Date().toLocaleDateString()}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:900px;margin:2rem auto;padding:1rem;color:#1a1a2e}
table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:0.75rem;text-align:left}
th{background:#f0f0f5;font-weight:600}h1,h2,h3{color:#1a1a2e}strong{color:#333}</style></head>
<body>${el.innerHTML}</body></html>`;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roi-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

window.ValueArchitecture = ValueArchitecture;
export default ValueArchitecture;
