/**
 * Service de gestion de la progression des quiz dans Firestore
 */

import { Timestamp } from 'firebase/firestore';
import { addDocument, getDocument, updateDocument } from './helpers';
import { createEmptyProgress, createModuleProgress } from '../../../models/participant';

// Collection pour stocker la progression
const PROGRESS_COLLECTION = 'progress';

/**
 * Initialise la progression pour un nouvel utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<string>} - ID du document créé
 */
export async function initializeProgress(userId) {
  const progress = createEmptyProgress(userId);

  const firestoreProgress = {
    ...progress,
    lastSync: Timestamp.now(),
    globalStats: {
      ...progress.globalStats,
      lastActivityDate: null
    }
  };

  return await addDocument(PROGRESS_COLLECTION, firestoreProgress, userId);
}

/**
 * Récupère la progression d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Progression de l'utilisateur
 */
export async function getProgress(userId) {
  const progress = await getDocument(PROGRESS_COLLECTION, userId);

  // Convertir les Timestamps en Date
  if (progress.lastSync) {
    progress.lastSync = progress.lastSync.toDate();
  }

  if (progress.globalStats?.lastActivityDate) {
    progress.globalStats.lastActivityDate = progress.globalStats.lastActivityDate.toDate();
  }

  // Convertir les dates dans les formations
  if (progress.courses) {
    Object.keys(progress.courses).forEach((courseId) => {
      const course = progress.courses[courseId];

      if (course.enrolledAt) {
        course.enrolledAt = course.enrolledAt.toDate();
      }
      if (course.completedAt) {
        course.completedAt = course.completedAt.toDate();
      }
      if (course.lastActivityAt) {
        course.lastActivityAt = course.lastActivityAt.toDate();
      }

      // Convertir les dates dans les modules
      if (course.modules) {
        Object.keys(course.modules).forEach((moduleId) => {
          const module = course.modules[moduleId];

          if (module.lastAttemptDate) {
            module.lastAttemptDate = module.lastAttemptDate.toDate();
          }
          if (module.completedAt) {
            module.completedAt = module.completedAt.toDate();
          }
          if (module.firstAttemptDate) {
            module.firstAttemptDate = module.firstAttemptDate.toDate();
          }

          // Convertir les dates dans les tentatives
          if (module.attempts) {
            module.attempts.forEach((attempt) => {
              if (attempt.date) {
                attempt.date = new Date(attempt.date);
              }
            });
          }
        });
      }
    });
  }

  return progress;
}

/**
 * Sauvegarde une tentative de quiz
 * @param {string} userId - ID de l'utilisateur
 * @param {string} courseId - ID de la formation
 * @param {string} moduleId - ID du module
 * @param {Object} results - Résultats du quiz
 * @param {number} results.score - Score (0-100)
 * @param {number} results.correctCount - Nombre de réponses correctes
 * @param {number} results.totalQuestions - Nombre total de questions
 * @param {number} results.earnedPoints - Points gagnés
 * @param {number} results.totalPoints - Points possibles
 * @param {number} results.timeSpent - Temps passé en secondes
 * @param {Object} answers - Réponses détaillées
 * @returns {Promise<void>}
 */
