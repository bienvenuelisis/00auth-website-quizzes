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
        courses: {}, // { courseId: { enrolledAt, modules: {}, stats: {} } }
        globalStats: {
          totalModulesCompleted: 0,
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
          badges: [],
          totalCoursesEnrolled: 0,
          totalCoursesCompleted: 0
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
      saveQuizAttempt: (courseId, moduleId, results) => {
        console.log('🔵 [quizStore] saveQuizAttempt appelé:', { courseId, moduleId, results });
        set(state => {
          console.log('🔵 [quizStore] État actuel userProgress:', state.userProgress);
          // S'assurer que le cours existe
          if (!state.userProgress.courses[courseId]) {
            state.userProgress.courses[courseId] = {
              courseId,
              enrolledAt: new Date().toISOString(),
              completedAt: null,
              lastActivityAt: new Date().toISOString(),
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

          const courseProgress = state.userProgress.courses[courseId];

          const moduleProgress = courseProgress.modules[moduleId] || {
            moduleId,
            status: 'unlocked',
            attempts: [],
            bestScore: 0,
            lastAttemptDate: null,
            completedAt: null,
            firstAttemptDate: null,
            totalTimeSpent: 0
          };

          const newAttempt = {
            attemptId: `${moduleId}-${Date.now()}`,
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
          moduleProgress.totalTimeSpent += results.timeSpent;

          if (!moduleProgress.firstAttemptDate) {
            moduleProgress.firstAttemptDate = newAttempt.date;
          }

          // Mettre à jour le statut
          if (results.score >= 70) {
            if (moduleProgress.status !== 'completed' && moduleProgress.status !== 'perfect') {
              moduleProgress.completedAt = newAttempt.date;
            }
            moduleProgress.status = results.score === 100 ? 'perfect' : 'completed';
          } else if (moduleProgress.status === 'unlocked') {
            moduleProgress.status = 'in_progress';
          }

          // Mettre à jour les stats du cours
          const courseModules = Object.values(courseProgress.modules);
          const courseScores = courseModules.flatMap(m => m.attempts.map(a => a.score));
          const courseCompletedModules = courseModules.filter(
            m => m.status === 'completed' || m.status === 'perfect'
          ).length;

          courseProgress.modules[moduleId] = moduleProgress;
          courseProgress.lastActivityAt = new Date().toISOString();
          courseProgress.stats = {
            totalModulesCompleted: courseCompletedModules,
            totalQuizzesTaken: courseScores.length,
            averageScore: courseScores.length > 0
              ? Math.round(courseScores.reduce((sum, s) => sum + s, 0) / courseScores.length)
              : 0,
            totalTimeSpent: courseModules.reduce((sum, m) => sum + m.totalTimeSpent, 0),
            progress: 0
          };

          // Mettre à jour stats globales
          const allCourses = Object.values(state.userProgress.courses);
          const allScores = allCourses.flatMap(c =>
            Object.values(c.modules).flatMap(m => m.attempts.map(a => a.score))
          );

          const completedModules = allCourses.reduce(
            (sum, c) => sum + Object.values(c.modules).filter(
              m => m.status === 'completed' || m.status === 'perfect'
            ).length,
            0
          );

          const newState = {
            userProgress: {
              ...state.userProgress,
              courses: {
                ...state.userProgress.courses,
                [courseId]: courseProgress
              },
              globalStats: {
                ...state.userProgress.globalStats,
                totalModulesCompleted: completedModules,
                totalQuizzesTaken: allScores.length,
                averageScore: allScores.length > 0
                  ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
                  : 0,
                totalTimeSpent: allCourses.reduce((sum, c) => sum + c.stats.totalTimeSpent, 0),
                totalCoursesEnrolled: Object.keys(state.userProgress.courses).length
              }
            }
          };
          console.log('🟢 [quizStore] Nouvel état userProgress:', newState.userProgress);
          return newState;
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
      canAccessModule: (courseId, moduleId) => {
        const { userProgress } = get();
        const module = getModuleById(moduleId);

        if (!module) return false;
        if (module.isFirst) return true; // Premier module toujours accessible
        if (!module.previousModuleId) return true;

        const courseProgress = userProgress.courses?.[courseId];
        if (!courseProgress) return false;

        const prevModuleProgress = courseProgress.modules?.[module.previousModuleId];
        if (!prevModuleProgress) return false;

        return prevModuleProgress.bestScore >= 70;
      },

      /**
       * Obtenir le statut d'un module
       */
      getModuleStatus: (courseId, moduleId) => {
        const { userProgress } = get();
        const courseProgress = userProgress.courses?.[courseId];
        const moduleProgress = courseProgress?.modules?.[moduleId];

        if (!moduleProgress) {
          // Pas encore tenté - vérifier si accessible
          return get().canAccessModule(courseId, moduleId) ? 'unlocked' : 'locked';
        }

        return moduleProgress.status;
      },

      /**
       * Obtenir les statistiques d'un module
       */
      getModuleStats: (courseId, moduleId) => {
        const { userProgress } = get();
        const courseProgress = userProgress.courses?.[courseId];
        const moduleProgress = courseProgress?.modules?.[moduleId];

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
            courses: {},
            globalStats: {
              totalModulesCompleted: 0,
              totalQuizzesTaken: 0,
              averageScore: 0,
              totalTimeSpent: 0,
              currentStreak: 0,
              longestStreak: 0,
              badges: [],
              totalCoursesEnrolled: 0,
              totalCoursesCompleted: 0
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

        let completedCount = 0;
        Object.values(userProgress.courses || {}).forEach(course => {
          requiredModules.forEach(m => {
            const progress = course.modules?.[m.id];
            if (progress && (progress.status === 'completed' || progress.status === 'perfect')) {
              completedCount++;
            }
          });
        });

        return Math.round((completedCount / requiredModules.length) * 100);
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
