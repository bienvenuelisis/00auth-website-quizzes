import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPracticalWorkById } from '../data/practicalWorks';
import {
  getPracticalWorkProgress,
  submitPracticalWork
} from '../services/firebase/firestore/practicalWorks';
import { uploadPracticalWorkFile } from '../services/firebase/firestorage/practicalWorkFiles';
import {
  createSubmittedDeliverable,
  DELIVERABLE_TYPES,
  getLatestAttempt
} from '../models/practicalWork';

/**
 * Page for submitting practical work deliverables
 */
function PracticalWorkSubmission() {
  const { courseId, practicalWorkId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [practicalWork, setPracticalWork] = useState(null);
  const [progress, setProgress] = useState(null);
  const [deliverableValues, setDeliverableValues] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const pw = getPracticalWorkById(practicalWorkId);
        if (!pw) {
          throw new Error('Travail pratique introuvable');
        }
        setPracticalWork(pw);

        if (user) {
          const userProgress = await getPracticalWorkProgress(user.uid, practicalWorkId);
          setProgress(userProgress);

          // Pre-fill with previous submission if exists
          if (userProgress) {
            const latestAttempt = getLatestAttempt(userProgress);
            if (latestAttempt) {
              const preFilledValues = {};
              latestAttempt.deliverables.forEach(d => {
                preFilledValues[d.deliverableId] = {
                  type: d.type,
                  value: d.value,
                  fileUrl: d.fileUrl,
                  fileName: d.fileName
                };
              });
              setDeliverableValues(preFilledValues);
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [practicalWorkId, user]);

  const handleTextChange = (deliverableId, value) => {
    setDeliverableValues(prev => ({
      ...prev,
      [deliverableId]: { type: DELIVERABLE_TYPES.TEXT, value }
    }));
  };

  const handleUrlChange = (deliverableId, value, type) => {
    setDeliverableValues(prev => ({
      ...prev,
      [deliverableId]: { type, value }
    }));
  };

  const handleFileUpload = async (deliverableId, file) => {
    try {
      setUploadingFiles(prev => ({ ...prev, [deliverableId]: true }));
      setError(null);

      const result = await uploadPracticalWorkFile(
        file,
        user.uid,
        practicalWorkId,
        deliverableId,
        (percent) => {
          setUploadProgress(prev => ({ ...prev, [deliverableId]: percent }));
        }
      );

      setDeliverableValues(prev => ({
        ...prev,
        [deliverableId]: {
          type: DELIVERABLE_TYPES.FILE,
          value: file.name,
          fileUrl: result.url,
          fileName: file.name,
          fileSize: file.size
        }
      }));
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(`Erreur lors de l'upload: ${err.message}`);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [deliverableId]: false }));
      setUploadProgress(prev => ({ ...prev, [deliverableId]: 0 }));
    }
  };

  const handleRemoveFile = (deliverableId) => {
    setDeliverableValues(prev => {
      const newValues = { ...prev };
      delete newValues[deliverableId];
      return newValues;
    });
  };

  const validateSubmission = () => {
    const errors = [];

    practicalWork.deliverables.forEach(deliverable => {
      if (deliverable.required && !deliverableValues[deliverable.id]) {
        errors.push(`Le livrable "${deliverable.name}" est requis`);
      }
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Create submitted deliverables array
      const submittedDeliverables = Object.entries(deliverableValues).map(
        ([deliverableId, data]) => {
          const deliverableDef = practicalWork.deliverables.find(d => d.id === deliverableId);
          return createSubmittedDeliverable(
            deliverableId,
            deliverableDef.name,
            data.type,
            data.value,
            data.fileUrl ? {
              url: data.fileUrl,
              name: data.fileName,
              size: data.fileSize
            } : null
          );
        }
      );

      // Submit practical work
      await submitPracticalWork(
        user.uid,
        practicalWorkId,
        courseId,
        submittedDeliverables,
        practicalWork.deadline
      );

      // Navigate back to detail page
      navigate(`/course/${courseId}/practical-work/${practicalWorkId}`, {
        state: { submitted: true }
      });
    } catch (err) {
      console.error('Error submitting practical work:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
      setConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!practicalWork) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Travail pratique introuvable</Alert>
      </Container>
    );
  }

  const isResubmission = progress?.attempts && progress.attempts.length > 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(`/course/${courseId}/practical-work/${practicalWorkId}`)}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {isResubmission ? 'Nouvelle soumission' : 'Soumettre mon travail'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {practicalWork.title}
        </Typography>
        {isResubmission && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Tentative n°{progress.attempts.length + 1}
          </Alert>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Deliverables form */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>
          Livrables
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {practicalWork.deliverables.map((deliverable) => (
            <Box key={deliverable.id}>
              <Typography variant="subtitle2" gutterBottom>
                {deliverable.name}
                {deliverable.required && (
                  <Chip label="Requis" size="small" color="error" sx={{ ml: 1 }} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" paragraph>
                {deliverable.description}
              </Typography>

              {/* GitHub URL input */}
              {deliverable.type === DELIVERABLE_TYPES.GITHUB && (
                <TextField
                  fullWidth
                  placeholder="https://github.com/username/repository"
                  value={deliverableValues[deliverable.id]?.value || ''}
                  onChange={(e) => handleUrlChange(deliverable.id, e.target.value, DELIVERABLE_TYPES.GITHUB)}
                  InputProps={{
                    startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              )}

              {/* URL input */}
              {deliverable.type === DELIVERABLE_TYPES.URL && (
                <TextField
                  fullWidth
                  placeholder="https://..."
                  value={deliverableValues[deliverable.id]?.value || ''}
                  onChange={(e) => handleUrlChange(deliverable.id, e.target.value, DELIVERABLE_TYPES.URL)}
                  type="url"
                />
              )}

              {/* Text area input */}
              {deliverable.type === DELIVERABLE_TYPES.TEXT && (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Entrez votre texte ici..."
                  value={deliverableValues[deliverable.id]?.value || ''}
                  onChange={(e) => handleTextChange(deliverable.id, e.target.value)}
                />
              )}

              {/* File upload */}
              {deliverable.type === DELIVERABLE_TYPES.FILE && (
                <Box>
                  {deliverableValues[deliverable.id] ? (
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper'
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <AttachFileIcon color="primary" />
                        <Typography variant="body2">
                          {deliverableValues[deliverable.id].fileName}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(deliverable.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploadingFiles[deliverable.id]}
                        fullWidth
                      >
                        {uploadingFiles[deliverable.id] ? 'Upload en cours...' : 'Choisir un fichier'}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) handleFileUpload(deliverable.id, file);
                          }}
                          accept=".pdf,.zip,.jpg,.jpeg,.png,.mp4"
                        />
                      </Button>
                      {uploadingFiles[deliverable.id] && (
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress[deliverable.id] || 0}
                          sx={{ mt: 1 }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Formats acceptés: PDF, ZIP, Images (JPG, PNG), Vidéos (MP4) - Max 10MB
                      </Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Previous submissions */}
        {isResubmission && progress.attempts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Soumissions précédentes
            </Typography>
            <List dense>
              {progress.attempts.map((attempt, index) => (
                <ListItem key={attempt.attemptId}>
                  <ListItemText
                    primary={`Tentative ${attempt.attemptNumber}`}
                    secondary={`Soumis le ${new Date(attempt.submittedAt).toLocaleDateString()} ${
                      attempt.evaluation ? `- Note: ${attempt.evaluation.totalScore}/100` : '- En attente d\'évaluation'
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Submit button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => setConfirmDialog(true)}
          disabled={submitting || Object.keys(uploadingFiles).some(key => uploadingFiles[key])}
        >
          {submitting ? 'Soumission en cours...' : 'Soumettre mon travail'}
        </Button>
      </Paper>

      {/* Confirmation dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmer la soumission</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir soumettre votre travail ? Vous pourrez toujours
            {isResubmission ? ' soumettre une nouvelle version' : ' le modifier'} plus tard si nécessaire.
          </Typography>
          {practicalWork.deadline && new Date() > practicalWork.deadline && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Attention: Cette soumission est en retard. Des points peuvent être déduits.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? 'Soumission...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default PracticalWorkSubmission;
