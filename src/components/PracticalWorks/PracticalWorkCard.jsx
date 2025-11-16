import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
  Stack
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { calculateDeadlineStatus, PW_STATUS } from '../../models/practicalWork';

const DIFFICULTY_COLORS = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error'
};

const DIFFICULTY_LABELS = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé'
};

/**
 * Card component for displaying a practical work
 * @param {Object} props
 * @param {Object} props.practicalWork - Practical work data
 * @param {Object} props.progress - Student progress (optional)
 * @param {string} props.courseId - Course ID
 */
function PracticalWorkCard({ practicalWork, progress, courseId }) {
  const navigate = useNavigate();

  const {
    id,
    title,
    week,
    difficulty,
    estimatedHours,
    isBonus,
    deadline,
    topics
  } = practicalWork;

  const deadlineStatus = calculateDeadlineStatus(deadline);
  const isOverdue = deadlineStatus.isOverdue && (!progress || progress.status !== PW_STATUS.PASSED);

  const handleClick = () => {
    navigate(`/course/${courseId}/practical-work/${id}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        },
        border: isOverdue ? '2px solid' : 'none',
        borderColor: isOverdue ? 'error.main' : 'transparent'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {week}
            </Typography>
            {isBonus && (
              <Chip
                label="Bonus"
                size="small"
                color="secondary"
                icon={<TrophyIcon />}
              />
            )}
          </Stack>

          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
        </Box>

        {/* Chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={DIFFICULTY_LABELS[difficulty]}
            size="small"
            color={DIFFICULTY_COLORS[difficulty]}
          />
          <Chip
            label={`${estimatedHours}h`}
            size="small"
            icon={<ScheduleIcon />}
            variant="outlined"
          />
        </Stack>

        {/* Topics */}
        {topics && topics.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Thèmes: {topics.slice(0, 2).join(', ')}
              {topics.length > 2 && '...'}
            </Typography>
          </Box>
        )}

        {/* Deadline warning */}
        {deadlineStatus.hasDeadline && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
              p: 1,
              bgcolor: isOverdue ? 'error.lighter' : 'info.lighter',
              borderRadius: 1
            }}
          >
            {isOverdue && <WarningIcon color="error" fontSize="small" />}
            <Typography variant="caption" color={isOverdue ? 'error.main' : 'info.main'}>
              {isOverdue
                ? `En retard de ${Math.abs(deadlineStatus.daysRemaining)} jour(s)`
                : `Deadline: ${deadlineStatus.daysRemaining} jour(s) restant(s)`
              }
            </Typography>
          </Box>
        )}

        {/* Progress */}
        {progress && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <StatusBadge status={progress.status} />
              {progress.bestScore !== null && (
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={progress.bestScore >= 70 ? 'success.main' : 'text.secondary'}
                >
                  {progress.bestScore}/100
                </Typography>
              )}
            </Box>
            {progress.bestScore !== null && (
              <LinearProgress
                variant="determinate"
                value={progress.bestScore}
                color={progress.bestScore >= 70 ? 'success' : 'primary'}
                sx={{ height: 6, borderRadius: 3 }}
              />
            )}
            {progress.attempts && progress.attempts.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {progress.attempts.length} tentative(s)
              </Typography>
            )}
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          onClick={handleClick}
          fullWidth
          variant={progress ? 'outlined' : 'contained'}
        >
          {!progress || progress.status === PW_STATUS.NOT_STARTED
            ? 'Commencer'
            : progress.status === PW_STATUS.PASSED
            ? 'Voir les détails'
            : 'Continuer'
          }
        </Button>
      </CardActions>
    </Card>
  );
}

export default PracticalWorkCard;
