---
name: lean-code
description: "Reglas para escribir solo el código necesario: el cambio mínimo que cumple lo pedido, sin abstracciones especulativas, opciones que nadie usa ni infraestructura 'por si acaso'. Úsala SIEMPRE antes de escribir o modificar código en este proyecto y otra vez antes de dar una tarea por terminada (repaso del diff)."
---

# Código justo

El mejor código es el que no hace falta escribir. Cada línea hay que leerla, probarla y mantenerla.

## Antes de escribir

1. **¿Qué pide exactamente el usuario?** Haz eso. Si ves algo extra que aportaría valor, **propónlo en una
   línea** al final; no lo implementes.
2. **¿Ya existe?** Busca en `src/` (y en Phaser: skills `phaser-*`) antes de crear un helper, tipo o sistema.
3. **¿Qué es lo mínimo que lo resuelve?** Empieza por ahí. Ampliar luego es barato; quitar lo que sobra, no.

## Mientras escribes

- **Nada especulativo.** No añadas parámetros, opciones de configuración, hooks, eventos, interfaces o
  genéricos que hoy no usa nadie. "Seguro que luego hará falta" no es motivo.
- **Regla de tres.** No abstraigas hasta el tercer caso repetido. Dos copias parecidas están bien.
- **Infraestructura incremental.** `BaseRoom`, el puente `window.__souls`, el panel de ajustes y el overlay
  crecen cuando una sala concreta lo necesita, no antes.
- **Sin defensas imposibles.** No valides lo que TypeScript ya garantiza ni captures errores que no pueden
  ocurrir. Valida solo en las fronteras (input del usuario, archivos, datos externos).
- **Sin comentarios que repiten el código.** Comenta solo el *porqué* que no es obvio (p. ej. un número de
  diseño elegido tras probarlo).
- **Sin dependencias nuevas** si unas pocas líneas propias o Phaser lo resuelven. Si hace falta una, dilo.
- **Tests proporcionales.** Prueba el comportamiento que importa (reglas de combate, ventanas, costes); no
  cada getter ni la API de Phaser.
- **Cambios acotados.** No reformatees ni refactorices código que no tocas en la tarea.

## Antes de terminar: repaso del diff

Ejecuta `git diff --stat` y revisa `git diff`. Para cada bloque añadido pregúntate:

- ¿Lo pidió el usuario o es imprescindible para lo que pidió? Si no → **bórralo**.
- ¿Hay algo sin usar (import, parámetro, rama, tipo, archivo)? → bórralo.
- ¿Se puede decir igual con menos (usar Phaser o código existente)? → simplifica.

En cambios medianos o grandes, ejecuta además la skill integrada `/simplify`.
Indica al usuario el tamaño del cambio (archivos y líneas de `git diff --stat`).
