// Movimiento lateral del jugador. Lógica pura: un paso = 1 frame a 60 Hz.

export interface MoveParams {
  runSpeed: number;
  accelFrames: number;
  decelFrames: number;
  jumpVelocity: number;
  jumpCutVelocity: number;
  coyoteFrames: number;
  jumpBufferFrames: number;
}

export interface MoveState {
  vx: number;
  facing: 1 | -1;
  coyote: number; // frames restantes en los que aún se puede saltar tras dejar el suelo
  jumpBuffer: number; // frames restantes en los que un salto pulsado sigue pendiente
}

export interface MoveInput {
  moveX: number; // -1..1
  jumpPressed: boolean; // pulsado este frame
  jumpHeld: boolean;
}

export const initialMoveState = (): MoveState => ({ vx: 0, facing: 1, coyote: 0, jumpBuffer: 0 });

/** Devuelve el nuevo estado y la velocidad vertical a aplicar (vy: negativo = hacia arriba). */
export function stepMovement(
  s: MoveState,
  input: MoveInput,
  grounded: boolean,
  vy: number,
  p: MoveParams,
): { state: MoveState; vy: number } {
  const target = input.moveX * p.runSpeed;
  const frames = input.moveX !== 0 ? p.accelFrames : p.decelFrames;
  const maxDelta = p.runSpeed / frames;
  const vx = s.vx + Math.max(-maxDelta, Math.min(maxDelta, target - s.vx));

  const canJump = grounded || s.coyote > 0;
  let coyote = grounded ? p.coyoteFrames : Math.max(0, s.coyote - 1);
  let jumpBuffer = input.jumpPressed ? p.jumpBufferFrames : Math.max(0, s.jumpBuffer - 1);

  if (jumpBuffer > 0 && canJump) {
    vy = -p.jumpVelocity;
    jumpBuffer = 0;
    coyote = 0;
  } else if (!input.jumpHeld && vy < -p.jumpCutVelocity) {
    vy = -p.jumpCutVelocity;
  }

  const facing = input.moveX > 0 ? 1 : input.moveX < 0 ? -1 : s.facing;
  return { state: { vx, facing, coyote, jumpBuffer }, vy };
}
