import type { MoveParams } from '../core/movement';

// Velocidades en px/s, aceleraciones en px/s², duraciones en frames (60 Hz).
export const playerMovement: MoveParams = {
  runSpeed: 200,
  accelFrames: 5, // frames para alcanzar la velocidad máxima
  decelFrames: 3, // frames para frenar del todo
  jumpVelocity: 650, // salto completo ≈ 117 px con gravity 1800
  jumpCutVelocity: 260, // al soltar el salto, la subida se limita a esta velocidad
  coyoteFrames: 6,
  jumpBufferFrames: 6,
};

export const playerBody = {
  width: 32,
  height: 56,
  gravity: 1800,
  maxFallSpeed: 900,
};
