// ========================================
// Gemini AI Service
// ========================================

const GeminiService = {
    apiKey: null,
    oauthToken: null,

    init() {
        // Priority: 1. Config (Env/Injection) -> 2. LocalStorage
        this.apiKey = window.APP_CONFIG?.GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || null;
    },

    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    },

    setOAuthToken(token) {
        this.oauthToken = token;
    },

    getApiKey() {
        return this.apiKey;
    },

    isLiveMode() {
        return !!(this.apiKey || this.oauthToken || window.ai);
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
        if (!this.isLiveMode()) {
            return { success: false, demo: true, message: 'Demo mode — no API key configured' };
        }

        try {
            // 1. Try Chrome Native AI (window.ai) if no API key is set
            if (!this.apiKey && !this.oauthToken && window.ai) {
                try {
                    const session = await window.ai.createTextSession({
                        initialPrompts: systemInstruction ? [{ role: "system", content: systemInstruction }] : []
                    });

                    // Construct prompt from parts
                    const fullPrompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
                    const result = await session.prompt(fullPrompt);

                    // Helper to handle streaming or direct response (current API returns string)
                    const text = typeof result === 'string' ? result : (result.response || '');

                    session.destroy();
                    return { success: true, demo: false, text, source: 'chrome-nano' };
                } catch (nanoError) {
                    console.warn('Chrome AI failed, falling back to demo/error:', nanoError);
                    // Fall through to standard error handling or just return error
                    throw new Error(`Chrome AI Error: ${nanoError.message}`);
                }
            }

        }

            // 2. Standard Gemini API Call
            if (!this.apiKey && !this.oauthToken) {
            return { success: false, demo: true, message: 'Configuration Error: No API Key found and Chrome AI unavailable/failed. Please add an API Key or enable Chrome Built-in AI.' };
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent${this.getAuthHeader()}`;

        // Construct parts array with text and optional attachments
        const parts = [{ text: prompt }];

        if (attachments && attachments.length > 0) {
            attachments.forEach(file => {
                parts.push({
                    inline_data: {
                        mime_type: file.mimeType,
                        data: file.data
                    }
                });
            });
        }

        const body = {
            contents: [{ parts }],
        };

        if (tools && tools.length > 0) {
            body.tools = tools;
        }

        if (systemInstruction) {
            body.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const headers = { 'Content-Type': 'application/json' };
        if (this.oauthToken) {
            headers['Authorization'] = `Bearer ${this.oauthToken}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return { success: true, demo: false, text, source: 'gemini-api' };
    } catch(error) {
        console.error('Gemini API Error:', error);
        return { success: false, demo: false, error: error.message };
    }
}
};

GeminiService.init();

export default GeminiService;
