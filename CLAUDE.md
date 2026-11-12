# SoulsLike Mecanics

Juego de acción tipo Souls en **2D lateral** para **PC** (Windows principalmente). El objetivo es un juego
publicable. Fase actual: **salas de prueba aisladas**, una por mecánica (moverse, ataque ligero, cargado,
bloqueo, parry, esquiva…).

- Idioma con el usuario: **español**. Código, identificadores y commits: **inglés**.
- Se juega **en local**. No publicar ni desplegar nada en ningún servicio externo.

## Stack

| Pieza | Versión | Uso |
|---|---|---|
| Phaser | 4.x (`phaser@^4.2`) | Motor. **Es Phaser 4, no 3**: no uses APIs eliminadas (pipelines, FX/masks antiguos → Filters). Ante la duda, consulta las skills `phaser-*` y `node_modules/phaser/src`. |
| TypeScript | 5.x, `strict: true` | Todo el código. |
| Vite | 7.x | Servidor de desarrollo y build. |
| Electron | 45.x | Ventana de escritorio y empaquetado (`.exe`). |
| Vitest | tests de lógica pura (`src/core`). |
| Playwright | ya instalado en el entorno; verificación de salas con capturas (skill `verify-room`). |
| Tweakpane | panel de ajuste en vivo (solo en desarrollo). |

## Comandos

```bash
npm run dev          # Vite + ventana Electron con recarga en caliente (lo que usa el usuario para jugar)
npm run dev:web      # Solo Vite en http://localhost:5173 (lo que uso yo para verificar con Playwright)
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm test             # Vitest (lógica pura)
npm run verify -- <room-id>   # Verificación visual de una sala (Playwright + capturas)
npm run package      # Ejecutable de escritorio en release/
```

Antes de dar algo por terminado: `npm run typecheck && npm run lint && npm test`, y para cambios de
jugabilidad, `npm run verify -- <room-id>` revisando las capturas.

## Arquitectura

```
src/
  main.ts              Configuración de Phaser; elige sala con ?room=<id> (sin parámetro → menú de salas)
  core/                Lógica PURA, sin importar Phaser. Testeable con Vitest y determinista.
    fsm/               Máquina de estados genérica
    combat/            Frame data, hitboxes/hurtboxes, daño, stamina, poise
    input/             Buffer de inputs, acciones abstractas
  data/                Números de diseño (ataques, jugador, enemigos). Solo datos, sin lógica.
  game/                Capa Phaser: entidades, render, cámara, colisiones con el mundo
    input/             Teclado + mando → acciones abstractas
    debug/             Overlay de hitboxes, panel Tweakpane, puente de depuración (window.__souls)
  rooms/               Una sala de prueba por mecánica
    <room-id>/<Name>Room.ts
    registry.ts        Lista de salas (id, título, descripción, escena)
electron/              Proceso principal de Electron
tests/unit/            Vitest
tests/rooms/           Escenarios Playwright por sala
```

### Reglas de diseño (importantes)

1. **Tiempo en frames, simulación a 60 Hz fija.** Toda la jugabilidad avanza en *ticks* de 1/60 s mediante un
   acumulador; nunca uses `delta` directamente en la lógica de combate. Las duraciones se expresan en frames
   (`startup: 8`, `active: 3`, `recovery: 14`).
2. **`src/core` no importa Phaser.** La lógica de combate debe poder ejecutarse en Vitest sin navegador.
3. **Datos separados de lógica.** Daño, costes de stamina, ventanas de parry… viven en `src/data/` y se
   pueden tocar desde Tweakpane en caliente.
4. **Acciones, no teclas.** El juego reacciona a `attackLight`, `attackHeavy`, `block`, `roll`, `jump`, `move`…
   El mapeo teclado/mando está en `game/input/`. Inputs con **buffer** (por defecto ~8 frames).
5. **El jugador es una máquina de estados explícita.** Cada estado declara qué acciones acepta y cuándo se
   puede cancelar. No mezclar banderas booleanas sueltas (`isAttacking && !isRolling…`).
6. **Hitboxes ≠ cuerpo físico.** Arcade Physics se usa para moverse y chocar con el mundo; los golpes usan
   hitboxes/hurtboxes propias definidas en el frame data.
7. **Gráficos de relleno** (rectángulos/formas) hasta que las mecánicas estén cerradas. Colores con
   significado: estado del jugador visible a simple vista (p. ej. amarillo = startup, rojo = activo,
   gris = recovery, azul = i-frames).

### Puente de depuración (`window.__souls`)

Solo en desarrollo. Permite verificar salas sin jugar a mano:

```ts
window.__souls = {
  roomId: string,
  tick: number,                       // ticks simulados desde que empezó la sala
  pause(): void, resume(): void,
  step(ticks: number): void,          // avanza N ticks con el juego en pausa (determinista)
  press(action, ticks?): void,        // pulsa una acción N ticks (por defecto 1)
  hold(action): void, release(action): void,
  snapshot(): Record<string, unknown> // estado legible: player.state, stamina, hp, x, y, facing, …
}
```

Toda sala nueva debe exponer en `snapshot()` lo necesario para comprobar su mecánica.

## Skills del proyecto (`.claude/skills/`)

- `phaser-*` — referencia oficial de la API de Phaser 4 (del paquete `phaser`, licencia MIT). Úsalas antes
  de escribir código Phaser en vez de fiarte de la memoria (que suele ser de Phaser 3).
- `souls-combat-design` — principios y números de partida para combate tipo Souls y *game feel*.
- `new-test-room` — crear una sala de prueba nueva con la plantilla y registrarla.
- `add-combat-action` — añadir un ataque/estado nuevo (frame data + FSM + tests).
- `verify-room` — verificar una sala con Playwright: guion de inputs, aserciones y capturas.

## Git

- Rama de trabajo indicada por la sesión; commits pequeños y en inglés.
- No subir `node_modules/`, `dist/`, `release/` ni capturas de verificación (`artifacts/`).
