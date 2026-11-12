import * as Phaser from 'phaser';
import { BaseRoom } from '../BaseRoom';
import { initialMoveState, stepMovement } from '../../core/movement';
import { playerBody, playerMovement } from '../../data/player';

const WORLD_WIDTH = 2560;
const HEIGHT = 720;
const GROUND_Y = 640;

// [x, alturaSobreElSuelo, ancho, alto]: escalones para probar la altura de salto (salto completo ≈ 117 px)
const BLOCKS: [number, number, number, number][] = [
  [480, 0, 80, 40],
  [760, 90, 200, 20],
  [1080, 180, 200, 20],
  [1500, 0, 60, 110], // casi al límite del salto completo
  [1900, 0, 40, 260], // pared: no se puede saltar
];

export class MovementRoom extends BaseRoom {
  static readonly id = 'movement';

  private player!: Phaser.GameObjects.Rectangle;
  private body_!: Phaser.Physics.Arcade.Body;
  private eye!: Phaser.GameObjects.Rectangle;
  private move = initialMoveState();

  constructor() {
    super(MovementRoom.id);
  }

  protected setupRoom(): void {
    this.move = initialMoveState();
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, HEIGHT);
    this.physics.world.gravity.y = playerBody.gravity;

    const solids = [this.solid(0, GROUND_Y, WORLD_WIDTH, HEIGHT - GROUND_Y)];
    for (const [x, above, w, h] of BLOCKS) solids.push(this.solid(x, GROUND_Y - above - h, w, h));

    this.player = this.add.rectangle(160, GROUND_Y - playerBody.height / 2, playerBody.width, playerBody.height, 0xe8e2d0);
    this.physics.add.existing(this.player);
    this.body_ = this.player.body as Phaser.Physics.Arcade.Body;
    this.body_.setCollideWorldBounds(true).setMaxVelocityY(playerBody.maxFallSpeed);
    this.physics.add.collider(this.player, solids);
    this.eye = this.add.rectangle(0, 0, 6, 6, 0x1a1a22); // indica hacia dónde mira

    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, HEIGHT).startFollow(this.player, true, 0.15, 0.15);

    this.setHelpText([
      'SALA: MOVIMIENTO',
      'Mover: A/D o ←/→ · Saltar: Espacio (mantén para saltar más alto)',
      'Mando: stick o cruceta · A para saltar',
      'Esc: menú · F11: pantalla completa',
    ]);
  }

  protected simulate(): void {
    const { state, vy } = stepMovement(
      this.move,
      {
        moveX: this.controls.moveX(),
        jumpPressed: this.controls.justPressed('jump'),
        jumpHeld: this.controls.isDown('jump'),
      },
      this.body_.blocked.down,
      this.body_.velocity.y,
      playerMovement,
    );
    this.move = state;
    this.body_.setVelocity(state.vx, vy);
  }

  update(time: number, delta: number): void {
    super.update(time, delta);
    this.eye.setPosition(this.player.x + this.move.facing * 8, this.player.y - 16);
  }

  protected getSnapshot(): Record<string, unknown> {
    return {
      player: {
        x: this.player.x,
        y: this.player.y,
        vx: this.body_.velocity.x,
        vy: this.body_.velocity.y,
        grounded: this.body_.blocked.down,
        facing: this.move.facing,
      },
      groundY: GROUND_Y,
    };
  }

  private solid(x: number, y: number, w: number, h: number): Phaser.GameObjects.Rectangle {
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x3a3a48);
    this.physics.add.existing(r, true);
    return r;
  }
}
