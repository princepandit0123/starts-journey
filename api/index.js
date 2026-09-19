const fs = require('fs');
const path = require('path');

let liveCache = { at: 0, articles: [] };

function loadAshishPhoto() {
  try {
    const b64 = fs.readFileSync(path.join(process.cwd(), 'api', 'ashish-image-1.txt'), 'utf8').trim();
    return b64 ? `data:image/jpeg;base64,${b64}` : '/uploads/ashish-yadav-photo-9.jpg';
  } catch { return '/uploads/ashish-yadav-photo-9.jpg'; }
}

const ASHISH = {
  id: 'ashish-yadav-jhansi-luxury-digital-life',
  title: 'From Jhansi to a Luxury-Led Digital Life: The Story of Ashish Yadav',
  description: 'How a student from Jhansi turned an Oppo A15s into his first creative tool, built an audience of 400K+, and carved out a distinct identity through fashion, lifestyle and travel.',
  category: 'LIFESTYLE · CREATOR',
  subjectName: 'Ashish Yadav',
  source: 'STARTS JOURNEY',
  author: 'STARTS JOURNEY Editorial',
  readTime: '8 min read',
  image: loadAshishPhoto(),
  subjectImage: loadAshishPhoto(),
  tags: ['Ashish Yadav','Jhansi','Content Creator','Fashion','Lifestyle','Travel','Instagram Creator'],
  gallery: [
    { image:loadAshishPhoto(), caption:'A portrait from Ashish Yadav’s personal photo collection, highlighting his fashion-led visual identity.' },
    { image:loadAshishPhoto(), caption:'A second display of the supplied Ashish Yadav photo, used as the article’s visual cover.' }
  ],
  sections: [
    { heading:'The Beginning Nobody Saw', paragraphs:[
      'There was no professional camera, production team or carefully planned studio when Ashish Yadav began creating content. There was simply a phone, an interest in lifestyle and fashion, and the desire to create something of his own. Like many students, his initial goal was to become an engineer, and content creation was not originally the obvious career path — it grew out of a personal interest that he eventually decided to pursue seriously.',
      'His first platform was Instagram, and his first piece of equipment was far from a professional setup: an Oppo A15s. There were no elaborate productions. Ashish began by creating lifestyle content and learning through experimentation, figuring out what looked good, what connected with people, and what felt authentic to who he was.'
    ]},
    { heading:'Building a Visual Identity', paragraphs:[
      'Over time, Ashish’s content moved beyond simply posting photographs or videos. Fashion became a major part of his visual language, while lifestyle and travel added another dimension. Photography allowed him to focus on the finer details — the setting, the outfit, the composition and the overall mood of each post.',
      'Asked what separates his work from other creators, his answer is simple: luxury style. That aesthetic has become a recognizable part of how he presents himself online. Rather than treating content creation as just a numbers game, Ashish has focused on building a world around his content, one where fashion, travel and lifestyle come together through polished visuals.'
    ]},
    { heading:'The Growth That Changed Everything', paragraphs:[
      'A major chapter in Ashish’s journey came in 2022, which he identifies as his biggest period of growth. One milestone that stands out is reaching 100,000 followers, a point that transformed content creation from a personal interest into something with real potential.',
      'Today, that audience has grown beyond 400,000 followers on Instagram. The journey from an entry-level smartphone to a platform reaching hundreds of thousands of people reflects a larger part of his story: starting with what was available and developing through consistency.'
    ]},
    { heading:'From Creator to Brand Collaborator', paragraphs:[
      'As his audience and visual identity developed, opportunities with brands began to follow. Ashish has worked with names including Snitch, Flipkart, Myntra, Amazon, Agaro, Samsung and Oppo, along with collaborations connected to hotels and hospitality across destinations such as Nainital, Delhi and Gurgaon. Across his journey, he has completed 100+ brand collaborations.',
      'One of the moments he remembers particularly well is his first Flipkart event. For a creator who started by making lifestyle content on a smartphone in Jhansi, stepping into a professional brand event marked a very different stage of the journey — his work had begun entering the wider creator-and-brand ecosystem.'
    ]},
    { heading:'The Life Behind the Camera', paragraphs:[
      'The polished images tell only one part of Ashish’s story. Behind the content is a student still balancing education with his creative career. He is currently associated with SR Group of Institutions, Jhansi, while continuing to develop his presence as a creator, describing himself as a half-time content creator and half-time student.',
      'Balancing both has not always been easy, and he credits the support of his friends for helping him manage the demands of studies and content creation. The journey also was not initially supported by everyone in his family — a lack of early support that became one of the challenges he had to navigate while pursuing something still unfamiliar to many people around him. Yet he continued.'
    ]},
    { heading:'Consistency Over Everything, and the Next Chapter', paragraphs:[
      'For Ashish, the philosophy behind success comes down to one word: consistency. It is a simple idea, but one that has shaped his journey, from creating with an Oppo A15s to building an audience of 400K+ and working with major brands. His advice to someone starting from zero is equally direct: “Do whatever you want” — a call to have the courage to explore your own direction rather than waiting for everyone else to understand it first.',
      'Ashish’s ambitions now extend well beyond Instagram. Over the next few years, he wants to explore acting, develop his own fashion brand, take on bigger travel projects, build a creative team, and eventually become a full-time creator — a natural expansion of what he has already been building, from a solo creator with a phone to someone with a much bigger creative vision in sight.'
    ]},
    { heading:'From a Smartphone to a Story', paragraphs:[
      'The most memorable part of Ashish Yadav’s journey may not be the number 400K+. It may be the distance between the beginning and where the journey has reached.',
      'A smartphone that was once simply a device became a creative tool. A creative hobby became content. Content became an identity. That identity became an audience. And the audience became a platform for bigger possibilities.',
      'From Jhansi to a wider digital audience, Ashish’s story represents something increasingly common among India’s young generation: the ability to create opportunities instead of waiting for them. The equipment can change, the locations can change, the fashion can change and the platforms can change — but the fundamental idea remains timeless. You do not always need to start with everything. Sometimes, you only need to start with what you have, and have the courage to keep building.'
    ]}
  ],
  imageCredit: 'Photos supplied by Ashish Yadav',
  isFeatured: true,
  isTrending: true,
  updatedAt: '2026-09-19T14:30:00.000Z',
  factNote: 'Information in this profile is based on material supplied by the subject/source and publicly available profile information.'
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
  const valid = [4,9];
  const fallback = '/uploads/ashish-yadav-photo-4.jpg';
  const fix = (src) => {
    const s = String(src || '');
    const m = s.match(/ashish-yadav-photo-(\d+)\.(?:jpe?g)/i);
    if (!m) return s;
    const n = Number(m[1]);
    return valid.includes(n) ? `/uploads/ashish-yadav-photo-${n}.jpg` : fallback;
  };
  return {
    ...a,
    image: fix(a.image),
    subjectImage: fix(a.subjectImage),
    gallery: Array.isArray(a.gallery) ? a.gallery.map((g,i) => ({
      ...g,
      image: fix(g.image),
      caption: g.caption || [
        'A relaxed moment that captures Ashish’s effortless style away from the spotlight.',
        'A polished travel look reflecting the confidence and attention to detail behind his visual identity.',
        'A calm luxury-stay moment, where understated style meets Ashish’s lifestyle storytelling.',
        'An outdoor fashion portrait bringing together personality, styling and a love for visual storytelling.'
      ][i % 4]
    })) : a.gallery
  };
}

