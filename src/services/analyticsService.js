import { logEvent } from 'firebase/analytics';
import { analytics, isAnalyticsReady } from '../config/firebase';

/**
 * Service d'analytics pour collecter les événements d'utilisation du quiz
 * Permet de tracker les parcours utilisateurs, les performances et l'engagement
 */
class QuizAnalyticsService {
  constructor() {
    this.isEnabled = !!analytics;
    this.eventQueue = [];
    this.checkInterval = null;
    this.startCheckingAnalytics();
  }

  // Vérifier périodiquement si analytics est prêt et vider la queue
  startCheckingAnalytics() {
    this.checkInterval = setInterval(() => {
      if (isAnalyticsReady() && this.eventQueue.length > 0) {
        console.log(`Processing ${this.eventQueue.length} queued analytics events`);
        while (this.eventQueue.length > 0) {
          const { eventName, parameters } = this.eventQueue.shift();
          this.sendEvent(eventName, parameters);
        }
        clearInterval(this.checkInterval);
      }
    }, 100);

    // Arrêter après 10 secondes maximum
    setTimeout(() => {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        if (this.eventQueue.length > 0) {
          console.warn('Analytics not ready after 10s, discarding queued events');
          this.eventQueue = [];
        }
      }
    }, 10000);
  }

  // Méthode interne pour envoyer réellement l'événement
  sendEvent(eventName, parameters) {
    try {
      logEvent(analytics, eventName, parameters);
      console.log('Analytics event sent:', eventName, parameters);
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }

  // Méthode générique pour envoyer des événements
  logEvent(eventName, parameters = {}) {
    if (!analytics) {
      console.log('Analytics event (dev/disabled):', eventName, parameters);
      return;
    }

    // Si analytics n'est pas encore prêt, mettre en queue
    if (!isAnalyticsReady()) {
      console.log('Analytics not ready, queuing event:', eventName);
      this.eventQueue.push({ eventName, parameters });
      return;
    }

    this.sendEvent(eventName, parameters);
  }

  // === ÉVÉNEMENTS DE NAVIGATION ===

  // Vue de page générique
  logPageView(pageName, pageTitle = '', additionalParams = {}) {
    this.logEvent('page_view', {
      page_title: pageTitle || pageName,
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_name: pageName,
      ...additionalParams
    });
  }

  // Vue du tableau de bord principal
  logDashboardView(totalModules, completedModules, globalProgress) {
    this.logEvent('dashboard_view', {
      total_modules: totalModules,
      completed_modules: completedModules,
      global_progress: globalProgress,
      page_location: window.location.href
    });
  }

  // === ÉVÉNEMENTS DE MODULE ===

  // Vue de la page de détail d'un module
  logModuleDetailView(moduleId, moduleTitle, moduleType, difficulty, isAccessible) {
    this.logEvent('module_detail_view', {
      module_id: moduleId,
      module_title: moduleTitle,
      module_type: moduleType, // 'required' ou 'bonus'
      difficulty: difficulty, // 'easy', 'medium', 'hard'
      is_accessible: isAccessible,
      page_location: window.location.href
    });
  }

  // Clic sur une carte de module depuis le dashboard
  logModuleCardClick(moduleId, moduleTitle, isCompleted, isLocked) {
    this.logEvent('module_card_click', {
      module_id: moduleId,
      module_title: moduleTitle,
      is_completed: isCompleted,
      is_locked: isLocked,
      page_location: window.location.href
    });
  }

  // === ÉVÉNEMENTS DE QUIZ ===

  // Démarrage d'un quiz
  logQuizStart(moduleId, moduleTitle, isRetry, previousBestScore = null) {
    this.logEvent('quiz_start', {
      module_id: moduleId,
      module_title: moduleTitle,
      is_retry: isRetry,
      previous_best_score: previousBestScore,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // Génération d'un quiz (via Gemini)
  logQuizGeneration(moduleId, moduleTitle, generationStatus, generationTime = null, fromCache = false) {
    this.logEvent('quiz_generation', {
      module_id: moduleId,
      module_title: moduleTitle,
      generation_status: generationStatus, // 'success' ou 'error'
      generation_time_ms: generationTime,
      from_cache: fromCache,
      timestamp: new Date().toISOString()
    });
  }

  // Réponse à une question
  logQuestionAnswer(moduleId, questionIndex, questionType, difficulty, isCorrect, timeSpent) {
    this.logEvent('question_answer', {
      module_id: moduleId,
      question_index: questionIndex,
      question_type: questionType, // 'multiple-choice', 'true-false', 'code-completion', 'code-debugging'
      difficulty: difficulty,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
      page_location: window.location.href
    });
  }

  // Navigation entre questions
  logQuestionNavigation(moduleId, fromQuestionIndex, toQuestionIndex, navigationMethod) {
    this.logEvent('question_navigation', {
      module_id: moduleId,
      from_question: fromQuestionIndex,
      to_question: toQuestionIndex,
      navigation_method: navigationMethod, // 'next', 'previous', 'direct'
      page_location: window.location.href
    });
  }

  // Soumission du quiz complet
  logQuizSubmit(moduleId, moduleTitle, totalQuestions, answeredQuestions, unansweredQuestions) {
    this.logEvent('quiz_submit', {
      module_id: moduleId,
      module_title: moduleTitle,
      total_questions: totalQuestions,
      answered_questions: answeredQuestions,
      unanswered_questions: unansweredQuestions,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // Abandon du quiz
  logQuizAbandon(moduleId, currentQuestionIndex, totalQuestions, answeredCount) {
    this.logEvent('quiz_abandon', {
      module_id: moduleId,
      current_question: currentQuestionIndex,
      total_questions: totalQuestions,
      answered_count: answeredCount,
      completion_percentage: Math.round((answeredCount / totalQuestions) * 100),
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // === ÉVÉNEMENTS DE RÉSULTATS ===

  // Affichage des résultats
  logResultsView(
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
  ) {
    this.logEvent('quiz_results_view', {
      module_id: moduleId,
      module_title: moduleTitle,
      score: score,
      passed: passed,
      correct_count: correctCount,
      total_questions: totalQuestions,
      earned_points: earnedPoints,
      total_points: totalPoints,
      time_spent_seconds: timeSpent,
      is_new_best_score: isNewBestScore,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // Validation d'un module (score >= 70%)
  logModuleCompletion(moduleId, moduleTitle, score, attemptNumber, totalTimeSpent) {
    this.logEvent('module_completion', {
      module_id: moduleId,
      module_title: moduleTitle,
      final_score: score,
      attempt_number: attemptNumber,
      total_time_spent_seconds: totalTimeSpent,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // Échec de validation d'un module
  logModuleFailure(moduleId, moduleTitle, score, requiredScore, attemptNumber) {
    this.logEvent('module_failure', {
      module_id: moduleId,
      module_title: moduleTitle,
      score: score,
      required_score: requiredScore,
      score_difference: requiredScore - score,
      attempt_number: attemptNumber,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // === ÉVÉNEMENTS D'INTERACTION ===

  // Clic sur "Recommencer le quiz"
  logRetryQuiz(moduleId, previousScore, attemptsCount) {
    this.logEvent('quiz_retry', {
      module_id: moduleId,
      previous_score: previousScore,
      attempts_count: attemptsCount,
      page_location: window.location.href
    });
  }

  // Clic sur "Module suivant"
  logNextModuleClick(currentModuleId, nextModuleId, currentScore) {
    this.logEvent('next_module_click', {
      current_module_id: currentModuleId,
      next_module_id: nextModuleId,
      current_score: currentScore,
      page_location: window.location.href
    });
  }

  // Changement de thème (dark/light)
  logThemeChange(newTheme) {
    this.logEvent('theme_change', {
      theme: newTheme, // 'dark' ou 'light'
      page_location: window.location.href
    });
  }

  // === ÉVÉNEMENTS DE PROGRESSION ===

  // Progression globale mise à jour
  logProgressUpdate(
    totalModules,
    completedModules,
    globalProgress,
    totalQuizzesTaken,
    averageScore,
    totalTimeSpent
  ) {
    this.logEvent('progress_update', {
      total_modules: totalModules,
      completed_modules: completedModules,
      global_progress: globalProgress,
      total_quizzes_taken: totalQuizzesTaken,
      average_score: averageScore,
      total_time_spent_minutes: Math.round(totalTimeSpent / 60),
      timestamp: new Date().toISOString()
    });
  }

  // Déblocage d'un nouveau module
  logModuleUnlock(unlockedModuleId, unlockedModuleTitle, unlockedByModuleId) {
    this.logEvent('module_unlock', {
      unlocked_module_id: unlockedModuleId,
      unlocked_module_title: unlockedModuleTitle,
      unlocked_by_module_id: unlockedByModuleId,
      timestamp: new Date().toISOString()
    });
  }

  // === ÉVÉNEMENTS DE PERFORMANCE ===

  // Temps passé sur une page
  logTimeOnPage(pageName, timeInSeconds, moduleId = null) {
    this.logEvent('page_engagement', {
      page_name: pageName,
      engagement_time_seconds: timeInSeconds,
      module_id: moduleId,
      page_location: window.location.href
    });
  }

  // Performance d'un utilisateur sur un type de question
  logQuestionTypePerformance(questionType, totalAnswered, correctAnswers, averageTime) {
    this.logEvent('question_type_performance', {
      question_type: questionType,
      total_answered: totalAnswered,
      correct_answers: correctAnswers,
      accuracy_percentage: Math.round((correctAnswers / totalAnswered) * 100),
      average_time_seconds: averageTime
    });
  }

  // === ÉVÉNEMENTS D'ERREUR ===

  // Erreur de génération de quiz
  logQuizGenerationError(moduleId, errorMessage, errorCode = null) {
    this.logEvent('quiz_generation_error', {
      module_id: moduleId,
      error_message: errorMessage,
      error_code: errorCode,
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // Erreur générique d'application
  logAppError(errorType, errorMessage, errorContext = {}) {
    this.logEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage,
      error_context: JSON.stringify(errorContext),
      timestamp: new Date().toISOString(),
      page_location: window.location.href
    });
  }

  // === ÉVÉNEMENTS DE SESSION ===

  // Début de session utilisateur
  logSessionStart(userId = 'anonymous') {
    this.logEvent('session_start', {
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }

  // Fin de session utilisateur
  logSessionEnd(sessionDuration, pagesVisited, quizzesCompleted) {
    this.logEvent('session_end', {
      session_duration_seconds: sessionDuration,
      pages_visited: pagesVisited,
      quizzes_completed: quizzesCompleted,
      timestamp: new Date().toISOString()
    });
  }

  // === ÉVÉNEMENTS PERSONNALISÉS ===

  // Événement personnalisé générique
  logCustomEvent(eventName, parameters = {}) {
    this.logEvent(eventName, {
      ...parameters,
      page_location: window.location.href,
      timestamp: new Date().toISOString()
    });
  }
}

// Export d'une instance singleton
const quizAnalyticsService = new QuizAnalyticsService();
export default quizAnalyticsService;
