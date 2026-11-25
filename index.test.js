import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import alignmentViewer from './index.js';

// Stubbed canvas / 2D context. The library is browser-only (needs document +
// Canvas 2D), so we record every drawing call instead of rasterizing.

class Fake2DContext {
  constructor() {
    this.fillRectCalls = [];
    this.fillTextCalls = [];
    this.fillStyle = null;
    this.font = null;
    this.textAlign = null;
    this.textBaseline = null;
    this.getImageDataCalls = 0;
  }

  getImageData() {
    this.getImageDataCalls++;
    if (stub.probe === 'throw') throw new Error('NS_ERROR_FAILURE');
    if (stub.probe === 'zeros') return { data: [0, 0, 0, 0] };
    return { data: [10, 20, 30, 255] };
  }

  fillRect(x, y, w, h) {
    this.fillRectCalls.push({ x, y, w, h, fillStyle: this.fillStyle });
  }

  fillText(text, x, y, maxWidth) {
    this.fillTextCalls.push({ text, x, y, maxWidth, fillStyle: this.fillStyle });
  }
}

// Per-test failure knobs, reset in beforeEach.
let stub;

function makeCanvasStub() {
  let w = 0;
  let h = 0;
  const canvas = {
    // stub.clampTo mimics browsers falling back to 300x150 for absurd sizes
    get width() { return w; },
    set width(v) { w = stub.clampTo ? stub.clampTo.width : v; },
    get height() { return h; },
    set height(v) { h = stub.clampTo ? stub.clampTo.height : v; },
    _ctx: null,
    getContext(kind) {
      if (kind !== '2d') throw new Error('unsupported context: ' + kind);
      if (stub.nullContext) return null;
      if (!canvas._ctx) canvas._ctx = new Fake2DContext();
      return canvas._ctx;
    },
  };
  return canvas;
}

let createdCanvases;

beforeEach(() => {
  createdCanvases = [];
  stub = { probe: 'ok', clampTo: null, nullContext: false };
  globalThis.document = {
    createElement(tag) {
      if (tag !== 'canvas') throw new Error('unsupported element: ' + tag);
      const canvas = makeCanvasStub();
      createdCanvases.push(canvas);
      return canvas;
    },
  };
});

afterEach(() => {
  delete globalThis.document;
});

async function render(seqs, config) {
  const canvas = await alignmentViewer(seqs, config);
  expect(createdCanvases).toContain(canvas);
  return { canvas, ctx: canvas.getContext('2d') };
}

