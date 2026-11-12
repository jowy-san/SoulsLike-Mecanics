import { expect, test } from '@playwright/test';
import { openRoom } from './helpers';
import { playerBody, playerMovement as p } from '../../src/data/player';

test('movimiento: correr, frenar, saltar y chocar con bloques', async ({ page }) => {
  const room = await openRoom(page, 'movement');

  await room.step(30); // asentarse en el suelo
  let s = await room.snapshot();
  expect(s.player.grounded).toBe(true);
  expect(s.player.y + playerBody.height / 2).toBeCloseTo(s.groundY, 0);
  const startX = s.player.x;
  await room.shot('01-inicio');

  // Correr a la derecha: velocidad máxima tras accelFrames
  await room.hold('moveRight');
  await room.step(p.accelFrames);
  s = await room.snapshot();
  expect(s.player.vx).toBe(p.runSpeed);
  expect(s.player.facing).toBe(1);

  // Frenar al soltar
  await room.release('moveRight');
  await room.step(p.decelFrames);
  s = await room.snapshot();
  expect(s.player.vx).toBe(0);
  expect(s.player.x).toBeGreaterThan(startX);

  // Salto completo (mantener) vs. salto corto (pulsar un frame)
  const groundTop = s.player.y;
  await room.hold('jump');
  let minY = groundTop;
  for (let i = 0; i < 25; i++) {
    await room.step(1);
    minY = Math.min(minY, (await room.snapshot()).player.y);
    if (i === 15) await room.shot('02-salto-completo');
  }
  await room.release('jump');
  const fullJump = groundTop - minY;
  expect(fullJump).toBeGreaterThan(100);
  expect(fullJump).toBeLessThan(130);

  await room.step(60);
  expect((await room.snapshot()).player.grounded).toBe(true);
  await room.press('jump', 1);
  minY = groundTop;
  for (let i = 0; i < 25; i++) {
    await room.step(1);
    minY = Math.min(minY, (await room.snapshot()).player.y);
  }
  const shortJump = groundTop - minY;
  expect(shortJump).toBeLessThan(fullJump * 0.5);

  // Mirar a la izquierda
  await room.step(60);
  await room.press('moveLeft', 2);
  await room.step(2);
  expect((await room.snapshot()).player.facing).toBe(-1);

  // Correr contra el primer bloque (x = 480): se detiene delante
  await room.hold('moveRight');
  await room.step(120);
  s = await room.snapshot();
  expect(s.player.x + playerBody.width / 2).toBeLessThanOrEqual(481);
  expect(s.player.grounded).toBe(true);
  await room.shot('03-contra-bloque');

  // Saltar encima del bloque
  await room.press('jump', 20);
  await room.step(18); // subir y avanzar ~40 px sobre el bloque
  await room.release('moveRight');
  await room.step(60);
  s = await room.snapshot();
  expect(s.player.grounded).toBe(true);
  expect(s.player.y + playerBody.height / 2).toBeCloseTo(s.groundY - 40, 0);
  await room.shot('04-encima-bloque');
});
