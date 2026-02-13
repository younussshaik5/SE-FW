// ========================================
// SE Workstation Proxy Server
// ========================================

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

// Enable CORS for all routes (since this is a local tool)
app.use(cors());
app.use(express.json());

// Proxy Endpoint
app.post('/api/proxy', async (req, res) => {
    const { url, method, headers, body } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Missing target URL' });
    }

    console.log(`[Proxy] ${method || 'GET'} -> ${url}`);

    try {
        const options = {
            method: method || 'GET',
            headers: headers || {},
        };

        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.text(); // Get text first to handle non-JSON

        // Try parsing JSON, else return text/html
        try {
            const json = JSON.parse(data);
            res.status(response.status).json(json);
        } catch (e) {
            res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('SE Workstation Proxy is Running! 🚀');
});

app.listen(PORT, () => {
    console.log(`
    🚀 Proxy Server running at http://localhost:${PORT}
    Make sure your frontend is pointing to this URL.
    `);
});
