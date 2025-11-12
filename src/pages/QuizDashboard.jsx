import { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  LinearProgress,
  Divider,
  Chip,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useQuizStore } from '../stores/quizStore';
import { MODULES_DATA } from '../data/modules';
import ModuleCard from '../components/Dashboard/ModuleCard';

/**
 * QuizDashboard - Page principale affichant tous les modules
 * Montre la progression globale et la liste des modules
 */
export default function QuizDashboard() {
  const { initializeUser, getGlobalProgress, userProgress } = useQuizStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const progress = getGlobalProgress();
  const requiredModules = MODULES_DATA.filter((m) => !m.isBonus);
  const bonusModules = MODULES_DATA.filter((m) => m.isBonus);

  // Animation variants pour les cartes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <SchoolIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
          Formation Flutter Avancée
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Quiz de validation des modules
        </Typography>
      </Box>

      {/* Carte de progression globale */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #434343 0%, #000000 100%)',
          color: 'white',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrophyIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Progression Globale
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {userProgress.globalStats.totalModulesCompleted} sur{' '}
                {requiredModules.length} modules validés
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
              backgroundColor: '#c9b037',
            },
          }}
        />

        {/* Statistiques */}
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mt: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Quiz complétés
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {userProgress.globalStats.totalQuizzesTaken}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Score moyen
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {userProgress.globalStats.averageScore}%
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Temps total
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {Math.round(userProgress.globalStats.totalTimeSpent / 60)} min
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Modules Obligatoires */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h4" component="h2" fontWeight="600">
            Modules Obligatoires
          </Typography>
          <Chip
            label={`${requiredModules.length} modules`}
            color="primary"
            size="small"
          />
        </Box>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {requiredModules.map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module.id}>
                <motion.div variants={itemVariants}>
                  <ModuleCard module={module} />
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
            <Chip
              label={`${bonusModules.length} modules`}
              color="secondary"
              size="small"
            />
          </Box>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {bonusModules.map((module) => (
                <Grid item xs={12} sm={6} md={4} key={module.id}>
                  <motion.div variants={itemVariants}>
                    <ModuleCard module={module} />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>
      )}
    </Container>
  );
}
