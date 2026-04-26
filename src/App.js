import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LessonProvider } from './lib/LessonContext';
import { AuthProvider, useAuth } from './lib/AuthContext';

// Shared
import Landing from './pages/Landing';

// Teacher pages
import TeacherLogin    from './pages/teacher/TeacherLogin';
import TeacherSignup   from './pages/teacher/TeacherSignup';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import UploadAssignment from './pages/teacher/UploadAssignment';
import StudentProfile   from './pages/teacher/StudentProfile';
import TeacherSettings  from './pages/teacher/TeacherSettings';
import TeacherReports   from './pages/teacher/TeacherReports';

// Student pages
import StudentLogin      from './pages/student/StudentLogin';
import StudentSignup     from './pages/student/StudentSignup';
import StudentHome       from './pages/student/StudentHome';
import SelectAssignment  from './pages/student/SelectAssignment';
import CuratedLesson     from './pages/student/CuratedLesson';
import AutoReframe       from './pages/student/AutoReframe';
import CompletionScreen  from './pages/student/CompletionScreen';
import StudentSettings   from './pages/student/StudentSettings';

// Layout wrappers
import TeacherLayout from './components/TeacherLayout';
import StudentLayout from './components/StudentLayout';

function RequireTeacher({ children }) {
  const { user, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!user || !userProfile || userProfile.role !== 'teacher') {
    return <Navigate to="/teacher/login" replace />;
  }
  return children;
}

function RequireStudent({ children }) {
  const { user, userProfile, loading } = useAuth();
  if (loading) return null;
  if (!user || !userProfile || userProfile.role !== 'student') {
    return <Navigate to="/student/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Shared landing */}
      <Route path="/"        element={<Landing />} />

      {/* Teacher auth */}
      <Route path="/teacher/login"   element={<TeacherLogin />} />
      <Route path="/teacher/signup"  element={<TeacherSignup />} />

      {/* Teacher flow (protected) */}
      <Route path="/teacher" element={<RequireTeacher><TeacherLayout /></RequireTeacher>}>
        <Route index                    element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"         element={<TeacherDashboard />} />
        <Route path="upload"            element={<UploadAssignment />} />
        <Route path="profile/:studentId" element={<StudentProfile />} />
        <Route path="settings"          element={<TeacherSettings />} />
        <Route path="reports"           element={<TeacherReports />} />
      </Route>

      {/* Student auth */}
      <Route path="/student/login"   element={<StudentLogin />} />
      <Route path="/student/signup"  element={<StudentSignup />} />

      {/* Student flow (protected) */}
      <Route path="/student" element={<RequireStudent><StudentLayout /></RequireStudent>}>
        <Route index                    element={<Navigate to="home" replace />} />
        <Route path="home"              element={<StudentHome />} />
        <Route path="assignments"       element={<SelectAssignment />} />
        <Route path="lesson/:assignmentId" element={<CuratedLesson />} />
        <Route path="reframe"           element={<AutoReframe />} />
        <Route path="complete"          element={<CompletionScreen />} />
        <Route path="settings"          element={<StudentSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LessonProvider>
          <AppRoutes />
        </LessonProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
