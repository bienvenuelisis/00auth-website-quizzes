import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Send as SubmitIcon,
  ExitToApp as ExitIcon,
} from '@mui/icons-material';
import { AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../stores/quizStore';
import { getModuleById } from '../data/modules';
import QuestionCard from '../components/Quiz/QuestionCard';
import ProgressBar from '../components/Quiz/ProgressBar';

/**
 * QuizSession - Page de session de quiz active
 * Gère l'affichage des questions, la navigation et la soumission
 */
export default function QuizSession() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const {
    currentSession,
    currentQuestionIndex,
    answers,
    questions,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    calculateScore,
    saveQuizAttempt,
  } = useQuizStore();

  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const module = getModuleById(moduleId);
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestion?.id];

  useEffect(() => {
    // Si pas de session active, rediriger vers la page du module
    if (!currentSession || currentSession.moduleId !== moduleId) {
      navigate(`/module/${moduleId}`);
    }
  }, [currentSession, moduleId, navigate]);

  if (!currentSession || !module || !currentQuestion) {
    return null;
  }

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleAnswerSelect = (answer) => {
    answerQuestion(currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      previousQuestion();
    }
  };

  const handleSubmit = () => {
    if (!allQuestionsAnswered) {
      setSubmitDialogOpen(true);
      return;
    }

    // Calculer le score
    const results = calculateScore();

    // Sauvegarder la tentative
    saveQuizAttempt(moduleId, results);

    // Naviguer vers la page de résultats
    navigate(`/module/${moduleId}/results`, {
      state: { results },
    });
  };

  const handleExit = () => {
    navigate(`/module/${moduleId}`);
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
      {!allQuestionsAnswered && currentQuestionIndex === questions.length - 1 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous n'avez pas répondu à toutes les questions. Pensez à vérifier vos réponses avant de soumettre.
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
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
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            Êtes-vous sûr de vouloir quitter ? Votre progression ne sera pas sauvegardée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleExit} color="error" variant="contained">
            Quitter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Soumettre avec questions non répondues */}
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)}>
        <DialogTitle>Questions non répondues</DialogTitle>
        <DialogContent>
          <Typography>
            Vous n'avez pas répondu à toutes les questions. Souhaitez-vous vraiment soumettre le quiz ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Les questions non répondues seront comptées comme incorrectes.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialogOpen(false)}>Continuer le quiz</Button>
          <Button onClick={handleSubmit} color="warning" variant="contained">
            Soumettre quand même
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
