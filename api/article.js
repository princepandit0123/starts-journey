const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const html = fs.readFileSync(path.join(process.cwd(), 'article.html'), 'utf8');
    const slug = String((req.query && req.query.slug) || '').replace(/'/g, "\\'");
    const patch = `
<script id="sj-live-article-fix">
(function(){
  const wanted=${JSON.stringify(slug)};
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  async function getList(){
    try{const r=await fetch('/api/content?articleFix='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d.articles)&&d.articles.length)return d.articles;}}catch(e){}
    try{const r=await fetch('/data/news.json?articleFix='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d))return d;}}catch(e){}
    return [];
  }
  function resolve(list){
    let a=list.find(x=>String(x.id)===wanted);if(a)return a;
    if(wanted==='ashish-yadav-jhansi-luxury-digital-life')return list.find(x=>x.subjectName==='Ashish Yadav');
    const m=wanted.match(/^live-news-(\\d+)-(\\d+)$/);
    if(m){
      const live=list.filter(x=>x&&x.live);const idx=Number(m[1]);
      if(live[idx])return live[idx];
      const target=Number(m[2]);
      let best=null,bestDiff=Infinity;
      for(const x of live){const t=Date.parse(x.publishedAt||x.updatedAt||'');if(Number.isFinite(t)){const d=Math.abs(Math.floor(t/1000)-target);if(d<bestDiff){bestDiff=d;best=x;}}}
      if(best&&bestDiff<86400)return best;
    }
    if(wanted.indexOf('live-')===0){const m=wanted.match(/-(\\d+)$/);const idx=m?Number(m[1]):-1;if(idx>=0)return list.filter(x=>x&&x.live)[idx]||null;}
    return null;
  }
  async function run(){
    try{
      const list=await getList();const a=resolve(list);
      if(!a){document.title='Story not found — STARTS JOURNEY';return;}
      const main=document.getElementById('article');if(!main)return;
      const gallery=Array.isArray(a.gallery)?a.gallery:[];
      const source=a.sourceUrl?'<a href="'+esc(a.sourceUrl)+'" target="_blank" rel="noopener">'+esc(a.source||'Source')+'</a>':esc(a.source||'STARTS JOURNEY');
      let body='';
      if(a.live){body='<div class="body"><p class="dropcap">'+esc(a.description||'This story is part of the live entertainment desk at STARTS JOURNEY.')+'</p><p>Published from the live news feed. Follow the original source for the latest reporting and context.</p></div>';}
      else if(a.subjectName==='Ashish Yadav'){body='<div class="body"><p class="dropcap">'+esc(a.description)+'</p><h2>From Jhansi to a digital-first creative journey</h2><p>A student from Jhansi began with an Oppo A15s as a first creative tool and gradually built a distinct identity around fashion, lifestyle and travel.</p><h2>Building an audience through consistency</h2><p>The journey reflects how creators can use accessible technology, social platforms and consistent storytelling to develop an audience and a recognizable personal brand.</p><h2>Fashion, lifestyle and travel</h2><p>As the audience grew, the content expanded across fashion, lifestyle and travel, creating a broader digital identity around the creator.</p></div>';}
      main.innerHTML='<div class="cat">'+esc(a.category||'ENTERTAINMENT')+'</div><h1>'+esc(a.title)+'</h1><div class="dek">'+esc(a.description||'')+'</div><div class="byline"><img class="avatar" src="'+esc(a.image||'')+'" onerror="this.style.visibility=\'hidden\'"><div class="bylineText"><strong>'+esc(a.author||'STARTS JOURNEY Editorial')+'</strong><br>'+esc(a.readTime||'3 min read')+'</div></div><img class="hero" src="'+esc(a.image||'')+'" onerror="this.style.visibility=\'hidden\'"><div class="caption">Image / story reference: '+source+'</div>'+body+(gallery.length?'<div class="photoGallery">'+gallery.map(g=>'<figure><img src="'+esc(g.image||g.url||'')+'" loading="lazy"><figcaption>'+esc(g.caption||'STARTS JOURNEY photo gallery')+'</figcaption></figure>').join('')+'</div>':'')+'<div class="source">Source: '+source+'</div><div class="tagsWrap">'+(a.tags||[]).map(t=>'<a class="tagChip" href="/?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>').join('')+'</div>';
      document.title=a.title+' — STARTS JOURNEY';
      const ct=document.getElementById('crumbTitle'),cc=document.getElementById('crumbCat');if(ct)ct.textContent=a.title;if(cc)cc.textContent=a.category||'Entertainment';
    }catch(e){console.error(e);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else setTimeout(run,50);
})();
</script>`;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    return res.status(200).send(html.replace('</body>',patch+'</body>'));
  } catch(e) { return res.status(500).send('Article error: '+e.message); }
};