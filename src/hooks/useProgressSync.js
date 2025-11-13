import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuizStore } from '../stores/quizStore';
import { getProgress, syncProgress, saveQuizAttempt } from '../services/firebase/firestore/progress';

/**
 * Hook pour synchroniser automatiquement la progression locale avec Firebase
 */
export function useProgressSync() {
  const { user, isAuthenticated } = useAuth();
  const { userProgress, saveQuizAttempt: saveLocalQuizAttempt } = useQuizStore();

  /**
   * Synchronise la progression locale vers Firebase
   */
  const syncToFirebase = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      await syncProgress(user.uid, userProgress);
      console.log('Progress synced to Firebase');
    } catch (error) {
      console.error('Error syncing progress to Firebase:', error);
    }
  }, [isAuthenticated, user, userProgress]);

  /**
   * Charge la progression depuis Firebase et met à jour le store local
   */
  const loadFromFirebase = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const firestoreProgress = await getProgress(user.uid);

      // Mettre à jour le store Zustand avec la progression Firebase
      useQuizStore.setState((state) => ({
        userProgress: {
          ...state.userProgress,
          ...firestoreProgress,
          userId: user.uid
        }
      }));

      console.log('Progress loaded from Firebase');
    } catch (error) {
      console.error('Error loading progress from Firebase:', error);
    }
  }, [isAuthenticated, user]);

  /**
   * Sauvegarde une tentative de quiz dans Firebase et localement
   */
  const saveAttempt = useCallback(
    async (courseId, moduleId, results, answers) => {
      console.log('🟡 [useProgressSync] saveAttempt appelé:', {
        courseId,
        moduleId,
        results,
        answers,
        isAuthenticated,
        userId: user?.uid
      });

      if (!isAuthenticated || !user) {
        console.log('🟠 [useProgressSync] Mode hors ligne - sauvegarde locale uniquement');
        // Mode hors ligne, sauvegarder seulement localement
        saveLocalQuizAttempt(courseId, moduleId, results);
        return;
      }

      try {
        console.log('🟢 [useProgressSync] Sauvegarde dans Firebase...');
        // Sauvegarder dans Firebase
        await saveQuizAttempt(user.uid, courseId, moduleId, results, answers);

        console.log('🟢 [useProgressSync] Sauvegarde locale...');
        // Sauvegarder localement aussi
        saveLocalQuizAttempt(courseId, moduleId, results);

        console.log('✅ [useProgressSync] Quiz attempt saved to Firebase and locally');
      } catch (error) {
        console.error('❌ [useProgressSync] Error saving quiz attempt to Firebase:', error);
        // En cas d'erreur, au moins sauvegarder localement
        saveLocalQuizAttempt(courseId, moduleId, results);
      }
    },
    [isAuthenticated, user, saveLocalQuizAttempt]
  );

  // Charger la progression depuis Firebase au montage
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFromFirebase();
    }
  }, [isAuthenticated, user, loadFromFirebase]);

  // Synchroniser automatiquement toutes les 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      syncToFirebase();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user, syncToFirebase]);

  // Synchroniser avant de fermer la page
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleBeforeUnload = () => {
      syncToFirebase();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isAuthenticated, user, syncToFirebase]);

  return {
    syncToFirebase,
    loadFromFirebase,
    saveAttempt
  };
}
