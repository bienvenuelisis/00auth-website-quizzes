import { useMemo } from 'react';
import {
  validateQuiz,
  getPlayableQuestions,
  getValidationReport,
  getQuizStats,
} from '../utils/quizValidator';

/**
 * Hook pour valider un quiz et obtenir des statistiques
 */
export function useQuizValidation(quiz) {
  const validation = useMemo(() => {
    if (!quiz) return null;
    return validateQuiz(quiz);
  }, [quiz]);

  const playableQuestions = useMemo(() => {
    if (!quiz) return [];
    return getPlayableQuestions(quiz);
  }, [quiz]);

  const stats = useMemo(() => {
    if (!quiz) return null;
    return getQuizStats(quiz);
  }, [quiz]);

  const report = useMemo(() => {
    if (!validation) return null;
    return getValidationReport(validation);
  }, [validation]);

  // Vérifier si le quiz a des erreurs critiques
  const hasCriticalErrors = validation && !validation.valid;

  // Vérifier si assez de questions sont jouables (au moins 70%)
  const hasEnoughQuestions = stats && (stats.playable / stats.total) >= 0.7;

  // Le quiz est utilisable si pas d'erreurs critiques et assez de questions
  const isUsable = !hasCriticalErrors && hasEnoughQuestions;

  return {
    validation,
    playableQuestions,
    stats,
    report,
    hasCriticalErrors,
    hasEnoughQuestions,
    isUsable,
  };
}
