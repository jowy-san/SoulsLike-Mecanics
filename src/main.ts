import * as Phaser from 'phaser';
import { MenuScene } from './rooms/MenuScene';
import { rooms } from './rooms/registry';

// ?room=<id> abre directamente esa sala; sin parámetro, el menú.
const roomId = new URLSearchParams(location.search).get('room');
const first = rooms.find((r) => r.id === roomId);

new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#1a1a22',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { customUpdate: true } },
  input: { gamepad: true },
  scene: [...(first ? [first.scene] : []), MenuScene, ...rooms.filter((r) => r !== first).map((r) => r.scene)],
});
