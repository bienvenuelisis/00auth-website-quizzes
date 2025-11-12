import { Box, LinearProgress, Typography, Chip } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

/**
 * ProgressBar - Barre de progression du quiz
 * Affiche le numéro de la question actuelle et la progression
 */
export default function ProgressBar({ currentIndex, totalQuestions, timeRemaining }) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* En-tête avec numéro de question et timer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="body1" fontWeight="medium">
          Question {currentIndex + 1} sur {totalQuestions}
        </Typography>

        {timeRemaining !== null && timeRemaining !== undefined && (
          <Chip
            icon={<TimerIcon />}
            label={formatTime(timeRemaining)}
            color={timeRemaining <= 10 ? 'error' : 'default'}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {/* Barre de progression */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? 'grey.200' : 'grey.700',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            backgroundColor: 'secondary.main',
          },
        }}
      />

      {/* Pourcentage */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}
      >
        {Math.round(progress)}% complété
      </Typography>
    </Box>
  );
}
