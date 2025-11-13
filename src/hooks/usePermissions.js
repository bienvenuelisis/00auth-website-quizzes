/**
 * Hook personnalisé pour gérer les permissions utilisateur
 */

import { useAuth } from '../contexts/AuthContext';
import {
  hasPermission,
  isAdmin,
  isInstructor,
  isModerator,
  isAccountValid,
  canAccessPlatform,
  USER_ROLES
} from '../models/participant';

/**
 * Hook pour vérifier les permissions de l'utilisateur connecté
 * @returns {Object} - Fonctions et états de permission
 */
export function usePermissions() {
  const { profile, isAuthenticated } = useAuth();

  return {
    // Profil et authentification
    profile,
    isAuthenticated,

    // Vérification de rôle
    isAdmin: isAdmin(profile),
    isInstructor: isInstructor(profile),
    isModerator: isModerator(profile),
    isUser: profile?.role === USER_ROLES.USER,

    // Vérification de compte
    isAccountValid: isAccountValid(profile),
    canAccess: canAccessPlatform(profile),

    // Permissions spécifiques
    canTakeQuizzes: hasPermission(profile, 'canTakeQuizzes'),
    canViewOwnProgress: hasPermission(profile, 'canViewOwnProgress'),
    canEditOwnProfile: hasPermission(profile, 'canEditOwnProfile'),
    canManageUsers: hasPermission(profile, 'canManageUsers'),
    canManageCourses: hasPermission(profile, 'canManageCourses'),
    canManageModules: hasPermission(profile, 'canManageModules'),
    canViewAnalytics: hasPermission(profile, 'canViewAnalytics'),
    canValidateAccounts: hasPermission(profile, 'canValidateAccounts'),

    // Fonction générique de vérification
    hasPermission: (permission) => hasPermission(profile, permission),

    // Rôle actuel
    currentRole: profile?.role || null
  };
}

/**
 * Hook pour vérifier une permission spécifique
 * @param {string} permission - Nom de la permission à vérifier
 * @returns {boolean}
 */
export function useHasPermission(permission) {
  const { profile } = useAuth();
  return hasPermission(profile, permission);
}

/**
 * Hook pour vérifier si l'utilisateur est admin
 * @returns {boolean}
 */
export function useIsAdmin() {
  const { profile } = useAuth();
  return isAdmin(profile);
}

/**
 * Hook pour vérifier si le compte est validé
 * @returns {boolean}
 */
export function useIsAccountValid() {
  const { profile } = useAuth();
  return isAccountValid(profile);
}
