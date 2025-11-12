import { ai } from '../config/firebase';
import { getGenerativeModel, Schema } from 'firebase/ai';

/**
 * Service de génération de quiz via Firebase AI Logic (Gemini API)
 * Utilise la génération structurée JSON pour garantir un format cohérent
 */

// Schéma JSON pour les questions de quiz
const quizSchema = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          id: Schema.string(),
          type: Schema.enumString({
            enum: ['multiple-choice', 'true-false', 'code-completion', 'code-debugging']
          }),
          difficulty: Schema.enumString({
            enum: ['easy', 'medium', 'hard']
          }),
          question: Schema.string(),
          code: Schema.string(), // Code snippet si applicable
          options: Schema.array({ items: Schema.string() }), // Pour multiple-choice
          correctAnswer: Schema.number(), // Index de la bonne réponse ou 0/1 pour true-false
          explanation: Schema.string(),
          points: Schema.number(),
          timeLimit: Schema.number(),
          tags: Schema.array({ items: Schema.string() }),
        },
        optionalProperties: ['code', 'options'], // code et options sont facultatifs
      }),
    }),
  }
});

/**
 * Construire le prompt pour Gemini basé sur les données du module
 */
function buildPrompt(moduleData) {
  const { title, difficulty, topics, questionCount } = moduleData;

  // Distribution des types de questions selon la difficulté
  const distributions = {
    beginner: '70% multiple-choice, 20% true-false, 10% code-completion',
    intermediate: '40% multiple-choice, 30% code-completion, 20% code-debugging, 10% true-false',
    advanced: '30% multiple-choice, 30% code-debugging, 25% code-completion, 15% true-false'
  };

  const distribution = distributions[difficulty] || distributions.beginner;

  return `Tu es un expert en Flutter et en pédagogie. Génère un quiz de validation pour la Formation Développeur Mobile Avancé avec Flutter.

**MODULE:** ${title}
**NIVEAU:** ${difficulty}
**NOMBRE DE QUESTIONS:** ${questionCount}

**SUJETS À COUVRIR:**
${topics.map(t => `- ${t}`).join('\n')}

**DISTRIBUTION DES TYPES DE QUESTIONS:**
${distribution}

**CONTRAINTES IMPORTANTES:**
1. Les questions doivent tester la COMPRÉHENSION PROFONDE, pas la simple mémorisation
2. Utilise des exemples de code réalistes et pratiques
3. Les explications doivent être claires et pédagogiques en français
4. Pour les questions à choix multiples, assure-toi que les distracteurs sont plausibles
5. Les questions de débogage doivent contenir des erreurs subtiles mais réalistes

**TYPES DE QUESTIONS:**

**multiple-choice:** QCM avec 4 options
- Exemple: "Quelle est la différence entre StatelessWidget et StatefulWidget ?"
- correctAnswer: index de la bonne réponse (0-3)
- options: array de 4 chaînes de caractères

**true-false:** Vrai ou Faux
- Exemple: "Flutter utilise le langage Dart"
- correctAnswer: 1 pour vrai, 0 pour faux
- options: ["Faux", "Vrai"] (toujours dans cet ordre)

**code-completion:** Compléter un code
- Exemple: "Complétez le code pour créer un StatelessWidget"
- code: snippet de code avec un blanc à remplir
- correctAnswer: 0 (une seule bonne réponse parmi les options)
- options: array de 4 compléments possibles

**code-debugging:** Trouver et corriger l'erreur
- Exemple: "Ce code contient une erreur. Identifiez-la."
- code: snippet avec une erreur
- correctAnswer: index de la bonne correction
- options: array de 4 explications/corrections

**POINTS PAR DIFFICULTÉ:**
- easy: 5-10 points
- medium: 10-15 points
- hard: 15-20 points

**TIME LIMIT PAR QUESTION:**
- multiple-choice: 30-45 secondes
- true-false: 15-20 secondes
- code-completion: 45-60 secondes
- code-debugging: 60-90 secondes

Génère exactement ${questionCount} questions variées et pertinentes.`;
}

/**
 * Valider qu'une question est complète et correcte
 */
function validateQuestion(question, index) {
  const errors = [];

  // Vérifier les champs obligatoires de base
  if (!question.type) {
    errors.push(`Question ${index + 1}: type manquant`);
  }

  if (!question.question || question.question.trim() === '') {
    errors.push(`Question ${index + 1}: texte de la question manquant`);
  }

  if (question.correctAnswer === undefined || question.correctAnswer === null) {
    errors.push(`Question ${index + 1}: correctAnswer manquant`);
  }

  if (!question.explanation || question.explanation.trim() === '') {
    errors.push(`Question ${index + 1}: explication manquante`);
  }

  // Validation spécifique selon le type
  switch (question.type) {
    case 'multiple-choice':
    case 'code-completion':
    case 'code-debugging':
      // Ces types DOIVENT avoir des options
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`Question ${index + 1}: options manquantes ou insuffisantes (besoin de 2+ options pour ${question.type})`);
      }
      // Vérifier que correctAnswer est dans les limites
      if (question.options && (question.correctAnswer < 0 || question.correctAnswer >= question.options.length)) {
        errors.push(`Question ${index + 1}: correctAnswer (${question.correctAnswer}) hors limites (0-${question.options.length - 1})`);
      }
      break;

    case 'true-false':
      // Vérifier que correctAnswer est 0 ou 1
      if (question.correctAnswer !== 0 && question.correctAnswer !== 1) {
        errors.push(`Question ${index + 1}: correctAnswer doit être 0 ou 1 pour true-false (reçu: ${question.correctAnswer})`);
      }
      break;

    default:
      errors.push(`Question ${index + 1}: type invalide "${question.type}"`);
  }

  return errors;
}

