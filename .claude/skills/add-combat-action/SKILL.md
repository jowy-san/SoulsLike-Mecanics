---
name: add-combat-action
description: "Añade o modifica una acción o estado de combate del jugador o de un enemigo (ataque ligero, combo, ataque cargado, bloqueo, parry, roll, backstep, stagger, guard break, ataque en salto…) de forma data-driven: frame data en src/data, estado en la máquina de estados, transiciones/cancelaciones, coste de stamina y tests. Úsala para cualquier cambio en cómo se comporta una acción."
---

# Añadir una acción de combate

Lee antes `souls-combat-design` para los valores de partida y la checklist.

## 1. Datos (`src/data/`)

Define la acción como datos, con duraciones en **frames**:

```ts
export const lightAttack1: AttackData = {
  id: 'light1',
  startup: 8,
  active: 3,
  recovery: 14,
  staminaCost: 12,
  damage: 20,
  poiseDamage: 10,
  hitstop: 4,
  knockback: { x: 60, y: 0 },
  // Caja relativa al personaje mirando a la derecha; se refleja según `facing`
  hitbox: { x: 18, y: -30, w: 34, h: 16 },
  cancels: [
    { into: 'light2', from: 'recovery', window: [6, 14] }, // frames de la recovery
    { into: 'roll',   from: 'recovery', window: [8, 14] },
  ],
};
```

Si la acción no encaja en un tipo existente (`AttackData`, `DefenseData`, `MovementActionData`…), amplía el
tipo en `src/core/combat/types.ts` en lugar de añadir campos sueltos.

## 2. Lógica pura (`src/core/`)

- Añade o reutiliza el estado en la FSM del personaje (`src/core/fsm/`). Cada estado implementa
  `enter`, `tick(frame)`, `exit` y `canAccept(action)`.
- La fase (`startup | active | recovery`) se deriva del frame actual y del frame data; no la guardes aparte.
- Las cancelaciones salen **solo** de `cancels` en los datos.
- Consume el input del **buffer** (`src/core/input/`), no del teclado directamente.
- Stamina: cobra al **entrar** en el estado. Define qué pasa sin stamina suficiente.
- Nada de Phaser aquí.

## 3. Tests (`tests/unit/`)

Mínimo para cada acción nueva, avanzando la lógica tick a tick:

- duración total = startup + active + recovery;
- la hitbox solo existe durante `active`;
- el coste de stamina se aplica una vez;
- cada cancelación funciona dentro de su ventana y **no** fuera de ella;
- un input en buffer durante la recovery se ejecuta en el primer frame permitido;
- casos límite: sin stamina, recibir golpe durante startup (¿interrumpe? según poise).

## 4. Capa Phaser (`src/game/`)

- Representación visual por fase (colores de `CLAUDE.md`) y overlay de hitbox con `F1`.
- Game feel: hitstop, flash, knockback, partículas según los datos.
- Expón los valores en el panel Tweakpane de la sala correspondiente.

## 5. Verificación

- `npm run typecheck && npm run lint && npm test`.
- Escenario en `tests/rooms/<room>.spec.ts` (skill `verify-room`) que ejecute la acción y compruebe el
  `snapshot()` en los frames clave, con capturas en startup, active y recovery.
- Resume al usuario los números elegidos y qué debería sentir al probarlo, para que ajuste en Tweakpane.
