/**
 * Modèle de données pour un participant à la formation
 */

/**
 * @typedef {Object} ParticipantProfile
 * @property {string} uid - ID Firebase Auth de l'utilisateur
 * @property {string} id - ID du document Firestore (identique à uid)
 * @property {string} email - Email du participant
 * @property {string} fullName - Nom complet
 * @property {string|null} displayName - Nom d'affichage (par défaut: fullName)
 * @property {string|null} photoURL - URL de la photo de profil
 * @property {string|null} phone - Numéro de téléphone
 * @property {string|null} company - Entreprise
 * @property {string|null} jobTitle - Poste occupé
 * @property {string} level - Niveau: 'beginner' | 'intermediate' | 'advanced'
 * @property {string[]} goals - Objectifs de formation
 * @property {Date} createdAt - Date de création du compte (created_at)
 * @property {Date|null} updatedAt - Dernière mise à jour du profil (updated_at)
 * @property {Date|null} lastConnexion - Dernière connexion (last_connexion)
 * @property {boolean} isActive - Compte actif ou non
 * @property {string} role - Rôle: 'user' | 'admin' | 'instructor' | 'moderator'
 * @property {boolean} isFirstAdmin - Premier administrateur du système
 * @property {boolean} accountIsValid - Compte validé par un administrateur
 * @property {Object} preferences - Préférences utilisateur
 * @property {boolean} preferences.emailNotifications - Recevoir les notifications par email
 * @property {boolean} preferences.darkMode - Mode sombre activé
 * @property {string} preferences.language - Langue: 'fr' | 'en'
 */

/**
 * @typedef {Object} QuizAttempt
 * @property {string} attemptId - ID unique de la tentative
 * @property {number} attemptNumber - Numéro de la tentative
 * @property {Date} date - Date de la tentative
 * @property {number} score - Score obtenu (0-100)
 * @property {number} correctCount - Nombre de réponses correctes
 * @property {number} totalQuestions - Nombre total de questions
 * @property {number} earnedPoints - Points gagnés
 * @property {number} totalPoints - Points possibles
 * @property {number} timeSpent - Temps passé en secondes
 * @property {Object} answers - Réponses détaillées { questionId: { selected, correct, timeSpent } }
 */

/**
 * @typedef {Object} ModuleProgress
 * @property {string} moduleId - ID du module
 * @property {string} status - Statut: 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'perfect'
 * @property {QuizAttempt[]} attempts - Liste des tentatives
 * @property {number} bestScore - Meilleur score obtenu
 * @property {Date|null} lastAttemptDate - Date de la dernière tentative
 * @property {Date|null} completedAt - Date de complétion (score >= 70)
 * @property {Date|null} firstAttemptDate - Date de la première tentative
 * @property {number} totalTimeSpent - Temps total passé sur ce module
 */

/**
 * @typedef {Object} GlobalStats
 * @property {number} totalModulesCompleted - Nombre de modules complétés
 * @property {number} totalQuizzesTaken - Nombre total de quiz passés
 * @property {number} averageScore - Score moyen global
 * @property {number} totalTimeSpent - Temps total passé en secondes
 * @property {number} currentStreak - Série actuelle de jours consécutifs
 * @property {number} longestStreak - Meilleure série de jours consécutifs
 * @property {string[]} badges - Liste des badges obtenus
 * @property {Date|null} lastActivityDate - Dernière activité
 * @property {number} perfectScoresCount - Nombre de scores parfaits (100%)
 */

/**
 * @typedef {Object} CourseStats
 * @property {number} totalModulesCompleted - Modules complétés dans cette formation
 * @property {number} totalQuizzesTaken - Quiz passés dans cette formation
 * @property {number} averageScore - Score moyen dans cette formation
 * @property {number} totalTimeSpent - Temps total passé dans cette formation
 * @property {number} progress - Pourcentage de progression (0-100)
 */

/**
 * @typedef {Object} CourseProgress
 * @property {string} courseId - ID de la formation
 * @property {Date} enrolledAt - Date d'inscription à la formation
 * @property {Date|null} completedAt - Date de complétion de la formation
 * @property {Date} lastActivityAt - Dernière activité dans cette formation
 * @property {Object.<string, ModuleProgress>} modules - Progression par module
 * @property {CourseStats} stats - Statistiques de la formation
 */

/**
 * @typedef {Object} ParticipantProgress
 * @property {string} userId - ID de l'utilisateur
 * @property {Date} lastSync - Dernière synchronisation avec Firebase
 * @property {Object.<string, CourseProgress>} courses - Progression par formation
 * @property {GlobalStats} globalStats - Statistiques globales
 */

/**
 * Crée un nouveau profil participant avec valeurs par défaut
 * @param {string} uid - Firebase Auth UID
 * @param {string} email - Email
 * @param {string} fullName - Nom complet
 * @param {Object} options - Options additionnelles
 * @param {boolean} options.isFirstAdmin - Si c'est le premier admin du système
 * @returns {ParticipantProfile}
 */
export function createParticipantProfile(uid, email, fullName, options = {}) {
  const isFirstAdmin = options.isFirstAdmin || false;

  return {
    uid,
    id: uid, // ID du document Firestore identique à uid
    email,
    fullName,
    displayName: fullName, // Par défaut, displayName = fullName
    photoURL: null,
    phone: null,
    company: null,
    jobTitle: null,
    level: 'beginner',
    goals: [],
    createdAt: new Date(),
    updatedAt: null, // null jusqu'à la première modification
    lastConnexion: new Date(),
    isActive: true,

    // Champs d'administration
    role: isFirstAdmin ? 'admin' : 'user', // 'user' | 'admin' | 'instructor' | 'moderator'
    isFirstAdmin: isFirstAdmin,
    accountIsValid: isFirstAdmin ? true : false, // Les admins sont auto-validés

    preferences: {
      emailNotifications: true,
      darkMode: false,
      language: 'fr'
    }
  };
}

