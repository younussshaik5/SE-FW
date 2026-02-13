// ========================================
// Module 6: Exec Translator
// ========================================

import GeminiService from '../services/geminiService.js';
import DemoResponses from '../data/demoResponses.js';

const ExecTranslator = {
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

    async translate() {
        const feature = document.getElementById('exec-feature').value;
        const industry = document.getElementById('exec-industry').value;
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
            const prompt = `You are the Exec Translator. Convert this technical feature into a strategic benefit for a ${persona}:

Technical Feature: "${feature}"
${industry ? `Industry: ${industry}` : ''}

Use any attached technical specs to accurately represent the capabilities.

Provide:
1. 2-3 strategic benefit framings with emoji bullets, each with a **bold title** and detailed explanation relevant to ${persona}'s focus areas
2. Recommended talking points (3 bullet points)

Format using Markdown (bolding, lists).

Frame for ${persona}'s priorities:
- CIO: IT governance, system consolidation, risk, compliance, total cost of ownership
- CFO: Direct cost reduction, headcount avoidance, predictable spend, ROI
- CEO: Competitive advantage, revenue protection, customer experience, board metrics
- COO: Operational efficiency, process standardization, workforce planning, scalability`;

            const result = await GeminiService.generateContent(prompt, 'You are an expert at translating technical capabilities into executive-level strategic value.', attachments);

            const cards = resultsEl.querySelectorAll('.glass-card');
            const card = cards[i];
            if (card) {
                const demoText = DemoResponses.execTranslator[persona] || DemoResponses.execTranslator['CIO'];
                const content = (result.demo || !result.success) ? demoText : result.text;
                card.innerHTML = `
                    <div class="result-header">
                        <h2>${persona === 'CIO' ? '🖥️' : persona === 'CFO' ? '💰' : persona === 'CEO' ? '👔' : '⚙️'} ${persona} Translation</h2>
                        <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText(this.closest('.glass-card').querySelector('.result-content').innerText).then(()=>window.App.showToast('Copied!','success'))">📋 Copy</button>
                    </div>
                    <div class="result-content">${window.MarkdownRenderer ? window.MarkdownRenderer.parse(content) : content}</div>
                `;
            }
        }
    }
};

window.ExecTranslator = ExecTranslator;
export default ExecTranslator;
