export default async function handler(req, res) {
  const TMDB_KEY = process.env.TMDB_API_KEY || '6c9d63d13035995f6127e4b5c3689cb4';

  try {
    const { path: tmdbPath, ...queryParams } = req.query;
    if (!tmdbPath) return res.status(400).json({ error: 'Missing TMDB path' });

    const url = new URL(`https://api.themoviedb.org/3${tmdbPath}`);
    url.searchParams.append('api_key', TMDB_KEY);

    for (const [key, val] of Object.entries(queryParams)) {
      url.searchParams.append(key, val);
    }

    const response = await fetch(url);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
}
