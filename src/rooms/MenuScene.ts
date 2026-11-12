import * as Phaser from 'phaser';
import { rooms } from './registry';

export class MenuScene extends Phaser.Scene {
  private selected = 0;
  private items: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('menu');
  }

  create(): void {
    this.add.text(80, 60, 'SALAS DE PRUEBA', { fontFamily: 'monospace', fontSize: '32px', color: '#e8e2d0' });
    this.add.text(80, 640, '↑/↓ o cruceta: elegir · Enter o A: entrar', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#888',
    });

    this.items = rooms.map((room, i) =>
      this.add
        .text(80, 140 + i * 56, `${room.title}\n  ${room.description}`, { fontFamily: 'monospace', fontSize: '18px' })
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.select(i))
        .on('pointerdown', () => this.enter()),
    );
    this.select(Math.min(this.selected, rooms.length - 1));

    const kb = this.input.keyboard!;
    kb.on('keydown-UP', () => this.select(this.selected - 1));
    kb.on('keydown-W', () => this.select(this.selected - 1));
    kb.on('keydown-DOWN', () => this.select(this.selected + 1));
    kb.on('keydown-S', () => this.select(this.selected + 1));
    kb.on('keydown-ENTER', () => this.enter());
    kb.on('keydown-SPACE', () => this.enter());
    // Botones estándar: 0 = A, 12 = arriba, 13 = abajo
    this.input.gamepad?.on('down', (_pad: unknown, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 12) this.select(this.selected - 1);
      if (button.index === 13) this.select(this.selected + 1);
      if (button.index === 0) this.enter();
    });
  }

  private select(i: number): void {
    this.selected = Phaser.Math.Wrap(i, 0, rooms.length);
    this.items.forEach((t, j) => t.setColor(j === this.selected ? '#f0c060' : '#9a9a9a'));
  }

  private enter(): void {
    this.scene.start(rooms[this.selected].id);
  }
}
