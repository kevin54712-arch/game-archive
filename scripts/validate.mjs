#!/usr/bin/env node
// Game Archive: project structure and data integrity validation, no dependencies.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warn = message => errors.push(message);
const file = name => resolve(base, name);
const read = name => readFileSync(file(name), 'utf8');
const required = ['id','title','slug','genres','summary','developer','releaseDate','releaseNote','platforms','playerModes','cover','page','intro','gameplay','highlights','personalReview','sources'];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const exists = name => existsSync(file(name));
for (const path of ['AGENTS.md','README.md','index.html','templates/game-detail.html','assets/css/style.css','assets/js/main.js','data/games.json']) {
  if (!exists(path)) warn(`缺少必要檔案：${path}`);
}
let games = [];
try { games = JSON.parse(read('data/games.json')); }
catch (e) { warn(`JSON 語法錯誤：${e.message}`); }
if (!Array.isArray(games) || games.length < 1) warn('games.json 必須是非空陣列');
const ids = new Set(), slugs = new Set();
for (const [index,g] of (Array.isArray(games) ? games : []).entries()) {
  const id = g?.id || `第 ${index+1} 筆`;
  if (!g || typeof g !== 'object' || Array.isArray(g)) { warn(`${id}：必須是物件`); continue; }
  for (const key of required) if (!(key in g)) warn(`${id}：缺少 ${key}`);
  for (const key of ['id','title','slug','summary','developer','releaseDate','releaseNote','cover','page','intro']) {
    if (typeof g[key] !== 'string' || !g[key].trim()) warn(`${id}：${key} 應為非空字串`);
  }
  for (const key of ['genres','platforms','playerModes','gameplay','highlights','sources']) {
    if (!Array.isArray(g[key]) || !g[key].length) warn(`${id}：${key} 必須是非空陣列`);
  }
  if (!slugPattern.test(g.id || '') || !slugPattern.test(g.slug || '')) warn(`${id}：id / slug 命名不符合規範`);
  if (ids.has(g.id)) warn(`${id}：重複 id`);
  if (slugs.has(g.slug)) warn(`${id}：重複 slug`);
  ids.add(g.id); slugs.add(g.slug);
  if (g.page !== `pages/${g.slug}.html`) warn(`${id}：page 與 slug 不一致`);
  if (typeof g.page === 'string' && !exists(g.page)) warn(`${id}：找不到介紹頁 ${g.page}`);
  if (typeof g.cover === 'string') {
    if (/^https:\/\//i.test(g.cover)) {
      if (!g.coverAttribution?.sourceUrl || !g.coverAttribution?.author) warn(`${id}：外部圖片須提供 coverAttribution 作者與來源`);
      if (typeof g.fallbackCover !== 'string' || !exists(g.fallbackCover)) warn(`${id}：外部圖片須提供有效本地 fallbackCover`);
    } else if (!exists(g.cover)) warn(`${id}：找不到圖片 ${g.cover}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(g.releaseDate || '') || Number.isNaN(Date.parse(g.releaseDate))) warn(`${id}：releaseDate 日期格式無效`);
  if (typeof g.intro === 'string' && g.intro.length < 60) warn(`${id}：intro 過短`);
  if ((g.highlights || []).length < 3 || (g.highlights || []).length > 5) warn(`${id}：highlights 必須有 3～5 項`);
  for (const [i,h] of (g.highlights || []).entries()) {
    if (!h?.title || !h?.description) warn(`${id}：highlights[${i}] 需要 title 與 description`);
  }
  if (!(g.personalReview === null || (typeof g.personalReview === 'string' && g.personalReview.trim()))) warn(`${id}：personalReview 必須是 null 或非空字串`);
  for (const [i,s] of (g.sources || []).entries()) {
    if (!s?.label || !/^https:\/\//.test(s.url || '')) warn(`${id}：sources[${i}] 必須有標籤與 HTTPS 網址`);
  }
  if (typeof g.page === 'string' && exists(g.page)) {
    const html = read(g.page);
    if (!html.includes(`data-game-id="${g.slug}"`)) warn(`${id}：HTML data-game-id 不符合 slug`);
    if (!html.includes('data-root="../"')) warn(`${id}：詳細頁缺少正確的 data-root`);
    if (!html.includes('assets/js/main.js')) warn(`${id}：詳細頁缺少共用程式`);
    if (!html.includes('assets/css/style.css')) warn(`${id}：詳細頁缺少共用樣式`);
  }
}
if (errors.length) {
  console.error(`❌ Game Archive 驗收失敗，共 ${errors.length} 項問題：`);
  errors.forEach((e,i) => console.error(`  ${i+1}. ${e}`));
  process.exit(1);
}
console.log(`✅ Game Archive 基本驗收通過：${games.length} 款遊戲，${slugs.size} 個唯一 slug，圖片與介紹頁路徑皆存在。`);
console.log('ℹ️ 尚須在 HTTP 伺服器與瀏覽器中驗證搜尋、分類、相關推薦、RWD，以及 GitHub Pages 實際部署。');
