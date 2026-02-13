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
        this.openRouterModel = localStorage.getItem('openrouter_model') || window.APP_CONFIG?.OPENROUTER_MODEL || 'google/gemma-3-27b-it:free';
        this.multimodalModel = localStorage.getItem('openrouter_multimodal_model') || window.APP_CONFIG?.OPENROUTER_MULTIMODAL_MODEL || 'google/gemma-3-27b-it:free';
        this.secondaryMultimodalModel = localStorage.getItem('openrouter_multimodal_secondary_model') || window.APP_CONFIG?.OPENROUTER_MULTIMODAL_SECONDARY_MODEL || 'nvidia/nemotron-nano-12b-v2-vl:free';
        this.tertiaryMultimodalModel = localStorage.getItem('openrouter_multimodal_tertiary_model') || window.APP_CONFIG?.OPENROUTER_MULTIMODAL_TERTIARY_MODEL || 'qwen/qwen3-vl-30b-a3b-instruct';
        this.googleAIKey = localStorage.getItem('google_ai_key') || window.APP_CONFIG?.GOOGLE_AI_KEY || null;
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

    setSecondaryMultimodalModel(model) {
        this.secondaryMultimodalModel = model;
        localStorage.setItem('openrouter_multimodal_secondary_model', model);
        if (window.APP_CONFIG) window.APP_CONFIG.OPENROUTER_MULTIMODAL_SECONDARY_MODEL = model;
    },

    setTertiaryMultimodalModel(model) {
        this.tertiaryMultimodalModel = model;
        localStorage.setItem('openrouter_multimodal_tertiary_model', model);
        if (window.APP_CONFIG) window.APP_CONFIG.OPENROUTER_MULTIMODAL_TERTIARY_MODEL = model;
    },

    setGoogleAIKey(key) {
        this.googleAIKey = key;
        localStorage.setItem('google_ai_key', key);
        if (window.APP_CONFIG) window.APP_CONFIG.GOOGLE_AI_KEY = key;
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

        const makeRequest = async (model) => {
            const hasAttachments = attachments?.length > 0;
            const messages = [];
            if (unifiedSystemInstruction) messages.push({ role: 'system', content: unifiedSystemInstruction });

            // OpenRouter/OpenAI style messages
            let userContent = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

            // Handle attachments — support image, audio, video, and PDF
            if (hasAttachments) {
                const contentParts = [{ type: 'text', text: userContent }];
                attachments.forEach(file => {
                    if (file.mimeType.startsWith('image/')) {
                        contentParts.push({
                            type: 'image_url',
                            image_url: { url: `data:${file.mimeType};base64,${file.data}` }
                        });
                    } else if (file.mimeType.startsWith('audio/')) {
                        contentParts.push({
                            type: 'input_audio',
                            input_audio: { data: file.data, format: file.mimeType.split('/')[1] }
                        });
                    } else {
                        // For PDFs and other files, use OpenRouter's file structure
                        contentParts.push({
                            type: 'file',
                            file: { data: file.data, mime_type: file.mimeType }
                        });
                    }
                });
                messages.push({ role: 'user', content: contentParts });
            } else {
                messages.push({ role: 'user', content: userContent });
            }

            console.log(`[AI] Using model: ${model}${hasAttachments ? ' (multimodal detected)' : ' (text)'}`);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'X-Title': 'SE Workstation'
                },
                body: JSON.stringify({
                    model,
                    messages,
                    // Auto-enable OCR for non-multimodal models if needed
                    provider: {
                        pdf_engine: 'pdf-text'
                    }
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

        const makeGoogleRequest = async (model) => {
            const apiKey = this.googleAIKey || window.APP_CONFIG?.GOOGLE_AI_KEY;
            if (!apiKey) throw new Error('Google AI Key not configured');

            const contents = [];
            // Google Gemini API structure
            if (unifiedSystemInstruction) {
                // Gemini 1.5/2.0 supports system_instruction at root, 
                // but for simple REST we can prepend to prompt or use 'system' role depending on API version
            }

            const apiParts = [{ text: prompt }];
            attachments.forEach(file => {
                apiParts.push({
                    inline_data: {
                        mime_type: file.mimeType,
                        data: file.data
                    }
                });
            });

            contents.push({ role: 'user', parts: apiParts });

            console.log(`[AI] Using NATIVE Google Gemini: ${model}`);

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || response.status);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return { success: true, text, source: 'google-ai-studio', model };
        };

        const hasAttachments = attachments?.length > 0;
        // Create a list of models to try in order (Gemma -> Nvidia -> Qwen -> Google)
        const retryChain = [
            { id: initialModel, provider: 'openrouter' }
        ];

        // Always include fallbacks to ensure robustness for both text and multimodal
        const fallbacks = [
            { id: this.multimodalModel || 'google/gemma-3-27b-it:free', provider: 'openrouter' },
            { id: this.secondaryMultimodalModel || 'nvidia/nemotron-nano-12b-v2-vl:free', provider: 'openrouter' },
            { id: this.tertiaryMultimodalModel || 'qwen/qwen3-vl-30b-a3b-instruct', provider: 'openrouter' },
            { id: 'gemini-3-flash-preview', provider: 'google' } // Final Native Fallback
        ];

        fallbacks.forEach(fm => {
            if (!retryChain.find(m => m.id === fm.id)) retryChain.push(fm);
        });

        let lastError = null;
        for (const modelToTry of retryChain) {
            try {
                if (modelToTry.id !== initialModel) {
                    console.warn(`[AI] Primary failed. Attempting fallback to ${modelToTry.id} (${modelToTry.provider})...`);
                }

                if (modelToTry.provider === 'google') {
                    return await makeGoogleRequest(modelToTry.id);
                } else {
                    return await makeRequest(modelToTry.id);
                }
            } catch (error) {
                console.error(`[AI] Model ${modelToTry.id} failed:`, error.message);
                lastError = error;
            }
        }

        return {
            success: false,
            error: `All AI models failed. Attempts: ${retryChain.map(m => m.id).join(' -> ')}. Last error: ${lastError?.message}`
        };
    }
};

GeminiService.init();

export default GeminiService;
