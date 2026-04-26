import React, { useState } from 'react';
import { STUDENTS, ASSIGNMENTS } from '../../lib/mockData';
import { Alert } from '../../components/UI';
import { adaptLesson } from '../../lib/gemmaApi';
import { useLessonContext } from '../../lib/LessonContext';

const SUBJECTS = ['Math', 'Reading', 'Science', 'Social Skills', 'Writing'];

export default function UploadAssignment() {
  const [subject, setSubject]     = useState('Math');
  const [content, setContent]     = useState(ASSIGNMENTS[0].rawContent);
  const [dueDate, setDueDate]     = useState('Apr 26, 2026');
  const [assignTo, setAssignTo]   = useState('all');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [file, setFile]           = useState(null);
  const [adaptedVersions, setAdaptedVersions] = useState(null);
  const [previewStudent, setPreviewStudent]   = useState('jamie');
  const [error, setError]         = useState(null);
  const [approved, setApproved]   = useState(false);

  const { saveLesson } = useLessonContext();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawContent = content || '';

      if (!rawContent.trim() && !file) {
        setError('Please provide lesson content or upload a file.');
        return;
      }

      const targetStudents = assignTo === 'all'
        ? STUDENTS
        : STUDENTS.filter(s => s.id === assignTo);

      const studentsPayload = targetStudents.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        learningStyles: s.learningStyles,
        characters: s.characters,
        sensoryPrefs: s.sensoryPrefs,
        frustrationTriggers: s.frustrationTriggers,
      }));

      const result = await adaptLesson({
        file,
        rawContent,
        subject,
        students: studentsPayload,
      });

      setAdaptedVersions(result);
      localStorage.setItem('spectra_adapted_lesson', JSON.stringify(result));
      setSubmitted(true);
    } catch (err) {
      console.error('Adaptation error:', err);
      setError(err.message || 'Failed to generate adapted lessons. Check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    if (adaptedVersions) {
      const assignmentId = ASSIGNMENTS[0].id;
      saveLesson(assignmentId, adaptedVersions);
      setApproved(true);
    }
  };

  const preview = adaptedVersions?.[previewStudent];
  const previewStudentData = STUDENTS.find(s => s.id === previewStudent);

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="page-title">New lesson</div>
          <div className="page-sub">Gemma will adapt this for each student's learning profile automatically</div>
        </div>
      </div>

      {error && (
        <Alert variant="coral">
          {error}
        </Alert>
      )}

      {approved && (
        <Alert variant="info">
          Lessons approved and assigned! Students can now access the adapted content.
        </Alert>
      )}

      {submitted && !approved && (
        <Alert variant="info">
          Adapted versions generated for {Object.keys(adaptedVersions || {}).length} students. Review the preview and click "Approve + Assign" when ready.
        </Alert>
      )}

      <div className="grid-2" style={{ gap: 16 }}>

        {/* Input form */}
        <div className="card">
          <div className="card-title">Lesson content</div>
          <div className="stack" style={{ gap: 14 }}>
            <div>
              <label className="label">Subject</label>
              <select className="select-input" value={subject} onChange={e => setSubject(e.target.value)}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Paste lesson text or instructions</label>
              <textarea
                className="textarea"
                style={{ minHeight: 120 }}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
            <div className="grid-2">
              <div>
                <label className="label">Due date</label>
                <input className="input" type="text" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Upload file (optional)</label>
                <input
                  className="input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={e => setFile(e.target.files[0] || null)}
                />
              </div>
            </div>
            <div>
              <label className="label">Assign to</label>
              <select className="select-input" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                <option value="all">All students ({STUDENTS.length})</option>
                {STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name} only</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary">Preview raw</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Generating with Gemma...' : 'Adapt + assign with Gemma'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview of adapted version */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="card-title" style={{ margin: 0 }}>
              Preview — {previewStudentData?.name || 'Student'}
            </div>
            {submitted && adaptedVersions && (
              <select
                className="select-input"
                style={{ width: 'auto', fontSize: 12 }}
                value={previewStudent}
                onChange={e => setPreviewStudent(e.target.value)}
              >
                {Object.keys(adaptedVersions).map(sid => {
                  const s = STUDENTS.find(st => st.id === sid);
                  return <option key={sid} value={sid}>{s?.name || sid}</option>;
                })}
              </select>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              <div>Gemma is analyzing the worksheet and generating personalized lessons...</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>This may take 10–30 seconds per student.</div>
            </div>
          )}

          {!loading && preview && !preview.error && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '1rem', fontSize: 13, lineHeight: 1.7 }}>
              <div className="char-bubble">
                {previewStudentData?.characters?.[0] || '⭐'} says: Let's learn!
              </div>
              <p style={{ marginBottom: 8 }}>
                {preview.adaptedText}
              </p>
              {preview.formula && (
                <div style={{
                  background: 'var(--purple-light)', borderRadius: 8, padding: 12,
                  textAlign: 'center', fontSize: 18, fontWeight: 500, color: 'var(--purple-dark)', margin: '10px 0',
                }}>
                  {preview.formula}
                </div>
              )}
              {preview.hint && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {preview.hint}
                </p>
              )}
              {preview.questions && preview.questions.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12 }}>
                  <strong>Questions ({preview.questions.length}):</strong>
                  {preview.questions.map((q, i) => (
                    <div key={i} style={{ marginTop: 4, paddingLeft: 8 }}>
                      {i + 1}. {q.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!loading && preview && preview.error && (
            <div style={{ padding: '1rem', color: 'var(--coral-dark)', background: 'var(--coral-light)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
              Failed to generate for this student: {preview.error}
            </div>
          )}

          {!loading && !preview && !submitted && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '1rem', fontSize: 13, lineHeight: 1.7 }}>
              <div className="char-bubble">🐕 Bluey says: Pizza time!</div>
              <p style={{ marginBottom: 8 }}>
                Bluey and Bingo are sharing a pizza with <strong>8 slices</strong> — that's the bottom number!
                Bluey takes <strong>3</strong>, Bingo takes <strong>2</strong>. How many do they have together?
              </p>
              <div style={{
                background: 'var(--purple-light)', borderRadius: 8, padding: 12,
                textAlign: 'center', fontSize: 18, fontWeight: 500, color: 'var(--purple-dark)', margin: '10px 0',
              }}>
                ³⁄₈ + ²⁄₈ = ?
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Just add the top numbers! 3 + 2 = 5, so the answer is ⁵⁄₈.
              </p>
            </div>
          )}

          {/* Placeholder for Cloudinary image */}
          <div style={{
            marginTop: 12, background: 'var(--teal-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--teal-dark)',
          }}>
            {preview?.imageUrl ? (
              <div>
                <div style={{ marginBottom: 8 }}>📷 Cloudinary image ready</div>
                <img
                  src={preview.imageUrl}
                  alt="Lesson visual"
                  style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border-md)' }}
                />
              </div>
            ) : (
              <>
                📷 Cloudinary image pending
                {preview?.cloudinaryPrompt && ` (${preview.cloudinaryPrompt})`}
                {preview?.imageStatus ? ` — ${preview.imageStatus}` : ''}
              </>
            )}
          </div>

          {/* ElevenLabs audio */}
          <div style={{
            marginTop: 8, background: 'var(--blue-light)', borderRadius: 'var(--radius-sm)',
            padding: 12, fontSize: 12, color: 'var(--blue-dark)',
          }}>
            {preview?.audioUrl ? (
              <div>
                <div style={{ marginBottom: 8 }}>🔊 ElevenLabs narration ready</div>
                <audio controls src={preview.audioUrl} style={{ width: '100%' }}>
                  Your browser does not support audio playback.
                </audio>
              </div>
            ) : (
              <>
                🔊 ElevenLabs narration pending
                {preview?.audioStatus ? ` — ${preview.audioStatus}` : ''}
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleSubmit} disabled={loading}>
              Regenerate
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleApprove}
              disabled={!submitted || approved}
            >
              {approved ? 'Approved!' : 'Approve + Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
