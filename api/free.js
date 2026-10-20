export default async function handler(req, res) {
  try {
    const page = req.query.page || 1;
    const response = await fetch(`https://archive.org/advancedsearch.php?q=collection%3Afeature_films&rows=20&page=${page}&output=json`);
    const data = await response.json();
    const docs = (data.response?.docs || []).map(doc => ({ id: doc.identifier, title: doc.title }));
    res.status(200).json(docs);
  } catch (err) {
    res.status(200).json([]);
  }
}