/**
 * Valider et corriger automatiquement les questions
 */
function validateAndFixQuestions(questions, moduleData) {
  const validatedQuestions = [];
  const allErrors = [];

  questions.forEach((q, index) => {
    const errors = validateQuestion(q, index);

    if (errors.length > 0) {
      console.warn(`⚠️ Problèmes détectés:`, errors);
      allErrors.push(...errors);

      // Tenter de corriger automatiquement
      const fixed = attemptAutoFix(q, index, moduleData);
      if (fixed) {
        const fixedErrors = validateQuestion(fixed, index);
        if (fixedErrors.length === 0) {
          console.log(`✅ Question ${index + 1} corrigée automatiquement`);
          validatedQuestions.push(fixed);
        } else {
          console.error(`❌ Impossible de corriger la question ${index + 1}`);
        }
      }
    } else {
      validatedQuestions.push(q);
    }
  });

  // Si trop d'erreurs non corrigées, échouer
  if (validatedQuestions.length < moduleData.questionCount * 0.7) {
    throw new Error(
      `Trop de questions invalides (${validatedQuestions.length}/${moduleData.questionCount}). ` +
      `Erreurs: ${allErrors.slice(0, 5).join('; ')}...`
    );
  }

  return validatedQuestions;
}

/**
 * Tenter de corriger automatiquement une question problématique
 */
function attemptAutoFix(question, index, moduleData) {
  const fixed = { ...question };

  // Fixer les champs manquants de base
  if (!fixed.id) fixed.id = `q${index + 1}`;
  if (!fixed.difficulty) fixed.difficulty = moduleData.difficulty;
  if (!fixed.points) fixed.points = 10;
  if (!fixed.timeLimit) fixed.timeLimit = 30;
  if (!fixed.tags || fixed.tags.length === 0) {
    fixed.tags = moduleData.topics.slice(0, 3);
  }

  // Cas spécifique: true-false sans options
  if (fixed.type === 'true-false') {
    fixed.options = ['Faux', 'Vrai'];
    // S'assurer que correctAnswer est 0 ou 1
    if (fixed.correctAnswer !== 0 && fixed.correctAnswer !== 1) {
      console.warn(`⚠️ Question ${index + 1}: correctAnswer invalide pour true-false, défaut à 1 (Vrai)`);
      fixed.correctAnswer = 1;
    }
  }

  // Cas spécifique: multiple-choice sans options
  if (
    (fixed.type === 'multiple-choice' ||
     fixed.type === 'code-completion' ||
     fixed.type === 'code-debugging') &&
    (!fixed.options || fixed.options.length < 2)
  ) {
    // Impossible de corriger sans options valides
    console.error(`❌ Question ${index + 1}: Impossible de générer des options automatiquement`);
    return null;
  }

  // Vérifier les champs critiques non-corrigeables
  if (!fixed.question || !fixed.explanation) {
    return null;
  }

  return fixed;
}

/**
 * Générer un quiz pour un module donné
 */
export async function generateQuiz(moduleData) {
  try {
    console.log(`Génération du quiz pour: ${moduleData.title}`);

    // Créer une instance du modèle avec configuration de sortie structurée
    const model = getGenerativeModel(ai, {
      model: 'gemini-2.5-flash', // Modèle optimal pour génération rapide
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema,
        temperature: 0.8, // Un peu de créativité pour varier les questions
        topP: 0.95,
        topK: 40,
      },
    });

    const prompt = buildPrompt(moduleData);

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parser le JSON
    const quizData = JSON.parse(text);

    console.log(`✅ Quiz généré: ${quizData.questions.length} questions`);

    // Valider et corriger les questions
    const validatedQuestions = validateAndFixQuestions(quizData.questions, moduleData);

    console.log(`✅ Validation terminée: ${validatedQuestions.length} questions valides`);

    // Normaliser les questions validées
    const normalizedQuestions = validatedQuestions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      type: q.type,
      difficulty: q.difficulty || moduleData.difficulty,
      question: q.question,
      code: q.code || null,
      options: q.options || (q.type === 'true-false' ? ['Faux', 'Vrai'] : []),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points || 10,
      timeLimit: q.timeLimit || 30,
      tags: q.tags || moduleData.topics.slice(0, 3),
    }));

    return {
      moduleId: moduleData.id,
      questions: normalizedQuestions,
      generatedAt: new Date().toISOString(),
      model: 'gemini-2.5-flash',
    };

  } catch (error) {
    console.error('Erreur lors de la génération du quiz:', error);
    throw new Error(`Impossible de générer le quiz: ${error.message}`);
  }
}

