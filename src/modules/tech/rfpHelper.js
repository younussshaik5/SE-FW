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
        processing: false,
        sheets: [],
        finalSpec: '',
        architecture: ''
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
                        <label class="form-label">Sheet Selection</label>
                        <div id="rfp-sheet-selector" style="display:flex;flex-wrap:wrap;gap:var(--space-2)"></div>
                    </div>
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
                        <div style="display:flex;gap:var(--space-2);align-items:center">
                            <div id="rfp-current" style="font-size:12px;color:var(--text-tertiary)"></div>
                            <button class="btn btn-success" id="rfp-export-btn" onclick="RfpHelper.export()" disabled>📥 Export Excel</button>
                        </div>
                    </div>
                    <div id="rfp-log" style="height:120px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-2);background:var(--bg-muted);margin-bottom:var(--space-4)"></div>
                    
                    <div style="height:400px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);">
                        <table class="markdown-table" id="rfp-preview-table">
                            <thead>
                                <tr>
                                    <th>Sheet</th>
                                    <th>Row</th>
                                    <th>Question</th>
                                    <th>AI Suggested Answer (Editable)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="rfp-table-body">
                            </tbody>
                        </table>
                    </div>
                    <!-- Final architecture / consolidated response -->
                    <div id="rfp-final-section" style="display:none;margin-top:var(--space-4)">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
                            <h3>🧩 Architecture Breakdown</h3>
                            <div style="display:flex;gap:var(--space-2)">
                                <button class="btn btn-sm btn-primary" onclick="RfpHelper.generateFinalSpec()">🔁 Regenerate</button>
                                <button class="btn btn-sm btn-secondary" onclick="RfpHelper.copyFinalSpec()">📋 Copy</button>
                            </div>
                        </div>
                        <div id="rfp-final-output" style="height:200px;overflow:auto;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:var(--space-2);background:var(--bg-muted);"></div>
                    </div>
                </div>

            </div>
        </div>`;
    },

    async handleUpload(input) {
        if (input.files.length === 0) return;
        const file = input.files[0];

        try {
            // ExcelHandler.parse now returns an array of sheets: [{name, rows}]
            const sheets = await ExcelHandler.parse(file);
            if (!sheets || sheets.length === 0) throw new Error("Empty file");

            this.state.sheets = sheets;

            // Flatten rows from all sheets into state.data with metadata
            const combined = [];
            sheets.forEach(sheet => {
                sheet.rows.forEach((row, idx) => {
                    combined.push(Object.assign({ __sheet: sheet.name, __rowIndex: idx }, row));
                });
            });

            this.state.data = combined;
            this.state.headers = Object.keys(combined[0] || {}).filter(h => !h.startsWith('__'));

            // Show config
            document.getElementById('rfp-step-1').style.display = 'none';
            document.getElementById('rfp-step-2').style.display = 'block';

            // Render sheet selector
            const sheetSelector = document.getElementById('rfp-sheet-selector');
            sheetSelector.innerHTML = sheets.map((sheet, idx) => `
                <label style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-md);cursor:pointer;">
                    <input type="checkbox" checked data-sheet-index="${idx}" onchange="RfpHelper.toggleSheet(${idx})">
                    <span>${sheet.name}</span>
                    <span style="color:var(--text-tertiary);font-size:12px;">(${sheet.rows.length} rows)</span>
                </label>
            `).join('');

            const select = document.getElementById('rfp-col-select');
            // let user pick which column contains the question text
            select.innerHTML = this.state.headers.map(h => `<option value="${h}">${h}</option>`).join('');

        } catch (e) {
            window.App.showToast("Error parsing file: " + e.message, 'danger');
        }
    },

    toggleSheet(sheetIndex) {
        // Toggle sheet visibility in processing
        const checkbox = document.querySelector(`input[data-sheet-index="${sheetIndex}"]`);
        const sheetName = this.state.sheets[sheetIndex].name;
        this.state.data.forEach(row => {
            if (row.__sheet === sheetName) {
                row.__skip = !checkbox.checked;
            }
        });
    },

    async startProcessing() {
        const col = document.getElementById('rfp-col-select').value;
        this.state.questionCol = col;

        document.getElementById('rfp-step-2').style.display = 'none';
        document.getElementById('rfp-step-3').style.display = 'block';

        const tbody = document.getElementById('rfp-table-body');
        tbody.innerHTML = '';

        // Render rows with sheet info
        this.state.data.forEach((row, index) => {
            if (row.__skip) return; // Skip sheets that are unchecked
            const q = row[col] || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:12px;color:var(--text-tertiary)">${row.__sheet}</td>
                <td style="font-size:12px;color:var(--text-tertiary)">${row.__rowIndex + 1}</td>
                <td style="max-width:300px;opacity:0.8">${q}</td>
                <td style="padding:0">
                    <div style="display:flex;gap:8px;align-items:flex-start;padding:8px">
                        <textarea class="form-textarea" id="rfp-ans-${index}" style="flex:1;height:100%;border:none;resize:vertical;min-height:60px;" placeholder="Waiting for AI..."></textarea>
                        <div style="display:flex;flex-direction:column;gap:6px">
                            <button class="btn btn-sm btn-secondary" onclick="RfpHelper.rerunRow(${index})" title="Re-run this row">↺</button>
                            <div id="rfp-status-${index}" style="font-size:12px;color:var(--text-tertiary);width:80px;text-align:center">Queued</div>
                        </div>
                    </div>
                </td>
                <td id="rfp-status-cell-${index}" style="font-size:12px;">Queued</td>
            `;
            tbody.appendChild(tr);
        });

        // Initialize and start queue
        this._queue = this.state.data.map((_, i) => i);
        this.state.processedCount = 0;
        this._concurrency = 3;
        this._workers = [];
        this._isProcessing = true;
        this._startWorkers();
    },
    _startWorkers() {
        const total = this.state.data.length;
        document.getElementById('rfp-progress').textContent = `0/${total}`;

        const concurrency = this._concurrency || 3;
        for (let w = 0; w < Math.min(concurrency, this._queue.length); w++) {
            const worker = (async () => {
                while (this._queue.length > 0) {
                    const idx = this._queue.shift();
                    await this.processSingleRow(idx);
                    this.state.processedCount = (this.state.processedCount || 0) + 1;
                    document.getElementById('rfp-progress').textContent = `${this.state.processedCount}/${total}`;
                }
            })();
            this._workers.push(worker);
        }

        Promise.all(this._workers).then(async () => {
            this._isProcessing = false;
            document.getElementById('rfp-export-btn').disabled = false;
            window.App.showToast("All questions answered!", "success");
            // automatically compose final spec
            await this.generateFinalSpec();
        }).catch((e) => {
            console.error('Worker error', e);
            this._isProcessing = false;
            document.getElementById('rfp-export-btn').disabled = false;
        });
    },

    appendLog(msg) {
        const el = document.getElementById('rfp-log');
        const time = new Date().toLocaleTimeString();
        el.innerHTML = `<div>[${time}] ${msg}</div>` + el.innerHTML;
    },

    async processSingleRow(i) {
        const row = this.state.data[i];
        if (row.__skip) return; // Skip unchecked sheets
        const q = row[this.state.questionCol];
        if (!q) return;

        // enforce a small inter-request delay (rate limiting)
        if (this._delay && this._delay > 0) await this._throttle();

        try {
            document.getElementById(`rfp-status-${i}`).textContent = 'Processing';
            document.getElementById(`rfp-status-cell-${i}`).textContent = 'Processing';
            document.getElementById('rfp-current').textContent = `Sheet: ${row.__sheet} • Row: ${row.__rowIndex + 1}`;
            this.appendLog(`Starting row ${i} (sheet=${row.__sheet}, row=${row.__rowIndex + 1})`);

            // Build a structured list of all columns for context
            const columnList = Object.keys(row)
                .filter(k => !k.startsWith('__'))
                .map(k => `${k}: ${row[k]}`)
                .join('\n');

            const prompt = `You are a factual RFP answer engine. For the following RFP question, provide a concise factual answer with clear references. Do NOT hallucinate. If information is not verifiable, state "NOT FOUND".\n\nQuestion: ${q}\n\nContext (all columns from this row):\n${columnList}\n\nInstructions: Search official product documentation, developer docs, community answers, and reputable web sources. Provide a short executive summary (2-4 lines) and 5-10 factual bullet points with sources.`;
            const systemInstruction = 'Answer only with verifiable facts. Use short bullets and cite sources. No hallucination. Temperature 0.1 for maximum factual accuracy.';

            const tools = [{ google_search_retrieval: { dynamic_retrieval_config: { mode: "MODE_DYNAMIC", dynamic_threshold: 0.7 } } }];

            // Use Gemma-3 with temperature 0.1 as primary
            const options = { modelOverride: 'google/gemma-3-27b-it:free', temperature: 0.1 };
            let result = await GeminiService.generateContent(prompt, systemInstruction, [], tools, options);

            // Fallback: if NOT FOUND or error, try Nemotron
            if (!result.success || /NOT FOUND/i.test(result.text || '') || result.error) {
                this.appendLog(`Primary model failed or returned NOT FOUND for row ${i}. Falling back to Nemotron.`);
                const fallbackOptions = { modelOverride: 'nvidia/nemotron-nano-12b-v2-vl:free', temperature: 0.1 };
                result = await GeminiService.generateContent(prompt, systemInstruction, [], tools, fallbackOptions);
            }

            // if still not found or error, generate a summary as fallback
            if (!result.success || /NOT FOUND/i.test(result.text || '') || result.error) {
                this.appendLog(`Both models failed/returned NOT FOUND for row ${i}. Generating summary fallback.`);
                const summaryPrompt = `Summarize the following RFP question in one sentence and explicitly state that no factual information could be found:\n\n${q}`;
                const summaryOptions = { modelOverride: 'nvidia/nemotron-nano-12b-v2-vl:free', temperature: 0.2 };
                const summaryResult = await GeminiService.generateContent(summaryPrompt,
                    'Provide a concise summary and admission of failure.', [], [], summaryOptions);
                const summaryAnswer = summaryResult.success ? summaryResult.text : `Could not generate summary (${summaryResult.error})`;
                result = { success: true, text: summaryAnswer };
            }

            let answer;
            if (result.success) {
                answer = result.text;
            } else {
                // generation failure: don't dump raw error into table
                answer = '';
                const msg = result.error || 'Failed to generate answer';
                this.appendLog(`Row ${i} error: ${msg}`);
                window.App.showToast(`Row ${i} AI error: ${msg}`, 'danger');
            }
            const ta = document.getElementById(`rfp-ans-${i}`);
            if (ta) ta.value = answer;
            row['AI Answer'] = answer;
            this.appendLog(`Completed row ${i}`);
            const statusEl = document.getElementById(`rfp-status-${i}`);
            const statusCell = document.getElementById(`rfp-status-cell-${i}`);
            if (statusEl) statusEl.textContent = result.success ? 'Done' : 'Error';
            if (statusCell) statusCell.textContent = result.success ? '✅ Done' : '❌ Error';
        } catch (e) {
            console.error(e);
            this.appendLog(`Error on row ${i}: ${e.message}`);
            const statusEl = document.getElementById(`rfp-status-${i}`);
            const statusCell = document.getElementById(`rfp-status-cell-${i}`);
            if (statusEl) statusEl.textContent = 'Error';
            if (statusCell) statusCell.textContent = '❌ Error';
        }
    },

    rerunRow(i) {
        // Allow user to re-run a single row; push into queue and start workers if idle
        const statusEl = document.getElementById(`rfp-status-${i}`);
        if (statusEl) statusEl.textContent = 'Queued';
        if (!this._queue) this._queue = [];
        this._queue.push(i);
        this.appendLog(`Row ${i} added to queue for re-run`);
        if (!this._isProcessing) {
            this._isProcessing = true;
            this._workers = [];
            this._startWorkers();
        }
    },

    async generateFinalSpec() {
        if (this._isProcessing) return; // wait until rows done
        const outputEl = document.getElementById('rfp-final-output');
        const section = document.getElementById('rfp-final-section');
        section.style.display = 'block';
        outputEl.innerHTML = '<div class="loading-shimmer" style="height:150px"></div>';

        // build Q/A list
        const pairs = this.state.data.map((row, idx) => {
            const q = row[this.state.questionCol] || '';
            const a = row['AI Answer'] || '';
            return `Question ${idx + 1}: ${q}\nAnswer: ${a}`;
        }).join('\n\n');

        // Build structured Q/A list grouped by sheet
        const sheets = {};
        this.state.data.forEach((row, idx) => {
            if (row.__skip) return;
            const sheet = row.__sheet || 'Unknown';
            if (!sheets[sheet]) sheets[sheet] = [];
            const q = row[this.state.questionCol] || '';
            const a = row['AI Answer'] || '';
            sheets[sheet].push({ index: idx + 1, question: q, answer: a });
        });

        // Build structured prompt with sheet breakdown
        let structuredPrompt = 'You are an RFP/RFI specialist architect. Given the following questions and answers grouped by Excel sheet tabs, produce a comprehensive architecture breakdown document.\n\n';

        for (const [sheetName, items] of Object.entries(sheets)) {
            structuredPrompt += `## Sheet: ${sheetName}\n`;
            items.forEach(item => {
                structuredPrompt += `### Question ${item.index}\n**Q:** ${item.question}\n**A:** ${item.answer}\n\n`;
            });
            structuredPrompt += '\n';
        }

        structuredPrompt += `\n## Architecture Breakdown Instructions\n`;
        structuredPrompt += `1. For each question, map the answer back and explain how it fits into the proposed architecture\n`;
        structuredPrompt += `2. Identify patterns and common themes across all sheets\n`;
        structuredPrompt += `3. Provide a consolidated executive summary\n`;
        structuredPrompt += `4. Generate a final polished RFP/RFI response that reads like a professional architecture document\n`;
        structuredPrompt += `5. Use official solution articles, developer documentation, and community resources as references\n`;
        structuredPrompt += `6. Maintain temperature 0.1 for maximum factual accuracy with no hallucination\n`;

        try {
            // Use Xiaomi/MiMo-V2-Flash for final architecture (if available) or fallback to primary model
            const modelOptions = {
                modelOverride: 'xiaomi/mimo-v2-flash',
                temperature: 0.1,
                max_tokens: 4000
            };

            let result = await GeminiService.generateContent(
                structuredPrompt,
                'You are an RFP/RFI architecture specialist. Provide factual, structured responses based on official documentation.',
                [],
                [],
                modelOptions
            );

            // Fallback if Xiaomi model not available
            if (!result.success) {
                this.appendLog('Xiaomi/MiMo-V2-Flash not available, using primary model...');
                const fallbackOptions = { temperature: 0.1, max_tokens: 4000 };
                result = await GeminiService.generateContent(
                    structuredPrompt,
                    'You are an RFP/RFI architecture specialist. Provide factual, structured responses based on official documentation.',
                    [],
                    [],
                    fallbackOptions
                );
            }

            if (result.success) {
                outputEl.innerHTML = window.MarkdownRenderer.parse(result.text);
                this.state.finalSpec = result.text;
                this.state.architecture = result.text;
                this.appendLog('Final architecture breakdown generated successfully.');
            } else {
                outputEl.innerHTML = `<div style="color:#f87171">Failed to generate final spec: ${result.error}</div>`;
                this.appendLog(`Final spec generation failed: ${result.error}`);
            }
        } catch (e) {
            console.error('Final spec error', e);
            outputEl.innerHTML = `<div style="color:#f87171">Error: ${e.message}</div>`;
            this.appendLog(`Final spec error: ${e.message}`);
        }
    },

    copyFinalSpec() {
        if (this.state.finalSpec) {
            window.App.copyToClipboard(this.state.finalSpec);
            window.App.showToast('Final architecture copied to clipboard', 'success');
        }
    },

    export() {
        // Update data from textareas (in case user edited)
        this.state.data.forEach((row, index) => {
            if (row.__skip) return;
            const val = document.getElementById(`rfp-ans-${index}`).value;
            row['AI Answer'] = val;
        });

        // When exporting, group by original sheet name to create multiple sheets
        try {
            const sheets = {};
            this.state.data.forEach(row => {
                if (row.__skip) return;
                const sheet = row.__sheet || 'Sheet1';
                const copy = Object.assign({}, row);
                delete copy.__sheet;
                delete copy.__rowIndex;
                delete copy.__skip;
                if (!sheets[sheet]) sheets[sheet] = [];
                sheets[sheet].push(copy);
            });

            // ExcelHandler.generate currently writes a single sheet; extend it here to write multiple sheets
            const workbook = XLSX.utils.book_new();
            for (const [name, rows] of Object.entries(sheets)) {
                const ws = XLSX.utils.json_to_sheet(rows);
                XLSX.utils.book_append_sheet(workbook, ws, name);
            }

            // Add final architecture sheet if available
            if (this.state.architecture) {
                const archSheet = XLSX.utils.aoa_to_sheet([
                    ['Architecture Breakdown'],
                    [''],
                    [this.state.architecture]
                ]);
                XLSX.utils.book_append_sheet(workbook, archSheet, 'Architecture');
            }

            XLSX.writeFile(workbook, 'RFP_Completed.xlsx');
            window.App.showToast("Excel downloaded with architecture breakdown", "success");
        } catch (e) {
            console.error('Export failed', e);
            window.App.showToast('Export failed', 'danger');
        }
    },

    _delay: 500, // milliseconds between requests (rate limit)

    _throttle() {
        return new Promise(res => setTimeout(res, this._delay));
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
