Const express = require('express');
const path = require('path');
const app = express();

const TMDB_KEY = process.env.TMDB_API_KEY || '6c9d63d13035995f6127e4b5c3689cb4'; // Or put your TMDB key here directly for testing

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// TMDB API Proxy Route
app.get('/api/tmdb', async (req, res) => {
  try {
    const { path: tmdbPath, ...queryParams } = req.query;
    const url = new URL(`https://api.themoviedb.org/3${tmdbPath}`);
    url.searchParams.append('api_key', TMDB_KEY);
    
    for (const [key, val] of Object.entries(queryParams)) {
      url.searchParams.append(key, val);
    }

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
});

// Free Internet Archive movies proxy
app.get('/api/free', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await fetch(`https://archive.org/advancedsearch.php?q=collection%3Afeature_films&rows=20&page=${page}&output=json`);
    const data = await response.json();
    const docs = data.response.docs.map(doc => ({ id: doc.identifier, title: doc.title }));
    res.json(docs);
  } catch (err) {
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
