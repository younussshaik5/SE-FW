const FdkKnowledge = {
    // 1. Manifest Templates (FDK v3.0)
    manifests: {
        freshdesk: {
            "platform-version": "3.0",
            "product": {
                "freshdesk": {
                    "location": {
                        "ticket_sidebar": { "url": "index.html", "icon": "icon.svg" }
                    }
                }
            },
            "engines": { "node": "18.13.0", "fdk": "9.1.1" }
        },
        freshservice: {
            "platform-version": "3.0",
            "product": {
                "freshservice": {
                    "location": {
                        "ticket_sidebar": { "url": "index.html", "icon": "icon.svg" }
                    }
                }
            },
            "engines": { "node": "18.13.0", "fdk": "9.1.1" }
        },
        freshsales: {
            "platform-version": "2.3",
            "product": {
                "freshsales": {
                    "location": {
                        "contact_sidebar": { "url": "index.html", "icon": "icon.svg" }
                    }
                }
            },
            "engines": { "node": "18.13.0", "fdk": "9.1.1" }
        },
        freshchat: {
            "platform-version": "3.0",
            "product": {
                "freshchat": {
                    "location": {
                        "conversation_sidebar": { "url": "index.html", "icon": "icon.svg" }
                    }
                }
            },
            "engines": { "node": "18.13.0", "fdk": "9.1.1" }
        }
    },

    // 2. Comprehensive Locations per Product (FDK v3.0)
    locations: {
        freshdesk: [
            "ticket_sidebar", "ticket_top_navigation", "ticket_background",
            "contact_sidebar", "full_page_app", "cti_sidebar",
            "new_ticket_requester_info", "ticket_requester_info", "modal"
        ],
        freshservice: [
            "ticket_sidebar", "ticket_top_navigation", "ticket_background",
            "full_page_app", "change_sidebar", "asset_sidebar",
            "service_catalog_sidebar", "requester_sidebar", "modal"
        ],
        freshsales: [
            "contact_sidebar", "deal_sidebar", "full_page_app",
            "lead_sidebar", "account_sidebar", "sales_order_sidebar", "modal"
        ],
        freshchat: [
            "conversation_sidebar", "full_page_app", "user_sidebar", "modal"
        ],
        freshcaller: [
            "call_sidebar", "full_page_app", "modal"
        ],
        freshmarketer: [
            "full_page_app", "contact_sidebar", "modal"
        ]
    },

    // 3. Serverless Event Patterns (FDK v3.0)
    events: {
        freshdesk: [
            "onTicketCreate", "onTicketUpdate", "onConversationCreate",
            "onContactCreate", "onContactUpdate", "onCompanyCreate", "onCompanyUpdate",
            "onAppInstall", "onAppUninstall", "onExternalEvent", "onScheduledEvent"
        ],
        freshservice: [
            "onTicketCreate", "onTicketUpdate", "onAssetCreate", "onAssetUpdate",
            "onChangeCreate", "onChangeUpdate", "onReleaseCreate", "onReleaseUpdate",
            "onAppInstall", "onAppUninstall", "onExternalEvent", "onScheduledEvent"
        ],
        freshsales: [
            "onContactCreate", "onContactUpdate", "onDealCreate", "onDealUpdate",
            "onAccountCreate", "onAccountUpdate", "onAppInstall", "onAppUninstall", "onExternalEvent"
        ],
        freshchat: [
            "onConversationCreate", "onConversationUpdate", "onMessageCreate",
            "onUserCreate", "onUserUpdate", "onAppInstall", "onAppUninstall"
        ],
        patterns: {
            onTicketCreate: `
    onTicketCreateHandler: function(args) {
        console.log('Ticket Created:', args.data.ticket.id);
        // Access ticket data via args.data.ticket
        // Use $request for external API calls
        // Use $db for data storage
    },
`,
            onAppInstall: `
    onAppInstallHandler: function(args) {
        console.log('App Installed');
        // Initialize app data using $db or generate webhooks
    },
`,
            onExternalEvent: `
    onExternalEventHandler: function(args) {
        console.log('External Event received:', args.data);
        // Process webhook payload from args.data
    },
`,
            onScheduledEvent: `
    onScheduledEventHandler: function(args) {
        console.log('Scheduled Event execution:', args.data);
        // Run periodic tasks
    }
`
        }
    },

    // 4. Advanced App Features & Modules
    features: {
        smi: {
            desc: "Server Method Invocation for secure backend calls",
            manifest: { "functions": { "myBackendFunction": { "handler": "myBackendFunction" } } },
            server: `
    myBackendFunction: function(args) {
        // args.data contains parameters from frontend
        return renderData(null, { success: true, message: "Hello from backend" });
    },
`,
            frontend: `
    client.request.invoke("myBackendFunction", { key: "value" }).then(
        function(data) { console.log("SMI Success:", data); },
        function(err) { console.error("SMI Error:", err); }
    );
`
        },
        oauth: {
            desc: "OAuth2 authentication for third-party integrations",
            manifest: { "features": { "oauth": {} } },
            iparams: {
                "auth": {
                    "type": "oauth2",
                    "display_name": "Connect Account",
                    "description": "Please authorize the app",
                    "token_type": "account",
                    "authorize_url": "https://example.com/oauth/authorize",
                    "token_url": "https://api.example.com/oauth/token",
                    "options": { "scope": "read write" }
                }
            }
        },
        data_storage: {
            desc: "Persistent key-value storage ($db)",
            server: `
    // Save data
    $db.set("user_123", { name: "John" }).then(console.log, console.error);
    // Get data
    $db.get("user_123").then(console.log, console.error);
`
        }
    },

    // 5. Enhanced Analysis Prompts
    prompts: {
        analyzeParams: `
Analyze the Freshworks app requirement and return a structured JSON configuration.
Target: FDK v3.0 (Node 18).

Products: freshdesk, freshservice, freshsales, freshchat, freshcaller, freshmarketer.

JSON Structure:
{
  "product": "primary_product",
  "locations": ["list_of_locations"],
  "features": ["smi", "oauth", "data_storage", "serverless_events"],
  "events": ["list_of_serverless_events"],
  "thirdParty": {
    "name": "Integration Name",
    "authType": "apiKey|oauth2",
    "endpoints": ["https://api.example.com/..."]
  },
  "complexity": "low|medium|high",
  "reasoning": "Explain the architectural choices."
}

Requirement:
`
    }
};

export default FdkKnowledge;
