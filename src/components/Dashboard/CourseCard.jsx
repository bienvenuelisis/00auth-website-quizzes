import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Button,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  Lock as LockIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * CourseCard - Carte d'affichage d'une formation
 * @param {Object} course - Données de la formation
 * @param {number} progress - Progression (0-100)
 * @param {Object} stats - Statistiques optionnelles
 * @param {boolean} isLocked - Si true, désactive l'accès à la formation
 */
export default function CourseCard({ course, progress = 0, stats = null, isLocked = false }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (!isLocked) {
      navigate(`/course/${course.id}`);
    }
  };

  const isStarted = progress > 0;
  const isCompleted = progress === 100;

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: isLocked ? 0.7 : 1,
          filter: isLocked ? 'grayscale(0.3)' : 'none',
          '&:hover': {
            boxShadow: (theme) => isLocked ? theme.shadows[2] : theme.shadows[8]
          }
        }}
        onClick={handleNavigate}
      >
        {/* En-tête avec image ou gradient + icône */}
        {course.thumbnail ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="300"
              image={course.thumbnail}
              alt={course.shortTitle}
              sx={{
                objectFit: 'cover',
                filter: isLocked ? 'grayscale(0.5)' : 'none'
              }}
            />
            {/* Overlay gradient pour les badges */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)`,
                pointerEvents: 'none'
              }}
            />

            {/* Badge de statut */}
            {isCompleted && !isLocked && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  boxShadow: 2
                }}
              >
                <CheckIcon fontSize="small" />
                <Typography variant="caption" fontWeight="600">
                  Complété
                </Typography>
              </Box>
            )}

            {/* Badge verrouillé */}
            {isLocked && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  boxShadow: 2
                }}
              >
                <LockIcon fontSize="small" />
                <Typography variant="caption" fontWeight="600">
                  Verrouillé
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              height: 180,
              background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}88 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Icône de la formation */}
            <Typography sx={{ fontSize: 80, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
              {course.icon}
            </Typography>

            {/* Badge de statut */}
            {isCompleted && !isLocked && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'success.main',
                  color: 'white',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <CheckIcon fontSize="small" />
                <Typography variant="caption" fontWeight="600">
                  Complété
                </Typography>
              </Box>
            )}

            {/* Badge verrouillé */}
            {isLocked && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <LockIcon fontSize="small" />
                <Typography variant="caption" fontWeight="600">
                  Verrouillé
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Titre et description */}
          <Typography variant="h5" gutterBottom fontWeight="600">
            {course.shortTitle}
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
            {course.description}
          </Typography>

          {/* Tags */}
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`${course.totalModules} modules`}
              size="small"
              variant="outlined"
              icon={<SchoolIcon />}
            />
            {course.duration && (
              <Chip label={course.duration} size="small" variant="outlined" />
            )}
          </Stack>

          {/* Progression */}
          {isStarted && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Progression
                </Typography>
                <Typography variant="body2" fontWeight="600" color="primary">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: course.color
                  }
                }}
              />

              {/* Statistiques si disponibles */}
              {stats && (
                <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Quiz passés
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {stats.totalQuizzesTaken}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Score moyen
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {stats.averageScore}%
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Bouton d'action */}
          <Button
            variant={isStarted ? 'outlined' : 'contained'}
            fullWidth
            startIcon={isLocked ? <LockIcon /> : <ArrowIcon />}
            disabled={isLocked}
            sx={{
              mt: 'auto',
              borderColor: isStarted ? course.color : undefined,
              color: isStarted ? course.color : undefined,
              bgcolor: !isStarted && !isLocked ? course.color : undefined,
              '&:hover': {
                bgcolor: !isStarted && !isLocked ? course.color : undefined,
                borderColor: !isLocked ? course.color : undefined,
                opacity: !isLocked ? 0.9 : 1
              }
            }}
          >
            {isLocked ? 'Connexion requise' : 'Voir les détails'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