describe('alignmentViewer', () => {
  it('exports a function that returns a Promise', () => {
    expect(typeof alignmentViewer).toBe('function');
    const result = alignmentViewer([{ seq: 'ACGT' }]);
    expect(result).toBeInstanceOf(Promise);
  });

  it('sizes the canvas to longest sequence x number of sequences', async () => {
    const { canvas } = await render(
      [{ seq: 'ACG' }, { seq: 'ACGTA' }],
      { width: 3, height: 2 },
    );
    expect(canvas.width).toBe(5 * 3);
    expect(canvas.height).toBe(2 * 2);
  });

  it('defaults to 1px cells and no showChar', async () => {
    const { canvas, ctx } = await render([{ seq: 'AC' }, { seq: 'TG' }]);
    expect(canvas.width).toBe(2);
    expect(canvas.height).toBe(2);
    expect(ctx.fillTextCalls).toHaveLength(0);
    expect(ctx.font).toBeNull();
  });

  it('paints the ambiguous background across the full canvas first', async () => {
    const { canvas, ctx } = await render([{ seq: 'AC' }], { width: 2, height: 4 });
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
    expect(ctx.fillRectCalls[0]).toEqual({
      x: 0, y: 0, w: 4, h: 4, fillStyle: '#ffffff',
    });
  });

  it('draws one cell rect per matching nucleotide, cell-aligned', async () => {
    const { ctx } = await render(
      [{ seq: 'ACGT' }, { seq: 'AG' }],
      { width: 2, height: 3 },
    );
    const rects = ctx.fillRectCalls.filter((c) => c.w === 2 && c.h === 3);
    expect(rects).toContainEqual({ x: 0, y: 0, w: 2, h: 3, fillStyle: '#ccff00' }); // A
    expect(rects).toContainEqual({ x: 2, y: 0, w: 2, h: 3, fillStyle: '#ffff00' }); // C
    expect(rects).toContainEqual({ x: 4, y: 0, w: 2, h: 3, fillStyle: '#ff9900' }); // G
    expect(rects).toContainEqual({ x: 6, y: 0, w: 2, h: 3, fillStyle: '#ff6600' }); // T
    expect(rects).toContainEqual({ x: 0, y: 3, w: 2, h: 3, fillStyle: '#ccff00' }); // A row 2
    expect(rects).toContainEqual({ x: 2, y: 3, w: 2, h: 3, fillStyle: '#ff9900' }); // G row 2
    expect(rects.filter((c) => c.y === 3 && c.x >= 4)).toHaveLength(0);
  });

  it('ignores characters that have no configured color', async () => {
    const { ctx } = await render([{ seq: 'A-G' }], { width: 2, height: 2 });
    const rects = ctx.fillRectCalls.filter((c) => c.w === 2 && c.h === 2);
    expect(rects.map((c) => c.x).sort((a, b) => a - b)).toEqual([0, 4]);
  });

  it('renders lowercase sequences the same as uppercase ones', async () => {
    const lower = await render([{ seq: 'acgt' }], { width: 2, height: 2 });
    const upper = await render([{ seq: 'ACGT' }], { width: 2, height: 2 });
    const rects = (ctx) => ctx.fillRectCalls.filter((c) => c.w === 2 && c.h === 2);
    expect(rects(lower.ctx)).toEqual(rects(upper.ctx));
  });

  it('sizes the canvas from the rounded-up cell size for fractional sizes', async () => {
    const { canvas, ctx } = await render([{ seq: 'AG' }, { seq: 'CT' }], { width: 1.5, height: 2.5 });
    expect(canvas.width).toBe(2 * 2);
    expect(canvas.height).toBe(2 * 3);
    expect(ctx.fillRectCalls[0]).toMatchObject({ x: 0, y: 0, w: 4, h: 6 });
    const rects = ctx.fillRectCalls.slice(1);
    expect(rects).toHaveLength(4);
    for (const r of rects) {
      expect(r.x + r.w).toBeLessThanOrEqual(canvas.width);
      expect(r.y + r.h).toBeLessThanOrEqual(canvas.height);
    }
    expect(rects).toContainEqual({ x: 2, y: 0, w: 2, h: 3, fillStyle: '#ff9900' });
  });

  it('merges partial color overrides with the defaults', async () => {
    const { ctx } = await render(
      [{ seq: 'ACG' }],
      { width: 2, height: 2, colors: { A: '#123456', ambig: '#000000' } },
    );
    const rects = ctx.fillRectCalls.filter((c) => c.w === 2 && c.h === 2);
    expect(rects).toContainEqual({ x: 0, y: 0, w: 2, h: 2, fillStyle: '#123456' });
    expect(rects).toContainEqual({ x: 2, y: 0, w: 2, h: 2, fillStyle: '#ffff00' });
    expect(rects).toContainEqual({ x: 4, y: 0, w: 2, h: 2, fillStyle: '#ff9900' });
    expect(ctx.fillRectCalls[0].fillStyle).toBe('#000000');
  });

  it('matches lowercase single-character color keys like uppercase ones', async () => {
    const colors = { a: '#123456', p: '#111111', ambig: '#000000' };
    const { ctx } = await render([{ seq: 'apC' }], { width: 2, height: 2, colors });
    const rects = ctx.fillRectCalls.filter((c) => c.w === 2 && c.h === 2);
    expect(rects).toContainEqual({ x: 0, y: 0, w: 2, h: 2, fillStyle: '#123456' });
    expect(rects).not.toContainEqual({ x: 0, y: 0, w: 2, h: 2, fillStyle: '#ccff00' });
    expect(rects).toContainEqual({ x: 2, y: 0, w: 2, h: 2, fillStyle: '#111111' });
    expect(rects).toContainEqual({ x: 4, y: 0, w: 2, h: 2, fillStyle: '#ffff00' });
    expect(ctx.fillRectCalls[0].fillStyle).toBe('#000000');
    expect(colors).toEqual({ a: '#123456', p: '#111111', ambig: '#000000' });
  });

  it('supports non-nucleotide alphabets via custom colors', async () => {
    const { ctx } = await render(
      [{ seq: 'PPC' }],
      { width: 2, height: 2, colors: { P: '#111111', C: '#222222' } },
    );
    const rects = ctx.fillRectCalls.filter((c) => c.w === 2 && c.h === 2);
    expect(rects).toContainEqual({ x: 0, y: 0, w: 2, h: 2, fillStyle: '#111111' });
    expect(rects).toContainEqual({ x: 2, y: 0, w: 2, h: 2, fillStyle: '#111111' });
    expect(rects).toContainEqual({ x: 4, y: 0, w: 2, h: 2, fillStyle: '#222222' });
  });

  it('resolves for an empty sequence list', async () => {
    const { canvas, ctx } = await render([]);
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
    // Background fill is the only call
    expect(ctx.fillRectCalls).toHaveLength(1);
    expect(ctx.fillRectCalls[0]).toMatchObject({ x: 0, y: 0, w: 0, h: 0 });
  });

  it('renders characters centered in cells when showChar is enabled', async () => {
    const { ctx } = await render(
      [{ seq: 'ACG' }],
      { width: 10, height: 10, showChar: true },
    );
    expect(ctx.font).toBe('8px monospace');
    expect(ctx.textAlign).toBe('center');
    expect(ctx.textBaseline).toBe('middle');
    expect(ctx.fillTextCalls).toHaveLength(3);
    expect(ctx.fillTextCalls[0]).toMatchObject({ text: 'A', x: 5, y: 5, maxWidth: 10, fillStyle: 'black' });
    expect(ctx.fillTextCalls[1]).toMatchObject({ text: 'C', x: 15, y: 5 });
    expect(ctx.fillTextCalls[2]).toMatchObject({ text: 'G', x: 25, y: 5 });
  });

  it('clamps the showChar font size to at least 1px, always an integer', async () => {
    for (const [height, px] of [[1, 1], [2, 1], [3, 1], [4, 2], [4.5, 3]]) {
      const { ctx } = await render([{ seq: 'A' }], { width: 4, height, showChar: true });
      expect(ctx.font).toBe(px + 'px monospace');
    }
  });

  it('does not mutate input objects', async () => {
    const seqs = [{ id: 'a', seq: 'acgt' }, { id: 'b', seq: 'AG' }];
    await render(seqs, { width: 2, height: 2, showChar: true });
    expect(seqs).toEqual([{ id: 'a', seq: 'acgt' }, { id: 'b', seq: 'AG' }]);
  });

  it('renders frozen input objects (lowercase too)', async () => {
    const seqs = Object.freeze([Object.freeze({ seq: 'ac' }), Object.freeze({ seq: 'GT' })]);
    const { ctx } = await render(seqs, { width: 2, height: 2, showChar: true });
    expect(ctx.fillTextCalls.map((c) => c.text)).toEqual(['A', 'C', 'G', 'T']);
    expect(ctx.fillRectCalls.filter((c) => c.fillStyle === '#ccff00')).toHaveLength(1);
  });

  it('renders no text when showChar is false (default)', async () => {
    const { ctx } = await render([{ seq: 'AC' }], { width: 10, height: 10 });
    expect(ctx.fillTextCalls).toHaveLength(0);
    expect(ctx.font).toBeNull();
  });

  describe('unusable canvases', () => {
    // one cell, huge width: no giant loops
    const huge = { width: 100000, height: 1 };

    it('rejects when the canvas dimensions do not stick', async () => {
      stub.clampTo = { width: 300, height: 150 };
      await expect(alignmentViewer([{ seq: 'A' }], huge)).rejects.toThrow(/100000x1 canvas/);
      await expect(alignmentViewer([{ seq: 'A' }], huge)).rejects.toBeInstanceOf(Error);
    });

    it('rejects when getContext returns null', async () => {
      stub.nullContext = true;
      await expect(alignmentViewer([{ seq: 'AC' }], { width: 2, height: 3 })).rejects.toThrow(/4x3 canvas/);
    });

    it('rejects when the readback probe throws on a large canvas', async () => {
      stub.probe = 'throw';
      await expect(alignmentViewer([{ seq: 'A' }], huge)).rejects.toThrow(/100000x1 canvas/);
    });

    it('rejects when the readback probe returns all zeros on a large canvas', async () => {
      stub.probe = 'zeros';
      await expect(alignmentViewer([{ seq: 'A' }], huge)).rejects.toThrow(/exceeds this browser's canvas limits/);
    });

    it('rejects on area alone (both dimensions under 8192)', async () => {
      stub.probe = 'zeros';
      await expect(alignmentViewer([{ seq: 'A' }], { width: 4096, height: 4096 })).rejects.toThrow(/4096x4096/);
    });

    it('resolves a large canvas whose probe reads back a real pixel', async () => {
      const { canvas, ctx } = await render([{ seq: 'A' }], huge);
      expect(canvas.width).toBe(100000);
      expect(ctx.getImageDataCalls).toBe(1);
    });

    it('never probes small canvases, even if readback would return zeros', async () => {
      stub.probe = 'zeros';
      const { ctx } = await render([{ seq: 'ACGT' }, { seq: 'AC' }], { width: 8, height: 8 });
      expect(ctx.getImageDataCalls).toBe(0);
      const edge = await render([{ seq: 'A' }], { width: 8192, height: 1 });
      expect(edge.ctx.getImageDataCalls).toBe(0);
    });

    it('does not probe a zero-width canvas even when tall', async () => {
      stub.probe = 'zeros';
      const { ctx } = await render([{ seq: '' }], { width: 1, height: 100000 });
      expect(ctx.getImageDataCalls).toBe(0);
    });

    it('does not probe an empty canvas', async () => {
      stub.probe = 'throw';
      const { canvas, ctx } = await render([]);
      expect(canvas.width).toBe(0);
      expect(ctx.getImageDataCalls).toBe(0);
    });
  });

  it('exposes a global alignmentViewer when loaded as a plain script', () => {
    const src = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
    const self = {};
    vm.runInNewContext(src, { self });
    expect(typeof self.alignmentViewer).toBe('function');
  });
});
