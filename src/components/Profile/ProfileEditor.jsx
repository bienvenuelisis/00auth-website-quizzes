import { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  CircularProgress,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { updateProfile, updateProfilePhoto } from '../../services/firebase/firestore/profile';
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  prepareImageForUpload
} from '../../services/firebase/firestorage/profilePhoto';

const LEARNING_GOALS = [
  'Maîtriser Flutter',
  'Développer des applications mobiles professionnelles',
  'Améliorer mes compétences en Dart',
  'Comprendre l\'architecture d\'applications',
  'Apprendre les bonnes pratiques',
  'Créer mon portfolio'
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' }
];

/**
 * Composant d'édition de profil
 */
export default function ProfileEditor({ profile, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    phone: profile.phone || '',
    company: profile.company || '',
    jobTitle: profile.jobTitle || '',
    level: profile.level || 'beginner',
    goals: profile.goals || []
  });

  const [photoURL, setPhotoURL] = useState(profile.photoURL || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleGoalsChange = (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      goals: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError('');
    setUploadProgress(0);

    try {
      // Préparer l'image (redimensionner si nécessaire)
      const preparedFile = await prepareImageForUpload(file);

      // Upload
      const downloadURL = await uploadProfilePhoto(profile.uid, preparedFile, {
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        onError: (errorMsg) => {
          setError(errorMsg);
          setUploadingPhoto(false);
        }
      });

      // Supprimer l'ancienne photo si elle existe
      if (photoURL) {
        try {
          await deleteProfilePhoto(photoURL);
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      }

      // Mettre à jour le profil avec la nouvelle photo
      await updateProfilePhoto(profile.uid, downloadURL);

      setPhotoURL(downloadURL);
      setSuccess('Photo de profil mise à jour');
      setUploadingPhoto(false);

      // Notifier le parent
      onUpdate?.({ ...profile, photoURL: downloadURL });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'upload de la photo');
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDelete = async () => {
    if (!photoURL) return;

    setUploadingPhoto(true);
    setError('');

    try {
      await deleteProfilePhoto(photoURL);
      await updateProfilePhoto(profile.uid, null);

      setPhotoURL(null);
      setSuccess('Photo de profil supprimée');
      setUploadingPhoto(false);

      // Notifier le parent
      onUpdate?.({ ...profile, photoURL: null });
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression de la photo');
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Le nom complet est requis');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(profile.uid, {
        fullName: formData.fullName,
        phone: formData.phone,
        company: formData.company,
        jobTitle: formData.jobTitle,
        level: formData.level,
        goals: formData.goals
      });

      setSuccess('Profil mis à jour avec succès');
      setLoading(false);

      // Notifier le parent
      onUpdate?.({
        ...profile,
        ...formData
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
      setLoading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Modifier le profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Photo de profil */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Avatar
            src={photoURL}
            alt={formData.fullName}
            sx={{ width: 120, height: 120, mb: 2, mx: 'auto' }}
          />

          {uploadingPhoto && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.5)',
                borderRadius: '50%'
              }}
            >
              <CircularProgress
                variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
                value={uploadProgress}
                sx={{ color: 'white' }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePhotoSelect}
          />

          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto || loading}
          >
            Changer la photo
          </Button>

          {photoURL && (
            <IconButton
              color="error"
              onClick={handlePhotoDelete}
              disabled={uploadingPhoto || loading}
            >
              <Delete />
            </IconButton>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Format acceptés: JPG, PNG, WebP (max 5MB)
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Formulaire */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Nom complet */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nom complet *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </Grid>

          {/* Email (lecture seule) */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled
              helperText="L'email ne peut pas être modifié"
            />
          </Grid>

          {/* Téléphone */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          {/* Niveau */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Niveau d'expérience</InputLabel>
              <Select
                name="level"
                value={formData.level}
                onChange={handleChange}
                disabled={loading}
                label="Niveau d'expérience"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Entreprise */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Entreprise"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          {/* Poste */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Poste"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>

          {/* Objectifs */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Objectifs de formation</InputLabel>
              <Select
                multiple
                value={formData.goals}
                onChange={handleGoalsChange}
                input={<OutlinedInput label="Objectifs de formation" />}
                disabled={loading}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {LEARNING_GOALS.map((goal) => (
                  <MenuItem key={goal} value={goal}>
                    {goal}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Boutons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
