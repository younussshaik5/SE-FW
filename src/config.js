// ========================================
// Application Configuration & Env Injection
// ========================================
// This file is designed to be replaced or injected during CI/CD deployment.

window.APP_CONFIG = {
    // 1. OpenRouter API (Primary)
    OPENROUTER_API_KEY: window.ENV?.OPENROUTER_API_KEY || "",
    OPENROUTER_MODEL: window.ENV?.OPENROUTER_MODEL || "google/gemma-3-27b-it:free",
    OPENROUTER_MULTIMODAL_MODEL: window.ENV?.OPENROUTER_MULTIMODAL_MODEL || "openai/gpt-5-nano",

    // 2. Proxy Server URL
    // If you deploy the Node.js proxy to Vercel/Heroku, put the URL here.
    // Default: '' (Disabled in production unless injected)
    PROXY_URL: ""
};

// Try to load from standard env vars if using a bundler (Vite/Webpack) - optional
if (typeof process !== 'undefined' && process.env) {
    if (process.env.OPENROUTER_API_KEY) window.APP_CONFIG.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
}

console.log("APP_CONFIG Loaded:", window.APP_CONFIG);
