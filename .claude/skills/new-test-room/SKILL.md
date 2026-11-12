---
name: new-test-room
description: "Crea una sala de prueba nueva y aislada para una mecánica (movimiento, ataque ligero, cargado, bloqueo, parry, roll, enemigo de prueba…) siguiendo la plantilla del proyecto, la registra en el menú de salas y prepara su escenario de verificación. Úsala siempre que el usuario pida una sala, nivel de prueba o 'room' nueva."
---

# Crear una sala de prueba

Cada sala es una escena de Phaser que prueba **una** mecánica, con lo mínimo necesario alrededor.

## Pasos

1. **Elige un id** en kebab-case que describa la mecánica: `movement`, `light-attack`, `charged-attack`,
   `block`, `parry`, `roll`. Nombre de clase: `<PascalCase>Room` (p. ej. `LightAttackRoom`).
2. **Diseña antes de programar** (2–5 líneas, en español, al usuario si hay decisiones abiertas):
   qué se prueba, qué elementos hay (suelo, muñeco de práctica, enemigo que ataca en bucle…), qué números
   iniciales se usan. Consulta `souls-combat-design` para los valores de partida.
3. **Crea `src/rooms/<id>/<Name>Room.ts`** partiendo de la referencia de abajo. La sala:
   - extiende `BaseRoom` (en `src/rooms/BaseRoom.ts`), con lo común a todas las salas:
     simulación a 60 Hz fija, puente `window.__souls` y `Esc` para volver al menú;
   - solo añade lo específico de su mecánica;
   - herramientas de depuración (overlay de hitboxes, panel Tweakpane, cámara lenta) se añaden a `BaseRoom`
     **la primera vez que una sala las necesite de verdad**, no antes (skill `lean-code`);
   - muestra arriba a la izquierda un texto breve con los controles relevantes y el objetivo de la sala.
4. **Registra la sala** en `src/rooms/registry.ts` (id, título en español, descripción de una línea, clase).
5. **Expón el estado** necesario para verificarla en `snapshot()` (sobrescribe `getSnapshot()`).
6. Los números de diseño van en `src/data/`, nunca sueltos en la sala.
7. **Escenario de verificación**: crea `tests/rooms/<id>.spec.ts` con la skill `verify-room`.
8. **Comprueba**: `npm run typecheck && npm run lint && npm test && npm run verify -- <id>`, mira las capturas,
   y explica al usuario cómo probarla: `npm run dev` → elegir la sala en el menú.

## Referencia

Copia la estructura de `src/rooms/movement/MovementRoom.ts`: `static id`, `constructor() { super(id) }`,
`setupRoom()` (crea objetos y `setHelpText`), `simulate()` (un tick a 60 Hz, sin `delta`) y
`getSnapshot()` (estado para verificar). `BaseRoom` ejecuta `simulate()` → paso de física en cada tick.

## Reglas

- Una sala no depende de otra. Lo compartido va a `src/game/` o `src/core/`, no se copia entre salas.
- Nada de arte definitivo todavía: formas y colores con significado (ver `CLAUDE.md`).
- Si la sala revela que falta algo genérico (p. ej. un muñeco de práctica), créalo en `src/game/` para
  reutilizarlo.
