/**
 * EXEMPLE - Composant de Gestion des Utilisateurs
 * Ce fichier est un exemple d'utilisation du système d'administration
 * À adapter selon vos besoins
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
  Tab
} from '@mui/material';
import {
  CheckCircle as ValidateIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { usePermissions } from '../../hooks/usePermissions';
import {
  getAllUsers,
  getPendingUsers,
  validateAccount,
  invalidateAccount,
  changeUserRole,
  deactivateProfile,
  activateProfile
} from '../../services/firebase/firestore/profile';

/**
 * Composant principal de gestion des utilisateurs
 */
export default function UserManagement() {
  const { canManageUsers, canValidateAccounts } = usePermissions();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [allUsers, pending] = await Promise.all([
        getAllUsers(),
        getPendingUsers()
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (userId) => {
    try {
      await validateAccount(userId);
      await loadUsers();
      alert('Compte validé avec succès !');
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du compte');
    }
  };

  const handleInvalidate = async (userId) => {
    try {
      await invalidateAccount(userId);
      await loadUsers();
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
      await loadUsers();
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
      await loadUsers();
      handleCloseDialog();
      alert('Rôle modifié avec succès !');
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      alert('Erreur lors du changement de rôle');
    }
  };

  if (!canManageUsers && !canValidateAccounts) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Alert>
      </Container>
    );
  }

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Gestion des Utilisateurs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gérez les comptes utilisateurs, les rôles et les validations
        </Typography>
      </Box>

      {/* Tabs pour filtrer */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Tous les utilisateurs (${users.length})`} />
          <Tab label={`En attente de validation (${pendingUsers.length})`} />
        </Tabs>
      </Paper>

      {/* Tab 1: Tous les utilisateurs */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Compte</TableCell>
                <TableCell>Inscrit le</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {user.displayName || user.fullName}
                      </Typography>
                      {user.isFirstAdmin && (
                        <Chip label="Premier Admin" size="small" color="secondary" sx={{ mt: 0.5 }} />
                      )}
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
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                      : '-'}
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
                <TableCell>Nom</TableCell>
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
                  <TableRow key={user.id}>
                    <TableCell>{user.displayName || user.fullName}</TableCell>
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
