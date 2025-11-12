import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MODULES_DATA, getModuleById } from '../data/modules';

export const useQuizStore = create(
  persist(
    (set, get) => ({
      // ==================== ÉTAT SESSION EN COURS ====================
      currentSession: null, // { moduleId, startedAt }
      currentQuestionIndex: 0,
      answers: {}, // { questionId: { selected, correct, timeSpent, timestamp } }
      sessionStartTime: null,
      questions: [],

      // ==================== PROGRESSION UTILISATEUR ====================
      userProgress: {
        userId: null,
        lastSync: null,
        modules: {}, // { moduleId: { status, attempts[], bestScore, lastAttemptDate, completedAt } }
        globalStats: {
          totalModulesCompleted: 0,
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
          badges: []
        }
      },

      // ==================== ACTIONS ====================

      /**
       * Initialiser l'utilisateur (génère ID local si nécessaire)
       */
      initializeUser: () => {
        const { userProgress } = get();
        if (!userProgress.userId) {
          const userId = `local-user-${crypto.randomUUID()}`;
          set(state => ({
            userProgress: {
              ...state.userProgress,
              userId
            }
          }));
        }
      },

      /**
       * Démarrer une session de quiz
       */
      startQuizSession: (moduleId, questions) => {
        set({
          currentSession: {
            moduleId,
            startedAt: Date.now()
          },
          questions,
          currentQuestionIndex: 0,
          answers: {},
          sessionStartTime: Date.now()
        });
      },

      /**
       * Répondre à une question
       */
      answerQuestion: (questionId, answer) => {
        const { questions, currentQuestionIndex } = get();
        const question = questions[currentQuestionIndex];

        if (!question) return;

        const isCorrect = answer === question.correctAnswer;

        set(state => ({
          answers: {
            ...state.answers,
            [questionId]: {
              selected: answer,
              correct: isCorrect,
              timeSpent: Date.now() - (state.sessionStartTime || Date.now()),
              timestamp: Date.now()
            }
          }
        }));
      },

      /**
       * Passer à la question suivante
       */
      nextQuestion: () => {
        set(state => ({
          currentQuestionIndex: state.currentQuestionIndex + 1
        }));
      },

      /**
       * Question précédente
       */
      previousQuestion: () => {
        set(state => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1)
        }));
      },

      /**
       * Calculer le score final
       */
      calculateScore: () => {
        const { questions, answers } = get();

        const correctCount = Object.values(answers).filter(a => a.correct).length;
        const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
        const earnedPoints = questions.reduce((sum, q) => {
          return sum + (answers[q.id]?.correct ? (q.points || 10) : 0);
        }, 0);

        const timeSpent = Object.values(answers).reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 1000; // en secondes

        return {
          score: Math.round((earnedPoints / totalPoints) * 100),
          correctCount,
          totalQuestions: questions.length,
          earnedPoints,
          totalPoints,
          timeSpent: Math.round(timeSpent)
        };
      },

      /**
       * Sauvegarder la tentative de quiz
       */
      saveQuizAttempt: (moduleId, results) => {
        set(state => {
          const moduleProgress = state.userProgress.modules[moduleId] || {
            status: 'in_progress',
            attempts: [],
            bestScore: 0,
            lastAttemptDate: null,
            completedAt: null
          };

          const newAttempt = {
            attemptNumber: moduleProgress.attempts.length + 1,
            date: new Date().toISOString(),
            ...results,
            answers: state.answers
          };

          moduleProgress.attempts.push(newAttempt);
          moduleProgress.bestScore = Math.max(
            moduleProgress.bestScore,
            results.score
          );
          moduleProgress.lastAttemptDate = newAttempt.date;

          // Mettre à jour le statut
          if (results.score >= 70) {
            moduleProgress.status = 'completed';
            moduleProgress.completedAt = newAttempt.date;
          } else if (results.score < 70 && moduleProgress.status !== 'completed') {
            moduleProgress.status = 'in_progress';
          }

          if (results.score === 100) {
            moduleProgress.status = 'perfect';
          }

          // Mettre à jour stats globales
          const newTotalQuizzesTaken = state.userProgress.globalStats.totalQuizzesTaken + 1;
          const allScores = Object.values(state.userProgress.modules).flatMap(m =>
            m.attempts.map(a => a.score)
          ).concat(results.score);
          const newAverageScore = Math.round(
            allScores.reduce((sum, s) => sum + s, 0) / allScores.length
          );

          const completedModules = Object.values(state.userProgress.modules).filter(
            m => m.status === 'completed' || m.status === 'perfect'
          ).length + (results.score >= 70 && moduleProgress.status === 'in_progress' ? 1 : 0);

          return {
            userProgress: {
              ...state.userProgress,
              modules: {
                ...state.userProgress.modules,
                [moduleId]: moduleProgress
              },
              globalStats: {
                ...state.userProgress.globalStats,
                totalModulesCompleted: completedModules,
                totalQuizzesTaken: newTotalQuizzesTaken,
                averageScore: newAverageScore,
                totalTimeSpent: state.userProgress.globalStats.totalTimeSpent + results.timeSpent
              }
            }
          };
        });

        // Réinitialiser la session
        set({
          currentSession: null,
          questions: [],
          currentQuestionIndex: 0,
          answers: {},
          sessionStartTime: null
        });
      },

      /**
       * Vérifier si un module est accessible
       */
      canAccessModule: (moduleId) => {
        const { userProgress } = get();
        const module = getModuleById(moduleId);

        if (!module) return false;
        if (module.isFirst) return true; // Premier module toujours accessible
        if (!module.previousModuleId) return true;

        const prevModuleProgress = userProgress.modules[module.previousModuleId];
        if (!prevModuleProgress) return false;

        return prevModuleProgress.bestScore >= 70;
      },

      /**
       * Obtenir le statut d'un module
       */
      getModuleStatus: (moduleId) => {
        const { userProgress } = get();
        const moduleProgress = userProgress.modules[moduleId];

        if (!moduleProgress) {
          // Pas encore tenté - vérifier si accessible
          return get().canAccessModule(moduleId) ? 'unlocked' : 'locked';
        }

        return moduleProgress.status;
      },

      /**
       * Obtenir les statistiques d'un module
       */
      getModuleStats: (moduleId) => {
        const { userProgress } = get();
        const moduleProgress = userProgress.modules[moduleId];

        if (!moduleProgress || !moduleProgress.attempts.length) {
          return null;
        }

        return {
          bestScore: moduleProgress.bestScore,
          attemptsCount: moduleProgress.attempts.length,
          lastAttemptDate: moduleProgress.lastAttemptDate,
          completedAt: moduleProgress.completedAt,
          averageScore: Math.round(
            moduleProgress.attempts.reduce((sum, a) => sum + a.score, 0) / moduleProgress.attempts.length
          ),
          totalTimeSpent: moduleProgress.attempts.reduce((sum, a) => sum + a.timeSpent, 0)
        };
      },

      /**
       * Réinitialiser la progression (pour tests)
       */
      resetProgress: () => {
        set({
          userProgress: {
            userId: `local-user-${crypto.randomUUID()}`,
            lastSync: null,
            modules: {},
            globalStats: {
              totalModulesCompleted: 0,
              totalQuizzesTaken: 0,
              averageScore: 0,
              totalTimeSpent: 0,
              currentStreak: 0,
              longestStreak: 0,
              badges: []
            }
          }
        });
      },

      /**
       * Obtenir la progression globale en pourcentage
       */
      getGlobalProgress: () => {
        const { userProgress } = get();
        const requiredModules = MODULES_DATA.filter(m => !m.isBonus);
        const completedModules = requiredModules.filter(m => {
          const progress = userProgress.modules[m.id];
          return progress && (progress.status === 'completed' || progress.status === 'perfect');
        });

        return Math.round((completedModules.length / requiredModules.length) * 100);
      }
    }),
    {
      name: 'flutter-quiz-storage', // LocalStorage key
      partialize: (state) => ({
        // Ne persister que la progression utilisateur
        userProgress: state.userProgress
      })
    }
  )
);
