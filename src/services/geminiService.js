// ========================================
// AI Service (Powered by OpenRouter)
// Dual Model: Text + Multimodal (Vision)
// ========================================

const GeminiService = {
    openRouterKey: null,
    openRouterModel: null,
    multimodalModel: null,

    init() {
        this.openRouterKey = localStorage.getItem('openrouter_api_key') || window.APP_CONFIG?.OPENROUTER_API_KEY || null;
        this.openRouterModel = localStorage.getItem('openrouter_model') || window.APP_CONFIG?.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free';
        this.multimodalModel = localStorage.getItem('openrouter_multimodal_model') || window.APP_CONFIG?.OPENROUTER_MULTIMODAL_MODEL || 'openai/gpt-5-nano';
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

    setMultimodalModel(model) {
        this.multimodalModel = model;
        localStorage.setItem('openrouter_multimodal_model', model);
        if (window.APP_CONFIG) window.APP_CONFIG.OPENROUTER_MULTIMODAL_MODEL = model;
    },

    isLiveMode() {
        return !!(this.openRouterKey || window.APP_CONFIG?.OPENROUTER_API_KEY);
    },

    async generateContent(prompt, systemInstruction = '', attachments = [], tools = []) {
        const openRouterKey = this.openRouterKey || window.APP_CONFIG?.OPENROUTER_API_KEY;

        if (!openRouterKey) {
            return {
                success: false,
                error: 'No AI Provider Configured. Please add an OpenRouter API key in Settings.'
            };
        }

        // Inject Grounding & Structure Instructions
        const groundingPrompt = `
CROSS-CHECK & GROUNDING INSTRUCTIONS:
1. You MUST cross-check all facts with official internet documentation, product guides, and reputable articles.
2. If citing Freshworks products, refer to official help articles or developer documentation.
3. PROVIDE SOURCE CITATIONS if possible (e.g., [Source: Freshdesk Docs]).
4. STRUCTURE: Use Markdown tables for any comparative data or lists where appropriate. Ensure outputs are highly structured and professional.
5. If unsure about a fact, state that it needs verification from official sources.
`;
        const unifiedSystemInstruction = (systemInstruction ? systemInstruction + "\n" : "") + groundingPrompt;

        const makeRequest = async (modelToUse) => {
            // Auto-select model: use multimodal model when attachments are present
            const hasAttachments = attachments?.length > 0;
            const model = modelToUse || (hasAttachments
                ? (this.multimodalModel || 'openai/gpt-5-nano')
                : (this.openRouterModel || window.APP_CONFIG?.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free'));

            const messages = [];
            if (unifiedSystemInstruction) messages.push({ role: 'system', content: unifiedSystemInstruction });

            // OpenRouter/OpenAI style messages
            let userContent = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

            // Handle attachments — multimodal content parts
            if (hasAttachments) {
                const contentParts = [{ type: 'text', text: userContent }];
                attachments.forEach(file => {
                    contentParts.push({
                        type: 'image_url',
                        image_url: {
                            url: `data:${file.mimeType};base64,${file.data}`
                        }
                    });
                });
                messages.push({ role: 'user', content: contentParts });
            } else {
                messages.push({ role: 'user', content: userContent });
            }

            console.log(`[AI] Using model: ${model}${hasAttachments ? ' (multimodal — attachments detected)' : ' (text)'}`);

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
                throw new Error(errorData.error?.message || response.status);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';
            return { success: true, text, source: 'openrouter', model };
        };

        try {
            return await makeRequest();
        } catch (error) {
            console.error('Primary Model Failed:', error);

            // Fallback Logic
            // If primary failed and we haven't tried the fallback yet, try GPT-4o-mini
            const fallbackModel = 'openai/gpt-5-nano';
            const currentModel = attachments?.length > 0
                ? (this.multimodalModel || 'openai/gpt-5-nano')
                : (this.openRouterModel || window.APP_CONFIG?.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-preview-02-05:free');

            if (currentModel !== fallbackModel) {
                console.warn(`Attempting fallback to ${fallbackModel}...`);
                try {
                    return await makeRequest(fallbackModel);
                } catch (fallbackError) {
                    console.error('Fallback Model Failed:', fallbackError);
                    return { success: false, error: `Primary and Fallback Models Failed. Primary: ${error.message}. Fallback: ${fallbackError.message}` };
                }
            }

            return { success: false, error: `AI Request Failed: ${error.message}` };
        }
    }
};

GeminiService.init();

export default GeminiService;
