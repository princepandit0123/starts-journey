const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const html = fs.readFileSync(path.join(process.cwd(), 'article.html'), 'utf8');
    const slug = String((req.query && req.query.slug) || '').replace(/'/g, "\'");
    const patch = `
<script id="sj-live-article-fix">
(function(){
  const wanted=${JSON.stringify(slug)};
  const RAW="https://raw.githubusercontent.com/princepandit0123/starts-journey/main";
  const media=s=>{s=String(s||'');return s.startsWith('/uploads/')?RAW+s:s;};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function getList(){
    try{const r=await fetch('/api/content?articleFix='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d.articles)&&d.articles.length)return d.articles;}}catch(e){}
    try{const r=await fetch('/data/news.json?articleFix='+Date.now(),{cache:'no-store'});if(r.ok){const d=await r.json();if(Array.isArray(d))return d;}}catch(e){}
    return [];
  }
  function resolve(list){
    let a=list.find(x=>String(x.id)===wanted);if(a)return a;
    if(wanted==='ashish-yadav-jhansi-luxury-digital-life')return list.find(x=>x.subjectName==='Ashish Yadav');
    const m=wanted.match(/^live-news-(\d+)-(\d+)$/);
    if(m){
      const live=list.filter(x=>x&&x.live);const idx=Number(m[1]);
      if(live[idx])return live[idx];
      const target=Number(m[2]);let best=null,bestDiff=Infinity;
      for(const x of live){const t=Date.parse(x.publishedAt||x.updatedAt||'');if(Number.isFinite(t)){const d=Math.abs(Math.floor(t/1000)-target);if(d<bestDiff){bestDiff=d;best=x;}}}
      if(best&&bestDiff<86400)return best;
    }
    if(wanted.indexOf('live-')===0){const m=wanted.match(/-(\d+)$/);const idx=m?Number(m[1]):-1;if(idx>=0)return list.filter(x=>x&&x.live)[idx]||null;}
    return null;
  }
  async function run(){
    try{
      const list=await getList();const a=resolve(list);
      if(!a){document.title='Story not found — STARTS JOURNEY';return;}
      const main=document.getElementById('article');if(!main)return;
      const gallery=Array.isArray(a.gallery)?a.gallery:[];
      const source=a.sourceUrl?'<a href="'+esc(a.sourceUrl)+'" target="_blank" rel="noopener">'+esc(a.source||'Source')+'</a>':esc(a.source||'STARTS JOURNEY');
      const hero=media(a.image||a.subjectImage||'');
      let body='';
      if(a.live){body='<div class="body"><p class="dropcap">'+esc(a.description||'This story is part of the live entertainment desk at STARTS JOURNEY.')+'</p><p>Published from the live news feed. Follow the original source for the latest reporting and context.</p></div>';}
      else if(a.subjectName==='Ashish Yadav'){body='<div class="body"><p class="dropcap">'+esc(a.description)+'</p><h2>From Jhansi to a digital-first creative journey</h2><p>Every creator story starts somewhere. For Ashish, the journey began in Jhansi with a simple smartphone and a willingness to experiment. An Oppo A15s became an early creative tool — a reminder that storytelling often starts with curiosity and consistency rather than expensive equipment.</p><p>Over time, the focus moved from simply making content to developing a recognizable visual identity. Fashion, lifestyle and travel became natural parts of that identity, giving each post a sense of personality and place.</p><h2>Turning everyday moments into visual stories</h2><p>A strong social presence is built one moment at a time. Outfits, travel frames, casual photographs and lifestyle details can look ordinary on their own, but thoughtful composition and consistency can turn them into a coherent story.</p><p>Ashish’s content journey reflects that approach: use the setting, styling and mood to make a photograph feel personal. The result is a feed designed around visual recall — the kind of presentation that helps an audience recognize a creator before even reading the name.</p><h2>Building an audience through consistency</h2><p>The growth of a creator is rarely about one post alone. It comes from repeatedly showing up, learning what connects with viewers and refining the presentation over time. For Ashish, that process has included experimenting with fashion-led visuals, lifestyle moments and travel-oriented storytelling.</p><p>That consistency is also part of the larger creator economy. Smartphones and social platforms have lowered the barrier to publishing, while personal style and storytelling have become important ways for creators to distinguish themselves in a crowded digital space.</p><h2>Fashion, lifestyle and travel</h2><p>Fashion gives the visual identity structure; lifestyle adds personality; travel adds new environments and experiences. Together, the three themes create a broader canvas for storytelling.</p><p>Rather than treating every photograph as a standalone post, a creator can use these themes to build a recognizable world around the content. That balance between polished presentation and candid moments is what gives a lifestyle profile its human feel.</p><h2>What the journey represents</h2><p>Ashish’s story is ultimately about progression: starting with accessible technology, learning through practice and gradually shaping a personal brand around interests that feel authentic. The numbers may describe reach, but the more lasting part of a creator journey is the identity built along the way.</p><p>From Jhansi to a wider digital audience, the story shows how consistency, visual storytelling and a clear point of view can turn everyday creativity into a meaningful online presence.</p><div class="quote">“The most memorable creator stories are built not only around where someone is going, but around the style and perspective they bring to every frame.”</div></div>';}
      main.innerHTML='<div class="cat">'+esc(a.category||'ENTERTAINMENT')+'</div><h1>'+esc(a.title)+'</h1><div class="dek">'+esc(a.description||'')+'</div><div class="byline"><img class="avatar" src="'+hero+'" onerror="this.style.display=\'none\'"><div class="bylineText"><strong>'+esc(a.author||'STARTS JOURNEY Editorial')+'</strong><br>'+esc(a.readTime||'3 min read')+'</div></div><img class="hero" src="'+hero+'" onerror="this.style.display=\'none\'"><div class="caption">Image / story reference: '+source+'</div>'+body+(gallery.length?'<div class="photoGallery">'+gallery.map(g=>'<figure><img src="'+media(g.image||g.url||'')+'" loading="lazy" onerror="this.closest(\'figure\').style.display=\'none\'"><figcaption>'+esc(g.caption||'STARTS JOURNEY photo gallery')+'</figcaption></figure>').join('')+'</div>':'')+'<div class="source">Source: '+source+'</div><div class="tagsWrap">'+(a.tags||[]).map(t=>'<a class="tagChip" href="/?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>').join('')+'</div>';
      document.title=a.title+' — STARTS JOURNEY';
      const ct=document.getElementById('crumbTitle'),cc=document.getElementById('crumbCat');if(ct)ct.textContent=a.title;if(cc)cc.textContent=a.category||'Entertainment';
    }catch(e){console.error(e);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else setTimeout(run,50);
})();
</script>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return res.status(200).send(html.replace('</body>',patch+'</body>'));
  } catch(e) { return res.status(500).send('Article error: '+e.message); }
};