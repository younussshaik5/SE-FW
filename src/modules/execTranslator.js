// ========================================
// Module 6: Exec Translator
// ========================================

import GeminiService from '../services/geminiService.js';

const ExecTranslator = {
    // Context storage for deal-specific information
    dealContext: '',

    // Method to set context from other modules
    setContext(context) {
        this.dealContext = context;
        const contextField = document.getElementById('exec-context');
        if (contextField) {
            contextField.value = context;
        }
        window.App.showToast('Context loaded from deal analysis', 'success');
    },

    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🎤 Exec Translator</h1>
                <p class="module-desc">Convert technical features into strategic benefits tailored for CXO personas.</p>
            </div>

            <div class="glass-card module-panel" style="max-width:600px;margin-bottom:var(--space-6)">
                <h2>⚡ Input</h2>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Technical Feature</label>
                    <input id="exec-feature" class="form-input" placeholder="e.g., API Orchestration Engine, Freddy AI Auto-triage, Omnichannel Routing" />
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Target Persona</label>
                    <div class="chip-group" id="exec-personas">
                        <button class="chip selected" data-persona="CIO" onclick="ExecTranslator.selectPersona(this)">🖥️ CIO</button>
                        <button class="chip" data-persona="CFO" onclick="ExecTranslator.selectPersona(this)">💰 CFO</button>
                        <button class="chip" data-persona="CEO" onclick="ExecTranslator.selectPersona(this)">👔 CEO</button>
                        <button class="chip" data-persona="COO" onclick="ExecTranslator.selectPersona(this)">⚙️ COO</button>
                        <button class="chip" data-persona="ALL" onclick="ExecTranslator.selectPersona(this)">🎯 All Personas</button>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Industry Context (optional)</label>
                    <input id="exec-industry" class="form-input" placeholder="e.g., FinTech, Healthcare, eCommerce" />
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                    <label class="form-label">Deal Context (optional)</label>
                    <textarea id="exec-context" class="form-textarea" rows="3" placeholder="Paste deal-specific context from MEDDPICC analysis...

e.g., Deal value, key stakeholders, customer pains, decision criteria"></textarea>
                    <div style="margin-top:var(--space-2);">
                        <button class="btn btn-sm btn-secondary" onclick="ExecTranslator.loadFromDeal()">🔗 Load from Deal MEDDPICC</button>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Attachments (Technical Spec, Architecture)</label>
                        <input type="file" id="exec-file" class="form-input" multiple />
                </div>
                <button class="btn btn-primary btn-lg" onclick="ExecTranslator.translate()" style="width:100%">
                    🎤 Translate for Executive
                </button>
            </div>

            <div id="exec-results" class="module-grid">
                <!-- Results rendered here -->
            </div>
        </div>`;
    },

    selectedPersona: 'CIO',

    init() { },

    selectPersona(el) {
        document.querySelectorAll('#exec-personas .chip').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        this.selectedPersona = el.dataset.persona;
    },

    loadFromDeal() {
        // Get deal data from DealMeddpicc module
        const dealName = document.getElementById('meddpicc-deal')?.value;
        const dealValue = document.getElementById('meddpicc-value')?.value;
        const dealNotes = document.getElementById('meddpicc-notes')?.value;

        if (!dealName && !dealValue && !dealNotes) {
            window.App.showToast('No deal data found. Please analyze a deal in MEDDPICC first.', 'warning');
            return;
        }

        const context = `Deal: ${dealName || 'N/A'}
Value: ${dealValue || 'N/A'}
Notes: ${dealNotes || 'N/A'}`;

        document.getElementById('exec-context').value = context;
        window.App.showToast('Deal context loaded', 'success');
    },

    async translate() {
        const feature = document.getElementById('exec-feature').value;
        const industry = document.getElementById('exec-industry').value;
        const context = document.getElementById('exec-context').value;
        const resultsEl = document.getElementById('exec-results');

        if (!feature.trim()) {
            window.App.showToast('Enter a technical feature', 'warning');
            return;
        }

        const fileInput = document.getElementById('exec-file');
        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const personas = this.selectedPersona === 'ALL' ? ['CIO', 'CFO', 'CEO', 'COO'] : [this.selectedPersona];

        resultsEl.innerHTML = personas.map(p => `
            <div class="glass-card module-panel">
                <h2>${p === 'CIO' ? '🖥️' : p === 'CFO' ? '💰' : p === 'CEO' ? '👔' : '⚙️'} ${p} Translation</h2>
                <div class="loading-shimmer" style="height:200px"></div>
            </div>
        `).join('');

        for (let i = 0; i < personas.length; i++) {
            const persona = personas[i];
            const prompt = `You are the Exec Translator. Convert this technical feature into a strategic benefit for a ${persona} with 10-30 detailed points per section:

Technical Feature: "${feature}"
${industry ? `Industry: ${industry}` : ''}
${context ? `\nDeal Context:\n${context}` : ''}

Use any attached technical specs to accurately represent the capabilities.

**Required output structure with 10-30 detailed points per section:**

## Executive Summary (10-15 points)
- **Strategic Value Proposition:** (3-5 points)
- **Key Benefits:** (5-7 points)
- **ROI Impact:** (3-5 points)
- **Risk Mitigation:** (3-5 points)
- **Competitive Advantage:** (3-5 points)

## Strategic Benefits for ${persona} (15-20 points)
| Benefit Category | Strategic Value | Business Impact | Evidence | KPI Impact | Implementation Complexity |
| --- | --- | --- | --- | --- | --- |
(5-7 benefit categories with detailed strategic value, business impact, evidence, KPI impact, and implementation complexity)

### Detailed Benefit Framings (10-15 points)
| Framing | Title | Detailed Explanation | ${persona} Focus Area | Supporting Metrics |
| --- | --- | --- | --- | --- |
(3-5 strategic benefit framings with emoji bullets, bold titles, and detailed explanations)

## Impact Summary (15-20 points)
| Technical Aspect | Strategic Benefit | ${persona} KPI Impact | Measurement Method | Timeline | Confidence Level |
| --- | --- | --- | --- | --- | --- |
(Map each technical aspect to strategic benefits and measurable KPIs - 10-15 mappings)

## Financial Impact Analysis (10-15 points)
| Cost Component | Current State | Proposed State | Savings/Value | Calculation Basis |
| --- | --- | --- | --- | --- |
(5-7 financial impact components with detailed calculations)

## Risk & Mitigation (10-15 points)
| Risk Category | Specific Risk | Probability | Impact | Mitigation Strategy |
| --- | --- | --- | --- | --- |
(5-7 risk categories with detailed mitigation strategies)

## Recommended Talking Points (10-15 points)
| Talking Point | Context | ${persona} Vocabulary | Expected Response | Follow-up Question |
| --- | --- | --- | --- | --- |
(5-7 talking points tailored for ${persona}'s vocabulary and priorities)

## Persona-Specific Framing (10-15 points)

### ${persona} Priorities Alignment
- **Primary Concerns:** (3-5 points)
- **Key Metrics:** (3-5 points)
- **Decision Criteria:** (3-5 points)
- **Communication Style:** (3-5 points)

### ${persona} Value Proposition (10-15 points)
| Value Dimension | Strategic Benefit | Business Impact | Evidence | Competitive Advantage |
| --- | --- | --- | --- | --- |
(5-7 value dimensions with detailed analysis)

## Implementation Roadmap (10-15 points)
| Phase | Activities | Timeline | ${persona} Involvement | Success Criteria |
| --- | --- | --- | --- | --- |
(3-5 implementation phases with detailed activities)

## Success Metrics & KPIs (10-15 points)
| KPI Category | Current State | Target State | Measurement Method | Timeline |
| --- | --- | --- | --- | --- |
(5-7 KPI categories with detailed measurement methods)

## Executive Summary for ${persona} (10-15 points)
- **Bottom Line:** (3-5 points)
- **Strategic Imperative:** (3-5 points)
- **Recommended Action:** (3-5 points)
- **Expected Outcomes:** (3-5 points)

Frame for ${persona}'s priorities:
- CIO: IT governance, system consolidation, risk, compliance, total cost of ownership, technical debt, scalability, security
- CFO: Direct cost reduction, headcount avoidance, predictable spend, ROI, NPV, IRR, cash flow, budget impact
- CEO: Competitive advantage, revenue protection, customer experience, board metrics, market position, growth, innovation
- COO: Operational efficiency, process standardization, workforce planning, scalability, productivity, quality, consistency

Ensure output is highly structured with Markdown tables and 10-30 detailed points per section.`;

            const result = await GeminiService.generateContent(prompt, 'You are an expert at translating technical capabilities into executive-level strategic value.', attachments);

            const badge = window.App.getAiBadge(result);
            const cards = resultsEl.querySelectorAll('.glass-card');
            const card = cards[i];

            if (card) {
                if (result.success) {
                    card.innerHTML = `
                        <div class="result-header">
                            <h2>${persona === 'CIO' ? '🖥️' : persona === 'CFO' ? '💰' : persona === 'CEO' ? '👔' : '⚙️'} ${persona} Translation</h2>
                            <button class="btn btn-sm btn-secondary" onclick="window.App.copyToClipboard(this.closest('.glass-card').querySelector('.result-content'))">📋 Copy</button>
                        </div>
                        <div class="result-content">${window.MarkdownRenderer ? window.MarkdownRenderer.parse(result.text) : result.text}</div>
                        <div class="result-meta" style="margin-top:var(--space-4); opacity:0.8;">${badge}</div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="result-header">
                             <h2>${persona === 'CIO' ? '🖥️' : persona === 'CFO' ? '💰' : persona === 'CEO' ? '👔' : '⚙️'} ${persona} Translation</h2>
                        </div>
                        <div class="error-container" style="padding:var(--space-4); background:rgba(239,68,68,0.1); border-radius:var(--radius-md); border:1px solid rgba(239,68,68,0.2);">
                            <div style="color:#f87171; font-weight:600; margin-bottom:var(--space-2);">❌ AI Translation Failed</div>
                            <div style="color:var(--text-secondary); font-size:var(--font-sm);">${result.error || 'Unknown error occurred'}</div>
                        </div>
                    `;
                }
            }
        }
    }
};

window.ExecTranslator = ExecTranslator;
export default ExecTranslator;
