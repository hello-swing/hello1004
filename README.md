# 滴墨

一滴顏料落入水中，像樹枝一樣向外渲染、延伸——
就像說出口的一句話，影響會一路往外擴散。

純 HTML + CSS + JavaScript（Canvas），不需要任何套件，可以直接用 GitHub Pages 發布。

## 怎麼玩

- 點擊或觸控畫面任一處：在那裡滴下一滴顏料
- 一段時間沒人操作，畫面會自己滴下一滴
- 鍵盤：按空白鍵或 Enter 隨機滴一滴
- 舊的痕跡會慢慢淡去，留下淡淡的漬

## 檔案說明

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 頁面骨架 |
| `style.css` | 紙張底色與紙紋 |
| `main.js` | 顏料擴散的動畫 |

## 想調整的話

都在 `main.js`：

- `PIGMENTS`：顏料顏色（RGB）
- `drop()` 裡的 `rand(5, 9)`：每滴有幾條主枝
- `stepBranch()` 裡的 `0.045`：分岔的機率，越大越茂密
- `step()` 裡的 `rgba(PAPER, 0.022)`：痕跡淡去的速度

## 發布到 GitHub Pages

1. 進入儲存庫的 **Settings** → **Pages**
2. **Source** 選 **Deploy from a branch**
3. **Branch** 選放網站的分支（例如 `main`），資料夾選 `/ (root)`，按 **Save**
4. 等 1～2 分鐘，網址會顯示在同一頁：`https://hello-swing.github.io/hello1004/`

## 在自己電腦預覽

直接用瀏覽器打開 `index.html` 就可以看到效果。
