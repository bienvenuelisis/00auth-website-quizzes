import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import QuizDashboard from './pages/QuizDashboard';
import ModuleDetail from './pages/ModuleDetail';
import QuizSession from './pages/QuizSession';
import Results from './pages/Results';
import { usePageTracking } from './hooks/useAnalytics';
import analyticsService from './services/analyticsService';

/**
 * Composant App principal
 * Configure le routing et la structure de l'application
 */
function App() {
  // Tracker automatiquement les changements de page
  usePageTracking();

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
          {/* Dashboard - Liste des modules */}
          <Route path="/" element={<QuizDashboard />} />

          {/* Détails d'un module */}
          <Route path="/module/:moduleId" element={<ModuleDetail />} />

          {/* Session de quiz active */}
          <Route path="/module/:moduleId/quiz" element={<QuizSession />} />

          {/* Résultats du quiz */}
          <Route path="/module/:moduleId/results" element={<Results />} />

          {/* Redirection pour routes non trouvées */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}

export default App;
