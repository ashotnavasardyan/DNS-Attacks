const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const URLHelper = require('./helpers/URLHelper.js');
const PDFHelper = require('./helpers/PDFHelper.js');

const whitelist = new Set(['example.com', 'trustedsite.com']); // Define allowed domains

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const response = data => ({ message: data });

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/fetch', asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url) {
        throw new Error('URL is required');
    }

    const { isValid,ipAddress } = await URLHelper.validate(url);
    if (!isValid) {
        throw new Error('URL not allowed');
    }

    const options = { followRedirects: false };
    const pdfPath = '/tmp/result.pdf';

    await PDFHelper.generatePDFFromURL(ipAddress, url, options);

    if (!fs.existsSync(pdfPath)) {
        throw new Error('PDF generation failed');
    }

    res.download(pdfPath, 'generated.pdf', (err) => {
        if (err) {
            throw new Error('File download failed');
        }

        fs.unlink(pdfPath, (unlinkErr) => {
            if (unlinkErr) console.error('Error deleting PDF:', unlinkErr);
        });
    });
}));

app.use((err, req, res, next) => {
    console.error(`ERROR: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
});

const PORT = 9002;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
