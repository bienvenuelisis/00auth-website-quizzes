import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  Container,
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Send as SubmitIcon,
  ExitToApp as ExitIcon,
} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import { useQuizStore } from "../stores/quizStore";
import { getModuleById } from "../data/modules";
import QuestionCard from "../components/Quiz/QuestionCard";
import ProgressBar from "../components/Quiz/ProgressBar";
import { useAnalytics, usePageTimeTracking } from "../hooks/useAnalytics";
import { useAuth } from "../contexts/AuthContext";
import { useProgressSync } from "../hooks/useProgressSync";

/**
 * QuizSession - Page de session de quiz active
 * Gère l'affichage des questions, la navigation et la soumission
 */
export default function QuizSession() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuth();
  const analytics = useAnalytics();

  // Vérifier si l'utilisateur peut accéder aux formations
  const canAccessCourses = isAuthenticated && profile?.accountIsValid && profile?.isActive;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Rediriger vers la page d'accueil si l'utilisateur n'a pas accès
  if (!canAccessCourses) {
    return <Navigate to="/" replace />;
  }

  const {
    currentSession,
    currentQuestionIndex,
    answers,
    questions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    calculateScore,
  } = useQuizStore();

  // Hook pour synchroniser avec Firebase
  const { saveAttempt } = useProgressSync();

  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Tracker le temps par question
  const questionStartTime = useRef(Date.now());

  const module = getModuleById(moduleId);
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id];

  // Tracker le temps passé sur la page du quiz
  usePageTimeTracking("quiz_session", moduleId);

  useEffect(() => {
    // Si pas de session active, rediriger vers la page du module
    if (!currentSession || currentSession.moduleId !== moduleId) {
      navigate(`/course/${courseId}/module/${moduleId}`);
    }
  }, [currentSession, moduleId, courseId, navigate]);

  // Reset timer when question changes
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentQuestionIndex]);

  if (!currentSession || !module || !currentQuestion) {
    return null;
  }

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = questions.every(
    (q) => answers[q.id] !== undefined
  );

  const handleAnswerSelect = (answer) => {
    const timeSpent = Math.floor(
      (Date.now() - questionStartTime.current) / 1000
    );

    // Tracker la réponse
    analytics.trackQuestionAnswer(
      moduleId,
      currentQuestionIndex,
      currentQuestion.type,
      currentQuestion.difficulty,
      answer === currentQuestion.correctAnswer,
      timeSpent
    );

    answerQuestion(currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      analytics.trackQuestionNavigation(
        moduleId,
        currentQuestionIndex,
        currentQuestionIndex + 1,
        "next"
      );
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      analytics.trackQuestionNavigation(
        moduleId,
        currentQuestionIndex,
        currentQuestionIndex - 1,
        "previous"
      );
      previousQuestion();
    }
  };

  const handleSubmit = () => {
    if (!allQuestionsAnswered) {
      setSubmitDialogOpen(true);
      return;
    }

    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    // Tracker la soumission du quiz
    analytics.trackQuizSubmit(
      moduleId,
      module.title,
      questions.length,
      answeredCount,
      unansweredCount
    );

    // Calculer le score
    const results = calculateScore();

    console.log('🟡 [QuizSession] Sauvegarde du quiz avec saveAttempt:', {
      courseId,
      moduleId,
      results,
      answers
    });

    // Sauvegarder la tentative (local + Firebase via useProgressSync)
    saveAttempt(courseId, moduleId, results, answers);

    // Naviguer vers la page de résultats
    navigate(`/course/${courseId}/module/${moduleId}/results`, {
      state: { results },
    });
  };

  const handleExit = () => {
    const answeredCount = Object.keys(answers).length;

    // Tracker l'abandon du quiz
    analytics.trackQuizAbandon(
      moduleId,
      currentQuestionIndex,
      questions.length,
      answeredCount
    );

    navigate(`/course/${courseId}/module/${moduleId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {module.title}
        </Typography>
        <ProgressBar
          currentIndex={currentQuestionIndex}
          totalQuestions={questions.length}
        />
      </Box>

      {/* Alerte si pas toutes les questions répondues */}
      {!allQuestionsAnswered &&
        currentQuestionIndex === questions.length - 1 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Vous n'avez pas répondu à toutes les questions. Pensez à vérifier
            vos réponses avant de soumettre.
          </Alert>
        )}

      {/* Question actuelle */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          selectedAnswer={selectedAnswer?.selected}
          onAnswerSelect={handleAnswerSelect}
          showResult={false}
        />
      </AnimatePresence>

      {/* Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          gap: 2,
        }}
      >
        {/* Bouton Quitter */}
        <Button
          variant="outlined"
          color="error"
          startIcon={<ExitIcon />}
          onClick={() => setExitDialogOpen(true)}
        >
          Quitter
        </Button>

        {/* Navigation gauche/droite */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrevIcon />}
            onClick={handlePrevious}
            disabled={isFirstQuestion}
          >
            Précédent
          </Button>

          {!isLastQuestion ? (
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={handleNext}
              disabled={selectedAnswer === undefined}
            >
              Suivant
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              endIcon={<SubmitIcon />}
              onClick={handleSubmit}
            >
              Soumettre
            </Button>
          )}
        </Box>
      </Box>

      {/* Dialog Quitter */}
      <Dialog open={exitDialogOpen} onClose={() => setExitDialogOpen(false)}>
        <DialogTitle>Quitter le quiz ?</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir quitter ? Votre progression ne sera pas
            sauvegardée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            color="text.secondary"
            onClick={() => setExitDialogOpen(false)}
          >
            Annuler
          </Button>
          <Button onClick={handleExit} color="error" variant="contained">
            Quitter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Soumettre avec questions non répondues */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
      >
        <DialogTitle>Questions non répondues</DialogTitle>
        <DialogContent>
          <Typography>
            Vous n'avez pas répondu à toutes les questions. Souhaitez-vous
            vraiment soumettre le quiz ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Les questions non répondues seront comptées comme incorrectes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>
            Continuer le quiz
          </Button>
          <Button onClick={handleSubmit} color="warning" variant="contained">
            Soumettre quand même
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
