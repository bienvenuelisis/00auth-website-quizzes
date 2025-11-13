/**
 * Service d'administration - Gestion des utilisateurs et progressions
 */

import { getDocs, query, where, orderBy, collection } from 'firebase/firestore';
import { usersCollection } from './constants';
import { getDocument } from './helpers';
import { db } from '../../../config/firebase';

// Collection references
const PROGRESS_COLLECTION = 'progress';

/**
 * Récupère tous les utilisateurs avec leurs détails de connexion
 * @returns {Promise<Array>} - Liste des utilisateurs avec statistiques
 */
export async function getAllUsersWithDetails() {
  try {
    const usersRef = collection(db, usersCollection);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      if (data.createdAt) data.createdAt = data.createdAt.toDate();
      if (data.updatedAt) data.updatedAt = data.updatedAt.toDate();
      if (data.lastConnexion) data.lastConnexion = data.lastConnexion.toDate();

      return {
        id: doc.id,
        ...data
      };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
}

/**
 * Récupère la progression d'un utilisateur spécifique
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Progression de l'utilisateur
 */
export async function getUserProgress(userId) {
  try {
    const progress = await getDocument(PROGRESS_COLLECTION, userId);

    // Convertir les Timestamps
    if (progress.lastSync) progress.lastSync = progress.lastSync.toDate();
    if (progress.globalStats?.lastActivityDate) {
      progress.globalStats.lastActivityDate = progress.globalStats.lastActivityDate.toDate();
    }

    // Convertir les dates dans les courses
    if (progress.courses) {
      Object.keys(progress.courses).forEach(courseId => {
        const course = progress.courses[courseId];
        if (course.enrolledAt) course.enrolledAt = course.enrolledAt.toDate();
        if (course.completedAt) course.completedAt = course.completedAt.toDate();
        if (course.lastActivityAt) course.lastActivityAt = course.lastActivityAt.toDate();

        // Convertir les dates des modules
        if (course.modules) {
          Object.keys(course.modules).forEach(moduleId => {
            const module = course.modules[moduleId];
            if (module.lastAttemptDate) module.lastAttemptDate = module.lastAttemptDate.toDate();
            if (module.completedAt) module.completedAt = module.completedAt.toDate();
            if (module.firstAttemptDate) module.firstAttemptDate = module.firstAttemptDate.toDate();

            // Convertir les dates des tentatives
            if (module.attempts) {
              module.attempts = module.attempts.map(attempt => ({
                ...attempt,
                date: attempt.date ? new Date(attempt.date) : null
              }));
            }
          });
        }
      });
    }

    return progress;
  } catch (error) {
    if (error.message.includes('not exist')) {
      return null; // Pas de progression pour cet utilisateur
    }
    console.error('Erreur lors de la récupération de la progression:', error);
    throw error;
  }
}

/**
 * Récupère tous les utilisateurs avec leurs progressions
 * @returns {Promise<Array>} - Liste des utilisateurs avec leurs progressions
 */
export async function getAllUsersWithProgress() {
  try {
    const users = await getAllUsersWithDetails();

    const usersWithProgress = await Promise.all(
      users.map(async (user) => {
        const progress = await getUserProgress(user.uid);
        return {
          ...user,
          progress
        };
      })
    );

    return usersWithProgress;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs avec progression:', error);
    throw error;
  }
}

/**
 * Récupère les statistiques globales de la plateforme
 * @returns {Promise<Object>} - Statistiques de la plateforme
 */
export async function getPlatformStats() {
  try {
    const progressRef = collection(db, PROGRESS_COLLECTION);
    const [users, progressSnapshot] = await Promise.all([
      getAllUsersWithDetails(),
      getDocs(progressRef)
    ]);

    const progressData = progressSnapshot.docs.map(doc => doc.data());

    // Calculer les statistiques
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      validatedUsers: users.filter(u => u.accountIsValid).length,
      pendingUsers: users.filter(u => !u.accountIsValid && u.role !== 'admin').length,

      // Statistiques par rôle
      roleDistribution: {
        admin: users.filter(u => u.role === 'admin').length,
        instructor: users.filter(u => u.role === 'instructor').length,
        moderator: users.filter(u => u.role === 'moderator').length,
        user: users.filter(u => u.role === 'user').length
      },

      // Statistiques de progression
      usersWithProgress: progressData.length,
      totalQuizzesTaken: progressData.reduce((sum, p) => sum + (p.globalStats?.totalQuizzesTaken || 0), 0),
      totalModulesCompleted: progressData.reduce((sum, p) => sum + (p.globalStats?.totalModulesCompleted || 0), 0),
      averageScore: progressData.length > 0
        ? Math.round(progressData.reduce((sum, p) => sum + (p.globalStats?.averageScore || 0), 0) / progressData.length)
        : 0,

      // Activité récente
      recentConnections: users
        .filter(u => u.lastConnexion)
        .sort((a, b) => b.lastConnexion - a.lastConnexion)
        .slice(0, 10)
        .map(u => ({
          userId: u.uid,
          fullName: u.fullName,
          email: u.email,
          lastConnexion: u.lastConnexion
        }))
    };

    return stats;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
}

/**
 * Récupère les progressions pour une formation spécifique
 * @param {string} courseId - ID de la formation
 * @returns {Promise<Array>} - Liste des utilisateurs avec progression dans cette formation
 */
export async function getCourseProgressions(courseId) {
  try {
    const usersWithProgress = await getAllUsersWithProgress();

    return usersWithProgress
      .map(user => ({
        userId: user.uid,
        fullName: user.fullName,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        courseProgress: user.progress?.courses?.[courseId] || null,
        globalStats: user.progress?.globalStats || null
      }))
      .filter(user => user.courseProgress !== null); // Uniquement ceux inscrits à la formation
  } catch (error) {
    console.error('Erreur lors de la récupération des progressions de formation:', error);
    throw error;
  }
}

/**
 * Récupère les progressions pour un module spécifique
 * @param {string} courseId - ID de la formation
 * @param {string} moduleId - ID du module
 * @returns {Promise<Array>} - Liste des utilisateurs avec progression dans ce module
 */
export async function getModuleProgressions(courseId, moduleId) {
  try {
    const courseProgressions = await getCourseProgressions(courseId);

    return courseProgressions
      .map(user => ({
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        photoURL: user.photoURL,
        moduleProgress: user.courseProgress?.modules?.[moduleId] || null
      }))
      .filter(user => user.moduleProgress !== null); // Uniquement ceux qui ont commencé le module
  } catch (error) {
    console.error('Erreur lors de la récupération des progressions de module:', error);
    throw error;
  }
}

/**
 * Recherche des utilisateurs par nom ou email
 * @param {string} searchTerm - Terme de recherche
 * @returns {Promise<Array>} - Liste des utilisateurs correspondants
 */
export async function searchUsers(searchTerm) {
  try {
    const allUsers = await getAllUsersWithDetails();
    const term = searchTerm.toLowerCase();

    return allUsers.filter(user =>
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.displayName?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    throw error;
  }
}
