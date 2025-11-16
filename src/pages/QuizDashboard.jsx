import { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../stores/quizStore';
import { getPublishedCourses } from '../data/courses';
import { getModulesByCourse } from '../data/modules';
import CourseCard from '../components/Dashboard/CourseCard';
import { useAnalytics, usePageTimeTracking } from '../hooks/useAnalytics';
import { useAuth } from '../contexts/AuthContext';

/**
 * QuizDashboard - Page d'accueil affichant toutes les formations
 * Montre les formations disponibles avec leur progression
 */
export default function QuizDashboard() {
  const { initializeUser, userProgress } = useQuizStore();
  const { isAuthenticated, profile } = useAuth();
  const analytics = useAnalytics();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur peut accéder aux formations
  const canAccessCourses = isAuthenticated && profile?.accountIsValid && profile?.isActive;

  usePageTimeTracking('dashboard');

  useEffect(() => {
    if (canAccessCourses) {
      initializeUser();
    }
  }, [initializeUser, canAccessCourses]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const courses = getPublishedCourses();

  // Calculer la progression pour chaque formation
  const getCoursesWithProgress = () => {
    if (!canAccessCourses) {
      return courses.map(course => ({ course, progress: 0, stats: null }));
    }

    return courses.map(course => {
      const courseProgress = userProgress.courses?.[course.id];
      const modules = getModulesByCourse(course.id);
      const requiredModules = modules.filter(m => !m.isBonus);

      if (!courseProgress || requiredModules.length === 0) {
        return { course, progress: 0, stats: null };
      }

      const completedModules = requiredModules.filter(m => {
        const moduleProgress = courseProgress.modules[m.id];
        return moduleProgress && (moduleProgress.status === 'completed' || moduleProgress.status === 'perfect');
      }).length;

      const progress = Math.round((completedModules / requiredModules.length) * 100);

      return {
        course,
        progress,
        stats: courseProgress.stats
      };
    });
  };

  const coursesWithProgress = getCoursesWithProgress();
  const totalCoursesStarted = coursesWithProgress.filter(c => c.progress > 0).length;
  const totalCoursesCompleted = coursesWithProgress.filter(c => c.progress === 100).length;

  useEffect(() => {
    if (canAccessCourses) {
      analytics.trackDashboardView(
        courses.length,
        totalCoursesCompleted,
        userProgress.globalStats.averageScore || 0
      );
    }
  }, [canAccessCourses]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <SchoolIcon sx={{ fontSize: 56, color: 'secondary.main' }} />
          Mes Formations
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Développez vos compétences dans le numérique à votre rythme
        </Typography>
      </Box>

      {/* Message pour utilisateurs non connectés, non validés ou désactivés */}
      {!canAccessCourses && (
        <Alert
          severity={!isAuthenticated ? "info" : profile && !profile.isActive ? "error" : "warning"}
          icon={<LockIcon />}
          sx={{
            mb: 4,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            !isAuthenticated ? (
              <Button
                color="inherit"
                size="small"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/auth')}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Se connecter
              </Button>
            ) : null
          }
        >
          {!isAuthenticated ? (
            <>
              <Typography variant="body1" fontWeight="600" gutterBottom>
                Connectez-vous pour accéder aux formations
              </Typography>
              <Typography variant="body2">
                Créez un compte ou connectez-vous pour commencer votre parcours d'apprentissage et suivre votre progression.
              </Typography>
            </>
          ) : profile && !profile.isActive ? (
            <>
              <Typography variant="body1" fontWeight="600" gutterBottom>
                Compte non approuvé
              </Typography>
              <Typography variant="body2">
                Votre compte n'a pas encore été approuvé. Veuillez contacter un administrateur pour plus d'informations.
              </Typography>
            </>
          ) : profile && !profile.accountIsValid ? (
            <>
              <Typography variant="body1" fontWeight="600" gutterBottom>
                Compte en attente de validation
              </Typography>
              <Typography variant="body2">
                Votre compte est en attente de validation par un administrateur. Vous recevrez un accès aux formations une fois votre compte validé.
              </Typography>
            </>
          ) : null}
        </Alert>
      )}

      {/* Carte de statistiques globales */}
      {canAccessCourses && userProgress.globalStats.totalQuizzesTaken > 0 && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            background: (theme) =>
              theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TrendingIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Vos Statistiques Globales
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Progression dans toutes les formations
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {totalCoursesStarted}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Formations démarrées
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {totalCoursesCompleted}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Formations complétées
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {userProgress.globalStats.totalQuizzesTaken}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Quiz passés
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold">
                  {userProgress.globalStats.averageScore}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Score moyen
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Liste des formations */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h2" fontWeight="600">
            Formations Disponibles
          </Typography>
          <Chip label={`${courses.length} formation${courses.length > 1 ? 's' : ''}`} color="primary" />
        </Box>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>
            {coursesWithProgress.map(({ course, progress, stats }) => (
              <Grid item xs={12} md={6} key={course.id}>
                <motion.div variants={itemVariants}>
                  <CourseCard
                    course={course}
                    progress={progress}
                    stats={stats}
                    isLocked={!canAccessCourses}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Message si aucune formation */}
      {courses.length === 0 && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune formation disponible pour le moment
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
