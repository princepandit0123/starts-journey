(function(){
  'use strict';
  const KEY='sj-saved-v1', THEME='sj-theme-v1';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const getSaved=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
  const setSaved=a=>localStorage.setItem(KEY,JSON.stringify(a.slice(0,100)));
  const slugFrom=a=>{try{return decodeURIComponent((a.getAttribute('href')||'').split('/article/')[1]||'')}catch(e){return''}};
  function addStyles(){
    if($('#sj-upgrade-style'))return;
    const s=document.createElement('style');s.id='sj-upgrade-style';
    s.textContent=`
      :root{--sj-accent:#d71920;--sj-panel:#fff;--sj-text:#111;--sj-muted:#6b6b6b}
      body.sj-dark{--sj-panel:#171717;--sj-text:#f5f5f5;--sj-muted:#aaa;background:#101010;color:var(--sj-text)}
      body.sj-dark header,body.sj-dark .story,body.sj-dark .card,body.sj-dark .trend,body.sj-dark .newsletter,body.sj-dark .submit,body.sj-dark .adbox,body.sj-dark .sj-hub,body.sj-dark .sj-day,body.sj-dark .sj-saved-panel{background:#171717!important;color:var(--sj-text);border-color:#333}
      body.sj-dark nav a,body.sj-dark .section a,body.sj-dark .card h3,body.sj-dark .story h3{color:var(--sj-text)}
      body.sj-dark .card p,body.sj-dark .meta,body.sj-dark .story .meta{color:#aaa}
      .sj-hub{max-width:1240px;margin:14px auto 0;padding:10px 20px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;background:var(--sj-panel);border:1px solid #ddd9d3}
      .sj-hub-title{font:800 10px "DM Sans",Arial;letter-spacing:1.2px;margin-right:auto}
      .sj-tool,.sj-filter{border:1px solid #ccc;background:transparent;color:inherit;padding:8px 11px;font:800 10px "DM Sans",Arial;cursor:pointer}
      .sj-tool:hover,.sj-filter:hover,.sj-filter.active{background:#111;color:#fff;border-color:#111}
      body.sj-dark .sj-tool:hover,body.sj-dark .sj-filter:hover,body.sj-dark .sj-filter.active{background:#fff;color:#111;border-color:#fff}
      .sj-day{max-width:1240px;margin:20px auto 0;padding:22px;border:1px solid #ddd9d3;background:var(--sj-panel)}
      .sj-day-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);gap:20px;align-items:center}
      .sj-day h2{font:800 30px "Playfair Display",Georgia,serif;margin:6px 0}
      .sj-day p{color:var(--sj-muted);line-height:1.55;font-size:13px}
      .sj-day a{display:inline-block;background:var(--sj-accent);color:#fff;text-decoration:none;padding:10px 14px;font:800 10px "DM Sans",Arial}
      .sj-day-img{height:220px;background-size:cover;background-position:center;border:1px solid #ddd}
      .sj-card-tools{display:flex;gap:7px;margin-top:10px;align-items:center}
      .sj-save,.sj-share{border:1px solid #ccc;background:transparent;color:inherit;padding:7px 9px;font:800 9px "DM Sans",Arial;cursor:pointer}
      .sj-save.saved{background:var(--sj-accent);border-color:var(--sj-accent);color:#fff}
      .sj-saved-panel{position:fixed;right:18px;top:86px;width:min(390px,calc(100vw - 36px));max-height:70vh;overflow:auto;background:#fff;color:#111;border:1px solid #ccc;box-shadow:0 18px 50px rgba(0,0,0,.25);z-index:120;display:none}
      .sj-saved-panel.open{display:block}
      .sj-saved-head{padding:14px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;font-weight:800}
      .sj-saved-item{display:flex;gap:10px;padding:12px;border-bottom:1px solid #eee;text-decoration:none;color:inherit}
      .sj-saved-item img{width:72px;height:52px;object-fit:cover;background:#eee}.sj-saved-item b{font:700 13px "Playfair Display",Georgia,serif}
      .sj-empty{padding:20px;color:#777;font-size:12px}
      .sj-top{position:fixed;right:18px;bottom:18px;width:40px;height:40px;border:0;background:#111;color:#fff;display:none;z-index:80;cursor:pointer}
      .sj-top.show{display:block}
      .sj-progress{position:fixed;left:0;top:0;height:3px;background:var(--sj-accent);width:0;z-index:200}
      body.sj-reading{background:#f4f1ea!important}
      body.sj-reading #article{max-width:760px!important;background:#fff;padding:45px 55px;box-shadow:0 8px 30px rgba(0,0,0,.08)}
      body.sj-reading nav,body.sj-reading .top,body.sj-reading footer{display:none!important}
      .sj-reading-btn{position:fixed;right:18px;top:18px;z-index:130}
      @media(max-width:700px){.sj-hub{margin-top:10px}.sj-day{margin:14px 12px 0}.sj-day-grid{grid-template-columns:1fr}.sj-day-img{height:190px}.sj-hub{padding:10px 12px}.sj-hub-title{width:100%}body.sj-reading #article{padding:24px 18px}}
    `;
    document.head.appendChild(s);
  }
  function theme(){
    const dark=localStorage.getItem(THEME)==='dark';
    document.body.classList.toggle('sj-dark',dark);
  }
  function addHub(){
    if($('.sj-hub')||!$('header'))return;
    const nav=$('header');
    const hub=document.createElement('div');hub.className='sj-hub';
    hub.innerHTML='<span class="sj-hub-title">JOURNEY TOOLS</span><button class="sj-tool" data-sj="saved">SAVED <span id="sjSavedCount">0</span></button><button class="sj-tool" data-sj="theme">DARK MODE</button><button class="sj-filter active" data-cat="ALL">ALL</button><button class="sj-filter" data-cat="MOVIES">MOVIES</button><button class="sj-filter" data-cat="OTT">OTT</button><button class="sj-filter" data-cat="CELEBRITIES">CELEBRITIES</button><button class="sj-filter" data-cat="CREATORS">CREATORS</button>';
    nav.insertAdjacentElement('afterend',hub);
    $$('.sj-filter',hub).forEach(b=>b.addEventListener('click',()=>{ $$('.sj-filter',hub).forEach(x=>x.classList.remove('active'));b.classList.add('active');filterCards(b.dataset.cat); }));
    $('[data-sj="theme"]',hub).addEventListener('click',()=>{document.body.classList.toggle('sj-dark');localStorage.setItem(THEME,document.body.classList.contains('sj-dark')?'dark':'light');});
    $('[data-sj="saved"]',hub).addEventListener('click',toggleSaved);
    updateSavedCount();
  }
  function filterCards(cat){
    const cards=$$('#newsGrid .card,#newsGrid article,.grid#newsGrid > *');
    if(!cards.length)return;
    cards.forEach(c=>{const t=(c.innerText||'').toUpperCase();c.style.display=(cat==='ALL'||t.includes(cat))?'':'none';});
  }
  function addDay(){
    if($('.sj-day')||!$('#newsGrid'))return;
    const day=document.createElement('section');day.className='sj-day';day.id='journeyOfDay';
    day.innerHTML='<div class="sj-day-grid"><div><div class="cat">SPECIAL FEATURE · JOURNEY OF THE DAY</div><h2>One story worth taking with you today.</h2><p id="sjDayText">Loading a story from the latest editorial feed…</p><a id="sjDayLink" href="#latest">OPEN STORY →</a></div><div class="sj-day-img" id="sjDayImg"></div></div>';
    const latest=$('#latest'); if(latest)latest.parentNode.insertBefore(day,latest.nextElementSibling||latest.nextSibling);
    observeFeed();
  }
  function observeFeed(){
    const grid=$('#newsGrid');if(!grid)return;
    const paint=()=>{
      const link=$('#newsGrid a[href*="/article/"]');if(!link)return;
      const card=link.closest('article,.card')||link;
      const title=(card.querySelector('h3,h2')||{}).textContent||link.textContent||'Latest story';
      const img=card.querySelector('img,.pic,.thumb');
      let src=img?.src||'';if(!src&&img?.style?.backgroundImage){const m=img.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);src=m?m[1]:''}
      $('#sjDayText').textContent=title+' — selected automatically from the latest stories currently available on STARTS JOURNEY.';
      $('#sjDayLink').href=link.href;
      $('#sjDayImg').style.backgroundImage=src?'url("'+src.replace(/"/g,'\\\"')+'")':'';
      decorateCards();
    };
    new MutationObserver(paint).observe(grid,{childList:true,subtree:true});paint();
  }
  function decorateCards(){
    $$('#newsGrid a[href*="/article/"]').forEach(link=>{
      const card=link.closest('article,.card');if(!card||card.dataset.sjDecorated)return;
      card.dataset.sjDecorated='1';
      const slug=slugFrom(link);if(!slug)return;
      const tools=document.createElement('div');tools.className='sj-card-tools';
      tools.innerHTML='<button class="sj-save" type="button">SAVE</button><button class="sj-share" type="button">SHARE</button>';
      const body=card.querySelector('.cardbody')||card;
      body.appendChild(tools);
      const btn=$('.sj-save',tools), share=$('.sj-share',tools);
      const saved=getSaved().some(x=>x.id===slug);btn.classList.toggle('saved',saved);btn.textContent=saved?'SAVED':'SAVE';
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleSave({id:slug,title:(card.querySelector('h3')||{}).textContent||link.textContent,image:card.querySelector('img')?.src||'',url:link.href});});
      share.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();const data={title:(card.querySelector('h3')||{}).textContent||'STARTS JOURNEY',url:link.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);share.textContent='COPIED';setTimeout(()=>share.textContent='SHARE',1200)}}catch(err){}});
    });
    updateSavedCount();
  }
  function toggleSave(item){
    let a=getSaved(),i=a.findIndex(x=>x.id===item.id);
    if(i>=0)a.splice(i,1);else a.unshift(item);
    setSaved(a);updateSavedCount();decorateCards();renderSaved();
  }
  function updateSavedCount(){const c=$('#sjSavedCount');if(c)c.textContent=getSaved().length;}
  function panel(){
    let p=$('.sj-saved-panel');if(p)return p;
    p=document.createElement('aside');p.className='sj-saved-panel';p.innerHTML='<div class="sj-saved-head"><span>Saved Stories</span><button id="sjCloseSaved" class="sj-tool">CLOSE</button></div><div id="sjSavedList"></div>';document.body.appendChild(p);
    $('#sjCloseSaved').addEventListener('click',()=>p.classList.remove('open'));return p;
  }
  function renderSaved(){
    const p=panel(),list=$('#sjSavedList',p),a=getSaved();
    list.innerHTML=a.length?a.map(x=>'<a class="sj-saved-item" href="'+esc(x.url||('/article/'+encodeURIComponent(x.id)))+'"><img src="'+esc(x.image||'')+'" alt=""><span><b>'+esc(x.title)+'</b></span></a>').join(''):'<div class="sj-empty">No saved stories yet. Use SAVE on any story card.</div>';
  }
  function toggleSaved(){const p=panel();renderSaved();p.classList.toggle('open');}
  function articleMode(){
    const article=$('#article');if(!article)return;
    const progress=document.createElement('div');progress.className='sj-progress';document.body.appendChild(progress);
    const b=document.createElement('button');b.className='sj-tool sj-reading-btn';b.textContent='READING MODE';b.addEventListener('click',()=>{document.body.classList.toggle('sj-reading');b.textContent=document.body.classList.contains('sj-reading')?'NORMAL MODE':'READING MODE'});document.body.appendChild(b);
    const share=document.createElement('button');share.className='sj-tool sj-reading-btn';share.style.top='56px';share.textContent='SHARE';share.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);share.textContent='COPIED';setTimeout(()=>share.textContent='SHARE',1200)}}catch(e){}});document.body.appendChild(share);
    const update=()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h>0?(scrollY/h)*100:0)+'%'};addEventListener('scroll',update,{passive:true});update();
  }
  function backTop(){const b=document.createElement('button');b.className='sj-top';b.textContent='↑';b.title='Back to top';document.body.appendChild(b);addEventListener('scroll',()=>b.classList.toggle('show',scrollY>600),{passive:true});b.onclick=()=>scrollTo({top:0,behavior:'smooth'});}
  function init(){addStyles();theme();addHub();addDay();backTop();if($('#article'))articleMode();setTimeout(decorateCards,700);setTimeout(decorateCards,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();