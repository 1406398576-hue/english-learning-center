(function(){
  'use strict';

  function loadScript(src, cb){
    if(document.querySelector('script[src="' + src + '"]')){ if(cb) cb(); return; }
    var s = document.createElement('script');
    s.src = src;
    s.onload = function(){ if(cb) cb(); };
    s.onerror = function(){ console.error('[export-chunk] failed to load', src); };
    document.head.appendChild(s);
  }

  function ensureLibs(cb){
    var h2c = typeof html2canvas !== 'undefined';
    var jspdfReady = typeof jspdf !== 'undefined' && jspdf.jsPDF;
    if(h2c && jspdfReady){ cb(); return; }
    if(!h2c){
      loadScript('../libs/html2canvas.min.js', function(){ ensureLibs(cb); });
      return;
    }
    if(!jspdfReady){
      loadScript('../libs/jspdf.umd.min.js', function(){ ensureLibs(cb); });
      return;
    }
    cb();
  }

  function sanitizeName(s){
    return s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '').substring(0,40) || 'chunk';
  }

  function captureChunk(chunk){
    var btns = chunk.querySelector('.chunk-export');
    if(btns) btns.style.display = 'none';
    return html2canvas(chunk, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false }).then(function(canvas){
      if(btns) btns.style.display = '';
      return canvas;
    });
  }

  function downloadPNG(chunk){
    var phrase = (chunk.querySelector('.phrase') && chunk.querySelector('.phrase').textContent.trim()) || 'chunk';
    captureChunk(chunk).then(function(canvas){
      var link = document.createElement('a');
      link.download = 'drama-' + sanitizeName(phrase) + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  function downloadPDF(chunk){
    var phrase = (chunk.querySelector('.phrase') && chunk.querySelector('.phrase').textContent.trim()) || 'chunk';
    captureChunk(chunk).then(function(canvas){
      var imgData = canvas.toDataURL('image/png');
      var pdf = new jspdf.jsPDF('p', 'mm', 'a4');
      var pageW = 210, margin = 10;
      var imgW = pageW - margin * 2;
      var imgH = canvas.height * imgW / canvas.width;
      pdf.addImage(imgData, 'PNG', margin, margin, imgW, imgH);
      pdf.save('drama-' + sanitizeName(phrase) + '.pdf');
    });
  }

  function init(){
    document.querySelectorAll('.chunk').forEach(function(chunk){
      var bar = document.createElement('div');
      bar.className = 'chunk-export';
      bar.innerHTML = '<button type="button" data-fmt="png">PNG</button><button type="button" data-fmt="pdf">PDF</button>';
      chunk.appendChild(bar);
      bar.querySelector('[data-fmt="png"]').addEventListener('click', function(e){ e.stopPropagation(); downloadPNG(chunk); });
      bar.querySelector('[data-fmt="pdf"]').addEventListener('click', function(e){ e.stopPropagation(); downloadPDF(chunk); });
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ ensureLibs(init); });
  } else {
    ensureLibs(init);
  }
})();
