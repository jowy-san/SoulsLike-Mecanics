---
name: souls-combat-design
description: "Principios de diseño y números de partida para combate tipo Souls en 2D lateral, y técnicas de game feel. Úsala al diseñar o ajustar cualquier mecánica de combate o movimiento: ataques ligeros/cargados, bloqueo, parry, esquiva/roll, stamina, poise, i-frames, input buffer, hitstop, knockback, screenshake, cámara. Triggers: frame data, startup, recovery, stamina, parry window, i-frames, poise, hitstop, game feel, tuning, balance."
---

# Diseño de combate tipo Souls (2D lateral)

Valores **de partida** a 60 Hz (1 frame ≈ 16,7 ms). Son hipótesis para ajustar jugando, no verdades.
Todos viven en `src/data/` y se exponen en Tweakpane.

## Pilares

1. **Compromiso**: una vez empieza una acción, el jugador no puede cancelarla a voluntad. El riesgo nace del
   compromiso. Toda acción tiene *startup → active → recovery*.
2. **Legibilidad**: todo ataque (propio y enemigo) se anuncia. Startup visible, color/pose distintos.
   Si el jugador muere, debe entender por qué.
3. **Gestión de recursos**: la stamina limita atacar, esquivar y bloquear. Quedarse sin stamina es un error
   castigable, no un bloqueo arbitrario.
4. **Respuesta inmediata al input**: el compromiso es *después* de pulsar; pulsar debe responder en el
   siguiente frame posible. Usa buffer para que los inputs tempranos no se pierdan.

## Frame data de referencia

| Acción | Startup | Active | Recovery | Stamina | Notas |
|---|---|---|---|---|---|
| Ataque ligero 1 | 8 | 3 | 14 | 12 | Combo: ventana de encadenado en los últimos ~8 frames de recovery |
| Ataque ligero 2 | 7 | 3 | 16 | 12 | |
| Ataque ligero 3 (final) | 10 | 4 | 22 | 15 | Más daño y empuje, más recovery |
| Cargado (mín.) | 18 | 4 | 24 | 25 | Mantener para cargar; soltar dispara |
| Cargado (máx.) | +30 de carga | 5 | 26 | 35 | Daño ×1,8–2,2; rompe guardia/poise |
| Roll | 2 | i-frames 3→14 | total 26 | 15 | Desplazamiento ~110 px; recovery vulnerable |
| Backstep (sin dirección) | 1 | i-frames 2→7 | total 16 | 10 | Corto, rápido |
| Parry | 3 | ventana 6 | 20 (fallo) | 10 | Fallo = vulnerable. Éxito → enemigo aturdido ~60 frames |
| Bloqueo (subir guardia) | 3 | mientras se mantiene | 6 al bajar | coste = daño × factor | Regeneración de stamina reducida (~30 %) |

- **Stamina**: máx. 100; regenera ~1,0/frame tras **retardo** de ~30 frames desde la última acción que gastó.
  Con stamina < coste: la acción **sí** se puede ejecutar si stamina > 0 (estilo Souls, puede quedar en
  negativo hasta 0) — decidir y documentar en `data/`. Bloquear con 0 stamina → *guard break* (aturdido ~50 f).
- **Poise / postura**: el jugador acumula daño de poise; si supera el umbral, *stagger* (~20 f). Los ataques
  cargados hacen más daño de poise. El poise se recupera tras ~90 f sin recibir golpes.
- **Hitstun** del enemigo al recibir golpe ligero: ~12–18 f. Nunca dejes al jugador encadenar
  infinitamente: el último golpe del combo empuja (knockback) y rompe el contacto.

## Input buffer y cancelaciones

- Buffer por defecto **8 frames**: un input pulsado durante la recovery se ejecuta en cuanto la acción lo
  permita. Si llegan varios, gana el **último**.
- Ventanas de cancelación por estado (definidas en frame data, no en código suelto):
  - Ataque → siguiente ataque del combo: final de la recovery.
  - Ataque → roll: normalmente **no** durante startup/active; sí en la segunda mitad de la recovery.
  - Roll → ataque: al terminar los i-frames (ataque tras roll = variante propia si se quiere).
- *Coyote time* para saltar: ~6 f. *Jump buffer*: ~6 f.

## Movimiento lateral

- Correr: ~180–220 px/s con aceleración rápida (alcanzar velocidad en ~4–6 f) y frenado en ~3–4 f.
  Un Souls se siente pesado por el **compromiso de las acciones**, no por un movimiento resbaladizo.
- Gravedad alta, salto corto y fijo (o con corte al soltar si encaja). Sin control aéreo excesivo.
- Girarse está prohibido durante startup/active de ataques (la dirección se fija al inicio).

## Game feel (orden de impacto/esfuerzo)

1. **Hitstop**: congelar atacante y víctima 3–6 f al impactar (más en cargados). Es lo que más "peso" da.
2. **Flash de impacto**: la víctima se pinta en blanco 2–3 f.
3. **Knockback**: empuje corto con desaceleración; mayor en golpes finales/cargados.
4. **Screenshake**: pequeño (2–4 px, 6–10 f) solo en golpes fuertes, parry y recibir daño. Desactivable.
5. **Partículas/chispas** en el punto de impacto; chispas distintas para bloqueo y parry.
6. **Sonido** (cuando haya): cada evento con su sonido, ligeras variaciones de tono.
7. **Cámara**: sigue con *lerp* y *look-ahead* en la dirección de mirada; nunca tiembla por el movimiento.

## Checklist al diseñar una mecánica

- [ ] ¿Tiene startup, active y recovery definidos en frames en `src/data/`?
- [ ] ¿Qué cuesta (stamina) y qué pasa si no hay suficiente?
- [ ] ¿Qué puede cancelarla y qué puede ella cancelar?
- [ ] ¿Cómo se lee visualmente cada fase (color/pose)?
- [ ] ¿Qué la castiga? (riesgo) ¿Qué la recompensa? (beneficio)
- [ ] ¿Está expuesta en Tweakpane y en `window.__souls.snapshot()`?
- [ ] ¿Tiene tests de lógica (Vitest) y un escenario de verificación (`verify-room`)?
