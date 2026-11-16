/* Game Archive — Single source of truth: data/games.json.
 * Keep this script generic: adding a new game should not require changes here.
 */
(() => {
  'use strict';
  const root = document.body.dataset.root || '';
  const page = document.body.dataset.page || 'home';
  const imageFallback = root + 'assets/images/placeholder.svg';
  const el = (tag, cls, content) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (content !== undefined && content !== null) node.textContent = String(content);
    return node;
  };
  const setText = (id, content) => {
    const node = document.getElementById(id);
    if (node) node.textContent = String(content ?? '');
  };
  const clear = node => node.replaceChildren();
  const textDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? date.replace(/-/g, '.') : '待確認';
  const webPath = path => /^https:\/\//i.test(path || '') ? path : root + path;
  const tags = (genres, target) => {
    genres.forEach(genre => target.append(el('span', 'genre-tag', genre)));
  };
  const safeExternal = (anchor, url) => {
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
  };

  function gameCard(game, number) {
    const card = el('a', 'game-card');
    card.href = webPath(game.page);
    card.setAttribute('aria-label', `閱讀 ${game.title} 遊戲介紹`);
    const figure = el('div', 'game-card-img');
    const img = el('img');
    img.src = webPath(game.cover || 'assets/images/placeholder.svg');
    img.alt = game.coverAttribution ? `${game.title} 實際遊戲宣傳或畫面，來源請見介紹頁` : `${game.title} 的本站自製概念插畫`;
    img.loading = 'lazy';
    img.width = 720;
    img.height = 960;
    img.addEventListener('error', () => { img.src = webPath(game.fallbackCover || 'assets/images/placeholder.svg'); }, {once:true});
    figure.append(img, el('span', 'card-number', `GA / ${String(number).padStart(3, '0')}`));
    const body = el('div', 'card-body');
    const titleRow = el('div', 'card-title-row');
    titleRow.append(el('h3', 'card-title', game.title), el('span', 'card-arrow', '↗'));
    const category = el('div', 'tag-row');
    tags(game.genres, category);
    const summary = el('p', 'card-summary', game.summary);
    const bottom = el('div', 'card-bottom');
    bottom.append(el('span', '', `${textDate(game.releaseDate).slice(0,4)} / GAME PROFILE`), el('span', '', '查看介紹 →'));
    body.append(titleRow, category, summary, bottom);
    card.append(figure, body);
    return card;
  }

  function showError(target, message) {
    if (!target) return;
    clear(target);
    target.append(el('div', 'loading-panel', `${message}。請使用本地 HTTP 伺服器，或透過 GitHub Pages 開啟網站。`));
  }

  function initHome(games) {
    const grid = document.getElementById('game-grid');
    const search = document.getElementById('game-search');
    const chips = document.getElementById('genre-filters');
    const empty = document.getElementById('empty-state');
    const count = document.getElementById('result-count');
    const allGenres = [...new Set(games.flatMap(g => g.genres))];
    let activeGenre = '全部';

    setText('stat-games', String(games.length).padStart(2,'0'));
    setText('stat-genres', String(allGenres.length).padStart(2,'0'));
    setText('archive-count', `001—${String(games.length).padStart(3,'0')}`);

    const render = () => {
      const q = search.value.trim().toLocaleLowerCase();
      const matching = games.filter(game =>
        (activeGenre === '全部' || game.genres.includes(activeGenre)) &&
        game.title.toLocaleLowerCase().includes(q)
      );
      clear(grid);
      matching.forEach(game => grid.append(gameCard(game, games.indexOf(game) + 1)));
      count.textContent = `顯示 ${matching.length} / ${games.length} 款遊戲`;
      empty.hidden = matching.length !== 0;
    };

    const selectGenre = genre => {
      activeGenre = genre;
      [...chips.querySelectorAll('button')].forEach(chip => {
        const selected = chip.dataset.genre === genre;
        chip.classList.toggle('is-active', selected);
        chip.setAttribute('aria-pressed', String(selected));
      });
      render();
    };

    clear(chips);
    ['全部', ...allGenres].forEach(genre => {
      const btn = el('button', 'filter-chip', genre);
      btn.type = 'button';
      btn.dataset.genre = genre;
      btn.addEventListener('click', () => selectGenre(genre));
      chips.append(btn);
    });
    search.addEventListener('input', render);
    const reset = document.getElementById('reset-filters');
    reset.addEventListener('click', () => {
      search.value = '';
      selectGenre('全部');
      search.focus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        search.focus();
      }
    });
    selectGenre('全部');
  }

  function fact(dl, name, value) {
    const row = el('div', 'fact-row');
    row.append(el('dt','',name),el('dd','',value));
    dl.append(row);
  }

  function initDetail(games) {
    const slug = document.body.dataset.gameId;
    const game = games.find(g => g.slug === slug);
    if (!game) {
      setText('detail-title', '找不到這款遊戲');
      setText('detail-summary', '遊戲清單中沒有這個識別碼，請返回首頁查看已收錄作品。');
      return;
    }
    document.title = `${game.title}｜Game Archive 遊戲圖鑑`;
    setText('breadcrumb-title', game.title);
    setText('detail-title', game.title);
    setText('detail-summary', game.summary);
    setText('detail-index', `/ ${String(games.indexOf(game) + 1).padStart(3,'0')}`);
    const cover = document.getElementById('detail-cover');
    cover.src = webPath(game.cover);
    cover.alt = game.coverAttribution ? `${game.title} 遊戲官方宣傳或實際遊戲畫面` : `${game.title} 的本站自製概念插畫`;
    cover.addEventListener('error', () => { cover.src = webPath(game.fallbackCover || 'assets/images/placeholder.svg'); }, {once:true});
    const genreRow = document.getElementById('detail-tags');
    clear(genreRow);
    tags(game.genres, genreRow);
    setText('detail-intro', game.intro);

    const gameplay = document.getElementById('detail-gameplay');
    clear(gameplay);
    game.gameplay.forEach((step,index) => {
      const item = el('div','gameplay-item');
      item.append(el('span','item-n',String(index+1).padStart(2,'0')),el('p','',step));
      gameplay.append(item);
    });

    const highlights = document.getElementById('detail-highlights');
    clear(highlights);
    game.highlights.forEach(feature => {
      const item = el('div','highlight-card');
      item.append(el('div','highlight-star','✧'),el('h3','',feature.title),el('p','',feature.description));
      highlights.append(item);
    });

    const review = document.getElementById('review-section');
    if (typeof game.personalReview === 'string' && game.personalReview.trim()) {
      setText('detail-review', game.personalReview.trim());
      review.hidden = false;
    } else {
      review.hidden = true;
    }

    const facts = document.getElementById('detail-facts');
    clear(facts);
    fact(facts,'開發商',game.developer);
    fact(facts,'首次發行',textDate(game.releaseDate));
    if (game.releaseNote) fact(facts,'日期說明',game.releaseNote);
    fact(facts,'遊戲類型',game.genres.join('、'));
    fact(facts,'支援平台',game.platforms.join('、'));
    fact(facts,'遊玩模式',game.playerModes.join('、'));

    const sources = document.getElementById('detail-sources');
    clear(sources);
    game.sources.forEach(source => {
      const li = el('li');
      const link = el('a','',`${source.label} ↗`);
      safeExternal(link, source.url);
      li.append(link);
      sources.append(li);
    });
    if (game.coverAttribution) {
      const c = game.coverAttribution;
      const credit = el('li');
      const imgLink = el('a', '', `圖片來源：${c.label}（${c.author}） ↗`);
      safeExternal(imgLink, c.sourceUrl);
      credit.append(imgLink);
      if (c.license && c.licenseUrl) {
        credit.append(document.createTextNode(' · '));
        const licenseLink = el('a', '', c.license);
        safeExternal(licenseLink, c.licenseUrl);
        credit.append(licenseLink);
      }
      if (c.usage) credit.append(el('span', 'source-notice', `｜${c.usage}`));
      sources.append(credit);
    }
    const mainSource = document.getElementById('detail-source-link');
    mainSource.textContent = '參考來源 ↗';
    if (game.sources.length) safeExternal(mainSource, game.sources[0].url);
    else mainSource.hidden = true;

    const others = games.filter(item => item.id !== game.id);
    const scored = others.map(item => ({ game:item, match:item.genres.filter(g => game.genres.includes(g)).length }));
    scored.sort((a,b) => b.match-a.match || games.indexOf(a.game)-games.indexOf(b.game));
    const related = scored.filter(item => item.match > 0);
    const selected = related.length ? related.slice(0,2).map(item => item.game) : scored.slice(0,2).map(item => item.game);
    const relatedGrid = document.getElementById('related-grid');
    clear(relatedGrid);
    selected.forEach(item => relatedGrid.append(gameCard(item,games.indexOf(item)+1)));
    setText('related-description', related.length ? '依照共同遊戲類型，推薦你繼續探索。' : '目前尚無相同類型作品，先看看站內的其他遊戲。');
  }

  const dataUrl = new URL(root + 'data/games.json', document.baseURI).href;
  fetch(dataUrl, {cache:'no-cache'})
    .then(response => {
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(games => {
      if (!Array.isArray(games)) throw Error('遊戲資料格式錯誤');
      if (page === 'home') initHome(games);
      if (page === 'detail') initDetail(games);
    })
    .catch(error => {
      console.error('Game Archive: 無法讀取遊戲資料',error);
      if (page === 'home') {
        showError(document.getElementById('game-grid'),'無法讀取遊戲清單');
        setText('result-count','資料讀取失敗');
      } else {
        setText('detail-title','無法載入遊戲介紹');
        setText('detail-summary','資料讀取失敗。請確認資料檔案存在並透過網站伺服器瀏覽。');
      }
    });
})();
