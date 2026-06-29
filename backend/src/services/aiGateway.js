/**
 * Calls Google's Gemini API directly using a free API key from Google AI Studio.
 * Get a free key at https://aistudio.google.com/apikey
 *
 * The key is read server-side from process.env.GEMINI_API_KEY and never sent to the browser.
 */

const DEFAULT_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash'];


function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini({ apiKey, system, user, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

export async function chatJSON({ system, user, model }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      'GEMINI_API_KEY is not configured on the server. Get a free key at https://aistudio.google.com/apikey and add it to backend/.env',
    );
    err.status = 500;
    throw err;
  }

  const models = model ? [model] : DEFAULT_MODELS;
  let lastError;

  for (const selectedModel of models) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const data = await callGemini({ apiKey, system, user, model: selectedModel });
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!content) {
          const err = new Error('Gemini returned an empty response.');
          err.status = 502;
          throw err;
        }

        try {
          return JSON.parse(content);
        } catch {
          const err = new Error('Gemini returned malformed JSON.');
          err.status = 502;
          throw err;
        }
      } catch (err) {
        lastError = err;

        if (err.status === 401 || err.status === 403) {
          const authErr = new Error('Invalid Gemini API key. Check GEMINI_API_KEY in backend/.env.');
          authErr.status = 401;
          throw authErr;
        }

        const canRetrySameModel = err.status === 429 && attempt < 2;
        if (canRetrySameModel) {
          await wait(1500 * (attempt + 1));
          continue;
        }

        break;
      }
    }
  }

  if (lastError?.status === 429) {
    const err = new Error(
      'Rate limited by Gemini. Wait 60 seconds, then try again. If it keeps happening, your free key has reached its temporary quota.',
    );
    err.status = 429;
    throw err;
  }

  const status = lastError?.status || 502;
  const message = lastError?.message || 'Unknown Gemini error';
  const err = new Error(`Gemini API error (${status}): ${message}`);
  err.status = 502;
  throw err;
}
