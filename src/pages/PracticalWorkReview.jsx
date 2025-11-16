import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Button,
  TextField,
  Slider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Link as MuiLink,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  AttachFile as AttachFileIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../services/firebase/firestore/profile';
import { getPracticalWorkById } from '../data/practicalWorks';
import {
  getPracticalWorkProgress,
  evaluatePracticalWork
} from '../services/firebase/firestore/practicalWorks';
import { getLatestAttempt, DELIVERABLE_TYPES } from '../models/practicalWork';

/**
 * Page for instructors to review and evaluate practical work submissions
 */
function PracticalWorkReview() {
  const { practicalWorkId, userId, attemptNumber } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [practicalWork, setPracticalWork] = useState(null);
  const [progress, setProgress] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load practical work
        const pw = getPracticalWorkById(practicalWorkId);
        if (!pw) {
          throw new Error('Travail pratique introuvable');
        }
        setPracticalWork(pw);

        // Load student progress
        const studentProgress = await getPracticalWorkProgress(userId, practicalWorkId);
        if (!studentProgress) {
          throw new Error('Progression introuvable');
        }
        setProgress(studentProgress);

        // Get the attempt to review
        const attemptNum = attemptNumber ? parseInt(attemptNumber) : studentProgress.currentAttemptNumber;
        const attemptToReview = studentProgress.attempts.find(a => a.attemptNumber === attemptNum) ||
                                getLatestAttempt(studentProgress);
        if (!attemptToReview) {
          throw new Error('Soumission introuvable');
        }
        setAttempt(attemptToReview);

        // Load student profile
        const student = await getProfile(userId);
        setStudentProfile(student);

        // Initialize scores and feedbacks
        const initialScores = {};
        const initialFeedbacks = {};
        pw.evaluationCriteria.forEach(criteria => {
          initialScores[criteria.id] = attemptToReview.evaluation?.scores.find(
            s => s.criteriaId === criteria.id
          )?.score || 0;
          initialFeedbacks[criteria.id] = attemptToReview.evaluation?.scores.find(
            s => s.criteriaId === criteria.id
          )?.feedback || '';
        });
        setScores(initialScores);
        setFeedbacks(initialFeedbacks);
        setGeneralFeedback(attemptToReview.evaluation?.generalFeedback || '');
      } catch (err) {
        console.error('Error loading review data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [practicalWorkId, userId, attemptNumber]);

  const handleScoreChange = (criteriaId, value) => {
    setScores(prev => ({ ...prev, [criteriaId]: value }));
  };

  const handleFeedbackChange = (criteriaId, value) => {
    setFeedbacks(prev => ({ ...prev, [criteriaId]: value }));
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const handleSubmitEvaluation = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Prepare scores array
      const criteriaScores = practicalWork.evaluationCriteria.map(criteria => ({
        criteriaId: criteria.id,
        name: criteria.name,
        score: scores[criteria.id] || 0,
        maxPoints: criteria.maxPoints,
        feedback: feedbacks[criteria.id] || ''
      }));

      // Submit evaluation
      await evaluatePracticalWork(
        userId,
        practicalWorkId,
        attempt.attemptNumber,
        user.uid,
        profile.fullName || profile.displayName,
        criteriaScores,
        generalFeedback
      );

      // Navigate back
      navigate(-1);
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
      setConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!practicalWork || !attempt || !studentProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Données introuvables</Alert>
      </Container>
    );
  }

  const totalScore = calculateTotalScore();
  const isAlreadyEvaluated = !!attempt.evaluation;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              src={studentProfile.photoURL}
              sx={{ width: 64, height: 64 }}
            >
              <PersonIcon />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold">
              Évaluation: {practicalWork.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Étudiant: {studentProfile.fullName || studentProfile.displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Email: {studentProfile.email}
            </Typography>
          </Grid>
          <Grid item>
            <Chip
              label={`Tentative ${attempt.attemptNumber}`}
              color="primary"
            />
            {attempt.isLate && (
              <Chip
                label={`En retard de ${attempt.daysLate} jour(s)`}
                color="error"
                sx={{ ml: 1 }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left: Deliverables */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Livrables soumis
            </Typography>
            <Typography variant="caption" color="text.secondary" paragraph>
              Soumis le {new Date(attempt.submittedAt).toLocaleString()}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List>
              {attempt.deliverables.map((deliverable) => (
                <ListItem key={deliverable.deliverableId} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight="medium">
                        {deliverable.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        {deliverable.type === DELIVERABLE_TYPES.GITHUB && (
                          <MuiLink
                            href={deliverable.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <GitHubIcon fontSize="small" />
                            {deliverable.value}
                            <OpenInNewIcon fontSize="small" />
                          </MuiLink>
                        )}
                        {deliverable.type === DELIVERABLE_TYPES.URL && (
                          <MuiLink
                            href={deliverable.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            {deliverable.value}
                            <OpenInNewIcon fontSize="small" />
                          </MuiLink>
                        )}
                        {deliverable.type === DELIVERABLE_TYPES.FILE && (
                          <MuiLink
                            href={deliverable.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <AttachFileIcon fontSize="small" />
                            {deliverable.fileName}
                            <OpenInNewIcon fontSize="small" />
                          </MuiLink>
                        )}
                        {deliverable.type === DELIVERABLE_TYPES.TEXT && (
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              mt: 1,
                              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50'
                            }}
                          >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                              {deliverable.value}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Previous evaluation if exists */}
          {isAlreadyEvaluated && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Cette soumission a déjà été évaluée avec une note de {attempt.evaluation.totalScore}/100.
              Vous pouvez modifier l'évaluation ci-contre.
            </Alert>
          )}
        </Grid>

        {/* Right: Evaluation form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20, bgcolor: 'background.paper' }}>
            <Typography variant="h6" gutterBottom>
              Formulaire d'évaluation
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {practicalWork.evaluationCriteria.map((criteria) => (
                <Box key={criteria.id}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {criteria.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {scores[criteria.id] || 0}/{criteria.maxPoints}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" paragraph>
                    {criteria.description}
                  </Typography>
                  <Slider
                    value={scores[criteria.id] || 0}
                    onChange={(e, value) => handleScoreChange(criteria.id, value)}
                    min={0}
                    max={criteria.maxPoints}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Feedback pour ce critère..."
                    multiline
                    rows={2}
                    value={feedbacks[criteria.id] || ''}
                    onChange={(e) => handleFeedbackChange(criteria.id, e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}

              <Divider />

              {/* Total score */}
              <Card
                sx={{
                  bgcolor: (theme) => totalScore >= 70
                    ? (theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.2)' : 'success.lighter')
                    : (theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.2)' : 'error.lighter'),
                  border: '2px solid',
                  borderColor: totalScore >= 70 ? 'success.main' : 'error.main'
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Score total
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    color={totalScore >= 70 ? 'success.main' : 'error.main'}
                  >
                    {totalScore}/{practicalWork.gradingRubric.total}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={totalScore >= 70 ? 'success.main' : 'error.main'}
                  >
                    {totalScore >= 70 ? 'Réussi ✓' : totalScore >= 50 ? 'Révision nécessaire' : 'Non réussi'}
                  </Typography>
                </CardContent>
              </Card>

              {/* General feedback */}
              <TextField
                fullWidth
                label="Feedback général"
                placeholder="Commentaire général sur le travail de l'étudiant..."
                multiline
                rows={4}
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                required
              />

              {/* Submit button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={() => setConfirmDialog(true)}
                disabled={submitting || !generalFeedback.trim()}
              >
                {submitting
                  ? 'Enregistrement...'
                  : isAlreadyEvaluated
                  ? 'Modifier l\'évaluation'
                  : 'Valider l\'évaluation'
                }
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmer l'évaluation</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Vous allez {isAlreadyEvaluated ? 'modifier' : 'enregistrer'} l'évaluation suivante:
          </Typography>
          <Box sx={{
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
            p: 2,
            borderRadius: 1
          }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Note: {totalScore}/100
            </Typography>
            <Typography variant="body2">
              Statut: {totalScore >= 70 ? 'Réussi' : totalScore >= 50 ? 'Révision nécessaire' : 'Non réussi'}
            </Typography>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            L'étudiant recevra une notification avec votre feedback.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmitEvaluation} variant="contained" disabled={submitting}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PracticalWorkReview;
