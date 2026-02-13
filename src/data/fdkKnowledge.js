// ========================================
// FDK Knowledge Base & Templates
// ========================================

const FdkKnowledge = {
    // 1. Manifest Templates
    manifests: {
        freshdesk: {
            "platform-version": "2.3",
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
                "node": "18.16.0",
                "fdk": "9.0.0"
            }
        },
        freshservice: {
            "platform-version": "2.3",
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
                "node": "18.16.0",
                "fdk": "9.0.0"
            }
        }
    },

    // 2. Serverless Event Patterns
    events: {
        onTicketCreate: `
    onTicketCreate: function(args) {
        console.log('Ticket Created:', args.data.ticket.id);
        // Add logic here
    },
`,
        onAppInstall: `
    onAppInstall: function(args) {
        console.log('App Installed');
        renderData();
    },
`,
        onExternalEvent: `
    onExternalEvent: function(args) {
        console.log('External Event:', args);
        renderData();
    },
`
    },

    // 3. Frontend Code Snippets
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
        // Start logic
    }
`,
        dataMethod: `
    client.db.set("key", { value: "data" }).then(
        function(data) { console.log('Saved', data); },
        function(error) { console.error('Error', error); }
    );
`,
        requestMethod: `
    client.request.get("https://api.example.com/resource", options).then(
        function(data) { console.log(data); },
        function(error) { console.error(error); }
    );
`
    },

    // 4. Analysis Prompts
    prompts: {
        analyzeParams: `
Analyze the following app description and return a JSON object with this structure:
{
  "product": "freshdesk|freshservice|freshsales|freshchat",
  "locations": ["ticket_sidebar", "full_page_app", "background"],
  "features": ["data_storage", "external_api", "serverless_events", "oauth"],
  "events": ["onTicketCreate", "onAppInstall"],
  "apis": ["https://api.example.com"],
  "complexity": "low|medium|high",
  "reasoning": "Brief explanation of why these components are needed."
}

Description:
`
    }
};

export default FdkKnowledge;
