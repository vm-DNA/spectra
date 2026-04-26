/**
 * Frontend API helpers for the Gemma-powered backend.
 */

export async function adaptLesson({ file, rawContent, subject, students }) {
  const formData = new FormData();
  if (file) formData.append('file', file);
  formData.append('rawContent', rawContent || '');
  formData.append('subject', subject || 'General');
  formData.append('students', JSON.stringify(students));

  const res = await fetch('/api/adapt-lesson', { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Adaptation failed' }));
    throw new Error(err.error || 'Adaptation failed');
  }
  const data = await res.json();

  // Backward compatibility: if backend returns a raw map, return as-is.
  if (data && !data.results && typeof data === 'object') {
    return data;
  }

  return data.results || {};
}

export async function getReframe({ question, studentProfile, wrongAttempts }) {
  const res = await fetch('/api/reframe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, studentProfile, wrongAttempts }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Reframe failed' }));
    throw new Error(err.error || 'Reframe failed');
  }
  return res.json();
}

export async function tutorChat({ message, question, studentProfile }) {
  const res = await fetch('/api/tutor-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, question, studentProfile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Tutor chat failed' }));
    throw new Error(err.error || 'Tutor chat failed');
  }
  return res.json();
}