function cleanText(s) {
  return decodeXml(s).replace(/\s+/g, ' ').trim();
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
        out.push({
          id: `live-${Buffer.from(sourceUrl).toString('base64url').slice(0,32)}`,
          title, description: cleanText(tag(block, 'description')),
          category: /cricket|ipl|bcci|virat|rohit|match|wicket/i.test(title) ? 'CRICKET · LIVE NEWS' : /ott|web series|netflix|prime video|streaming/i.test(title) ? 'OTT · LIVE NEWS' : 'ENTERTAINMENT · LIVE NEWS',
          image: sourceImage || themeImage(title), source: tag(block, 'source') || 'Google News',
          sourceUrl, publishedAt: tag(block, 'pubDate') || new Date().toISOString(),
          updatedAt: new Date().toISOString(), author: 'STARTS JOURNEY Live Desk',
          readTime: '3 min read', live: true, hasSourceImage: !!sourceImage
        });
        if (out.length >= 30) break;
      }
    } catch (e) {}
    if (out.length >= 30) break;
  }
  const seenUrl = new Set(), seenTitle = new Set();
  const unique = out.filter(a => {
    const tk = titleKey(a.title);
    if (seenUrl.has(a.sourceUrl) || (tk && seenTitle.has(tk))) return false;
    seenUrl.add(a.sourceUrl); if (tk) seenTitle.add(tk); return true;
  }).slice(0, 30);
  if (unique.length) liveCache = { at: Date.now(), articles: unique };
  return unique;
}
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const p = (req.url || '').split('?')[0];
  if (p === '/api/health') return res.status(200).json({ ok: true, vercel: true, build: 'ashish-full-article-v10' });
  if (p === '/api/content') {
    const fallback = loadFallback().map(fixAshishImages);
    const live = await loadLiveNews();
    const combined = [ASHISH, ...live, ...fallback.filter(a => a.id !== ASHISH.id && a.subjectName !== 'Ashish Yadav')];
    const seen = new Set(), seenTitles = new Set();
    const articles = combined.filter(a => {
      const k = a.sourceUrl || a.id || a.title, tk = titleKey(a.title);
      if (seen.has(k) || (tk && seenTitles.has(tk))) return false;
      seen.add(k); if (tk) seenTitles.add(tk); return true;
    }).slice(0, 200);
    return res.status(200).json({ ticker: 'BREAKING · LIVE NEWS · CRICKET · BOLLYWOOD · CELEBRITIES', articles, lastSync: live.length ? live[0].updatedAt : null, build: 'ashish-full-article-v9' });
  }
  if (p === '/api/sync-news') return res.status(200).json({ ok: true, count: (await loadLiveNews()).length, message: 'Live news refreshes automatically every 10 minutes.' });
  return res.status(404).json({ error: 'API route not found' });
};
