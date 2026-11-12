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
3. **Crea `src/rooms/<id>/<Name>Room.ts`** partiendo de la plantilla de abajo. La sala:
   - extiende `BaseRoom` (en `src/rooms/BaseRoom.ts`), que ya aporta: suelo, cámara, simulación a 60 Hz fija,
     overlay de depuración (tecla `F1` hitboxes, `F2` panel Tweakpane, `F3` cámara lenta, `F4` pausa/frame a frame),
     puente `window.__souls`, y la tecla `Esc` para volver al menú;
   - solo añade lo específico de su mecánica;
   - muestra arriba a la izquierda un texto breve con los controles relevantes y el objetivo de la sala.
4. **Registra la sala** en `src/rooms/registry.ts` (id, título en español, descripción de una línea, clase).
5. **Expón el estado** necesario para verificarla en `snapshot()` (sobrescribe `getSnapshot()`).
6. **Expón los números** de la mecánica en el panel Tweakpane (sobrescribe `buildTuningPanel(pane)`).
7. **Escenario de verificación**: crea `tests/rooms/<id>.spec.ts` con la skill `verify-room`.
8. **Comprueba**: `npm run typecheck && npm run lint && npm test && npm run verify -- <id>`, mira las capturas,
   y explica al usuario cómo probarla: `npm run dev` → elegir la sala en el menú.

## Plantilla

```ts
import { BaseRoom } from '../BaseRoom';
import type { Pane } from 'tweakpane';

export class ExampleRoom extends BaseRoom {
  static readonly id = 'example';

  constructor() {
    super({ key: ExampleRoom.id });
  }

  protected setupRoom(): void {
    // Crear jugador, muñecos, plataformas… (gráficos de relleno)
    this.setHelpText([
      'Objetivo: …',
      'J: ataque ligero · K: bloquear · Espacio: rodar',
    ]);
  }

  protected simulate(tick: number): void {
    // Lógica a 60 Hz fija. Nunca uses delta aquí.
  }

  protected getSnapshot(): Record<string, unknown> {
    return { ...super.getSnapshot() /*, dummyHp: this.dummy.hp */ };
  }

  protected buildTuningPanel(pane: Pane): void {
    // pane.addBinding(this.data, 'damage', { min: 0, max: 100, step: 1 });
  }
}
```

> Si `BaseRoom` todavía no existe (primera sala), créalo primero con todo lo descrito en el paso 3 y
> el puente descrito en `CLAUDE.md` → "Puente de depuración". Ajusta esta plantilla si la API real difiere,
> y actualiza esta skill para que siga reflejando el código.

## Reglas

- Una sala no depende de otra. Lo compartido va a `src/game/` o `src/core/`, no se copia entre salas.
- Nada de arte definitivo todavía: formas y colores con significado (ver `CLAUDE.md`).
- Si la sala revela que falta algo genérico (p. ej. un muñeco de práctica), créalo en `src/game/` para
  reutilizarlo.
