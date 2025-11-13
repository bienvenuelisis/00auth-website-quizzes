import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  LinearProgress
} from '@mui/material';
import { Edit, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { signOutCurrentUser } from '../services/firebase/auth';
import ProfileEditor from '../components/Profile/ProfileEditor';
import { useQuizStore } from '../stores/quizStore';

const LEVEL_LABELS = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé'
};

/**
 * Page de profil utilisateur
 */
export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const { userProgress } = useQuizStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!user || !profile) {
    navigate('/auth');
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOutCurrentUser();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    refreshProfile();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <ProfileEditor
          profile={profile}
          onUpdate={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Container>
    );
  }

  // Calculer les statistiques
  const stats = userProgress.globalStats || {
    totalModulesCompleted: 0,
    totalQuizzesTaken: 0,
    averageScore: 0,
    totalTimeSpent: 0
  };

  const totalModules = Object.keys(userProgress.modules || {}).length;
  const completionRate =
    totalModules > 0 ? Math.round((stats.totalModulesCompleted / totalModules) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Carte de profil */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={profile.photoURL}
              alt={profile.fullName}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            />

            <Typography variant="h5" gutterBottom>
              {profile.fullName}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {profile.email}
            </Typography>

            <Chip
              label={LEVEL_LABELS[profile.level] || profile.level}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                fullWidth
              >
                Modifier le profil
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                fullWidth
              >
                Se déconnecter
              </Button>
            </Box>
          </Paper>

          {/* Informations */}
          <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informations
            </Typography>

            <List dense>
              {profile.phone && (
                <ListItem>
                  <ListItemText primary="Téléphone" secondary={profile.phone} />
                </ListItem>
              )}

              {profile.company && (
                <ListItem>
                  <ListItemText primary="Entreprise" secondary={profile.company} />
                </ListItem>
              )}

              {profile.jobTitle && (
                <ListItem>
                  <ListItemText primary="Poste" secondary={profile.jobTitle} />
                </ListItem>
              )}

              <ListItem>
                <ListItemText
                  primary="Membre depuis"
                  secondary={new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Statistiques et progression */}
        <Grid item xs={12} md={8}>
          {/* Statistiques globales */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistiques de progression
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.totalQuizzesTaken}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quiz passés
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.totalModulesCompleted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Modules complétés
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {stats.averageScore}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score moyen
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {Math.round(stats.totalTimeSpent / 60)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Minutes passées
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progression globale: {completionRate}%
              </Typography>
              <LinearProgress variant="determinate" value={completionRate} sx={{ height: 10 }} />
            </Box>
          </Paper>

          {/* Objectifs de formation */}
          {profile.goals && profile.goals.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Objectifs de formation
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {profile.goals.map((goal) => (
                  <Chip key={goal} label={goal} variant="outlined" />
                ))}
              </Box>
            </Paper>
          )}

          {/* Badges */}
          {stats.badges && stats.badges.length > 0 && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Badges obtenus
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {stats.badges.map((badge) => (
                  <Chip key={badge} label={badge} color="secondary" />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
