# 實測紀錄

## 2026-11-23 散場誌試做（mografy 0.1.2）

專案：`~/mografy-lab/mografy/projects/sanchang/`（直式 1080×1920、17 秒、五鏡；成品 `renders/sanchang-portrait.mp4`，1.4 MB）。點子：一條聲波貫穿全片（投影光 → 說話 → 貼文底線 → 和別人對上頻率 → 片名），寫在專案的 `style.md`。

| 撞到的 | 原因 | 做法 |
|---|---|---|
| `check --motion` 只印 `ZodError`，沒有任何說明 | 場景沒有 `export const params`。空白範本有，自己重寫 main.ts 時漏掉 | 場景一定要匯出 `params`（沒有參數就寫 `export const params = {};`）。二分法時先拿空白專案比對，再逐段拿掉畫面元素 |
| 不加 `--motion` 的 `check` 也不報錯、也不印每格耗時 | 同上；沒有 `--motion` 時那一步被略過 | 一律跑 `check --motion` |
| `subset-film-fonts.py`（裁字型）不在 npm 套件裡；從 GitHub 抓下來執行被自動審查擋下 | 那支腳本只在 repo 的 `extras/cjk/` | 自己把場景字串裡的字挑出來，用 `uv run --with fonttools pyftsubset 原檔 --text-file=字.txt --output-file=...-film.otf --layout-features='*'`，再改 `mografy.json` 的 fonts 路徑。9.5 MB → 69 KB |
| 三格算超過 100 ms（0.4、1.8、15.2 秒），裁完字型也沒變 | 剛好是各字型與圖層第一次出現的格；中位數每格 3.9 ms | 視為第一次載入成本，不影響匯出；播放器若卡再看 performance 參考 |
| `--motion` 報 15.33 秒有一處跳動 | 兩側聲波淡出的最後一格；逐格審片圖看不出來 | 用 `review.transitions` 加一段 0.033 秒間隔的審片條確認，肉眼看不出就保留 |
| 匯出預設是 HEVC（libx265） | 預設編碼 | 要給不支援 HEVC 的平台或瀏覽器時，照它的 how-to 文件用 `--preset share` 另出 H.264，出之前先看 `npx mografy export --help` 確認參數 |

其他：`npx mografy init` 一次就好，約 7 個套件、幾秒；`npx mografy add cjk` 會把兩份字型與授權檔放進專案並登記在 `mografy.json`；第一次匯出會下載 FFmpeg 到工作區。

## 2026-11-23 散場誌 v2（105 秒、16:9）

- **先裁字型再看效能**：用 4～5 MB 的完整 CJK 字型時，`check --motion` 報最慢一格 707 ms（字型第一次用到）；裁成片中用到的字（約 90～120 KB）後降到 37 ms。字裁好前看到的效能警告不準。
- **裁字要連英數一起裁**：網址、`AI`、`Threads` 這類字也要進字表，不然匯出會缺字。做法：從場景檔抓出所有字串的字元，加上數字與英文字母，交給 pyftsubset `--text-file`。
- **翻面不要再鏡像**：用 `scale(|cos θ|, 1)` 做翻牌時，背面已經不是鏡像，背面內容不要再 `scale(-1, 1)`，不然字會左右顛倒。審片圖只取定格，要另外抽翻面後的格子看。
- **匯出的 glow 會把淺色洗白**：匯出後處理（glow 0.12）讓接近紙色的淺色物件幾乎消失，跟紙底同色系的物件要加深一階或加一圈細邊。審片圖是 raw，看不出來，要用 ffmpeg 從成片抽格確認。
- **同一個矩形變形最省事**：推播卡 → 面板 → 校樣 → 貼文卡 → 作品頁用一組 `keys` 管 x、y、w、h、圓角，內容各自淡入淡出，交棒自然成立。
