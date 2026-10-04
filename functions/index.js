const { onRequest } = require('firebase-functions/v2/https');

const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '7a5003e1c86c4b679700f6e57e05b058.CDj2GHLYyeLHGiYuhh-IseMn';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'https://ollama.com';

exports.ollama = onRequest({ cors: true, timeoutSeconds: 300, memory: '512MiB' }, async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const targetUrl = `${OLLAMA_HOST}/api/chat`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OLLAMA_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.text();
    res.status(response.status).set('Content-Type', 'application/json').send(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to forward to Ollama' });
  }
});
