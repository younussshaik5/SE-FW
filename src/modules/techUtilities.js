// ========================================
// Module 8: Technical Utilities (Container)
// ========================================

import EmailAssist from './tech/emailAssist.js';
import RfpHelper from './tech/rfpHelper.js';
import ObjectionCrusher from './tech/objectionCrusher.js';

const TechUtilities = {
    render() {
        return `
        <div class="module-page">
            <div class="module-header">
                <h1>✉️ Technical Utilities</h1>
                <p class="module-desc">Production-ready assistance for pre-sales communication and competitive positioning.</p>
            </div>

            <div class="tabs" style="margin-bottom:var(--space-4)">
                <button class="tab active" data-tab="email-assist">✉️ Email Assist</button>
                <button class="tab" data-tab="rfp-helper">📄 RFP Helper</button>
                <button class="tab" data-tab="objection-crusher">💪 Objection Crusher</button>
            </div>

            <!-- TAB: Email Assist -->
            <div id="tab-email-assist" class="tab-content active">
                ${EmailAssist.render()}
            </div>

            <!-- TAB: RFP Helper -->
            <div id="tab-rfp-helper" class="tab-content">
                ${RfpHelper.render()}
            </div>

            <!-- TAB: Objection Crusher -->
            <div id="tab-objection-crusher" class="tab-content">
                ${ObjectionCrusher.render()}
            </div>
        </div>`;
    },

    init() {
        // Tab Switching Logic
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

                e.target.classList.add('active');
                const targetId = `tab-${e.target.dataset.tab}`;
                document.getElementById(targetId).style.display = 'block';
            });
        });

        // Init sub-modules if they have init methods (not used currently but good practice)
        if (EmailAssist.init) EmailAssist.init();
        if (RfpHelper.init) RfpHelper.init();
        if (ObjectionCrusher.init) ObjectionCrusher.init();
    }
};

window.TechUtilities = TechUtilities;
export default TechUtilities;