export async function saveQuizAttempt(userId, courseId, moduleId, results, answers) {
  console.log('🔵 [Firebase progress.js] saveQuizAttempt appelé:', {
    userId,
    courseId,
    moduleId,
    results,
    answersCount: answers ? Object.keys(answers).length : 0
  });

  // Récupérer la progression actuelle
  const progress = await getProgress(userId);
  console.log('🔵 [Firebase progress.js] Progression récupérée:', progress);

  // S'assurer que l'utilisateur est inscrit à la formation
  if (!progress.courses[courseId]) {
    const { createCourseProgress } = await import('../../../models/participant');
    progress.courses[courseId] = createCourseProgress(courseId);
  }

  const courseProgress = progress.courses[courseId];

  // Initialiser le module s'il n'existe pas
  if (!courseProgress.modules[moduleId]) {
    courseProgress.modules[moduleId] = createModuleProgress(moduleId);
  }

  const moduleProgress = courseProgress.modules[moduleId];

  // Créer la nouvelle tentative
  const newAttempt = {
    attemptId: `${moduleId}-${Date.now()}`,
    attemptNumber: moduleProgress.attempts.length + 1,
    date: new Date().toISOString(),
    ...results,
    answers
  };

  // Mettre à jour le module
  moduleProgress.attempts.push(newAttempt);
  moduleProgress.bestScore = Math.max(moduleProgress.bestScore, results.score);
  moduleProgress.lastAttemptDate = new Date();
  moduleProgress.totalTimeSpent += results.timeSpent;

  if (!moduleProgress.firstAttemptDate) {
    moduleProgress.firstAttemptDate = new Date();
  }

  // Mettre à jour le statut
  if (results.score >= 70) {
    if (moduleProgress.status !== 'completed' && moduleProgress.status !== 'perfect') {
      moduleProgress.completedAt = new Date();
    }
    moduleProgress.status = results.score === 100 ? 'perfect' : 'completed';
  } else if (moduleProgress.status === 'unlocked') {
    moduleProgress.status = 'in_progress';
  }

  // Mettre à jour les statistiques de la formation
  const courseModules = Object.values(courseProgress.modules);
  const courseScores = courseModules.flatMap((m) => m.attempts.map((a) => a.score));
  const courseCompletedModules = courseModules.filter(
    (m) => m.status === 'completed' || m.status === 'perfect'
  ).length;

  courseProgress.stats = {
    totalModulesCompleted: courseCompletedModules,
    totalQuizzesTaken: courseScores.length,
    averageScore: courseScores.length > 0
      ? Math.round(courseScores.reduce((sum, s) => sum + s, 0) / courseScores.length)
      : 0,
    totalTimeSpent: courseModules.reduce((sum, m) => sum + m.totalTimeSpent, 0),
    progress: 0 // Sera calculé par le frontend
  };

  courseProgress.lastActivityAt = new Date();

  // Mettre à jour les statistiques globales
  const allCourses = Object.values(progress.courses);
  const allScores = allCourses.flatMap((c) =>
    Object.values(c.modules).flatMap((m) => m.attempts.map((a) => a.score))
  );

  const completedModules = allCourses.reduce(
    (sum, c) => sum + Object.values(c.modules).filter(
      (m) => m.status === 'completed' || m.status === 'perfect'
    ).length,
    0
  );

  const perfectScores = allCourses.reduce(
    (count, c) => count + Object.values(c.modules).reduce(
      (mCount, m) => mCount + m.attempts.filter((a) => a.score === 100).length,
      0
    ),
    0
  );

  progress.globalStats = {
    totalModulesCompleted: completedModules,
    totalQuizzesTaken: allScores.length,
    averageScore: allScores.length > 0
      ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
      : 0,
    totalTimeSpent: allCourses.reduce((sum, c) => sum + c.stats.totalTimeSpent, 0),
    currentStreak: calculateCurrentStreak(progress),
    longestStreak: Math.max(
      progress.globalStats.longestStreak,
      calculateCurrentStreak(progress)
    ),
    badges: calculateBadges(progress),
    lastActivityDate: new Date(),
    perfectScoresCount: perfectScores,
    totalCoursesEnrolled: Object.keys(progress.courses).length,
    totalCoursesCompleted: allCourses.filter(c => c.completedAt).length
  };

  // Préparer les données pour Firestore
  const firestoreData = prepareProgressForFirestore(progress);
  console.log('🟢 [Firebase progress.js] Données préparées pour Firestore:', firestoreData);

  // Sauvegarder dans Firestore
  await updateDocument(PROGRESS_COLLECTION, userId, firestoreData);
  console.log('✅ [Firebase progress.js] Progression sauvegardée dans Firestore');
}

/**
 * Met à jour le statut d'un module
 * @param {string} userId - ID de l'utilisateur
 * @param {string} courseId - ID de la formation
 * @param {string} moduleId - ID du module
 * @param {string} status - Nouveau statut
 * @returns {Promise<void>}
 */
