window.onresize = r;
function r() {
  document.body.style.width = window.innerWidth + 'px';
  document.body.style.height = window.innerHeight + 'px';
}
r();
document.onclick = function () {
  self.frameElement.parentElement.parentElement.click();
}
document.querySelectorAll('.win-range').forEach(function (e) {
  var r1 = e.querySelector('span.r1');
  var r2 = e.querySelector('span.r2');
  var r3 = e.querySelector('span.r3');
  var min = parseInt(e.getAttribute('data-min'));
  min = isNaN(min) ? 0 : min;
  var max = parseInt(e.getAttribute('data-max'));
  max = isNaN(max) ? 100 : max;
  var v = parseInt(e.getAttribute('data-value'));
  v = isNaN(v) ? 100 : v;
  r2.style.width = 'calc((100% - 8px) * ' + (v - min) / (max - min) + ')';
  r3.style.left = 'calc((100% - 8px) * ' + (v - min) / (max - min) + ')';
  r1.addEventListener('click', function (event) {
    var alw = r1.getBoundingClientRect().width;
    var clickw = event.offsetX - 4;
    clickw = clickw < 0 ? 0 : clickw > alw ? 100 : clickw;
    var percent = clickw / alw;
    r2.style.width = 'calc((100% - 8px) * ' + percent + ')';
    r3.style.left = 'calc((100% - 8px) * ' + percent + ')';
    e.setAttribute('data-value', (max - min) * percent + min);
    var fnt = e.getAttribute('data-change');
    if (fnt) eval(fnt + '({min:' + min + ',max:' + max + ',value:' + ((max - min) * percent + min) + '})')
  });
  r3.addEventListener('mousedown', function (event) {
    event.preventDefault();
    var alw = r1.getBoundingClientRect().width;
    var nx;
    var l = r1.getBoundingClientRect().left;
    document.onmousemove = function (event) {
      nx = event.pageX - l;
      nx = nx < 0 ? 0 : nx > alw ? alw : nx;
      var percent = nx / alw;
      r2.style.width = 'calc((100% - 8px) * ' + percent + ')';
      r3.style.left = 'calc((100% - 8px) * ' + percent + ')';
      e.setAttribute('data-value', (max - min) * percent + min);
      event.preventDefault();
      var fnt = e.getAttribute('data-change');
      if (fnt) eval(fnt + '({min:' + min + ',max:' + max + ',value:' + ((max - min) * percent + min) + '})');
    }
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    }
  })
});
var s = document.createElement('style');
s.innerHTML = `
.win-range{
  position: relative;
  height:30px;
}
.win-range span{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
.win-range span.r1{
  z-index: 1;
  width: calc(100% - 8px);
  margin-left:4px;
  height: 2px;
  background-color: #929292;
}
.win-range span.r2{
  z-index: 2;
  width: calc((100% - 8px) * 0.5);
  margin-left:4px;
  height: 2px;
  background-color: #09f;
  pointer-events: none;
}
.win-range span.r3{
  z-index: 3;
  width: 8px;
  height: 24px;
  border-radius: 6px;
  background-color: #09f;
  left: calc((100% - 8px) * 0.5);
}
.win-range:hover span.r3{
  background-color: #000;
}
.contextmenu{
    min-width: 200px;
    width: 250px;
    width: max-content;
    box-shadow:3.5px 3.5px 2px #5e5d5d;
    position: absolute;
    z-index: 99999990;
    background-color: rgb(233, 233, 233);
    display: none;
    padding: 5px 0px;
}
.contextmenu li{
    width:calc(100% - 10px);
    height: 24px;
    line-height: 24px;
    padding: 0 5px;
    list-style:none;
}
.contextmenu li:hover{
    background-color: #fff;
}
.contextmenu li .ui-icon{
    width: 24px;
    height: 24px;
    float: left;
    text-align: center;
}
.contextmenu li .ui-icon img{
    width: 16px;
    height: 16px;
    margin: 4px;
}
.contextmenu li .title{
    float: left;
    font-size: 14px;
}
.contextmenu li.group-item::after{
    content:">";
    float: right;
    line-height: 24px;
    font-size: 20px;
    font-weight: 300;
}
.contextmenu li.radio-item.active .ui-icon::after{
    content:'';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #000;
    display: block;
    margin: 9px;
}
.contextmenu li.check-item.active .ui-icon::after{
    content:'✓';
}`
document.head.append(s);
var ContextMenuId = null;
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  if (!window.jQuery) return false;
  document.querySelectorAll('.contextmenu').forEach(function (e) { e.style.display = "none" });
  if (ContextMenuId == null) return false;
  var $menu = document.querySelector('.contextmenu[name="' + ContextMenuId + '"]');
  $menu.removeAttribute('style');
  $menu.style.display = "block";
  var deskWidth = window.innerWidth;
  var deskHeight = window.innerHeight;
  var menuWidth = $menu.offsetWidth;
  var menuHeight = $menu.offsetHeight;
  var Iskright = e.pageX > deskWidth - menuWidth;
  var Iskbottom = e.pageY > deskHeight - menuHeight - 10;
  if (Iskright) {
    $menu.style.left = deskWidth - menuWidth + 'px';
  } else {
    $menu.style.left = e.pageX + 'px';
  };
  if (Iskbottom) {
    $menu.style.bottom = window.innerHeight - e.pageY + 'px';
  } else {
    $menu.style.top = e.pageY + 'px';
  }
  ContextMenuId = null;
  return false;
});
document.addEventListener('click', function () {
  document.querySelectorAll('.contextmenu').forEach(function (e) { e.style.display = "none" });
})
function g() {
  var __zmenu = false;
  document.querySelectorAll('.contextmenu li.group-item').forEach(function (ele) {
    ele.onmouseenter = function () {
      document.querySelectorAll('.contextmenu').forEach(function (e) { e.style.display = "none" });
      var parent = this.parentElement.parentElement;
      parent.style.display="block";
      var $menu = document.querySelector('.contextmenu[name="' + this.getAttribute('data-go') + '"]');
      $menu.removeAttribute('style');
      $menu.style.display = "block";
      var deskWidth = window.innerWidth;
      var deskHeight = window.innerHeight;
      var menuWidth = $menu.offsetWidth;
      var menuHeight = $menu.offsetHeight;
      var $pmenu = this;
      var pmenuWidth = $pmenu.offsetWidth;
      var pmenutop = $pmenu.getBoundingClientRect().top;
      var pmenuleft = $pmenu.getBoundingClientRect().left;
      if (deskWidth - pmenuleft - pmenuWidth < menuWidth) {
        $menu.style.left = pmenuleft - pmenuWidth - 6 + 'px';
      } else {
        $menu.style.left = pmenuleft + pmenuWidth + 2 + 'px';
      };
      if (deskHeight - pmenutop < menuHeight) {
        $menu.style.bottom = '0px';
      } else {
        $menu.style.top = pmenutop + 'px';
      }
      $menu.onmouseenter = function () {
        __zmenu = true;
      }
    };
    ele.onmouseleave = function () {
      var $menu = document.querySelector('.contextmenu[name="' + this.getAttribute('data-go') + '"]');
      if (__zmenu == false) {
        $menu.style.display='none';
      } else {
        __zmenu = false;
      }
    };
  })
  document.querySelectorAll('.contextmenu li.linkto-item').forEach(function(e){
    e.onclick=function () {
      window.open(this.getAttribute('data-go'));
    };
  })
  document.querySelectorAll('.contextmenu li.radio-item').forEach(function(e){
    var Qname = e.getAttribute('name');
    var Qauto = e.getAttribute('data-auto');
    if (Qauto == 'true') {
      document.querySelectorAll('.contextmenu li.radio-item[name="' + Qname + '"]').forEach(function(f){
        f.classList.remove('active');
      })
      e.classList.add('active');
    }
    e.onclick=function () {
      document.querySelectorAll('.contextmenu li.radio-item[name="' + Qname + '"]').forEach(function(f){
        f.classList.remove('active');
      })
      e.classList.add('active');
      if (typeof RadioClickFns[Qname] == 'function') {
        RadioClickFns[Qname](e.querySelector('.title').innerText);
      }
    }
  });
  document.querySelectorAll('.contextmenu li.check-item').forEach(function(e){
    var Qname = e.getAttribute('name');
    var Qauto = e.getAttribute('data-auto');
    if (Qauto == 'true') {
      e.classList.add('active');
    }
    e.onclick=function () {
      var _a = true;
      if (this.classList.contains('active')) {
        e.classList.remove('active');
        _a = false;
      } else {
        e.classList.add('active');
      }
      if (typeof CheckClickFns[Qname] == 'function') {
        CheckClickFns[Qname](_a);
      }
    }
  })
}
g();
var CheckClickFns = {};
var RadioClickFns = {};
