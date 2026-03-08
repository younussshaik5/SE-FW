const VoiceBotConfig = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>📞 Voice Bot Config</h1>
                <p class="module-desc">AI-guided IVR and voice bot flow configuration for Freshcaller.</p>
            </div>

            <div class="module-grid">
                <div class="glass-card module-panel">
                    <h2>📞 IVR Configuration</h2>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Company Name</label>
                        <input id="voice-company" class="form-input" placeholder="e.g., NovaPay" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Industry</label>
                        <select id="voice-industry" class="form-select">
                            <option value="fintech">FinTech / Payments</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="ecommerce">eCommerce</option>
                            <option value="saas">SaaS</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Support Categories (for IVR menu)</label>
                        <textarea id="voice-categories" class="form-textarea" rows="3" placeholder="e.g., Payments, Account Security, Billing, Technical Support"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Languages</label>
                        <div class="chip-group" id="voice-langs">
                            <button class="chip selected" data-lang="english">🇺🇸 English</button>
                            <button class="chip" data-lang="spanish" onclick="this.classList.toggle('selected')">🇪🇸 Spanish</button>
                            <button class="chip" data-lang="french" onclick="this.classList.toggle('selected')">🇫🇷 French</button>
                            <button class="chip" data-lang="german" onclick="this.classList.toggle('selected')">🇩🇪 German</button>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Business Hours</label>
                        <input id="voice-hours" class="form-input" placeholder="e.g., Mon-Fri 8am-8pm EST" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Special Requirements</label>
                        <textarea id="voice-special" class="form-textarea" rows="3" placeholder="e.g., Fraud detection queue with 30sec answer SLA, automated password reset flow"></textarea>
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                         <label class="form-label">Attachments (IVR Flow Diagram / Script)</label>
                         <input type="file" id="voice-file" class="form-input" multiple />
                    </div>
                    <button class="btn btn-primary btn-lg" onclick="VoiceBotConfig.generate()" style="width:100%">
                        📞 Generate IVR Config
                    </button>
                </div>

                <div class="glass-card module-panel">
                    <div class="result-header">
                        <h2>📋 IVR Flow Design</h2>
                        <div class="result-actions">
                            <button class="btn btn-sm btn-secondary" onclick="VoiceBotConfig.copy()">📋 Copy</button>
                            <button class="btn btn-sm btn-secondary" onclick="VoiceBotConfig.download()">📥 Export</button>
                        </div>
                    </div>
                    <div id="voice-result" class="result-content" style="max-height:700px;">
                        <div class="empty-state">
                            <div class="empty-state-icon">📞</div>
                            <h3>Configure your IVR</h3>
                            <p>AI will generate a complete IVR flow with bot configuration, routing, and after-hours handling.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    },

    init() { },

    async generate() {
        const company = document.getElementById('voice-company').value;
        const industry = document.getElementById('voice-industry').value;
        const categories = document.getElementById('voice-categories').value;
        const hours = document.getElementById('voice-hours').value;
        const special = document.getElementById('voice-special').value;
        const langs = [...document.querySelectorAll('#voice-langs .chip.selected')].map(c => c.dataset.lang);
        const resultEl = document.getElementById('voice-result');

        resultEl.innerHTML = '<div class="loading-shimmer" style="height:400px"></div>';

        const prompt = `Generate an Exhaustive Freshcaller (Freshdesk Contact Center) IVR / Voice Bot Configuration with 10-30 Detailed Points per Section:

Company: ${company || 'Sample Company'}
Industry: ${industry}
Categories: ${categories || 'General Support, Billing, Technical'}
Languages: ${langs.join(', ')}
Business Hours: ${hours || 'Mon-Fri 9am-5pm'}
Special Requirements: ${special || 'Standard setup'}

**REQUIRED OUTPUT STRUCTURE WITH 10-30 DETAILED POINTS:**

## Executive Summary (10-15 points)
- **Configuration Overview:** (3-5 points)
- **Key Objectives:** (3-5 points)
- **Expected Outcomes:** (3-5 points)
- **Implementation Timeline:** (2-3 points)

## 📞 IVR Flow Design (20-25 points)

### Main Menu Structure (10-15 points)
| Step | Menu Option | Prompt Text | DTMF | Action | Routing Target | Timeout Handling |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ... | ... | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... | ... | ... |
(Design an exhaustive 15+ step IVR tree with detailed prompts, actions, and routing)

### Sub-Menu Flows (10-15 points)
| Category | Sub-Menu Options | Routing Logic | Escalation Path | Fallback Strategy |
| --- | --- | --- | --- | --- |
| Billing | ... | ... | ... | ... |
| Technical Support | ... | ... | ... | ... |
| Account Management | ... | ... | ... | ... |
(5-7 categories with detailed sub-menu flows)

## 🤖 Bot Configuration & NLUs (20-25 points)

### Voice Bot Settings (10-15 points)
| Setting | Value | Description | Impact | Configuration Method |
| --- | --- | --- | --- | --- |
| Speech Recognition Language | ... | ... | ... | ... |
| Confidence Threshold | ... | ... | ... | ... |
| Fallback Responses | ... | ... | ... | ... |
| Conversation Timeout | ... | ... | ... | ... |
(10-15 technical settings with detailed descriptions)

### NLU Training Data (10-15 points)
| Intent | Training Phrases | Entities | Response Template | Confidence Score |
| --- | --- | --- | --- | --- |
| Check Balance | ... | ... | ... | ... |
| Reset Password | ... | ... | ... | ... |
| Technical Issue | ... | ... | ... | ... |
(10-15 intents with detailed training data)

## ⚡ Queue Routing & SLA Rules (20-25 points)

### Queue Configuration (10-15 points)
| Queue Name | Category | Agents | Routing Method | Priority | SLA (sec) |
| --- | --- | --- | --- | --- | --- |
| Billing Queue | ... | ... | ... | ... | ... |
| Technical Queue | ... | ... | ... | ... | ... |
| VIP Queue | ... | ... | ... | ... | ... |
(5-7 queues with detailed configuration)

### SLA Rules (10-15 points)
| Priority Level | Response Time | Resolution Time | Escalation Path | Notification Method |
| --- | --- | --- | --- | --- |
| P1 - Critical | ... | ... | ... | ... |
| P2 - High | ... | ... | ... | ... |
| P3 - Medium | ... | ... | ... | ... |
| P4 - Low | ... | ... | ... | ... |
(4-5 priority levels with detailed SLA rules)

## 🗣️ AI Self-Service Scripting (20-25 points)

### Conversation Flows (10-15 points)
| Scenario | User Input | Bot Response | Action | Next Step |
| --- | --- | --- | --- | --- |
| Password Reset | ... | ... | ... | ... |
| Order Status | ... | ... | ... | ... |
| Billing Inquiry | ... | ... | ... | ... |
(10-15 conversation flows with detailed scripts)

### Voice Prompts (10-15 points)
| Prompt Type | Text | Tone | Language | Audio File |
| --- | --- | --- | --- | --- |
| Welcome Message | ... | ... | ... | ... |
| Menu Options | ... | ... | ... | ... |
| Confirmation | ... | ... | ... | ... |
(5-7 prompt types with detailed scripts)

## 🛡️ Escalation & Failover Logic (20-25 points)

### Escalation Rules (10-15 points)
| Trigger Condition | Escalation Path | Timeout | Notification | Fallback |
| --- | --- | --- | --- | --- |
| No Agent Available | ... | ... | ... | ... |
| High Priority Call | ... | ... | ... | ... |
| Customer Request | ... | ... | ... | ... |
(5-7 escalation rules with detailed logic)

### Failover Strategies (10-15 points)
| Failure Scenario | Detection Method | Failover Action | Recovery Process | Monitoring |
| --- | --- | --- | --- | --- |
| System Outage | ... | ... | ... | ... |
| Network Issue | ... | ... | ... | ... |
| Agent Unavailable | ... | ... | ... | ... |
(3-5 failure scenarios with detailed strategies)

## Business Hours & Holiday Handling (10-15 points)
| Time Period | IVR Behavior | Queue Status | Message Played | Routing Adjustment |
| --- | --- | --- | --- | --- |
| Regular Hours | ... | ... | ... | ... |
| After Hours | ... | ... | ... | ... |
| Holidays | ... | ... | ... | ... |
(3-5 time periods with detailed handling)

## Reporting & Analytics (10-15 points)
| Metric | Calculation Method | Reporting Frequency | Alert Threshold | Action Required |
| --- | --- | --- | --- | --- |
| Call Volume | ... | ... | ... | ... |
| Average Handle Time | ... | ... | ... | ... |
| First Call Resolution | ... | ... | ... | ... |
(5-7 metrics with detailed reporting configuration)

## Integration & Security (10-15 points)
| Integration Point | Purpose | Authentication | Data Flow | Security Measures |
| --- | --- | --- | --- | --- |
| CRM Integration | ... | ... | ... | ... |
| Payment Gateway | ... | ... | ... | ... |
| Knowledge Base | ... | ... | ... | ... |
(3-5 integrations with detailed security configuration)

Ensure output is highly structured with Markdown tables and 10-30 detailed points per section.`;

        const result = await GeminiService.generateContent(prompt, 'You are an expert Freshcaller/Contact Center IVR architect. Provide exhaustive designs with 10-30 points per category.');

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
        window.App.copyToClipboard('voice-result');
    },

    download() {
        const el = document.getElementById('voice-result');
        const blob = new Blob([el.innerText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ivr-config-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

window.VoiceBotConfig = VoiceBotConfig;
export default VoiceBotConfig;
