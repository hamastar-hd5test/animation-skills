// sprite stacking 核心：全部是純函式，瀏覽器與 Node 共用（無相依套件）
(function (root) {
  'use strict';

  const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  // 體素格：w(x) × d(y) × h(z)，值是調色盤編號，0 = 空
  class Volume {
    constructor(w, d, h) {
      this.w = w; this.d = d; this.h = h;
      this.v = new Uint8Array(w * d * h);
    }
    get(x, y, z) {
      if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.d || z >= this.h) return 0;
      return this.v[(z * this.d + y) * this.w + x];
    }
    set(x, y, z, c) {
      if (x < 0 || y < 0 || z < 0 || x >= this.w || y >= this.d || z >= this.h) return this;
      this.v[(z * this.d + y) * this.w + x] = c;
      return this;
    }
    // 以體素中心判斷是否落在形狀內；c = 0 就是挖空
    fill(inside, c) {
      for (let z = 0; z < this.h; z++)
        for (let y = 0; y < this.d; y++)
          for (let x = 0; x < this.w; x++)
            if (inside(x + 0.5, y + 0.5, z + 0.5)) this.set(x, y, z, c);
      return this;
    }
    box(x0, y0, z0, x1, y1, z1, c) {
      return this.fill((x, y, z) => x > x0 && x < x1 && y > y0 && y < y1 && z > z0 && z < z1, c);
    }
    // r0 是 z0 的半徑、r1 是 z1 的半徑；r1 = 0 就是圓錐
    cylinder(cx, cy, z0, z1, r0, r1, c) {
      return this.fill((x, y, z) => {
        if (z < z0 || z > z1) return false;
        const r = r0 + ((r1 - r0) * (z - z0)) / (z1 - z0);
        return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
      }, c);
    }
    sphere(cx, cy, cz, r, c) {
      return this.fill((x, y, z) => (x - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2 <= r * r, c);
    }
    // 屋頂：屋脊沿 x 軸，越高 y 方向越窄
    wedge(x0, y0, z0, x1, y1, z1, c) {
      return this.fill((x, y, z) => {
        if (x < x0 || x > x1 || z < z0 || z > z1) return false;
        const inset = ((z - z0) / (z1 - z0)) * ((y1 - y0) / 2);
        return y >= y0 + inset && y <= y1 - inset;
      }, c);
    }
  }

  // 光從螢幕左前方來，固定在螢幕上（不跟物件轉）
  const LIGHT = [-1, 0.4];
  const LIGHT_LEN = Math.hypot(LIGHT[0], LIGHT[1]);

  // 把體素切成切片並烘進三階明暗。palette: { 編號: [亮, 中, 暗] }（十六進位色）
  // turn 是這組切片要用在哪個旋轉角；固定光源要每 45° 建一組（見 lightSheets）
  function toSlices(vol, palette, turn = 0) {
    const shades = {};
    for (const k of Object.keys(palette)) shades[k] = palette[k].map(rgb);
    const c = Math.cos(-turn), s = Math.sin(-turn);
    const lx = LIGHT[0] * c - LIGHT[1] * s, ly = LIGHT[0] * s + LIGHT[1] * c;
    const { w, d, h } = vol;
    const slices = [];
    for (let z = 0; z < h; z++) {
      const px = new Uint8ClampedArray(w * d * 4);
      for (let y = 0; y < d; y++)
        for (let x = 0; x < w; x++) {
          const id = vol.get(x, y, z);
          if (!id) continue;
          // 朝向：往某一側 2 格內是空的（同一層或上一層）就算朝那一側。
          // 上一層也要看：上面那片抬 1px 後，會露出下面這片「上方是實心」的體素，
          // 它們要跟斜面同一階，否則斜屋頂會出現 1px 亮暗橫紋（11/24 短片實測補上）
          const open = (dx, dy) =>
            !vol.get(x + dx, y + dy, z) || !vol.get(x + dx * 2, y + dy * 2, z) ||
            !vol.get(x + dx, y + dy, z + 1) || !vol.get(x + dx * 2, y + dy * 2, z + 1) ? 1 : 0;
          const nx = open(1, 0) - open(-1, 0), ny = open(0, 1) - open(0, -1);
          let shade = 1;
          if (!nx && !ny) shade = vol.get(x, y, z + 1) ? 1 : 0;
          else {
            // 背光暗；朝光的直牆中間階；朝光的斜面（往上 2 層內到頂）跟頂面一樣亮
            const dot = (nx * lx + ny * ly) / LIGHT_LEN;
            shade = dot < -1e-9 ? 2 : dot > 0.25 && !(vol.get(x, y, z + 1) && vol.get(x, y, z + 2)) ? 0 : 1;
          }
          const col = shades[id][shade], i = (y * w + x) * 4;
          px[i] = col[0]; px[i + 1] = col[1]; px[i + 2] = col[2]; px[i + 3] = 255;
        }
      slices.push(px);
    }
    return { count: h, w, h: d, slices };
  }

  const LIGHT_STEPS = 8;
  const lightSheets = (vol, palette) =>
    Array.from({ length: LIGHT_STEPS }, (_, k) => toSlices(vol, palette, (k * Math.PI * 2) / LIGHT_STEPS));
  const pickSheet = (sheets, turn) => {
    const step = (Math.PI * 2) / sheets.length;
    return sheets[((Math.round(turn / step) % sheets.length) + sheets.length) % sheets.length];
  };

  // 讀切片長條圖（vendor/sprite-stacking 四視圖雕刻的輸出，或 MagicaVoxel 匯出）：
  // 一張 count 片橫排的 RGBA 像素，第 0 片（貼地）在最左。轉成 renderStack 吃的格式。
  function fromStrip(data, width, height, count) {
    if (width % count) throw new Error(`strip width ${width} is not divisible by ${count} slices`);
    const w = width / count, slices = [];
    for (let z = 0; z < count; z++) {
      const px = new Uint8ClampedArray(w * height * 4);
      for (let y = 0; y < height; y++)
        px.set(data.subarray((y * width + z * w) * 4, (y * width + z * w + w) * 4), y * w * 4);
      slices.push(px);
    }
    return { count, w, h: height, slices };
  }

  const snap = (v) => (Math.abs(v) < 1e-9 ? 0 : Math.abs(Math.abs(v) - 1) < 1e-9 ? Math.sign(v) : v);

  // 由下往上疊：每片先轉 turn、再垂直壓扁 squash、再抬高 round(z*spacing)。
  // 逐像素反查最近鄰，不經 canvas 變形，所以邊緣不會被反鋸齒。
  // 回傳的 ax, ay 是底層中心（落地點）在圖裡的位置。
  function renderStack(sheet, turn = 0, squash = 0.75, spacing = 1) {
    const { count, w, h, slices } = sheet;
    const c = snap(Math.cos(turn)), s = snap(Math.sin(turn));
    const W = Math.ceil(Math.abs(w * c) + Math.abs(h * s) - 1e-9);
    const Hs = Math.ceil((Math.abs(w * s) + Math.abs(h * c)) * squash - 1e-9);
    const lift = Math.round((count - 1) * spacing);
    const H = Hs + lift;
    const data = new Uint8ClampedArray(W * H * 4);
    const cx = W / 2;
    for (let z = 0; z < count; z++) {
      const src = slices[z];
      const top = lift - Math.round(z * spacing);
      const cy = top + Hs / 2;
      for (let py = top; py < top + Hs; py++) {
        const dy = (py + 0.5 - cy) / squash;
        for (let px = 0; px < W; px++) {
          const dx = px + 0.5 - cx;
          const u = Math.floor(dx * c + dy * s + w / 2 + 1e-9);
          const v = Math.floor(-dx * s + dy * c + h / 2 + 1e-9);
          if (u < 0 || v < 0 || u >= w || v >= h) continue;
          const si = (v * w + u) * 4;
          if (!src[si + 3]) continue;
          const di = (py * W + px) * 4;
          data[di] = src[si]; data[di + 1] = src[si + 1]; data[di + 2] = src[si + 2]; data[di + 3] = 255;
        }
      }
    }
    return { w: W, h: H, data, ax: Math.floor(cx), ay: lift + Math.floor(Hs / 2) };
  }

  // 整疊畫完才描邊：把剪影往外長 1px 填輪廓色，物件本身不動
  function outline(img, color = '#3B2A20') {
    const col = rgb(color);
    const W = img.w + 2, H = img.h + 2;
    const data = new Uint8ClampedArray(W * H * 4);
    const solid = (x, y) => x >= 0 && y >= 0 && x < img.w && y < img.h && img.data[(y * img.w + x) * 4 + 3] > 0;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const sx = x - 1, sy = y - 1, di = (y * W + x) * 4;
        if (solid(sx, sy)) {
          const si = (sy * img.w + sx) * 4;
          data[di] = img.data[si]; data[di + 1] = img.data[si + 1]; data[di + 2] = img.data[si + 2]; data[di + 3] = 255;
        } else if (solid(sx - 1, sy) || solid(sx + 1, sy) || solid(sx, sy - 1) || solid(sx, sy + 1)) {
          data[di] = col[0]; data[di + 1] = col[1]; data[di + 2] = col[2]; data[di + 3] = 255;
        }
      }
    return { w: W, h: H, data, ax: img.ax + 1, ay: img.ay + 1 };
  }

  // 把圖貼進低解析畫面，落地點對到 (x, y)；位置一律取整數像素
  function blit(dst, img, x, y, alpha = 1) {
    const ox = Math.round(x) - img.ax, oy = Math.round(y) - img.ay;
    for (let py = 0; py < img.h; py++) {
      const ty = oy + py;
      if (ty < 0 || ty >= dst.h) continue;
      for (let px = 0; px < img.w; px++) {
        const tx = ox + px;
        if (tx < 0 || tx >= dst.w) continue;
        const si = (py * img.w + px) * 4;
        if (!img.data[si + 3]) continue;
        const di = (ty * dst.w + tx) * 4;
        for (let k = 0; k < 3; k++) dst.data[di + k] = dst.data[di + k] * (1 - alpha) + img.data[si + k] * alpha;
        dst.data[di + 3] = 255;
      }
    }
    return dst;
  }

  // 多個物件：整個物件按落地點由後往前排，y 相同比 x，再比 id，避免閃爍
  const sortByGround = (objs) =>
    [...objs].sort((a, b) => a.y - b.y || a.x - b.x || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  function bounds(img) {
    let x0 = img.w, y0 = img.h, x1 = -1, y1 = -1;
    for (let y = 0; y < img.h; y++)
      for (let x = 0; x < img.w; x++)
        if (img.data[(y * img.w + x) * 4 + 3]) {
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
    return x1 < 0 ? { w: 0, h: 0 } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  const api = { Volume, toSlices, fromStrip, lightSheets, pickSheet, renderStack, outline, blit, sortByGround, bounds, rgb };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SpriteStack = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
