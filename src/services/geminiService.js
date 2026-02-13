// ========================================
// Gemini AI Service
// ========================================

const GeminiService = {
    apiKey: null,
    oauthToken: null,

    init() {
        // Priority: 1. LocalStorage -> 2. Config (Env/Injection)
        this.apiKey = localStorage.getItem('gemini_api_key') || window.APP_CONFIG?.GEMINI_API_KEY || null;
        this.openRouterKey = localStorage.getItem('openrouter_api_key') || window.APP_CONFIG?.OPENROUTER_API_KEY || null;
        this.openRouterModel = localStorage.getItem('openrouter_model') || window.APP_CONFIG?.OPENROUTER_MODEL || 'arcee-ai/trinity-large-preview:free';
    },

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    },

    setOAuthToken(token) {
        this.oauthToken = token;
    },

    setOpenRouterKey(key) {
        this.openRouterKey = key;
        localStorage.setItem('openrouter_api_key', key);
        if (window.APP_CONFIG) window.APP_CONFIG.OPENROUTER_API_KEY = key;
    },

    setOpenRouterModel(model) {
        this.openRouterModel = model;
        localStorage.setItem('openrouter_model', model);
        if (window.APP_CONFIG) window.APP_CONFIG.OPENROUTER_MODEL = model;
    },

    getApiKey() {
        return this.apiKey;
    },

    isLiveMode() {
        return !!(this.apiKey || this.oauthToken || window.ai || window.APP_CONFIG?.OPENROUTER_API_KEY);
    },

    async isChromeAiAvailable() {
        if (!window.ai) return false;
        try {
            const status = await window.ai.canCreateTextSession();
            return status === 'readily';
        } catch (e) {
            console.warn('Chrome AI check failed:', e);
            return false;
        }
    },

    getAuthHeader() {
        if (this.apiKey) return `?key=${this.apiKey}`;
        return '';
    },

    async generateContent(prompt, systemInstruction = '', attachments = [], tools = []) {
        // 1. Try Chrome Native AI (window.ai)
        if (!this.apiKey && !this.oauthToken && window.ai) {
            try {
                const session = await window.ai.createTextSession({
                    initialPrompts: systemInstruction ? [{ role: "system", content: systemInstruction }] : []
                });

                const fullPrompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
                const result = await session.prompt(fullPrompt);
                const text = typeof result === 'string' ? result : (result.response || '');
                session.destroy();
                return { success: true, demo: false, text, source: 'chrome-nano' };
            } catch (nanoError) {
                console.warn('Chrome AI failed:', nanoError);
            }
        }

        // 2. Try Gemini API
        if (this.apiKey || this.oauthToken) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent${this.getAuthHeader()}`;

                const parts = [{ text: prompt }];
                if (attachments?.length > 0) {
                    attachments.forEach(file => {
                        parts.push({ inline_data: { mime_type: file.mimeType, data: file.data } });
                    });
                }

                const body = { contents: [{ parts }] };
                if (tools?.length > 0) body.tools = tools;
                if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };

                const headers = { 'Content-Type': 'application/json' };
                if (this.oauthToken) headers['Authorization'] = `Bearer ${this.oauthToken}`;

                const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
                if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                return { success: true, demo: false, text, source: 'gemini-api' };
            } catch (geminiError) {
                console.error('Gemini API Error:', geminiError);
                // Fallthrough to OpenRouter if configured
            }
        }

        // 3. Try OpenRouter (Fallback)
        const openRouterKey = this.openRouterKey || window.APP_CONFIG?.OPENROUTER_API_KEY;
        if (openRouterKey) {
            try {
                const model = this.openRouterModel || window.APP_CONFIG?.OPENROUTER_MODEL || 'arcee-ai/trinity-large-preview:free';

                const messages = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: typeof prompt === 'string' ? prompt : JSON.stringify(prompt) });

                // Attachments not fully supported on OpenRouter text-only models yet, skipping for now in fallback

                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openRouterKey}`,
                        'Content-Type': 'application/json',
                        'X-Title': 'SE Workstation'
                    },
                    body: JSON.stringify({
                        model,
                        messages
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`OpenRouter error: ${errorData.error?.message || response.status}`);
                }

                const data = await response.json();
                const text = data.choices?.[0]?.message?.content || '';
                return { success: true, demo: false, text, source: 'openrouter' };

            } catch (orError) {
                console.error('OpenRouter Error:', orError);
                return { success: false, demo: false, error: `OpenRouter Failed: ${orError.message}` };
            }
        }

        // 4. Fallback to Demo Mode
        return { success: false, demo: true, message: 'No working AI provider found (Chrome AI, Gemini, or OpenRouter).' };
    }
};

GeminiService.init();

export default GeminiService;
