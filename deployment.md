# Deployment Guide

## 1. GitHub Pages (Static Hosting)

The easiest way to host this application is using **GitHub Pages**.

### A. Automatic Deployment (Recommended)
You can set up a GitHub Action to automatically deploy the app and inject your API Key.

1.  **Create Workflow File**:
    -   In your repo, create `.github/workflows/deploy.yml`.
    -   Paste the content below:

    ```yaml
    name: Deploy to GitHub Pages

    on:
      push:
        branches: [ main ]

    permissions:
      contents: read
      pages: write
      id-token: write

    jobs:
      deploy:
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        runs-on: ubuntu-latest
        steps:
          - name: Checkout
            uses: actions/checkout@v3

          - name: Inject API Key
            run: |
              sed -i 's|GEMINI_API_KEY: ""|GEMINI_API_KEY: "${{ secrets.GEMINI_API_KEY }}"|' src/config.js

          - name: Setup Pages
            uses: actions/configure-pages@v3

          - name: Upload artifact
            uses: actions/upload-pages-artifact@v1
            with:
              path: '.'

          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v1
    ```

2.  **Set API Key Secret**:
    -   Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
    -   Click **New repository secret**.
    -   Name: `GEMINI_API_KEY`.
    -   Value: Your Gemini API Key (starts with `AIza...`).

3.  **Push**: Commit and push the `.github/workflows/deploy.yml` file. GitHub will automatically deploy your site.

### B. Manual Hosting
1.  Go to Repository **Settings** -> **Pages**.
2.  Select source: **Deploy from a branch**.
3.  Select branch: `main` -> `/ (root)`.
4.  Save.
5.  *Note: You will need to manually enter your API Key in the App Settings every time you clear your browser cache.*

---

## 2. Proxy Server (Hosting the Backend)

The **SE Workstation Proxy** (`server/index.js`) is a Node.js app. It cannot run on GitHub Pages. You must host it on a platform that supports Node.js (Vercel, Railway, Render, Heroku).

### Vercel Deployment (Example)
1.  Create a `vercel.json` in the `server/` directory:
    ```json
    {
      "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
    }
    ```
2.  Install Vercel CLI: `npm i -g vercel`.
3.  Run `vercel` inside the `server/` folder to deploy.
4.  Update `src/config.js` in your frontend with the new Proxy URL.

---

## 3. Chrome Built-in AI (Gemini Nano)

You can use this application **without an API Key** if you use a recent version of Google Chrome with the built-in AI enabled.

### How to Enable
1.  Open Chrome and go to `chrome://flags/#prompt-api-for-gemini-nano`
2.  Select **Enabled**.
3.  Go to `chrome://flags/#optimization-guide-on-device-model`
4.  Select **Enabled BypassPerfRequirement**.
5.  Relaunch Chrome.
6.  Go to `chrome://components` and look for **Optimization Guide On Device Model**. Click "Check for update" to download the model (it may take a few minutes).

**Once enabled**, simply open the URL. The app will detect `window.ai` and use it automatically if no API Key is provided.
