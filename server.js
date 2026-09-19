const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('https');
const multer = require('multer');
const { renderArticleHTML } = require('./lib/render-article');
const { read, write, isAuthorized } = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS = path.join(__dirname, 'data', 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

const upload = multer({ dest: UPLOADS });
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(UPLOADS));
app.use(express.static(path.join(__dirname, 'public')));

// Admin routes (anything that adds/removes/edits content) require the
// x-admin-key header to match ADMIN_KEY. See lib/db.js.
function requireAdmin(q, s, next) {
  if (!isAuthorized(q)) return s.status(401).json({ error: 'Unauthorized — missing or incorrect admin key' });
  next();
}
function cleanHtml(x = '') {
  return String(x).replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
    .replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}
function xmlTag(block, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  return (block.match(re) || [])[1] || '';
}
function getAttr(block, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["'][^>]*>`, 'i');
  return (block.match(re) || [])[1] || '';
}
function fetchText(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'STARTS-JOURNEY-NewsBot/1.0 (+local-site)' },
      timeout: 12000
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchText(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        resolve(body);
      });
    });
    req.on('timeout', () => req.destroy(new Error('Feed request timed out')));
    req.on('error', reject);
  });
}
function parseFeed(xml) {
  const blocks = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/(item|entry)>/gi)].map(m => m[0]);
  return blocks.map(b => {
    const title = cleanHtml(xmlTag(b, 'title'));
    const description = cleanHtml(xmlTag(b, 'description') || xmlTag(b, 'summary') || xmlTag(b, 'content'));
    let link = cleanHtml(xmlTag(b, 'link'));
    if (!link) link = getAttr(b, 'link', 'href');
    const source = cleanHtml(xmlTag(b, 'source')) || cleanHtml(xmlTag(b, 'author')) || 'News Feed';
    const pub = cleanHtml(xmlTag(b, 'pubDate') || xmlTag(b, 'published') || xmlTag(b, 'updated'));
    const image = getAttr(b, 'media:content', 'url') || getAttr(b, 'media:thumbnail', 'url') || getAttr(b, 'enclosure', 'url') || '';
    return { title, description, link, source, pub, image };
  }).filter(x => x.title && x.link);
}

app.get('/api/content', (q, s) => s.json(read()));
app.get('/api/health', (q, s) => s.json({ ok: true, articles: read().articles.length, autoSyncMinutes: 10 }));

app.post('/api/articles', requireAdmin, (q, s) => {
  const d = read();
  const a = {
    id: Date.now().toString(), title: q.body.title || 'Untitled', description: q.body.description || '',
    category: q.body.category || 'ENTERTAINMENT', image: q.body.image || '', sourceUrl: q.body.sourceUrl || '',
    source: q.body.source || 'STARTS JOURNEY', publishedAt: new Date().toISOString()
  };
  d.articles.unshift(a); write(d); s.json(a);
});
app.delete('/api/articles/:id', requireAdmin, (q, s) => { const d = read(); d.articles = d.articles.filter(x => x.id !== q.params.id); write(d); s.json({ ok: true }); });

app.post('/api/posts', (q, s) => {
  const d = read(); const p = { id: Date.now().toString(), name: q.body.name || 'Anonymous', title: q.body.title || '', body: q.body.body || '', image: q.body.image || '', category: q.body.category || 'USER', status: 'pending', createdAt: new Date().toISOString() };
  d.posts.unshift(p); write(d); s.json(p);
});
app.post('/api/posts/:id/approve', requireAdmin, (q, s) => { const d = read(), p = d.posts.find(x => x.id === q.params.id); if (!p) return s.status(404).json({ error: 'not found' }); p.status = 'approved'; d.articles.unshift({ id: 'post-' + p.id, title: p.title, description: p.body, category: p.category, image: p.image, source: 'Community', publishedAt: new Date().toISOString() }); write(d); s.json(p); });
app.post('/api/posts/:id/reject', requireAdmin, (q, s) => { const d = read(), p = d.posts.find(x => x.id === q.params.id); if (!p) return s.status(404).json({ error: 'not found' }); p.status = 'rejected'; write(d); s.json(p); });
app.post('/api/ticker', requireAdmin, (q, s) => { const d = read(); d.ticker = q.body.ticker || d.ticker; write(d); s.json({ ticker: d.ticker }); });
app.post('/api/subscribe', (q, s) => { const d = read(); if (q.body.email && !d.subscribers.includes(q.body.email)) d.subscribers.push(q.body.email); write(d); s.json({ ok: true }); });
app.post('/api/upload', requireAdmin, upload.single('image'), (q, s) => { if (!q.file) return s.status(400).json({ error: 'image required' }); s.json({ url: '/uploads/' + q.file.filename }); });

