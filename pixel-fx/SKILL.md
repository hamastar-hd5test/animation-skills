---
name: pixel-fx
description: 像素風的遊戲特效與動作：受擊、攻擊、技能、爆炸、拾取金幣、開寶箱、升級、轉場、會動的小生物，以及「角色先蓄力、打中時停格、目標被打退、再收招」的動作時序。用 pixelfx（MIT，244 種用程式寫成的像素特效，可換色、鏡像、匯出 sprite sheet）找現成的，或照「草稿→算圖→看→改」做新的。使用時機：練功房的 Boss 戰、作答答對、XP、寶箱、升級卡要加特效或打擊感；任何像素風網頁或小遊戲要特效；「打擊感不夠」「特效看起來像貼紙」「做一個金幣閃光／冰霜爆發」「匯出 sprite sheet 給 Godot／Unity／Phaser」；要畫新的像素角色、怪物、圖示時也用（畫法規則在本檔）。主動更新時機：在練功房或其他專案實際接上某個特效、或撞到新陷阱時，補進 references/kungfu-room.md 或 references/quality.md。
argument-hint: "[要的特效或場景，例如：Boss 受擊、答對的金幣、升級寶箱]"
---

# pixel-fx：像素特效與打擊感

像素風好不好看，一半在圖，一半在動：特效自己再漂亮，角色沒有蓄力、打中沒有停格，看起來就像一張貼紙。這份 skill 管兩件事：**畫像素圖的規則**，和**特效加動作時序**。

## 用到的東西

| | 位置 | 說明 |
|---|---|---|
| pixelfx 函式庫 | `~/pixelfx`（見下方「安裝狀態」） | patch-gg/pixelfx，MIT。244 種特效，一個檔一種：`src/fx/<分類>/<名稱>.js`。沒有圖片、沒有相依套件，純 Node 工具 |
| 它的作者規範 | `~/pixelfx/docs/AUTHORING.md` | 做新特效前必讀：寫法契約、繪圖 API、品質標準 |
| 練功房的像素工具 | `~/channel-learn/tools/px/` | 角色、圖示、Boss 動圖的產生腳本，規則見下方「畫像素圖」 |
| 練功房接法 | `references/kungfu-room.md` | 哪個時刻用哪種特效、怎麼接進 Astro 頁面 |
| 看圖挑錯 | `references/quality.md` | 「看到什麼問題→怎麼改」對照表與品質標準 |
| 整頁像素風範例 | `references/codedex-study.md` | Codédex 首頁拆解：分層主視覺、低解析放大、逐格動圖的格數與速度（做像素風首頁或背景時讀） |

## 安裝狀態

2026-11-22 Dex 同意後已裝在 `~/pixelfx`（commit `5294518`，v0.3.1，27 MB）。`skills-security-check` 判定通過：工具是純 Node、不連網，唯一的外部指令是呼叫 ffmpeg 轉 GIF／MP4，寫檔都在 repo 內（`records/`）。它 SKILL.md 第 5 節的 `curl | sh` 安裝 Patch CLI 與 `pch publish` 是公開發佈，不照做，除非 Dex 同意。實跑過：`ui/coin-collect`（75 格，`check.mjs` 通過、`--sheet` 匯出成功）、`pickups/chest-open`（139 格）。

更新：`cd ~/pixelfx && git pull`，更新後先看 `git log` 的變更再用。裝到別台電腦或重裝：先問 Dex，再 `git clone --depth 1 https://github.com/patch-gg/pixelfx ~/pixelfx`。

## 流程

1. **先找現成的。** `node tools/list.mjs <關鍵字>`（英文：coin、level、chest、hit、slash…），或看 `docs/CATALOG.md`。挑兩三個候選都算圖看過再選。大部分需求是「現成的＋改參數」：
   - `palette`：一串由暗到亮的色碼，換掉就換顏色（藍色的火）。`src/core/color.js` 的 `PAL` 有現成色階。
   - `seed` 換一個同類但不一樣的版本；`flip` 面向左；`angle` 旋轉；`light` 光暈強度；各特效自己的參數在它的 `meta.options`。
   - 不改程式先試參數：`node tools/render.mjs fire/torch --opts '{"palette":["#102","#215","#43a","#8cf","#fff"]}'`。
2. **接進頁面或遊戲。**
   - 網頁與 JS 遊戲（canvas、Phaser、PixiJS、three.js）：直接用程式。`createFrame` 開一個遊戲解析度的畫格 → `createFx(特效, {x, y})` → 每格 `update(dt)`、`draw(frame, "back"|"front")` → `composite` 疊到 `ImageData` → canvas 放大加 `image-rendering: pixelated`。一次性特效結束時 `fx.done()` 會變真。
   - 其他引擎：`node tools/render.mjs <id> --sheet` 匯出透明 PNG 格子＋Aseprite 格式 JSON（`meta.pixelfx` 有 fps、軸心、迴圈）。匯入時用最近鄰縮放、不壓縮，軸心設成 `meta.pixelfx.pivot`。
   - 只要一張動圖（例如練功房的 `.anim.webp`）：匯出 sprite sheet，再用 `~/channel-learn/tools/px/mob_anim.py` 合成。
