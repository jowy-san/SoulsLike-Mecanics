import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './', // Electron carga dist/index.html con file://
  test: { include: ['tests/unit/**/*.test.ts'] },
});
