const fs = require('fs');
const puppeteer = require('puppeteer');

const logFile = '/tmp/bot.log';

function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    fs.appendFileSync(logFile, logEntry + '\n');
}

async function BotVisit(targetUrl) {
    let browser;
    let page;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors',
                '--disable-web-security',
                '--allow-running-insecure-content',
                '--disk-cache-size=0',
                '--media-cache-size=0'
            ]
        });

        logMessage(`Bot visiting: ${targetUrl}`);

        page = await browser.newPage();
        await page.setCacheEnabled(false);
        await page.goto(targetUrl, { timeout: 15000 });
        await new Promise(resolve => setTimeout(resolve, 70000));
        const title = await page.title();
        logMessage(`Page Title: ${title}`);
        await page.close().catch(err => logMessage('Closing page: ' + err));
    } catch (error) {
        logMessage('Bot Error: ' + error.message);
        throw error;
    } finally {
        if (page) {
            await page.close().catch(err => logMessage('Error closing page: ' + err));
        }
        if (browser) {
            await browser.close().catch(err => logMessage('Error closing browser: ' + err));
        }
    }
}

module.exports = { BotVisit };
