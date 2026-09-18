const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    // The legacy client-side live-feed merger re-adds /data/news.json on top of /api/content,
    // which duplicates live stories. /api/content is now the single source of live news.
    html = html.replace(/<!-- STARTS JOURNEY LIVE FEED FIX -->[\\s\\S]*?<\\/script>\\s*(?=<\\/body>)/, '');
    const patch = `
<style id="sj-fix-style">.sj-fix-results{max-width:1240px;margin:18px auto;padding:0 20px}.sj-fix-results>div{background:#fff;border:1px solid #ddd9d3;padding:20px}.sj-fix-result{display:flex;gap:14px;padding:13px 0;border-top:1px solid #eee;text-decoration:none;color:#111}.sj-fix-result img{width:120px;height:80px;object-fit:cover;background:#eee}.sj-fix-result h3{font-family:Georgia,serif;font-size:19px;margin:0 0 6px}.sj-fix-result p{font-size:12px;color:#666;margin:0}</style>
<script id="sj-fix-script">
(function(){
const ASHISH={id:'ashish-yadav-jhansi-luxury-digital-life',title:'From Jhansi to a Luxury-Led Digital Life: The Story of Ashish Yadav',description:'How a student from Jhansi turned an Oppo A15s into his first creative tool, built an audience of 400K+, and carved out a distinct identity through fashion, lifestyle and travel.',category:'LIFESTYLE · CREATOR',subjectName:'Ashish Yadav',source:'STARTS JOURNEY',image:'https://raw.githubusercontent.com/princepandit0123/starts-journey/main/uploads/ashish-yadav-photo-1.jpeg?v=8',tags:['Ashish Yadav','Jhansi','Content Creator','Fashion','Lifestyle','Travel','Instagram Creator']};
function esc(v){return String(v||'').replace(/[&<>\\\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;'}[c]||c;});}
function ensure(){let m=document.querySelector('main');if(!m)return null;let r=document.getElementById('sj-fix-results');if(!r){r=document.createElement('div');r.id='sj-fix-results';r.className='sj-fix-results';r.style.display='none';m.parentNode.insertBefore(r,m);}return {r};}
async function data(){try{let x=await fetch('/api/content?fix='+Date.now(),{cache:'no-store'});if(x.ok){let j=await x.json();if(Array.isArray(j.articles))return j.articles;}}catch(e){}try{let x=await fetch('/data/news.json?fix='+Date.now(),{cache:'no-store'});if(x.ok){let j=await x.json();if(Array.isArray(j))return [ASHISH].concat(j);}}catch(e){}return [ASHISH];}
function show(q,list,box){let low=q.toLowerCase();let arr=list.filter(a=>(a.title+' '+(a.description||'')+' '+(a.category||'')+' '+(a.source||'')+' '+(a.subjectName||'')+' '+((a.tags||[]).join(' '))).toLowerCase().includes(low));if(low.includes('ashish')&&!arr.some(a=>a.id===ASHISH.id))arr.unshift(ASHISH);box.style.display='block';box.innerHTML='<div><h2 style="font-family:Georgia,serif;margin:0 0 14px">'+(arr.length?'Search results':'No stories found')+'</h2>'+(arr.length?arr.slice(0,20).map(a=>'<a class="sj-fix-result" href="/article/'+encodeURIComponent(a.id)+'"><img src="'+esc(a.image||ASHISH.image)+'"><div><h3>'+esc(a.title)+'</h3><p>'+esc(a.description||a.category||'STARTS JOURNEY')+'</p></div></a>').join(''):'<p>Try another name, category or keyword.</p>')+'</div>';}
function cardForLink(link){return {link,img:link.querySelector('img')||link.parentElement?.querySelector('img')||link.closest('article')?.querySelector('img')};}
function resolveArticle(slug,list){
 let a=list.find(x=>String(x.id)===slug);if(a)return a;
 const m=slug.match(/^live-news-(\\d+)-\\d+$/);if(m){const live=list.filter(x=>x&&x.live);return live[Number(m[1])]||null;}
 return null;
}
function fixLiveCards(list){
 const links=Array.from(document.querySelectorAll('a[href*="/article/"]'));
 for(const link of links){
   try{
     const raw=link.getAttribute('href')||'';const slug=decodeURIComponent(raw.split('/article/')[1]||'');
     const a=resolveArticle(slug,list);if(!a||!a.live)continue;
     const card=cardForLink(link);const target='/article/'+encodeURIComponent(a.id);
     if(link.getAttribute('href')!==target)link.setAttribute('href',target);
     if(card.img){
       card.img.dataset.sjOriginal='1';
       if(a.hasSourceImage&&a.image) card.img.src=a.image;
       else if(a.sourceUrl) card.img.src='/api/news-image?url='+encodeURIComponent(a.sourceUrl)+'&v='+Date.now();
       else if(a.image) card.img.src=a.image;
     }
   }catch(e){}
 }
}
async function search(q){q=(q||'').trim();if(!q)return;let b=ensure();if(!b)return;show(q,await data(),b.r);}
async function bind(){let b=ensure();if(!b)return;let old=document.getElementById('searchForm');if(old&&!old.dataset.sjFixed){let form=old.cloneNode(true);form.dataset.sjFixed='1';old.replaceWith(form);form.addEventListener('submit',function(e){e.preventDefault();search((form.querySelector('input')||{}).value||'');});}let list=await data();fixLiveCards(list);setInterval(async()=>fixLiveCards(await data()),600000);let input=document.getElementById('search');let q=new URLSearchParams(location.search).get('q');if(q&&input){input.value=q;search(q);}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
</script>`;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0, must-revalidate');
    return res.status(200).send(html.replace('</body>',patch+'</body>'));
  } catch(e) { return res.status(500).send('Homepage error: '+e.message); }
};