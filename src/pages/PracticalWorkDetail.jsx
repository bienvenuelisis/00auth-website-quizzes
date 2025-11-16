import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  GitHub as GitHubIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon,
  TextFields as TextIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import StatusBadge from '../components/PracticalWorks/StatusBadge';
import { getPracticalWorkById } from '../data/practicalWorks';
import {
  getPracticalWorkProgress,
  markPracticalWorkInProgress
} from '../services/firebase/firestore/practicalWorks';
import {
  calculateDeadlineStatus,
  getLatestAttempt,
  getBestAttempt,
  PW_STATUS,
  DELIVERABLE_TYPES
} from '../models/practicalWork';

const DELIVERABLE_ICONS = {
  [DELIVERABLE_TYPES.GITHUB]: GitHubIcon,
  [DELIVERABLE_TYPES.FILE]: AttachFileIcon,
  [DELIVERABLE_TYPES.URL]: LinkIcon,
  [DELIVERABLE_TYPES.TEXT]: TextIcon
};

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
 * Page displaying practical work details
 */
function PracticalWorkDetail() {
  const { courseId, practicalWorkId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [practicalWork, setPracticalWork] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingWork, setStartingWork] = useState(false);

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

        // Load progress
        if (user) {
          const userProgress = await getPracticalWorkProgress(user.uid, practicalWorkId);
          setProgress(userProgress);
        }
      } catch (error) {
        console.error('Error loading practical work:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [practicalWorkId, user]);

  const handleStartWork = async () => {
    try {
      setStartingWork(true);
      await markPracticalWorkInProgress(user.uid, practicalWorkId, courseId);

      // Reload progress
      const updatedProgress = await getPracticalWorkProgress(user.uid, practicalWorkId);
      setProgress(updatedProgress);
    } catch (error) {
      console.error('Error starting work:', error);
    } finally {
      setStartingWork(false);
    }
  };

  const handleSubmit = () => {
    navigate(`/course/${courseId}/practical-work/${practicalWorkId}/submit`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!practicalWork) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Travail pratique introuvable</Alert>
      </Container>
    );
  }

  const deadlineStatus = calculateDeadlineStatus(practicalWork.deadline);
  const latestAttempt = progress ? getLatestAttempt(progress) : null;
  const bestAttempt = progress ? getBestAttempt(progress) : null;
  const canSubmit = !progress ||
                    progress.status === PW_STATUS.NOT_STARTED ||
                    progress.status === PW_STATUS.IN_PROGRESS ||
                    progress.status === PW_STATUS.REVISION_REQUESTED;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/course/${courseId}/practical-works`)}
        sx={{ mb: 2 }}
      >
        Retour à la liste
      </Button>

      {/* Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {practicalWork.week}
            </Typography>
            {practicalWork.isBonus && (
              <Chip label="Bonus" size="small" color="secondary" icon={<TrophyIcon />} />
            )}
          </Stack>

          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            {practicalWork.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {practicalWork.description}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={DIFFICULTY_LABELS[practicalWork.difficulty]}
              color={DIFFICULTY_COLORS[practicalWork.difficulty]}
            />
            <Chip
              label={`${practicalWork.estimatedHours}h estimées`}
              icon={<ScheduleIcon />}
              variant="outlined"
            />
            {deadlineStatus.hasDeadline && (
              <Chip
                label={
                  deadlineStatus.isOverdue
                    ? `En retard de ${Math.abs(deadlineStatus.daysRemaining)} jour(s)`
                    : `${deadlineStatus.daysRemaining} jour(s) restant(s)`
                }
                color={deadlineStatus.isOverdue ? 'error' : 'info'}
              />
            )}
          </Stack>
        </Box>

        {/* Topics */}
        {practicalWork.topics && practicalWork.topics.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Thèmes abordés
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {practicalWork.topics.map((topic, index) => (
                <Chip key={index} label={topic} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        )}

        {/* Progress summary */}
        {progress && (
          <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Ma progression
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Statut
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusBadge status={progress.status} />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Tentatives
                  </Typography>
                  <Typography variant="h6">
                    {progress.attempts?.length || 0}
                  </Typography>
                </Grid>
                {progress.bestScore !== null && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Meilleure note
                    </Typography>
                    <Typography
                      variant="h6"
                      color={progress.bestScore >= 70 ? 'success.main' : 'text.primary'}
                    >
                      {progress.bestScore}/100
                    </Typography>
                  </Grid>
                )}
                {bestAttempt?.evaluation && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">
                      Dernier feedback
                    </Typography>
                    <Typography variant="body2" noWrap>
                      {bestAttempt.evaluation.generalFeedback.substring(0, 30)}...
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          {/* Instructions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                '& h1': { fontSize: '1.5rem', fontWeight: 'bold', mt: 2, mb: 1 },
                '& h2': { fontSize: '1.25rem', fontWeight: 'bold', mt: 2, mb: 1 },
                '& h3': { fontSize: '1.1rem', fontWeight: 'bold', mt: 1.5, mb: 1 },
                '& p': { mb: 1 },
                '& ul, & ol': { pl: 3, mb: 1 },
                '& code': {
                  bgcolor: 'grey.100',
                  p: 0.5,
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }
              }}
            >
              <ReactMarkdown>{practicalWork.instructions}</ReactMarkdown>
            </Box>
          </Paper>

          {/* Deliverables */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Livrables attendus
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {practicalWork.deliverables.map((deliverable) => {
                const Icon = DELIVERABLE_ICONS[deliverable.type];
                return (
                  <ListItem key={deliverable.id}>
                    <ListItemIcon>
                      {Icon ? <Icon color="primary" /> : <AssignmentIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {deliverable.name}
                          {deliverable.required && (
                            <Chip label="Requis" size="small" color="error" />
                          )}
                        </Box>
                      }
                      secondary={deliverable.description}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          {/* Latest evaluation */}
          {latestAttempt?.evaluation && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Dernière évaluation
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  {latestAttempt.evaluation.totalScore}/100
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Évalué par {latestAttempt.evaluation.evaluatorName}
                </Typography>
              </Box>

              {latestAttempt.evaluation.scores.map(score => (
                <Box key={score.criteriaId} sx={{ mb: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="medium">
                      {score.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {score.score}/{score.maxPoints}
                    </Typography>
                  </Box>
                  {score.feedback && (
                    <Typography variant="caption" color="text.secondary">
                      {score.feedback}
                    </Typography>
                  )}
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                <strong>Feedback général:</strong> {latestAttempt.evaluation.generalFeedback}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Actions */}
          <Paper sx={{ p: 3, mb: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!progress || progress.status === PW_STATUS.NOT_STARTED ? (
              <Button
                variant="contained"
                fullWidth
                onClick={handleStartWork}
                disabled={startingWork}
                sx={{ mb: 2 }}
              >
                {startingWork ? 'Démarrage...' : 'Commencer ce TP'}
              </Button>
            ) : null}

            {canSubmit && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleSubmit}
                sx={{ mb: 2 }}
              >
                {progress?.attempts?.length > 0 ? 'Nouvelle soumission' : 'Soumettre mon travail'}
              </Button>
            )}

            {progress?.isPassed && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Vous avez réussi ce TP !
              </Alert>
            )}

            {deadlineStatus.isOverdue && !progress?.isPassed && (
              <Alert severity="warning">
                Ce TP est en retard. Vous pouvez toujours le soumettre mais des points peuvent être déduits.
              </Alert>
            )}
          </Paper>

          {/* Grading rubric */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Barème de notation
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Critère</TableCell>
                    <TableCell align="right">Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {practicalWork.evaluationCriteria.map((criteria) => (
                    <TableRow key={criteria.id}>
                      <TableCell>
                        <Typography variant="body2">{criteria.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {criteria.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {criteria.maxPoints}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        Total
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {practicalWork.gradingRubric.total}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Alert severity="info" sx={{ mt: 2 }}>
              Seuil de réussite: 70/100
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default PracticalWorkDetail;