/**
 * Crée une nouvelle progression de formation
 * @param {string} courseId - ID de la formation
 * @returns {CourseProgress}
 */
export function createCourseProgress(courseId) {
  return {
    courseId,
    enrolledAt: new Date(),
    completedAt: null,
    lastActivityAt: new Date(),
    modules: {},
    stats: {
      totalModulesCompleted: 0,
      totalQuizzesTaken: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      progress: 0
    }
  };
}

/**
 * Crée une nouvelle progression vide
 * @param {string} userId - ID de l'utilisateur
 * @returns {ParticipantProgress}
 */
export function createEmptyProgress(userId) {
  return {
    userId,
    lastSync: new Date(),
    courses: {},
    globalStats: {
      totalModulesCompleted: 0,
      totalQuizzesTaken: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
      lastActivityDate: null,
      perfectScoresCount: 0,
      totalCoursesEnrolled: 0,
      totalCoursesCompleted: 0
    }
  };
}

/**
 * Crée un nouveau module progress vide
 * @param {string} moduleId - ID du module
 * @returns {ModuleProgress}
 */
export function createModuleProgress(moduleId) {
  return {
    moduleId,
    status: 'unlocked',
    attempts: [],
    bestScore: 0,
    lastAttemptDate: null,
    completedAt: null,
    firstAttemptDate: null,
    totalTimeSpent: 0
  };
}

/**
 * Valide un profil participant
 * @param {ParticipantProfile} profile
 * @returns {{isValid: boolean, errors: string[]}}
 */
export function validateParticipantProfile(profile) {
  const errors = [];

  if (!profile.uid || typeof profile.uid !== 'string') {
    errors.push('UID is required');
  }

  if (!profile.email || !profile.email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!profile.fullName || profile.fullName.trim().length < 2) {
    errors.push('Full name must be at least 2 characters');
  }

  if (profile.phone && !/^\+?[\d\s-()]+$/.test(profile.phone)) {
    errors.push('Invalid phone number format');
  }

  if (!['beginner', 'intermediate', 'advanced'].includes(profile.level)) {
    errors.push('Invalid level');
  }

  if (!['user', 'admin', 'instructor', 'moderator'].includes(profile.role)) {
    errors.push('Invalid role');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Constantes pour les rôles utilisateur
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  MODERATOR: 'moderator'
};

/**
 * Permissions par rôle
 */
export const ROLE_PERMISSIONS = {
  user: {
    canTakeQuizzes: true,
    canViewOwnProgress: true,
    canEditOwnProfile: true,
    canManageUsers: false,
    canManageCourses: false,
    canManageModules: false,
    canViewAnalytics: false,
    canValidateAccounts: false
  },
  instructor: {
    canTakeQuizzes: true,
    canViewOwnProgress: true,
    canEditOwnProfile: true,
    canManageUsers: false,
    canManageCourses: true,
    canManageModules: true,
    canViewAnalytics: true,
    canValidateAccounts: false
  },
  moderator: {
    canTakeQuizzes: true,
    canViewOwnProgress: true,
    canEditOwnProfile: true,
    canManageUsers: true,
    canManageCourses: false,
    canManageModules: false,
    canViewAnalytics: true,
    canValidateAccounts: true
  },
  admin: {
    canTakeQuizzes: true,
    canViewOwnProgress: true,
    canEditOwnProfile: true,
    canManageUsers: true,
    canManageCourses: true,
    canManageModules: true,
    canViewAnalytics: true,
    canValidateAccounts: true
  }
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {ParticipantProfile} profile - Profil utilisateur
 * @param {string} permission - Nom de la permission
 * @returns {boolean}
 */
export function hasPermission(profile, permission) {
  if (!profile || !profile.role) return false;
  const rolePermissions = ROLE_PERMISSIONS[profile.role];
  return rolePermissions?.[permission] || false;
}

/**
 * Vérifie si un utilisateur est administrateur
 * @param {ParticipantProfile} profile - Profil utilisateur
 * @returns {boolean}
 */
export function isAdmin(profile) {
  return profile?.role === USER_ROLES.ADMIN;
}

/**
 * Vérifie si un utilisateur est instructeur
 * @param {ParticipantProfile} profile - Profil utilisateur
 * @returns {boolean}
 */
export function isInstructor(profile) {
  return profile?.role === USER_ROLES.INSTRUCTOR;
}

/**
 * Vérifie si un utilisateur est modérateur
 * @param {ParticipantProfile} profile - Profil utilisateur
 * @returns {boolean}
 */
export function isModerator(profile) {
  return profile?.role === USER_ROLES.MODERATOR;
}

/**
 * Vérifie si le compte utilisateur est validé
 * @param {ParticipantProfile} profile - Profil utilisateur
 * @returns {boolean}
 */
export function isAccountValid(profile) {
  return profile?.accountIsValid === true;
}

/**
 * Vérifie si l'utilisateur peut accéder à la plateforme
 * @param {ParticipantProfile} profile - Profil utilisateur
 * @returns {{canAccess: boolean, reason: string|null}}
 */
export function canAccessPlatform(profile) {
  if (!profile) {
    return { canAccess: false, reason: 'Profil non trouvé' };
  }

  if (!profile.isActive) {
    return { canAccess: false, reason: 'Compte non approuvé' };
  }

  if (!profile.accountIsValid && profile.role !== USER_ROLES.ADMIN) {
    return { canAccess: false, reason: 'Compte en attente de validation par un administrateur' };
  }

  return { canAccess: true, reason: null };
}
