// ========================================
// Tech Utility: RFP Helper (Advanced)
// ========================================

import GeminiService from '../../services/geminiService.js';
import ExcelHandler from '../../utils/excelHandler.js';

const RfpHelper = {
    state: {
        data: [],
        headers: [],
        questionCol: null,
        processing: false
    },

    render() {
        return `
        <div class="module-grid">
            <div class="glass-card module-panel" style="grid-column: 1 / -1;">
                <h2>📄 RFP Process</h2>
                
                <!-- Step 1: Upload -->
                <div id="rfp-step-1" style="display:block">
                    <p style="margin-bottom:var(--space-4);">Upload an Excel/CSV file containing RFP questions.</p>
                    <div class="upload-area" onclick="document.getElementById('rfp-upload-input').click()">
                        <div class="upload-icon">📂</div>
                        <div class="upload-text">Click to upload Excel (.xlsx) or CSV</div>
                        <div class="upload-hint">We'll parse it instantly</div>
                        <input type="file" id="rfp-upload-input" accept=".xlsx,.csv" style="display:none" onchange="RfpHelper.handleUpload(this)">
                    </div>
                </div>

                <!-- Step 2: Configure -->
                <div id="rfp-step-2" style="display:none; margin-top:var(--space-4);">
                     <div class="form-group" style="margin-bottom:var(--space-4)">
                        <label class="form-label">Mode</label>
                        <select id="rfp-mode-select" class="form-select" onchange="RfpHelper.toggleMode()">
                            <option value="answer">Answer Questions (from Column)</option>
                            <option value="generate">Rephrase / Generate Questions</option>
                        </select>
                    </div>
                     <div class="form-group" style="margin-bottom:var(--space-4)" id="rfp-col-group">
                        <label class="form-label">Which column contains the **Input**?</label>
                        <select id="rfp-col-select" class="form-select"></select>
                    </div>
                    <div style="display:flex;gap:var(--space-3)">
                         <button class="btn btn-primary" onclick="RfpHelper.startProcessing()">🚀 Start Processing</button>
                         <button class="btn btn-secondary" onclick="RfpHelper.reset()">Cancel</button>
                    </div>
                </div>

                <!-- Step 3: Processing & Review -->
                <div id="rfp-step-3" style="display:none; margin-top:var(--space-4);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
                        <h3>Progress: <span id="rfp-progress">0/0</span></h3>
                        <button class="btn btn-success" id="rfp-export-btn" onclick="RfpHelper.export()" disabled>📥 Export Excel</button>
                    </div>
                    
                    <div style="height:400px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);">
                        <table class="markdown-table" id="rfp-preview-table">
                            <thead>
                                <tr>
                                    <th>Question</th>
                                    <th>AI Suggested Answer (Editable)</th>
                                </tr>
                            </thead>
                            <tbody id="rfp-table-body">
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>`;
    },

    async handleUpload(input) {
        if (input.files.length === 0) return;
        const file = input.files[0];

        try {
            const data = await ExcelHandler.parse(file);
            if (!data || data.length === 0) throw new Error("Empty file");

            this.state.data = data;
            this.state.headers = Object.keys(data[0]);

            // Show config
            document.getElementById('rfp-step-1').style.display = 'none';
            document.getElementById('rfp-step-2').style.display = 'block';

            const select = document.getElementById('rfp-col-select');
            select.innerHTML = this.state.headers.map(h => `<option value="${h}">${h}</option>`).join('');

        } catch (e) {
            window.App.showToast("Error parsing file: " + e.message, 'danger');
        }
    },

    async startProcessing() {
        const col = document.getElementById('rfp-col-select').value;
        this.state.questionCol = col;

        document.getElementById('rfp-step-2').style.display = 'none';
        document.getElementById('rfp-step-3').style.display = 'block';

        const tbody = document.getElementById('rfp-table-body');
        tbody.innerHTML = '';

        // Render rows
        this.state.data.forEach((row, index) => {
            const q = row[col] || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="max-width:300px;opacity:0.8">${q}</td>
                <td style="padding:0">
                    <textarea class="form-textarea" id="rfp-ans-${index}" style="width:100%;height:100%;border:none;resize:vertical;min-height:60px;" placeholder="Waiting for AI..."></textarea>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Start Queue
        this.processQueue();
    },

    async processQueue() {
        const total = this.state.data.length;
        document.getElementById('rfp-progress').textContent = `0/${total}`;

        // Google Search Tool
        const tools = [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "MODE_DYNAMIC", dynamic_threshold: 0.7 } } }];

        // Process sequentially to be safe with rate limits (can optimize later)
        for (let i = 0; i < total; i++) {
            const row = this.state.data[i];
            const q = row[this.state.questionCol];
            if (!q) continue;

            // Update UI
            document.getElementById(`rfp-ans-${i}`).parentElement.style.background = 'rgba(255,255,0,0.05)';

            try {
                const result = await GeminiService.generateContent(
                    `Answer this RFP question for Freshworks: "${q}". 
                     Ground your answer in official Freshworks documentation. 
                     Be concise and professional.`,
                    'You are an RFP writer.',
                    [],
                    tools
                );

                let answer = "";
                if (result.success && !result.demo) {
                    answer = result.text;
                } else if (result.demo) {
                    answer = "Demo Mode: Freshworks supports this feature. Please enable live AI for real answers.";
                } else {
                    answer = "Error generating answer.";
                }

                document.getElementById(`rfp-ans-${i}`).value = answer;
                // Save to state
                row['AI Answer'] = answer;

            } catch (e) {
                console.error(e);
            }

            document.getElementById('rfp-progress').textContent = `${i + 1}/${total}`;
            document.getElementById(`rfp-ans-${i}`).parentElement.style.background = 'transparent';
        }

        document.getElementById('rfp-export-btn').disabled = false;
        window.App.showToast("All questions answered!", "success");
    },

    export() {
        // Update data from textareas (in case user edited)
        this.state.data.forEach((row, index) => {
            const val = document.getElementById(`rfp-ans-${index}`).value;
            row['AI Answer'] = val;
        });

        ExcelHandler.generate(this.state.data, 'RFP_Completed.xlsx');
        window.App.showToast("Excel downloaded", "success");
    },

    toggleMode() {
        // Placeholder for future UI changes based on mode
    },

    reset() {
        this.state.data = [];
        document.getElementById('rfp-step-1').style.display = 'block';
        document.getElementById('rfp-step-2').style.display = 'none';
        document.getElementById('rfp-step-3').style.display = 'none';
        document.getElementById('rfp-upload-input').value = '';
    }
};

window.RfpHelper = RfpHelper;
export default RfpHelper;
