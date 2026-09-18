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
      else if(a.subjectName==='Ashish Yadav'){body='<div class="body"><p class="dropcap">'+esc(a.description)+'</p><p>Every creator journey has a beginning, and Ashish Yadav’s story starts in Jhansi with a simple idea: make something, learn from it and keep improving. Before polished shoots and carefully planned visual stories became part of the picture, an Oppo A15s served as an early creative tool. That starting point matters because it reflects a familiar path for young creators — working with the equipment available, learning through practice and gradually discovering a visual language of their own.</p><p>What followed was not an overnight transformation, but a steady process of experimentation. Photography, fashion, travel and everyday lifestyle moments became opportunities to understand framing, lighting, styling and presentation. With each new post, the focus moved beyond simply sharing a photograph toward creating a consistent identity that viewers could recognize.</p><h2>From a smartphone to a personal visual identity</h2><p>The most interesting part of a digital creator’s growth is often the period when ordinary moments begin to look intentional. A smartphone can be the camera, but the story comes from the person behind it — where they choose to shoot, how they dress, how they use natural light and what mood they want a frame to communicate.</p><p>For Ashish, that visual identity developed around a combination of fashion-led portraits, travel settings and lifestyle photography. The locations changed, the outfits changed and the mood changed, but the underlying idea remained consistent: present a version of everyday life with a clear sense of style. This helped turn individual photographs into pieces of a larger personal story.</p><h2>Building an audience through consistency</h2><p>Growing an audience on social platforms is usually a long-term process. One photograph may attract attention, but sustained visibility depends on continuing to create, publish and improve. Consistency also gives a creator room to experiment — to understand which subjects feel natural, which visual treatments work best and how an audience responds to different kinds of storytelling.</p><p>Ashish’s journey reflects that evolution. The reported audience of 400K+ represents the scale his digital presence has reached, while the content itself shows an ongoing effort to develop a recognizable style. Instead of relying on a single theme, the profile brings together several connected interests, allowing fashion, lifestyle and travel to support one another.</p><h2>Fashion as part of the story</h2><p>Fashion is more than clothing in a creator’s visual identity. Colour, silhouette, accessories and the setting around an outfit can all change the feeling of a photograph. Ashish’s portraits often use this relationship between styling and environment to create a clean, contemporary presentation.</p><p>Whether the frame is indoors, outdoors or during a trip, the emphasis remains on presentation. Sunglasses, watches, shirts, relaxed silhouettes and carefully chosen locations become small details that help communicate personality without needing a long explanation. The result is a style of content where the photograph itself carries much of the narrative.</p><h2>Travel, lifestyle and the value of a strong setting</h2><p>Travel adds another dimension to the story because a new location immediately changes the atmosphere of a frame. Mountains, resorts, open landscapes and unfamiliar surroundings provide a visual backdrop that can make a personal photograph feel like part of a larger experience. For a lifestyle creator, these settings also create opportunities to combine personal moments with destination storytelling.</p><p>The same principle works with everyday lifestyle content. A pool table, a hotel corridor, a quiet outdoor space or a carefully lit indoor portrait can each tell a different part of the story. What connects them is not the location itself, but the creator’s perspective and the consistency of the presentation.</p><h2>Creating a recognizable digital presence</h2><p>A strong personal brand is built from repeated signals. The way a creator dresses, frames photographs, chooses locations and writes captions gradually becomes recognizable. Over time, these choices can make a profile feel less like a random collection of posts and more like a coherent visual journal.</p><p>That is where Ashish’s journey becomes relevant beyond any single photograph. Starting with accessible technology and developing through repeated experimentation, the process demonstrates how a creator can use digital platforms to document interests while simultaneously building a public identity. The equipment may change, the locations may become more ambitious and the production quality may improve, but the foundation remains creativity and consistency.</p><h2>From Jhansi to a wider digital audience</h2><p>For a young creator from Jhansi, the journey also reflects the wider reach of today’s internet. A photograph made in one city can be discovered by viewers far beyond it. Social platforms remove many of the geographic limits that once separated local talent from larger audiences, giving creators an opportunity to build communities around their interests.</p><p>Ashish’s story can therefore be read as a progression rather than a single milestone: beginning with a smartphone, learning the language of visual content, exploring fashion and lifestyle, travelling to new settings and continuing to refine the way those experiences are presented. The audience growth is one measurable part of that journey; the evolving identity behind the content is another.</p><h2>What comes next</h2><p>The next chapter of a creator’s journey is often shaped by the same habits that built the earlier ones — curiosity, consistency and a willingness to experiment. New formats, collaborations, destinations and visual ideas can all expand the story while keeping its central personality intact.</p><p>From an Oppo A15s in Jhansi to a growing digital audience, Ashish Yadav’s journey is ultimately a story about turning available tools into creative opportunities. It shows how personal style can become a visual language, how everyday experiences can become content and how consistency can gradually shape a recognizable presence online.</p><div class="quote">“A creator’s identity is built frame by frame — through the places they explore, the style they bring and the stories they choose to share.”</div></div>';}
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