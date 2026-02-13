// ========================================
// Application Configuration & Env Injection
// ========================================
// This file is designed to be replaced or injected during CI/CD deployment.

window.APP_CONFIG = {
    // 1. Google Gemini API Key
    // If hosted on GitHub Pages, this can be injected via workflow.
    // Replace 'YOUR_API_KEY_HERE' if running locally without env injection.
    GEMINI_API_KEY: "",

    // 2. Proxy Server URL
    // If you deploy the Node.js proxy to Vercel/Heroku, put the URL here.
    // Default: '' (Disabled in production unless injected)
    PROXY_URL: "",

    // 3. OpenRouter API (Fallback)
    // Used if Gemini API Key is missing.
    OPENROUTER_API_KEY: "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",
    OPENROUTER_MODEL: "arcee-ai/trinity-large-preview:free"
};

// Try to load from standard env vars if using a bundler (Vite/Webpack) - optional
if (typeof process !== 'undefined' && process.env) {
    if (process.env.GEMINI_API_KEY) window.APP_CONFIG.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
}

console.log("APP_CONFIG Loaded:", window.APP_CONFIG);
