import type * as Phaser from 'phaser';
import { MovementRoom } from './movement/MovementRoom';

export interface RoomInfo {
  id: string;
  title: string;
  description: string;
  scene: new () => Phaser.Scene;
}

export const rooms: RoomInfo[] = [
  {
    id: MovementRoom.id,
    title: 'Movimiento',
    description: 'Correr, frenar y saltar (coyote time, buffer de salto, salto variable)',
    scene: MovementRoom,
  },
];
