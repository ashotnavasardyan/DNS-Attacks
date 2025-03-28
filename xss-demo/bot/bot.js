const fs = require('fs');
const puppeteer = require('puppeteer');

const logFile = '/app/bot.log';

function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    fs.appendFileSync(logFile, logEntry + '\n');
}

let browser;
(async () => {
    
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

    while (true) {
        let page;
        try {
            logMessage('Bot visiting /index.html...');

            
            page = await browser.newPage();
            await page.setCacheEnabled(false);

            
            await page.goto('http://xss-demo.local/index.html', { waitUntil: 'networkidle2' });

            
            const result = await page.evaluate(() => document.title);
            logMessage(`Page Title: ${result}`);

        } catch (error) {
            logMessage('Error in bot: ' + error);
        } finally {
            
            if (page) {
                await page.close().catch(err => logMessage('Error closing page: ' + err));
            }
        }

        logMessage('Sleeping for 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
    }
})();