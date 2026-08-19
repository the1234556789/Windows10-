/* ============================================================
 * KuGou For Web - index.js（修复版）
 * 修复清单：
 *  1. 进度条拖拽改用 addEventListener，不再污染 document.onmousemove
 *  2. JSONP 回调使用唯一函数名，避免快速连续操作冲突
 *  3. 搜索 <script> 标签及时移除，防止 DOM 堆积
 *  4. 播放列表首次插入改用 getElementById + appendChild，修复空 ul 问题
 *  5. 歌词行高 LINE_HEIGHT=40 与 CSS（line-height:30 + margin:5*2）对齐
 *  6. parent.Notice 增加容错，父窗口不存在时降级为 alert
 *  7. 消除变量 i 重复覆盖、hlist 竞态等隐患
 * ============================================================ */

var test = {
  hash: '53634f4002b63334744c45314129afc1',
  albumid: '45759999'
};

var audio = document.getElementById('audio');

/* ---------- 音乐播放 ---------- */
function bfmusic(hash, albumid) {
  var longtime = new Date().getTime();

  // JSONP 回调：使用唯一函数名，避免冲突
  var cbName = 'kgGetDataCb_' + longtime;
  window[cbName] = function (a) {
    handleGetData(a);
    delete window[cbName];
  };

  var script = document.createElement('script');
  script.src = 'https://wwwapi.kugou.com/yy/index.php?r=play/getdata&callback='
    + cbName + '&hash=' + hash.toUpperCase()
    + '&dfid=2mScsJ16ucV81qLdzD238ELf&appid=1014&mid=1b211caf58cd1e1fdfea5a4657cc21f5&platid=4&album_id='
    + albumid + '&_=' + longtime;
  document.body.appendChild(script);
  script.onload = function () {
    script.remove();
    script = null;
  };
}

/* 真正的 getData 逻辑（原回调内容） */
function handleGetData(a) {
  audio.setAttribute('src', a.data.play_url);
  document.querySelector('.gc .title').innerHTML = a.data.song_name;
  document.querySelector('.song .name').innerHTML = a.data.audio_name;
  document.querySelector('.song .album').innerHTML = a.data.album_name;

  var author_b = '';
  for (var i = 0; i < a.data.authors.length; i++) {
    if (i === a.data.authors.length - 1) {
      author_b += a.data.authors[i].author_name;
    } else {
      author_b += a.data.authors[i].author_name + '、';
    }
  }
  document.querySelector('.gc .singer').innerHTML = author_b;
  document.querySelector('.controls .left img').src = a.data.img;

  audio.oncanplay = function () {
    audio.play();
    var dur = queryTime(audio.duration);
    document.querySelector('div.time span.c').innerHTML = dur;
  };

  // 解析歌词
  oLRC.ms = []; // 重置，避免切歌时残留上一首
  createLrcObj(a.data.lyrics);

  var ul = document.querySelector('.gcframe ul');
  ul.innerHTML = '';
  for (var j = 0; j < oLRC.ms.length; j++) {
    ul.innerHTML += '<li>' + oLRC.ms[j].c + '</li>';
  }
  var firstLi = document.querySelectorAll('.gcframe ul li')[0];
  if (firstLi) firstLi.classList.add('act');
  document.querySelector('.gcframe').setAttribute('style', '--i:1;');

  // 付费试听提示（带容错）
  if (a.data.has_privilege && a.data.privilege === 10) {
    var msg = '由于该歌曲在酷狗音乐平台上为付费收听，只能试听1分钟，所以在这里，我们也只能获取到一分钟的音乐，如果想听整首歌，请你下载酷狗音乐APP。';
    if (window.parent && window.parent.Notice) {
      new window.parent.Notice({
        title: '提示',
        icon: '../../img/kugou.jpg',
        showTime: 3000,
        center: msg,
        onclick: function (notice) { notice.close(); }
      }).send();
    } else {
      alert(msg);
    }
  }
}

/* ---------- 时间格式化 ---------- */
function queryTime(a) {
  var s = parseInt(a % 60);
  var m = parseInt(a / 60);
  if (s < 10) s = '0' + s;
  if (m < 10) m = '0' + m;
  return m + ':' + s;
}

/* ---------- 歌词对象 ---------- */
var oLRC = {
  ti: '', ar: '', al: '', by: '', offset: 0,
  ms: []
};

