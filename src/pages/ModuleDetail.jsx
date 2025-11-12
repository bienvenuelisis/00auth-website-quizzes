import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { getModuleById } from '../data/modules';
import { useQuizStore } from '../stores/quizStore';
import { getOrGenerateQuiz } from '../services/geminiQuiz';
import { useAnalytics, usePageTimeTracking } from '../hooks/useAnalytics';

/**
 * ModuleDetail - Page de détails d'un module
 * Affiche les informations du module et permet de démarrer le quiz
 */
export default function ModuleDetail() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { canAccessModule, getModuleStats, startQuizSession } = useQuizStore();
  const analytics = useAnalytics();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const module = getModuleById(moduleId);
  const canAccess = canAccessModule(moduleId);
  const stats = getModuleStats(moduleId);

  // Tracker le temps passé sur la page du module
  usePageTimeTracking('module_detail', moduleId);

  // Tracker la vue du module
  useEffect(() => {
    if (module) {
      analytics.trackModuleDetailView(
        module.id,
        module.title,
        module.isBonus ? 'bonus' : 'required',
        module.difficulty,
        canAccess
      );
    }
  }, [moduleId]);

  if (!module) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Module non trouvé</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Retour au tableau de bord
        </Button>
      </Container>
    );
  }

  const handleStartQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tracker le démarrage du quiz
      const isRetry = stats && stats.attemptsCount > 0;
      analytics.trackQuizStart(
        module.id,
        module.title,
        isRetry,
        stats?.bestScore || null
      );

      const startTime = Date.now();

      // Générer ou charger le quiz depuis le cache
      const quiz = await getOrGenerateQuiz(module);

      const generationTime = Date.now() - startTime;

      // Tracker la génération du quiz
      analytics.trackQuizGeneration(
        module.id,
        module.title,
        'success',
        generationTime,
        quiz.fromCache || false
      );

      // Démarrer la session
      startQuizSession(moduleId, quiz.questions);

      // Naviguer vers la page de quiz
      navigate(`/module/${moduleId}/quiz`);
    } catch (err) {
      console.error('Erreur démarrage quiz:', err);

      // Tracker l'erreur de génération
      analytics.trackQuizGenerationError(
        module.id,
        err.message || 'Erreur inconnue'
      );

      setError(
        "Impossible de générer le quiz. Veuillez réessayer dans quelques instants."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/"
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          Tableau de bord
        </Link>
        <Typography color="text.primary">{module.title}</Typography>
      </Breadcrumbs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* En-tête du module */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {module.title}
            </Typography>
            {module.isBonus && (
              <Chip label="BONUS" color="secondary" sx={{ fontWeight: 600 }} />
            )}
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            {module.description}
          </Typography>

          {/* Métadonnées */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 3 }}>
            <Chip
              label={`${module.questionCount} questions`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Niveau: ${module.difficulty}`}
              variant="outlined"
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
            <Chip
              label={`Validation: ${module.minimumScore}%`}
              variant="outlined"
              size="small"
            />
          </Box>
        </Paper>

        {/* Statistiques si déjà tenté */}
        {stats && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              Vos Statistiques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="caption">
                      Meilleur score
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color={stats.bestScore >= 70 ? 'success.main' : 'warning.main'}>
                      {stats.bestScore}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="caption">
                      Tentatives
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats.attemptsCount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="caption">
                      Score moyen
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stats.averageScore}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="caption">
                      Temps total
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {Math.round(stats.totalTimeSpent / 60)} min
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Sujets couverts */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            Sujets Couverts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {module.topics.map((topic, index) => (
              <Chip key={index} label={topic} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        </Paper>

        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Message si verrouillé */}
        {!canAccess && (
          <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 3 }}>
            Ce module est verrouillé. Vous devez valider le module précédent avec un score d'au moins 70% pour y accéder.
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Retour
          </Button>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleStartQuiz}
            disabled={!canAccess || loading}
          >
            {loading ? 'Génération du quiz...' : stats ? 'Recommencer le quiz' : 'Commencer le quiz'}
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
}
