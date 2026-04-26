import React, { useState } from 'react';
import { STUDENTS, ASSIGNMENTS, PUBLISHED_ASSIGNMENTS } from '../../lib/mockData';
import { Alert, Badge, Avatar, ProgressBar } from '../../components/UI';
import { adaptLesson, extractTextFromFile } from '../../lib/geminiClient';
import { useLessonContext } from '../../lib/LessonContext';
import { DEMO_ADAPTED_LESSONS, DEMO_WORKSHEET, DEMO_FRUSTRATION_EVENTS, DEMO_APPROVED_HISTORY } from '../../lib/demoData';

const SUBJECTS = ['Math', 'Reading', 'Science', 'Social Skills', 'Writing'];

const MODALITY_META = {
  Visual:      { icon: '🖼️', label: 'Visual',      color: '#7C3AED', bg: '#F3F0FF' },
  Auditory:    { icon: '🔊', label: 'Auditory',    color: '#0D9488', bg: '#E6FFFA' },
  Reading:     { icon: '📖', label: 'Reading',     color: '#B45309', bg: '#FFF8E7' },
  Kinesthetic: { icon: '🎮', label: 'Kinesthetic', color: '#DC2626', bg: '#FFF1F0' },
};

export default function UploadAssignment() {
  const [subject, setSubject]     = useState('Math');
  const [content, setContent]     = useState(ASSIGNMENTS[0].rawContent);
  const [dueDate, setDueDate]     = useState('Apr 26, 2026');
  const [assignTo, setAssignTo]   = useState('all');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [file, setFile]           = useState(null);
  const [adaptedVersions, setAdaptedVersions] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [generatingStudents, setGeneratingStudents] = useState({});
  const [error, setError]         = useState(null);
  const [approved, setApproved]   = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const { saveLesson } = useLessonContext();

  const targetStudents = assignTo === 'all'
    ? STUDENTS
    : STUDENTS.filter(s => s.id === assignTo);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setApproved(false);
    setSelectedStudent(null);

    const initialStatus = {};
    targetStudents.forEach(s => { initialStatus[s.id] = 'generating'; });
    setGeneratingStudents(initialStatus);
    setAdaptedVersions(null);

    try {
      let rawContent = content || '';

      if (file) {
        const extractedText = await extractTextFromFile(file);
        rawContent = rawContent ? `${rawContent}\n\n${extractedText}` : extractedText;
      }

      if (!rawContent.trim()) {
        setError('Please provide lesson content or upload a file.');
        setLoading(false);
        return;
      }

      const studentsPayload = targetStudents.map(s => ({
        id: s.id,
        name: s.name,
        grade: s.grade,
        learningStyles: s.learningStyles,
        characters: s.characters,
        sensoryPrefs: s.sensoryPrefs,
        frustrationTriggers: s.frustrationTriggers,
        sensoryPrefs: s.sensoryPrefs,
      }));

      const result = await adaptLesson(rawContent, subject, studentsPayload);

      const finalStatus = {};
      targetStudents.forEach(s => {
        const r = result?.[s.id];
        finalStatus[s.id] = r && !r.error ? 'ready' : 'error';
      });
      setGeneratingStudents(finalStatus);
      setAdaptedVersions(result);
      localStorage.setItem('spectra_adapted_lesson', JSON.stringify(result));
      setSubmitted(true);
      // Auto-select first student
      if (targetStudents.length > 0) setSelectedStudent(targetStudents[0].id);
    } catch (err) {
      console.error('Adaptation error:', err);
      setError(err.message || 'Failed to generate adapted lessons.');
      const errStatus = {};
      targetStudents.forEach(s => { errStatus[s.id] = 'error'; });
      setGeneratingStudents(errStatus);
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

  const handleReject = () => {
    setAdaptedVersions(null);
    setSubmitted(false);
    setSelectedStudent(null);
    setGeneratingStudents({});
  };

  // Demo mode: instantly load pre-generated lessons
  const DEMO_STUDENTS = STUDENTS.filter(s => DEMO_ADAPTED_LESSONS[s.id]); // Only students with demo data
  const handleLoadDemo = () => {
    setLoading(false);
    setError(null);
    setIsDemoMode(true);
    setContent(DEMO_WORKSHEET.rawContent);
    setSubject(DEMO_WORKSHEET.subject);
    const demoStatus = {};
    DEMO_STUDENTS.forEach(s => { demoStatus[s.id] = 'ready'; });
    setGeneratingStudents(demoStatus);
    setAdaptedVersions(DEMO_ADAPTED_LESSONS);
    localStorage.setItem('spectra_adapted_lesson', JSON.stringify(DEMO_ADAPTED_LESSONS));
    setSubmitted(true);
    setSelectedStudent(DEMO_STUDENTS[0].id);
  };

  const preview = adaptedVersions?.[selectedStudent];
  const previewStudentData = STUDENTS.find(s => s.id === selectedStudent);
  const previewModality = previewStudentData?.learningStyles?.[0] || 'Visual';
  const modalMeta = MODALITY_META[previewModality] || MODALITY_META.Visual;

  return (
    <div className="page">

      <div className="page-header">
        <div>
          <div className="page-title">New lesson</div>
          <div className="page-sub">Gemma adapts this worksheet for each student's learning profile</div>
        </div>
      </div>

      {error && <Alert variant="coral">{error}</Alert>}
      {approved && <Alert variant="info">Lessons approved and assigned! Students can now access the adapted content.</Alert>}

      {/* ─── INPUT FORM ─── */}
      {!submitted && (
        <div className="card" style={{ marginBottom: 16 }}>
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
              <button
                className="btn btn-secondary"
                onClick={handleLoadDemo}
                style={{ background: '#F3F0FF', color: '#7C3AED', border: '1.5px solid #7C3AED' }}
              >
                Load Demo (instant)
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => window.open('/demo', '_blank')}
                style={{ background: '#E6FFFA', color: '#0D9488', border: '1.5px solid #0D9488' }}
              >
                Student Demo View
              </button>
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
      )}

      {/* ─── GENERATING / RESULTS VIEW ─── */}
      {(loading || submitted) && (
        <div style={{ display: 'flex', gap: 16, minHeight: 500 }}>

          {/* SIDEBAR — Student list */}
          <div style={{ width: 260, flexShrink: 0 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                fontWeight: 600, fontSize: 14, background: 'var(--bg)',
              }}>
                Students ({(isDemoMode ? DEMO_STUDENTS : targetStudents).length})
              </div>
              {(isDemoMode ? DEMO_STUDENTS : targetStudents).map(student => {
                const status = generatingStudents[student.id] || 'pending';
                const isSelected = selectedStudent === student.id;
                const modality = student.learningStyles?.[0] || 'Visual';
                const mMeta = MODALITY_META[modality] || MODALITY_META.Visual;
                return (
                  <div
                    key={student.id}
                    onClick={() => status === 'ready' && setSelectedStudent(student.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'var(--purple-light)' : 'transparent',
                      cursor: status === 'ready' ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                  >
                    <Avatar
                      initials={student.initials}
                      bg={student.avatarColor.bg}
                      color={student.avatarColor.text}
                      size={32}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{student.name}</div>
                      <div style={{ fontSize: 11, color: mMeta.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {mMeta.icon} {mMeta.label}
                      </div>
                    </div>
                    <div>
                      {status === 'generating' && (
                        <span style={{ fontSize: 11, color: 'var(--amber-dark)', fontWeight: 500 }}>
                          Generating...
                        </span>
                      )}
                      {status === 'ready' && (
                        <span style={{ fontSize: 16 }}>✓</span>
                      )}
                      {status === 'error' && (
                        <span style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 500 }}>Error</span>
                      )}
                      {status === 'pending' && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Waiting</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {submitted && !approved && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleApprove}>
                  Approve + Assign All
                </button>
                <button className="btn btn-secondary" onClick={handleReject}>
                  Reject + Redo
                </button>
                <button className="btn btn-secondary" onClick={handleSubmit} disabled={loading}>
                  Regenerate All
                </button>
              </div>
            )}
          </div>

          {/* MAIN — Student preview (what the student will see) */}
          <div style={{ flex: 1 }}>
            {loading && !selectedStudent && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
                  Gemma is generating personalized lessons...
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  This takes about 30 seconds per student. Each student gets content tailored to their learning style and favorite character.
                </div>
              </div>
            )}

            {selectedStudent && preview && !preview.error && (
              <StudentPreview
                student={previewStudentData}
                preview={preview}
                modality={previewModality}
                modalMeta={modalMeta}
              />
            )}

            {selectedStudent && preview && preview.error && (
              <div className="card" style={{ padding: '2rem', color: 'var(--coral-dark)', background: 'var(--coral-light)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Error generating for {previewStudentData?.name}</div>
                <div style={{ fontSize: 13 }}>{preview.error}</div>
              </div>
            )}

            {selectedStudent && !preview && submitted && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                No data available for this student yet.
              </div>
            )}

            {!selectedStudent && submitted && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>👈</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>Select a student from the sidebar</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Click on a student to preview what they will see</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Frustration Events (live demo) ─── */}
      {DEMO_FRUSTRATION_EVENTS.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="page-title" style={{ fontSize: 16 }}>Live Frustration Alerts</div>
              <div className="page-sub">AI-detected frustration events and automatic interventions</div>
            </div>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {DEMO_FRUSTRATION_EVENTS.map(evt => (
              <div key={evt.id} className="card" style={{
                borderLeft: `4px solid ${evt.severity === 'high' ? 'var(--coral)' : 'var(--amber)'}`,
                padding: '12px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{evt.studentName}</span>
                      <Badge variant={evt.severity === 'high' ? 'coral' : 'amber'}>
                        {evt.severity === 'high' ? 'High Frustration' : 'Moderate'}
                      </Badge>
                      <Badge variant="blue">{evt.triggerType.replace('_', ' ')}</Badge>
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>
                      <strong>Trigger:</strong> {evt.trigger}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                      {evt.question}
                    </div>
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--coral)' }}>{evt.beforeState}</span>
                      {' → '}
                      <span style={{ color: 'var(--teal)' }}>{evt.afterState}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 24, fontWeight: 700,
                      color: evt.frustrationScore >= 70 ? 'var(--coral)' : 'var(--amber)',
                    }}>
                      {evt.frustrationScore}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>frustration score</div>
                    <Badge variant={evt.status === 'auto-reframed' ? 'teal' : 'amber'} style={{ marginTop: 4 }}>
                      {evt.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Approved History ─── */}
      {DEMO_APPROVED_HISTORY.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <div className="page-title" style={{ fontSize: 16 }}>Approved Assignment History</div>
              <div className="page-sub">Past approved assignments with student performance data</div>
            </div>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {DEMO_APPROVED_HISTORY.map(hist => (
              <div key={hist.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{hist.assignmentTitle}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                      <Badge variant="blue">{hist.subject}</Badge>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Approved {new Date(hist.approvedAt).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        · {hist.studentCount} students
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {hist.avgScore !== null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 600, color: hist.avgScore >= 70 ? 'var(--teal)' : 'var(--coral)' }}>
                          {hist.avgScore}%
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>avg score</div>
                      </div>
                    )}
                    {hist.frustrationEvents > 0 && (
                      <Badge variant={hist.frustrationEvents >= 3 ? 'coral' : 'amber'}>
                        {hist.frustrationEvents} frustration events
                      </Badge>
                    )}
                    <Badge variant={hist.status === 'active' ? 'teal' : 'gray'}>{hist.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Published Assignments ─── */}
      <div style={{ marginTop: 16 }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="page-title" style={{ fontSize: 16 }}>Published Assignments</div>
            <div className="page-sub">Assignments that have been assigned to students</div>
          </div>
        </div>

        {PUBLISHED_ASSIGNMENTS.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No published assignments yet. Create and approve a lesson above to publish it.
          </div>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            {PUBLISHED_ASSIGNMENTS.map(assignment => {
              const completedCount = Object.values(assignment.studentStatus).filter(s => s.status === 'completed').length;
              const inProgressCount = Object.values(assignment.studentStatus).filter(s => s.status === 'in-progress').length;
              const notStartedCount = Object.values(assignment.studentStatus).filter(s => s.status === 'not-started').length;
              const totalCount = assignment.assignedTo.length;
              const progressPct = Math.round((completedCount / totalCount) * 100);

              return (
                <div key={assignment.id} className="card">
                  <div className="row-between" style={{ marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{assignment.title}</div>
                      <div className="row" style={{ gap: 6, marginTop: 4 }}>
                        <Badge variant="blue">{assignment.subject}</Badge>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Published {assignment.publishedDate} · Due {assignment.dueDate}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{completedCount}/{totalCount} completed</div>
                      <ProgressBar pct={progressPct} variant="teal" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 11 }}>
                    <Badge variant="teal">{completedCount} completed</Badge>
                    <Badge variant="amber">{inProgressCount} in progress</Badge>
                    <Badge variant="gray">{notStartedCount} not started</Badge>
                  </div>
                  <div style={{ borderTop: '0.5px solid var(--border)' }}>
                    {assignment.assignedTo.map(studentId => {
                      const student = STUDENTS.find(s => s.id === studentId);
                      const status = assignment.studentStatus[studentId];
                      if (!student || !status) return null;
                      const statusVariant = status.status === 'completed' ? 'teal'
                        : status.status === 'in-progress' ? 'amber' : 'gray';
                      const statusText = status.status === 'completed' ? 'Completed'
                        : status.status === 'in-progress' ? 'In Progress' : 'Not Started';
                      return (
                        <div key={studentId} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 4px', borderBottom: '0.5px solid var(--border)',
                        }}>
                          <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={28} />
                          <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{student.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{status.adaptedMode}</span>
                          <Badge variant={statusVariant}>{statusText}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Student Preview Component ─── */
function StudentPreview({ student, preview, modality, modalMeta }) {
  const character = student?.characters?.[0] || 'Character';
  const questions = preview?.questions || [];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        padding: '12px 20px', background: modalMeta.bg,
        borderBottom: `2px solid ${modalMeta.color}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {student?.name}'s Preview
          </div>
          <div style={{ fontSize: 12, color: modalMeta.color, marginTop: 2 }}>
            {modalMeta.icon} {modalMeta.label} Mode · Themed to {character}
          </div>
        </div>
        <Badge variant="blue" style={{ fontSize: 13 }}>
          {modality}
        </Badge>
      </div>

      <div style={{ padding: 20 }}>
        {/* Character bubble */}
        <div style={{
          background: modalMeta.bg, borderRadius: 12, padding: '12px 16px',
          fontSize: 14, marginBottom: 16, border: `1px solid ${modalMeta.color}20`,
        }}>
          <strong>{character} says:</strong>{' '}
          {preview.adaptedText?.slice(0, 300)}{preview.adaptedText?.length > 300 ? '...' : ''}
        </div>

        {/* Modality-specific preview */}
        {modality === 'Visual' && (
          <VisualPreview preview={preview} character={character} />
        )}
        {modality === 'Auditory' && (
          <AuditoryPreview preview={preview} character={character} />
        )}
        {modality === 'Reading' && (
          <ReadingPreview preview={preview} character={character} />
        )}
        {modality === 'Kinesthetic' && (
          <KinestheticPreview preview={preview} character={character} />
        )}

        {/* Questions preview (skip if interactive HTML already has questions) */}
        {questions.length > 0 && !preview?.interactiveHtml && (
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
              Questions ({questions.length})
            </div>
            {questions.map((q, i) => (
              <div key={q.id || i} style={{
                padding: '10px 14px', background: 'var(--bg)', borderRadius: 8,
                marginBottom: 8, fontSize: 13,
              }}>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{i + 1}. {q.text}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(q.options || []).map((opt, oi) => (
                    <span key={oi} style={{
                      padding: '4px 12px', borderRadius: 6, fontSize: 12,
                      border: '1px solid var(--border-md)',
                      background: 'transparent',
                      fontWeight: 400,
                      cursor: 'default',
                    }}>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Visual Preview ─── */
function VisualPreview({ preview, character }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#7C3AED' }}>
        Visual Mode — Cloudinary images as teaching objects, themed to {character}
      </div>
      {preview?.interactiveHtml ? (
        <div style={{ marginBottom: 12 }}>
          <iframe
            title="Visual lesson preview"
            srcDoc={preview.interactiveHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%', minHeight: 600, border: '2px solid #C4B5FD',
              borderRadius: 10, background: '#fff',
            }}
          />
          <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 6 }}>
            SpongeBob images from Cloudinary used as visual teaching objects
          </div>
        </div>
      ) : (
        <div style={{
          background: '#F5F3FF', borderRadius: 8, padding: 12,
          fontSize: 12, color: '#7C3AED', marginBottom: 12,
        }}>
          Visual lesson will use Cloudinary character images to teach concepts
        </div>
      )}
    </div>
  );
}

/* ─── Auditory Preview ─── */
function AuditoryPreview({ preview, character }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#0D9488' }}>
        Auditory Mode — ElevenLabs narration by {character}
      </div>
      {preview?.interactiveHtml ? (
        <div style={{ marginBottom: 12 }}>
          <iframe
            title="Auditory lesson preview"
            srcDoc={preview.interactiveHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%', minHeight: 600, border: '2px solid #5EEAD4',
              borderRadius: 10, background: '#fff',
            }}
          />
          <div style={{ fontSize: 11, color: '#0D9488', marginTop: 6 }}>
            Audio-only narration by {character} — low stimuli, focused listening
          </div>
        </div>
      ) : preview?.audioUrl ? (
        <div style={{
          background: '#E6FFFA', borderRadius: 8, padding: 16,
          textAlign: 'center', marginBottom: 12,
        }}>
          <audio controls src={preview.audioUrl} style={{ width: '100%' }} />
          <div style={{ fontSize: 11, color: '#0D9488', marginTop: 8 }}>
            Student can listen and respond by talking to {character}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#E6FFFA', borderRadius: 8, padding: 12,
          fontSize: 12, color: '#0D9488', marginBottom: 12,
        }}>
          Audio narration will be generated via ElevenLabs
        </div>
      )}
      {/* Narration script hidden — low stimuli auditory mode */}
    </div>
  );
}

/* ─── Reading Preview ─── */
function ReadingPreview({ preview, character }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#B45309' }}>
        Reading Mode — Text-based lesson with {character}
      </div>
      {preview?.chatContext && (
        <div style={{
          background: '#FFF8E7', border: '1px solid #F0DFA0', borderRadius: 8,
          padding: '12px 16px', marginBottom: 12, fontSize: 13, lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Key Concepts</div>
          {preview.chatContext}
        </div>
      )}
      {preview?.adaptedText && (
        <div style={{
          fontSize: 14, lineHeight: 1.7, marginBottom: 12,
          padding: '12px 16px', background: '#FFFDF5', borderRadius: 8,
        }}>
          {preview.adaptedText}
        </div>
      )}
      <div style={{ fontSize: 11, color: '#B45309' }}>
        Student will read the text and select answers. Chat tutor available for questions.
      </div>
    </div>
  );
}

/* ─── Kinesthetic Preview ─── */
function KinestheticPreview({ preview, character }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#DC2626' }}>
        Kinesthetic Mode — Interactive HTML/CSS by Gemma, themed to {character}
      </div>
      {preview?.interactiveHtml ? (
        <div style={{ marginBottom: 12 }}>
          <iframe
            title="Interactive lesson preview"
            srcDoc={preview.interactiveHtml}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: '100%', minHeight: 600, border: '2px solid #FCA5A5',
              borderRadius: 10, background: '#fff',
            }}
          />
          <div style={{ fontSize: 11, color: '#DC2626', marginTop: 6 }}>
            {Math.round((preview.interactiveHtml.length) / 1024)}KB interactive HTML generated by Gemma
          </div>
        </div>
      ) : preview?.interactivePlan?.length ? (
        <div style={{ marginBottom: 12 }}>
          {preview.interactivePlan.map((step, i) => (
            <div key={i} style={{
              padding: '8px 14px', background: i % 2 === 0 ? '#FFF1F0' : 'var(--bg)',
              borderRadius: 8, marginBottom: 6, fontSize: 13,
            }}>
              <strong>Step {i + 1}:</strong> {step.instruction}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: '#FFF1F0', borderRadius: 8, padding: 12,
          fontSize: 12, color: '#DC2626', marginBottom: 12,
        }}>
          Interactive activity will be generated by Gemma
        </div>
      )}
    </div>
  );
}
