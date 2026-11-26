# Higgsfield MCP 的指令與畫風名單

來源：Higgsfield 的 Notion 教學〈10 Animation Styles in Claude — Genjutsu and 3D Jutsu〉（頁面最後編輯 2026-11-21；2026-11-22 首讀，2026-11-23 補齊表格）。這裡只記指令、名單與規格；畫風長什麼樣看 `web-style-recipes/references/scene-styles.md` 的別名對照。

**還沒在我們這邊實跑過。** 連接器要 Dex 自己接（SKILL.md「出圖路線」有網址）；任何會收點數的動作先報價、等 Dex 同意。本人的臉與聲音以外的真人素材不送。

## 三條路線

| 手上有 | 指令 | 花費 |
|---|---|---|
| 一支影片（4–30 秒） | `/genjutsu <畫風名>`；只打 `/genjutsu` 會開畫廊用看的挑 | 每支收點數，開始前報價 |
| 只有想法 | `/3d-jutsu <一句想法>. <畫風> style.`；換畫風說 `Same scene. Now <畫風> style.` | 建世界與拍攝不收；把畫面再轉成 AI 圖或 AI 影片才收 |
| 一張圖 | 不用指令，直接說「把這個角色做成 10 種動畫畫風並各自做成動畫」 | 生成影片收點數 |

- 一次要多種：`/genjutsu Restyle this video in 10 styles: A, B, C…`；`/3d-jutsu <想法>. Render the same scene in 10 styles: A, B, C…`
- Genjutsu 可以另外附最多 5 張自己的角色、產品或服裝圖，會被放進新影片。
- 一張圖路線的範例規格：每種畫風一張起始定格，各做成 4 秒片段，4K、16:9、有聲音、無配樂（教學裡用的影片模型是 Seedance 2.5）。每段的動作各自寫一句（例如「眨眼，蝴蝶停在鼻子上，牠定住、鬥雞眼看著」），不是十段同一個動作。

## Genjutsu 的 20 種畫風名

Hand-Painted Cel Animation、Knitted Yarn World、Expressive 2D Animation、Rounded Toy CGI、Felt Puppet Stop Motion、Grotesque Street CGI、Warm Painterly 3D Animation、Graphic Cel、Expressive Gouache Fashion、Sculptural 3D Fashion、Chunky Textured Low-Poly、Cel-Shaded CG Anime、Painterly Cinematic 3D、Outline-free Cel、Painterly Sculpted Animation、Neon Graphic Cinematic 3D、Textured Gouache Character Illustration、Comic 3D、Retro Game 3D、Nighttime Anime Pixel Art

## 3D Jutsu 示範用的 10 種

Hologram、Cyberpunk Neon、Paper Cutout、Isometric、Blueprint、Thermal Cam、Anime Cel、ASCII Terminal、Watercolor、Claymation

## 整支有旁白的解說片

`Create an explainer video about <主題> in the <畫風> style.`，不用附檔。可用的畫風名：

Claymotion、Isometric Flat Vector、Watercolor Chronicle、Paper collage、Paper Diorama、3D Papercraft、Pixel Art、Low Poly、Stickman Cartoon、Whiteboard Doodle、Hand Drawn、2D Illustrator、Pastel Flat 2D、Poster Vector、Editorial Motion Graphics、Mixed Media、Colorful 3D、Studio 3D、3D Mix、Fluffy Toy、Mannequin、Fairy Tale & Myth

我們自己用程式出整支片的做法在 `film.md`；這條是付費的替代路線。

## 其他指令

| 指令 | 要附 | 得到 |
|---|---|---|
| `/neon-hf` | 影片 | 同一支片打上霓虹光 |
| `/golden-hour-hf` | 影片 | 暖色夕陽光 |
| `/kodachrome-grade-hf` | 影片 | 老底片色 |
| `/thermal-grade-hf` | 影片 | 熱像儀配色 |
| `/neon-noir-grade-hf` | 影片 | 暗底加亮藍與粉紅 |
| `/captions` | 自己講話的影片 | 逐字跟著的字幕 |
| `/text-behind` | 自己講話的影片 | 關鍵字出現在頭後面 |
| `/grade-wipe` | 自己講話的影片 | 一道光掃過，平淡素材變電影色調 |
| `/stickman-explainer <主題>` | 不用 | 火柴人角色的旁白解說片 |
| `/faceless-paper-diorama <主題>` | 不用 | 紙場景的旁白解說片 |
| `/shorts <主題>` | 不用 | 直式短片，含 AI 主持人 |
| `/manga <想法>` | 照片（可選） | 每頁角色一致的漫畫章節 |
| `/hero-shot` | 產品照 | 產品當主角的圖 |
| `/product-spin` | 產品照 | 產品轉一圈的影片 |

口播片的字幕與剪輯，我們自己的管線是 `chengfeng-*` 與 `avatar-shorts`；`/shorts` 的 AI 主持人不是 Dex 本人，對外片不用它代替本人出鏡。
