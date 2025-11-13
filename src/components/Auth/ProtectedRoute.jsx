/**
 * Composant pour protéger les routes basé sur les permissions
 */

import { Navigate } from 'react-router-dom';
import { Alert, Container, Box, Typography, Button } from '@mui/material';
import { Lock as LockIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, canAccessPlatform } from '../../models/participant';

/**
 * Protège une route en vérifiant l'authentification et les permissions
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu à afficher si autorisé
 * @param {string} [props.requiredPermission] - Permission requise
 * @param {string[]} [props.allowedRoles] - Rôles autorisés
 * @param {string} [props.redirectTo='/auth'] - Route de redirection si non autorisé
 */
export default function ProtectedRoute({
  children,
  requiredPermission = null,
  allowedRoles = null,
  redirectTo = '/auth'
}) {
  const { user, profile, loading, isAuthenticated } = useAuth();

  // Attendre le chargement
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Chargement...
        </Typography>
      </Container>
    );
  }

  // Non authentifié → Redirection vers la page de connexion
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Pas de profil → Erreur
  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" icon={<WarningIcon />}>
          <Typography variant="h6" gutterBottom>
            Erreur de profil
          </Typography>
          <Typography>
            Impossible de charger votre profil. Veuillez vous reconnecter.
          </Typography>
        </Alert>
      </Container>
    );
  }

  // Vérifier si le compte peut accéder à la plateforme
  const { canAccess, reason } = canAccessPlatform(profile);

  if (!canAccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning" icon={<LockIcon />}>
          <Typography variant="h6" gutterBottom>
            Accès non autorisé
          </Typography>
          <Typography paragraph>
            {reason}
          </Typography>
          {!profile.accountIsValid && profile.role !== 'admin' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Un administrateur doit valider votre compte avant que vous puissiez accéder à la plateforme.
                Vous recevrez un email de confirmation une fois votre compte validé.
              </Typography>
            </Box>
          )}
        </Alert>
      </Container>
    );
  }

  // Vérifier les rôles autorisés
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" icon={<LockIcon />}>
          <Typography variant="h6" gutterBottom>
            Accès refusé
          </Typography>
          <Typography>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => window.history.back()}>
              Retour
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  // Vérifier la permission requise
  if (requiredPermission && !hasPermission(profile, requiredPermission)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error" icon={<LockIcon />}>
          <Typography variant="h6" gutterBottom>
            Permission requise
          </Typography>
          <Typography>
            Vous n'avez pas la permission <strong>{requiredPermission}</strong> nécessaire pour accéder à cette page.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => window.history.back()}>
              Retour
            </Button>
          </Box>
        </Alert>
      </Container>
    );
  }

  // Accès autorisé
  return children;
}

/**
 * Variante pour protéger uniquement les admins
 */
export function AdminRoute({ children, redirectTo = '/auth' }) {
  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Variante pour protéger les admins et instructeurs
 */
export function InstructorRoute({ children, redirectTo = '/auth' }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'instructor']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Variante pour protéger les admins et modérateurs
 */
export function ModeratorRoute({ children, redirectTo = '/auth' }) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'moderator']} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}
