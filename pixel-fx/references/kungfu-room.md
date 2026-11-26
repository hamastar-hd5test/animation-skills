# 練功房接法

repo `~/channel-learn`（前端 `web/`，Astro）。改練功房要照它自己的 HANDOFF 與分支規則，在練功房的 session 做；這份只記「哪個時刻用什麼、怎麼接」。

## 現況（2026-11-22 讀）

- Boss 圖：`web/public/brand/mob-*.webp`，有動作格的是 `*.anim.webp`（`tools/px/mob_anim.py` 合成、名單在 `web/src/lib/mobAnim.ts`）。
- Boss 動作是 CSS：`web/src/styles/app.css` 的 `mobhit`、`mobatk`（各 0.45 秒、`steps(1)` 逐格）、`mobdown`（0.8 秒）、`mobburst`、`mobdmg`、`mobjolt`；時間常數在 `web/src/lib/mobs.ts` 的 `MOB_FX_MS`，兩邊要一致。已尊重減少動態效果。
- 升級卡、寶箱數、XP 通知：`web/src/components/XpToast.astro`（`window.__clLevelUp`、`window.__clChests`）。寶箱頁 `web/src/pages/chest.astro`。
- 像素圖產生腳本：`tools/px/`（`icons48.py`、`mascots48v2.py`、`roles48.py`、`map_assets.py`）。

## 時刻與特效（候選，接之前用 `tools/list.mjs` 找、算圖給 Dex 看）

| 時刻 | 候選分類 | 打擊感要點 |
|---|---|---|
| 答對、Boss 受擊 | `impacts/`、`melee/` | 停格 0.05～0.1 秒，Boss 往後晃；和 `mobhit` 的 0.45 秒對齊 |
| 大題全對、打倒 Boss | `explosions/`、`spawn/`（`disintegrate`、`poof`） | 接在 `mobdown` 後面，停留 1～2 秒 |
| Boss 反擊 | `projectiles/`、`moves/` | 蓄力要看得到，讓學員有「要來了」的預期 |
| 拿到 XP、金幣 | `ui/`（`coin-collect`、`crit-number`、`combo-counter`）、`pickups/` | 短（0.3～0.6 秒），不擋住題目 |
| 開寶箱 | `pickups/`（`chest-open`、`gem-spin`） | 稀有度用 `palette` 換成 `icons48.py` 的稀有度三階色 |
| 升級 | `ui/level-up`（3.2 秒，金光從腳下升起、LEVEL UP! 逐字落下）、`ui/achievement`、`holy/halo` | 配合升級卡出現的那一拍；它的字是英文，要中文就只取光柱部分或自己改字 |
| 換頁、進出關卡 | `transitions/`（`iris`、`diamond-wipe`、`crt-off`） | 320×180，放大要整數倍 |

## 怎麼接

- **要即時播、要換色**：做一個小的 canvas 元件（Astro 的 client 端 script），遊戲解析度開小 canvas、CSS 整數倍放大、`image-rendering: pixelated`；`createFx` 或 `createAct` 每格更新。只複製用到的 `src/core` 與特效檔，保留檔頭與 MIT 授權聲明。
- **固定的一段動畫**：`render.mjs --sheet` 匯出，再用 `mob_anim.py` 合成 `.anim.webp`，和現有 Boss 動圖同一條路，最省事。
- **停格**：打中時連 CSS 動畫一起停（`animation-play-state: paused` 或延後加 class），不然特效停了、Boss 還在晃。
- 減少動態效果開啟時不播，直接顯示結果。
- 手機要量：一次只播一個大特效，粒子多的特效先看每格時間（`check.mjs` 的 2 ms 是單一特效）。
