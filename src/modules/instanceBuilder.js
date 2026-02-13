// ========================================
// Instance Builder — AI-Powered Provisioner
// 3-Phase: Discovery → Tiles → Execute
// Covers ALL Freshworks products + Omnichannel
// ========================================

import GeminiService from '../services/geminiService.js';
import FreshworksService from '../services/freshworksService.js';

const InstanceBuilder = {
    // ---- State ----
    phase: 'discovery',
    messages: [],
    attachments: [],
    selectedProduct: '',
    tiles: [],
    executionContext: {},
    executionLog: [],

    // ---- Full Dependency Order per Product ----
    dependencyOrder: {
        freshdesk: [
            'business_hours', 'roles', 'groups', 'agents', 'companies', 'contacts',
            'sla_policies', 'ticket_fields', 'contact_fields', 'company_fields',
            'canned_responses', 'canned_response_folders', 'email_configs', 'email_mailboxes',
            'automations', 'scenario_automations',
            'solution_categories', 'solution_folders', 'solution_articles',
            'forum_categories', 'forums', 'topics',
            'satisfaction_surveys', 'products',
            'tickets', 'conversations'
        ],
        freshdesk_omnichannel: [
            'business_hours', 'roles', 'groups', 'omnichannel_groups', 'agents',
            'companies', 'contacts', 'sla_policies',
            'ticket_fields', 'contact_fields', 'company_fields',
            'canned_responses', 'email_configs', 'email_mailboxes',
            'automations', 'scenario_automations',
            'solution_categories', 'solution_folders', 'solution_articles',
            'satisfaction_surveys', 'products',
            'tickets', 'conversations', 'outbound_messages'
        ],
        freshservice: [
            'business_hours', 'roles', 'departments', 'locations',
            'groups', 'agents', 'requesters', 'requester_groups',
            'sla_policies', 'ticket_fields', 'agent_fields', 'requester_fields',
            'canned_response_folders', 'canned_responses',
            'asset_types', 'assets', 'software', 'vendors', 'products',
            'contracts', 'purchase_orders',
            'service_categories', 'service_catalog_items',
            'solution_categories', 'solution_folders', 'solution_articles',
            'announcements', 'automations',
            'onboarding_requests', 'tickets', 'problems', 'changes', 'releases',
            'projects', 'project_tasks'
        ],
        freshsales: [
            'territories', 'sales_activities',
            'accounts', 'contacts', 'leads', 'deals',
            'products', 'documents',
            'tasks', 'appointments', 'notes'
        ],
        freshchat: [
            'agents', 'groups', 'topics', 'canned_responses', 'conversations'
        ],
        customer_service_suite: [
            'business_hours', 'roles', 'groups', 'omnichannel_groups', 'agents',
            'companies', 'contacts', 'sla_policies',
            'ticket_fields', 'contact_fields', 'company_fields',
            'canned_responses', 'email_configs',
            'automations', 'solution_categories', 'solution_folders', 'solution_articles',
            'satisfaction_surveys', 'products',
            'tickets', 'conversations', 'outbound_messages'
        ]
    },

    // ---- Render ----
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🏗️ Instance Builder</h1>
                <p class="module-desc">AI-powered instance provisioner — save 6 weeks of setup. Covers ALL endpoints for every Freshworks product.</p>
            </div>

            <div class="progress-steps" style="margin-bottom:var(--space-6)">
                <div class="progress-step ${this.phase === 'discovery' ? 'active' : (this.phase !== 'discovery' ? 'completed' : '')}">
                    <div class="step-dot">1</div>
                    <div class="step-label">Discovery</div>
                </div>
                <div class="step-connector ${this.phase !== 'discovery' ? 'completed' : ''}"></div>
                <div class="progress-step ${this.phase === 'tiles' ? 'active' : (this.phase === 'executing' ? 'completed' : '')}">
                    <div class="step-dot">2</div>
                    <div class="step-label">API Tiles</div>
                </div>
                <div class="step-connector ${this.phase === 'executing' ? 'completed' : ''}"></div>
                <div class="progress-step ${this.phase === 'executing' ? 'active' : ''}">
                    <div class="step-dot">3</div>
                    <div class="step-label">Execute</div>
                </div>
            </div>

            ${this.phase === 'discovery' ? this.renderDiscovery() : ''}
            ${this.phase === 'tiles' || this.phase === 'executing' ? this.renderTiles() : ''}
        </div>`;
    },

    renderDiscovery() {
        return `
        <div class="glass-card" style="border-radius:var(--radius-lg);overflow:hidden;">
            <div class="chat-container">
                <div class="chat-messages" id="ib-messages"></div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input" id="ib-input" placeholder="Describe your business & requirements..." onkeydown="if(event.key==='Enter')InstanceBuilder.send()" />
                    <input type="file" id="ib-file" style="display:none" onchange="InstanceBuilder.handleFileSelect()" multiple />
                    <button class="chat-send" onclick="document.getElementById('ib-file').click()" style="margin-right:0.5rem;background:var(--surface-3);color:var(--text-primary)">📎</button>
                    <button class="chat-send" onclick="InstanceBuilder.send()">➤</button>
                </div>
                <div id="ib-file-preview" style="padding:0 1rem 0.5rem;color:var(--text-secondary);font-size:0.8rem;display:none;"></div>
            </div>
        </div>
        <div style="margin-top:var(--space-4);display:flex;gap:var(--space-3);justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary btn-lg" onclick="InstanceBuilder.generatePlan()" id="ib-generate-btn" style="display:none;">
                🚀 Generate Provisioning Plan
            </button>
            <button class="btn btn-secondary btn-sm" onclick="InstanceBuilder.resetAll()">🔄 Start Over</button>
        </div>`;
    },

    renderTiles() {
        const grouped = this.groupTilesByCategory();
        const allDone = this.tiles.every(t => t.status === 'success');
        const anyFailed = this.tiles.some(t => t.status === 'failed');
        const isExecuting = this.phase === 'executing' && this.tiles.some(t => t.status === 'running');

        return `
        <div style="margin-bottom:var(--space-4);display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center;">
            <button class="btn btn-primary btn-lg" onclick="InstanceBuilder.executeAll()" ${isExecuting ? 'disabled' : ''}>
                ${isExecuting ? '⏳ Executing...' : `▶️ Execute All (${this.tiles.length} tiles)`}
            </button>
            <button class="btn btn-secondary btn-sm" onclick="InstanceBuilder.backToDiscovery()">← Back to Discovery</button>
            <button class="btn btn-secondary btn-sm" onclick="InstanceBuilder.exportResults()">📥 Export Results</button>
            <button class="btn btn-secondary btn-sm" onclick="InstanceBuilder.addCustomTile()">➕ Add Custom Tile</button>
            ${allDone ? '<span style="color:#4ade80;font-weight:600;">✅ All done!</span>' : ''}
            ${anyFailed ? '<span style="color:#f87171;font-weight:600;">⚠️ Some tiles failed</span>' : ''}
        </div>

        ${!FreshworksService.isConnected() ? `
        <div class="glass-card" style="padding:var(--space-4);margin-bottom:var(--space-4);border:1px solid rgba(251,191,36,0.3);background:rgba(251,191,36,0.05);">
            <strong style="color:#fbbf24;">⚠️ Not Connected</strong>
            <p style="color:var(--text-secondary);margin:var(--space-2) 0 0;">Configure Freshworks domain + API key in Settings before executing.</p>
        </div>` : `
        <div class="glass-card" style="padding:var(--space-3);margin-bottom:var(--space-4);border:1px solid rgba(74,222,128,0.3);background:rgba(74,222,128,0.05);">
            <span style="color:#4ade80;">✅ Connected: <strong>${FreshworksService.getDomain()}</strong></span>
        </div>`}

        <div id="ib-tiles-container">
            ${Object.entries(grouped).map(([category, tiles]) => `
                <div style="margin-bottom:var(--space-5);">
                    <h3 style="color:var(--text-secondary);margin-bottom:var(--space-3);font-size:var(--font-sm);text-transform:uppercase;letter-spacing:0.05em;">
                        ${this.getCategoryIcon(category)} ${category.replace(/_/g, ' ')} (${tiles.length})
                    </h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(400px,1fr));gap:var(--space-4);">
                        ${tiles.map(tile => this.renderSingleTile(tile)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>

        ${this.executionLog.length > 0 ? `
        <div class="glass-card" style="margin-top:var(--space-5);">
            <h3>📋 Execution Log</h3>
            <div id="ib-exec-log" style="background:#0d1117;padding:var(--space-4);border-radius:var(--radius-md);font-family:monospace;max-height:250px;overflow-y:auto;color:#7ee787;font-size:var(--font-sm);">
                ${this.executionLog.map(l => `<div>${l}</div>`).join('')}
            </div>
        </div>` : ''}`;
    },

    renderSingleTile(tile) {
        const statusColors = {
            pending: 'var(--text-secondary)', running: '#fbbf24',
            success: '#4ade80', failed: '#f87171', skipped: '#94a3b8'
        };
        const statusIcons = {
            pending: '⏳', running: '🔄', success: '✅', failed: '❌', skipped: '⏭️'
        };
        const borderColor = tile.status === 'success' ? 'rgba(74,222,128,0.3)' :
            tile.status === 'failed' ? 'rgba(248,113,113,0.3)' :
                tile.status === 'running' ? 'rgba(251,191,36,0.5)' : 'var(--border-subtle)';

        return `
        <div class="glass-card" style="padding:var(--space-4);border:1px solid ${borderColor};transition:border-color 0.3s;" id="tile-${tile.id}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
                <div>
                    <span style="font-size:var(--font-xs);color:var(--text-secondary);">Step ${tile.step}</span>
                    <h4 style="margin:0;font-size:var(--font-base);">${tile.label}</h4>
                </div>
                <span style="color:${statusColors[tile.status]};font-size:var(--font-sm);">${statusIcons[tile.status]} ${tile.status}</span>
            </div>
            <div style="font-family:monospace;font-size:var(--font-xs);color:var(--accent-primary);margin-bottom:var(--space-3);">
                ${tile.method} ${tile.endpoint}
            </div>
            <textarea id="tile-payload-${tile.id}" class="form-textarea" rows="6"
                style="font-family:'Fira Code',monospace;font-size:12px;background:#0d1117;color:#c9d1d9;border:1px solid var(--border-subtle);white-space:pre;tab-size:2;margin-bottom:var(--space-3);width:100%;resize:vertical;"
                ${tile.status === 'running' ? 'disabled' : ''}>${typeof tile.payload === 'string' ? tile.payload : JSON.stringify(tile.payload, null, 2)}</textarea>
            ${tile.status === 'failed' && tile.response ? `<div style="color:#f87171;font-size:var(--font-xs);margin-bottom:var(--space-2);word-break:break-all;">Error: ${tile.response}</div>` : ''}
            ${tile.status === 'success' && tile.createdId ? `<div style="color:#4ade80;font-size:var(--font-xs);margin-bottom:var(--space-2);">Created ID: ${tile.createdId}</div>` : ''}
            <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
                <button class="btn btn-sm btn-primary" onclick="InstanceBuilder.executeSingle('${tile.id}')" ${tile.status === 'running' ? 'disabled' : ''}>
                    ${tile.status === 'success' ? '🔁 Re-run' : '▶️ Execute'}
                </button>
                <button class="btn btn-sm btn-secondary" onclick="InstanceBuilder.regenerateTile('${tile.id}')">🔄 Regen</button>
                <button class="btn btn-sm btn-secondary" onclick="InstanceBuilder.removeTile('${tile.id}')" style="color:var(--text-secondary);">🗑️</button>
            </div>
        </div>`;
    },

    groupTilesByCategory() {
        const grouped = {};
        for (const tile of this.tiles) {
            if (!grouped[tile.category]) grouped[tile.category] = [];
            grouped[tile.category].push(tile);
        }
        return grouped;
    },

    getCategoryIcon(cat) {
        const icons = {
            business_hours: '🕐', roles: '🛡️', groups: '👥', omnichannel_groups: '🌐',
            agents: '🧑‍💻', companies: '🏢', contacts: '📇', sla_policies: '📊',
            ticket_fields: '🏷️', contact_fields: '📋', company_fields: '🏢',
            canned_responses: '💬', canned_response_folders: '📁',
            email_configs: '📧', email_mailboxes: '📬',
            automations: '⚡', scenario_automations: '🎭',
            solution_categories: '📚', solution_folders: '📁', solution_articles: '📝',
            forum_categories: '🗂️', forums: '💭', topics: '💡',
            satisfaction_surveys: '⭐', products: '📦',
            tickets: '🎫', conversations: '💬', outbound_messages: '📤',
            departments: '🏛️', locations: '📍', requesters: '👤', requester_groups: '👥',
            agent_fields: '📋', requester_fields: '📋',
            asset_types: '📦', assets: '💻', software: '💿', vendors: '🤝',
            contracts: '📄', purchase_orders: '🧾',
            service_categories: '🛒', service_catalog_items: '📋',
            announcements: '📢', onboarding_requests: '🚀',
            problems: '🔧', changes: '🔄', releases: '🚢',
            projects: '📊', project_tasks: '✅',
            territories: '🗺️', sales_activities: '📞',
            accounts: '🏦', leads: '🎯', deals: '💰',
            documents: '📑', tasks: '✅', appointments: '📅', notes: '📌',
            custom_objects: '🧩', integrations: '🔗', other: '📋'
        };
        return icons[cat] || '📋';
    },

    // ---- Init ----
    init() {
        this.phase = 'discovery';
        this.messages = [];
        this.attachments = [];
        this.tiles = [];
        this.executionContext = {};
        this.executionLog = [];
        this.selectedProduct = '';

        this.messages = [{
            role: 'ai', text: `👋 Welcome to the **Instance Builder**! I'll help you configure a complete Freshworks instance in **5 minutes** instead of 6 weeks.

**Which product are you setting up?**

| Product | Use Case |
|---------|----------|
| **Freshdesk** | Customer Support |
| **Freshdesk Omnichannel** | Unified CX across email, chat, phone, social |
| **Customer Service Suite** | Next-gen unified CX platform |
| **Freshservice** | IT Service Management (ITSM) |
| **Freshsales** | CRM & Sales Pipeline |
| **Freshchat** | Messaging & Conversational Support |

Tell me the product, your **industry**, and a brief description of your business, and I'll start probing for everything I need!` }];
        this.renderMessages();
    },

    // ---- Chat ----
    renderMessages() {
        const container = document.getElementById('ib-messages');
        if (!container) return;

        container.innerHTML = this.messages.map(msg => `
            <div class="chat-message ${msg.role === 'ai' ? 'ai' : 'user'}">
                <div class="chat-avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
                <div class="chat-bubble">
                    ${msg.role === 'ai' ? window.MarkdownRenderer.parse(msg.text) : msg.text}
                    ${msg.badge ? `<div class="result-meta" style="margin-top:var(--space-2);opacity:0.7;">${msg.badge}</div>` : ''}
                </div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;

        const userMsgCount = this.messages.filter(m => m.role === 'user').length;
        const btn = document.getElementById('ib-generate-btn');
        if (btn) btn.style.display = userMsgCount >= 2 ? 'inline-flex' : 'none';
    },

    async send() {
        const input = document.getElementById('ib-input');
        const text = input.value.trim();
        if (!text && this.attachments.length === 0) return;

        input.value = '';
        this.messages.push({ role: 'user', text: text + (this.attachments.length > 0 ? `\n[Attached: ${this.attachments.map(f => f.name).join(', ')}]` : '') });
        const currentAttachments = this.attachments.map(a => a.data);
        this.attachments = [];
        const previewEl = document.getElementById('ib-file-preview');
        if (previewEl) previewEl.style.display = 'none';
        const fileEl = document.getElementById('ib-file');
        if (fileEl) fileEl.value = '';
        this.renderMessages();

        // Detect product
        const lcText = text.toLowerCase();
        if (!this.selectedProduct) {
            if (lcText.includes('omnichannel') || lcText.includes('omni channel') || lcText.includes('omni-channel')) this.selectedProduct = 'freshdesk_omnichannel';
            else if (lcText.includes('customer service suite') || lcText.includes('css')) this.selectedProduct = 'customer_service_suite';
            else if (lcText.includes('freshservice')) this.selectedProduct = 'freshservice';
            else if (lcText.includes('freshsales')) this.selectedProduct = 'freshsales';
            else if (lcText.includes('freshchat')) this.selectedProduct = 'freshchat';
            else if (lcText.includes('freshdesk')) this.selectedProduct = 'freshdesk';
        }

        const container = document.getElementById('ib-messages');
        container.insertAdjacentHTML('beforeend', `
            <div class="chat-message ai" id="ib-loading">
                <div class="chat-avatar">🤖</div>
                <div class="chat-bubble"><span class="loading-dots">Thinking</span></div>
            </div>
        `);
        container.scrollTop = container.scrollHeight;

        const conversationHistory = this.messages.map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');
        const productLabel = this.selectedProduct ? this.selectedProduct.replace(/_/g, ' ') : 'not yet selected';

        const result = await GeminiService.generateContent(
            `You are the Freshworks Instance Builder AI — a senior implementation consultant who has deployed 1000+ instances.

Product: **${productLabel}**

Conversation so far:
${conversationHistory}

PROBE STRATEGICALLY (2-3 questions per turn). You need COMPLETE info to generate a FULL instance:

**1. Business Context:**
- Industry, company size, # of agents, locale, timezone, business hours
- Organizational structure (regions, product lines, departments)

**2. Channels & Contact Strategy:**
- Support channels: email, phone, chat, WhatsApp, social, portal
- ${this.selectedProduct?.includes('omnichannel') || this.selectedProduct === 'customer_service_suite' ? 'Omnichannel routing strategy — unified vs separate queues per channel' : 'Primary contact channels'}
- Contact/customer segmentation (tiers, VIP, enterprise vs SMB)

**3. Team Structure:**
- Groups/teams (L1, L2, L3, by region, by product, by language)
- Agent roles and permissions (admin, supervisor, agent, restricted)
- Assignment rules (round-robin, load-balanced, skill-based)

**4. SLA Requirements:**
- Response & resolution targets per priority (P1–P4)
- Business hours SLA vs 24/7
- Escalation chain (who gets escalated, when)

**5. Automations (exhaustive):**
- Ticket creation rules (auto-assign, auto-tag, auto-categorize)
- Time-triggered rules (follow-up, auto-close stale tickets)
- Update-triggered rules (escalation, notification)
- Observer rules (notify on status change)

**6. Knowledge Base:**
- Categories, folders, and article topics
- Internal vs external visibility
- Languages / translations needed

**7. Custom Fields:**
- Ticket custom fields (dropdowns, text, checkboxes)
- Contact custom fields
- Company custom fields

**8. Canned Responses:**
- Standard reply templates by category (greeting, closure, escalation, info request)

**9. Sample Data:**
- Companies, contacts, sample tickets to pre-populate for demo/testing

**10. Integrations & Custom Needs:**
- Third-party integrations (Slack, Jira, Salesforce, HubSpot, etc.)
- Custom objects or custom configurations
- Any unique workflows

When you have enough info (4-5 exchanges), say:
"✅ I have enough! Click **Generate Provisioning Plan** to create your execution tiles."

Be conversational, use emojis, be thorough but efficient.`,
            'Senior Freshworks implementation consultant. Ask structured discovery questions. Be thorough — you need to generate 20-50+ API tiles from this info.',
            currentAttachments
        );

        document.getElementById('ib-loading')?.remove();

        const aiText = result.success ? result.text : `❌ AI Failed: ${result.error || 'Unknown error'}`;
        this.messages.push({ role: 'ai', text: aiText });
        if (result.success) {
            this.messages[this.messages.length - 1].badge = window.App.getAiBadge(result);
        }
        this.renderMessages();
    },

    // ---- Generate Plan ----
    async generatePlan() {
        if (!this.selectedProduct) {
            window.App.showToast('Please specify which Freshworks product first.', 'warning');
            return;
        }

        window.App.showToast('Generating provisioning plan — this may take 15-30 seconds...', 'info');

        const conversationHistory = this.messages.map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');
        const order = this.dependencyOrder[this.selectedProduct] || this.dependencyOrder.freshdesk;
        const endpointRef = this.getEndpointReference();

        const result = await GeminiService.generateContent(
            `You are a Freshworks API architect. Based on this discovery conversation, generate a COMPLETE provisioning plan for a **${this.selectedProduct.replace(/_/g, ' ')}** instance.

Conversation:
${conversationHistory}

## CRITICAL INSTRUCTIONS

1. Generate a JSON array. Each element = ONE API call (one tile).
2. Follow STRICT dependency order: ${order.join(' → ')}
3. Cover EVERY relevant entity. A typical production instance has 30-80 tiles.
4. NO duplicates. Each entity exactly once.

## FOR EACH TILE provide:
{
  "category": "one of [${order.map(o => `"${o}"`).join(', ')}]",
  "label": "Human-readable (e.g. 'Create L1 Support Group')",
  "method": "POST",
  "endpoint": "/api/v2/exact_endpoint",
  "payload": { ... complete valid JSON with ALL required fields ... }
}

## PAYLOAD RULES
- Populate with REALISTIC data derived from conversation context
- For cross-entity references use: "{{ref:category:label}}" placeholder
  Example: "group_id": "{{ref:groups:Create L1 Support Group}}"
- These get resolved to real IDs on execution
- Include ALL required fields per official API docs. Do NOT include "id" (auto-generated)

## ENDPOINT REFERENCE
${endpointRef}

## COMPLETENESS CHECKLIST
For ${this.selectedProduct.replace(/_/g, ' ')} you MUST include tiles for ALL of these if the user discussed them:

${order.map((o, i) => `${i + 1}. ${o.replace(/_/g, ' ')}`).join('\n')}

## IMPORTANT
- For automations: type_id 1=ticket_creation, 2=time_trigger, 3=ticket_update, 4=observer
- For SLAs: respond_within and resolve_within are in SECONDS
- For solution articles: status 1=draft, 2=published
- For ticket priorities: 1=low, 2=medium, 3=high, 4=urgent
- For ticket status: 2=open, 3=pending, 4=resolved, 5=closed
${this.selectedProduct.includes('omnichannel') || this.selectedProduct === 'customer_service_suite' ?
                `- For omnichannel: include outbound_messages tiles for proactive messaging
- For omnichannel groups: use /api/v2/groups with omnichannel agent limits` : ''}

Output ONLY valid JSON array. No markdown. No explanation. No wrapping object.`,
            'You are a senior Freshworks API engineer. You know every endpoint from developers.freshdesk.com, api.freshservice.com, developers.freshsales.io. Output ONLY valid JSON.'
        );

        if (!result.success) {
            window.App.showToast('Plan generation failed: ' + result.error, 'error');
            return;
        }

        try {
            let raw = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            if (raw.startsWith('{') && !raw.startsWith('[')) {
                const parsed = JSON.parse(raw);
                raw = JSON.stringify(parsed.tiles || parsed.plan || parsed.data || Object.values(parsed)[0] || [parsed]);
            }
            const tilesData = JSON.parse(raw);

            if (!Array.isArray(tilesData) || tilesData.length === 0) {
                throw new Error('Empty tiles array');
            }

            this.tiles = tilesData.map((t, i) => ({
                id: `tile_${Date.now()}_${i}`,
                step: i + 1,
                category: t.category || 'other',
                label: t.label || `API Call ${i + 1}`,
                method: t.method || 'POST',
                endpoint: t.endpoint || '/api/v2/unknown',
                payload: t.payload || {},
                status: 'pending',
                response: null,
                createdId: null
            }));

            this.sortTilesByDependency();
            this.phase = 'tiles';
            this.updateUI();
            window.App.showToast(`✅ Generated ${this.tiles.length} API tiles!`, 'success');

        } catch (e) {
            console.error('Parse error:', e, result.text?.substring(0, 500));
            window.App.showToast('Failed to parse plan JSON. Try again.', 'error');
        }
    },

    sortTilesByDependency() {
        const order = this.dependencyOrder[this.selectedProduct] || this.dependencyOrder.freshdesk;
        this.tiles.sort((a, b) => {
            const ai = order.indexOf(a.category);
            const bi = order.indexOf(b.category);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
        this.tiles.forEach((t, i) => t.step = i + 1);
    },

    getEndpointReference() {
        const refs = {
            freshdesk: `
FRESHDESK v2 API — developers.freshdesk.com/api
- Business Hours: GET /api/v2/business_hours (read-only)
- Roles: GET /api/v2/roles (read-only)
- Groups: POST /api/v2/groups { "name", "description", "escalate_to", "auto_ticket_assign": 0|1, "agent_ids": [] }
- Agents: POST /api/v2/agents { "email", "ticket_scope": 1|2|3, "group_ids": [], "role_ids": [], "occasional": false }
- Companies: POST /api/v2/companies { "name", "description", "domains": [], "custom_fields": {} }
- Contacts: POST /api/v2/contacts { "name", "email", "phone", "company_id", "custom_fields": {} }
- SLA Policies: POST /api/v2/sla_policies { "name", "description", "active": true, "sla_target": { "priority_1": {"respond_within": seconds, "resolve_within": seconds, "business_hours": true} }, "applicable_to": { "group_ids": [], "ticket_types": [] } }
- Ticket Fields: POST /api/v2/admin/ticket_fields { "label", "type": "custom_text|custom_dropdown|custom_number|custom_checkbox|custom_date", "label_for_customers": "", "choices": {} }
- Contact Fields: POST /api/v2/admin/contact_fields { "label", "type", "choices": {} }
- Company Fields: POST /api/v2/admin/company_fields { "label", "type", "choices": {} }
- Canned Response Folders: POST /api/v2/canned_response_folders { "name" }
- Canned Responses: POST /api/v2/canned_responses { "title", "content": "<html>", "folder_id" }
- Email Configs: GET /api/v2/email_configs (read-only)
- Email Mailboxes: POST /api/v2/email_mailboxes { "name", "support_email", "product_id" }
- Automation (Ticket Creation): POST /api/v2/automations/1/rules { "name", "position", "active": true, "conditions": [{"name":"condition_set_1","match_type":"all","properties":[{"field_name":"","operator":"","value":""}]}], "actions": [{"field_name":"","value":""}] }
- Automation (Time Trigger): POST /api/v2/automations/2/rules { ... same structure ... }
- Automation (Ticket Update): POST /api/v2/automations/3/rules { ... same structure + "events": [] ... }
- Automation (Observer): POST /api/v2/automations/4/rules { ... same + "performer": {"type":1,"members":[]} ... }
- Scenario Automations: GET /api/v2/scenario_automations (read-only)
- Solution Categories: POST /api/v2/solutions/categories { "name", "description" }
- Solution Folders: POST /api/v2/solutions/categories/{cat_id}/folders { "name", "description", "visibility": 1|2|3 }
- Solution Articles: POST /api/v2/solutions/folders/{folder_id}/articles { "title", "description": "<html>", "status": 1|2, "folder_id" }
- Forum Categories: POST /api/v2/discussions/categories { "name", "description" }
- Forums: POST /api/v2/discussions/categories/{cat_id}/forums { "name", "description", "forum_type": 1|2|3|4 }
- Satisfaction Surveys: GET /api/v2/surveys (read-only)
- Products: GET /api/v2/products (read-only)
- Tickets: POST /api/v2/tickets { "subject", "description", "email", "priority": 1-4, "status": 2-5, "type", "group_id", "responder_id", "tags": [], "custom_fields": {} }
- Conversations Reply: POST /api/v2/tickets/{id}/reply { "body": "<html>" }
- Conversations Note: POST /api/v2/tickets/{id}/notes { "body": "<html>", "private": true }`,

            freshdesk_omnichannel: `
FRESHDESK OMNICHANNEL — All Freshdesk endpoints PLUS:
- Omnichannel Groups: POST /api/v2/groups (same endpoint, add omnichannel agent limits)
- Outbound Messages: POST /api/v2/outbound_messages { "template": { "name": "", "language": "", "components": [] }, "contact_id": "", "channel": "whatsapp|sms" }
ALL other endpoints same as Freshdesk (see above).`,

            freshservice: `
FRESHSERVICE v2 API — api.freshservice.com/v2
- Business Hours: GET /api/v2/business_hours
- Roles: GET /api/v2/roles
- Departments: POST /api/v2/departments { "name", "description" }
- Locations: POST /api/v2/locations { "name", "address": {"line1":"","city":"","state":"","country":"","zipcode":""} }
- Groups: POST /api/v2/groups { "name", "description", "escalate_to", "members": [] }
- Agents: POST /api/v2/agents { "email", "first_name", "last_name", "role_ids": [], "department_ids": [], "group_ids": [], "member_of": [] }
- Requesters: POST /api/v2/requesters { "first_name", "last_name", "email", "department_id", "location_id", "custom_fields": {} }
- Requester Groups: POST /api/v2/requester_groups { "name", "description" }
- SLA Policies: GET /api/v2/sla_policies (view-only in Freshservice)
- Ticket Fields: GET /api/v2/ticket_form_fields (view-only)
- Agent Fields: GET /api/v2/agent_fields (view-only)
- Requester Fields: GET /api/v2/requester_fields (view-only)
- Canned Response Folders: GET /api/v2/canned_response_folders
- Canned Responses: GET /api/v2/canned_responses
- Asset Types: POST /api/v2/asset_types { "name", "description" }
- Assets: POST /api/v2/assets { "name", "asset_type_id", "description", "type_fields": {} }
- Software: POST /api/v2/applications { "application_type": "desktop|saas|mobile", "name", "description", "status": "managed|ignored|restricted" }
- Vendors: POST /api/v2/vendors { "name", "email", "phone", "address": {} }
- Products: POST /api/v2/products { "name", "asset_type_id", "description", "manufacturer": "" }
- Contracts: POST /api/v2/contracts { "name", "description", "contract_type": "lease|maintenance|software_license|warranty", "vendor_id" }
- Purchase Orders: POST /api/v2/purchase_orders { "name", "vendor_id", "po_number", "purchase_items": [] }
- Service Categories: GET /api/v2/service_catalog/categories
- Service Catalog Items: POST /api/v2/service_catalog/items { "name", "description", "short_description", "category_id", "delivery_time": hours }
- Solution Categories: POST /api/v2/solutions/categories { "name", "description" }
- Solution Folders: POST /api/v2/solutions/categories/{id}/folders { "name", "description", "visibility": 1|2|3 }
- Solution Articles: POST /api/v2/solutions/folders/{id}/articles { "title", "description": "<html>", "status": 1|2 }
- Announcements: POST /api/v2/announcements { "title", "body": "<html>", "visible_from", "visible_till", "visibility": "everyone|agents_only|grouped" }
- Tickets: POST /api/v2/tickets { "subject", "description", "email", "priority": 1-4, "status": 2-5, "type": "Incident|Service Request", "department_id", "group_id" }
- Problems: POST /api/v2/problems { "subject", "description", "priority": 1-4, "status": 1-3, "due_by" }
- Changes: POST /api/v2/changes { "subject", "description", "priority": 1-4, "status": 1-5, "change_type": 1-3, "risk": 1-4, "impact": 1-3 }
- Releases: POST /api/v2/releases { "subject", "description", "priority": 1-4, "status": 1-5, "release_type": 1-3 }
- Projects: POST /api/v2/projects { "name", "description", "status_id": 1-4, "priority": 1-3, "project_type": 1-4 }
- Project Tasks: POST /api/v2/projects/{id}/tasks { "title", "description" }`,

            freshsales: `
FRESHSALES API — developers.freshsales.io/api
- Accounts: POST /api/contacts { "name", "website", "phone", "city", "state", "country", "industry_type_id" } (Note: use attribute "name" for company name)
- Contacts: POST /api/contacts { "first_name", "last_name", "email", "mobile_number", "sales_account_id", "job_title", "city" }
- Leads: POST /api/leads { "first_name", "last_name", "email", "company": { "name": "" }, "deal": {} }
- Deals: POST /api/deals { "name", "amount", "sales_account_id", "deal_stage_id", "deal_type_id", "expected_close" }
- Products: POST /api/cpq/products { "name", "description", "category": "", "active": true }
- Documents: POST /api/cpq/documents { "document": { "deal_id", "contact_id", "document_type" } }
- Tasks: POST /api/tasks { "title", "description", "due_date", "owner_id", "targetable_type": "Contact|Deal|SalesAccount", "targetable_id" }
- Appointments: POST /api/appointments { "title", "description", "from_date", "end_date", "attendees": [{"email":""}] }
- Notes: POST /api/notes { "description", "targetable_type": "Contact|Deal|SalesAccount|Lead", "targetable_id" }
- Sales Activities: POST /api/sales_activities { "title", "notes", "sales_activity_type_id", "targetable_type", "targetable_id" }`,

            freshchat: `
FRESHCHAT API
- Agents: POST /api/v2/agents { "email", "first_name", "last_name" }
- Groups: POST /api/v2/groups { "name", "description" }
- Topics: POST /api/v2/topics { "name" }
- Canned Responses: POST /api/v2/canned_responses { "title", "content" }`,

            customer_service_suite: `
CUSTOMER SERVICE SUITE — Superset of Freshdesk Omnichannel.
All endpoints from Freshdesk Omnichannel apply. Additionally:
- Unified omnichannel routing: POST /api/v2/groups with omnichannel configs
- Outbound Messages: POST /api/v2/outbound_messages for proactive engagement
- All Knowledge Base, Automation, SLA, Agent, Group endpoints from Freshdesk apply.`
        };
        return refs[this.selectedProduct] || refs.freshdesk;
    },

    // ---- Execute Single ----
    async executeSingle(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (!tile) return;

        if (!FreshworksService.isConnected()) {
            window.App.showToast('Connect to Freshworks in Settings first!', 'warning');
            return;
        }

        // Save latest edits
        const textarea = document.getElementById(`tile-payload-${tileId}`);
        if (textarea) {
            try { tile.payload = JSON.parse(textarea.value); }
            catch { tile.payload = textarea.value; }
        }

        // Resolve placeholders
        let payloadStr = typeof tile.payload === 'string' ? tile.payload : JSON.stringify(tile.payload);
        payloadStr = this.resolvePlaceholders(payloadStr);

        tile.status = 'running';
        tile.response = null;
        this.updateTileUI(tile);
        this.logExecution(`▶️ Step ${tile.step}: ${tile.label} — ${tile.method} ${tile.endpoint}`);

        try {
            let parsedPayload;
            try { parsedPayload = JSON.parse(payloadStr); } catch { parsedPayload = null; }

            const result = tile.method === 'GET'
                ? await FreshworksService.genericGet(tile.endpoint)
                : await FreshworksService.genericCreate(tile.endpoint, parsedPayload);

            if (result.success) {
                tile.status = 'success';
                tile.response = JSON.stringify(result.data);

                // Extract ID from response — handle nested objects
                const data = result.data;
                const createdId = data?.id
                    || data?.agent?.id || data?.group?.id || data?.contact?.id
                    || data?.company?.id || data?.ticket?.id || data?.sla_policy?.id
                    || data?.automation_rule?.id || data?.category?.id || data?.folder?.id
                    || data?.article?.id || data?.department?.id || data?.requester?.id
                    || data?.asset?.id || data?.asset_type?.id || data?.vendor?.id
                    || data?.problem?.id || data?.change?.id || data?.release?.id;

                if (createdId) {
                    tile.createdId = createdId;
                    this.executionContext[`${tile.category}:${tile.label}`] = createdId;
                    this.executionContext[tile.label] = createdId;
                    this.logExecution(`✅ ${tile.label} → ID: ${createdId}`);
                } else {
                    this.logExecution(`✅ ${tile.label} — Success`);
                }
            } else {
                tile.status = 'failed';
                tile.response = result.error;
                this.logExecution(`❌ ${tile.label} — ${result.error}`);
            }
        } catch (err) {
            tile.status = 'failed';
            tile.response = err.message;
            this.logExecution(`❌ ${tile.label} — ${err.message}`);
        }

        this.updateTileUI(tile);
    },

    // ---- Execute All ----
    async executeAll() {
        if (!FreshworksService.isConnected()) {
            window.App.showToast('Connect to Freshworks in Settings first!', 'warning');
            return;
        }

        this.phase = 'executing';
        this.executionLog = [];
        this.executionContext = {};
        this.logExecution(`🚀 Executing ${this.tiles.length} tiles → ${FreshworksService.getDomain()}`);
        this.updateUI();

        for (const tile of this.tiles) {
            if (tile.status === 'success') {
                this.logExecution(`⏭️ Skip: ${tile.label} (already done)`);
                continue;
            }

            await this.executeSingle(tile.id);
            await new Promise(r => setTimeout(r, 150)); // Rate limit

            if (tile.status === 'failed') {
                const critical = ['groups', 'agents', 'departments', 'sla_policies', 'roles'];
                if (critical.includes(tile.category)) {
                    this.logExecution(`🛑 STOPPED — critical dependency "${tile.label}" failed.`);
                    window.App.showToast(`Stopped: "${tile.label}" failed. Fix and retry.`, 'error');
                    break;
                }
            }
        }

        const s = this.tiles.filter(t => t.status === 'success').length;
        const f = this.tiles.filter(t => t.status === 'failed').length;
        const p = this.tiles.filter(t => t.status === 'pending').length;
        this.logExecution(`\n📊 Done: ${s} succeeded, ${f} failed, ${p} pending`);
        this.updateUI();
    },

    // ---- Placeholder Resolution ----
    resolvePlaceholders(payloadStr) {
        return payloadStr.replace(/\{\{ref:([^}]+)\}\}/g, (match, key) => {
            const id = this.executionContext[key];
            if (id) return id;
            const parts = key.split(':');
            const label = parts.length > 1 ? parts.slice(1).join(':') : key;
            return this.executionContext[label] || match;
        });
    },

    // ---- Tile Actions ----
    async regenerateTile(tileId) {
        const tile = this.tiles.find(t => t.id === tileId);
        if (!tile) return;
        window.App.showToast('Regenerating...', 'info');

        const result = await GeminiService.generateContent(
            `Regenerate the API payload for this ${this.selectedProduct?.replace(/_/g, ' ')} call.
Category: ${tile.category} | Label: ${tile.label}
Endpoint: ${tile.method} ${tile.endpoint}
Current: ${JSON.stringify(tile.payload, null, 2)}

Reference the official ${this.selectedProduct?.replace(/_/g, ' ')} developer API documentation.
Generate an improved, COMPLETE, ACCURATE JSON payload with all required fields.
For cross-references use {{ref:category:label}} placeholder format.
Output ONLY the JSON payload object.`,
            'Freshworks API expert. Output only valid JSON.'
        );

        if (result.success) {
            try {
                const raw = result.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                tile.payload = JSON.parse(raw);
                const textarea = document.getElementById(`tile-payload-${tileId}`);
                if (textarea) textarea.value = JSON.stringify(tile.payload, null, 2);
                window.App.showToast('Regenerated!', 'success');
            } catch {
                window.App.showToast('Failed to parse', 'warning');
            }
        }
    },

    removeTile(tileId) {
        this.tiles = this.tiles.filter(t => t.id !== tileId);
        this.tiles.forEach((t, i) => t.step = i + 1);
        this.updateUI();
    },

    addCustomTile() {
        const order = this.dependencyOrder[this.selectedProduct] || this.dependencyOrder.freshdesk;
        const newTile = {
            id: `tile_custom_${Date.now()}`,
            step: this.tiles.length + 1,
            category: 'other',
            label: 'Custom API Call',
            method: 'POST',
            endpoint: '/api/v2/',
            payload: { "key": "value" },
            status: 'pending',
            response: null,
            createdId: null
        };
        this.tiles.push(newTile);
        this.updateUI();
        window.App.showToast('Custom tile added at bottom. Edit endpoint & payload.', 'info');
    },

    // ---- Export ----
    exportResults() {
        const exportData = {
            product: this.selectedProduct,
            domain: FreshworksService.getDomain(),
            generated: new Date().toISOString(),
            tiles: this.tiles.map(t => ({
                step: t.step, category: t.category, label: t.label,
                endpoint: `${t.method} ${t.endpoint}`,
                status: t.status, createdId: t.createdId, payload: t.payload
            })),
            context: this.executionContext,
            log: this.executionLog
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `instance-${this.selectedProduct}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.App.showToast('Exported!', 'success');
    },

    // ---- Navigation ----
    backToDiscovery() {
        this.phase = 'discovery';
        this.updateUI();
        setTimeout(() => this.renderMessages(), 100);
    },

    resetAll() {
        this.init();
        this.updateUI();
        setTimeout(() => this.renderMessages(), 100);
    },

    // ---- UI Helpers ----
    updateTileUI(tile) {
        const el = document.getElementById(`tile-${tile.id}`);
        if (el) el.outerHTML = this.renderSingleTile(tile);

        // Update execution log in-place
        let logEl = document.getElementById('ib-exec-log');
        if (!logEl && this.executionLog.length > 0) {
            const container = document.getElementById('ib-tiles-container')?.parentElement;
            if (container) {
                container.insertAdjacentHTML('beforeend', `
                    <div class="glass-card" style="margin-top:var(--space-5);">
                        <h3>📋 Execution Log</h3>
                        <div id="ib-exec-log" style="background:#0d1117;padding:var(--space-4);border-radius:var(--radius-md);font-family:monospace;max-height:250px;overflow-y:auto;color:#7ee787;font-size:var(--font-sm);"></div>
                    </div>`);
                logEl = document.getElementById('ib-exec-log');
            }
        }
        if (logEl) {
            logEl.innerHTML = this.executionLog.map(l => `<div>${l}</div>`).join('');
            logEl.scrollTop = logEl.scrollHeight;
        }
    },

    updateUI() {
        const container = document.getElementById('module-container');
        if (container) container.innerHTML = this.render();
        if (this.phase === 'discovery') setTimeout(() => this.renderMessages(), 50);
    },

    logExecution(msg) {
        this.executionLog.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    },

    async handleFileSelect() {
        const fileInput = document.getElementById('ib-file');
        const previewEl = document.getElementById('ib-file-preview');
        if (fileInput.files.length > 0) {
            this.attachments = [];
            const names = [];
            for (const file of fileInput.files) {
                const processed = await window.App.readFile(file);
                this.attachments.push({ name: file.name, data: processed });
                names.push(file.name);
            }
            previewEl.textContent = `📎 Attached: ${names.join(', ')}`;
            previewEl.style.display = 'block';
        }
    }
};

window.InstanceBuilder = InstanceBuilder;
export default InstanceBuilder;
