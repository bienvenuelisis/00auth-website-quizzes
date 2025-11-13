import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  OutlinedInput,
  CircularProgress
} from '@mui/material';
import { registerNewUser } from '../../services/firebase/firestore/auth';
import { initializeProgress } from '../../services/firebase/firestore/progress';

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' }
];

/**
 * Formulaire d'inscription
 */
export default function SignUpForm({ onSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    jobTitle: '',
    level: 'beginner',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Le nom complet est requis');
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email invalide');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Créer le compte Firebase Auth et le profil Firestore
      await registerNewUser({
        formData: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          level: formData.level,
        },
        onSuccess: async ({ credential, userDocId }) => {
          // Initialiser la progression
          await initializeProgress(credential.user.uid);

          // Notifier le succès
          onSuccess?.({
            user: credential.user,
            profile: {
              uid: credential.user.uid,
              email: formData.email,
              fullName: formData.fullName
            }
          });
        },
        onError: (errorMessage) => {
          setError(errorMessage);
          setLoading(false);
        },
        onLogOut: () => {
          // Gérer la déconnexion automatique
        }
      });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Créer un compte
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Rejoignez la formation Développeur Mobile Flutter
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Nom complet */}
      <TextField
        fullWidth
        label="Nom complet"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
        required
      />

      {/* Email */}
      <TextField
        fullWidth
        type="email"
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
        required
      />

      {/* Mot de passe */}
      <TextField
        fullWidth
        type="password"
        label="Mot de passe"
        name="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
        required
        helperText="Au moins 6 caractères"
      />

      {/* Confirmation mot de passe */}
      <TextField
        fullWidth
        type="password"
        label="Confirmer le mot de passe"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
        required
      />

      {/* Téléphone */}
      <TextField
        fullWidth
        label="Téléphone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
      />

      {/* Poste */}
      <TextField
        fullWidth
        label="Poste"
        name="jobTitle"
        value={formData.jobTitle}
        onChange={handleChange}
        margin="normal"
        disabled={loading}
      />

      {/* Niveau */}
      <FormControl fullWidth margin="normal">
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

      {/* Bouton Submit */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'S\'inscrire'}
      </Button>

      {/* Lien vers connexion */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Vous avez déjà un compte ?{' '}
          <Button onClick={onSwitchToLogin} disabled={loading}>
            Se connecter
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
