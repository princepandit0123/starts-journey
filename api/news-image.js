const cache = new Map();

function pickImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) return m[1].replace(/&amp;/g, '&');
  }
  return '';
}

module.exports = async (req, res) => {
  try {
    const raw = req.query?.url || new URL(req.url, 'http://localhost').searchParams.get('url');
    if (!raw || !/^https?:\/\//i.test(raw)) return res.status(400).send('Missing url');
    const url = decodeURIComponent(raw);
    if (cache.has(url)) return res.redirect(302, cache.get(url));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 STARTS-JOURNEY/1.0', accept: 'text/html,application/xhtml+xml' }, signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) return res.status(404).send('Image not found');
    const html = await r.text();
    const image = pickImage(html);
    if (!image) return res.status(404).send('Image not found');
    const absolute = new URL(image, url).href;
    cache.set(url, absolute);
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    return res.redirect(302, absolute);
  } catch (e) {
    return res.status(404).send('Image not found');
  }
};
