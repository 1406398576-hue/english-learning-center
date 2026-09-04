/* Lulu Lab · 影视表达单条收藏（内容页内独立逻辑，与父页面「我的表达」共享同域 localStorage） */
(function(){
  var KEY = 'lulu_drama_fav_v1';
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ return {}; } }
  function save(o){ try { localStorage.setItem(KEY, JSON.stringify(o)); } catch(e){} }

  function seriesEp(){
    var h = document.querySelector('h1');
    if(!h) return {series:'', episode:''};
    var t = h.textContent;
    var m = t.match(/《([^》]+)》\s*([Ss]\d+[Ee]\d+)/);
    if(m) return {series:'《'+m[1]+'》', episode: m[2].toUpperCase()};
    var parts = t.split('·');
    return {series: (parts[0]||t).trim(), episode: ''};
  }

  function fields(chunk){
    var ph = chunk.querySelector('.phrase');
    var phrase = ph ? ph.textContent.trim() : '';
    var who = chunk.querySelector('.who-line');
    var scene = who ? who.textContent.trim() : '';
    var quote = '', meaning = '';
    var flds = chunk.querySelectorAll('.field');
    for(var i=0;i<flds.length;i++){
      var f = flds[i];
      var ft = f.textContent;
      if(ft.indexOf('原剧台词') >= 0){
        var it = f.querySelector('i');
        if(it) quote = it.textContent.trim();
      }
      if(ft.indexOf('字面翻译') >= 0){
        var m2 = ft.match(/翻译：\s*([\s\S]+)$/);
        meaning = m2 ? m2[1].trim() : ft.replace(/^[\s\S]*?：/, '').trim();
      }
    }
    var se = seriesEp();
    return {phrase:phrase, scene:scene, quote:quote, meaning:meaning, series:se.series, episode:se.episode};
  }

  function ukey(f){ return 'drama::' + f.series + '::' + f.phrase; }

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
    btns.forEach(function(btn){
      var chunk = btn.closest('.chunk');
      if(!chunk) return;
      var f = fields(chunk);
      var key = ukey(f);
      var d = load();
      var on = !!d[key];
      btn.textContent = on ? '★' : '☆';
      btn.classList.toggle('on', on);
      btn.onclick = function(e){
        e.stopPropagation(); e.preventDefault();
        var cur = load();
        if(cur[key]){
          delete cur[key];
          btn.textContent = '☆'; btn.classList.remove('on');
          toast('已取消收藏');
        } else {
          var entry = {
            expression: f.phrase,
            meaning: f.meaning,
            original_sentence: f.quote,
            series: f.series,
            episode: f.episode,
            scene: f.scene,
            source_type: 'drama',
            source_title: (f.series + ' ' + f.episode).trim(),
            status: 'collected',
            priority: 'normal',
            collectedAt: new Date().toISOString()
          };
          cur[key] = entry;
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
