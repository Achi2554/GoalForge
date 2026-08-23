const ALLOWED_MODELS = new Set([
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-pro'
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: { message: 'Gemini API is not configured on the server.' } });
  }

  const payload = req.body;
  if (!payload) {
    return res.status(400).json({ error: { message: 'Invalid JSON request.' } });
  }

  const model = ALLOWED_MODELS.has(payload?.model) ? payload.model : 'gemini-1.5-flash-latest';
  if (!payload?.requestBody || typeof payload.requestBody !== 'object') {
    return res.status(400).json({ error: { message: 'Missing AI request data.' } });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  try {
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload.requestBody)
    });
    const responseBody = await geminiResponse.json();
    return res.status(geminiResponse.status).json(responseBody);
  } catch (err) {
    return res.status(502).json({ error: { message: 'Unable to reach Gemini AI.' } });
  }
}
