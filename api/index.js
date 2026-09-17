const fs = require('fs');
const path = require('path');

let liveCache = { at: 0, articles: [] };

function loadFallback() {
  const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  const m = html.match(/const fallbackArticles=(\[[\s\S]*?\]);\s*let allArticles=/);
  if (!m) return [];
  try { return JSON.parse(m[1]); } catch { return []; }
}

function fixAshishImages(a) {
  if (!a || a.subjectName !== 'Ashish Yadav') return a;
  const fix = (src) => {
    const m = String(src || '').match(/ashish-yadav-photo-(\d+)\.(?:jpe?g)/i);
    return m ? `https://raw.githubusercontent.com/princepandit0123/starts-journey/main/uploads/ashish-yadav-photo-${m[1]}.jpg?v=1` : src;
  };
  return { ...a, image: fix(a.image), subjectImage: fix(a.subjectImage), gallery: Array.isArray(a.gallery) ? a.gallery.map(g => ({ ...g, image: fix(g.image) })) : a.gallery };
}

function decodeXml(s) {
  return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeXml(m[1]) : '';
}

async function loadLiveNews() {
  if (Date.now() - liveCache.at < 10 * 60 * 1000 && liveCache.articles.length) return liveCache.articles;
  const feeds = [
    'https://news.google.com/rss/search?q=Bollywood+OR+Hindi+cinema+OR+OTT+OR+celebrity+when:2h&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=Indian+entertainment+OR+film+OR+web+series+when:2h&hl=en-IN&gl=IN&ceid=IN:en'
  ];
  const out = [];
  for (const url of feeds) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'STARTS-JOURNEY/1.0' } });
      if (!r.ok) continue;
      const xml = await r.text();
      for (const block of (xml.match(/<item>[\s\S]*?<\/item>/gi) || [])) {
        const title = tag(block, 'title');
        const sourceUrl = tag(block, 'link');
        if (!title || !sourceUrl) continue;
        out.push({
          id: `live-${Date.now().toString(36)}-${out.length}`,
          title,
          description: tag(block, 'description'),
          category: 'ENTERTAINMENT · LIVE NEWS',
          image: '',
          source: tag(block, 'source') || 'Google News',
          sourceUrl,
          publishedAt: tag(block, 'pubDate') || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'STARTS JOURNEY Live Desk',
          readTime: '3 min read',
          live: true
        });
        if (out.length >= 30) break;
      }
    } catch (e) {}
    if (out.length >= 30) break;
  }
  const seen = new Set();
  const unique = out.filter(a => { if (seen.has(a.sourceUrl)) return false; seen.add(a.sourceUrl); return true; }).slice(0, 30);
  if (unique.length) liveCache = { at: Date.now(), articles: unique };
  return unique;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const p = (req.url || '').split('?')[0];
  if (p === '/api/health') return res.status(200).json({ ok: true, vercel: true });
  if (p === '/api/content') {
    const fallback = loadFallback().map(fixAshishImages);
    const live = await loadLiveNews();
    const seen = new Set();
    const articles = [...live, ...fallback].filter(a => {
      const k = a.sourceUrl || a.title || a.id;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    }).slice(0, 200);
    return res.status(200).json({ ticker: 'BREAKING · LIVE NEWS · CRICKET · BOLLYWOOD · CELEBRITIES', articles, lastSync: live.length ? live[0].updatedAt : null });
  }
  if (p === '/api/sync-news') return res.status(200).json({ ok: true, count: (await loadLiveNews()).length, message: 'Live news refreshes automatically every 10 minutes.' });
  return res.status(404).json({ error: 'API route not found' });
};
