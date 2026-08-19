// ===== 搜索框：输入时切换清除图标，点击 x 清空 =====
var searchs = document.querySelectorAll(".search");
searchs.forEach(function (e) {
  var input = e.querySelector('input');
  var button = e.querySelector('button');
  input.addEventListener('input', function () {
    if (this.value == "") {
      button.classList.add('bi-search');
      button.classList.remove('bi-x-lg');
    } else {
      button.classList.remove('bi-search');
      button.classList.add('bi-x-lg');
    }
  });

  button.onclick = function () {
    if (this.classList.contains('bi-x-lg')) {
      input.value = "";
      button.classList.add('bi-search');
      button.classList.remove('bi-x-lg');
    }
  };
});

// ===== 开关 win-check2 =====
document.querySelectorAll(".win-check2").forEach(function(e){
  if(e.classList.contains('checked')){
    e.querySelector('.statu').innerHTML="开";
  }else{
    e.querySelector('.statu').innerHTML="关";
  }
  e.onclick=function(){
    if(e.classList.contains('checked')){
      e.classList.remove('checked');
      e.querySelector('.statu').innerHTML="关";
    }else{
      e.classList.add('checked');
      e.querySelector('.statu').innerHTML="开";
    }
  }
});

// ===== 页面切换：主页 <-> 系统子页 =====
var pageIndex  = document.querySelector('.page[path="/index"]');
var pageSystem = document.querySelector('.page[path="/system"]');

function showIndex(){
  pageIndex.style.display  = 'block';
  pageSystem.style.display = 'none';
}
function showSystem(){
  pageIndex.style.display  = 'none';
  pageSystem.style.display = 'block';
}

// 主页设置项点击 -> 进入系统子页（默认选中第一个 li）
document.querySelectorAll('.page[path="/index"] .setting-item').forEach(function(item){
  item.addEventListener('click', function(){
    showSystem();
  });
});

// 侧栏：返回箭头 / 主页 -> 回主页
var fh   = document.querySelector('.celan .fh');
var home = document.querySelector('.celan .home');
if(fh)   fh.addEventListener('click', showIndex);
if(home) home.addEventListener('click', showIndex);

// 侧栏 li 点击 -> 切换对应 se-content（按 data-id 匹配）
var seContents = document.querySelectorAll('.contents .se-content');
var sideItems  = document.querySelectorAll('.celan .list li');

function activeSideItem(li){
  sideItems.forEach(function(s){ s.classList.remove('active'); });
  if(li) li.classList.add('active');
}
function showContentById(id){
  seContents.forEach(function(c){
    if(c.getAttribute('data-id') === id){
      c.classList.add('active');
    }else{
      c.classList.remove('active');
    }
  });
}

sideItems.forEach(function(li, idx){
  li.addEventListener('click', function(){
    activeSideItem(li);
    var id = String(idx + 1); // 第一个 li 对应 data-id="1"
    showContentById(id);
  });
});

// 初始：默认激活侧栏第一项 + 显示 data-id="1" 内容
if(sideItems.length){
  activeSideItem(sideItems[0]);
  showContentById("1");
}
