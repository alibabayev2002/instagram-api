import puppeteer from "puppeteer";
import fs from "fs";

class InstagramBot {
    constructor(auth) {
        this.auth = auth;
        this.clients = [];
        this.browser = null;
    }

    async init() {
        this.clients = await this.readClients();
        const client = this.clients.find(
            (client) => client.username === this.auth.username
        );
        if (client) {
            this.browser = await puppeteer.connect({browserWSEndpoint: client.socket});
        } else {
            this.browser = await puppeteer.launch({
                headless: false,
                executablePath: '/opt/homebrew/bin/chromium',
                // args: ['--disable-setuid-sandbox', '--no-sandbox']
            });
        }
        await this.closeAllPages();
    }

    async readClients() {
        try {
            const clients = await fs.promises.readFile('clients.json');
            return JSON.parse(clients);
        } catch (error) {
            return [];
        }
    }

    async saveClients() {
        await fs.promises.writeFile('clients.json', JSON.stringify(this.clients));
    }

    async closeAllPages() {
        const pages = await this.browser.pages();
        for (let i = 0; i < pages.length; i++) {
            await pages[i].close();
        }
    }

    async login() {
        const page = await this.browser.newPage();
        await page.setViewport({width: 1280, height: 960});
        await page.goto('https://www.instagram.com');

        if (!(await this.isAuthenticated(page))) {
            await this.authenticate(page);
        }

        await this.saveClients();
    }

    async isAuthenticated(page) {
        return page.url().startsWith('https://www.instagram.com/accounts/login');
    }

    async authenticate(page) {
        await page.waitForSelector('input[name="username"]');
        await page.type('input[name="username"]', this.auth.username);
        await page.type('input[name="password"]', this.auth.password);

        await Promise.all([
            page.waitForNavigation(),
            page.click('button[type="submit"]'),
        ]);

        this.clients.push({
            username: this.auth.username,
            socket: this.browser.wsEndpoint(),
        });
    }

    async close() {
        await this.browser.close();
    }
}


export {InstagramBot}