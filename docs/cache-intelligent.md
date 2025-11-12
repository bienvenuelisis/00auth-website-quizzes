# Système de Cache Intelligent des Quiz

## Vue d'ensemble

Le système de cache intelligent adapte automatiquement la durée de vie des quiz en fonction de leur état d'utilisation.

## Durées de Cache

| État | Durée | Usage |
|------|-------|-------|
| **IN_PROGRESS** | 30 minutes | Quiz en cours de réalisation |
| **COMPLETED** | 2 heures | Quiz terminé |
| **IDLE** | 2 heures | Quiz non commencé ou par défaut |

## États des Quiz

### QuizState.IN_PROGRESS
- Quiz actuellement en cours
- Cache plus court (30 min) pour éviter la régénération accidentelle lors d'un rafraîchissement de page
- Protège la session active de l'utilisateur

### QuizState.COMPLETED
- Quiz terminé par l'utilisateur
- Cache de 2 heures pour permettre la révision
- Assez court pour avoir des quiz différents lors de la prochaine session

### QuizState.IDLE
- Quiz jamais commencé ou état par défaut
- Cache de 2 heures
- Équilibre entre performance et variété

## Utilisation dans les Composants React

### 1. Charger ou Générer un Quiz

```javascript
import { getOrGenerateQuiz, QuizState, setQuizState } from '../services/geminiQuiz';
import { getModuleById } from '../data/modules';

const QuizComponent = ({ moduleId }) => {
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      const moduleData = getModuleById(moduleId);
      const quizData = await getOrGenerateQuiz(moduleData);
      setQuiz(quizData);
    };

    loadQuiz();
  }, [moduleId]);

  // ...
};
```

### 2. Démarrer un Quiz (Mise à jour de l'état)

```javascript
const handleStartQuiz = () => {
  // Mettre à jour l'état pour activer le cache de 30 min
  setQuizState(moduleId, QuizState.IN_PROGRESS, {
    startedAt: Date.now(),
    currentQuestion: 0
  });

  // Démarrer le quiz...
};
```

### 3. Terminer un Quiz

```javascript
const handleCompleteQuiz = (score) => {
  // Mettre à jour l'état pour cache de 2 heures
  setQuizState(moduleId, QuizState.COMPLETED, {
    completedAt: Date.now(),
    score: score,
    passed: score >= moduleData.minimumScore
  });

  // Logique de fin de quiz...
};
```

### 4. Bouton "Nouveau Quiz"

```javascript
import { regenerateQuiz } from '../services/geminiQuiz';

const handleNewQuiz = async () => {
  setLoading(true);

  try {
    const moduleData = getModuleById(moduleId);
    const newQuiz = await regenerateQuiz(moduleData);
    setQuiz(newQuiz);

    // Quiz régénéré avec succès
    toast.success('Nouveau quiz généré !');

  } catch (error) {
    toast.error('Erreur lors de la génération du quiz');
  } finally {
    setLoading(false);
  }
};

return (
  <button onClick={handleNewQuiz} disabled={loading}>
    {loading ? 'Génération...' : '🔄 Nouveau Quiz'}
  </button>
);
```

### 5. Gestion Complète d'un Quiz

```javascript
import {
  getOrGenerateQuiz,
  QuizState,
  setQuizState,
  getQuizState,
  regenerateQuiz
} from '../services/geminiQuiz';

const QuizPage = ({ moduleId }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);

  // Charger le quiz
  useEffect(() => {
    const loadQuiz = async () => {
      const moduleData = getModuleById(moduleId);
      const quizData = await getOrGenerateQuiz(moduleData);
      setQuiz(quizData);

      // Vérifier si un quiz est déjà en cours
      const state = getQuizState(moduleId);
      if (state.status === QuizState.IN_PROGRESS) {
        setCurrentQuestion(state.currentQuestion || 0);
        // Restaurer la progression si nécessaire
      }
    };

    loadQuiz();
  }, [moduleId]);

  // Démarrer le quiz
  const startQuiz = () => {
    setQuizState(moduleId, QuizState.IN_PROGRESS, {
      startedAt: Date.now(),
      currentQuestion: 0
    });
  };

  // Sauvegarder la progression
  const saveProgress = (questionIndex) => {
    setQuizState(moduleId, QuizState.IN_PROGRESS, {
      currentQuestion: questionIndex,
      answers: answers
    });
  };

  // Soumettre une réponse
  const submitAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      saveProgress(nextQuestion);
    } else {
      completeQuiz(newAnswers);
    }
  };

  // Terminer le quiz
  const completeQuiz = (finalAnswers) => {
    const score = calculateScore(finalAnswers, quiz.questions);

    setQuizState(moduleId, QuizState.COMPLETED, {
      completedAt: Date.now(),
      score: score,
      answers: finalAnswers
    });

    // Afficher les résultats...
  };

  // Régénérer un nouveau quiz
  const handleNewQuiz = async () => {
    const moduleData = getModuleById(moduleId);
    const newQuiz = await regenerateQuiz(moduleData);
    setQuiz(newQuiz);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  return (
    <div>
      {/* Interface du quiz */}
      <button onClick={handleNewQuiz}>Nouveau Quiz</button>
    </div>
  );
};
```

## Fonctions API

### getOrGenerateQuiz(moduleData)
Charge depuis le cache ou génère un nouveau quiz.

**Retour**: Promise<Quiz>

### setQuizState(moduleId, status, additionalData)
Met à jour l'état d'un quiz.

**Paramètres**:
- `moduleId`: string - ID du module
- `status`: QuizState - État (IN_PROGRESS, COMPLETED, IDLE)
- `additionalData`: object - Données additionnelles (score, progression, etc.)

### getQuizState(moduleId)
Récupère l'état actuel d'un quiz.

**Retour**: { status, updatedAt, ...additionalData }

### regenerateQuiz(moduleData)
Force la génération d'un nouveau quiz.

**Retour**: Promise<Quiz>

### clearQuizCache(moduleId)
Vide le cache d'un module spécifique.

### clearAllQuizCache()
Vide tout le cache des quiz.

## Avantages du Système

1. **Protection de session**: Cache de 30 min pendant un quiz actif évite la perte de données
2. **Fraîcheur des contenus**: Cache de 2h seulement assure de la variété
3. **Performance optimale**: Évite les appels API répétés pendant une session
4. **Flexibilité**: Fonction `regenerateQuiz()` pour forcer un nouveau quiz à tout moment
5. **État persistant**: Peut restaurer la progression d'un quiz en cours

## Monitoring

Les logs dans la console indiquent l'état du cache:

```
📦 Quiz chargé depuis le cache: module-1-1-dart [in-progress]
💾 Quiz mis en cache: module-1-1-dart (expire dans 30min)
🔄 État du quiz mis à jour: module-1-1-dart → completed
⏰ Cache expiré (120min): module-1-1-dart
🔄 Régénération forcée du quiz: Introduction à la programmation avec Dart
```

## Nettoyage du Cache

Pour nettoyer le cache durant le développement:

```javascript
// Dans la console du navigateur
import { clearAllQuizCache } from './services/geminiQuiz';
clearAllQuizCache();
```

Ou via un bouton admin dans l'interface.
