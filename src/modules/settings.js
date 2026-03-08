// ========================================
// Settings Page
// ========================================

import AuthService from '../services/authService.js';
import FreshworksService from '../services/freshworksService.js';
import GeminiService from '../services/geminiService.js';

const Settings = {
    render() {
        const fwConnected = FreshworksService.isConnected();
        const aiMode = GeminiService.isLiveMode() ? 'live' : 'demo';

        return `
        <div class="module-page">
            <div class="module-header">
                <h1>⚙️ Settings</h1>
                <p class="module-desc">Configure integrations, credentials, and application preferences.</p>
            </div>

            <div class="settings-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:var(--space-5);">

                <!-- AI Mode -->
                <div class="glass-card module-panel">
                    <h2>🤖 AI Configuration</h2>
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);padding:var(--space-3);background:${aiMode === 'live' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};border-radius:var(--radius-md);">
                        <span style="font-size:1.5rem">${aiMode === 'live' ? '🟢' : '🔴'}</span>
                        <div>
                            <div style="font-weight:600;color:var(--text-primary);">${aiMode === 'live' ? 'AI Ready' : 'AI Unconfigured'}</div>
                            <div style="font-size:var(--font-sm);color:var(--text-secondary);">
                                ${aiMode === 'live' ? 'Connected to OpenRouter' : 'Add an API key to enable live AI'}
                            </div>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">OpenRouter API Key</label>
                        <input id="setting-openrouter-key" class="form-input" type="password" placeholder="OpenRouter API key" value="${GeminiService.openRouterKey || ''}" />
                    </div>

                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">OpenRouter Model</label>
                        <input id="setting-openrouter-model" class="form-input" placeholder="e.g., nvidia/nemotron-nano-12b-v2-vl:free" value="${GeminiService.openRouterModel || 'nvidia/nemotron-nano-12b-v2-vl:free'}" />
                    </div>

                    <div style="display:flex;gap:var(--space-3)">
                        <button class="btn btn-primary" onclick="Settings.saveAI()">💾 Save AI Config</button>
                        <button class="btn btn-secondary" onclick="Settings.testAI()">🧪 Test Connection</button>
                    </div>
                </div>

                <!-- Freshworks -->
                <div class="glass-card module-panel">
                    <h2>🍊 Freshworks Integration</h2>
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);padding:var(--space-3);background:${fwConnected ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)'};border-radius:var(--radius-md);">
                        <span style="font-size:1.5rem">${fwConnected ? '🟢' : '🔴'}</span>
                        <div>
                            <div style="font-weight:600;color:var(--text-primary);">${fwConnected ? 'Connected' : 'Not Connected'}</div>
                            <div style="font-size:var(--font-sm);color:var(--text-secondary);">
                                ${fwConnected ? FreshworksService.getDomain() : 'Configure your domain and API key'}
                            </div>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Freshworks Domain</label>
                        <input id="setting-fw-domain" class="form-input" placeholder="your-company.freshdesk.com" value="${FreshworksService.getDomain() || ''}" />
                    </div>
                    <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">API Key</label>
                        <input id="setting-fw-key" class="form-input" type="password" placeholder="Your Freshworks API key" value="${FreshworksService.getApiKey?.() || localStorage.getItem('fw_api_key') || ''}" />
                        <small style="color:var(--text-tertiary);font-size:var(--font-xs);margin-top:var(--space-1);display:block;">
                            Found in Profile → API Key in your Freshworks admin
                        </small>
                    </div>
                    <div style="display:flex;gap:var(--space-3)">
                        <button class="btn btn-primary" onclick="Settings.saveFreshworks()">💾 Save</button>
                        <button class="btn btn-secondary" onclick="Settings.testFreshworks()">🧪 Test</button>
                    </div>
                </div>

                <!-- App Settings -->
                <div class="glass-card module-panel" style="display:none"></div>

            </div>
        </div>`;
    },

    init() { },

    saveAI() {
        const orKey = document.getElementById('setting-openrouter-key').value;
        const orModel = document.getElementById('setting-openrouter-model').value;

        if (orKey) GeminiService.setOpenRouterKey?.(orKey);
        if (orModel) GeminiService.setOpenRouterModel?.(orModel);

        window.App.showToast('AI configuration saved!', 'success');
        window.App.updateAuthState?.();
    },

    async testAI() {
        window.App.showToast('Testing OpenRouter connection...', 'info');
        const result = await GeminiService.generateContent('Say "Hello, connection test successful!" in one line.', 'Be concise.');
        if (result.success) {
            window.App.showToast('✅ OpenRouter connected! Live mode active.', 'success');
        } else {
            window.App.showToast('❌ Connection failed: ' + (result.error || 'Unknown error'), 'danger');
        }
    },

    saveFreshworks() {
        const domain = document.getElementById('setting-fw-domain').value;
        const apiKey = document.getElementById('setting-fw-key').value;

        FreshworksService.setCredentials(domain, apiKey);
        window.App.showToast('Freshworks credentials saved!', 'success');
        window.App.updateAuthState?.();
    },

    async testFreshworks() {
        if (!FreshworksService.isConnected()) {
            window.App.showToast('Configure credentials first', 'warning');
            return;
        }
        window.App.showToast('Testing Freshworks connection...', 'info');
        const result = await FreshworksService.getTickets();
        if (result.success) {
            window.App.showToast('✅ Freshworks connected!', 'success');
        } else {
            window.App.showToast('❌ Connection failed: ' + (result.error || 'Check credentials'), 'danger');
        }
    },


    saveAppSettings() {
        localStorage.setItem('autosave', document.getElementById('setting-autosave').checked);
        localStorage.setItem('demobanner', document.getElementById('setting-demobanner').checked);
        window.App.showToast('Preferences saved!', 'success');
    },

    clearAll() {
        if (confirm('⚠️ This will clear ALL stored credentials and data. Are you sure?')) {
            localStorage.clear();
            window.App.showToast('All data cleared. Refresh to reset.', 'info');
            setTimeout(() => location.reload(), 1500);
        }
    }
};

window.Settings = Settings;
export default Settings;
