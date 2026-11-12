import * as Phaser from 'phaser';
import { Input, type Action } from '../game/input/Input';

const TICK_MS = 1000 / 60;

/** Puente de depuración para verificar salas sin jugar a mano (solo en desarrollo). */
interface SoulsDebug {
  roomId: string;
  pause(): void;
  resume(): void;
  step(ticks: number): void;
  press(action: Action, ticks?: number): void;
  hold(action: Action): void;
  release(action: Action): void;
  snapshot(): Record<string, unknown>;
}

declare global {
  interface Window {
    __souls?: SoulsDebug;
  }
}

/** Base de todas las salas: simulación a 60 Hz fija, input por acciones, Esc → menú. */
export abstract class BaseRoom extends Phaser.Scene {
  protected controls!: Input;
  private tick = 0;
  private acc = 0;
  private paused = false;

  create(): void {
    this.tick = 0;
    this.acc = 0;
    this.paused = false;
    this.controls = new Input(this);
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('menu'));
    this.setupRoom();
    if (import.meta.env.DEV) this.exposeDebugBridge();
  }

  update(_time: number, delta: number): void {
    if (this.paused) return;
    this.acc = Math.min(this.acc + delta, TICK_MS * 5); // tras un parón, no intentar recuperar todo
    while (this.acc >= TICK_MS) {
      this.acc -= TICK_MS;
      this.runTick();
    }
  }

  protected abstract setupRoom(): void;
  /** Lógica de un tick (1/60 s). Se ejecuta antes del paso de física. */
  protected abstract simulate(): void;

  protected getSnapshot(): Record<string, unknown> {
    return {};
  }

  protected setHelpText(lines: string[]): void {
    this.add
      .text(16, 16, lines.join('\n'), { fontFamily: 'monospace', fontSize: '16px', color: '#d8d8d8', lineSpacing: 4 })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  private runTick(): void {
    this.controls.update();
    this.simulate();
    this.physics.world.singleStep(); // la física avanza con la simulación (arcade.customUpdate = true)
    this.tick++;
  }

  private exposeDebugBridge(): void {
    window.__souls = {
      roomId: this.scene.key,
      pause: () => (this.paused = true),
      resume: () => {
        this.paused = false;
        this.acc = 0;
      },
      step: (ticks) => {
        for (let i = 0; i < ticks; i++) this.runTick();
      },
      press: (a, ticks) => this.controls.press(a, ticks),
      hold: (a) => this.controls.hold(a),
      release: (a) => this.controls.release(a),
      snapshot: () => ({ tick: this.tick, ...this.getSnapshot() }),
    };
    this.events.once('shutdown', () => delete window.__souls);
  }
}
