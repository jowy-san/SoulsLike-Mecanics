---
name: verify-room
description: "Verifica que una sala de prueba y su mecánica funcionan de verdad: abre la sala en Chromium con Playwright, ejecuta un guion de inputs determinista a través de window.__souls, comprueba el estado (snapshot) en frames clave y guarda capturas para revisarlas. Úsala después de crear o cambiar una sala o una acción de combate, y antes de decir que algo funciona."
---

# Verificar una sala

No puedo jugar, así que verifico con un guion: **pausa → inputs → avanzar N ticks → comprobar estado →
captura**. Al ser simulación a 60 Hz fija controlada por `step()`, el resultado es determinista.

## Ejecutar

```bash
npm run verify -- <room-id>      # = playwright test tests/rooms/<room-id>.spec.ts --trace off
```

- `playwright.config.ts` arranca `npm run dev:web` (Vite en :5173) como `webServer`.
- Las capturas se guardan en `artifacts/rooms/<room-id>/` (ignorado por git).
- **Mira las capturas** con la herramienta Read (son PNG) antes de concluir. Comprueba que lo que se ve
  coincide con lo que dice el snapshot (color de fase, hitbox en el sitio correcto, barra de stamina…).
- Si falla: `--trace on` para depurar ese test; nunca desactives ni relajes una aserción para que pase.

## Escribir el escenario (`tests/rooms/<room-id>.spec.ts`)

```ts
import { test, expect } from '@playwright/test';
import { openRoom } from './helpers';

test('ataque ligero: fases y coste de stamina', async ({ page }) => {
  const room = await openRoom(page, 'light-attack');   // navega a /?room=…, espera a __souls, pausa

  const before = await room.snapshot();
  await room.press('attackLight');
  await room.step(1);
  expect((await room.snapshot()).player.state).toBe('light1');
  expect((await room.snapshot()).player.stamina).toBe(before.player.stamina - 12);

  await room.step(8);                                   // fin del startup
  expect((await room.snapshot()).player.phase).toBe('active');
  await room.shot('02-active');                         // artifacts/rooms/light-attack/02-active.png

  await room.step(3 + 14);
  expect((await room.snapshot()).player.state).toBe('idle');
});
```

Cubre como mínimo: el caso feliz, una cancelación válida, una inválida y el caso sin stamina (si aplica).
Usa los números desde los datos cuando sea posible (`room.data()`), no los copies a mano.

## `tests/rooms/helpers.ts` (crear si no existe)

```ts
import type { Page } from '@playwright/test';

export async function openRoom(page: Page, roomId: string) {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`/?room=${roomId}&test=1`);
  await page.waitForFunction(() => (window as any).__souls?.roomId);
  await page.evaluate(() => (window as any).__souls.pause());
  const call = (fn: string, ...args: unknown[]) =>
    page.evaluate(([f, a]) => (window as any).__souls[f as string](...(a as unknown[])), [fn, args] as const);
  return {
    step: (ticks: number) => call('step', ticks),
    press: (action: string, ticks = 1) => call('press', action, ticks),
    hold: (action: string) => call('hold', action),
    release: (action: string) => call('release', action),
    snapshot: () => call('snapshot') as Promise<any>,
    data: () => call('data') as Promise<any>,
    shot: (name: string) => page.screenshot({ path: `artifacts/rooms/${roomId}/${name}.png` }),
  };
}
```

`?test=1` desactiva lo no determinista (partículas aleatorias con semilla fija, screenshake visual, Tweakpane).

## `playwright.config.ts` (crear si no existe)

```ts
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
```

## Informe al usuario

Resume en español: qué se comprobó, resultado (pasa/falla con la salida real), y qué no se puede verificar
automáticamente (el *feel*): eso lo tiene que probar el usuario con `npm run dev`.