/* ---------- 解析 LRC 歌词 ---------- */
function createLrcObj(lrc) {
  if (!lrc || lrc.length === 0) return;
  var lrcs = lrc.split('\n');
  for (var i = 0; i < lrcs.length; i++) {
    lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, '');
    if (!lrcs[i]) continue;
    var t = lrcs[i].substring(lrcs[i].indexOf('[') + 1, lrcs[i].indexOf(']'));
    var s = t.split(':');
    if (isNaN(parseInt(s[0]))) {
      // 元信息行 [ti:...] 等
      var key = s[0].toLowerCase();
      if (oLRC.hasOwnProperty(key) && key !== 'ms') {
        oLRC[key] = s[1];
      }
    } else {
      var arr = lrcs[i].match(/\[(\d+:.+?)\]/g);
      if (!arr) continue;
      var start = 0;
      for (var k = 0; k < arr.length; k++) start += arr[k].length;
      var content = lrcs[i].substring(start);
      for (var k2 = 0; k2 < arr.length; k2++) {
        var tt = arr[k2].substring(1, arr[k2].length - 1);
        var ss = tt.split(':');
        oLRC.ms.push({
          t: (parseFloat(ss[0]) * 60 + parseFloat(ss[1])).toFixed(3),
          c: content
        });
      }
    }
  }
  oLRC.ms.sort(function (a, b) { return parseFloat(a.t) - parseFloat(b.t); });
}

/* ---------- 播放/暂停按钮 ---------- */
audio.onplay = function () {
  document.querySelector('.playbtn').classList.remove('bi-play-fill');
  document.querySelector('.playbtn').classList.add('bi-pause');
};
audio.onpause = function () {
  document.querySelector('.playbtn').classList.add('bi-play-fill');
  document.querySelector('.playbtn').classList.remove('bi-pause');
};
document.querySelector('.playbtn').onclick = function () {
  audio.paused ? audio.play() : audio.pause();
};

/* ---------- 进度更新 + 歌词滚动 ---------- */
var LINE_HEIGHT = 40; // CSS: line-height 30 + margin 5*2 = 40
var nowc = 0;
var ismove = false;

audio.ontimeupdate = function () {
  if (ismove) return;
  var mstime = audio.currentTime;
  document.querySelector('div.time span.z').innerHTML = queryTime(parseInt(mstime));
  var per = (audio.duration > 0) ? (mstime / audio.duration * 100) : 0;
  document.querySelector('.progress').setAttribute('style', '--i:' + per + '%');

  // 定位当前歌词行
  var nowa = 0;
  for (var i = 0; i < oLRC.ms.length; i++) {
    var cur = parseFloat(oLRC.ms[i].t);
    var next = (i + 1 < oLRC.ms.length) ? parseFloat(oLRC.ms[i + 1].t) : Infinity;
    if (cur <= mstime && next > mstime) { nowa = i; break; }
  }
  if (oLRC.ms.length > 0 && nowa !== nowc) {
    nowc = nowa;
    var lis = document.querySelectorAll('.gcframe ul li');
    lis.forEach(function (e) { e.classList.remove('act'); });
    if (lis[nowc]) lis[nowc].classList.add('act');
    document.querySelector('.gcframe').setAttribute('style', '--i:' + (nowc + 1) + ';');
  }
};

/* ---------- 进度条点击 ---------- */
document.querySelector('.progress').addEventListener('click', function (e) {
  if (ismove) { ismove = false; return; }
  var rect = this.getBoundingClientRect();
  var per = (e.clientX - rect.left) / rect.width;
  per = Math.max(0, Math.min(1, per));
  this.setAttribute('style', '--i:' + (per * 100) + '%');
  if (audio.duration) audio.currentTime = audio.duration * per;
});

/* ---------- 进度条拖拽（addEventListener，不污染全局）---------- */
var progressBar = document.querySelector('.progress');
progressBar.addEventListener('mousedown', function (e) {
  ismove = true;
  updateProgress(e);
});
document.addEventListener('mousemove', function (e) {
  if (!ismove) return;
  updateProgress(e);
});
document.addEventListener('mouseup', function (e) {
  if (!ismove) return;
  ismove = false;
  if (audio.duration) {
    var rect = progressBar.getBoundingClientRect();
    var per = (e.clientX - rect.left) / rect.width;
    per = Math.max(0, Math.min(1, per));
    audio.currentTime = audio.duration * per;
  }
});
function updateProgress(e) {
  var rect = progressBar.getBoundingClientRect();
  var per = (e.clientX - rect.left) / rect.width;
  per = Math.max(0, Math.min(1, per));
  progressBar.setAttribute('style', '--i:' + (per * 100) + '%');
}

