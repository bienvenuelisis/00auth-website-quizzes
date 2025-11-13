import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  LinearProgress,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as EnrolledIcon,
  HowToReg as EnrollIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuizStore } from '../stores/quizStore';
import { getCourseById } from '../data/courses';
import { getModulesByCourse } from '../data/modules';
import ModuleCard from '../components/Dashboard/ModuleCard';
import { useAnalytics, usePageTimeTracking } from '../hooks/useAnalytics';
import { useAuth } from '../contexts/AuthContext';
import { enrollInCourse, isEnrolledInCourse } from '../services/firebase/firestore/progress';

/**
 * CourseDashboard - Page d'affichage des modules d'une formation
 */
export default function CourseDashboard() {
  const { courseId } = useParams();
  const { initializeUser, userProgress } = useQuizStore();
  const { isAuthenticated, profile } = useAuth();
  const analytics = useAnalytics();

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  usePageTimeTracking(`course-${courseId}`);

  // Vérifier si l'utilisateur peut accéder aux formations
  const canAccessCourses = isAuthenticated && profile?.accountIsValid && profile?.isActive;

  const course = getCourseById(courseId);
  const modules = getModulesByCourse(courseId);

  useEffect(() => {
    if (canAccessCourses) {
      initializeUser();
    }
  }, [initializeUser, canAccessCourses]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Vérifier l'enrollment
  useEffect(() => {
    const checkEnrollment = async () => {
      if (canAccessCourses && profile?.uid) {
        try {
          const enrolled = await isEnrolledInCourse(profile.uid, courseId);
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'enrollment:', error);
        }
      }
    };
    checkEnrollment();
  }, [canAccessCourses, profile?.uid, courseId]);

  // Handler pour s'inscrire à la formation
  const handleEnroll = async () => {
    if (!profile?.uid) return;

    setEnrolling(true);
    try {
      await enrollInCourse(profile.uid, courseId);
      setIsEnrolled(true);
      setSnackbarMessage('Vous êtes maintenant inscrit à cette formation !');
      setSnackbarOpen(true);
      // Rafraîchir la progression
      initializeUser();
    } catch (error) {
      console.error('Erreur lors de l\'enrollment:', error);
      setSnackbarMessage('Erreur lors de l\'inscription. Veuillez réessayer.');
      setSnackbarOpen(true);
    } finally {
      setEnrolling(false);
    }
  };

  // Rediriger vers la page d'accueil si l'utilisateur n'a pas accès
  if (!canAccessCourses) {
    return <Navigate to="/" replace />;
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Formation non trouvée</Alert>
      </Container>
    );
  }

  const requiredModules = modules.filter((m) => !m.isBonus);
  const bonusModules = modules.filter((m) => m.isBonus);

  // Calculer la progression de la formation
  const courseProgress = userProgress.courses?.[courseId];
  const completedModules = requiredModules.filter(m => {
    const moduleProgress = courseProgress?.modules?.[m.id];
    return moduleProgress && (moduleProgress.status === 'completed' || moduleProgress.status === 'perfect');
  }).length;

  const progress = requiredModules.length > 0
    ? Math.round((completedModules / requiredModules.length) * 100)
    : 0;

  const stats = courseProgress?.stats || {
    totalQuizzesTaken: 0,
    averageScore: 0,
    totalTimeSpent: 0
  };

  // Animations
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
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Formations
        </Link>
        <Typography color="text.primary">{course.shortTitle}</Typography>
      </Breadcrumbs>

      {/* En-tête de la formation */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: 48 }}>{course.icon}</Typography>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="700"
                sx={{ lineHeight: 1.2 }}
              >
                {course.title}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                {course.description}
              </Typography>
            </Box>
          </Box>

          {/* Bouton d'enrollment */}
          {!isEnrolled ? (
            <Button
              variant="contained"
              size="large"
              color="primary"
              startIcon={enrolling ? null : <EnrollIcon />}
              onClick={handleEnroll}
              disabled={enrolling}
              sx={{
                minWidth: 200,
                py: 1.5,
                fontWeight: 600
              }}
            >
              {enrolling ? 'Inscription...' : 'S\'inscrire à la formation'}
            </Button>
          ) : (
            <Chip
              icon={<EnrolledIcon />}
              label="Inscrit"
              color="success"
              size="medium"
              sx={{ px: 2, py: 3, fontSize: '1rem', fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip
            label={course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
            color="primary"
          />
          <Chip label={`${course.totalModules} modules`} icon={<SchoolIcon />} />
          {course.duration && <Chip label={course.duration} />}
          <Chip label={course.category} variant="outlined" />
        </Box>
      </Box>

      {/* Carte de progression globale */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}88 100%)`,
          color: 'white'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrophyIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Progression de la Formation
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {completedModules} sur {requiredModules.length} modules validés
              </Typography>
            </Box>
          </Box>
          <Typography variant="h3" fontWeight="bold">
            {progress}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#FFD700'
            }
          }}
        />

        {/* Statistiques */}
        {stats.totalQuizzesTaken > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              mt: 3,
              flexWrap: 'wrap'
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Quiz complétés
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {stats.totalQuizzesTaken}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Score moyen
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {stats.averageScore}%
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Temps total
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {Math.round(stats.totalTimeSpent / 60)} min
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Modules Obligatoires */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h2" fontWeight="600">
            Modules Obligatoires
          </Typography>
          <Chip label={`${requiredModules.length} modules`} color="primary" size="small" />
        </Box>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Grid container spacing={3}>
            {requiredModules.map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module.id}>
                <motion.div variants={itemVariants}>
                  <ModuleCard module={module} courseId={courseId} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Modules Bonus */}
      {bonusModules.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight="600">
              Modules Bonus
            </Typography>
            <Chip label={`${bonusModules.length} modules`} color="secondary" size="small" />
          </Box>

          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3}>
              {bonusModules.map((module) => (
                <Grid item xs={12} sm={6} md={4} key={module.id}>
                  <motion.div variants={itemVariants}>
                    <ModuleCard module={module} courseId={courseId} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}

      {/* Bouton retour */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Link
          component={RouterLink}
          to="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            textDecoration: 'none'
          }}
        >
          <ArrowIcon sx={{ transform: 'rotate(180deg)' }} />
          Retour aux formations
        </Link>
      </Box>

      {/* Snackbar pour feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
}
