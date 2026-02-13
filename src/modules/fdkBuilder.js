// ========================================
// FDK App Builder (v3.0 — Chat-Based + Intelligent)
// ========================================
import GeminiService from '../services/geminiService.js';
import FdkKnowledge from '../data/fdkKnowledge.js';

const FdkBuilder = {
    // ---- State ----
    state: {
        phase: 'discovery', // discovery | blueprint | coding | done
        messages: [],
        appContext: {
            name: '',
            desc: '',
            products: [],
            features: [],
            integrations: []
        },
        generatedFiles: {},
        activeFile: 'manifest'
    },

    attachments: [],

    // ---- Render ----
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>🔧 FDK Architect AI</h1>
                <p class="module-desc">Conversational engineer for Freshworks apps. Probes requirements, designs architecture, and builds valid FDK v3.0 code.</p>
            </div>

            <!-- Progress -->
            <div class="progress-steps" style="margin-bottom:var(--space-6)">
                <div class="progress-step ${this.state.phase === 'discovery' ? 'active' : (this.state.phase !== 'discovery' ? 'completed' : '')}">
                    <div class="step-dot">1</div>
                    <div class="step-label">Discovery</div>
                </div>
                <div class="step-connector ${this.state.phase !== 'discovery' ? 'completed' : ''}"></div>
                <div class="progress-step ${this.state.phase === 'blueprint' ? 'active' : (['coding', 'done'].includes(this.state.phase) ? 'completed' : '')}">
                    <div class="step-dot">2</div>
                    <div class="step-label">Blueprint</div>
                </div>
                <div class="step-connector ${['coding', 'done'].includes(this.state.phase) ? 'completed' : ''}"></div>
                <div class="progress-step ${this.state.phase === 'coding' ? 'active' : (this.state.phase === 'done' ? 'completed' : '')}">
                    <div class="step-dot">3</div>
                    <div class="step-label">Code Construction</div>
                </div>
            </div>

            ${this.renderPhaseContent()}
        </div>`;
    },

    renderPhaseContent() {
        switch (this.state.phase) {
            case 'discovery':
            case 'blueprint':
                return this.renderChatInterface();
            case 'coding':
            case 'done':
                return this.renderEditorInterface();
            default:
                return this.renderChatInterface();
        }
    },

    // ---- Phase 1 & 2: Chat Interface ----
    renderChatInterface() {
        return `
        <div class="glass-card" style="border-radius:var(--radius-lg);overflow:hidden;height:600px;display:flex;flex-direction:column;">
            <div class="chat-messages" id="fdk-messages" style="flex:1;overflow-y:auto;padding:var(--space-4);">
                <!-- Messages -->
            </div>
            
            <div class="chat-input-area" style="border-top:1px solid var(--border-subtle);padding:var(--space-3);background:var(--surface-2);">
                <div style="display:flex;gap:var(--space-2);">
                    <button class="chat-send" onclick="document.getElementById('fdk-file').click()" style="background:var(--surface-3);color:var(--text-primary)">📎</button>
                    <input type="text" class="chat-input" id="fdk-input" placeholder="Describe your app or integration needs..." 
                           onkeydown="if(event.key==='Enter')FdkBuilder.send()" style="flex:1;" />
                    <button class="chat-send" onclick="FdkBuilder.send()">➤</button>
                </div>
                <input type="file" id="fdk-file" style="display:none" onchange="FdkBuilder.handleFileSelect()" multiple />
                <div id="fdk-file-preview" style="margin-top:0.5rem;color:var(--text-secondary);font-size:0.8rem;display:none;"></div>
            </div>
        </div>

        ${this.state.phase === 'discovery' ? `
            <div style="margin-top:var(--space-4);text-align:center;">
                <button class="btn btn-primary btn-lg" id="btn-generate-blueprint" onclick="FdkBuilder.generateBlueprint()" style="display:none;">
                    📐 Generate Architecture Blueprint
                </button>
            </div>
        ` : ''}

        ${this.state.phase === 'blueprint' ? `
            <div style="margin-top:var(--space-4);text-align:center;display:flex;gap:var(--space-3);justify-content:center;">
                <button class="btn btn-secondary" onclick="FdkBuilder.backToDiscovery()">← Modify Requirements</button>
                <button class="btn btn-primary btn-lg" onclick="FdkBuilder.startCoding()">
                    🚀 Build FDK App (Generate Code)
                </button>
            </div>
        ` : ''}`;
    },

    // ---- Phase 3: Code Editor Interface ----
    renderEditorInterface() {
        const files = ['manifest', 'server', 'iparams', 'index', 'app'];
        const fileLabels = {
            manifest: 'manifest.json',
            server: 'server/server.js',
            iparams: 'config/iparams.json',
            index: 'app/index.html',
            app: 'app/scripts/app.js'
        };

        return `
        <div style="display:flex;gap:var(--space-4);height:700px;">
            <!-- File Sidebar -->
            <div class="glass-card" style="width:250px;display:flex;flex-direction:column;padding:var(--space-2);">
                <h3 style="padding:var(--space-3);margin:0;font-size:var(--font-sm);color:var(--text-secondary);text-transform:uppercase;">📦 App Structure</h3>
                <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:4px;">
                    ${files.map(f => `
                        <button class="file-tab ${this.state.activeFile === f ? 'active' : ''}" 
                                onclick="FdkBuilder.switchFile('${f}')"
                                style="text-align:left;padding:8px 12px;background:${this.state.activeFile === f ? 'var(--primary-color)' : 'transparent'};color:${this.state.activeFile === f ? 'white' : 'var(--text-primary)'};border:none;border-radius:var(--radius-sm);cursor:pointer;display:flex;align-items:center;gap:8px;">
                            <span style="opacity:0.7;">${f === 'index' || f === 'app' ? '📄' : '{ }'}</span>
                            ${fileLabels[f]}
                        </button>
                    `).join('')}
                </div>
                <div style="padding:var(--space-3);border-top:1px solid var(--border-subtle);">
                    <button class="btn btn-primary" style="width:100%;" onclick="FdkBuilder.downloadZip()">
                        💾 Download app.zip
                    </button>
                    <button class="btn btn-secondary" style="width:100%;margin-top:var(--space-2);" onclick="FdkBuilder.resetAll()">
                        🔄 Start New App
                    </button>
                </div>
            </div>

            <!-- Code Editor -->
            <div class="glass-card" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
                <div style="padding:var(--space-3);border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-family:monospace;color:var(--accent-primary);">${fileLabels[this.state.activeFile]}</span>
                    <div style="display:flex;gap:var(--space-2);">
                        <button class="btn btn-sm btn-secondary" onclick="FdkBuilder.saveFile()">Save</button>
                        <button class="btn btn-sm btn-secondary" onclick="FdkBuilder.regenerateFile('${this.state.activeFile}')">✨ Regenerate</button>
                    </div>
                </div>
                <textarea id="fdk-editor" 
                          style="flex:1;background:#0d1117;color:#c9d1d9;border:none;padding:var(--space-4);font-family:'Fira Code',monospace;font-size:13px;line-height:1.5;resize:none;" 
                          spellcheck="false"
                          oninput="FdkBuilder.updateFileContent(this.value)">${this.state.generatedFiles[this.state.activeFile] || '// Generating code...'}</textarea>
            </div>
        </div>`;
    },

    // ---- Logic: Init ----
    init() {
        this.state = {
            phase: 'discovery',
            messages: [],
            appContext: {},
            generatedFiles: {},
            activeFile: 'manifest'
        };
        this.addMessage('ai', `👋 Hello! I'm your **FDK Architect**. I help build serverless apps for Freshworks.

I can build apps that:
- Integrate with **third-party APIs** (Slack, Asana, CRM, etc.) — *I'll self-research the endpoints!*
- Automate ticket workflows
- Add custom widgets to the UI
- Validate data and sync records

**Tell me broadly what you want to build.** (e.g., "A Freshdesk app that creates an Asana task when a ticket is escalated")`);
        this.render();
    },

    // ---- Logic: Chat ----
    addMessage(role, text, badge = null) {
        this.state.messages.push({ role, text, badge });
        this.updateChatUI();
    },

    updateChatUI() {
        const container = document.getElementById('fdk-messages');
        if (!container) return; // Might be in editor view

        container.innerHTML = this.state.messages.map(msg => `
            <div class="chat-message ${msg.role === 'ai' ? 'ai' : 'user'}">
                <div class="chat-avatar">${msg.role === 'ai' ? '🤖' : '👤'}</div>
                <div class="chat-bubble">
                    ${msg.role === 'ai' ? window.MarkdownRenderer.parse(msg.text) : msg.text}
                    ${msg.badge ? `<div class="result-meta" style="margin-top:var(--space-2);opacity:0.7;">${msg.badge}</div>` : ''}
                </div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;

        // Show blueprint button if we have enough context
        const userCount = this.state.messages.filter(m => m.role === 'user').length;
        const btn = document.getElementById('btn-generate-blueprint');
        if (btn && this.state.phase === 'discovery') {
            btn.style.display = userCount >= 2 ? 'inline-block' : 'none';
        }
    },

    async send() {
        const input = document.getElementById('fdk-input');
        const text = input.value.trim();
        if (!text && this.attachments.length === 0) return;

        input.value = '';
        this.addMessage('user', text + (this.attachments.length ? `\n[Attached: ${this.attachments.map(a => a.name).join(', ')}]` : ''));

        const currentAttachments = this.attachments.map(a => a.data);
        this.attachments = [];
        document.getElementById('fdk-file-preview').style.display = 'none';

        // Loading
        const container = document.getElementById('fdk-messages');
        container.insertAdjacentHTML('beforeend', `<div class="chat-message ai" id="fdk-loading"><div class="chat-avatar">🤖</div><div class="chat-bubble"><span class="loading-dots">Thinking</span></div></div>`);
        container.scrollTop = container.scrollHeight;

        // AI Call
        const history = this.state.messages.map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');

        const result = await GeminiService.generateContent(
            `You are an expert FDK Developer & Solution Architect.
Current Phase: **${this.state.phase.toUpperCase()}**

User's Goal: Build a Freshworks App (FDK v3.0, Node.js 18).

Conversation History:
${history}

**YOUR TASK:**
1. **Probe for *Sufficient* Clarity:** Do not ask for confirmation of details you can reasonably infer. If a user asks for "Jira integration", assume standard Create/Update actions unless specified otherwise.
2. **Move Fast:** If you have enough info to build a basic Minimum Viable Product (MVP), **STOP PROBING** and propose the Blueprint immediately.
3. **Third-Party Integrations:**
   - **Self-Solve:** Search your internal knowledge base for their API endpoints.
   - **Do NOT ask users for endpoints** unless it's a private custom API.
   - **Assume standard defaults** for unspecified minor details.
4. **Specific Questions Only:** If you MUST ask a question, make it a blocker (e.g., "I need the API Key to proceed" or "Which specific Jira project?"). Do not ask "Is this correct?" or "Shall I proceed?". Just proceed.

**Output Rule:**
- If you have enough to start a Manifest and basic Serverless functioning -> **Propose Blueprint**.
- If you are missing a CRITICAL piece of info (like which product to integrate with) -> Ask **ONE** specific question.`,
            'You are a Senior FDK Engineer. You are decisive and action-oriented. You avoid loops. You self-solve integration details.',
            currentAttachments
        );

        document.getElementById('fdk-loading')?.remove();

        if (result.success) {
            this.addMessage('ai', result.text, window.App.getAiBadge(result));
        } else {
            this.addMessage('ai', `❌ Error: ${result.error}`);
        }
    },

    // ---- Logic: Blueprint ----
    async generateBlueprint() {
        window.App.showToast('Architecting solution...', 'info');
        this.state.phase = 'blueprint';
        this.render(); // Switch view context if needed? No, staying in chat but updating buttons.

        const history = this.state.messages.map(m => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');

        const result = await GeminiService.generateContent(
            `Generate a **Technical Blueprint** for this app based on the conversation.
            
Conversation:
${history}

**OUTPUT FORMAT:**
Markdown with these sections:
1. **App Summary**: 1-line description.
2. **Components**:
   - **Locations**: (e.g., ticket_sidebar)
   - **Events**: (e.g., onTicketCreate)
   - **Serverless**: Yes/No
3. **Integration Strategy**:
   - **External APIs**: List exact endpoints you will call (e.g., \`POST https://app.asana.com/api/1.0/tasks\`)
   - **Auth**: How auth will be handled (iparams secure: true)
4. **Data Flow**: Step-by-step logic.

**CRITICAL:** If explicit external API docs weren't provided, use your **INTERNAL KNOWLEDGE** to propose the correct standard endpoints (Curl format).`,
            'You are a generic FDK Solutions Architect.'
        );

        if (result.success) {
            this.addMessage('ai', `📋 **Architecture Blueprint**\n\n${result.text}\n\nReview this plan. If it looks good, click **Build FDK App** to generate the code!`, window.App.getAiBadge(result));
        }
    },

    // ---- Logic: Coding ----
    async startCoding() {
        this.state.phase = 'coding';
        this.render();
        window.App.showToast('Spinning up FDK code generator...', 'success');

        // Parallel generation of core files
        await this.generateAllFiles();
    },

    async generateAllFiles() {
        const promptContext = this.state.messages.slice(-6).map(m => m.text).join('\n');

        const filesToGen = ['manifest', 'server', 'iparams', 'index', 'app'];

        for (const file of filesToGen) {
            this.state.generatedFiles[file] = `// Generating ${file}...\n// Please wait.`;
        }
        this.render(); // Update UI

        // Generate Manifest first as it dictates structure
        await this.regenerateFile('manifest', promptContext);

        // Then others in parallel-ish
        await this.regenerateFile('iparams', promptContext);
        await this.regenerateFile('server', promptContext);
        await this.regenerateFile('index', promptContext);
        await this.regenerateFile('app', promptContext);

        this.state.phase = 'done';
        window.App.showToast('App build complete!', 'success');
    },

    async regenerateFile(fileType, context = '') {
        const filePrompts = {
            manifest: 'Generate **manifest.json**. Standards: "platform-version":"3.0", Node "18.13.0". Whitelist domains if needed.',
            server: 'Generate **server/server.js**. Use ES6. Exports = { events: ... }. Use `await $request.invokeTemplate` or `$request.post`. Handle errors.',
            iparams: 'Generate **config/iparams.json**. Use standard fields (api_key, domain). Secure fields for auth.',
            index: 'Generate **app/index.html**. Include Freshworks CRUD script `<script src="{{{appclient}}}"></script>`. Clean, modern UI using existing styles.',
            app: 'Generate **app/scripts/app.js**. Use `client.init()`, `client.events.on("app.activated")`. Handle resize/interface logic.'
        };

        const result = await GeminiService.generateContent(
            `Generate the file content for: **${fileType}**
Context:
${context || this.state.messages.map(m => m.text).join('\n')}

**RULES:**
1. Output **ONLY** the raw code/json. NO markdown blocks.
2. FDK v3.0 Standards.
3. For integrations, USE THE CORRECT 3RD PARTY ENDPOINTS identified in the blueprint.
4. If writing JSON, ensure validity.`,
            'You are a code generator. Output RAW TEXT only.'
        );

        if (result.success) {
            let code = result.text.replace(/```\w*\n?/g, '').replace(/```$/g, '').trim();
            this.state.generatedFiles[fileType] = code;
            if (this.state.activeFile === fileType) {
                document.getElementById('fdk-editor').value = code;
            }
        }
    },

    // ---- File Management ----
    switchFile(file) {
        this.state.activeFile = file;
        this.render(); // Re-renders editor with new value
    },

    updateFileContent(val) {
        this.state.generatedFiles[this.state.activeFile] = val;
    },

    saveFile() {
        window.App.showToast(`Saved ${this.state.activeFile}`, 'success');
        // In a real app, this might persist to local storage or disk
    },

    async downloadZip() {
        if (!window.JSZip) {
            window.App.showToast('JSZip not loaded. Check internet connection.', 'error');
            return;
        }

        const zip = new JSZip();
        zip.file('manifest.json', this.state.generatedFiles['manifest']);
        zip.file('README.md', '# Generated FDK App\n\nRun `fdk run` to start.');

        const server = zip.folder('server');
        server.file('server.js', this.state.generatedFiles['server']);

        const config = zip.folder('config');
        config.file('iparams.json', this.state.generatedFiles['iparams']);

        const app = zip.folder('app');
        app.file('index.html', this.state.generatedFiles['index']);
        const scripts = app.folder('scripts');
        scripts.file('app.js', this.state.generatedFiles['app']);

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'fdk-app.zip';
        a.click();
        window.App.showToast('Downloading app.zip...', 'success');
    },

    // ---- Nav ----
    backToDiscovery() {
        this.state.phase = 'discovery';
        this.render();
    },

    resetAll() {
        this.init();
    },

    // ---- File Input ----
    async handleFileSelect() {
        const fileInput = document.getElementById('fdk-file');
        const previewEl = document.getElementById('fdk-file-preview');
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

window.FdkBuilder = FdkBuilder;
export default FdkBuilder;
