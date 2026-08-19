(function () {
    'use strict';
    var f = document.getElementById('frame');
    var input = document.querySelector('.top input');
    var backBtn = document.querySelector('.back');
    var fwdBtn = document.querySelector('.forward');
    var HOME = 'https://cn.bing.com/';

    var hist = [{ url: HOME }];
    var idx = 0;

    function currentUrl() { return hist[idx] ? hist[idx].url : HOME; }

    function pushUrl(url) {
        hist = hist.slice(0, idx + 1);
        hist.push({ url: url });
        idx = hist.length - 1;
        updateUi();
    }

    function go(url) {
        if (!url) return;
        f.src = url;
        pushUrl(url);
    }

    function normalize(raw) {
        var a = raw.trim();
        if (!a) return HOME;
        if (a.indexOf('://') === -1) {
            if (a.indexOf('.') > 0) a = 'https://' + a;
            else a = 'https://cn.bing.com/search?q=' + encodeURIComponent(a);
        }
        return a;
    }

    function updateUi() {
        input.value = currentUrl();
        backBtn.classList.toggle('disabled', idx <= 0);
        fwdBtn.classList.toggle('disabled', idx >= hist.length - 1);
    }

    input.onkeydown = function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            go(normalize(this.value));
        }
    };

    document.querySelectorAll('.links a').forEach(function (a) {
        a.onclick = function () { go(this.getAttribute('data-href')); };
    });

    backBtn.onclick = function () {
        if (idx > 0) { idx--; f.src = currentUrl(); updateUi(); }
    };

    fwdBtn.onclick = function () {
        if (idx < hist.length - 1) { idx++; f.src = currentUrl(); updateUi(); }
    };

    document.querySelector('.reload').onclick = function () {
        f.src = 'about:blank';
        setTimeout(function () { f.src = currentUrl(); }, 50);
    };

    document.querySelector('.home').onclick = function () { go(HOME); };

    var menu = document.getElementById('edgeMenu');
    document.querySelector('.menu').onclick = function (e) {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
    };
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.edge-menu') && !e.target.closest('.menu')) menu.hidden = true;
    });
    menu.querySelectorAll('.edge-menu-item').forEach(function (item) {
        item.onclick = function () {
            var act = this.getAttribute('data-act');
            if (act === 'home' || act === 'homepage') go(HOME);
            if (act === 'about') {
                f.src = 'about:blank';
                setTimeout(function () {
                    f.srcdoc = '<!doctype html><meta charset="utf-8"><body style="font-family:Segoe UI,sans-serif;padding:40px;color:#333;"><h2>Microsoft Edge</h2><p>版本 120.0.0 (模拟)</p><p>此窗口为 Win10online 内嵌的 Edge 浏览器模拟。</p></body>';
                }, 50);
            }
            menu.hidden = true;
        };
    });

    f.addEventListener('load', function () {
        try { if (f.contentWindow && f.contentWindow.location && f.contentWindow.location.href !== 'about:blank') input.value = f.contentWindow.location.href; }
        catch (e) { /* 跨域，忽略 */ }
    });

    updateUi();
})();
