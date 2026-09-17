const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const file = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    const patch = `
<script id="sj-resilient-fix">
(function(){
  const css = document.createElement('style');
  css.textContent = '.sj-results{max-width:1240px;margin:18px auto;padding:0 20px}.sj-results-inner{background:#fff;border:1px solid #ddd9d3;padding:18px}.sj-results h2{font-family:Playfair Display,serif;margin:0 0 14px}.sj-result{display:flex;gap:14px;padding:12px 0;border-top:1px solid #eee;text-decoration:none;color:#111}.sj-result img{width:110px;height:75px;object-fit:cover;background:#eee}.sj-result h3{margin:0 0 5px;font-family:Playfair Display,serif;font-size:19px}.sj-result p{margin:0;color:#666;font-size:12px}.sj-live{max-width:1240px;margin:0 auto;padding:0 20px}.sj-live-inner{background:#111;color:#fff;padding:14px 18px}.sj-live-title{font-size:11px;font-weight:800;letter-spacing:1px;color:#fff}.sj-live-row{display:flex;gap:16px;overflow:auto;margin-top:10px}.sj-live-card{min-width:230px;color:#fff;text-decoration:none}.sj-live-card img{width:100%;height:105px;object-fit:cover;background:#222}.sj-live-card b{display:block;font-family:Playfair Display,serif;font-size:15px;margin-top:6px}.sj-live-card small{color:#aaa}';
  document.head.appendChild(css);
  let resultsBox, liveBox;
  function ensureBoxes(){
    const main=document.querySelector('main');
    if(!main)return;
    if(!resultsBox){resultsBox=document.createElement('div');resultsBox.className='sj-results';resultsBox.style.display='none';main.parentNode.insertBefore(resultsBox,main);}
    if(!liveBox){liveBox=document.createElement('div');liveBox.className='sj-live';main.parentNode.insertBefore(liveBox,main);}
  }
  function esc(s){return String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}
  function img(a){return a.image||a.subjectImage||'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=80';}
  async function getData(){
    const r=await fetch('/api/content?fix='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return r.json();
  }
  async function doSearch(q){
    ensureBoxes();
    q=(q||'').trim().toLowerCase();
    if(!q){resultsBox.style.display='none';return;}
    try{
      const d=await getData();
      const list=(d.articles||[]).filter(a=>`${a.title||''} ${a.description||''} ${a.category||''} ${a.source||''} ${a.subjectName||''} ${(a.tags||[]).join(' ')}`.toLowerCase().includes(q));
      resultsBox.style.display='block';
      resultsBox.innerHTML='<div class="sj-results-inner"><h2>'+esc(list.length?('Search results for “'+q+'”'):'No stories found')+'</h2>'+ (list.length?list.slice(0,20).map(a=>'<a class="sj-result" href="/article/'+encodeURIComponent(a.id||'live-news')+'"><img src="'+esc(img(a))+'" onerror="this.style.visibility=\'hidden\'"><div><h3>'+esc(a.title)+'</h3><p>'+esc(a.description||a.category||'STARTS JOURNEY')+'</p></div></a>').join(''):'<p>Try another name, category or keyword.</p>')+'</div>';
    }catch(e){resultsBox.style.display='block';resultsBox.innerHTML='<div class="sj-results-inner"><h2>Search temporarily unavailable</h2><p>Please try again in a moment.</p></div>';}
  }
  async function refreshLive(){
    ensureBoxes();
    try{
      const d=await getData();
      const live=(d.articles||[]).filter(a=>a.live).slice(0,8);
      liveBox.innerHTML='<div class="sj-live-inner"><div class="sj-live-title">● LIVE NEWS · AUTO REFRESH EVERY 10 MINUTES</div><div class="sj-live-row">'+live.map(a=>'<a class="sj-live-card" href="/article/'+encodeURIComponent(a.id)+'"><img src="'+esc(img(a))+'"><b>'+esc(a.title)+'</b><small>'+esc(a.source||'Live Desk')+'</small></a>').join('')+'</div></div>';
    }catch(e){}
  }
  function bind(){
    ensureBoxes();
    const form=document.getElementById('searchForm'), input=document.getElementById('search');
    if(form && !form.dataset.resilient){
      form.dataset.resilient='1';
      form.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();doSearch(input?input.value:'');},true);
    }
    if(input && !input.dataset.resilient){
      input.dataset.resilient='1';
      input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();doSearch(input.value);}},true);
    }
    const q=new URLSearchParams(location.search).get('q')||'';
    if(q && input){input.value=q;doSearch(q);}
    refreshLive();
    setInterval(refreshLive,600000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
</script>`;
    const html = file.replace('</body>', patch + '</body>');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('Homepage error');
  }
};
