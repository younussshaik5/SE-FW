// ========================================
// SE Workstation — Core Application
// ========================================

import GeminiService from './services/geminiService.js';
import FreshworksService from './services/freshworksService.js';
import AuthService from './services/authService.js';
import SlackService from './services/slackService.js';

// Module imports
import DemoStrategy from './modules/demoStrategy.js';
import RiskReport from './modules/riskReport.js';
import ValueArchitecture from './modules/valueArchitecture.js';
import Battlecards from './modules/battlecards.js';
import DealMeddpicc from './modules/dealMeddpicc.js';
import ExecTranslator from './modules/execTranslator.js';
import DataSeeder from './modules/dataSeeder.js';
import TechUtilities from './modules/techUtilities.js';
import FdkBuilder from './modules/fdkBuilder.js';
import InstanceBuilder from './modules/instanceBuilder.js';
import PortalGenerator from './modules/portalGenerator.js';
import VoiceBotConfig from './modules/voiceBotConfig.js';
import GroundingEngine from './modules/groundingEngine.js';
import Settings from './modules/settings.js';

const App = {
    // Module registry
    modules: {
        'demo-strategy': DemoStrategy,
        'risk-report': RiskReport,
        'value-architecture': ValueArchitecture,
        'battlecards': Battlecards,
        'deal-meddpicc': DealMeddpicc,
        'exec-translator': ExecTranslator,
        'data-seeder': DataSeeder,
        'tech-utilities': TechUtilities,
        'fdk-builder': FdkBuilder,
        'instance-builder': InstanceBuilder,
        'portal-generator': PortalGenerator,
        'voice-bot': VoiceBotConfig,
        'grounding-engine': GroundingEngine,
        'settings': Settings
    },

    currentModule: 'demo-strategy',

    init() {
        this.initSidebar();
        this.initBanner();
        this.initServices();
        this.navigateTo(this.currentModule);
        this.updateAuthState();

        // Restore sidebar state
        if (localStorage.getItem('sidebar-collapsed') === 'true') {
            document.getElementById('sidebar').classList.add('collapsed');
        }
    },

    // ---- Sidebar ----
    initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebar-toggle');

        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });

        // Navigation clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const moduleId = e.currentTarget.dataset.module;
                if (moduleId) this.navigateTo(moduleId);
            });
        });
    },

    // ---- Navigation ----
    navigateTo(moduleId) {
        const moduleObj = this.modules[moduleId];
        if (!moduleObj) {
            console.warn(`Module not found: ${moduleId}`);
            return;
        }

        this.currentModule = moduleId;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.module === moduleId);
        });

        // Render module content
        const container = document.getElementById('module-container');
        container.classList.add('fade-out');

        setTimeout(() => {
            container.innerHTML = moduleObj.render();
            container.classList.remove('fade-out');
            container.classList.add('fade-in');

            // Initialize the module
            if (moduleObj.init) {
                moduleObj.init();
            }

            // Remove animation class after completion
            setTimeout(() => container.classList.remove('fade-in'), 300);
        }, 150);
    },

    // ---- Banner ----
    initBanner() {
        const dismiss = document.getElementById('dismiss-banner');
        if (dismiss) {
            dismiss.addEventListener('click', () => {
                document.getElementById('demo-banner').style.display = 'none';
            });
        }
    },

    // ---- Services Initialization ----
    initServices() {
        // Restore saved credentials
        const fwDomain = localStorage.getItem('fw_domain');
        const fwApiKey = localStorage.getItem('fw_api_key');
        if (fwDomain && fwApiKey) {
            FreshworksService.setCredentials(fwDomain, fwApiKey);
        }

        const slackWebhook = localStorage.getItem('slack_webhook');
        if (slackWebhook) {
            SlackService.setWebhookUrl(slackWebhook);
        }

        const geminiKey = localStorage.getItem('gemini_api_key');
        if (geminiKey && GeminiService.setApiKey) {
            GeminiService.setApiKey(geminiKey);
        }

        const oauthClient = localStorage.getItem('google_client_id');
        if (oauthClient) {
            AuthService.setClientId(oauthClient);
        }
    },

    // ---- Auth State ----
    updateAuthState() {
        const isLive = GeminiService.isLiveMode();
        const demoIndicator = document.getElementById('demo-mode-indicator');
        const demoBanner = document.getElementById('demo-banner');

        if (demoIndicator) {
            if (isLive) {
                demoIndicator.innerHTML = '<span class="demo-dot" style="background:var(--success)"></span><span class="demo-text">AI Ready</span>';
            } else {
                demoIndicator.innerHTML = '<span class="demo-dot" style="background:var(--danger)"></span><span class="demo-text">AI Unconfigured</span>';
            }
        }

        if (demoBanner) {
            demoBanner.style.display = 'none'; // Always hide the demo banner
        }
    },

    // ---- Toast Notifications ----
    showToast(message, type = 'info') {
        // Remove existing toasts
        document.querySelectorAll('.toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideUp 0.3s ease-out',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            maxWidth: '400px'
        });

        const colors = {
            success: { bg: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' },
            danger: { bg: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' },
            warning: { bg: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' },
            info: { bg: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }
        };

        const c = colors[type] || colors.info;
        toast.style.background = c.bg;
        toast.style.border = c.border;
        toast.style.color = c.color;

        document.body.appendChild(toast);

        // Auto-dismiss
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // ---- UI Helpers ----
    getAiBadge(result) {
        if (!result) return '';

        const sources = {
            'chrome-nano': '✨ Chrome Built-in AI',
            'gemini-api': '💎 Google Gemini API',
            'openrouter': '🌐 OpenRouter API'
        };

        const label = sources[result.source] || 'Unknown AI';
        return `<div class="ai-badge live-badge">🤖 ${label}</div>`;
    },

    // ---- File Handling Helper ----
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix (e.g., "data:image/png;base64,")
                const base64Data = reader.result.split(',')[1];
                resolve({
                    mimeType: file.type,
                    data: base64Data
                });
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },

    // ---- Copy to Clipboard (Rich Text Support) ----
    copyToClipboard(param) {
        const el = typeof param === 'string' ? document.getElementById(param) : param;
        if (!el) return;

        const plainText = el.innerText;
        const htmlContent = el.innerHTML;

        // Modern Clipboard API
        if (navigator.clipboard && window.ClipboardItem) {
            const blobText = new Blob([plainText], { type: 'text/plain' });
            const blobHtml = new Blob([htmlContent], { type: 'text/html' });
            const item = new ClipboardItem({
                'text/plain': blobText,
                'text/html': blobHtml
            });

            navigator.clipboard.write([item]).then(() => {
                this.showToast('Copied to clipboard (with formatting)!', 'success');
            }).catch(err => {
                console.error('Clipboard error:', err);
                this.fallbackCopy(el);
            });
        } else {
            this.fallbackCopy(el);
        }
    },

    fallbackCopy(el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy', 'danger');
        }
        selection.removeAllRanges();
    }
};

// Make App globally accessible
window.App = App;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
