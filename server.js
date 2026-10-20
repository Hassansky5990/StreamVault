const express = require('express');
const path = require('path');
const app = express();

const TMDB_KEY = process.env.TMDB_API_KEY || '6c9d63d13035995f6127e4b5c3689cb4';

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// TMDB API Proxy Route
app.get('/api/tmdb', async (req, res) => {
  try {
    const { path: tmdbPath, ...queryParams } = req.query;
    if (!tmdbPath) return res.status(400).json({ error: 'Missing TMDB path parameter' });

    const url = new URL(`https://api.themoviedb.org/3${tmdbPath}`);
    url.searchParams.append('api_key', TMDB_KEY);

    for (const [key, val] of Object.entries(queryParams)) {
      url.searchParams.append(key, val);
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `TMDB responded with status ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB Proxy Error:', err);
    res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
});

// Internet Archive Public Domain API Proxy
app.get('/api/free', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(`https://archive.org/advancedsearch.php?q=collection%3Afeature_films&rows=20&page=${page}&output=json`);
    const data = await response.json();
    const docs = (data.response?.docs || []).map(doc => ({ id: doc.identifier, title: doc.title }));
    res.json(docs);
  } catch (err) {
    res.json([]);
  }
});

// Fallback route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
