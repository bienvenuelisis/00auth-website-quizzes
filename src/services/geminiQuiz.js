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

    // Valider et normaliser les questions
    const normalizedQuestions = quizData.questions.map((q, index) => ({
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
 * Service de cache pour éviter de régénérer les quiz
 */
const CACHE_KEY_PREFIX = 'quiz-cache-';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

export function getCachedQuiz(moduleId) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + moduleId;
    const cached = localStorage.getItem(cacheKey);

    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const now = Date.now();

    // Vérifier si le cache est expiré
    if (now - cacheData.cachedAt > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`📦 Quiz chargé depuis le cache: ${moduleId}`);
    return cacheData.quiz;

  } catch (error) {
    console.error('Erreur lecture cache:', error);
    return null;
  }
}

export function cacheQuiz(moduleId, quiz) {
  try {
    const cacheKey = CACHE_KEY_PREFIX + moduleId;
    const cacheData = {
      quiz,
      cachedAt: Date.now(),
      version: 1,
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`💾 Quiz mis en cache: ${moduleId}`);

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
  localStorage.removeItem(cacheKey);
  console.log(`🗑️ Cache vidé: ${moduleId}`);
}

/**
 * Vider tout le cache des quiz
 */
export function clearAllQuizCache() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
  console.log('🗑️ Tout le cache des quiz a été vidé');
}
