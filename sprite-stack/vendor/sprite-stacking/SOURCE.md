# 來源

- danielwh2/sprite-stacking（Daniel White，MIT，`LICENSE`）：https://github.com/danielwh2/sprite-stacking
- 版本：commit 0cce02e（2026-11-24），2026-11-25 由 Dex 指定整合進 sprite-stack。
- 原封複製、未改：`views_to_slices.py`、`viewer.html`、`engines.md`（原 references/engines.md）、`UPSTREAM.md`（原 SKILL.md，改名避免被當成另一個 skill 載入）。
- `tests/check.py` 只改了一行 `sys.path`，對到這個資料夾的位置。
- 安全檢查（2026-11-25 主線讀過）：Python 只 import argparse、base64、io、json、math、collections、pathlib、numpy、PIL，只讀輸入圖、寫指定的輸出檔，沒有網路、沒有執行外部指令；viewer.html 沒有任何外部網址、fetch、cookie 或 localStorage。
- 需要 Python 3＋Pillow＋NumPy（本機已有：numpy 2.5、Pillow 12.2）。
- 更新上游時：重新 clone 到 scratchpad、重跑上面的安全檢查與 `python3 -I tests/check.py`（印 `ok`），再覆蓋這裡的檔案並改這份的 commit 與日期。
