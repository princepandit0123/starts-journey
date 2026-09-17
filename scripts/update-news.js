const fs=require('fs'),path=require('path');
const key=process.env.NEWS_API_KEY;
if(!key){console.error('NEWS_API_KEY is not configured.');process.exit(1)}
async function main(){
 const url='https://newsapi.org/v2/top-headlines?country=in&category=entertainment&pageSize=20&apiKey='+encodeURIComponent(key);
 const r=await fetch(url); if(!r.ok) throw new Error(`News API failed: ${r.status} ${r.statusText}`);
 const d=await r.json(); const now=new Date().toISOString();
 const fresh=(d.articles||[]).map((a,i)=>({id:`live-news-${Date.now().toString(36)}-${i}`,title:a.title||'',description:a.description||'',category:'ENTERTAINMENT · LIVE NEWS',image:a.urlToImage||'',sourceUrl:a.url||'',source:a.source?.name||'News API',publishedAt:a.publishedAt||now,updatedAt:now,author:'STARTS JOURNEY Live Desk',readTime:'3 min read',live:true})).filter(a=>a.title&&a.sourceUrl);
 const p=path.join(process.cwd(),'data','news.json'); let old=[]; try{old=JSON.parse(fs.readFileSync(p,'utf8'))}catch{}
 const seen=new Set(old.map(a=>a.sourceUrl||a.title)); const added=fresh.filter(a=>{const k=a.sourceUrl||a.title;if(seen.has(k))return false;seen.add(k);return true});
 fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,JSON.stringify([...added,...old].slice(0,100),null,2)+'\n'); console.log(`Added ${added.length} news stories.`);
}
main().catch(e=>{console.error(e);process.exit(1)});
