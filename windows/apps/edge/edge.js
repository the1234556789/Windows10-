(function () {
    'use strict';

    var f = document.getElementById('frame');
    var input = document.querySelector('#Input');
    var backBtn = document.querySelector('.back');
    var fwdBtn = document.querySelector('.forward');
    var reloadBtn = document.querySelector('.reload');
    var homeBtn = document.querySelector('.home');
    var menuToggle = document.querySelector('.menu');
    var menu = document.getElementById('edgeMenu');

    const HOME = "https://cn.bing.com/";
    let hist = [{ url: HOME }];
    let idx = 0;
    let isLoading = false;

    function currentUrl() {
        if (!hist[idx]) return HOME;
        return hist[idx].url;
    }

    function setLoading(state) {
        isLoading = state;
        if(!input) return;
        if(state) {
            input.placeholder = "加载中...";
        } else {
            input.placeholder = "输入网址或搜索";
        }
    }

    function pushUrl(url) {
        if (!url) return;
        // 禁止连续重复地址压历史
        if(currentUrl() === url) return;
        hist = hist.slice(0, idx + 1);
        hist.push({url:url});
        idx = hist.length - 1;
        updateUi();
    }

    function go(url) {
        if(!f) return;
        url = String(url);
        if(url === "about:home") url = HOME;

        setLoading(true);
        f.src = url;
        pushUrl(url);
    }

    function normalizeUrl(raw) {
        const text = raw.trim();
        if(!text) return HOME;

        if(text.startsWith("about:")) return text;

        if (text.includes("://")) {
            return text;
        }
        // 判断是域名还是搜索词
        if (/^[\w\-]+\.[\w\-]+/.test(text)) {
            return "https://" + text;
        } else {
            return "https://cn.bing.com/search?q=" + encodeURIComponent(text);
        }
    }

    function updateUi() {
        if(input) input.value = currentUrl();
        if(backBtn) {
            if(idx <= 0) backBtn.classList.add("disabled");
            else backBtn.classList.remove("disabled");
        }
        if(fwdBtn) {
            if(idx >= hist.length -1) fwdBtn.classList.add("disabled");
            else fwdBtn.classList.remove("disabled");
        }
    }

    // 地址栏回车
    if(input) {
        input.onkeydown = function(e) {
            if(e.key === "Enter") {
                e.preventDefault();
                go(normalizeUrl(this.value));
            }
        }
    }

    // 快捷链接
    document.querySelectorAll('.links a').forEach(a=>{
        a.onclick = function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-href');
            go(target);
        }
    })

    // 后退
    if(backBtn) {
        backBtn.onclick = function() {
            if(idx <= 0) return;
            idx--;
            if(f) f.src = currentUrl();
            updateUi();
        }
    }

    //前进
    if(fwdBtn) {
        fwdBtn.onclick = function() {
            if(idx >= hist.length - 1) return;
            idx++;
            if(f) f.src = currentUrl();
            updateUi();
        }
    }

    //刷新
    if(reloadBtn) {
        reloadBtn.onclick = function() {
            setLoading(true);
            try {
                if(f && f.contentWindow) {
                    f.contentWindow.location.reload();
                    return;
                }
            } catch(err) {
                //跨域兜底
                f.src = "about:blank";
                setTimeout(()=>{
                    f.src = currentUrl();
                }, 80);
            }
        }
    }

    //主页
    if(homeBtn) {
        homeBtn.onclick = ()=> go(HOME);
    }

    //右上角菜单
    if(menuToggle && menu) {
        menuToggle.onclick = function(e) {
            e.stopPropagation();
            menu.hidden = !menu.hidden;
        }
        document.addEventListener('click', function(e) {
            if(!e.target.closest('.menu') && !e.target.closest('#edgeMenu')) {
                menu.hidden = true;
            }
        })

        menu.querySelectorAll('.edge-menu-item').forEach(item=>{
            item.onclick = function() {
                const act = this.dataset.act;
                if(act === "home") go(HOME);
                if(act === "about") {
                    f.src = "about:blank";
                    setTimeout(()=>{
                        f.srcdoc = `
<!DOCTYPE html>
<meta charset="utf-8">
<body style="font-family:'Segoe UI',Microsoft YaHei;padding:32px;">
<h2>Microsoft Edge (模拟)</h2>
<p>版本：124.0 模拟版</p>
<p>项目 Win10‑Online 网页模拟器</p>
</body>
`;
                    }, 50);
                }
                menu.hidden = true;
            }
        })
    }

    //iframe加载完成
    if(f) {
        f.addEventListener('load', function() {
            setLoading(false);
            try {
                const realHref = f.contentWindow.location.href;
                // 跨域页面会抛出异常，直接捕获忽略
                if(realHref !== "about:blank") {
                    if(input) input.value = realHref;
                }
            } catch(e) {}
        })
    }

    //初始化界面
    updateUi();
})();
