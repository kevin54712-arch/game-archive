# Game Archive｜綜合遊戲圖鑑

一個以 Steam 式深色介面為靈感的獨立遊戲介紹網站，採 **HTML / CSS / JavaScript + JSON** 資料驅動架構。

第一版收錄 **Hollow Knight、Stardew Valley、Minecraft**；支援卡片瀏覽、即時搜尋、類型篩選、個別介紹頁、依共同類型自動推薦，以及響應式排版。

## 專案特色

- **AGENTS.md 是開發手冊**：規定目的、視覺設計、資料結構、命名、擴充 SOP、修改限制與驗收條件。
- **`data/games.json` 是單一內容來源**：新增一筆資料與一個依模板製作的詳細頁，首頁自動出現新卡片與搜尋、篩選結果。
- **圖片優先使用有來源與使用依據的真實宣傳圖／遊戲畫面**；無法確認時保留自製 SVG 插畫。Hollow Knight 使用官方網站宣傳圖，Minecraft 使用 Wikimedia Commons 標示 CC BY 3.0 的實際遊戲畫面，Stardew Valley 暫用自製插畫；詳細情況見 `IMAGE_CREDITS.md`。
- **不需要安裝套件、後端或資料庫**，可使用 GitHub Pages 託管。

## 本地預覽

請先確認有 Python 3，於本專案根目錄執行：

```bash
python -m http.server 8000
```

在瀏覽器開啟 `http://localhost:8000/`。若 8000 被占用，可換其他埠號。

> 由於 `fetch()` 需要透過 HTTP 載入 `data/games.json`，請不要直接雙擊 `index.html` 使用 `file://` 預覽。

## 快速驗收

若電腦已安裝 Node.js，執行：

```bash
node scripts/validate.mjs
```

這個指令會檢查 JSON 結構、必要欄位、slug 唯一性、圖片與頁面路徑、介紹頁識別碼與模板一致性。**它不能代替瀏覽器測試**；搜尋、篩選與手機版仍須在瀏覽器確認。

## 新增一款遊戲（依照 AI 員工手冊）

1. 讓 AI 先閱讀 `AGENTS.md`、`data/games.json` 和 `templates/game-detail.html`。
2. 要求 AI **先提出計畫供確認**，包含資料查證、圖片來源、檔案路徑與驗收方式。
3. 複製模板為 `pages/<slug>.html`，將 `__GAME_SLUG__` 替換成 slug，修改 HTML `<title>`。
4. 準備授權或可使用的真實遊戲圖片（若使用外部圖片 URL，必須提供備援圖）或自製 SVG，並記錄來源於 `coverAttribution`。
5. 在 `data/games.json` 新增對應遊戲的完整資訊；個人心得未提供時設 `null`。
6. 執行 `node scripts/validate.mjs`，用本地 HTTP 伺服器測試首頁、搜尋、分類、詳細頁和相關推薦。
7. 通過後上傳 GitHub。**正常新增遊戲不需編輯 `index.html` 或 `main.js`。**

## 發布 GitHub Pages

1. 登入 GitHub，建立**公開 Repository**，例如 `game-archive`。
2. 將**整份專案資料夾內的所有檔案**上傳至 Repository 根目錄，包含 `AGENTS.md`、`index.html`、`pages/`、`templates/`、`data/`、`assets/`、`scripts/`。
3. 進入 Repository → **Settings → Pages**。
4. 在 **Build and deployment** 選擇 **Deploy from a branch**，選 `main` 與 `/(root)`，按 **Save**。
5. 部署成功後，網址通常為 `https://<你的帳號>.github.io/<Repository名稱>/`。
6. 用無痕視窗檢查公開頁面能載入 JSON、卡片、三個子頁與分類搜尋。

> 本專案使用相對路徑，設計上支援 GitHub Pages 的專案子路徑。GitHub Pages 必須實際部署後才能宣稱公開網址可用。

## 已確認的初始資料來源

- [Hollow Knight — Steam 官方商店頁](https://store.steampowered.com/app/367520/Hollow_Knight/)
- [Stardew Valley — 官方 FAQ](https://www.stardewvalley.net/faq/)
- [Minecraft — 官方遊戲介紹](https://www.minecraft.net/zh-hant/about-minecraft)

遊戲名稱屬於各自權利人的商標；本網站僅為非官方課堂學習專案。

## 真實圖片載入

目前 2 張真實圖片為外部 HTTPS 來源，**不包含在 ZIP 內**；網站需有網路才會顯示真實圖片。若原站封鎖外部引用或圖片失效，瀏覽器會自動顯示原本的 SVG 插畫。圖片使用依據、標示與注意事項見 `IMAGE_CREDITS.md`。
