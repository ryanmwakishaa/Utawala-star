// Talks to the Google Apps Script backend so that content saved in the
// Admin dashboard is visible to every visitor, not just the browser that saved it.

const CONTENT_URL = 'https://script.google.com/macros/s/AKfycbxVU4EYpFGuBtRCwiOgITPkozJ13aG00k_PItGCXB0u-d7zzZvQuNvIUSpdoYFDd5pDMw/exec';

const SECRET = 'utawala-star-secret-2026';

export async function fetchContent() {
  const res = await fetch(CONTENT_URL);
  if (!res.ok) throw new Error('Failed to load content');
  return res.json();
}

export async function saveContent(content) {
  const res = await fetch(CONTENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ secret: SECRET, content }),
  });
  if (!res.ok) throw new Error('Failed to save content');
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Save rejected');
  return data;
}