3. **有角色就要有動作時序**（見下一節）。
4. **做新的**：讀 `~/pixelfx/docs/AUTHORING.md`，再照「做新特效」。
5. **驗收**：`node tools/check.mjs <id>` 全過（沒畫出界、一次性的結尾是空的、迴圈接得起來、沒用沒種子的亂數、每格低於 2 ms）；動作用 `node tools/act.mjs <id>` 看連續的 12 fps 格子，不能只看接觸印樣的抽樣。

## 動作時序：打擊感從哪裡來

特效只說明魔法做了什麼，動作才說明角色做了什麼。每個有角色的時刻都照這五拍走：

| 拍 | 做什麼 | 數字參考 |
|---|---|---|
| 準備 | 角色先擺好架式 | 特效開始前約 0.5 秒 |
| 蓄力 | 往出手的**反方向**拉，輪廓變化要大 | 前 0.2～0.3 秒 |
| 出手 | 釋放那一格換姿勢，可以 1～2 格全白的閃光格 | t = 0 |
| 停格 | 打中時**全部**停住（特效、角色、目標都停），畫面震幾像素 | 0.03～0.2 秒，越重的招停越久 |
| 收招 | 揮過頭一點再回架式；目標往後晃再彈回 | 0.5～0.8 秒 |

- 姿勢用 12 fps 一格一格跳（像手繪逐格），粒子照全幀率跑。
- 用 pixelfx 內建角色：`createAct(特效, {x, y})` 取代 `createFx`，它自己會停格，畫面震動量從 `act.shake` 拿。
- 用自己的角色：讀特效的 `act`（或 sprite sheet JSON 的 `meta.pixelfx.act`）裡的 `windup`、`recovery`、`hits[].t`、`hits[].freeze`，角色動畫提早 `windup` 秒開始，每次打中就全部停 `freeze` 秒。
- 一整招（蓄力→飛彈→爆炸）先看 `src/fx/moves/`，不要自己拼。

## 做新特效

1. **一句話說清楚**：是什麼、怎麼動、什麼顏色、多長。例：「冰霜爆發：冰晶從腳下往外一圈冒出，中心白光一閃，碎片飛散，地上的霜慢慢退。」
2. **找參考**：`node tools/list.mjs` 找最接近的兩三個，讀它們的原始檔借手法；品質標準是 Hugo Duprez 在 Sprite Fusion 的開源特效（https://www.spritefusion.com/pixel-art-vfx ）。同樣大小並排，他的細節、光、生命感比較多，就是還沒做完。
3. **出草稿**：`node tools/new.mjs <分類>/<名稱>`（迴圈加 `--loop`）。方向還沒定時寫 3～5 個真的不一樣的版本（`-a`～`-e`），全部算圖看過再挑，給人看最好的兩三個。
4. **看、挑最糟的一點、改、再算圖**，至少三輪。看到什麼問題怎麼改，查 `references/quality.md`。
5. **有角色就加動作時序**，用 `act.mjs` 看連續格。
6. **`check.mjs` 全過**，刪掉沒選上的草稿。

## 畫像素圖（角色、怪物、圖示）

練功房已定的規則（`tools/px/icons48.py`、`mascots48v2.py`，Dex 2026-10-15 定）：

- 對齊像素格，放大一律最近鄰（`image-rendering: pixelated`、PIL `Image.NEAREST`）。
- 每個顏色三階：亮、中、暗；暗的在下、亮的在左上；一道主光。
- 深色輪廓，**不用純黑**；少量閃光點綴。
- 吉祥物是大頭正面 Q 版；獎勵圖示的顏色照稀有度（common／uncommon／rare／legend 各有三階色）。
- 新圖照這些腳本的寫法加，不要另起一套。通用的像素畫風說明在 web-style-recipes 的 S04 與 A17。

## 不能做的

- 不重畫任何既有遊戲的角色、sprite、logo；通用的題材（火球、金幣、史萊姆）可以。也不整份照抄 Hugo 的特效，借手法、設計自己做。
- 不用 `Math.random()` 或時間當亂數，一律用特效的種子，第 40 格每次都要一樣。
- 尊重「減少動態效果」設定：開啟時不播特效或只留最後一格（練功房的 Boss 動圖已經這樣做）。
- pixelfx 的 Patch 發佈流程（`pch publish`）是公開發佈，要 Dex 點頭才做。

## 授權

pixelfx 的程式與特效是 MIT，可以商用、可以搬。搬的時候：保留 `LICENSE` 與原檔頭；`src/core/sim.js` 與檔頭有標註的特效改寫自 Hugo Duprez（Sprite Fusion，MIT），`src/core/act.js` 改寫自 Hollow Crown（MIT），這些聲明要跟著走（見 `~/pixelfx/NOTICE.md`）。**`gallery/fonts` 裡的 Patch Pixel 字型不是 MIT，不要用。**

## 分工

| skill | 管什麼 |
|---|---|
| **pixel-fx**（本 skill） | 像素特效、動作時序、像素圖的畫法 |
| **web-style-recipes** | S04 像素、A17 像素風、配方 09 像素房間：整頁的像素風格 |
| **style-pack** | 同一個畫面換多種畫風 |
| **sui-motion-graphic-reel**／**remotion-*** | 把畫面剪成正式影片 |
