import type { Page } from '@playwright/test';

/** Abre una sala, espera al puente de depuración y pausa la simulación para avanzar tick a tick. */
export async function openRoom(page: Page, roomId: string) {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`/?room=${roomId}`);
  await page.waitForFunction((id) => window.__souls?.roomId === id, roomId);
  await page.evaluate(() => window.__souls!.pause());

  return {
    step: (ticks: number) => page.evaluate((n) => window.__souls!.step(n), ticks),
    press: (action: string, ticks = 1) =>
      page.evaluate(([a, n]) => window.__souls!.press(a as never, n as number), [action, ticks] as const),
    hold: (action: string) => page.evaluate((a) => window.__souls!.hold(a as never), action),
    release: (action: string) => page.evaluate((a) => window.__souls!.release(a as never), action),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    snapshot: () => page.evaluate(() => window.__souls!.snapshot()) as Promise<any>,
    shot: async (name: string) => {
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await page.screenshot({ path: `artifacts/rooms/${roomId}/${name}.png` });
    },
  };
}
