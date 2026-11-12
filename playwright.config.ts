import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

// En el entorno de Claude hay un Chromium preinstalado; en el PC del usuario se usa el de Playwright.
const preinstalled = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: 'tests/rooms',
  use: {
    baseURL: 'http://localhost:5173',
    launchOptions: existsSync(preinstalled) ? { executablePath: preinstalled } : {},
  },
  webServer: { command: 'npm run dev:web', url: 'http://localhost:5173', reuseExistingServer: true },
});
