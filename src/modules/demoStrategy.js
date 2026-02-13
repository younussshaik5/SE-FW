// ========================================
// Module 1: Demo Strategy (Discovery, Build, Script)
// Director-Level Presales Intelligence
// ========================================

import GeminiService from '../services/geminiService.js';

const DemoStrategy = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🎯 Demo Strategy</h1>
                <p class="module-desc">Director-level presales intelligence — company research, strategic demo planning, and deck-driven talk tracks.</p>
            </div>

            <div class="tabs">
                <button class="tab active" data-tab="discovery">Discovery Intel</button>
                <button class="tab" data-tab="build">Strategy & Build</button>
                <button class="tab" data-tab="script">Script from Deck</button>
            </div>

            <!-- Discovery Tab -->
            <div id="tab-discovery" class="tab-content active">
                <div class="module-grid">
                    <div class="glass-card module-panel">
                        <h2>🔍 Pre-Call Intelligence</h2>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Company Name *</label>
                            <input id="discovery-company" class="form-input" placeholder="e.g., Acme Corp, Stripe, HubSpot" />
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Company Website / LinkedIn URL</label>
                            <input id="discovery-url" class="form-input" placeholder="e.g., https://acme.com or LinkedIn company page" />
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Industry</label>
                            <select id="discovery-industry" class="form-select">
                                <option value="">Select industry...</option>
                                <option value="fintech">FinTech / Payments</option>
                                <option value="healthcare">Healthcare</option>
                                <option value="ecommerce">eCommerce / Retail</option>
                                <option value="saas">SaaS / Technology</option>
                                <option value="education">Education</option>
                                <option value="manufacturing">Manufacturing</option>
                                <option value="bfsi">Banking / Insurance</option>
                                <option value="logistics">Logistics / Supply Chain</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Discovery Notes / Transcript (optional)</label>
                            <textarea id="discovery-input" class="form-textarea" rows="5" placeholder="Paste discovery call notes, emails, or CRM intel...

e.g., 'VP Support mentioned 15-min avg handle time, 4 tools, Zendesk contract ending Q3...'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Attachments (10-K, Earnings, Org Charts, Emails)</label>
                            <input type="file" id="discovery-file" class="form-input" multiple />
                        </div>
                        <button class="btn btn-primary" onclick="DemoStrategy.analyzeDiscovery()">
                            🔍 Run Director-Level Discovery
                        </button>
                    </div>
                    <div class="glass-card module-panel">
                        <div class="result-header">
                            <h2>📊 Company Intelligence Report</h2>
                            <div class="result-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.copyResult('discovery')">📋 Copy</button>
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.shareToSlack('discovery')">💬 Slack</button>
                            </div>
                        </div>
                        <div id="discovery-result" class="result-content">
                            <div class="empty-state">
                                <div class="empty-state-icon">🔍</div>
                                <h3>Enter a company name</h3>
                                <p>AI will research financials, news, stock, org structure, tech stack, and map pains to Freshworks solutions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Build Tab -->
            <div id="tab-build" class="tab-content">
                <div class="module-grid">
                    <div class="glass-card module-panel">
                        <h2>🏗️ Demo Strategy & Environment</h2>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Customer / Deal Name</label>
                            <input id="build-customer" class="form-input" placeholder="e.g., Acme Corp — FD Omnichannel" />
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Key Pains & Use Cases to Address</label>
                            <textarea id="build-input" class="form-textarea" rows="5" placeholder="What did discovery reveal? What must the demo prove?

