# animation-skills

五個做動畫與短影音的 [Claude Code](https://claude.com/claude-code) Agent Skill。畫風庫另放在 [web-style-recipes](https://github.com/hamastar-hd5test/web-style-recipes)。

| Skill | 做什麼 | 需要 |
|---|---|---|
| `style-pack` | 同一個場景做成多種畫風：鎖住構圖只換畫風，先出靜態定格再做動畫，同比例匯出一套可並排比較的圖或短片 | 要先裝 `web-style-recipes`（畫風都從那裡挑） |
| `pixel-fx` | 像素風的遊戲特效與動作：受擊、技能、爆炸、開寶箱、升級、轉場，以及蓄力、停格、擊退、收招的動作時序 | [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx)（MIT），照 `SKILL.md` 另外 clone |
| `sprite-stack` | 切片堆疊：用平面像素圖疊出看起來是 3D 的物件與場景，可旋轉、可一片一片蓋起來，只用 Canvas 2D | Python 3、Pillow、NumPy（用到 `vendor/` 的工具時） |
| `mografy-film` | 用 Mografy 寫程式做動態圖像：操作教學短片、介面小動畫、紙劇場風格的概念解說 | npm 套件 [mografy](https://github.com/mografy/mografy)（MIT） |
| `avatar-shorts` | 本人當主角的直式短影音：只有錄音或文案時，用素材庫畫面、AI 分身或克隆聲音成片 | 依選的做法而定，見 `references/routes.md` |

## 安裝

```bash
git clone https://github.com/hamastar-hd5test/animation-skills.git ~/animation-skills
ln -s ~/animation-skills/style-pack ~/.claude/skills/style-pack
```

其他四個照同樣寫法各連一次。開新的 Claude Code session 後生效。

## 使用前要知道

這些 skill 是作者自己在用的版本，原樣放上來：

- 內文會提到作者自己的專案與本機路徑（例如 `~/channel-learn`、`~/daydreamdex`），那些步驟要換成你自己的專案才跑得動。
- `avatar-shorts` 規定臉與聲音只用操作者本人的，不做其他人的分身或聲音。

## 授權與出處

- 本 repo 的 skill 內容：MIT，見 `LICENSE`。
- `sprite-stack/vendor/sprite-stacking/`：原封取自 [danielwh2/sprite-stacking](https://github.com/danielwh2/sprite-stacking)（Daniel White，MIT），授權檔與來源說明在該資料夾的 `LICENSE`、`SOURCE.md`。
- `pixel-fx`、`mografy-film` 只有使用說明，不含上游程式碼；上游各自是 MIT。
