import React, { useState } from 'react';
import { STUDENTS, REPORT_ASSIGNMENTS, REPORT_SUBJECT_META } from '../../lib/mockData';
import { Avatar, Badge, ProgressBar } from '../../components/UI';

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderBoldMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

const TABS = [
  { key: 'overview',    label: 'Overview' },
  { key: 'per-student', label: 'Per student' },
  { key: 'questions',   label: 'Questions' },
  { key: 'insights',    label: 'Insights' },
];

const SUBJECT_ORDER = ['Mathematics', 'Reading', 'Science', 'Social Skills'];

function groupBySubject(assignments) {
  const grouped = {};
  assignments.forEach(a => {
    if (!grouped[a.subject]) grouped[a.subject] = [];
    grouped[a.subject].push(a);
  });
  return grouped;
}

// ---------- Overview Tab ----------
function OverviewTab({ data }) {
  const { overview } = data;
  const maxStrategy = Math.max(...(overview.reframesByStrategy.map(s => s.count) || [1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'AVG SCORE', value: `${overview.avgScore.value}%`, sub: overview.avgScore.sub, color: overview.avgScore.value >= 75 ? 'var(--teal)' : overview.avgScore.value >= 60 ? 'var(--amber)' : 'var(--coral)' },
          { label: 'COMPLETION', value: overview.completion.value, sub: overview.completion.sub, color: 'var(--teal)' },
          { label: 'AI REFRAMES', value: overview.aiReframes.value, sub: overview.aiReframes.sub, color: overview.aiReframes.value > 3 ? 'var(--coral)' : 'var(--text)' },
          { label: 'AVG ENGAGEMENT', value: overview.avgEngagement.value, sub: overview.avgEngagement.sub, color: 'var(--teal)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Score by Learning Style + Reframes by Strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <div className="card-title">SCORE BY LEARNING STYLE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {overview.scoreByStyle.map(s => (
              <div key={s.style} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 60, fontSize: 12, textAlign: 'right' }}>{s.style}</span>
                <div style={{ flex: 1, height: 12, background: 'var(--gray-light)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: s.color, borderRadius: 6 }} />
                </div>
                <span style={{ width: 35, fontSize: 12, fontWeight: 500 }}>{s.pct}%</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{overview.styleInsight}</div>
        </div>

        <div className="card">
          <div className="card-title">REFRAMES BY STRATEGY</div>
          {overview.reframesByStrategy.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {overview.reframesByStrategy.map(s => (
                  <div key={s.strategy} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 80, fontSize: 12, textAlign: 'right' }}>{s.strategy}</span>
                    <div style={{ flex: 1, height: 12, background: 'var(--gray-light)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${(s.count / maxStrategy) * 100}%`, height: '100%', background: s.color, borderRadius: 6 }} />
                    </div>
                    <span style={{ width: 20, fontSize: 12, fontWeight: 500 }}>{s.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{overview.strategyInsight}</div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{overview.strategyInsight}</div>
          )}
        </div>
      </div>

      {/* Question Difficulty Heatmap */}
      <div className="card">
        <div className="card-title">QUESTION DIFFICULTY HEATMAP</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {overview.heatmap.map(q => {
            const borderColor = q.flagged ? 'var(--coral)' : q.pct >= 80 ? 'var(--teal)' : q.pct >= 60 ? 'var(--amber)' : 'var(--coral)';
            const textColor = q.pct >= 80 ? 'var(--teal)' : q.pct >= 60 ? 'var(--amber)' : 'var(--coral)';
            return (
              <div key={q.label} style={{
                flex: 1, border: `1.5px solid ${borderColor}`, borderRadius: 10,
                padding: '12px 8px', textAlign: 'center',
                background: q.flagged ? 'var(--coral-light)' : 'transparent',
              }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{q.label}</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: textColor }}>{q.pct}%</div>
                <div style={{ fontSize: 11, color: q.reframes > 0 ? textColor : 'var(--text-muted)', marginTop: 2 }}>
                  {q.reframes} reframe{q.reframes !== 1 ? 's' : ''}{q.flagged ? ' ⚠' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- Per Student Tab ----------
function PerStudentTab({ data }) {
  const maxReframes = Math.max(...data.students.map(s => s.reframes), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Student performance table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>INDIVIDUAL STUDENT PERFORMANCE</div>
          <Badge variant="gray">{data.studentCount} students</Badge>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '160px 80px 120px 120px 80px 1fr',
          gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)',
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4,
        }}>
          <div>Student</div>
          <div>Mode</div>
          <div>Score</div>
          <div>Engagement</div>
          <div>Reframes</div>
          <div>Pattern detected</div>
        </div>

        {/* Student rows */}
        {data.students.map(row => {
          const student = STUDENTS.find(s => s.id === row.studentId);
          if (!student) return null;
          const scoreColor = row.score >= 80 ? 'teal' : row.score >= 60 ? 'amber' : 'coral';
          const engColor = row.engagement >= 80 ? 'teal' : row.engagement >= 60 ? 'amber' : 'coral';

          return (
            <div key={row.studentId} style={{
              display: 'grid', gridTemplateColumns: '160px 80px 120px 120px 80px 1fr',
              gap: 8, padding: '12px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar initials={student.initials} bg={student.avatarColor.bg} color={student.avatarColor.text} size={28} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{student.name}</span>
              </div>
              <div><Badge variant={row.mode === 'Auditory' ? 'amber' : row.mode === 'Reading' ? 'purple' : 'blue'}>{row.mode}</Badge></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ProgressBar pct={row.score} variant={scoreColor} />
                <span style={{ fontSize: 12, fontWeight: 500, minWidth: 32 }}>{row.score}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ProgressBar pct={row.engagement} variant={engColor} />
                <span style={{ fontSize: 12, fontWeight: 500, minWidth: 32 }}>{row.engagement}%</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 500,
                  background: row.reframes > 0 ? (row.reframes >= 3 ? 'var(--coral-light)' : 'var(--amber-light)') : 'var(--teal-light)',
                  color: row.reframes > 0 ? (row.reframes >= 3 ? 'var(--coral-dark)' : 'var(--amber-dark)') : 'var(--teal-dark)',
                }}>{row.reframes}</span>
              </div>
              <div style={{ fontSize: 12, color: row.pattern === 'None' ? 'var(--text-muted)' : 'var(--text)' }}>{row.pattern}</div>
            </div>
          );
        })}
      </div>

      {/* AI Reframe Log */}
      {data.reframeLog.length > 0 && (
        <div className="card">
          <div className="card-title">AI REFRAME LOG — PER STUDENT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.reframeLog.map((entry, i) => {
              const student = STUDENTS.find(s => s.id === entry.studentId);
              const sevBg = entry.severity === 'High' ? 'var(--coral-light)' : entry.severity === 'Moderate' ? 'var(--amber-light)' : 'var(--gray-light)';
              const sevColor = entry.severity === 'High' ? 'var(--coral-dark)' : entry.severity === 'Moderate' ? 'var(--amber-dark)' : 'var(--gray-dark)';

              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '12px 16px', background: sevBg, borderRadius: 8,
                }}>
                  <span style={{ fontWeight: 500, fontSize: 13, minWidth: 60 }}>{student?.name?.split(' ')[0] || 'Unknown'}</span>
                  <span style={{ fontSize: 12, flex: 1, lineHeight: 1.5 }}>
                    {entry.question} · {entry.description}
                  </span>
                  <Badge variant={entry.severity === 'High' ? 'coral' : entry.severity === 'Moderate' ? 'amber' : 'gray'}>
                    {entry.severity}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Questions Tab ----------
function QuestionsTab({ data }) {
  const flaggedQs = data.questions.filter(q => q.flagged);
  const flaggedLabel = flaggedQs.length > 0
    ? flaggedQs.map(q => q.label).join(', ') + ' flagged'
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-title" style={{ marginBottom: 0 }}>PER-QUESTION BREAKDOWN</div>
        {flaggedLabel && <Badge variant="coral">{flaggedLabel}</Badge>}
      </div>

      {data.questions.map(q => {
        const successColor = q.successPct >= 80 ? 'var(--teal)' : q.successPct >= 60 ? 'var(--amber)' : 'var(--coral)';
        return (
          <div key={q.label} className="card" style={{
            border: q.flagged ? '1.5px solid var(--coral)' : undefined,
            background: q.flagged ? 'var(--coral-light)' : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: q.flagged ? 'var(--coral-dark)' : 'var(--text)' }}>
                {q.flagged && '⚠ '}{q.label} — {q.text}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge variant={q.successPct >= 80 ? 'teal' : q.successPct >= 60 ? 'amber' : 'coral'}>{q.successPct}% success</Badge>
                <Badge variant={q.reframes > 0 ? 'purple' : 'gray'}>{q.reframes} reframe{q.reframes !== 1 ? 's' : ''}</Badge>
              </div>
            </div>
            <div style={{ fontSize: 12, color: q.flagged ? 'var(--coral-dark)' : 'var(--text-muted)', lineHeight: 1.6 }}>
              {q.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Insights Tab ----------
function InsightsTab({ data }) {
  const bgMap = {
    warning: 'var(--coral-light)',
    amber: 'var(--amber-light)',
    info: '#D9EEFA',
    positive: 'var(--green-light)',
  };
  const iconMap = {
    warning: '⚠',
    amber: '◆',
    info: '◉',
    positive: '✓',
  };
  const colorMap = {
    warning: 'var(--coral-dark)',
    amber: 'var(--amber-dark)',
    info: 'var(--blue-dark)',
    positive: 'var(--green-dark)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card-title">GEMMA-GENERATED INSIGHTS FOR THIS ASSIGNMENT</div>

      {data.insights.map((insight, i) => (
        <div key={i} style={{
          padding: '16px 20px', borderRadius: 10,
          background: bgMap[insight.type] || 'var(--gray-light)',
          lineHeight: 1.6, fontSize: 13,
          color: colorMap[insight.type] || 'var(--text)',
        }}>
          <span style={{ marginRight: 8 }}>{iconMap[insight.type]}</span>
          <span dangerouslySetInnerHTML={{ __html: renderBoldMarkdown(insight.text) }} />
        </div>
      ))}
    </div>
  );
}

// ---------- Main Reports Page ----------
export default function TeacherReports() {
  const [selectedId, setSelectedId] = useState(REPORT_ASSIGNMENTS[0]?.id);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSubjects, setExpandedSubjects] = useState(SUBJECT_ORDER);

  const selected = REPORT_ASSIGNMENTS.find(a => a.id === selectedId) || REPORT_ASSIGNMENTS[0];
  const grouped = groupBySubject(REPORT_ASSIGNMENTS);

  function toggleSubject(subject) {
    setExpandedSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)' }}>
      {/* ---- Sidebar ---- */}
      <div style={{
        width: 280, flexShrink: 0, borderRight: '0.5px solid var(--border)',
        overflowY: 'auto', background: 'var(--surface)',
      }}>
        <div style={{ padding: '20px 20px 12px' }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Reports</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grouped by subject</div>
        </div>

        {SUBJECT_ORDER.filter(s => grouped[s]).map(subject => {
          const meta = REPORT_SUBJECT_META[subject] || {};
          const isExpanded = expandedSubjects.includes(subject);
          const items = grouped[subject];

          return (
            <div key={subject}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 20px', cursor: 'pointer',
                }}
                onClick={() => toggleSubject(subject)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{subject}</span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && items.map(a => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 20px 7px 44px', cursor: 'pointer', fontSize: 13,
                    fontWeight: a.id === selectedId ? 500 : 400,
                    background: a.id === selectedId ? 'var(--bg)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onClick={() => { setSelectedId(a.id); setActiveTab('overview'); }}
                  onMouseEnter={e => { if (a.id !== selectedId) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { if (a.id !== selectedId) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: `var(--${a.dot})`,
                  }} />
                  <span style={{ flex: 1 }}>{a.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{a.date}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ---- Main content ---- */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 20 }}>
            {selected.subject} — {selected.title} ({selected.date})
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {selected.studentCount} students · {selected.questionCount} questions · {selected.totalReframes} reframe{selected.totalReframes !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: 'none',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: activeTab === tab.key ? 'var(--text)' : 'var(--bg)',
                color: activeTab === tab.key ? '#fff' : 'var(--text)',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab data={selected} />}
        {activeTab === 'per-student' && <PerStudentTab data={selected} />}
        {activeTab === 'questions' && <QuestionsTab data={selected} />}
        {activeTab === 'insights' && <InsightsTab data={selected} />}

        {/* Recommendations (always shown at bottom) */}
        {activeTab === 'insights' && (
          <div style={{ marginTop: 24 }}>
            <div className="card">
              <div className="card-title">Recommendations</div>
              {selected.insights.filter(i => i.type === 'positive' || i.type === 'amber').slice(0, 3).map((rec, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: '8px 0',
                  borderBottom: i < 2 ? '0.5px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0, marginTop: 5 }} />
                  <div style={{ fontSize: 12 }} dangerouslySetInnerHTML={{
                    __html: renderBoldMarkdown(rec.text),
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
