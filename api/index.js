const fs = require('fs');
const path = require('path');
function loadFallback() {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const m = html.match(/const fallbackArticles=(\[[\s\S]*?\]);\s*let allArticles=/);
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch { return []; }
}
function loadNews() {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'news.json'), 'utf8')); }
  catch { return []; }
}
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const p = (req.url || '').split('?')[0];
  if (p === '/api/health') return res.status(200).json({ok:true, articles:loadFallback().length+loadNews().length, vercel:true});
  if (p === '/api/content') {
    const fallback=loadFallback(), live=loadNews(), seen=new Set();
    const articles=[...live,...fallback].filter(a=>{const k=a.sourceUrl||a.title||a.id;if(seen.has(k))return false;seen.add(k);return true}).slice(0,200);
    return res.status(200).json({ticker:'BREAKING · LIVE NEWS · CRICKET · BOLLYWOOD · CELEBRITIES',articles,lastSync:live.length?(live[0].updatedAt||new Date().toISOString()):null});
  }
  if (p === '/api/sync-news') return res.status(200).json({ok:true,count:0,message:'News is updated by GitHub Actions.'});
  return res.status(404).json({error:'API route not found'});
};
