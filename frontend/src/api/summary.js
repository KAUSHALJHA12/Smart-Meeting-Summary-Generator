const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

async function handle(res) {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function summarize(transcript) {
  return fetch(`${API_URL}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  }).then(handle);
}

export function regenerateSection(transcript, section, existing) {
  return fetch(`${API_URL}/api/summarize/section`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, section, existing }),
  }).then(handle);
}
