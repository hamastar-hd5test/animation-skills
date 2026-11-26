const test = require('node:test');
const assert = require('node:assert');
const { Volume, toSlices, renderStack, outline, sortByGround, bounds } = require('./stack.js');

const PAL = { 1: ['#ff0000', '#aa0000', '#550000'], 2: ['#00ff00', '#00aa00', '#005500'] };
const solid = (w, d, h) => toSlices(new Volume(w, d, h).box(-1, -1, -1, w + 1, d + 1, h + 1, 1), PAL);
const R90 = Math.PI / 2;

test('壓扁 1、角度 0：高 = 切片高 + (層數 - 1)，寬 = 切片寬', () => {
  const b = bounds(renderStack(solid(6, 4, 5), 0, 1, 1));
  assert.deepStrictEqual([b.w, b.h], [6, 4 + 4]);
});

test('壓扁 0.75 比壓扁 1 矮', () => {
  const s = solid(8, 8, 5);
  assert.ok(bounds(renderStack(s, 0, 0.75)).h < bounds(renderStack(s, 0, 1)).h);
});

test('轉 90 度：寬 = 切片高', () => {
  assert.strictEqual(bounds(renderStack(solid(6, 4, 5), R90, 1, 1)).w, 4);
});

test('間距 2 比間距 1 高', () => {
  const s = solid(6, 4, 5);
  assert.ok(bounds(renderStack(s, 0, 1, 2)).h > bounds(renderStack(s, 0, 1, 1)).h);
});

test('間距 0、壓扁 1：全部攤平，看到的是最上層', () => {
  const v = new Volume(4, 4, 2).box(-1, -1, -1, 5, 5, 1, 1).box(-1, -1, 1, 5, 5, 3, 2);
  const img = renderStack(toSlices(v, PAL), 0, 1, 0);
  assert.deepStrictEqual([img.w, img.h], [4, 4]);
  for (let i = 0; i < img.data.length; i += 4) {
    assert.strictEqual(img.data[i], 0); // 每個像素都是上層的綠色系，沒有露出下層的紅
    assert.ok(img.data[i + 1] > 0);
  }
});

test('壓扁 1、角度 0：跟手動每片抬高 1px 貼上的結果逐像素相同', () => {
  const v = new Volume(5, 3, 4).cylinder(2.5, 1.5, 0, 4, 2.4, 1, 1).box(1, 0, 2, 3, 2, 4, 2);
  const s = toSlices(v, PAL);
  const img = renderStack(s, 0, 1, 1);
  const hand = new Uint8ClampedArray(s.w * (s.h + s.count - 1) * 4);
  for (let z = 0; z < s.count; z++)
    for (let y = 0; y < s.h; y++)
      for (let x = 0; x < s.w; x++) {
        const si = (y * s.w + x) * 4;
        if (!s.slices[z][si + 3]) continue;
        hand.set(s.slices[z].slice(si, si + 4), ((y + s.count - 1 - z) * s.w + x) * 4);
      }
  assert.deepStrictEqual([...img.data], [...hand]);
});

test('輪廓：每個輪廓像素都貼著剪影，且不在剪影內', () => {
  const v = new Volume(9, 9, 6).cylinder(4.5, 4.5, 0, 6, 4, 1, 1);
  const img = renderStack(toSlices(v, PAL), 0.6, 0.75);
  const o = outline(img, '#010203');
  const inside = (x, y) => x >= 0 && y >= 0 && x < img.w && y < img.h && img.data[(y * img.w + x) * 4 + 3] > 0;
  let n = 0;
  for (let y = 0; y < o.h; y++)
    for (let x = 0; x < o.w; x++) {
      const i = (y * o.w + x) * 4;
      if (o.data[i] !== 1 || o.data[i + 1] !== 2 || o.data[i + 2] !== 3) continue;
      n++;
      const sx = x - 1, sy = y - 1;
      assert.ok(!inside(sx, sy));
      assert.ok(inside(sx - 1, sy) || inside(sx + 1, sy) || inside(sx, sy - 1) || inside(sx, sy + 1));
    }
  assert.ok(n > 0);
});

test('排序：落地點 y 大的一定後畫；同 y 的順序固定', () => {
  const out = sortByGround([{ id: 'b', x: 1, y: 9 }, { id: 'a', x: 1, y: 2 }, { id: 'd', x: 0, y: 9 }, { id: 'c', x: 1, y: 9 }]);
  assert.deepStrictEqual(out.map((o) => o.id), ['a', 'd', 'b', 'c']);
});

test('同樣輸入算兩次，結果完全相同', () => {
  const s = solid(7, 5, 6);
  assert.deepStrictEqual([...renderStack(s, 1.1).data], [...renderStack(s, 1.1).data]);
});

test('偶數寬的切片轉任何角度，形狀中心都不偏移（不會晃半格）', () => {
  const sh = solid(6, 4, 3);
  const centre = (deg) => {
    const img = renderStack(sh, (deg * Math.PI) / 180, 1, 0), b = bounds(img);
    return [b.x + (b.w - 1) / 2 - img.ax, b.y + (b.h - 1) / 2 - img.ay];
  };
  for (const deg of [90, 180, 270, 45, 135]) assert.deepStrictEqual(centre(deg), centre(0));
});

test('讀切片長條圖（四視圖雕刻的輸出）：一片一片切開，第 0 片在最左', () => {
  const { fromStrip } = require('./stack.js');
  const w = 2, h = 1, count = 3, data = new Uint8ClampedArray(w * count * h * 4);
  for (let z = 0; z < count; z++) data.set([z * 10, 0, 0, 255], (z * w) * 4);
  const s = fromStrip(data, w * count, h, count);
  assert.deepStrictEqual([s.count, s.w, s.h], [3, 2, 1]);
  assert.deepStrictEqual([...s.slices[2].slice(0, 4)], [20, 0, 0, 255]);
  assert.strictEqual(s.slices[1][7], 0);
});

test('讀切片長條圖：寬度除不盡層數就報錯，不會默默切歪', () => {
  const { fromStrip } = require('./stack.js');
  assert.throws(() => fromStrip(new Uint8ClampedArray(7 * 1 * 4), 7, 1, 3), /width/);
});
