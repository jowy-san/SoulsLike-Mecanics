import { describe, expect, it } from 'vitest';
import { initialMoveState, stepMovement, type MoveInput, type MoveState } from '../../src/core/movement';
import { playerMovement as p } from '../../src/data/player';

const idle: MoveInput = { moveX: 0, jumpPressed: false, jumpHeld: false };

function run(frames: number, input: MoveInput, s = initialMoveState(), grounded = true, vy = 0) {
  for (let i = 0; i < frames; i++) ({ state: s, vy } = stepMovement(s, input, grounded, vy, p));
  return { s, vy };
}

describe('movimiento horizontal', () => {
  it('alcanza la velocidad máxima en accelFrames', () => {
    const right = { ...idle, moveX: 1 };
    expect(run(p.accelFrames - 1, right).s.vx).toBeLessThan(p.runSpeed);
    expect(run(p.accelFrames, right).s.vx).toBe(p.runSpeed);
  });

  it('frena del todo en decelFrames', () => {
    const moving: MoveState = { ...initialMoveState(), vx: p.runSpeed };
    expect(run(p.decelFrames, idle, moving).s.vx).toBe(0);
  });

  it('mira hacia la última dirección pulsada', () => {
    expect(run(1, { ...idle, moveX: -1 }).s.facing).toBe(-1);
    const left: MoveState = { ...initialMoveState(), facing: -1 };
    expect(run(1, idle, left).s.facing).toBe(-1);
  });
});

describe('salto', () => {
  const press = { ...idle, jumpPressed: true, jumpHeld: true };

  it('salta desde el suelo', () => {
    expect(run(1, press).vy).toBe(-p.jumpVelocity);
  });

  it('coyote time: salta poco después de dejar el suelo, pero no más tarde', () => {
    const { s } = run(1, idle); // en el suelo: carga el coyote
    const inTime = run(p.coyoteFrames - 1, idle, s, false).s;
    expect(stepMovement(inTime, press, false, 0, p).vy).toBe(-p.jumpVelocity);
    const late = run(p.coyoteFrames, idle, s, false).s;
    expect(stepMovement(late, press, false, 0, p).vy).toBe(0);
  });

  it('jump buffer: un salto pulsado justo antes de aterrizar se ejecuta al aterrizar', () => {
    let { s } = run(1, press, initialMoveState(), false, 100); // en el aire, cayendo
    s = run(p.jumpBufferFrames - 2, { ...idle, jumpHeld: true }, s, false, 100).s;
    expect(stepMovement(s, { ...idle, jumpHeld: true }, true, 0, p).vy).toBe(-p.jumpVelocity);
  });

  it('soltar el botón durante la subida corta el salto', () => {
    expect(run(1, idle, initialMoveState(), false, -p.jumpVelocity).vy).toBe(-p.jumpCutVelocity);
    expect(run(1, { ...idle, jumpHeld: true }, initialMoveState(), false, -p.jumpVelocity).vy).toBe(-p.jumpVelocity);
  });
});
