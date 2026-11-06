/**
 * Medição barata do quadro (CPU): tempo de atualização da simulação e tempo de envio do render (renderer.render).
 * Usado pelos ganchos de teste (?test → __shinobiTest.perf) para perfilar hordas grandes; custo ~3 performance.now por quadro.
 */
export function createPerfMonitor() {
  const s = { frames: 0, update: 0, render: 0, maxFrame: 0, since: performance.now() };
  return {
    record(start: number, beforeRender: number, end: number) {
      s.frames++; s.update += beforeRender - start; s.render += end - beforeRender;
      if (end - start > s.maxFrame) s.maxFrame = end - start;
    },
    reset() { s.frames = 0; s.update = 0; s.render = 0; s.maxFrame = 0; s.since = performance.now(); },
    read() {
      const n = Math.max(1, s.frames), seconds = (performance.now() - s.since) / 1000;
      return { frames: s.frames, seconds, fps: s.frames / Math.max(.001, seconds), updateMs: s.update / n, renderMs: s.render / n, cpuMs: (s.update + s.render) / n, maxFrameMs: s.maxFrame };
    },
  };
}