export async function updateModuleStatus(userId, courseId, moduleId, status) {
  const progress = await getProgress(userId);

  // S'assurer que la formation existe
  if (!progress.courses[courseId]) {
    const { createCourseProgress } = await import('../../../models/participant');
    progress.courses[courseId] = createCourseProgress(courseId);
  }

  const courseProgress = progress.courses[courseId];

  if (!courseProgress.modules[moduleId]) {
    courseProgress.modules[moduleId] = createModuleProgress(moduleId);
  }

  courseProgress.modules[moduleId].status = status;
  courseProgress.lastActivityAt = new Date();
  progress.lastSync = new Date();

  const firestoreData = prepareProgressForFirestore(progress);
  await updateDocument(PROGRESS_COLLECTION, userId, firestoreData);
}

/**
 * Synchronise la progression locale avec Firestore
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} localProgress - Progression locale
 * @returns {Promise<Object>} - Progression synchronisée
 */
export async function syncProgress(userId, localProgress) {
  try {
    // Récupérer la progression Firestore
    const firestoreProgress = await getProgress(userId);

    // Fusionner les progressions (Firestore prioritaire)
    const mergedProgress = mergeProgress(localProgress, firestoreProgress);

    // Sauvegarder la version fusionnée
    const firestoreData = prepareProgressForFirestore(mergedProgress);
    await updateDocument(PROGRESS_COLLECTION, userId, firestoreData);

    return mergedProgress;
  } catch (error) {
    // Si pas de progression Firestore, créer à partir de la locale
    if (error.message.includes('not exist')) {
      const firestoreData = prepareProgressForFirestore(localProgress);
      await addDocument(PROGRESS_COLLECTION, firestoreData, userId);
      return localProgress;
    }
    throw error;
  }
}

/**
 * Prépare les données pour Firestore (conversion des dates)
 * @param {Object} progress - Progression à préparer
 * @returns {Object} - Données prêtes pour Firestore
 */
function prepareProgressForFirestore(progress) {
  const data = {
    ...progress,
    lastSync: Timestamp.now()
  };

  if (data.globalStats?.lastActivityDate) {
    data.globalStats.lastActivityDate = Timestamp.fromDate(
      new Date(data.globalStats.lastActivityDate)
    );
  }

  // Convertir les dates des formations
  if (data.courses) {
    Object.keys(data.courses).forEach((courseId) => {
      const course = data.courses[courseId];

      if (course.enrolledAt) {
        course.enrolledAt = Timestamp.fromDate(new Date(course.enrolledAt));
      }
      if (course.completedAt) {
        course.completedAt = Timestamp.fromDate(new Date(course.completedAt));
      }
      if (course.lastActivityAt) {
        course.lastActivityAt = Timestamp.fromDate(new Date(course.lastActivityAt));
      }

      // Convertir les dates des modules
      if (course.modules) {
        Object.keys(course.modules).forEach((moduleId) => {
          const module = course.modules[moduleId];

          if (module.lastAttemptDate) {
            module.lastAttemptDate = Timestamp.fromDate(new Date(module.lastAttemptDate));
          }
          if (module.completedAt) {
            module.completedAt = Timestamp.fromDate(new Date(module.completedAt));
          }
          if (module.firstAttemptDate) {
            module.firstAttemptDate = Timestamp.fromDate(new Date(module.firstAttemptDate));
          }
        });
      }
    });
  }

  return data;
}

/**
 * Fusionne deux progressions (priorité à la version Firestore)
 * @param {Object} localProgress - Progression locale
 * @param {Object} firestoreProgress - Progression Firestore
 * @returns {Object} - Progression fusionnée
 */
function mergeProgress(localProgress, firestoreProgress) {
  const merged = { ...firestoreProgress };

  // Fusionner les formations
  Object.keys(localProgress.courses || {}).forEach((courseId) => {
    const localCourse = localProgress.courses[courseId];
    const firestoreCourse = merged.courses[courseId];

    if (!firestoreCourse) {
      // Formation existe seulement en local
      merged.courses[courseId] = localCourse;
    } else {
      // Fusionner les modules de cette formation
      Object.keys(localCourse.modules || {}).forEach((moduleId) => {
        const localModule = localCourse.modules[moduleId];
        const firestoreModule = firestoreCourse.modules[moduleId];

        if (!firestoreModule) {
          // Module existe seulement en local
          firestoreCourse.modules[moduleId] = localModule;
        } else {
          // Garder le meilleur score
          firestoreModule.bestScore = Math.max(
            localModule.bestScore,
            firestoreModule.bestScore
          );

          // Fusionner les tentatives (éviter doublons)
          const existingAttemptIds = new Set(
            firestoreModule.attempts.map((a) => a.attemptId)
          );

          localModule.attempts.forEach((attempt) => {
            if (!existingAttemptIds.has(attempt.attemptId)) {
              firestoreModule.attempts.push(attempt);
            }
          });
        }
      });
    }
  });

  return merged;
}

