import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';

/**
 * Hook pour tracker automatiquement les changements de page
 */
export const usePageTracking = () => {
  const location = useLocation();
  const prevLocation = useRef();

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = prevLocation.current?.pathname;

    // Log page view
    const pageName = getPageNameFromPath(currentPath);
    analyticsService.logPageView(pageName, document.title);

    // Mettre à jour la référence précédente
    prevLocation.current = location;
  }, [location]);

  return location;
};

/**
 * Hook pour tracker le temps passé sur une page
 */
export const usePageTimeTracking = (pageName, moduleId = null) => {
  const startTime = useRef(Date.now());
  const location = useLocation();

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      if (timeSpent > 5) {
        // Ne tracker que si l'utilisateur est resté au moins 5 secondes
        analyticsService.logTimeOnPage(
          pageName || getPageNameFromPath(location.pathname),
          timeSpent,
          moduleId
        );
      }
    };
  }, [location.pathname, pageName, moduleId]);
};

/**
 * Hook principal pour accéder aux fonctions analytics
 */
export const useAnalytics = () => {
  return {
    // === DASHBOARD ===
    trackDashboardView: (totalModules, completedModules, globalProgress) => {
      analyticsService.logDashboardView(totalModules, completedModules, globalProgress);
    },

    // === MODULES ===
    trackModuleDetailView: (moduleId, moduleTitle, moduleType, difficulty, isAccessible) => {
      analyticsService.logModuleDetailView(moduleId, moduleTitle, moduleType, difficulty, isAccessible);
    },

    trackModuleCardClick: (moduleId, moduleTitle, isCompleted, isLocked) => {
      analyticsService.logModuleCardClick(moduleId, moduleTitle, isCompleted, isLocked);
    },

    trackModuleUnlock: (unlockedModuleId, unlockedModuleTitle, unlockedByModuleId) => {
      analyticsService.logModuleUnlock(unlockedModuleId, unlockedModuleTitle, unlockedByModuleId);
    },

    // === QUIZ ===
    trackQuizStart: (moduleId, moduleTitle, isRetry, previousBestScore = null) => {
      analyticsService.logQuizStart(moduleId, moduleTitle, isRetry, previousBestScore);
    },

    trackQuizGeneration: (moduleId, moduleTitle, generationStatus, generationTime = null, fromCache = false) => {
      analyticsService.logQuizGeneration(moduleId, moduleTitle, generationStatus, generationTime, fromCache);
    },

    trackQuestionAnswer: (moduleId, questionIndex, questionType, difficulty, isCorrect, timeSpent) => {
      analyticsService.logQuestionAnswer(moduleId, questionIndex, questionType, difficulty, isCorrect, timeSpent);
    },

    trackQuestionNavigation: (moduleId, fromQuestionIndex, toQuestionIndex, navigationMethod) => {
      analyticsService.logQuestionNavigation(moduleId, fromQuestionIndex, toQuestionIndex, navigationMethod);
    },

    trackQuizSubmit: (moduleId, moduleTitle, totalQuestions, answeredQuestions, unansweredQuestions) => {
      analyticsService.logQuizSubmit(moduleId, moduleTitle, totalQuestions, answeredQuestions, unansweredQuestions);
    },

    trackQuizAbandon: (moduleId, currentQuestionIndex, totalQuestions, answeredCount) => {
      analyticsService.logQuizAbandon(moduleId, currentQuestionIndex, totalQuestions, answeredCount);
    },

    // === RÉSULTATS ===
    trackResultsView: (
      moduleId,
      moduleTitle,
      score,
      passed,
      correctCount,
      totalQuestions,
      earnedPoints,
      totalPoints,
      timeSpent,
      isNewBestScore
    ) => {
      analyticsService.logResultsView(
        moduleId,
        moduleTitle,
        score,
        passed,
        correctCount,
        totalQuestions,
        earnedPoints,
        totalPoints,
        timeSpent,
        isNewBestScore
      );
    },

    trackModuleCompletion: (moduleId, moduleTitle, score, attemptNumber, totalTimeSpent) => {
      analyticsService.logModuleCompletion(moduleId, moduleTitle, score, attemptNumber, totalTimeSpent);
    },

    trackModuleFailure: (moduleId, moduleTitle, score, requiredScore, attemptNumber) => {
      analyticsService.logModuleFailure(moduleId, moduleTitle, score, requiredScore, attemptNumber);
    },

    // === INTERACTIONS ===
    trackRetryQuiz: (moduleId, previousScore, attemptsCount) => {
      analyticsService.logRetryQuiz(moduleId, previousScore, attemptsCount);
    },

    trackNextModuleClick: (currentModuleId, nextModuleId, currentScore) => {
      analyticsService.logNextModuleClick(currentModuleId, nextModuleId, currentScore);
    },

    trackThemeChange: (newTheme) => {
      analyticsService.logThemeChange(newTheme);
    },

    // === PROGRESSION ===
    trackProgressUpdate: (
      totalModules,
      completedModules,
      globalProgress,
      totalQuizzesTaken,
      averageScore,
      totalTimeSpent
    ) => {
      analyticsService.logProgressUpdate(
        totalModules,
        completedModules,
        globalProgress,
        totalQuizzesTaken,
        averageScore,
        totalTimeSpent
      );
    },

    // === ERREURS ===
    trackQuizGenerationError: (moduleId, errorMessage, errorCode = null) => {
      analyticsService.logQuizGenerationError(moduleId, errorMessage, errorCode);
    },

    trackAppError: (errorType, errorMessage, errorContext = {}) => {
      analyticsService.logAppError(errorType, errorMessage, errorContext);
    },

    // === SESSION ===
    trackSessionStart: (userId = 'anonymous') => {
      analyticsService.logSessionStart(userId);
    },

    trackSessionEnd: (sessionDuration, pagesVisited, quizzesCompleted) => {
      analyticsService.logSessionEnd(sessionDuration, pagesVisited, quizzesCompleted);
    },

    // === ÉVÉNEMENT PERSONNALISÉ ===
    trackCustomEvent: (eventName, parameters = {}) => {
      analyticsService.logCustomEvent(eventName, parameters);
    },
  };
};

/**
 * Fonction utilitaire pour extraire le nom de la page à partir du chemin
 */
const getPageNameFromPath = (pathname) => {
  const pathMap = {
    '/': 'dashboard',
  };

  // Correspondance exacte
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Correspondance pour les pages détail
  if (pathname.startsWith('/module/') && pathname.endsWith('/quiz')) {
    return 'quiz_session';
  }
  if (pathname.startsWith('/module/') && pathname.endsWith('/results')) {
    return 'results';
  }
  if (pathname.startsWith('/module/')) {
    return 'module_detail';
  }

  // Par défaut
  return pathname.replace(/^\//, '').replace(/\//g, '_') || 'unknown';
};

export default useAnalytics;
