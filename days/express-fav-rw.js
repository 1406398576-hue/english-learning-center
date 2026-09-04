/* Lulu Lab · 阅读 / 口语 单条表达收藏（内容页内独立逻辑，与父页面「我的表达」共享同域 localStorage）
 * 收藏对象：单条 Expression（不是整篇文章）
 * 数据流：阅读/口语表达 → 用户收藏(EXPR_STORE) → 我的表达
 */
(function(){
  var EXPR_KEY = 'speakeasy_expr_v1';
  function load(){ try { return JSON.parse(localStorage.getItem(EXPR_KEY) || '{}') || {}; } catch(e){ return {}; } }
  function save(o){ try { localStorage.setItem(EXPR_KEY, JSON.stringify(o)); } catch(e){} }

  var CFG = window.LULU_FAV || {};
  var track = CFG.track || '';
  var date  = CFG.date  || '';
  function keyOf(en){ return track + '::' + date + '::' + en; }

  function toast(msg){
    var t = document.createElement('div');
    t.className = 'fav-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 320); }, 1800);
  }

  function render(){
    var btns = document.querySelectorAll('.expr-fav');
    if(!btns.length) return;
    var store = load();
    btns.forEach(function(btn){
      var en = (btn.getAttribute('data-en') || '').trim();
      if(!en) return;
      var key = keyOf(en);
      var d = store[key];
      var on = !!(d && d.status);
      btn.textContent = on ? '★' : '☆';
      btn.classList.toggle('on', on);
      btn.onclick = function(e){
        e.stopPropagation(); e.preventDefault();
        var cur = load();
        if(cur[key] && cur[key].status){
          delete cur[key];
          btn.textContent = '☆'; btn.classList.remove('on');
          toast('已取消收藏');
        } else {
          cur[key] = {
            status: 'collected',
            collectedAt: new Date().toISOString(),
            en: en,
            zh: (btn.getAttribute('data-zh') || ''),
            example: (btn.getAttribute('data-example') || ''),
            scene: (btn.getAttribute('data-scene') || ''),
            title: (CFG.title || ''),
            track: track,
            date: date,
            source_type: track
          };
          btn.textContent = '★'; btn.classList.add('on');
          toast('已加入我的表达');
        }
        save(cur);
      };
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
