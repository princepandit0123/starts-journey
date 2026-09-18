const fs = require('fs');
const path = require('path');

let liveCache = { at: 0, articles: [] };

const ASHISH = {
  id: 'ashish-yadav-jhansi-luxury-digital-life',
  title: 'From Jhansi to a Luxury-Led Digital Life: The Story of Ashish Yadav',
  description: 'How a student from Jhansi turned an Oppo A15s into his first creative tool, built an audience of 400K+, and carved out a distinct identity through fashion, lifestyle and travel.',
  category: 'LIFESTYLE · CREATOR',
  subjectName: 'Ashish Yadav',
  source: 'STARTS JOURNEY',
  author: 'STARTS JOURNEY Editorial',
  readTime: '5 min read',
  image: 'https://raw.githubusercontent.com/princepandit0123/starts-journey/main/uploads/ashish-yadav-photo-1.jpeg?v=8',
  tags: ['Ashish Yadav','Jhansi','Content Creator','Fashion','Lifestyle','Travel','Instagram Creator'],
  gallery: [1,2,3].map(n => ({image:`https://raw.githubusercontent.com/princepandit0123/starts-journey/main/uploads/ashish-yadav-photo-${n}.jpeg?v=8`})).concat([4,5,6,7,8,9].map(n => ({image:`https://raw.githubusercontent.com/princepandit0123/starts-journey/main/uploads/ashish-yadav-photo-${n}.jpg?v=8`})))
};

function loadFallback() {
  try {
    const html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
    const m = html.match(/const\s+fallbackArticles\s*=\s*(\[[\s\S]*?\]);\s*let\s+allArticles\s*=/);
    if (m) { try { const parsed = JSON.parse(m[1]); if (Array.isArray(parsed)) return parsed; } catch {} }
  } catch {}
  return [];
}

function fixAshishImages(a) {
  if (!a || a.subjectName !== 'Ashish Yadav') return a;
  const fix = (src) => {
    const m = String(src || '').match(/ashish-yadav-photo-(\d+)\.(?:jpe?g)/i);
    if (!m) return src;
    const n = Number(m[1]);
    const ext = n <= 3 ? 'jpeg' : 'jpg';
    return `https://raw.githubusercontent.com/princepandit0123/starts-journey/main/uploads/ashish-yadav-photo-${n}.${ext}?v=8`;
  };
  return { ...a, image: fix(a.image), subjectImage: fix(a.subjectImage), gallery: Array.isArray(a.gallery) ? a.gallery.map(g => ({ ...g, image: fix(g.image) })) : a.gallery };
}

function cleanText(s) {
  return decodeXml(s).replace(/\\s+/g, ' ').trim();
}

function titleKey(s) {
  return cleanText(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function decodeXml(s) {
  return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? decodeXml(m[1]) : '';
}

// Use the publisher/RSS image when the feed provides one. The homepage then
// resolves the publisher's original image. Only when that cannot be resolved
// do we keep the category-specific theme fallback.
function imageFromItem(block) {
  const candidates = [
    /<media:(?:content|thumbnail)\b[^>]*\burl=["']([^"']+)["'][^>]*>/i,
    /<enclosure\b[^>]*\burl=["']([^"']+)["'][^>]*>/i,
    /<description[^>]*>([\s\S]*?)<\/description>/i,
    /<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i
  ];
  for (const re of candidates) {
    const m = block.match(re);
    if (!m) continue;
    if (re === candidates[2] || re === candidates[3]) {
      const img = m[1].match(/<(?:img|source)[^>]+(?:src|data-src|srcset)=["']([^"']+)["']/i);
      if (img && /^https?:\/\//i.test(img[1])) return img[1].split(',')[0].trim().split(' ')[0];
    } else if (m[1] && /^https?:\/\//i.test(m[1])) return m[1];
  }
  return '';
}

function themeImage(title) {
  const t = String(title || '').toLowerCase();
  if (/cricket|ipl|bcci|virat|rohit|team india|match|wicket/.test(t)) return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1400&q=85';
  if (/ott|web series|netflix|prime video|series|streaming/.test(t)) return 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1400&q=85';
  if (/music|song|singer|concert|album/.test(t)) return 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85';
  if (/travel|luxury|lifestyle/.test(t)) return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85';
  if (/bollywood|actor|actress|celebrity|star|film|movie|cinema/.test(t)) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=85';
  return 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=85';
}

async function loadLiveNews() {
  if (Date.now() - liveCache.at < 10 * 60 * 1000 && liveCache.articles.length) return liveCache.articles;
  const feeds = [
    'https://news.google.com/rss/search?q=Bollywood+OR+Hindi+cinema+OR+OTT+OR+celebrity+when:2h&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=Indian+entertainment+OR+film+OR+web+series+when:2h&hl=en-IN&gl=IN&ceid=IN'
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
        const sourceImage = imageFromItem(block);
        const image = sourceImage || themeImage(title);
        out.push({
          id: `live-${Buffer.from(sourceUrl).toString('base64url').slice(0,32)}`,
          title,
          description: cleanText(tag(block, 'description')),
          category: /cricket|ipl|bcci|virat|rohit|match|wicket/i.test(title) ? 'CRICKET · LIVE NEWS' : /ott|web series|netflix|prime video|streaming/i.test(title) ? 'OTT · LIVE NEWS' : 'ENTERTAINMENT · LIVE NEWS',
          image,
          source: tag(block, 'source') || 'Google News',
          sourceUrl,
          publishedAt: tag(block, 'pubDate') || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'STARTS JOURNEY Live Desk',
          readTime: '3 min read',
          live: true,
          hasSourceImage: !!sourceImage
        });
        if (out.length >= 30) break;
      }
    } catch (e) {}
    if (out.length >= 30) break;
  }
  const seenUrl = new Set();
  const seenTitle = new Set();
  const unique = out.filter(a => {
    const tk = titleKey(a.title);
    if (seenUrl.has(a.sourceUrl) || (tk && seenTitle.has(tk))) return false;
    seenUrl.add(a.sourceUrl);
    if (tk) seenTitle.add(tk);
    return true;
  }).slice(0, 30);
  if (unique.length) liveCache = { at: Date.now(), articles: unique };
  return unique;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const p = (req.url || '').split('?')[0];
  if (p === '/api/health') return res.status(200).json({ ok: true, vercel: true, build: 'source-image-with-fallback-v8' });
  if (p === '/api/content') {
    const fallback = loadFallback().map(fixAshishImages);
    const live = await loadLiveNews();
    // Live news comes first; fallback stories remain only as backup content.
    const combined = [ASHISH, ...live, ...fallback.filter(a => a.id !== ASHISH.id && a.subjectName !== 'Ashish Yadav')];
    const seen = new Set();
    const seenTitles = new Set();
    const articles = combined.filter(a => {
      const k = a.sourceUrl || a.id || a.title;
      const tk = titleKey(a.title);
      if (seen.has(k) || (tk && seenTitles.has(tk))) return false;
      seen.add(k);
      if (tk) seenTitles.add(tk);
      return true;
    }).slice(0, 200);
    return res.status(200).json({ ticker: 'BREAKING · LIVE NEWS · CRICKET · BOLLYWOOD · CELEBRITIES', articles, lastSync: live.length ? live[0].updatedAt : null, build: 'source-image-with-fallback-v8' });
  }
  if (p === '/api/sync-news') return res.status(200).json({ ok: true, count: (await loadLiveNews()).length, message: 'Live news refreshes automatically every 10 minutes.' });
  return res.status(404).json({ error: 'API route not found' });
};
