import * as Phaser from 'phaser';

// El juego reacciona a acciones, no a teclas. Aquí se mapean teclado, mando y el puente de depuración.
const ACTIONS = ['moveLeft', 'moveRight', 'jump'] as const;
export type Action = (typeof ACTIONS)[number];

const KEYS: Record<Action, string[]> = {
  moveLeft: ['A', 'LEFT'],
  moveRight: ['D', 'RIGHT'],
  jump: ['SPACE'],
};

const PAD: Record<Action, (pad: Phaser.Input.Gamepad.Gamepad) => boolean> = {
  moveLeft: (pad) => pad.left,
  moveRight: (pad) => pad.right,
  jump: (pad) => pad.A,
};

const STICK_DEADZONE = 0.25;

export class Input {
  private keys: Record<Action, Phaser.Input.Keyboard.Key[]>;
  private virtual = new Map<Action, number>(); // ticks restantes; Infinity = mantenida
  private down = new Set<Action>();
  private prev = new Set<Action>();
  private stickX = 0;

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.keys = Object.fromEntries(ACTIONS.map((a) => [a, KEYS[a].map((k) => kb.addKey(k))])) as typeof this.keys;
  }

  /** Lee el estado de todas las fuentes. Una vez por tick de simulación. */
  update(): void {
    const pad = this.scene.input.gamepad?.pad1;
    this.stickX = pad && Math.abs(pad.leftStick.x) > STICK_DEADZONE ? pad.leftStick.x : 0;
    this.prev = this.down;
    this.down = new Set();
    for (const a of ACTIONS) {
      const ticks = this.virtual.get(a) ?? 0;
      if (ticks > 0 || this.keys[a].some((k) => k.isDown) || (pad && PAD[a](pad))) this.down.add(a);
      if (ticks > 0) this.virtual.set(a, ticks - 1);
    }
  }

  isDown(a: Action): boolean {
    return this.down.has(a);
  }

  justPressed(a: Action): boolean {
    return this.down.has(a) && !this.prev.has(a);
  }

  /** -1..1; el stick analógico tiene prioridad sobre las teclas y la cruceta. */
  moveX(): number {
    return this.stickX || Number(this.isDown('moveRight')) - Number(this.isDown('moveLeft'));
  }

  // Inputs simulados para el puente de depuración
  press(a: Action, ticks = 1): void {
    this.virtual.set(a, ticks);
  }
  hold(a: Action): void {
    this.virtual.set(a, Infinity);
  }
  release(a: Action): void {
    this.virtual.delete(a);
  }
}