/**
 * Service de cache intelligent pour éviter de régénérer les quiz
 * Durées adaptatives selon l'état du quiz
 */
const CACHE_KEY_PREFIX = 'quiz-cache-';
const CACHE_STATE_PREFIX = 'quiz-state-';

// Durées de cache intelligentes
const CACHE_DURATIONS = {
  ACTIVE_SESSION: 30 * 60 * 1000,      // 30 min - Quiz en cours
  COMPLETED: 2 * 60 * 60 * 1000,       // 2 heures - Quiz terminé
  DEFAULT: 2 * 60 * 60 * 1000,         // 2 heures - Par défaut
};

/**
 * États possibles d'un quiz
 */
export const QuizState = {
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  IDLE: 'idle',
};

/**
 * Obtenir l'état actuel d'un quiz
 */
export function getQuizState(moduleId) {
  try {
    const stateKey = CACHE_STATE_PREFIX + moduleId;
    const state = localStorage.getItem(stateKey);
    return state ? JSON.parse(state) : { status: QuizState.IDLE, updatedAt: Date.now() };
  } catch {
    return { status: QuizState.IDLE, updatedAt: Date.now() };
  }
}

/**
 * Mettre à jour l'état d'un quiz
 */
export function setQuizState(moduleId, status, additionalData = {}) {
  try {
    const stateKey = CACHE_STATE_PREFIX + moduleId;
    const stateData = {
      status,
      updatedAt: Date.now(),
      ...additionalData,
    };
    localStorage.setItem(stateKey, JSON.stringify(stateData));
    console.log(`🔄 État du quiz mis à jour: ${moduleId} → ${status}`);
  } catch (error) {
    console.error('Erreur mise à jour état:', error);
  }
}

/**
 * Obtenir la durée de cache appropriée selon l'état
 */
function getCacheDuration(moduleId) {
  const state = getQuizState(moduleId);

  switch (state.status) {
    case QuizState.IN_PROGRESS:
      return CACHE_DURATIONS.ACTIVE_SESSION;
    case QuizState.COMPLETED:
      return CACHE_DURATIONS.COMPLETED;
    default:
      return CACHE_DURATIONS.DEFAULT;
  }
}

export function getCachedQuiz(moduleId) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + moduleId;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const now = Date.now();
    const cacheDuration = getCacheDuration(moduleId);

    // Vérifier si le cache est expiré selon l'état
    if (now - cacheData.cachedAt > cacheDuration) {
      localStorage.removeItem(cacheKey);
      console.log(`⏰ Cache expiré (${cacheDuration / 1000 / 60}min): ${moduleId}`);
      return null;
    }

    const state = getQuizState(moduleId);
    console.log(`📦 Quiz chargé depuis le cache: ${moduleId} [${state.status}]`);
    return cacheData.quiz;

  } catch (error) {
    console.error('Erreur lecture cache:', error);
    return null;
  }
}

export function cacheQuiz(moduleId, quiz, initialState = QuizState.IDLE) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + moduleId;
    const cacheData = {
      quiz,
      cachedAt: Date.now(),
      version: 1,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    setQuizState(moduleId, initialState);

    const duration = getCacheDuration(moduleId);
    console.log(`💾 Quiz mis en cache: ${moduleId} (expire dans ${duration / 1000 / 60}min)`);

  } catch (error) {
    console.error('Erreur mise en cache:', error);
  }
}

/**
 * Obtenir ou générer un quiz (avec cache)
 */
export async function getOrGenerateQuiz(moduleData) {
  // Essayer de charger depuis le cache
  const cached = getCachedQuiz(moduleData.id);
  if (cached) {
    return cached;
  }

  // Générer nouveau quiz
  const quiz = await generateQuiz(moduleData);

  // Mettre en cache
  cacheQuiz(moduleData.id, quiz);

  return quiz;
}

/**
 * Vider le cache d'un module spécifique
 */
export function clearQuizCache(moduleId) {
  const cacheKey = CACHE_KEY_PREFIX + moduleId;
  const stateKey = CACHE_STATE_PREFIX + moduleId;
  localStorage.removeItem(cacheKey);
  localStorage.removeItem(stateKey);
  console.log(`🗑️ Cache vidé: ${moduleId}`);
}

/**
 * Forcer la régénération d'un nouveau quiz
 * Utile pour le bouton "Nouveau quiz"
 */
export async function regenerateQuiz(moduleData) {
  console.log(`🔄 Régénération forcée du quiz: ${moduleData.title}`);

  // Vider le cache existant
  clearQuizCache(moduleData.id);

  // Générer un nouveau quiz
  const quiz = await generateQuiz(moduleData);

  // Mettre en cache avec état IDLE
  cacheQuiz(moduleData.id, quiz, QuizState.IDLE);

  return quiz;
}

/**
 * Vider tout le cache des quiz
 */
export function clearAllQuizCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX) || key.startsWith(CACHE_STATE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  console.log('🗑️ Tout le cache des quiz a été vidé');
}
