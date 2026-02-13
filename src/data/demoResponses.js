// ========================================
// Demo Mode Responses — Realistic mock data for all modules
// ========================================

const DemoResponses = {

  // Module 1: Demo Strategy
  demoStrategy: {
    discovery: `#### 🔍 Discovery Analysis

**Key Pains Identified:**
• **Pain 1: Fragmented Support Channels** — Customer inquiries arrive via email, chat, phone, and social media with no unified view. Agents waste 15-20 min/ticket switching between tools.
  → *Business Outcome: 40% reduction in first-response time*

• **Pain 2: No SLA Visibility** — Management has zero real-time visibility into SLA compliance. Monthly reports are manual and take 2 days to compile.
  → *Business Outcome: Real-time SLA dashboards, 95%+ SLA compliance*

• **Pain 3: Knowledge Silos** — Tribal knowledge exists only in senior agents' heads. New hire ramp takes 6-8 weeks.
  → *Business Outcome: Cut onboarding time to 2 weeks with centralized knowledge base*

**Recommended Freshworks Products:**
• Freshdesk Omnichannel (primary)
• Freshdesk Knowledge Base
• Freshdesk Analytics

**Value Proposition:**
"Consolidate 4 siloed support tools into one omnichannel platform with built-in AI, reducing agent handling time by 35% and cutting new-hire ramp from 8 weeks to 2."`,

    build: `#### 🏗️ Admin Click-Path Guide

**Step 1: Configure Omnichannel**
Admin → Channels → Email → Add support@company.com
Admin → Channels → Chat → Install widget (copy snippet to website)
Admin → Channels → Phone → Set up Freshcaller (buy number)

**Step 2: Set Up Automation**
Admin → Automations → Ticket Creation
├── Rule: "High Priority Routing"
│   Condition: Priority = Urgent OR VIP customer
│   Action: Assign to "Tier 2" group, Set SLA = "Premium"
├── Rule: "Auto-categorization"
│   Condition: Subject contains "refund" OR "billing"
│   Action: Set Type = Billing, Assign to "Finance Support"

**Step 3: Build Knowledge Base**
Solutions → New Category → "Getting Started"
├── New Folder → "Account Setup"
│   ├── Article: "How to reset your password"
│   ├── Article: "Updating billing information"
├── New Folder → "Troubleshooting"
│   ├── Article: "Common error codes"
Visibility: Set to "All users" + "Agents"

**Step 4: SLA Policies**
Admin → SLA Policies → New Policy
├── Priority: Urgent → Respond: 1hr, Resolve: 4hrs
├── Priority: High → Respond: 4hrs, Resolve: 8hrs
├── Priority: Medium → Respond: 8hrs, Resolve: 24hrs
Escalation: Enable → Notify manager after 80% of SLA elapsed`,

    script: `#### 🎬 Click-Track-Talk Framework (25 min demo)

| Time | Click (What to show) | Track (Key Feature) | Talk (What to say) |
|------|---------------------|--------------------|--------------------|
| 0:00 | Dashboard overview | Unified inbox | "Here you see every channel — email, chat, phone, social — in one view. No more tab-switching." |
| 3:00 | Open ticket → show timeline | Omnichannel thread | "Notice how the entire customer journey is visible — their chat from Monday, email from Tuesday, call today — all stitched together." |
| 6:00 | Show Freddy AI suggestions | AI-powered responses | "Freddy reads the ticket and suggests the top 3 relevant solutions from your knowledge base. Agents click, not type." |
| 10:00 | Admin → Automations | Ticket routing | "Let me show how you set up smart routing in under 2 minutes — no code needed." |
| 14:00 | Analytics dashboard | Real-time SLA tracking | "This is the dashboard your VP was asking about — live SLA compliance, CSAT trends, agent performance. No more manual Excel reports." |
| 18:00 | Knowledge base portal | Self-service | "This customer portal is already live. 30% of your tickets can be deflected here before they reach an agent." |
| 22:00 | Mobile app | On-the-go support | "Your managers can approve escalations from their phone. Agents can pick up urgent tickets from anywhere." |
| 25:00 | Pricing page / Next steps | Value summary | "So we're looking at consolidating 4 tools into one, saving ~35% in agent handling time, and getting those real-time dashboards your leadership needs." |`
  },

  // Module 2: Risk Report
  riskReport: `#### ⚠️ Technical Risk Assessment Report

**Engagement:** Acme Corp — Freshdesk Omnichannel
**SE:** SY | **Date:** Feb 13, 2026
**Deal Stage:** Technical Evaluation | **Revenue:** $85K ARR

---

**Use Cases Evaluated: 4/6**
✅ Omnichannel ticketing — Validated
✅ SLA management — Validated
✅ Self-service portal — Validated
⏳ SSO/SAML integration — Pending IT team access
❌ Custom reporting (Looker integration) — Gap identified
❌ Legacy data migration (120K tickets from Zendesk) — Not yet scoped

**SE Steps Taken: 8**
1. ✅ Discovery call (Jan 15)
2. ✅ Technical deep-dive with IT (Jan 22)
3. ✅ Demo — Support team (Jan 29)
4. ✅ POC environment provisioned (Feb 1)
5. ✅ POC data seeded — 500 sample tickets (Feb 3)
6. ✅ Agent training session — 12 attendees (Feb 5)
7. ⏳ SSO configuration — blocked on IT providing SAML metadata
8. ⏳ Executive demo for CFO (scheduled Feb 20)

**Identified Gaps:**
| Gap | Impact | Status | Mitigation |
|-----|--------|--------|------------|
| Looker integration | High — CFO requires existing BI stack | Submitted to Product (FR #4821) | Offer Freshdesk Analytics + data export as interim solution |
| Zendesk migration (120K tickets) | Medium — historical data requirements | Not yet scoped | Recommend phased migration using Migration API |
| SAML SSO with Okta | Low — standard integration | Blocked on customer IT | Share Okta integration guide, offer joint session |

**Risk Level: MEDIUM 🟡**
Primary risk is the Looker integration gap. Recommend scheduling a Product team call with the customer before Feb 20 exec demo.`,

  // Module 3: Value Architecture / ROI-TCO
  valueArchitecture: `#### 💰 3-Year Value Architecture Report

**Prepared for:** Acme Corp | **Date:** Feb 13, 2026

---

**CURRENT STATE ANALYSIS**

| Cost Category | Annual Cost |
|--------------|-------------|
| Zendesk Enterprise (150 agents) | $270,000 |
| Talkdesk (phone system) | $84,000 |
| Intercom (chat widget) | $48,000 |
| Mailchimp (email campaigns) | $12,000 |
| Manual reporting labor (2 FTEs × $35/hr) | $145,600 |
| **Total Current Annual Cost** | **$559,600** |

---

**PROPOSED STATE: Freshworks**

| Cost Category | Annual Cost |
|--------------|-------------|
| Freshdesk Omnichannel Pro (150 agents) | $198,000 |
| Freshcaller (included) | $0 |
| Freshchat (included) | $0 |
| Freddy AI add-on | $24,000 |
| Implementation & training | $15,000 (Year 1 only) |
| **Total Year 1 Cost** | **$237,000** |
| **Total Year 2-3 Cost** | **$222,000/yr** |

---

**3-YEAR VALUE SUMMARY**

| Metric | Value |
|--------|-------|
| 3-Year Legacy Cost | $1,678,800 |
| 3-Year Freshworks Cost | $681,000 |
| **Total Savings** | **$997,800** |
| **Year 1 ROI** | **136%** |
| Tool Consolidation | 4 → 1 |
| Headcount Avoidance | 1.5 FTEs (reporting automation) |
| Agent Efficiency Gain | 35% faster resolution |
| Projected CSAT Improvement | +12 points |

---

**CFO RECOMMENDATION:**
By consolidating four disparate tools into Freshworks' unified platform, Acme Corp achieves a 3-year TCO reduction of **$997,800** while gaining AI-powered automation that eliminates 1.5 FTEs worth of manual reporting work. The 136% Year 1 ROI is driven by immediate license savings and a 35% improvement in agent productivity.`,

  // Module 4: Competitive Battlecards
  battlecards: `#### ⚔️ Competitive Battlecard: Freshworks vs. Zendesk

**Last Updated:** Feb 13, 2026

---

**PRICING ADVANTAGE**
| Tier | Freshworks | Zendesk | Savings |
|------|-----------|---------|---------|
| Pro (per agent/mo) | $49 | $115 | **57%** |
| Enterprise | $79 | $169 | **53%** |
| Omnichannel add-on | Included | +$55/agent | **100%** |

*"For 150 agents, that's $118K/yr in license savings alone — before factoring in implementation costs."*

---

**G2 SENTIMENT ANALYSIS**
| Category | Freshworks | Zendesk |
|----------|-----------|---------|
| Overall Rating | 4.4/5 ⭐ | 4.3/5 ⭐ |
| Ease of Use | 4.5/5 | 4.0/5 |
| Customer Support | 4.4/5 | 3.8/5 |
| Setup Time | 4.6/5 | 3.5/5 |

*Zendesk's top complaint on G2: "Overly complex admin interface" (mentioned in 34% of negative reviews)*

---

**TECHNICAL WEAKNESSES (Zendesk)**
1. **No native phone channel** — Requires third-party (Talkdesk/Five9) = additional cost + integration maintenance
2. **AI is an expensive add-on** — Zendesk AI costs $50/agent/mo extra. Freddy AI included in Pro.
3. **Marketplace dependency** — Core features like SLA dashboards require paid marketplace apps
4. **Complex pricing model** — Suite pricing forced vs. modular. Customers locked into paying for features they don't use.
5. **Migration lock-in** — Zendesk's data export is notoriously painful (no bulk ticket export via API without pagination limits)

---

**🎯 TRAP-SETTING QUESTIONS**

Ask these questions to surface Zendesk weaknesses naturally:

1. *"How do you handle phone support today? Is that integrated into the same platform as your email/chat, or is it a separate tool?"*
   → Exposes Zendesk's lack of native telephony

2. *"What does your current AI/automation setup look like? Is it included in your license, or is it an add-on?"*
   → Highlights Zendesk AI's $50/agent/mo cost

3. *"When your leadership asks for a real-time SLA compliance dashboard, how do you generate that today?"*
   → Exposes Zendesk's need for marketplace apps for basic reporting

4. *"How long did your initial implementation take, and how much of the admin configuration can your team change without vendor support?"*
   → Highlights Freshworks' faster time-to-value and easier admin

5. *"If you needed to switch providers in the future, how easy would it be to export your historical ticket data?"*
   → Seeds concern about Zendesk data portability`,

  // Module 5: Deal MEDDPICC
  dealMeddpicc: `#### 📊 MEDDPICC Deal Analysis

**Deal:** Acme Corp — Freshdesk Omnichannel | **$85K ARR**

| Dimension | Score | Assessment |
|-----------|-------|------------|
| **M** — Metrics | 7/10 🟢 | Quantified: 35% handling time reduction, $997K 3-year savings. Need to refine CSAT improvement projection with baseline data. |
| **E** — Economic Buyer | 5/10 🟡 | Identified: Sarah Chen (CFO). Not yet engaged directly. VP Support is champion but can't sign above $50K without CFO. **ACTION: Schedule exec demo before Feb 20.** |
| **D** — Decision Criteria | 8/10 🟢 | Documented: Omnichannel, AI automation, SLA reporting, SSO/SAML, sub-$250K TCO. We meet all except Looker integration. |
| **D** — Decision Process | 6/10 🟡 | Known: VP Support recommends → CFO approves → Legal reviews MSA. Unknown: Is there a procurement/RFP step? Is IT a formal sign-off? **ACTION: Ask champion to map full approval chain.** |
| **I** — Identify Pain | 9/10 🟢 | Strong: 4 siloed tools, 15-20 min/ticket wasted in context-switching, zero SLA visibility, 8-week onboarding for new hires. Pain is acute and recent (missed SLA targets in Q4). |
| **P** — Paper Process | 4/10 🟡 | Unknown: Legal review timeline, procurement requirements, security questionnaire status. **ACTION: Submit security questionnaire proactively.** |
| **I** — Implicate Pain | 7/10 🟢 | Connected pain to: Q4 SLA misses cost $180K in customer churn, CEO flagged CX in last board meeting. |
| **C** — Champion | 8/10 🟢 | Strong: Mike Davis (VP Support) — actively selling internally, shared our ROI doc with CFO, provided competitive intel. Has been passed over for promotion due to team metrics — personal motivation. |

---

**OVERALL DEAL HEALTH: 67/100 🟡 MEDIUM**

**Top 3 Actions:**
1. 🔴 **Engage Economic Buyer** — Get 15 min with CFO Sarah Chen before Feb 20. Lead with $997K savings and headcount avoidance.
2. 🟡 **Map Paper Process** — Ask Mike to introduce us to Legal/Procurement. Send security questionnaire now.
3. 🟡 **Close the Looker Gap** — Schedule Product call re: Looker integration or demonstrate Analytics + data export as viable alternative.`,

  // Module 6: Exec Translator
  execTranslator: {
    CIO: `#### 🎤 Executive Translation — CIO Lens

**Technical Feature:** API Orchestration Engine

**CIO Strategic Framing:**

🔹 **System Consolidation & Risk Mitigation**
"Your API orchestration layer becomes the connective tissue between your existing ServiceNow, Salesforce, and ERP investments. Instead of maintaining 12 point-to-point integrations — each a potential failure point — you have one governed integration hub. This reduces your integration maintenance burden by 60% and eliminates the 'single developer dependency' risk on custom middleware."

🔹 **IT Governance & Compliance**
"Every API call is logged, rate-limited, and audit-trailable. When your security team asks 'who accessed what data and when?' — you have the answer in seconds, not days of log mining."

🔹 **Total Cost of Ownership**
"By replacing custom middleware with a managed orchestration layer, you're converting $180K/year in developer maintenance into a $24K platform cost — while gaining enterprise SLAs and 24/7 vendor support."

**Recommended Talking Points:**
• Lead with integration sprawl risk reduction
• Reference the recent Gartner report on integration platform consolidation
• Mention SOC 2 Type II compliance as a differentiator`,

    CFO: `#### 🎤 Executive Translation — CFO Lens

**Technical Feature:** API Orchestration Engine

**CFO Strategic Framing:**

🔹 **Direct Cost Reduction**
"This consolidates 4 software licenses ($414K/yr) into one platform ($222K/yr), delivering $192K in annual savings — a 46% reduction in your CX technology spend. The 3-year NPV of this consolidation is $497K."

🔹 **Headcount Avoidance**
"The automation layer eliminates 1.5 FTEs of manual reporting work (valued at $145K/yr). These aren't layoffs — it frees your analytics team to focus on revenue-generating insights instead of data wrangling."

🔹 **Predictable Spend Model**
"You move from 4 vendors with 4 billing cycles, 4 renewal negotiations, and 4 sets of hidden overage charges to one transparent, per-agent pricing model. Your finance team's vendor management overhead drops significantly."

**Recommended Talking Points:**
• Lead with the 3-year TCO comparison table
• Emphasize predictable per-user pricing vs. usage-based surprises
• Frame headcount avoidance as 'talent reallocation' not 'cost cutting'`,

    CEO: `#### 🎤 Executive Translation — CEO Lens

**Technical Feature:** API Orchestration Engine

**CEO Strategic Framing:**

🔹 **Customer Experience as Competitive Moat**
"In your industry, customer experience is the #1 differentiator — ahead of price and product. This platform gives your support team the same unified, AI-powered toolkit that your competitors' customers are starting to expect. It's not a cost center investment — it's a revenue protection strategy."

🔹 **Operational Agility**
"When you launch a new product line or enter a new market, your support infrastructure scales in days, not months. No new tools to procure, no new integrations to build, no new teams to train."

🔹 **Board-Ready Metrics**
"Your board wants to see NPS, CSAT, and first-response time trending up quarter over quarter. This platform makes those metrics real-time and automated — no more 'we'll have that number by next week.'"

**Recommended Talking Points:**
• Frame CX as revenue protection, not cost optimization
• Reference 2-3 competitors who recently invested in CX transformation
• Connect platform to company's stated growth targets`,

    COO: `#### 🎤 Executive Translation — COO Lens

**Technical Feature:** API Orchestration Engine

**COO Strategic Framing:**

🔹 **Operational Efficiency at Scale**
"Your support team handles 3,200 tickets/week across 4 disconnected tools. Each context-switch costs 4-6 minutes. That's 320+ hours/week of wasted productivity — the equivalent of 8 full-time agents doing nothing but switching tabs. One unified platform eliminates this immediately."

🔹 **Process Standardization**
"Today, your NYC and London teams run different processes because they use different tool configurations. This platform enforces one global workflow — same SLAs, same escalation paths, same reporting — regardless of geography."

🔹 **Workforce Planning**
"With real-time analytics on ticket volume, agent utilization, and seasonal trends, you can forecast staffing needs 90 days out instead of reacting month-to-month. That's the difference between thoughtful hiring and emergency overtime."

**Recommended Talking Points:**
• Lead with productivity waste quantification (hours/week lost)
• Emphasize global process standardization
• Connect to their workforce planning challenges`
  },

  // Module 7: Data Seeder
  dataSeeder: {
    fintech: [
      { subject: "Unable to process refund — transaction stuck in pending", description: "Customer reports refund initiated 5 days ago for order #RF-29481 still showing as 'Processing'. Amount: $2,340. Payment method: Visa ending 4521. Customer is threatening chargeback.", priority: 3, type: "Refund", tags: ["payment", "refund", "urgent"] },
      { subject: "KYC verification timeout during onboarding", description: "New user attempting to complete KYC verification is getting a timeout error after uploading documents. Error code: KYC-TIMEOUT-503. Browser: Chrome 121. User has tried 3 times over 2 days.", priority: 2, type: "Bug", tags: ["kyc", "onboarding", "verification"] },
      { subject: "API rate limit hit on transaction webhook endpoint", description: "Our integration partner reports hitting 429 rate limits on the /v2/transactions/webhook endpoint during peak hours (2-4pm EST). Current limit: 1000 req/min. They need 2500 req/min for their volume.", priority: 2, type: "API", tags: ["api", "rate-limit", "integration"] },
      { subject: "Unauthorized ACH debit from linked bank account", description: "Customer reports an unauthorized ACH debit of $890 from their linked Chase account ending 7823. Transaction ID: ACH-2026-88421. Customer did not initiate this transaction. Potential fraud case.", priority: 1, type: "Fraud", tags: ["fraud", "ach", "security", "urgent"] },
      { subject: "Monthly statement PDF generation failing", description: "Business customer unable to download monthly statements for January 2026. PDF generation returns 'Service Unavailable' error. Customer needs statements for tax filing deadline.", priority: 2, type: "Bug", tags: ["statements", "pdf", "tax"] }
    ],
    healthcare: [
      { subject: "Patient portal — unable to view lab results", description: "Patient Jane D. (MRN: 847291) reports lab results from Feb 10 visit not appearing in patient portal. Bloodwork was completed at Quest Diagnostics. HL7 feed may not have processed.", priority: 2, type: "Integration", tags: ["patient-portal", "lab-results", "hl7"] },
      { subject: "HIPAA-compliant messaging not encrypting attachments", description: "Dr. Williams reports that X-ray images sent via secure messaging are arriving as unencrypted attachments in the provider inbox. This is a HIPAA violation risk.", priority: 1, type: "Security", tags: ["hipaa", "encryption", "compliance", "urgent"] },
      { subject: "Appointment scheduling conflict — double booking", description: "Two patients booked for the same 2:30pm slot with Dr. Chen on Feb 15. System allowed overlapping bookings after a calendar sync error with Epic EHR.", priority: 2, type: "Bug", tags: ["scheduling", "epic", "calendar"] },
      { subject: "Insurance eligibility check returning outdated information", description: "Front desk reports that real-time eligibility checks for UnitedHealthcare patients are returning 2025 benefit information instead of 2026. Affects checkout workflow.", priority: 2, type: "Integration", tags: ["insurance", "eligibility", "uhc"] },
      { subject: "Telehealth video quality degrading after 10 minutes", description: "Multiple providers report video quality drops significantly after ~10 minutes in telehealth sessions. Audio remains clear. Patients on Chrome and Firefox affected.", priority: 2, type: "Bug", tags: ["telehealth", "video", "performance"] }
    ],
    ecommerce: [
      { subject: "Cart abandonment at checkout — payment gateway timeout", description: "Multiple customers reporting checkout failure with error 'Payment processing timeout' when using Stripe. Conversion rate dropped 23% in last 4 hours. Affects all payment methods.", priority: 1, type: "Bug", tags: ["checkout", "stripe", "payment", "critical"] },
      { subject: "Inventory sync discrepancy between Shopify and warehouse", description: "SKU #WH-8842 (Blue Widget XL) shows 342 units in Shopify but warehouse reports only 12 units. 330 orders may be unfulfillable. Need immediate inventory reconciliation.", priority: 1, type: "Inventory", tags: ["inventory", "shopify", "sync", "urgent"] },
      { subject: "Return label generation — USPS API returning 400 errors", description: "Customers initiating returns are unable to generate return shipping labels. USPS API responding with 400 Bad Request since 9am EST. FedEx labels working normally.", priority: 2, type: "Integration", tags: ["returns", "usps", "shipping", "api"] },
      { subject: "Product reviews not syncing to Google Shopping feed", description: "Last 2 weeks of customer reviews (approx. 340) are not appearing in our Google Shopping product listings. Review feed XML generation appears broken.", priority: 3, type: "SEO", tags: ["reviews", "google-shopping", "feed", "seo"] },
      { subject: "Loyalty points not accruing on mobile app purchases", description: "Customers report loyalty points are earned on web purchases but not on iOS/Android app purchases. Points balance shows correctly but new app purchases don't add points.", priority: 2, type: "Bug", tags: ["loyalty", "mobile-app", "points"] }
    ]
  },

  // Module 8: Tech Utilities
  techUtilities: {
    email: `**Subject:** Next Steps — Acme Corp Technical Evaluation

Hi Mike,

Thank you for the productive session today with your team. I wanted to recap the key outcomes and outline our next steps.

**What We Covered:**
• Validated omnichannel ticketing with your team's workflow
• Demonstrated Freddy AI auto-categorization on your actual ticket samples
• Confirmed SLA policy configuration matches your current tiers

**Open Items:**
1. **SSO/SAML Configuration** — I've prepared the Okta integration guide. Once your IT team provides the SAML metadata, I can configure this in your POC environment within 24 hours.
2. **Looker Integration** — I've escalated your reporting requirements to our Product team. I'll have an update by Friday.
3. **Executive Demo** — Per our discussion, I'd like to schedule a 30-minute session with Sarah (CFO) to walk through the 3-year value analysis. Would Feb 20 at 2pm work?

**Attached:** POC progress report with screenshots of your configured workflows.

I'm available anytime for questions. Looking forward to keeping the momentum going.

Best,
[Your Name]
Solutions Engineer, Freshworks`,

    rfp: `**RFP Question:** "Describe your platform's approach to data residency and compliance with international data protection regulations including GDPR, CCPA, and SOC 2."

**Answer:**

Freshworks provides comprehensive data residency and compliance capabilities:

**Data Residency:**
• Data center options available in US (AWS us-east-1, us-west-2), EU (AWS eu-central-1, Frankfurt), India (AWS ap-south-1, Mumbai), and Australia (AWS ap-southeast-2, Sydney)
• Customers choose their data center region during account provisioning
• All data at rest and in transit remains within the selected region
• No cross-region data transfer without explicit customer consent

**GDPR Compliance:**
• Full Data Processing Agreement (DPA) available
• Right to erasure (Article 17) — automated PII deletion workflows
• Data portability (Article 20) — full data export via API and admin console
• Breach notification — 72-hour notification SLA
• Privacy by Design embedded in product development lifecycle
• Designated Data Protection Officer (DPO)

**SOC 2 Type II:**
• Annual SOC 2 Type II audit by independent auditor (Ernst & Young)
• Covers Security, Availability, and Confidentiality trust principles
• Latest report available under NDA upon request

**Additional Certifications:**
• ISO 27001:2013 certified
• ISO 27017 (Cloud Security) certified
• ISO 27018 (PII in Cloud) certified
• CSA STAR Level 1 certified
• HIPAA BAA available for healthcare customers`,

    objection: `**Objection:** "Freshworks is too small compared to Zendesk/Salesforce. How do we know you'll be around in 5 years?"

---

**🤝 Empathy:**
"That's an important concern, and it tells me you're thinking about this as a long-term partnership, not just a tool purchase — which is exactly the right mindset. Let me share some context that might reframe this."

**📊 Proof:**
"Freshworks is a publicly traded company (NASDAQ: FRSH) with:
• **$596M+ in annual revenue** (2025), growing 20%+ YoY
• **67,000+ customers** across 120+ countries
• **$1.1B in cash reserves** — zero debt
• Customers include Honda, Bridgestone, Pearson, and Cisco
• Named a Gartner Magic Quadrant Leader in CRM Customer Engagement

For additional context, Freshworks has been profitable on a non-GAAP basis and has more cash on hand than many of the 'bigger' competitors. Size doesn't equal stability — financial health does."

**⚡ Challenger:**
"Here's the more interesting question: In 5 years, do you want to be locked into a vendor whose complexity requires 3 full-time admins and a consulting firm to manage? Or do you want a platform that's powerful enough for enterprise but simple enough that your team owns it? The companies that are growing fastest in CX right now aren't choosing the biggest vendor — they're choosing the most *agile* one. That's why companies like Honda moved FROM Salesforce TO Freshworks, not the other way around."`
  },

  // Module 9: Grounding Engine
  groundingEngine: [
    { icon: '📘', name: 'Freshdesk API Documentation', type: 'URL', url: 'https://developers.freshdesk.com/api/', items: 142, status: 'Indexed', lastIndexed: '2026-02-12' },
    { icon: '📗', name: 'Freshservice API Docs', type: 'URL', url: 'https://api.freshservice.com/', items: 98, status: 'Indexed', lastIndexed: '2026-02-10' },
    { icon: '📄', name: 'Freshworks Solution Articles', type: 'URL', url: 'https://support.freshworks.com/', items: 456, status: 'Indexed', lastIndexed: '2026-02-11' },
    { icon: '🔧', name: 'FDK Developer Guides', type: 'URL', url: 'https://developers.freshworks.com/docs/', items: 67, status: 'Indexed', lastIndexed: '2026-02-09' },
    { icon: '📰', name: 'Freshworks Product Updates', type: 'URL', url: 'https://www.freshworks.com/product-updates/', items: 0, status: 'Pending', lastIndexed: '—' },
    { icon: '📊', name: 'G2 Review Analysis', type: 'PDF', url: '', items: 0, status: 'Pending', lastIndexed: '—' }
  ],

  // FDK Builder
  fdkBuilder: `// ========================================
// FDK App: Custom SLA Dashboard
// Product: Freshdesk
// Driver: Background App
// ========================================

// manifest.json
{
  "platform-version": "2.3",
  "product": {
    "freshdesk": {
      "location": {
        "full_page_app": {
          "url": "views/full_page.html",
          "icon": "images/icon.svg"
        }
      },
      "events": {
        "onTicketCreate": {
          "handler": "onTicketCreateHandler"
        }
      },
      "requests": {
        "getTickets": {
          "schema": {
            "method": "GET",
            "host": "<%= iparam.domain %>",
            "path": "/api/v2/tickets?updated_since=<%= context.since %>",
            "headers": {
              "Authorization": "Basic <%= encode(iparam.api_key) %>",
              "Content-Type": "application/json"
            }
          }
        }
      }
    }
  },
  "engines": {
    "node": "18.x"
  }
}

// server/server.js
exports = {
  onTicketCreateHandler: async function(args) {
    const ticket = args.data.ticket;
    
    // Check SLA status
    if (ticket.priority >= 3) {
      // High priority — log to SLA tracker
      await $db.set(\`sla_\${ticket.id}\`, {
        ticketId: ticket.id,
        priority: ticket.priority,
        createdAt: new Date().toISOString(),
        slaTarget: ticket.priority === 4 ? '1h' : '4h',
        status: 'tracking'
      });
    }
    
    return { status: 200 };
  }
};

// views/full_page.html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://static.freshworks.com/fdk/2.0/assets/freshworks.css">
  <link rel="stylesheet" href="styles/app.css">
</head>
<body>
  <div class="fw-widget-wrapper">
    <div id="sla-dashboard">
      <h2>SLA Compliance Dashboard</h2>
      <div id="metrics-grid"></div>
      <div id="violations-list"></div>
    </div>
  </div>
  <script src="https://static.freshworks.com/fdk/2.0/assets/fresh_client.js"></script>
  <script src="scripts/app.js"></script>
</body>
</html>`,

  // Instance Builder
  instanceBuilder: [
    { role: 'ai', text: "👋 Welcome to the Instance Builder! I'll help you configure a complete Freshworks instance. Let's start — **which Freshworks product** are you setting up?\n\n• Freshdesk (Customer Support)\n• Freshservice (IT Service Management)\n• Freshsales (CRM)\n• Freshchat (Messaging)" },
    { role: 'user', text: "Freshdesk" },
    { role: 'ai', text: "Great choice! Now let me understand your setup needs:\n\n**1. What industry is this instance for?**\n(e.g., FinTech, Healthcare, eCommerce, SaaS, Education)" },
    { role: 'user', text: "FinTech - online payments company" },
    { role: 'ai', text: "Perfect — FinTech/Payments. Let me ask a few more questions:\n\n**2. How many support agents will use this instance?**\n**3. What support channels do you need?** (Email, Chat, Phone, Social, WhatsApp)\n**4. Do you have existing SLA targets?** (e.g., Urgent = 1hr response)" },
    { role: 'user', text: "50 agents, Email + Chat + Phone, Yes we have SLAs: Urgent 30min, High 2hrs, Medium 8hrs, Low 24hrs" },
    { role: 'ai', text: "Excellent! Based on your requirements, here's what I'll configure:\n\n**📋 Configuration Plan:**\n\n✅ **Groups:** Tier 1 Support, Tier 2 Escalations, Payments Team, Fraud & Security, Compliance\n✅ **SLA Policies:** Urgent (30min/2hr), High (2hr/8hr), Medium (8hr/24hr), Low (24hr/48hr)\n✅ **Channels:** Email (support@), Live Chat Widget, Freshcaller Phone\n✅ **Automations:** Auto-categorize payment/fraud/compliance tickets, Priority routing, SLA breach escalation\n✅ **Custom Fields:** Transaction ID, Payment Method, Amount, Currency, Fraud Risk Score\n✅ **Canned Responses:** 15 FinTech-specific templates\n✅ **Portal:** Customer self-service with FAQ categories\n\n**Ready to build?** Click 'Configure Instance' and I'll execute via API. 🚀" }
  ],

  // Portal Generator
  portalGenerator: [
    { role: 'ai', text: "🌐 Welcome to the Portal Generator! I'll help you create a branded customer support portal. Let's start:\n\n**What's the company name and their primary brand color?**" },
    { role: 'user', text: "NovaPay, primary color is #2563EB (blue)" },
    { role: 'ai', text: "Great! NovaPay with blue branding. A few more details:\n\n**1. What are the main support categories customers need?**\n(e.g., Payments, Account Setup, Billing, Technical Issues)\n**2. Do they need a contact form, live chat widget, or both?**\n**3. Any specific pages besides the knowledge base?** (e.g., Status Page, Community Forum)" },
    { role: 'user', text: "Categories: Payments, Account & Security, Billing, API & Integrations. Need both contact form and chat. Also want a status page." },
    { role: 'ai', text: "I've generated your NovaPay customer portal. Here's what's included:\n\n**📄 Portal Pages:**\n• 🏠 Home — Search bar, popular articles, category cards\n• 📚 Knowledge Base — 4 categories with article listings\n• 📝 Submit a Request — Contact form with category dropdown\n• 🟢 System Status — Real-time service status page\n• 💬 Live Chat — Embedded chat widget (bottom-right)\n\n**🎨 Design:**\n• NovaPay blue (#2563EB) throughout\n• Dark header with logo\n• Clean, card-based layout\n• Mobile-responsive\n• Accessibility compliant (WCAG 2.1 AA)\n\nClick **Preview** to see it live, or **Download** to get the HTML/CSS files." }
  ],

  // Voice Bot Config
  voiceBotConfig: `#### 📞 Voice Bot IVR Configuration

**Company:** NovaPay | **Product:** Freshcaller

---

**IVR FLOW DESIGN:**

\`\`\`
📞 Incoming Call
│
├── 🔊 "Welcome to NovaPay Support. For English, press 1. Para español, presione 2."
│
├── [1] English
│   ├── 🔊 "For payment issues, press 1. For account security, press 2.
│   │         For billing, press 3. To speak with an agent, press 0."
│   │
│   ├── [1] Payments
│   │   ├── 🤖 AI Bot: "I can help with your payment. Please enter your
│   │   │         transaction ID followed by the pound key."
│   │   ├── [Valid ID] → Show transaction status, offer resolution
│   │   └── [Invalid/Timeout] → Transfer to Payments Team queue
│   │
│   ├── [2] Account Security
│   │   ├── 🔊 "If you suspect unauthorized activity, press 1 for immediate
│   │   │         assistance. For password reset, press 2."
│   │   ├── [1] → Priority queue: Fraud & Security team (SLA: 30 sec answer)
│   │   └── [2] → 🤖 AI Bot: Automated password reset flow
│   │
│   ├── [3] Billing
│   │   └── → Transfer to Billing queue (SLA: 2 min wait)
│   │
│   └── [0] Agent
│       └── → General queue (next available agent)
│
└── [2] Español → Spanish IVR tree (mirror of English)
\`\`\`

**BOT CONFIGURATION:**
| Setting | Value |
|---------|-------|
| Language | English, Spanish |
| Voice | Neural TTS (Google WaveNet) |
| Timeout | 5 seconds between inputs |
| Max Retries | 3 before agent transfer |
| Business Hours | Mon-Fri 8am-8pm EST |
| After Hours | Voicemail → auto-ticket creation |
| Queue Music | NovaPay branded hold music |
| Estimated Wait | Announce position + estimated wait time |`
};

export default DemoResponses;
