import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import QuizDashboard from './pages/QuizDashboard';
import ModuleDetail from './pages/ModuleDetail';
import QuizSession from './pages/QuizSession';
import Results from './pages/Results';

/**
 * Composant App principal
 * Configure le routing et la structure de l'application
 */
function App() {
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
