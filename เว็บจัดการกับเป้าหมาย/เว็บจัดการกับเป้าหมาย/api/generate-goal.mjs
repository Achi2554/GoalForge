const ALLOWED_MODELS = new Set([
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash'
]);

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return Response.json({ error: { message: 'Method not allowed' } }, {
        status: 405,
        headers: { Allow: 'POST' }
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: { message: 'Gemini API is not configured on the server.' } }, { status: 503 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: { message: 'Invalid JSON request.' } }, { status: 400 });
    }

    const model = ALLOWED_MODELS.has(payload?.model) ? payload.model : 'gemini-1.5-flash';
    if (!payload?.requestBody || typeof payload.requestBody !== 'object') {
      return Response.json({ error: { message: 'Missing AI request data.' } }, { status: 400 });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.requestBody)
      });
      const responseBody = await geminiResponse.text();
      return new Response(responseBody, {
        status: geminiResponse.status,
        headers: {
          'Content-Type': geminiResponse.headers.get('content-type') || 'application/json',
          'Cache-Control': 'no-store'
        }
      });
    } catch {
      return Response.json({ error: { message: 'Unable to reach Gemini AI.' } }, { status: 502 });
    }
  }
};