/* ---------- 搜索 ---------- */
var hlist = '';
document.querySelector('.search-box input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') search();
});

function search() {
  console.log('search');
  hlist = '';
  document.querySelector('.searchlist').style.display = 'block';
  gets();
}

function gets() {
  var kw = document.querySelector('.search-box input').value;
  console.log(kw);
  var sc = document.createElement('script');
  var cbName = 'kgSearchCb_' + new Date().getTime();
  window[cbName] = function (a) { handleSearchCb(a, cbName); };
  sc.src = 'https://mobiles.kugou.com/api/v3/search/song?format=jsonp&keyword='
    + encodeURIComponent(kw) + '&page=1&pagesize=30&showtype=1&callback=' + cbName;
  document.body.appendChild(sc);
  sc.onload = function () { sc.remove(); sc = null; };
}

function handleSearchCb(a, cbName) {
  hlist = '';
  if (a && a.data && a.data.info) {
    for (var i = 0; i < a.data.info.length; i++) {
      hlist += '<li data-hash="' + a.data.info[i].hash + '" data-album-id="' + a.data.info[i].album_id + '">'
        + '<span class="dot">' + (i + 1) + '</span>'
        + '<span class="name">' + a.data.info[i].filename + '</span></li>';
    }
  }
  document.querySelector('.searchlist ul').innerHTML = hlist || '什么也没找到';
  document.querySelectorAll('.searchlist li').forEach(function (e) {
    e.onclick = function () {
      var hash = e.getAttribute('data-hash');
      var albumId = e.getAttribute('data-album-id');
      var name = e.querySelector('span.name').innerHTML;
      bfmusic(hash, albumId);
      addInPlayList(hash, albumId, name);
      document.querySelector('.searchlist').style.display = 'none';
    };
  });
  console.log('Time:' + (new Date().getTime() - startTime) + 'ms');
  delete window[cbName];
}

var startTime = new Date().getTime();

/* ---------- 播放列表 ---------- */
function addInPlayList(hash, albumid, name) {
  var ul = document.getElementById('playlist-ul');
  if (!ul) { // 兼容：如果没有 id，退回原选择器
    ul = document.querySelector('.playlist .list ul');
  }
  var li = document.createElement('li');
  li.innerHTML = name;
  li.setAttribute('data-hash', hash);
  li.setAttribute('data-album-id', albumid);
  ul.appendChild(li);
  li.onclick = function () {
    ul.querySelectorAll('li').forEach(function (e) { e.classList.remove('act'); });
    li.classList.add('act');
    bfmusic(hash, albumid);
  };
  ul.querySelectorAll('li').forEach(function (e) { e.classList.remove('act'); });
  li.classList.add('act');
}

/* ---------- 搜索列表返回 ---------- */
document.querySelector('.bi-chevron-left').addEventListener('click', function () {
  document.querySelector('.searchlist').style.display = 'none';
});

/* ---------- 倍速 / 音量 ---------- */
document.querySelector('#bs').addEventListener('change', function () {
  audio.playbackRate = parseFloat(this.value);
});
document.querySelector('#sy').addEventListener('change', function () {
  audio.volume = parseFloat(this.value);
});
audio.volume = 0.5;

/* ---------- 上一首 / 下一首 ---------- */
audio.onended = function () {
  document.querySelector('.bi-skip-end-fill').click();
};
document.querySelector('.bi-skip-start-fill').addEventListener('click', function () {
  var acted = document.querySelector('.playlist .list li.act');
  if (acted && acted.previousElementSibling) acted.previousElementSibling.click();
});
document.querySelector('.bi-skip-end-fill').addEventListener('click', function () {
  var acted = document.querySelector('.playlist .list li.act');
  if (acted && acted.nextElementSibling) acted.nextElementSibling.click();
});

/* ---------- 刷新搜索 ---------- */
document.querySelector('.bi-arrow-clockwise').addEventListener('click', function () {
  if (document.querySelector('.search-box input').value.trim()) search();
});

/* ---------- 默认播放一首（测试用）---------- */
bfmusic(test.hash, test.albumid);