e.g., 'Must show: omnichannel inbox consolidation (they have 4 tools), Freddy AI auto-triage, SLA dashboards for VP, migration path from Zendesk'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Product</label>
                            <select id="build-product" class="form-select">
                                <option value="freshdesk">Freshdesk</option>
                                <option value="freshservice">Freshservice</option>
                                <option value="freshsales">Freshsales Suite</option>
                                <option value="freshchat">Freshchat</option>
                                <option value="freshmarketer">Freshmarketer</option>
                                <option value="freshcaller">Freshcaller (Contact Center)</option>
                                <option value="freshworks-css">Customer Service Suite</option>
                                <option value="freshworks-crm">Freshworks CRM</option>
                                <option value="freshteam">Freshteam</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Demo Audience</label>
                            <select id="build-audience" class="form-select">
                                <option value="mixed">Mixed (Technical + Business)</option>
                                <option value="executive">C-Level / VP</option>
                                <option value="support-team">Support / IT Team</option>
                                <option value="technical">Technical / IT Admins</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Attachments (Discovery Report, Architecture Diagrams)</label>
                            <input type="file" id="build-file" class="form-input" multiple />
                        </div>
                        <button class="btn btn-primary" onclick="DemoStrategy.generateBuild()">
                            🏗️ Generate Demo Strategy & Click-Paths
                        </button>
                    </div>
                    <div class="glass-card module-panel">
                        <div class="result-header">
                            <h2>📖 Demo Strategy Plan</h2>
                            <div class="result-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.copyResult('build')">📋 Copy</button>
                            </div>
                        </div>
                        <div id="build-result" class="result-content">
                            <div class="empty-state">
                                <div class="empty-state-icon">🏗️</div>
                                <h3>Describe pains & use cases</h3>
                                <p>AI will generate a strategic demo plan with environment setup, click-paths, and narrative flow.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Script Tab -->
            <div id="tab-script" class="tab-content">
                <div class="module-grid">
                    <div class="glass-card module-panel">
                        <h2>🎬 Script from Deck / Features</h2>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Demo Duration</label>
                            <select id="script-duration" class="form-select">
                                <option value="15">15 minutes (Lightning)</option>
                                <option value="25" selected>25 minutes (Standard)</option>
                                <option value="45">45 minutes (Deep Dive)</option>
                                <option value="60">60 minutes (Workshop)</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Customer Context / Pains</label>
                            <textarea id="script-context" class="form-textarea" rows="3" placeholder="e.g., 'Acme Corp, 150 agents, migrating from Zendesk, main pain is tool fragmentation and SLA visibility'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Key Features to Demo</label>
                            <textarea id="script-features" class="form-textarea" rows="3" placeholder="e.g., 'Omnichannel inbox, Freddy AI, SLA tracking, Knowledge base, Automations'"></textarea>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Audience</label>
                            <select id="script-audience" class="form-select">
                                <option value="support-team">Support Team</option>
                                <option value="management">Management / VP</option>
                                <option value="executive">C-Level Executive</option>
                                <option value="technical">Technical / IT Team</option>
                                <option value="mixed">Mixed Audience</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: var(--space-4)">
                            <label class="form-label">Attachments (Slide Deck, Screenshots, Discovery Report)</label>
                            <input type="file" id="script-file" class="form-input" multiple />
                        </div>
                        <button class="btn btn-primary" onclick="DemoStrategy.generateScript()">
                            🎬 Generate Demo Script
                        </button>
                    </div>
                    <div class="glass-card module-panel">
                        <div class="result-header">
                            <h2>📝 Click-Track-Talk Script</h2>
                            <div class="result-actions">
                                <button class="btn btn-sm btn-secondary" onclick="DemoStrategy.copyResult('script')">📋 Copy</button>
                            </div>
                        </div>
                        <div id="script-result" class="result-content">
                            <div class="empty-state">
                                <div class="empty-state-icon">🎬</div>
                                <h3>Upload your slide deck or list features</h3>
                                <p>AI generates a timed script with talk tracks, transitions, and objection handles per slide.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
            });
        });
    },

    async analyzeDiscovery() {
        const company = document.getElementById('discovery-company').value;
        const url = document.getElementById('discovery-url').value;
        const industry = document.getElementById('discovery-industry').value;
        const input = document.getElementById('discovery-input').value;
        const fileInput = document.getElementById('discovery-file');
        const resultEl = document.getElementById('discovery-result');

        if (!company.trim()) {
            window.App.showToast('Enter a company name to research', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height: 400px;"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `You are a Director-Level Presales Intelligence Agent. Conduct exhaustive pre-call research on **${company}**.
${url ? `Company URL/LinkedIn: ${url}` : ''}
${industry ? `Industry: ${industry}` : ''}
${input ? `\nAdditional Discovery Notes:\n${input}` : ''}

**Research the following and present as a structured intelligence brief:**

## 1. Company Snapshot
| Attribute | Detail |
| --- | --- |
| Company | ${company} |
| Industry | ... |
| HQ / Regions | ... |
| Employees (est.) | ... |
| Revenue (est.) | ... |
| Funding / IPO Status | ... |
| Ticker Symbol | ... |

## 2. 10-K / Annual Report Analysis
Search for the company's most recent 10-K filing or annual report:
- **Revenue trend** (3-year if available)
- **Cost structure** — SG&A, R&D, cost of revenue breakdown
- **Strategic initiatives** mentioned in the filing (digital transformation, CX, IT modernization)
- **Risk factors** relevant to CX/IT (legacy systems, customer churn, regulatory)
- **Capex / IT spend** indicators
- **Key metrics** (ARR, NRR, customer count, agent count if disclosed)

## 3. Stock & Financial Health
- Stock performance: 52-week high/low, recent trend, market cap
- Latest quarterly earnings: revenue, growth %, profitability, guidance
- Analyst sentiment and price targets
- Recent fundraising (if private)

## 4. Recent News & Market Activity
| Date | Headline | Relevance to CX/IT |
| --- | --- | --- |
(Last 5-10: acquisitions, partnerships, layoffs, product launches, leadership changes, digital transformation announcements)

## 5. Leadership & Org Structure
| Name | Title | LinkedIn | Relevance |
| --- | --- | --- | --- |
(CIO, CTO, VP Support/CX, VP IT, CFO, CEO)
- Likely buying committee composition
- Champion candidates
- Recent leadership changes

## 6. Current Tech Stack & Tools
| Category | Likely Tool | Confidence | Evidence Source |
| --- | --- | --- | --- |
| Helpdesk / Support | ... | High/Med/Low | Job posting / G2 / BuiltWith |
| CRM | ... | ... | ... |
| ITSM | ... | ... | ... |
| Chat / Messaging | ... | ... | ... |
| Contact Center | ... | ... | ... |
| Marketing Automation | ... | ... | ... |
| Middleware / iPaaS | ... | ... | ... |
(Research from job postings, G2 reviews, BuiltWith, LinkedIn, press releases)

## 7. Social Signals & Sentiment
- LinkedIn posts from leadership about CX, support, digital transformation
- Glassdoor: employee satisfaction, support team reviews, IT team reviews
- G2/Capterra reviews of their current tools (what do they complain about?)
- Twitter/X mentions, public support complaints

## 8. Pain Hypothesis (Director's View)
| Hypothesized Pain | Evidence (from 10-K/news/social) | Business Impact ($) | Freshworks Solution |
| --- | --- | --- | --- |
(Map 5-7 high-confidence pains)

## 9. Discovery Call Game Plan

### Business Questions
| # | Question | Intent |
| --- | --- | --- |
| 1 | What are your top 3 strategic priorities this year? | Map to CX/IT transformation |
| 2 | How do you measure CX/support success today? | Understand KPIs |
| 3 | What's the cost of a support interaction today? | ROI framing |
| 4 | What does your ideal future state look like in 12 months? | Vision alignment |
| 5 | Who are the key stakeholders in this decision? | Org map |

### Technical Questions
| # | Question | Intent |
| --- | --- | --- |
| 1 | Walk me through your current support architecture | Tech stack mapping |
| 2 | What integrations are critical for day-to-day operations? | Integration complexity |
| 3 | What's your API maturity level? | Integration readiness |
| 4 | How do you handle data migration today? | Migration risk |
| 5 | What's your uptime/SLA requirement? | Non-negotiables |

### Current Process Questions
| # | Question | Intent |
| --- | --- | --- |
| 1 | Walk me through a ticket lifecycle from creation to resolution | Process gaps |
| 2 | How do escalations work today? | Escalation pain |
| 3 | What's your current SLA structure? | SLA complexity |
| 4 | How do you handle peak volume periods? | Scalability |
| 5 | What manual processes would you most like to automate? | Automation opportunity |

### Systems & Integration Questions
| # | Question | Intent |
| --- | --- | --- |
| 1 | What systems does your support team touch daily? | Tool sprawl |
| 2 | How do CX tools integrate with your CRM/ERP? | Integration pain |
| 3 | What data flows between systems today? | Data silos |
| 4 | What middleware or iPaaS do you use? | Technical landscape |

### Landmine Questions (Surface Competitor Weakness)
5 questions designed to expose weaknesses of their likely current vendor.

### Opening Hook
Reference recent 10-K filing, earnings, or news to build instant credibility.

### Value Hypothesis to Validate
A 2-sentence hypothesis connecting their strategic priorities to Freshworks value.

Cross-check ALL facts with internet sources. Cite sources where possible (e.g., [Source: SEC 10-K], [Source: LinkedIn], [Source: G2]).`,
            'You are a Director-level Presales Intelligence expert. Research companies like a top SE preparing for a $500K+ deal. Always check 10-K/annual reports for financial data. Use internet grounding to find real, current data. Be specific, not generic.',
            attachments
        );

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

    async generateBuild() {
        const customer = document.getElementById('build-customer').value;
        const input = document.getElementById('build-input').value;
        const product = document.getElementById('build-product').value;
        const audience = document.getElementById('build-audience').value;
        const fileInput = document.getElementById('build-file');
        const resultEl = document.getElementById('build-result');

        if (!input.trim() && (!fileInput.files || fileInput.files.length === 0)) {
            window.App.showToast('Describe pains & use cases to demo, or attach discovery report', 'warning');
            return;
        }

        resultEl.innerHTML = '<div class="loading-shimmer" style="height: 400px;"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `You are a Director-Level Presales Strategist. Create a comprehensive demo strategy for:

Customer: ${customer || 'Target Customer'}
Product: Freshworks ${product}
Audience: ${audience}
Key Pains & Use Cases: ${input}

Use any attached discovery reports or architecture diagrams.

**Output this exact structure:**

## Demo Strategy Summary
- **Objective:** What must this demo prove?
- **Win Theme:** One compelling narrative thread (e.g., "Unified CX that scales")
- **Audience Persona:** What they care about, what bores them

## Demo Narrative Arc
| Phase | Duration | Objective | Emotional Beat |
| --- | --- | --- | --- |
| Hook (Why Change?) | 2-3 min | Create urgency | "You're losing money" |
| Vision (Why Freshworks?) | 3-5 min | Show the future state | "Imagine if..." |
| Proof (Live Demo) | 15-20 min | Validate capabilities | "Let me show you" |
| Close (Why Now?) | 3-5 min | Drive next steps | "Here's the path" |

## Environment Setup — Admin Click-Paths
For each demo requirement, provide exact Freshworks ${product} configuration:

### [Setup Item]
**Navigation:** Admin → [exact path]
| Step | Action | Why |
| --- | --- | --- |
| 1 | Navigate to... | ... |

## Demo Data Prep
| Data Item | Example | Purpose |
| --- | --- | --- |
(Sample tickets, contacts, SLAs, automations needed for a convincing demo)

## Competitive Landmines
| If They Ask About... | Position As... | Proof Point |
| --- | --- | --- |
(3-5 likely competitor comparisons and how to handle)

## Risk & Gotchas
| Risk | Mitigation |
| --- | --- |
(What could go wrong in the demo and how to handle it)

Reference official Freshworks docs for admin paths. [Source: Freshdesk Admin Guide]`,
            `You are a Director-level Freshworks ${product} demo strategist. Think like an SE who has done 500+ demos. Be specific about click-paths, demo data, and narrative flow. Use Markdown tables.`,
            attachments
        );

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

    async generateScript() {
        const duration = document.getElementById('script-duration').value;
        const context = document.getElementById('script-context').value;
        const features = document.getElementById('script-features').value;
        const audience = document.getElementById('script-audience').value;
        const fileInput = document.getElementById('script-file');
        const resultEl = document.getElementById('script-result');

        resultEl.innerHTML = '<div class="loading-shimmer" style="height: 400px;"></div>';

        const attachments = [];
        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                attachments.push(await window.App.readFile(file));
            }
        }

        const result = await GeminiService.generateContent(
            `You are a Director-Level Demo Script Writer. Generate a ${duration}-minute demo script.

Audience: ${audience}
Customer Context: ${context || 'General prospect'}
Features to Demo: ${features || 'Standard Freshworks features'}

If a slide deck is attached, generate slide-by-slide talk tracks.

**Output this exact structure:**

## Script Overview
- **Duration:** ${duration} minutes
- **Audience:** ${audience}
- **Opening Hook:** (1-2 sentences referencing customer's specific pain)
- **Closing CTA:** (specific next step)

## Slide-by-Slide / Section-by-Section Script

### Slide 1: [Title] (0:00 - X:XX)
**CLICK:** What to show on screen
**SAY:** "Exact talk track in quotes — conversational, not robotic"
**TRANSITION:** How to bridge to next section

(Repeat for each section/slide)

## Full Click-Track-Talk Table
| Time | Click (Screen Action) | Feature | Talk Track | Pain Addressed |
| --- | --- | --- | --- | --- |
| 0:00 | Open dashboard | Overview | "Let me show you what your team's morning looks like..." | Tool fragmentation |
(Complete timed breakdown)

## Objection Handles
| If They Say... | Respond With... |
| --- | --- |
(5 likely objections for ${audience} audience with crisp responses)

## Power Moments
3 "wow" moments to create in the demo — specific features that visually impress.

## Disaster Recovery
| If This Happens... | Do This... |
| --- | --- |
(3 common demo failures and recovery plans)`,
            `You are a world-class Freshworks demo presenter. Write scripts that sound natural, not robotic. Every word should earn its place. Use Markdown tables for structured content.`,
            attachments
        );

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

    copyResult(type) {
        window.App.copyToClipboard(`${type}-result`);
    },

    shareToSlack(type) {
        const el = document.getElementById(`${type}-result`);
        import('../services/slackService.js').then(mod => {
            mod.default.sendMessage(`📊 *Demo Strategy — ${type === 'discovery' ? 'Company Intel' : type === 'build' ? 'Demo Strategy' : 'Demo Script'}*\n\n${el.innerText}`);
            window.App.showToast('Sent to Slack!', 'success');
        });
    }
};

window.DemoStrategy = DemoStrategy;
export default DemoStrategy;
