// ========================================
// AI Service (Powered by OpenRouter)
// Dual Model: Text + Multimodal (Vision)
// ========================================

const GeminiService = {
    openRouterKey: null,
    openRouterModel: null,
    multimodalModel: null,
    responseCache: new Map(), // Cache for storing responses

    init() {
        const getValidKey = (key) => (key && key.trim() !== "") ? key : null;

        this.openRouterKey = getValidKey(localStorage.getItem('openrouter_api_key')) ||
            getValidKey(window.APP_CONFIG?.OPENROUTER_API_KEY) ||
            getValidKey(window.ENV?.OPENROUTER_API_KEY) || null;

        this.openRouterModel = getValidKey(localStorage.getItem('openrouter_model')) ||
            getValidKey(window.APP_CONFIG?.OPENROUTER_MODEL) ||
            getValidKey(window.ENV?.OPENROUTER_MODEL) || 'nvidia/nemotron-nano-12b-v2-vl:free';

        this.multimodalModel = getValidKey(localStorage.getItem('openrouter_multimodal_model')) ||
            getValidKey(window.APP_CONFIG?.OPENROUTER_MULTIMODAL_MODEL) ||
            getValidKey(window.ENV?.OPENROUTER_MULTIMODAL_MODEL) || 'arcee-ai/trinity-large-preview:free';
        this.secondaryMultimodalModel = localStorage.getItem('openrouter_multimodal_secondary_model') || window.APP_CONFIG?.OPENROUTER_MULTIMODAL_SECONDARY_MODEL || 'google/gemini-2.5-flash-lite';
        this.tertiaryMultimodalModel = localStorage.getItem('openrouter_multimodal_tertiary_model') || window.APP_CONFIG?.OPENROUTER_MULTIMODAL_TERTIARY_MODEL || null;
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

    clearCache() {
        this.responseCache.clear();
        console.log('[AI] Cache cleared');
    },

    getCacheSize() {
        return this.responseCache.size;
    },

    isLiveMode() {
        return !!(this.openRouterKey || window.APP_CONFIG?.OPENROUTER_API_KEY || window.ENV?.OPENROUTER_API_KEY);
    },

    async generateContent(prompt, systemInstruction = '', attachments = [], tools = [], options = {}) {
        const openRouterKey = this.openRouterKey || window.APP_CONFIG?.OPENROUTER_API_KEY;

        if (!openRouterKey) {
            return {
                success: false,
                error: 'No AI Provider Configured. Please add an OpenRouter API key in Settings.'
            };
        }

        // basic validation for attachments
        if (attachments && attachments.length > 0) {
            const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file threshold
            let totalBytes = 0;
            for (const a of attachments) {
                if (!a.data || typeof a.data !== 'string' || a.data.trim() === '') {
                    return {
                        success: false,
                        error: 'Attachment payload missing base64 data. Please re‑upload the file using the correct <file> syntax.'
                    };
                }

                // approximate size: base64 length * 3/4 minus padding
                const approxBytes = Math.ceil((a.data.length * 3) / 4);
                totalBytes += approxBytes;

                if (approxBytes > MAX_FILE_BYTES) {
                    return {
                        success: false,
                        error: `Attachment "${a.name || 'file'}" is too large (~${Math.round(approxBytes / 1024 / 1024)}MB). Please split or compress the file.`
                    };
                }
            }
            if (totalBytes > 20 * 1024 * 1024) { // warn if combined >20MB
                console.warn('[AI] Total attachments size exceeds 20MB:', totalBytes);
            }
        }

        // Generate cache key based on prompt, systemInstruction, and attachments
        const cacheKey = JSON.stringify({
            prompt,
            systemInstruction,
            attachments: attachments.map(a => ({ mimeType: a.mimeType, data: a.data.substring(0, 100) })) // Only cache first 100 chars of attachment data
        });

        // Check cache first (only for text-only requests)
        if (attachments.length === 0 && this.responseCache.has(cacheKey)) {
            console.log('[AI] Returning cached response');
            return this.responseCache.get(cacheKey);
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
            // We will NOT embed full base64 file data into the user message (that bloats tokens).
            // Instead, send the raw base64 in the top-level `files` array and include small
            // metadata placeholders in the user message so models can reference the files.
            let filesPayload = null;
            if (hasAttachments) {
                filesPayload = attachments.map(file => ({
                    name: file.name || 'file',
                    data: file.data, // base64 string only
                    mime_type: file.mimeType
                }));

                // Create lightweight file placeholders (name + size) instead of full data
                const fileBlocks = attachments.map(f => {
                    const approxBytes = Math.ceil((f.data.length * 3) / 4);
                    const sizeMB = Math.round((approxBytes / (1024 * 1024)) * 10) / 10;
                    return `\n<file name="${f.name || 'file'}" size="${sizeMB}MB">[SEE files ARRAY]</file>`;
                }).join('\n');

                userContent = userContent + '\n\n' + fileBlocks;
                messages.push({ role: 'user', content: userContent });
            } else {
                messages.push({ role: 'user', content: userContent });
            }

            // Prevent huge requests: estimate tokens and apply a middle-out compression if necessary
            const estimateTokens = (txt) => Math.ceil((txt.length || 0) / 4);
            const MAX_TOKENS = 131072; // conservative upper bound from provider error
            const totalText = messages.map(m => m.content).join('\n\n');
            const approxTokens = estimateTokens(totalText);
            if (approxTokens > MAX_TOKENS) {
                // compress user content by keeping head+tail and inserting a notice
                const maxChars = Math.floor(MAX_TOKENS * 4 * 0.8); // leave room for system/context
                const head = userContent.slice(0, Math.floor(maxChars / 2));
                const tail = userContent.slice(-Math.floor(maxChars / 2));
                const compressed = head + "\n\n...[CONTENT TRUNCATED TO FIT LIMIT]...\n\n" + tail;
                // replace the user message with compressed version
                messages[messages.length - 1] = { role: 'user', content: compressed + '\n\n[Full files are provided in the files array]' };
                console.warn('[AI] Input compressed to fit token limits — original content truncated.');
            }

            console.log(`[AI] Using model: ${model}${hasAttachments ? ' (multimodal detected)' : ' (text)'}`);
            // build payload and log for debugging
            const payload = {
                model,
                messages,
                tools: tools.length > 0 ? tools : undefined
            };
            // apply model options if provided
            if (options?.temperature !== undefined) payload.temperature = options.temperature;
            if (options?.max_tokens !== undefined) payload.max_tokens = options.max_tokens;
            if (filesPayload) {
                payload.files = filesPayload;
                console.log('[AI] Attaching files:', filesPayload.map(f => f.name));
            }
            console.log('[AI] Request payload', payload);

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${openRouterKey}`,
                    'Content-Type': 'application/json',
                    'X-Title': 'SE Workstation'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(60000) // 60s timeout
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[AI] Provider error data:', errorData);
                const msg = errorData.error?.message || errorData.message || response.status;
                throw new Error(msg);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || '';
            // guard against providers returning error messages inside a 200 response
            if (/^(error[:\s]|all ai models failed)/i.test((text || '').trim())) {
                // propagate as an exception to trigger retry logic
                throw new Error(text || 'Unknown provider error');
            }
            return { success: true, text, source: 'openrouter', model };
        };

        const primaryModel = this.openRouterModel || 'nvidia/nemotron-nano-12b-v2-vl:free';
        const multimodal1 = this.multimodalModel || 'arcee-ai/trinity-large-preview:free';
        const multimodal2 = this.secondaryMultimodalModel || 'google/gemini-2.5-flash-lite';

        const hasAttachments = attachments?.length > 0;
        // Build retry chain; allow explicit model override via options
        const chainModels = [];
        if (options?.modelOverride) chainModels.push(options.modelOverride);
        chainModels.push(primaryModel, multimodal1, multimodal2);
        const retryChain = chainModels.map(id => ({ id, provider: 'openrouter' }));

        // Deduplicate in case any models are the same
        const uniqueChain = [];
        const seen = new Set();
        for (const m of retryChain) {
            if (!seen.has(m.id)) {
                uniqueChain.push(m);
                seen.add(m.id);
            }
        }

        let lastError = null;
        console.log(`[AI] Starting generation with chain: ${uniqueChain.map(m => m.id).join(' -> ')}${hasAttachments ? ' (multimodal mode)' : ''}`);
        for (const modelToTry of uniqueChain) {
            try {
                if (modelToTry.id !== primaryModel && !hasAttachments) {
                    console.warn(`[AI] Attempting fallback to ${modelToTry.id} (${modelToTry.provider})...`);
                } else if (hasAttachments) {
                    console.log(`[AI] Using multimodal model: ${modelToTry.id}`);
                }

                let result;
                if (modelToTry.provider === 'google') {
                    // Skip Google models as we don't have a key configured
                    continue;
                } else {
                    result = await makeRequest(modelToTry.id);
                }

                // Cache successful responses (only for text-only requests)
                if (attachments.length === 0 && result.success) {
                    this.responseCache.set(cacheKey, result);
                    // Limit cache size to prevent memory issues
                    if (this.responseCache.size > 100) {
                        const firstKey = this.responseCache.keys().next().value;
                        this.responseCache.delete(firstKey);
                    }
                }

                return result;
            } catch (error) {
                console.error(`[AI] Model ${modelToTry.id} failed:`, error.message);
                lastError = error;
            }
        }

        let errMsg = `All AI models failed. Attempts: ${uniqueChain.map(m => m.id).join(' -> ')}. Last error: ${lastError?.message}`;
        if (lastError?.message && /provider returned error/i.test(lastError.message)) {
            errMsg += ' (verify your OpenRouter API key and network connectivity)';
        }
        return {
            success: false,
            error: errMsg
        };
    },

    // Debug helper: build payload for a given model without sending it. Useful for testing in browser console.
    debugBuildPayload(prompt, systemInstruction = '', attachments = [], tools = [], model = null) {
        const unifiedSystemInstruction = (systemInstruction ? systemInstruction + "\n" : "") + `CROSS-CHECK & GROUNDING INSTRUCTIONS:`;
        const hasAttachments = attachments?.length > 0;

        const messages = [];
        if (unifiedSystemInstruction) messages.push({ role: 'system', content: unifiedSystemInstruction });
        const userContent = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);

        let filesPayload = null;
        if (hasAttachments) {
            filesPayload = attachments.map(file => ({ name: file.name || 'file', data: file.data, mime_type: file.mimeType }));
            const fileBlocks = attachments.map(f => `\n<file name="${f.name || 'file'}">\n${f.data}\n</file>`).join('\n');
            const userContentWithFiles = userContent + '\n\n' + fileBlocks;
            messages.push({ role: 'user', content: userContentWithFiles });
        } else {
            messages.push({ role: 'user', content: userContent });
        }

        const payload = { model: model || this.openRouterModel, messages, tools: tools.length > 0 ? tools : undefined };
        if (filesPayload) payload.files = filesPayload;
        return payload;
    },

    // Debug helper: build and log payloads for the full retry chain so you can inspect each request before sending.
    debugTestAllModels(prompt, systemInstruction = '', attachments = [], tools = []) {
        const primaryModel = this.openRouterModel || 'nvidia/nemotron-nano-12b-v2-vl:free';
        const multimodal1 = this.multimodalModel || 'arcee-ai/trinity-large-preview:free';
        const multimodal2 = this.secondaryMultimodalModel || 'google/gemini-2.5-flash-lite';

        const retryChain = [
            { id: primaryModel, provider: 'openrouter' },
            { id: multimodal1, provider: 'openrouter' },
            { id: multimodal2, provider: 'openrouter' }
        ];

        const results = [];
        for (const m of retryChain) {
            try {
                const payload = this.debugBuildPayload(prompt, systemInstruction, attachments, tools, m.id);
                console.log('[AI][DEBUG] Payload for', m.id, payload);
                results.push({ model: m.id, payload });
            } catch (e) {
                console.error('[AI][DEBUG] Failed to build payload for', m.id, e.message);
                results.push({ model: m.id, error: e.message });
            }
        }
        return results;
    }
};

GeminiService.init();

export default GeminiService;