/**
 * Calcule la série actuelle de jours consécutifs
 * @param {Object} progress - Progression
 * @returns {number} - Nombre de jours consécutifs
 */
function calculateCurrentStreak(progress) {
  const allDates = Object.values(progress.courses)
    .flatMap((c) => Object.values(c.modules)
      .flatMap((m) => m.attempts.map((a) => new Date(a.date)))
    )
    .sort((a, b) => b - a);

  if (allDates.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date(allDates[0]);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < allDates.length; i++) {
    const checkDate = new Date(allDates[i]);
    checkDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - checkDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = checkDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

/**
 * Calcule les badges obtenus
 * @param {Object} progress - Progression
 * @returns {string[]} - Liste des badges
 */
function calculateBadges(progress) {
  const badges = [];
  const stats = progress.globalStats;

  // Badge première tentative
  if (stats.totalQuizzesTaken >= 1) badges.push('first_quiz');

  // Badge 10 quiz
  if (stats.totalQuizzesTaken >= 10) badges.push('quiz_master_10');

  // Badge 50 quiz
  if (stats.totalQuizzesTaken >= 50) badges.push('quiz_master_50');

  // Badge premier module complété
  if (stats.totalModulesCompleted >= 1) badges.push('first_module');

  // Badge 5 modules complétés
  if (stats.totalModulesCompleted >= 5) badges.push('module_master_5');

  // Badge score parfait
  if (stats.perfectScoresCount >= 1) badges.push('perfectionist');

  // Badge série de 7 jours
  if (stats.currentStreak >= 7) badges.push('week_streak');

  // Badge série de 30 jours
  if (stats.longestStreak >= 30) badges.push('month_streak');

  // Badge score moyen >= 80
  if (stats.averageScore >= 80) badges.push('high_achiever');

  // Badge score moyen >= 90
  if (stats.averageScore >= 90) badges.push('excellence');

  return badges;
}

/**
 * Inscrit explicitement un utilisateur à une formation
 * @param {string} userId - ID de l'utilisateur
 * @param {string} courseId - ID de la formation
 * @returns {Promise<void>}
 */
export async function enrollInCourse(userId, courseId) {
  // Récupérer ou créer la progression de l'utilisateur
  let progress;
  try {
    progress = await getProgress(userId);
  } catch (error) {
    if (error.message.includes('not exist')) {
      // Créer une nouvelle progression
      await initializeProgress(userId);
      progress = await getProgress(userId);
    } else {
      throw error;
    }
  }

  // Vérifier si déjà inscrit
  if (progress.courses[courseId]) {
    return; // Déjà inscrit
  }

  // Créer la progression du cours
  const { createCourseProgress } = await import('../../../models/participant');
  progress.courses[courseId] = createCourseProgress(courseId);

  // Mettre à jour les stats globales
  progress.globalStats.totalCoursesEnrolled = Object.keys(progress.courses).length;

  // Sauvegarder dans Firestore
  const firestoreData = prepareProgressForFirestore(progress);
  await updateDocument(PROGRESS_COLLECTION, userId, firestoreData);
}

/**
 * Vérifie si un utilisateur est inscrit à une formation
 * @param {string} userId - ID de l'utilisateur
 * @param {string} courseId - ID de la formation
 * @returns {Promise<boolean>}
 */
export async function isEnrolledInCourse(userId, courseId) {
  try {
    const progress = await getProgress(userId);
    return !!progress.courses[courseId];
  } catch (error) {
    if (error.message.includes('not exist')) {
      return false;
    }
    throw error;
  }
}

/**
 * Vérifie si la progression existe
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<boolean>}
 */
export async function progressExists(userId) {
  try {
    await getProgress(userId);
    return true;
  } catch (error) {
    if (error.message.includes('not exist')) {
      return false;
    }
    throw error;
  }
}
