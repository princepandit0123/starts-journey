const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const html = fs.readFileSync(path.join(process.cwd(), 'article.html'), 'utf8');
    const slug = String((req.query && req.query.slug) || '').replace(/'/g, "\'");
    const patch = `
<script src="/assets/journey-upgrade.js"></script>
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
      const list=await getList();let a=resolve(list);
      // Keep the Ashish feature article independent of the live-feed/API cache.
      // This guarantees the exact article URL renders even if /api/content is stale.
      if(!a && wanted==='ashish-yadav-jhansi-luxury-digital-life'){
        a={
          id:wanted,
          subjectName:'Ashish Yadav',
          title:'From Jhansi to a Luxury-Led Digital Life: The Story of Ashish Yadav',
          description:'How a student from Jhansi turned an Oppo A15s into his first creative tool, built an audience of 400K+, and carved out a distinct identity through fashion, lifestyle and travel.',
          category:'LIFESTYLE · CREATOR',
          author:'STARTS JOURNEY Editorial',
          readTime:'8 min read',
          image:'/uploads/ashish-yadav-photo-9.jpg',
          tags:['Ashish Yadav','Jhansi','Creator','Fashion','Lifestyle','Travel']
        };
      }
      if(!a){document.title='Story not found — STARTS JOURNEY';return;}
      const main=document.getElementById('article');if(!main)return;
      const gallery=Array.isArray(a.gallery)?a.gallery:[];
      const source=a.sourceUrl?'<a href="'+esc(a.sourceUrl)+'" target="_blank" rel="noopener">'+esc(a.source||'Source')+'</a>':esc(a.source||'STARTS JOURNEY');
      const hero=media(a.image||a.subjectImage||'');
      let body='';
      if(a.live){body='<div class="body"><p class="dropcap">'+esc(a.description||'This story is part of the live entertainment desk at STARTS JOURNEY.')+'</p><p>Published from the live news feed. Follow the original source for the latest reporting and context.</p></div>';}
      else if(a.subjectName==='Ashish Yadav'){body='<div class="body"><p class="dropcap">'+esc(a.description)+'</p><p>There was no professional camera, production team or carefully planned studio when Ashish Yadav began creating content.</p><p>There was simply a phone, an interest in lifestyle and fashion, and the desire to create something of his own.</p><p>Today, the 21-year-old creator from Jhansi has built an Instagram community of 400K+ followers through a visual identity centered around fashion, lifestyle, travel and photography. His content carries a polished, luxury-inspired aesthetic—a style that has gradually become part of his identity as a creator.</p><p>But the story behind those visuals started much more simply.</p><h2>The Beginning Nobody Saw</h2><p>Before content creation became a serious part of his life, Ashish imagined a different future.</p><p>Like many students, his initial goal was to become an engineer. Content creation wasn\'t originally the obvious career path. It emerged from his growing interest in fashion, lifestyle and travel, and eventually became something he wanted to explore seriously.</p><p>His first platform was Instagram.</p><p>His first piece of equipment was far from a professional setup: an Oppo A15s.</p><p>There were no elaborate productions. Ashish began by creating lifestyle content and learning through experimentation—figuring out what looked good, what connected with people and, perhaps most importantly, what felt like him.</p><h2>Building a Visual Identity</h2><p>Over time, Ashish\'s content began moving beyond simply posting photographs or videos.</p><p>Fashion became a major part of his visual language. Lifestyle and travel added another dimension, while photography allowed him to focus on the details—the setting, outfit, composition and overall mood.</p><p>His answer to what separates his work from other creators is simple:</p><p>Luxury style.</p><p>That aesthetic has become a recognizable part of the way he presents himself online.</p><p>Rather than treating content creation as just a numbers game, Ashish has focused on creating a world around his content—one where fashion, travel and lifestyle come together through polished visuals.</p><h2>The Growth That Changed Everything</h2><p>A major chapter in Ashish\'s journey came in 2022, which he identifies as his biggest period of growth.</p><p>The numbers continued to move.</p><p>One milestone that stands out is reaching 100,000 followers—a point that transformed content creation from a personal interest into something with real potential.</p><p>Today, that audience has grown beyond 400,000 followers on Instagram.</p><p>The journey from an entry-level smartphone to a platform reaching hundreds of thousands of people reflects a larger part of Ashish\'s story: starting with what was available and developing through consistency.</p><h2>From Creator to Brand Collaborator</h2><p>As his audience and visual identity developed, opportunities with brands began to follow.</p><p>Ashish has worked with names including Snitch, Flipkart, Myntra, Amazon, Agaro, Samsung and Oppo, along with collaborations connected to hotels and hospitality across destinations such as Nainital, Delhi and Gurgaon.</p><p>Across his journey, he has completed 1000+ brand collaborations.</p><p>One of the moments he remembers particularly well is his first Flipkart event.</p><p>For a creator who started by making lifestyle content on a smartphone in Jhansi, stepping into a professional brand event represented a very different stage of the journey.</p><p>It was no longer just about creating content for himself. His work had begun entering the wider creator-and-brand ecosystem.</p><h2>The Life Behind the Camera</h2><p>The polished images tell only one part of Ashish\'s story.</p><p>Behind the content is a student still balancing education with his creative career. He is currently associated with SR Group of Institutions, Jhansi, while continuing to develop his presence as a creator.</p><p>Ashish describes himself as a half-time content creator and half-time student.</p><p>Balancing both hasn\'t always been easy. He credits the support of his friends for helping him manage the demands of studies and content creation.</p><p>And the journey wasn\'t initially supported by everyone in his family.</p><p>That lack of early support became one of the challenges he had to navigate while pursuing something that was still unfamiliar to many people around him.</p><p>Yet he continued.</p><h2>Consistency Over Everything</h2><p>For Ashish, the philosophy behind success comes down to one word:</p><p>Consistency.</p><p>It\'s a simple idea, but one that has shaped his journey—from creating with an Oppo A15s to building an audience of 400K+ and working with major brands.</p><p>His advice to someone starting from zero is equally direct:</p><div class="quote">“Do whatever you want.”</div><p>For him, the message is about having the courage to explore your own direction rather than waiting for everyone else to understand it first.</p><h2>The Next Chapter</h2><p>Ashish\'s ambitions now extend well beyond Instagram.</p><p>Over the next few years, he wants to explore acting, develop his own fashion brand, take on bigger travel projects, build a creative team, and eventually become a full-time creator.</p><p>These goals represent a natural expansion of what he has already been building.</p><p>Fashion can become a brand. Travel can become larger productions. Content can become acting. And the solo creator who once handled everything from a phone can eventually build a team around a much bigger creative vision.</p><h2>More Than a Follower Count</h2><p>Ashish Yadav\'s story isn\'t simply about going from one follower milestone to another.</p><p>It\'s about how a student from Jhansi began experimenting with lifestyle content, found an aesthetic rooted in fashion and luxury, and gradually turned that interest into a growing digital identity.</p><p>From an Oppo A15s to 400K+ followers.</p><p>From creating for himself to completing 100+ brand collaborations.</p><p>From wanting to become an engineer to discovering another possible future through creativity.</p><p>And perhaps the most interesting part is that the journey is still in progress.</p><p>Ashish Yadav isn\'t presenting his destination yet. He\'s building it.</p></div>';}main.innerHTML='<div class="cat">'+esc(a.category||'ENTERTAINMENT')+'</div><h1>'+esc(a.title)+'</h1><div class="dek">'+esc(a.description||'')+'</div><div class="byline"><img class="avatar" src="'+hero+'" onerror="this.style.display=\'none\'"><div class="bylineText"><strong>'+esc(a.author||'STARTS JOURNEY Editorial')+'</strong><br>'+esc(a.readTime||'3 min read')+'</div></div><img class="hero" src="'+hero+'" onerror="this.style.display=\'none\'"><div class="caption">Image / story reference: '+source+'</div>'+body+(gallery.length?'<div class="photoGallery">'+gallery.map(g=>'<figure><img src="'+media(g.image||g.url||'')+'" loading="lazy" onerror="this.closest(\'figure\').style.display=\'none\'"><figcaption>'+esc(g.caption||'STARTS JOURNEY photo gallery')+'</figcaption></figure>').join('')+'</div>':'')+'<div class="source">Source: '+source+'</div><div class="tagsWrap">'+(a.tags||[]).map(t=>'<a class="tagChip" href="/?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>').join('')+'</div>';
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