import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { useProgressSync } from './hooks/useProgressSync';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import QuizDashboard from './pages/QuizDashboard';
import CourseDashboard from './pages/CourseDashboard';
import ModuleDetail from './pages/ModuleDetail';
import QuizSession from './pages/QuizSession';
import Results from './pages/Results';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminModules from './pages/AdminModules';
import StudentProgressTracker from './pages/StudentProgressTracker';
import { usePageTracking } from './hooks/useAnalytics';
import analyticsService from './services/analyticsService';
import './scripts/migrateModules'; // Charger les helpers de migration

/**
 * Composants de redirection pour les routes legacy
 */
const RedirectToModule = () => {
  const { moduleId } = useParams();
  return <Navigate to={`/course/flutter-advanced/module/${moduleId}`} replace />;
};

const RedirectToQuiz = () => {
  const { moduleId } = useParams();
  return <Navigate to={`/course/flutter-advanced/module/${moduleId}/quiz`} replace />;
};

const RedirectToResults = () => {
  const { moduleId } = useParams();
  return <Navigate to={`/course/flutter-advanced/module/${moduleId}/results`} replace />;
};

/**
 * Composant interne avec accès aux hooks Auth
 */
function AppContent() {
  // Tracker automatiquement les changements de page
  usePageTracking();

  // Synchroniser automatiquement la progression
  useProgressSync();

  // Tracker la session utilisateur
  const sessionStartTime = useRef(Date.now());
  const pagesVisited = useRef(new Set());
  const quizzesCompleted = useRef(0);

  useEffect(() => {
    // Log session start au montage du composant
    analyticsService.logSessionStart();

    // Cleanup au démontage (fermeture de l'app)
    return () => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      analyticsService.logSessionEnd(
        sessionDuration,
        pagesVisited.current.size,
        quizzesCompleted.current
      );
    };
  }, []);

  // Tracker les pages visitées
  useEffect(() => {
    const currentPath = window.location.pathname;
    pagesVisited.current.add(currentPath);

    // Incrémenter quizzesCompleted si on est sur la page de résultats
    if (currentPath.includes('/results')) {
      quizzesCompleted.current += 1;
    }
  }, [window.location.pathname]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* Dashboard - Liste des formations */}
          <Route path="/" element={<QuizDashboard />} />

          {/* Authentification */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Profil utilisateur */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Administration */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/modules" element={<AdminModules />} />
          <Route path="/admin/progress" element={<StudentProgressTracker />} />

          {/* Dashboard d'une formation - Liste des modules */}
          <Route path="/course/:courseId" element={<CourseDashboard />} />

          {/* Détails d'un module */}
          <Route path="/course/:courseId/module/:moduleId" element={<ModuleDetail />} />

          {/* Session de quiz active */}
          <Route path="/course/:courseId/module/:moduleId/quiz" element={<QuizSession />} />

          {/* Résultats du quiz */}
          <Route path="/course/:courseId/module/:moduleId/results" element={<Results />} />

          {/* Routes legacy (redirection vers flutter-advanced) */}
          <Route path="/module/:moduleId" element={<RedirectToModule />} />
          <Route path="/module/:moduleId/quiz" element={<RedirectToQuiz />} />
          <Route path="/module/:moduleId/results" element={<RedirectToResults />} />

          {/* Redirection pour routes non trouvées */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

/**
 * Composant App principal avec AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
