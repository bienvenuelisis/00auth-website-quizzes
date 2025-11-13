import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import { signInUser } from '../../services/firebase/firestore/auth';

/**
 * Formulaire de connexion
 */
export default function LoginForm({ onSuccess, onSwitchToSignUp }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Email invalide');
      return false;
    }

    if (!formData.password) {
      setError('Mot de passe requis');
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
      await signInUser({
        formData: {
          email: formData.email,
          password: formData.password
        },
        onSuccess: ({ user, credential }) => {
          onSuccess?.({
            user: credential.user,
            profile: user
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
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 450, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Connexion
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Accédez à votre formation Flutter
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
        autoFocus
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
      />

      {/* Mot de passe oublié */}
      <Box sx={{ textAlign: 'right', mt: 1 }}>
        <MuiLink
          component="button"
          type="button"
          variant="body2"
          onClick={() => {
            // TODO: Implémenter la réinitialisation du mot de passe
            alert('Fonctionnalité à venir');
          }}
          disabled={loading}
        >
          Mot de passe oublié ?
        </MuiLink>
      </Box>

      {/* Bouton Submit */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Se connecter'}
      </Button>

      {/* Lien vers inscription */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Pas encore de compte ?{' '}
          <Button onClick={onSwitchToSignUp} disabled={loading}>
            S'inscrire
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
