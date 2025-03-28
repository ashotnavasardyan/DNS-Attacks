const express = require('express');
const cors = require('cors');
const path = require('path');
const { BotVisit } = require('./bot');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/visit', asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url || !/^https?:\/\/[^\s]+$/.test(url)) {
        return res.status(400).json({ error: 'A valid URL is required' });
    }

    await BotVisit(url);
    res.json({ message: `Bot visited ${url}` });
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

const PORT = 9003;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});
