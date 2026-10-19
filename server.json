const express = require('express'), compression = require('compression');
const fs = require('fs'), path = require('path');
const KEY = process.env.TMDB_KEY, PORT = process.env.PORT || 3000;
const ROOT = path.resolve(process.env.MEDIA_DIR || 'media');
const app = express(), cache = new Map();

app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// Real catalogue data from TMDB (key stays server-side, responses cached 10 min)
app.get('/api/tmdb', async (req, res) => {
  const { path: p = '', ...q } = req.query;
  if (!KEY) return res.status(500).json({ error: 'Set the TMDB_KEY environment variable' });
  if (p.includes('..') || !/^\/(trending|movie|tv|search|discover)\/[\w\/.-]+$/.test(p))
    return res.status(400).json({ error: 'Bad path' });
  const url = `https://api.themoviedb.org/3${p}?` + new URLSearchParams({ language: 'en-US', ...q, api_key: KEY });
  const hit = cache.get(url);
  if (hit && Date.now() - hit.t < 6e5) return res.json(hit.d);
  try {
    const r = await fetch(url), d = await r.json();
    if (!r.ok) return res.status(r.status).json(d);
    cache.set(url, { t: Date.now(), d });
    res.json(d);
  } catch { res.status(502).json({ error: 'Catalogue service unreachable' }); }
});

// Your own library: any video in MEDIA_DIR, subtitles matched by filename
const VID = /\.(mp4|m4v|webm|mov)$/i, SUB = /\.(vtt|srt)$/i;
const walk = d => fs.readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

app.get('/api/library', (req, res) => {
  if (!fs.existsSync(ROOT)) return res.json([]);
  const all = walk(ROOT).map(f => path.relative(ROOT, f).split(path.sep).join('/'));
  res.json(all.filter(f => VID.test(f)).map(f => {
    const base = f.replace(/\.[^.]+$/, '');
    const subs = all.filter(s => SUB.test(s) && s.startsWith(base + '.')).map(s => {
      const parts = s.slice(base.length + 1).split('.');
      return { url: '/subs/' + encodeURI(s), lang: parts.length > 1 ? parts[0].toLowerCase() : 'en' };
    });
    return { title: path.basename(base).replace(/[._]+/g, ' ').trim(), url: '/media/' + encodeURI(f), subs };
  }));
});

app.use('/media', express.static(ROOT)); // HTTP Range support = instant seeking, no full download

app.get('/subs/*', (req, res) => {
  const f = path.resolve(ROOT, decodeURIComponent(req.params[0]));
  if (!f.startsWith(ROOT + path.sep) || !fs.existsSync(f)) return res.sendStatus(404);
  let t = fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '');
  if (/\.srt$/i.test(f)) t = 'WEBVTT\n\n' + t.replace(/\r/g, '').replace(/(\d\d:\d\d:\d\d),(\d{3})/g, '$1.$2');
  res.type('text/vtt').send(t);
});

app.listen(PORT, () => console.log(`StreamVault running on http://localhost:${PORT}`));
