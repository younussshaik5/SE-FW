// ========================================
// FDK Knowledge Base & Templates (v3.0)
// ========================================

const FdkKnowledge = {
    // 1. Manifest Templates
    manifests: {
        freshdesk: {
            "platform-version": "3.0",
            "product": {
                "freshdesk": {
                    "location": {
                        "ticket_sidebar": {
                            "url": "index.html",
                            "icon": "icon.svg"
                        }
                    }
                }
            },
            "whitelisted-domains": [],
            "engines": {
                "node": "18.13.0",
                "fdk": "9.1.0"
            }
        },
        freshservice: {
            "platform-version": "3.0",
            "product": {
                "freshservice": {
                    "location": {
                        "ticket_sidebar": {
                            "url": "index.html",
                            "icon": "icon.svg"
                        }
                    }
                }
            },
            "whitelisted-domains": [],
            "engines": {
                "node": "18.13.0",
                "fdk": "9.1.0"
            }
        }
    },

    // 2. Valid Locations per Product (FDK v3.0)
    locations: {
        freshdesk: [
            "ticket_sidebar",
            "ticket_top_navigation",
            "ticket_background",
            "contact_sidebar",
            "full_page_app",
            "cti_sidebar",
            "new_ticket_requester_info",
            "ticket_requester_info"
        ],
        freshservice: [
            "ticket_sidebar",
            "ticket_top_navigation",
            "ticket_background",
            "full_page_app",
            "change_sidebar",
            "asset_sidebar",
            "service_catalog_sidebar"
        ],
        freshsales: [
            "contact_sidebar",
            "deal_sidebar",
            "full_page_app",
            "lead_sidebar"
        ],
        freshchat: [
            "conversation_sidebar",
            "full_page_app"
        ],
        freshcaller: [
            "call_sidebar",
            "full_page_app"
        ],
        freshmarketer: [
            "full_page_app",
            "contact_sidebar"
        ]
    },

    // 3. Serverless Event Patterns (FDK v3.0)
    events: {
        freshdesk: [
            "onTicketCreate",
            "onTicketUpdate",
            "onConversationCreate",
            "onContactCreate",
            "onContactUpdate",
            "onAppInstall",
            "onAppUninstall",
            "onExternalEvent",
            "onScheduledEvent"
        ],
        freshservice: [
            "onTicketCreate",
            "onTicketUpdate",
            "onAppInstall",
            "onAppUninstall",
            "onExternalEvent",
            "onScheduledEvent",
            "onChangeCreate",
            "onChangeUpdate"
        ],
        freshsales: [
            "onContactCreate",
            "onContactUpdate",
            "onDealCreate",
            "onDealUpdate",
            "onAppInstall",
            "onAppUninstall",
            "onExternalEvent"
        ],
        freshchat: [
            "onConversationCreate",
            "onMessageCreate",
            "onAppInstall",
            "onAppUninstall"
        ],
        patterns: {
            onTicketCreate: `
    onTicketCreate: function(args) {
        console.log('Ticket Created:', args.data.ticket.id);
        // Access ticket data via args.data.ticket
        // Use $request for external API calls
        // Use $db for data storage
        renderData();
    },
`,
            onAppInstall: `
    onAppInstall: function(args) {
        console.log('App Installed');
        // Initialize app data using $db
        renderData();
    },
`,
            onExternalEvent: `
    onExternalEvent: function(args) {
        console.log('External Event:', args);
        // Process webhook payload from args.data
        renderData();
    },
`,
            onScheduledEvent: `
    onScheduledEvent: function(args) {
        console.log('Scheduled Event:', args);
        // Run periodic tasks
        renderData();
    },
`
        }
    },

    // 4. Frontend Code Snippets (FDK v3.0)
    frontend: {
        init: `
    document.addEventListener("DOMContentLoaded", function () {
        app.initialized().then(function (_client) {
            window.client = _client;
            client.events.on("app.activated", onAppActivated);
        });
    });

    function onAppActivated() {
        console.log('App Activated');
    }
`,
        dataMethod: `
    // Data Storage API ($db in serverless, client.db in frontend)
    client.db.set("key", { value: "data" }).then(
        function(data) { console.log('Saved', data); },
        function(error) { console.error('Error', error); }
    );
`,
        requestMethod: `
    // Request API (client.request in frontend, $request in serverless)
    var options = {
        headers: { "Authorization": "Bearer <%= iparam.api_key %>" }
    };
    client.request.get("https://api.example.com/resource", options).then(
        function(data) { console.log(JSON.parse(data.response)); },
        function(error) { console.error(error); }
    );
`,
        interfaceMethod: `
    // Interface API
    client.interface.trigger("showNotify", {
        type: "success",
        message: "Operation completed!"
    });
`
    },

    // 5. Analysis Prompts
    prompts: {
        analyzeParams: `
Analyze the following Freshworks app description and return a JSON object.

Use these valid FDK v3.0 options:
- Products: freshdesk, freshservice, freshsales, freshchat, freshcaller, freshmarketer
- Freshdesk locations: ticket_sidebar, ticket_top_navigation, ticket_background, contact_sidebar, full_page_app, cti_sidebar
- Freshservice locations: ticket_sidebar, ticket_top_navigation, ticket_background, full_page_app, change_sidebar, asset_sidebar, service_catalog_sidebar
- Freshsales locations: contact_sidebar, deal_sidebar, full_page_app, lead_sidebar
- Freshchat locations: conversation_sidebar, full_page_app
- Freshdesk events: onTicketCreate, onTicketUpdate, onConversationCreate, onContactCreate, onAppInstall, onExternalEvent, onScheduledEvent
- Freshservice events: onTicketCreate, onTicketUpdate, onChangeCreate, onChangeUpdate, onAppInstall, onExternalEvent, onScheduledEvent
- Freshsales events: onContactCreate, onContactUpdate, onDealCreate, onDealUpdate, onAppInstall, onExternalEvent
- Features: data_storage ($db), external_api ($request), serverless_events, oauth, scheduled_events

Return this exact JSON structure:
{
  "product": "freshdesk|freshservice|freshsales|freshchat|freshcaller|freshmarketer",
  "locations": ["ticket_sidebar", "full_page_app"],
  "features": ["data_storage", "external_api", "serverless_events"],
  "events": ["onTicketCreate", "onAppInstall"],
  "apis": ["https://api.example.com"],
  "complexity": "low|medium|high",
  "reasoning": "Brief explanation of architecture decisions."
}

Description:
`
    }
};

export default FdkKnowledge;
