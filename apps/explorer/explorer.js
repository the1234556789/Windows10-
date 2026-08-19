/* ============================================================
 * explorer.js  ──  Win10online 文件资源管理器（虚拟模拟）
 *
 * 规则：只用正版图片，不生成任何 SVG 图标。
 * 图片缺失时显示 alt 文字，不破图、不泄漏代码。
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- 虚拟文件系统 FS ---------- */
  var FS = {
    '此电脑': ['C:', 'D:'],
    'C:': [
      { name: 'Windows', type: 'folder' },
      { name: 'Program Files', type: 'folder' },
      { name: 'Program Files (x86)', type: 'folder' },
      { name: 'Users', type: 'folder' },
      { name: 'bootmgr', type: 'file', ext: 'sys' }
    ],
    'C:/Windows': [
      { name: 'System32', type: 'folder' },
      { name: 'Fonts', type: 'folder' },
      { name: 'notepad.exe', type: 'file', ext: 'exe' },
      { name: 'explorer.exe', type: 'file', ext: 'exe' },
      { name: 'win.ini', type: 'file', ext: 'ini' }
    ],
    'C:/Windows/System32': [
      { name: 'cmd.exe', type: 'file', ext: 'exe' },
      { name: 'taskmgr.exe', type: 'file', ext: 'exe' },
      { name: 'calc.exe', type: 'file', ext: 'exe' }
    ],
    'C:/Windows/Fonts': [
      { name: 'msyh.ttf', type: 'file', ext: 'ttf' },
      { name: 'simsun.ttc', type: 'file', ext: 'ttc' },
      { name: 'arial.ttf', type: 'file', ext: 'ttf' }
    ],
    'C:/Users': [
      { name: 'Administrator', type: 'folder' },
      { name: 'Public', type: 'folder' }
    ],
    'C:/Users/Administrator': [
      { name: '桌面', type: 'folder' },
      { name: '文档', type: 'folder' },
      { name: '下载', type: 'folder' },
      { name: 'NTUSER.DAT', type: 'file', ext: 'dat' }
    ],
    'D:': [
      { name: '游戏', type: 'folder' },
      { name: '下载', type: 'folder' },
      { name: '工作', type: 'folder' },
      { name: '素材包.zip', type: 'file', ext: 'zip' },
      { name: '旧照片.rar', type: 'file', ext: 'rar' },
      { name: '工具箱.7z', type: 'file', ext: '7z' },
      { name: 'readme.txt', type: 'file', ext: 'txt' }
    ],
    'D:/游戏': [
      { name: 'Minecraft', type: 'folder' },
      { name: 'Steam', type: 'folder' },
      { name: '启动说明.txt', type: 'file', ext: 'txt' }
    ],
    'D:/下载': [
      { name: 'chrome_installer.exe', type: 'file', ext: 'exe' },
      { name: 'photo_01.jpg', type: 'file', ext: 'jpg' },
      { name: 'song.mp3', type: 'file', ext: 'mp3' }
    ],
    'D:/工作': [
      { name: '报告.docx', type: 'file', ext: 'docx' },
      { name: '预算表.xlsx', type: 'file', ext: 'xlsx' },
      { name: '会议纪要.txt', type: 'file', ext: 'txt' },
      { name: '设计稿.zip', type: 'file', ext: 'zip' }
    ],
    '桌面': [
      { name: '新建文本文档.txt', type: 'file', ext: 'txt' },
      { name: '项目资料', type: 'folder' }
    ],
    '文档': [
      { name: '简历.docx', type: 'file', ext: 'docx' },
      { name: '学习笔记.txt', type: 'file', ext: 'txt' }
    ],
    '下载': [
      { name: '安装包.exe', type: 'file', ext: 'exe' },
      { name: '壁纸.png', type: 'file', ext: 'png' }
    ],
    '图片': [
      { name: '截图01.png', type: 'file', ext: 'png' },
      { name: '头像.jpg', type: 'file', ext: 'jpg' }
    ]
  };

  var QUICK = [
    { key: '此电脑', label: '此电脑', icon: 'thispc' },
    { key: '桌面', label: '桌面', icon: 'desktop' },
    { key: '文档', label: '文档', icon: 'doc' },
    { key: '下载', label: '下载', icon: 'download' },
    { key: '图片', label: '图片', icon: 'pictures' }
  ];

  /* ---------- 工具函数 ---------- */
  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  function normalizePath(p) {
    if (!p) return '';
    p = String(p).replace(/\\/g, '/').replace(/\/+$/, '');
    return p;
  }
  function joinPath(base, name) { return normalizePath(base) + '/' + name; }
  function pathKey(path) { return normalizePath(path) === '此电脑' ? '此电脑' : normalizePath(path); }
  function extOf(name) {
    var m = String(name).match(/\.([a-zA-Z0-9]+)$/);
    return m ? m[1].toLowerCase() : '';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function escAttr(s) { return esc(s); }

  /* ============================================================
   *  图标策略 —— 只用正版图片，不生成任何 SVG
   * ============================================================ */
  var ICON_DIR = '../../img/icon/win/';

  var ICON_MAP = {
    'folder':       'Folder.png',
    'thispc':       'Folder.png',
    'desktop':      'Folder.png',
    'doc':          'Folder.png',
    'download':     'Folder.png',
    'pictures':     'Folder.png',
    'drive-C':      'Folder.png',
    'drive-D':      'Folder.png',
    'file-doc':     'Text.png',
    'file-image':   ['imagers_1.png', 'imagers_2.png'],
    'file-audio':   'imagers_3.png',
    'file-archive': 'Folder2.png',
    'file-exe':     'imagers_5.png',
    'file-app':     'GenericApp.png',
    'file-edge':    'msedge.png',
    'file-unknown': 'None.png'
  };

  function imgTag(fileName, altText, cls) {
    var c = cls || 'icon-img';
    if (!fileName) return '<span class="' + c + '">' + esc(altText || '') + '</span>';
    return '<img class="' + c + '" src="' + ICON_DIR + escAttr(fileName) + '" alt="' + escAttr(altText || '') + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline\';">'
         + '<span class="' + c + '" style="display:none;">' + esc(altText || '') + '</span>';
  }

  function svgDrive(letter) { return imgTag('Folder.png', letter + ':', 'icon-drive'); }
  function svgFolder() { return imgTag('Folder.png', '文件夹', 'icon-folder'); }
  function svgImageFile() {
    var imgs = ICON_MAP['file-image'];
    var file = Array.isArray(imgs) ? imgs[Math.floor(Math.random() * imgs.length)] : imgs;
    return imgTag(file, '图片', 'icon-image');
  }
  function svgSetupFile() { return imgTag('imagers_5.png', '程序', 'icon-setup'); }
  function svgDocFile() { return imgTag('Text.png', '文档', 'icon-doc'); }
  function svgSidebar(kind) {
    var map = { 'thispc':'Folder.png','desktop':'Folder.png','doc':'Folder.png','download':'Folder.png','pictures':'Folder.png' };
    return imgTag(map[kind] || 'Folder.png', kind, 'icon-side');
  }
  function svgFile(ext, name) {
    if (['png','jpg','jpeg','gif','bmp','svg','webp'].indexOf(ext) >= 0) return svgImageFile();
    if (['mp3','wav','flac','aac','ogg','m4a'].indexOf(ext) >= 0) return imgTag(ICON_MAP['file-audio'], '音频', 'icon-audio');
    if (['zip','rar','7z'].indexOf(ext) >= 0) return imgTag(ICON_MAP['file-archive'], '压缩包', 'icon-archive');
    if (['txt','log','ini','cfg','conf'].indexOf(ext) >= 0) return svgDocFile();
    if (['exe','msi','iso','img','dmg','bat','cmd'].indexOf(ext) >= 0) {
      if ((name || '').toLowerCase() === 'msedge.exe') return imgTag(ICON_MAP['file-edge'], 'Edge', 'icon-exe');
      return imgTag(ICON_MAP['file-exe'], '程序', 'icon-exe');
    }
    return imgTag(ICON_MAP['file-unknown'], '文件', 'icon-unknown');
  }

  /* ---------- 路径历史 ---------- */
  var history = ['此电脑'];
  var hIndex = 0;
  function historyPush(p) { history = history.slice(0, hIndex + 1); history.push(p); hIndex = history.length - 1; }

  /* ---------- 渲染主体 ---------- */
  var filesEl = $('.files') || $('.right-con') || $('.right-con.pp');

  function currentKey() { return pathKey(history[hIndex]); }

  function render(path) {
    var key = pathKey(path);
    if (key === '此电脑') { renderComputer(); return; }
    var list = FS[key];
    if (!list) { renderEmpty('此文件夹为空。'); return; }
    var html = '';
    list.forEach(function (item) {
      if (item.type === 'folder') {
        html += '<div class="entry" data-type="folder" data-name="' + escAttr(item.name) + '">'
              + '<div class="icon">' + svgFolder() + '</div>'
              + '<span>' + esc(item.name) + '</span></div>';
      } else {
        var ex = item.ext || extOf(item.name);
        html += '<div class="entry" data-type="file" data-name="' + escAttr(item.name) + '" data-ext="' + escAttr(ex) + '">'
              + '<div class="icon">' + svgFile(ex, item.name) + '</div>'
              + '<span>' + esc(item.name) + '</span></div>';
      }
    });
    if (!html) { renderEmpty('此文件夹为空。'); return; }
    filesEl.innerHTML = html;
    bindEntryEvents();
    updateAddress();
  }

  function renderComputer() {
    var html = '';
    FS['此电脑'].forEach(function (drive) {
      var letter = drive.replace(/^.*\(([A-Za-z]):\)$/, '$1').toUpperCase();
      if (!letter || letter.length !== 1) letter = drive.charAt(0).toUpperCase();
      var cap = letter === 'C' ? { used: 12.2, total: 30.5 }
              : letter === 'D' ? { used: 28.7, total: 60.0 } : { used: 0, total: 0 };
      html += '<div class="entry drive" data-type="drive" data-path="' + escAttr(drive) + '" data-letter="' + escAttr(letter) + '">'
            + '<div class="icon">' + svgDrive(letter) + '</div>'
            + '<div class="info"><span class="name">' + esc(drive) + '</span>';
      if (cap.total > 0) {
        var pct = Math.round(cap.used / cap.total * 100);
        html += '<div class="progress"><span style="--p:' + pct + '%"></span></div>'
             +  '<span class="cap">' + cap.used.toFixed(1) + ' GB 可用，共 ' + cap.total.toFixed(1) + ' GB</span>';
      }
      html += '</div></div>';
    });
    filesEl.innerHTML = html;
    bindEntryEvents();
    updateAddress();
  }

  function renderEmpty(msg) { filesEl.innerHTML = '<div class="empty">' + esc(msg || '此文件夹为空。') + '</div>'; }

  /* ---------- 进入目录 / 打开文件 ---------- */
  function enterFolder(name) {
    var base = currentKey();
    var next = (base === '此电脑') ? name : joinPath(base, name);
    next = pathKey(next);
    if (!FS[next] && !QUICK.some(function (q) { return q.key === next; })) { if (FS[name]) next = name; else return; }
    historyPush(next); render(next);
  }
  function openFile(name) {
    var ex = extOf(name);
    if (['zip','rar','7z'].indexOf(ex) >= 0) { extractArchive(name, ex); return; }
    return;
  }
  function extractArchive(name, ex) {
    var base = currentKey();
    var folderName = name.replace(/\.(zip|rar|7z)$/i, '') + '_解压';
    if (base === '此电脑') return;
    var target = base;
    var list = FS[target] || (FS[target] = []);
    if (!list.some(function (it) { return it.name === folderName; })) list.push({ name: folderName, type: 'folder' });
    render(target);
    historyPush(target + '/' + folderName);
    render(target + '/' + folderName);
  }

  /* ---------- 选中 / 单击-双击判定 ---------- */
  var lastClickTarget = null, lastClickTime = 0, DOUBLE_MS = 350;
  function bindEntryEvents() {
    $$('.entry', filesEl).forEach(function (el) {
      el.onclick = function (e) {
        e.stopPropagation();
        $$('.entry.act', filesEl).forEach(function (a) { a.classList.remove('act'); });
        el.classList.add('act');
        var now = Date.now();
        var same = (lastClickTarget === el) && (now - lastClickTime <= DOUBLE_MS);
        if (same) {
          var type = el.getAttribute('data-type');
          var name = el.getAttribute('data-name');
          if (type === 'folder' || type === 'drive') enterFolder(type === 'drive' ? el.getAttribute('data-path') : name);
          else if (type === 'file') openFile(name);
          lastClickTarget = null; lastClickTime = 0;
        } else { lastClickTarget = el; lastClickTime = now; }
      };
    });
  }
  (filesEl || document.body).addEventListener('click', function (e) {
    if (e.target === filesEl || (filesEl && filesEl.contains(e.target) === false && !e.target.closest('.entry'))) {
      $$('.entry.act', filesEl).forEach(function (a) { a.classList.remove('act'); });
    }
  });

  /* ---------- 地址栏 / 菜单栏 / 侧边栏 / 搜索 ---------- */
  function updateAddress() {
    var addr = $('.address input, .addressbar input, input.addr');
    if (!addr) return;
    var key = currentKey();
    addr.value = (key === '此电脑') ? '此电脑' : key;
  }
  function goPath(raw) {
    var p = normalizePath(raw); if (!p) return;
    if (p === '此电脑') { historyPush('此电脑'); render('此电脑'); return; }
    var key = pathKey(p);
    if (FS[key]) { historyPush(key); render(key); return; }
    if (/^[A-Za-z]:$/.test(p)) { historyPush(p.toUpperCase()); render(p.toUpperCase()); return; }
    if (/^[A-Za-z]:\//.test(p)) {
      var parts = p.split('/'), root = parts[0].toUpperCase(), cur = root, ok = FS[root] ? true : false;
      if (ok) {
        for (var i = 1; i < parts.length; i++) { var sub = joinPath(cur, parts[i]); if (FS[pathKey(sub)]) cur = pathKey(sub); else { ok = false; break; } }
        if (ok) { historyPush(cur); render(cur); }
      }
    }
  }
  function bindMenu() {
    $$('.top ul.left li, .menu-bar li, .openlist li').forEach(function (li) {
      li.onclick = function (e) {
        e.stopPropagation();
        var m = li.getAttribute('data-menu') || li.textContent.trim();
        if (m === 'view' || m.indexOf('查看') === 0) { render(currentKey()); return; }
        if (m === 'computer' || m.indexOf('计算机') === 0) { historyPush('此电脑'); render('此电脑'); return; }
        if (m === 'file' || m.indexOf('文件') === 0) { historyPush('此电脑'); render('此电脑'); return; }
      };
    });
  }
  function bindSidebar() {
    $$('.quick-fw li, .left-bar li, .sidebar li').forEach(function (li) {
      var key = li.getAttribute('data-key'); if (!key) return;
      li.onclick = function (e) { e.stopPropagation(); if (key === '此电脑') { historyPush('此电脑'); render('此电脑'); return; } if (FS[key]) { historyPush(key); render(key); } };
    });
  }
  function bindAddressbar() {
    $$('.address .back, .addr-btn.back, [data-act="back"]').forEach(function (b) { b.onclick = function () { if (hIndex > 0) { hIndex--; render(history[hIndex]); } }; });
    $$('.address .forward, .addr-btn.forward, [data-act="forward"]').forEach(function (b) { b.onclick = function () { if (hIndex < history.length - 1) { hIndex++; render(history[hIndex]); } }; });
    $$('.address .up, .addr-btn.up, [data-act="up"]').forEach(function (b) { b.onclick = function () { var key = currentKey(); if (key === '此电脑') return; var parts = key.split('/'); parts.pop(); var parent = parts.length === 0 ? '此电脑' : parts.join('/'); historyPush(parent); render(parent); }; });
    $$('.address .refresh, .addr-btn.refresh, [data-act="refresh"]').forEach(function (b) { b.onclick = function () { render(currentKey()); }; });
    var addr = $('.address input, .addressbar input, input.addr');
    if (addr) addr.onkeydown = function (e) { if (e.key === 'Enter') goPath(addr.value); };
  }
  function bindSearch() {
    var sb = $('.ssk .search input, .search input, input.search');
    if (!sb) return;
    sb.oninput = function () {
      var q = sb.value.trim().toLowerCase();
      $$('.entry', filesEl).forEach(function (el) {
        var name = (el.getAttribute('data-name') || '').toLowerCase();
        el.style.display = (!q || name.indexOf(q) >= 0) ? '' : 'none';
      });
    };
  }

  /* ============================================================
   *  右键菜单（Context Menu）
   * ============================================================ */
  var CTX_ID = 'win10-ctx-menu';
  var MICO = {
    open:     '<svg viewBox="0 0 16 16"><path d="M2 3h5l1 1.5h6V13H2z" fill="#7fd6ff" stroke="#3a8fb7" stroke-width=".7"/><path d="M2 3h5l1 1.5h6" fill="none" stroke="#3a8fb7" stroke-width=".7"/></svg>',
    openwith: '<svg viewBox="0 0 16 16"><rect x="2" y="2" width="9" height="9" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><rect x="5" y="5" width="9" height="9" rx="1" fill="#eef3ff" stroke="#6a9fd0" stroke-width=".8"/></svg>',
    admin:    '<svg viewBox="0 0 16 16"><path d="M8 1l5 3v4c0 3-2 5.5-5 6.5C5 13.5 3 11 3 8V4z" fill="#cfe6ff" stroke="#5b8fcf" stroke-width=".8"/><circle cx="8" cy="8" r="1.6" fill="#5b8fcf"/></svg>',
    pinstart: '<svg viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" fill="#3a8fd0"/><rect x="5" y="5" width="6" height="6" rx=".5" fill="#7fc0ff"/><rect x="7" y="2" width="2" height="2" fill="#3a8fd0"/></svg>',
    pintask:  '<svg viewBox="0 0 16 16"><rect x="3" y="3" width="10" height="8" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><rect x="2" y="12" width="12" height="1.5" rx=".7" fill="#888"/><rect x="6.5" y="6" width="3" height="3" rx=".5" fill="#3a8fd0"/></svg>',
    sendto:   '<svg viewBox="0 0 16 16"><path d="M2 8h9" stroke="#888" stroke-width="1.2"/><path d="M8 4l4 4-4 4" fill="none" stroke="#888" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="12" y="3" width="2.5" height="10" rx="1" fill="#cfe6ff" stroke="#5b8fcf" stroke-width=".6"/></svg>',
    cut:      '<svg viewBox="0 0 16 16"><path d="M5 2l-3 6 3 6" fill="none" stroke="#e07a7a" stroke-width="1.3" stroke-linecap="round"/><path d="M11 2l3 6-3 6" fill="none" stroke="#e07a7a" stroke-width="1.3" stroke-linecap="round"/><circle cx="5" cy="11" r="1.2" fill="#e07a7a"/><circle cx="11" cy="5" r="1.2" fill="#e07a7a"/></svg>',
    copy:     '<svg viewBox="0 0 16 16"><rect x="4" y="4" width="8" height="9" rx="1" fill="#fff" stroke="#5b8fcf" stroke-width=".9"/><rect x="2" y="2" width="8" height="9" rx="1" fill="#eef3ff" stroke="#5b8fcf" stroke-width=".9"/></svg>',
    shortcut: '<svg viewBox="0 0 16 16"><path d="M7 2H3a1 1 0 0 0-1 1v4l2-2 2 2 2-2 2 2V3a1 1 0 0 0-1-1z" fill="#ffe680" stroke="#c99a1f" stroke-width=".7"/><circle cx="11.5" cy="12" r="2.5" fill="#7fc0ff" stroke="#3a8fb7" stroke-width=".7"/></svg>',
    delete:   '<svg viewBox="0 0 16 16"><rect x="4" y="5" width="8" height="8" rx="1" fill="#fff" stroke="#c0392b" stroke-width=".8"/><path d="M6 5V3.5h4V5" fill="none" stroke="#c0392b" stroke-width=".8"/><path d="M3 5h10" stroke="#c0392b" stroke-width=".8"/><path d="M6.5 7.5l3 3M9.5 7.5l-3 3" stroke="#c0392b" stroke-width=".9" stroke-linecap="round"/></svg>',
    rename:   '<svg viewBox="0 0 16 16"><path d="M2 13V3h7l3 3v7z" fill="#fff" stroke="#888" stroke-width=".8"/><path d="M9 3v3h3" fill="none" stroke="#888" stroke-width=".8"/><path d="M5 8h5M5 10.5h3.5" stroke="#5b8fcf" stroke-width="1" stroke-linecap="round"/></svg>',
    props:    '<svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="1" fill="#fff" stroke="#888" stroke-width=".8"/><circle cx="8" cy="8" r="2.4" fill="none" stroke="#5b8fcf" stroke-width="1"/><path d="M8 3.5v1.5M8 11v1.5M3.5 8h1.5M11 8h1.5" stroke="#5b8fcf" stroke-width="1" stroke-linecap="round"/></svg>',
    refresh:  '<svg viewBox="0 0 16 16"><path d="M3 8a5 5 0 0 1 8.5-3.5L13 6" fill="none" stroke="#5b8fcf" stroke-width="1.2" stroke-linecap="round"/><path d="M13 8a5 5 0 0 1-8.5 3.5L3 10" fill="none" stroke="#888" stroke-width="1.2" stroke-linecap="round"/><path d="M11 2.5v3.5h-3.5" fill="none" stroke="#5b8fcf" stroke-width="1" stroke-linejoin="round"/><path d="M5 13.5v-3.5h3.5" fill="none" stroke="#888" stroke-width="1" stroke-linejoin="round"/></svg>',
    paste:    '<svg viewBox="0 0 16 16"><rect x="4" y="2" width="8" height="3" rx=".6" fill="#fff" stroke="#5b8fcf" stroke-width=".8"/><rect x="2.5" y="4.5" width="11" height="9.5" rx="1" fill="#eef3ff" stroke="#5b8fcf" stroke-width=".8"/><path d="M5.5 8h5M5.5 10.5h3.5" stroke="#5b8fcf" stroke-width="1" stroke-linecap="round"/></svg>',
    view:     '<svg viewBox="0 0 16 16"><rect x="2" y="3" width="5" height="4" rx=".6" fill="#eef3ff" stroke="#5b8fcf" stroke-width=".7"/><rect x="9" y="3" width="5" height="4" rx=".6" fill="#eef3ff" stroke="#5b8fcf" stroke-width=".7"/><rect x="2" y="9" width="5" height="4" rx=".6" fill="#eef3ff" stroke="#5b8fcf" stroke-width=".7"/><rect x="9" y="9" width="5" height="4" rx=".6" fill="#eef3ff" stroke="#5b8fcf" stroke-width=".7"/></svg>',
    sort:     '<svg viewBox="0 0 16 16"><path d="M3 4h7M3 8h5M3 12h7" stroke="#5b8fcf" stroke-width="1.1" stroke-linecap="round"/><path d="M12 2v10M12 12l-1.5-1.6M12 12l1.5-1.6" fill="none" stroke="#5b8fcf" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    eject:    '<svg viewBox="0 0 16 16"><rect x="2" y="11" width="12" height="3" rx="1" fill="#cfe6ff" stroke="#5b8fcf" stroke-width=".7"/><path d="M8 3l5 6H3z" fill="#fff" stroke="#5b8fcf" stroke-width=".8"/><path d="M6 6.5h4" stroke="#5b8fcf" stroke-width=".9" stroke-linecap="round"/></svg>'
  };
  function buildItem(it) {
    if (it.sep) return '<div class="ctx-sep" role="separator"></div>';
    var dis = it.disabled ? ' ctx-disabled' : '';
    var sub = it.sub ? ' ctx-has-sub' : '';
    return '<div class="ctx-item' + dis + sub + '" data-id="' + escAttr(it.id || '') + '" role="menuitem"' + (it.disabled ? ' aria-disabled="true"' : '') + '>'
      + '<span class="ctx-icon">' + (it.icon ? MICO[it.icon] || '' : '') + '</span>'
      + '<span class="ctx-label">' + esc(it.label) + '</span>'
      + (it.sub ? '<span class="ctx-arrow">▸</span>' : '')
      + '</div>';
  }
  function menuForEntry(el) {
    var type = el.getAttribute('data-type');
    var name = el.getAttribute('data-name') || '';
    var ex = el.getAttribute('data-ext') || extOf(name);
    var items = [];
    items.push({ id:'open', label:'打开(&O)', icon:'open', onClick:function(){ if(type==='folder'||type==='drive') enterFolder(type==='drive'?el.getAttribute('data-path'):name); else openFile(name); } });
    items.push({ sep:true });
    items.push({ id:'openwith', label:'打开方式(&H)', icon:'openwith', sub:true, disabled:true });
    items.push({ id:'admin', label:'以管理员身份运行(&A)', icon:'admin', disabled:(type!=='file'||(['exe','bat','cmd'].indexOf(ex)<0)) });
    items.push({ sep:true });
    items.push({ id:'pinstart', label:'固定到"开始"屏幕(&N)', icon:'pinstart', disabled:(type!=='file') });
    items.push({ id:'pintask', label:'固定到任务栏(&K)', icon:'pintask', disabled:(type!=='file') });
    items.push({ id:'sendto', label:'发送到(&D)', icon:'sendto', sub:true });
    items.push({ sep:true });
    items.push({ id:'cut', label:'剪切(&T)', icon:'cut' });
    items.push({ id:'copy', label:'复制(&C)', icon:'copy' });
    items.push({ id:'shortcut', label:'创建快捷方式(&S)', icon:'shortcut' });
    items.push({ id:'delete', label:'删除(&D)', icon:'delete' });
    items.push({ id:'rename', label:'重命名(&M)', icon:'rename' });
    items.push({ sep:true });
    items.push({ id:'props', label:'属性(&R)', icon:'props' });
    return items;
  }
  function menuForDrive(el) {
    var items = [];
    items.push({ id:'open', label:'打开(&O)', icon:'open', onClick:function(){ enterFolder(el.getAttribute('data-path')); } });
    items.push({ sep:true });
    items.push({ id:'admin', label:'以管理员身份运行(&A)', icon:'admin', disabled:true });
    items.push({ id:'pintask', label:'固定到任务栏(&K)', icon:'pintask', disabled:true });
    items.push({ sep:true });
    items.push({ id:'cut', label:'剪切(&T)', icon:'cut', disabled:true });
    items.push({ id:'copy', label:'复制(&C)', icon:'copy', disabled:true });
    items.push({ id:'paste', label:'粘贴(&P)', icon:'paste', disabled:true });
    items.push({ sep:true });
    items.push({ id:'eject', label:'弹出(&J)', icon:'eject', disabled:true });
    items.push({ id:'props', label:'属性(&R)', icon:'props' });
    return items;
  }
  function menuForBackground() {
    var items = [];
    items.push({ id:'view', label:'查看(&V)', icon:'view', sub:true });
    items.push({ id:'sort', label:'排序方式(&O)', icon:'sort', sub:true });
    items.push({ sep:true });
    items.push({ id:'refresh', label:'刷新(&R)', icon:'refresh', onClick:function(){ render(currentKey()); } });
    items.push({ sep:true });
    items.push({ id:'paste', label:'粘贴(&P)', icon:'paste', disabled:true });
    items.push({ sep:true });
    items.push({ id:'props', label:'属性(&R)', icon:'props' });
    return items;
  }
  function renderMenu(items) {
    var html = '<div class="ctx-menu" role="menu">';
    items.forEach(function (it) { html += buildItem(it); });
    html += '</div>';
    return html;
  }
  function ensureStyle() {
    if (document.getElementById('ctx-menu-style')) return;
    var st = document.createElement('style');
    st.id = 'ctx-menu-style';
    st.textContent =
      '.ctx-menu{position:fixed;z-index:9999;min-width:240px;padding:4px;background:#f2f2f2;border:1px solid #bbb;border-radius:4px;box-shadow:2px 2px 6px rgba(0,0,0,.25);font-family:"Segoe UI","Microsoft YaHei",sans-serif;font-size:12px;color:#1a1a1a;user-select:none;}'
      + '.ctx-item{display:flex;align-items:center;padding:2px 8px;height:24px;cursor:default;border-radius:3px;}'
      + '.ctx-item:hover:not(.ctx-disabled){background:#cfe6ff;}'
      + '.ctx-item.ctx-disabled{color:#a0a0a0;}'
      + '.ctx-item.ctx-disabled:hover{background:transparent;}'
      + '.ctx-icon{width:18px;height:18px;margin-right:8px;display:flex;align-items:center;justify-content:center;flex:0 0 18px;}'
      + '.ctx-icon svg{width:16px;height:16px;}'
      + '.ctx-label{flex:1;white-space:nowrap;}'
      + '.ctx-arrow{color:#888;font-size:10px;margin-left:6px;}'
      + '.ctx-sep{height:1px;background:#d0d0d0;margin:4px 2px;}'
      + '.icon-img{max-width:34px;max-height:30px;object-fit:contain;display:block;margin:0 auto;}'
      + '.icon-drive{max-width:32px;max-height:32px;}';
    document.head.appendChild(st);
  }
  function closeMenu() { var m = document.getElementById(CTX_ID); if (m) m.remove(); }
  function openMenu(x, y, items) {
    closeMenu(); ensureStyle();
    var wrap = document.createElement('div'); wrap.id = CTX_ID;
    wrap.style.position = 'fixed'; wrap.style.left = '0'; wrap.style.top = '0'; wrap.style.zIndex = '9999';
    wrap.innerHTML = renderMenu(items);
    document.body.appendChild(wrap);
    var menu = wrap.firstChild;
    menu.style.left = x + 'px'; menu.style.top = y + 'px';
    var r = menu.getBoundingClientRect();
    if (r.right > window.innerWidth) menu.style.left = (x - r.width) + 'px';
    if (r.bottom > window.innerHeight) menu.style.top = (y - r.height) + 'px';
    if (parseInt(menu.style.left, 10) < 0) menu.style.left = '4px';
    if (parseInt(menu.style.top, 10) < 0) menu.style.top = '4px';
    $$('.ctx-item', menu).forEach(function (item) {
      item.onclick = function (e) {
        e.stopPropagation();
        if (item.classList.contains('ctx-disabled')) return;
        var id = item.getAttribute('data-id');
        var def = items.find(function (d) { return d.id === id; });
        if (def && def.onClick) def.onClick();
        closeMenu();
      };
    });
    return menu;
  }
  function bindContextMenu() {
    filesEl.addEventListener('contextmenu', function (e) {
      var entry = e.target.closest('.entry');
      if (entry && filesEl.contains(entry)) {
        e.preventDefault();
        $$('.entry.act', filesEl).forEach(function (a) { a.classList.remove('act'); });
        entry.classList.add('act');
        var type = entry.getAttribute('data-type');
        var items = (type === 'drive') ? menuForDrive(entry) : menuForEntry(entry);
        openMenu(e.clientX, e.clientY, items);
        return;
      }
      if (e.target === filesEl || filesEl.contains(e.target)) {
        e.preventDefault();
        $$('.entry.act', filesEl).forEach(function (a) { a.classList.remove('act'); });
        openMenu(e.clientX, e.clientY, menuForBackground());
      }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('#' + CTX_ID)) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    $$('.quick-fw li, .left-bar li').forEach(function (li) {
      li.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        var key = li.getAttribute('data-key');
        if (key && FS[key]) { historyPush(key); render(key); }
        openMenu(e.clientX, e.clientY, menuForBackground());
      });
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    filesEl = $('.files') || $('.right-con') || $('.right-con.pp') || document.body;
    bindMenu(); bindSidebar(); bindAddressbar(); bindSearch(); bindContextMenu();
    render('此电脑');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
