import React, { useState, useContext, createContext } from 'react';

const LessonContext = createContext();

export function LessonProvider({ children }) {
  const [lessons, setLessons] = useState(() => {
    try {
      const stored = localStorage.getItem('spectra_lessons');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const saveLesson = (assignmentId, adaptedVersions) => {
    const updated = { ...lessons, [assignmentId]: adaptedVersions };
    setLessons(updated);
    try {
      localStorage.setItem('spectra_lessons', JSON.stringify(updated));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        const stripped = {};
        for (const [sid, data] of Object.entries(adaptedVersions)) {
          if (!data) { stripped[sid] = data; continue; }
          const { imageUrls, audioUrl, ...rest } = data;
          stripped[sid] = rest;
        }
        const small = { ...lessons, [assignmentId]: stripped };
        try {
          localStorage.setItem('spectra_lessons', JSON.stringify(small));
        } catch { /* best effort */ }
      }
    }
  };

  const getAdaptedVersion = (assignmentId, studentId) => {
    return lessons?.[assignmentId]?.[studentId] || null;
  };

  const clearLessons = () => {
    setLessons({});
    localStorage.removeItem('spectra_lessons');
  };

  return (
    <LessonContext.Provider value={{ lessons, saveLesson, getAdaptedVersion, clearLessons }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLessonContext() {
  const ctx = useContext(LessonContext);
  if (!ctx) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return ctx;
}

export default LessonContext;