// Live news: Google News RSS is used as an RSS aggregator. Headlines/snippets link back to the original publisher.
const FEEDS = [
  { name: 'Bollywood', category: 'ENTERTAINMENT · BOLLYWOOD', url: 'https://news.google.com/rss/search?q=Bollywood%20India%20when:1d&hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'Indian Celebrities', category: 'ENTERTAINMENT · CELEBRITIES', url: 'https://news.google.com/rss/search?q=Indian%20celebrity%20Salman%20Khan%20Elvish%20Yadav%20when:1d&hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'Indian Cricket', category: 'CRICKET · INDIA', url: 'https://news.google.com/rss/search?q=India%20cricket%20Virat%20Kohli%20Team%20India%20when:1d&hl=en-IN&gl=IN&ceid=IN:en' },
  { name: 'Sports', category: 'SPORTS · INDIA', url: 'https://news.google.com/rss/search?q=Indian%20cricket%20IPL%20when:1d&hl=en-IN&gl=IN&ceid=IN:en' }
];

async function syncNews() {
  const d = read();
  const added = [];
  const errors = [];
  for (const feed of FEEDS) {
    try {
      const xml = await fetchText(feed.url);
      const items = parseFeed(xml).slice(0, 10);
      for (const item of items) {
        const exists = d.articles.some(a => a.sourceUrl && a.sourceUrl === item.link) || d.articles.some(a => a.title && a.title.toLowerCase() === item.title.toLowerCase());
        if (exists) continue;
        let publishedAt = new Date(item.pub || Date.now());
        if (Number.isNaN(publishedAt.getTime())) publishedAt = new Date();
        const id = 'live-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
        const a = {
          id, title: item.title, description: item.description || `Latest ${feed.name.toLowerCase()} update from the news feed.`,
          category: feed.category, image: item.image || '', sourceUrl: item.link, source: item.source || feed.name,
          publishedAt: publishedAt.toISOString(), author: 'STARTS JOURNEY Live Desk', readTime: '3 min read', live: true
        };
        d.articles.unshift(a); added.push(a);
      }
    } catch (e) { errors.push({ feed: feed.name, error: e.message }); }
  }
  // Keep the restored stories and a reasonable live-news cache. Prevent an endlessly growing local JSON file.
  d.articles = d.articles.slice(0, 200);
  d.lastSync = new Date().toISOString();
  d.lastSyncAdded = added.length;
  d.lastSyncErrors = errors;
  write(d);
  return { ok: errors.length < FEEDS.length, count: added.length, articles: added, errors, lastSync: d.lastSync };
}

app.post('/api/sync-news', async (q, s) => { try { s.json(await syncNews()); } catch (e) { s.status(500).json({ ok: false, error: e.message }); } });
app.get('/api/sync-news', async (q, s) => { try { s.json(await syncNews()); } catch (e) { s.status(500).json({ ok: false, error: e.message }); } });

// Automatic background refresh every 10 minutes while the Node server is running.
setTimeout(() => syncNews().catch(() => {}), 1500);
setInterval(() => syncNews().catch(() => {}), 10 * 60 * 1000);

// Article pages: server-rendered SEO metadata (title/description/canonical/OG/
// Twitter/JSON-LD) injected into the static article.html shell, based on the
// requested slug. The visible article body still renders client-side.
app.get('/article/:slug', (q, s) => {
  const d = read();
  const requested = decodeURIComponent(q.params.slug || '');
  const redirectTarget = (d.redirects || {})[requested];
  if (redirectTarget) {
    return s.redirect(301, '/article/' + encodeURIComponent(redirectTarget));
  }
  const baseUrl = process.env.SITE_URL || `${q.protocol}://${q.get('host')}`;
  const article = (d.articles || []).find(a => a.id === requested || a.slug === requested);
  const { status, html } = renderArticleHTML(article || null, baseUrl, requested);
  s.status(status).type('html').send(html);
});

const CATEGORY_PAGES = ['bollywood', 'movies', 'ott', 'web-series', 'celebrities', 'hollywood', 'reviews', 'box-office', 'cricket'];
for (const slug of CATEGORY_PAGES) {
  app.get('/' + slug, (q, s) => s.sendFile(path.join(__dirname, 'public', slug + '.html')));
}

// Trust / editorial pages
const TRUST_PAGES = ['about', 'contact', 'editorial-policy', 'privacy', 'terms', 'disclaimer', 'corrections'];
for (const slug of TRUST_PAGES) {
  app.get('/' + slug, (q, s) => s.sendFile(path.join(__dirname, 'public', slug + '.html')));
}

app.get('/sitemap.xml', (q, s) => { const d = read(); const baseUrl = process.env.SITE_URL || `${q.protocol}://${q.get('host')}`; const urls = ['/'].concat(CATEGORY_PAGES.map(slug => '/' + slug)).concat(TRUST_PAGES.map(slug => '/' + slug)).concat((d.articles || []).map(a => '/article/' + encodeURIComponent(a.slug || a.id))); const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.map(u => `<url><loc>${baseUrl}${u}</loc></url>`).join('') + '</urlset>'; s.type('application/xml').send(xml); });
app.get('/robots.txt', (q, s) => s.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${(process.env.SITE_URL || `${q.protocol}://${q.get('host')}`)}/sitemap.xml`));
app.get('/admin', (q, s) => s.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Catch-all 404 for anything not matched above (unknown routes/pages).
app.use((q, s) => s.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

app.listen(PORT, () => console.log(`STARTS JOURNEY running on http://localhost:${PORT}`));
