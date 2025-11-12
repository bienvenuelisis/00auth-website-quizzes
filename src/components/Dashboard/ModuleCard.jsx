import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useQuizStore } from '../../stores/quizStore';
import { useAnalytics } from '../../hooks/useAnalytics';

/**
 * ModuleCard - Carte affichant un module de formation
 * Montre le statut, le meilleur score et permet de démarrer le quiz
 */
export default function ModuleCard({ module }) {
  const navigate = useNavigate();
  const { canAccessModule, getModuleStatus, getModuleStats } = useQuizStore();
  const analytics = useAnalytics();

  const canAccess = canAccessModule(module.id);
  const status = getModuleStatus(module.id);
  const stats = getModuleStats(module.id);

  // Configuration de l'affichage selon le statut
  const statusConfig = {
    locked: {
      label: 'Verrouillé',
      color: 'default',
      icon: <LockIcon fontSize="small" />,
      disabled: true,
    },
    unlocked: {
      label: 'Disponible',
      color: 'primary',
      icon: <PlayArrowIcon fontSize="small" />,
      disabled: false,
    },
    in_progress: {
      label: 'En cours',
      color: 'warning',
      icon: <RefreshIcon fontSize="small" />,
      disabled: false,
    },
    completed: {
      label: 'Validé',
      color: 'success',
      icon: <CheckCircleIcon fontSize="small" />,
      disabled: false,
    },
    perfect: {
      label: 'Score Parfait',
      color: 'secondary',
      icon: <StarIcon fontSize="small" />,
      disabled: false,
    },
  };

  const config = statusConfig[status] || statusConfig.unlocked;

  const handleClick = () => {
    if (canAccess) {
      // Tracker le clic sur la carte du module
      analytics.trackModuleCardClick(
        module.id,
        module.title,
        status === 'completed' || status === 'perfect',
        !canAccess
      );

      navigate(`/module/${module.id}`);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': canAccess
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            }
          : {},
        opacity: canAccess ? 1 : 0.7,
      }}
    >
      {/* Badge Bonus */}
      {module.isBonus && (
        <Chip
          label="BONUS"
          size="small"
          color="secondary"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 600,
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Titre */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            pr: module.isBonus ? 8 : 0,
          }}
        >
          {module.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '60px',
          }}
        >
          {module.description}
        </Typography>

        {/* Statut */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={config.label}
            color={config.color}
            icon={config.icon}
            size="small"
          />
        </Box>

        {/* Statistiques si disponibles */}
        {stats && (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Meilleur score
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={stats.bestScore >= 70 ? 'success.main' : 'warning.main'}
              >
                {stats.bestScore}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={stats.bestScore}
              color={stats.bestScore >= 70 ? 'success' : 'warning'}
              sx={{ height: 8, borderRadius: 4 }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              {stats.attemptsCount} tentative{stats.attemptsCount > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Informations du module */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {module.questionCount} questions
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'capitalize' }}
            >
              Niveau: {module.difficulty}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          disabled={!canAccess}
          onClick={handleClick}
          startIcon={config.icon}
        >
          {stats ? 'Recommencer' : 'Commencer'}
        </Button>
      </CardActions>
    </Card>
  );
}
