import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { regenerateQuiz, getCachedQuiz } from '../../services/geminiQuiz';

/**
 * Bouton de régénération de quiz avec dialogue de confirmation
 * Affiche uniquement si un quiz en cache existe
 */
export default function RegenerateQuizButton({ module, onQuizRegenerated }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vérifier si un quiz existe en cache
  const hasCachedQuiz = getCachedQuiz(module.id) !== null;

  // Ne pas afficher le bouton si pas de quiz en cache
  if (!hasCachedQuiz) {
    return null;
  }

  const handleClickOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      setOpen(false);
      setError(null);
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Régénération du quiz pour ${module.title}`);

      // Régénérer le quiz
      const newQuiz = await regenerateQuiz(module);

      console.log(`✅ Nouveau quiz généré avec ${newQuiz.questions.length} questions`);

      // Notifier le parent si callback fourni
      if (onQuizRegenerated) {
        onQuizRegenerated(newQuiz);
      }

      // Fermer le dialogue
      setOpen(false);

    } catch (err) {
      console.error('Erreur lors de la régénération:', err);
      setError(err.message || 'Erreur lors de la régénération du quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<RefreshIcon />}
        onClick={handleClickOpen}
        size="small"
        sx={{
          borderStyle: 'dashed',
          '&:hover': {
            borderStyle: 'solid',
          },
        }}
      >
        Nouveau Quiz
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 8,
        }}
      >
        {/* Linear progress bar en haut du dialogue pendant le chargement */}
        {loading && (
          <LinearProgress
            color="warning"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
          />
        )}

        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Régénérer un Nouveau Quiz
        </DialogTitle>

        <DialogContent>
          {/* Message de chargement */}
          {loading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <strong>Génération en cours...</strong> Veuillez patienter pendant que l'IA crée de nouvelles questions pour vous.
              </Typography>
            </Alert>
          )}

          {/* Message de confirmation */}
          {!loading && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Êtes-vous sûr de vouloir générer un <strong>nouveau quiz</strong> pour ce module ?
              </DialogContentText>

              <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Attention :</strong>
            </Typography>
            <Typography variant="body2" component="div">
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Un tout nouveau jeu de questions sera généré</li>
                  <li>Les questions actuelles seront remplacées</li>
                  <li>Le nouveau quiz peut contenir des questions différentes</li>
                  <li>Cette action ne peut pas être annulée</li>
                </ul>
              </Typography>
            </Alert>

            <Box
              sx={{
                p: 2,
                bgcolor: 'info.lighter',
                borderRadius: 1,
                border: 1,
                borderColor: 'info.light',
              }}
            >
              <Typography variant="body2" color="info.dark">
                💡 <strong>Astuce :</strong> Utilisez cette fonction pour obtenir de nouvelles questions
                et varier vos révisions.
              </Typography>
            </Box>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            color="inherit"
          >
            Annuler
          </Button>
          <Button
            onClick={handleRegenerate}
            variant="contained"
            color="warning"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            autoFocus
          >
            {loading ? 'Génération...' : 'Régénérer'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
