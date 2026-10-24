# 我的自我介紹網站

用純 HTML + CSS 做的個人網站，可以直接用 GitHub Pages 免費發布。

## 檔案說明

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 網站內容（文字都在這裡改） |
| `style.css` | 外觀樣式（最上面的 `:root` 可以改配色） |

## 怎麼修改內容

打開 `index.html`，把「你的名字」、自我介紹、技能、經歷、聯絡方式換成你自己的內容。

想放大頭照：把照片（例如 `photo.jpg`）上傳到儲存庫，再把 `index.html` 裡的
`<div class="avatar" aria-hidden="true">你</div>` 換成
`<img class="avatar" src="photo.jpg" alt="我的照片">`。

## 發布到 GitHub Pages

1. 進入儲存庫的 **Settings** → **Pages**
2. **Source** 選 **Deploy from a branch**
3. **Branch** 選放網站的分支（例如 `main`），資料夾選 `/ (root)`，按 **Save**
4. 等 1～2 分鐘，網址會顯示在同一頁：`https://hello-swing.github.io/hello1004/`

## 在自己電腦預覽

直接用瀏覽器打開 `index.html` 就可以看到效果。
