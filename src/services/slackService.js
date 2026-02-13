// ========================================
// Slack Integration Service
// ========================================

const SlackService = {
    webhookUrl: null,

    init() {
        this.webhookUrl = localStorage.getItem('slack_webhook') || null;
    },

    setWebhook(url) {
        this.webhookUrl = url;
        localStorage.setItem('slack_webhook', url);
    },

    setWebhookUrl(url) {
        this.setWebhook(url);
    },

    getWebhookUrl() {
        return this.webhookUrl;
    },

    isConfigured() {
        return !!this.webhookUrl;
    },

    isConnected() {
        return !!this.webhookUrl;
    },

    async sendMessage(text) {
        if (!this.isConnected()) {
            return { success: false, error: 'No Slack webhook configured.' };
        }

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            return { success: response.ok };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async sendRichMessage(blocks) {
        if (!this.isConnected()) {
            return { success: false, error: 'No Slack webhook configured.' };
        }

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks })
            });

            return { success: response.ok };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    formatReport(title, sections) {
        const blocks = [
            {
                type: 'header',
                text: { type: 'plain_text', text: title }
            },
            { type: 'divider' }
        ];

        sections.forEach(section => {
            blocks.push({
                type: 'section',
                text: { type: 'mrkdwn', text: `*${section.title}*\n${section.content}` }
            });
        });

        return blocks;
    }
};

SlackService.init();

export default SlackService;
