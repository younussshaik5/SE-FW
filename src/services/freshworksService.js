// ========================================
// Freshworks API Service
// ========================================

const FreshworksService = {
    domain: null,
    apiKey: null,

    init() {
        this.domain = localStorage.getItem('fw_domain') || null;
        this.apiKey = localStorage.getItem('fw_api_key') || null;
    },

    setCredentials(domain, apiKey) {
        this.domain = domain.replace(/\/$/, '');
        this.apiKey = apiKey;
        localStorage.setItem('fw_domain', this.domain);
        localStorage.setItem('fw_api_key', this.apiKey);
    },

    clearCredentials() {
        this.domain = null;
        this.apiKey = null;
        localStorage.removeItem('fw_domain');
        localStorage.removeItem('fw_api_key');
    },

    isConnected() {
        return !!(this.domain && this.apiKey);
    },

    getDomain() {
        return this.domain;
    },

    getApiKey() {
        return this.apiKey;
    },

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(this.apiKey + ':X')
        };
    },

    async request(endpoint, method = 'GET', body = null) {
        if (!this.isConnected()) {
            return { success: false, error: 'Not connected. Configure Freshworks credentials in Settings.' };
        }

        const targetUrl = `${this.domain}${endpoint}`;
        const headers = this.getHeaders();

        // 1. Try Proxy Server (to bypass CORS)
        try {
            const proxyUrl = window.APP_CONFIG?.PROXY_URL || 'http://localhost:3000/api/proxy';
            const proxyResponse = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: targetUrl,
                    method,
                    headers,
                    body
                })
            });

            if (proxyResponse.ok) {
                const data = await proxyResponse.json();
                return { success: true, data };
            } else {
                console.warn('[Proxy] Failed, falling back to direct call.', proxyResponse.status);
            }
        } catch (e) {
            console.warn('[Proxy] Unreachable (is node server running?), falling back to direct call.', e.message);
        }

        // 2. Fallback: Direct Call (Likely to fail CORS if not handled by browser/extension)
        try {
            const options = {
                method,
                headers,
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(targetUrl, options);

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');
                throw new Error(`API error: ${response.status} ${response.statusText}${errorText ? ' — ' + errorText : ''}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Freshworks API Error:', error);
            return { success: false, error: error.message + ' (Check CORS or Proxy Server)' };
        }
    },

    // ---- Generic CRUD (used by Instance Builder) ----
    async genericCreate(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    },

    async genericGet(endpoint) {
        return this.request(endpoint, 'GET');
    },

    async genericUpdate(endpoint, data) {
        return this.request(endpoint, 'PUT', data);
    },

    // ---- Ticket operations ----
    async getTickets(page = 1) {
        return this.request(`/api/v2/tickets?page=${page}`);
    },

    async createTicket(ticket) {
        return this.request('/api/v2/tickets', 'POST', ticket);
    },

    async bulkCreateTickets(tickets) {
        const results = [];
        for (const ticket of tickets) {
            const result = await this.createTicket(ticket);
            results.push(result);
            await new Promise(r => setTimeout(r, 100));
        }
        return results;
    },

    // ---- Contact operations ----
    async getContacts(page = 1) {
        return this.request(`/api/v2/contacts?page=${page}`);
    },

    async createContact(contact) {
        return this.request('/api/v2/contacts', 'POST', contact);
    },

    // ---- Company operations ----
    async getCompanies(page = 1) {
        return this.request(`/api/v2/companies?page=${page}`);
    },

    async createCompany(company) {
        return this.request('/api/v2/companies', 'POST', company);
    },

    // ---- Group operations ----
    async getGroups() {
        return this.request('/api/v2/groups');
    },

    async createGroup(group) {
        return this.request('/api/v2/groups', 'POST', group);
    },

    // ---- Agent operations ----
    async getAgents() {
        return this.request('/api/v2/agents');
    },

    async createAgent(agent) {
        return this.request('/api/v2/agents', 'POST', agent);
    },

    // ---- SLA Policies ----
    async getSLAPolicies() {
        return this.request('/api/v2/sla_policies');
    },

    async createSLAPolicy(sla) {
        return this.request('/api/v2/sla_policies', 'POST', sla);
    },

    // ---- Automations ----
    async createAutomation(typeId, rule) {
        return this.request(`/api/v2/automations/${typeId}/rules`, 'POST', rule);
    },

    // ---- Canned Responses ----
    async createCannedResponse(response) {
        return this.request('/api/v2/canned_responses', 'POST', response);
    },

    // ---- Ticket Fields ----
    async createTicketField(field) {
        return this.request('/api/v2/admin/ticket_fields', 'POST', field);
    },

    // ---- Solutions / Knowledge Base ----
    async createSolutionCategory(category) {
        return this.request('/api/v2/solutions/categories', 'POST', category);
    },

    async createSolutionFolder(categoryId, folder) {
        return this.request(`/api/v2/solutions/categories/${categoryId}/folders`, 'POST', folder);
    },

    async createSolutionArticle(folderId, article) {
        return this.request(`/api/v2/solutions/folders/${folderId}/articles`, 'POST', article);
    },

    // ---- Roles (read-only) ----
    async getRoles() {
        return this.request('/api/v2/roles');
    },

    // ---- Business Hours ----
    async getBusinessHours() {
        return this.request('/api/v2/business_hours');
    },

    // ---- Email Configs ----
    async getEmailConfigs() {
        return this.request('/api/v2/email_configs');
    },

    // ---- Test connection ----
    async testConnection() {
        try {
            const result = await this.request('/api/v2/tickets?per_page=1');
            return result.success;
        } catch {
            return false;
        }
    }
};

FreshworksService.init();

export default FreshworksService;
