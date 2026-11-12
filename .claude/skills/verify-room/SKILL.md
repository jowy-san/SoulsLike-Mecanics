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
  const room = await openRoom(page, 'light-attack');

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

## Piezas existentes

- `tests/rooms/helpers.ts` → `openRoom(page, id)`: abre `/?room=<id>`, espera a `window.__souls`, pausa y
  devuelve `step`, `press`, `hold`, `release`, `snapshot` y `shot` (espera un frame de render y guarda el PNG).
- `playwright.config.ts` → usa el Chromium preinstalado si existe y arranca Vite como `webServer`.
- `tests/rooms/movement.spec.ts` → ejemplo completo (correr, frenar, salto completo vs. corto, colisión).
- Importa los números desde `src/data/` en las aserciones en vez de copiarlos.

## Informe al usuario

Resume en español: qué se comprobó, resultado (pasa/falla con la salida real), y qué no se puede verificar
automáticamente (el *feel*): eso lo tiene que probar el usuario con `npm run dev`.
