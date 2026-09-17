# STARTS JOURNEY — live news + restored articles

## Recent production-readiness pass
- Ashish Yadav's profile now lives at the canonical slug
  `/article/ashish-yadav-jhansi-luxury-digital-life`; the old
  `/article/ashish-yadav-jhansi-journey` URL 301-redirects to it (both on the
  local Node server and on Vercel), so old links/bookmarks still work.
- `/article/:slug` is now server-rendered for SEO: `lib/render-article.js`
  injects a per-article `<title>`, meta description, canonical link, Open
  Graph + Twitter Card tags and JSON-LD (Article + Breadcrumb) into
  `article.html` before it's sent, so link previews (WhatsApp/X/Facebook)
  and search engines see correct per-story metadata. This runs both in
  `server.js` (local) and `api/article.js` (Vercel serverless function).
- The offline fallback dataset embedded in `public/article.html`
  (`LOCAL_ARTICLES`, used only if `/api/content` fails) is regenerated from
  `data/db.json` so it can't drift out of sync with the live data again.
- Added real trust/editorial pages: `/about`, `/contact`,
  `/editorial-policy`, `/privacy`, `/terms`, `/disclaimer`, `/corrections`.
  Footer links across the homepage, all category pages and the article page
  now point to these instead of `/#` placeholders.
- Added `public/404.html` and a catch-all 404 handler in `server.js` for
  unmatched routes.
- `sitemap.xml` now includes the trust pages and uses each article's
  canonical `slug`.

## What is fixed
- Restored 27 editorial articles remain in `data/db.json`.
- Homepage search is a real `<form>` with a working Search button.
- Every story has a `READ FULL STORY` page.
- Live news can be refreshed from the homepage with **REFRESH NOW**.
- Server automatically attempts a live RSS sync at startup and every 10 minutes while the server is running.
- Live stories are deduplicated by source URL/title and the cache is capped at 200 stories.
- Live stories link to the original publisher; the site does not copy a publisher's full copyrighted article.
- `GET /api/health` reports the server and article count.

## Run on Windows
1. Extract the ZIP.
2. Double-click `START-STARTS-JOURNEY.bat`.
3. Allow `npm install` the first time if Node modules are not present.
4. The site opens at `http://localhost:3000/`.

**Important:** Do not double-click `public/index.html`. That bypasses the Node server and can show a Windows `Index of C:\` page.

## Automatic news
The server uses Google News RSS search feeds for Bollywood/celebrity and Indian cricket. It fetches headlines and available summaries and stores them locally. The original publisher URL is kept as `sourceUrl`.

Automatic updates happen only while this Node server is running. On a deployed server, keep the process running with a process manager/hosting service.

## API smoke checks
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/content`
- `http://localhost:3000/api/sync-news`

## New section pages
The homepage nav now links to real pages instead of on-page anchors. Each page pulls live from `/api/content` and filters by category/keyword, so anything added via the admin panel or live sync shows up automatically on the right page:
- `/bollywood`, `/movies`, `/ott`, `/web-series`, `/celebrities`, `/hollywood`, `/reviews`, `/box-office`, `/cricket`
- `/box-office` also has a sample "Box Office Tracker" table (clearly marked as a layout placeholder, not live figures) — wire it up to a real data source when you have one.
- These are static files in `public/` (e.g. `public/bollywood.html`); `server.js` and `vercel.json` both map the clean URL (`/bollywood`) to the file, so it works the same locally and on Vercel.
