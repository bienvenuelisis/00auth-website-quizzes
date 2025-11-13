/**
 * Page d'administration - Gestion des utilisateurs
 */

import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Alert,
  Tabs,
  Tab,
  Avatar,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as ValidateIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { usePermissions } from '../hooks/usePermissions';
import {
  getAllUsers,
  getPendingUsers,
  validateAccount,
  invalidateAccount,
  changeUserRole,
  deactivateProfile,
  activateProfile
} from '../services/firebase/firestore/profile';
import { getPlatformStats, searchUsers } from '../services/firebase/firestore/admin';
import { AdminRoute } from '../components/Auth/ProtectedRoute';

/**
 * Statistiques de la plateforme
 */
function PlatformStatsCards({ stats }) {
  const cards = [
    {
      title: 'Utilisateurs Total',
      value: stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2'
    },
    {
      title: 'Comptes Validés',
      value: stats.validatedUsers,
      icon: <ValidateIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32'
    },
    {
      title: 'En Attente',
      value: stats.pendingUsers,
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02'
    },
    {
      title: 'Quiz Passés',
      value: stats.totalQuizzesTaken,
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0'
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ color: card.color }}>
                  {card.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography color="text.secondary" variant="body2">
                    {card.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {card.value}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Composant principal d'administration
 */
function AdminDashboardContent() {
  const { canManageUsers, canValidateAccounts } = usePermissions();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      handleSearch();
    }
  }, [searchTerm, users]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, pending, platformStats] = await Promise.all([
        getAllUsers(),
        getPendingUsers(),
        getPlatformStats()
      ]);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setPendingUsers(pending);
      setStats(platformStats);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    try {
      const results = await searchUsers(searchTerm);
      setFilteredUsers(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const handleValidate = async (userId) => {
    try {
      await validateAccount(userId);
      await loadData();
      alert('Compte validé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du compte');
    }
  };

  const handleInvalidate = async (userId) => {
    try {
      await invalidateAccount(userId);
      await loadData();
      alert('Compte invalidé');
    } catch (error) {
      console.error('Erreur lors de l\'invalidation:', error);
      alert('Erreur lors de l\'invalidation du compte');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      if (isActive) {
        await deactivateProfile(userId);
      } else {
        await activateProfile(userId);
      }
      await loadData();
      alert(`Compte ${isActive ? 'désactivé' : 'activé'} avec succès`);
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error);
      alert('Erreur lors du changement d\'état du compte');
    }
  };

  const handleOpenEditDialog = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleChangeRole = async (newRole) => {
    if (!selectedUser) return;

    try {
      await changeUserRole(selectedUser.uid, newRole);
      await loadData();
      handleCloseDialog();
      alert('Rôle modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      alert('Erreur lors du changement de rôle');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      instructor: 'primary',
      moderator: 'warning',
      user: 'default'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      instructor: 'Instructeur',
      moderator: 'Modérateur',
      user: 'Utilisateur'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement...
        </Typography>
      </Container>
    );
  }

  if (!canManageUsers && !canValidateAccounts) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Administration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez les utilisateurs, validez les comptes et suivez les statistiques de la plateforme
        </Typography>
      </Box>

      {/* Statistiques de la plateforme */}
      {stats && <PlatformStatsCards stats={stats} />}

      {/* Barre de recherche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Paper>

      {/* Tabs pour filtrer */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Tous les utilisateurs (${filteredUsers.length})`} />
          <Tab label={`En attente de validation (${pendingUsers.length})`} />
        </Tabs>
      </Paper>

      {/* Tab 1: Tous les utilisateurs */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Compte</TableCell>
                <TableCell>Dernière Connexion</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar src={user.photoURL} alt={user.fullName}>
                        {user.fullName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {user.displayName || user.fullName}
                        </Typography>
                        {user.isFirstAdmin && (
                          <Chip label="Premier Admin" size="small" color="secondary" sx={{ mt: 0.5 }} />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Actif' : 'Désactivé'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.accountIsValid ? 'Validé' : 'En attente'}
                      color={user.accountIsValid ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastConnexion
                      ? new Date(user.lastConnexion).toLocaleString('fr-FR')
                      : 'Jamais'}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {canManageUsers && !user.isFirstAdmin && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(user)}
                          title="Modifier le rôle"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canValidateAccounts && !user.accountIsValid && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleValidate(user.uid)}
                          title="Valider le compte"
                        >
                          <ValidateIcon fontSize="small" />
                        </IconButton>
                      )}
                      {canManageUsers && !user.isFirstAdmin && (
                        <IconButton
                          size="small"
                          color={user.isActive ? 'error' : 'success'}
                          onClick={() => handleToggleActive(user.uid, user.isActive)}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2: En attente de validation */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Inscrit le</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      Aucun compte en attente de validation
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pendingUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.photoURL} alt={user.fullName}>
                          {user.fullName.charAt(0)}
                        </Avatar>
                        <Typography>{user.displayName || user.fullName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {canValidateAccounts && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<ValidateIcon />}
                          onClick={() => handleValidate(user.uid)}
                        >
                          Valider
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de modification du rôle */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          Modifier le rôle de {selectedUser?.displayName || selectedUser?.fullName}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 300 }}>
          <FormControl fullWidth>
            <InputLabel>Rôle</InputLabel>
            <Select
              value={selectedUser?.role || 'user'}
              label="Rôle"
              onChange={(e) => handleChangeRole(e.target.value)}
            >
              <MenuItem value="user">Utilisateur</MenuItem>
              <MenuItem value="instructor">Instructeur</MenuItem>
              <MenuItem value="moderator">Modérateur</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

/**
 * Page d'administration protégée
 */
export default function AdminDashboard() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
