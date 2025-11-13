import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Cancel as ErrorIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  NavigateNext as NextIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import confetti from 'canvas-confetti';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getModuleById, getNextModule } from '../data/modules';
import { getCourseById } from '../data/courses';
import { useQuizStore } from '../stores/quizStore';
import { useAnalytics, usePageTimeTracking } from '../hooks/useAnalytics';
import { useAuth } from '../contexts/AuthContext';

/**
 * Results - Page d'affichage des résultats du quiz
 * Montre le score, les statistiques et les options de navigation
 */
export default function Results() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, profile } = useAuth();

  // Vérifier si l'utilisateur peut accéder aux formations
  const canAccessCourses = isAuthenticated && profile?.accountIsValid && profile?.isActive;

  // Rediriger vers la page d'accueil si l'utilisateur n'a pas accès
  if (!canAccessCourses) {
    return <Navigate to="/" replace />;
  }
  const { getModuleStats } = useQuizStore();
  const analytics = useAnalytics();

  const module = getModuleById(moduleId);
  const course = getCourseById(courseId);
  const stats = getModuleStats(courseId, moduleId);
  const nextModule = getNextModule(moduleId);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Tracker le temps passé sur la page des résultats
  usePageTimeTracking('results', moduleId);

  // Récupérer les résultats depuis location.state ou stats
  const results = location.state?.results || stats?.attempts?.[stats.attempts.length - 1];

  useEffect(() => {
    if (!results) {
      navigate(`/course/${courseId}/module/${moduleId}`);
      return;
    }

    const passed = results.score >= module.minimumScore;
    const isNewBestScore = !stats || results.score > stats.bestScore;

    // Tracker la vue des résultats
    analytics.trackResultsView(
      module.id,
      module.title,
      results.score,
      passed,
      results.correctCount,
      results.totalQuestions,
      results.earnedPoints,
      results.totalPoints,
      results.timeSpent,
      isNewBestScore
    );

    // Tracker la complétion ou l'échec du module
    if (passed) {
      analytics.trackModuleCompletion(
        module.id,
        module.title,
        results.score,
        stats?.attemptsCount || 1,
        stats?.totalTimeSpent || results.timeSpent
      );

      // Tracker le déblocage du module suivant
      if (nextModule) {
        analytics.trackModuleUnlock(nextModule.id, nextModule.title, module.id);
      }
    } else {
      analytics.trackModuleFailure(
        module.id,
        module.title,
        results.score,
        module.minimumScore,
        stats?.attemptsCount || 1
      );
    }

    // Lancer confetti si score >= 70%
    if (results.score >= 70) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#c9b037', '#1a1a1a', '#FFD700'],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#c9b037', '#1a1a1a', '#FFD700'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [results, moduleId, navigate]);

  if (!module || !results) {
    return null;
  }

  const passed = results.score >= module.minimumScore;

  // Données pour le graphique
  const chartData = [
    { name: 'Correctes', value: results.correctCount, color: '#2ecc71' },
    {
      name: 'Incorrectes',
      value: results.totalQuestions - results.correctCount,
      color: '#e74c3c',
    },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* En-tête de résultat */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 3,
            textAlign: 'center',
            background: passed
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            {passed ? (
              <SuccessIcon sx={{ fontSize: 80 }} />
            ) : (
              <ErrorIcon sx={{ fontSize: 80 }} />
            )}
          </Box>

          <Typography variant="h4" gutterBottom fontWeight="bold">
            {passed ? 'Félicitations !' : 'Continuez vos efforts !'}
          </Typography>

          <Typography variant="h6" sx={{ mb: 2, opacity: 0.95 }}>
            {module.title}
          </Typography>

          <Typography variant="h2" fontWeight="bold">
            {results.score}%
          </Typography>

          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            {results.correctCount} sur {results.totalQuestions} questions correctes
          </Typography>

          {passed && (
            <Box sx={{ mt: 2 }}>
              <Chip
                icon={<TrophyIcon />}
                label="MODULE VALIDÉ"
                sx={{
                  backgroundColor: '#c9b037',
                  color: '#1a1a1a',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 2,
                  py: 2.5,
                }}
              />
            </Box>
          )}
        </Paper>

        {/* Message de validation */}
        {passed ? (
          <Alert severity="success" icon={<SuccessIcon />} sx={{ mb: 3 }}>
            <Typography variant="body1">
              Excellent travail ! Vous avez validé ce module avec un score de{' '}
              <strong>{results.score}%</strong>.
              {nextModule && ' Le module suivant est maintenant débloqué.'}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning" icon={<ErrorIcon />} sx={{ mb: 3 }}>
            <Typography variant="body1">
              Vous avez obtenu <strong>{results.score}%</strong>. Il vous faut au moins{' '}
              <strong>{module.minimumScore}%</strong> pour valider ce module.
              N'hésitez pas à recommencer !
            </Typography>
          </Alert>
        )}

        {/* Statistiques détaillées */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Statistiques
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography color="text.secondary">Score</Typography>
                    <Typography fontWeight="bold">{results.score}%</Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography color="text.secondary">Points obtenus</Typography>
                    <Typography fontWeight="bold">
                      {results.earnedPoints} / {results.totalPoints}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography color="text.secondary">Temps total</Typography>
                    <Typography fontWeight="bold">
                      {Math.floor(results.timeSpent / 60)}:
                      {(results.timeSpent % 60).toString().padStart(2, '0')}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography color="text.secondary">Temps moyen/question</Typography>
                    <Typography fontWeight="bold">
                      {Math.round(results.timeSpent / results.totalQuestions)}s
                    </Typography>
                  </Box>

                  {stats && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography color="text.secondary">Meilleur score</Typography>
                      <Typography fontWeight="bold" color="success.main">
                        {stats.bestScore}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Répartition des réponses
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            component={RouterLink}
            to={`/course/${courseId}`}
          >
            Retour à la formation
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              analytics.trackRetryQuiz(
                moduleId,
                results.score,
                stats?.attemptsCount || 1
              );
              navigate(`/course/${courseId}/module/${moduleId}`);
            }}
          >
            Recommencer
          </Button>

          {passed && nextModule && (
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={() => {
                analytics.trackNextModuleClick(moduleId, nextModule.id, results.score);
                navigate(`/course/${courseId}/module/${nextModule.id}`);
              }}
            >
              Module suivant
            </Button>
          )}
        </Box>
      </motion.div>
    </Container>
  );
}
