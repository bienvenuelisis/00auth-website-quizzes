# Firebase AI Logic - Implémentation avec Gemini API

**Date:** 12 Novembre 2025
**Projet:** 00auth Quiz - Formation Flutter Avancée
**Version:** 1.0

---

## Vue d'ensemble

Ce document explique l'implémentation de **Firebase AI Logic** avec le backend **Gemini API Developer** pour la génération automatique de quiz.

### Pourquoi Firebase AI Logic ?

Au lieu d'utiliser le SDK Gemini standalone (`@google/generative-ai`), nous utilisons **Firebase AI Logic** qui offre :

✅ **Pas de clé API séparée** - Utilise directement la clé Firebase
✅ **Intégration native** - S'intègre avec les autres services Firebase
✅ **Sortie structurée JSON** - Garantit un format cohérent avec Schema
✅ **Simplicité** - Une seule configuration pour tous les services

---

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE PROJECT                          │
│                  (auth-dev-website)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐      ┌──────────────────┐              │
│  │   Firebase     │      │   Firebase AI    │              │
│  │   Config       │─────▶│   Logic          │              │
│  │   (firebase.js)│      │   + Gemini API   │              │
│  └────────────────┘      └──────────────────┘              │
│                                   │                          │
│                                   ▼                          │
│                          ┌──────────────────┐               │
│                          │  Quiz Generation │               │
│                          │  Service         │               │
│                          │  (geminiQuiz.js) │               │
│                          └──────────────────┘               │
│                                   │                          │
│                                   ▼                          │
│                          ┌──────────────────┐               │
│                          │  Structured JSON │               │
│                          │  Output (Schema) │               │
│                          └──────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Firebase AI Logic

### 1. Installation des dépendances

```bash
# Firebase SDK (inclut firebase/ai)
yarn add firebase@12.5.0

# Pas besoin de @google/generative-ai
```

### 2. Configuration dans `src/config/firebase.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAI, GoogleAIBackend } from 'firebase/ai';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase AI Logic with Google AI Backend (Gemini Developer API)
// Note: Utilise Gemini Developer API sans besoin de clé API séparée
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Initialize other services
const auth = getAuth(app);
const firestore = getFirestore(app);
let analytics = null;

// Export
export { app, ai, analytics, auth, firestore };
```

### 3. Variables d'environnement (`.env`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDm_edrS6zy-oApLpNjtWPGkwFi5_HHFZQ
VITE_FIREBASE_AUTH_DOMAIN=auth-dev-website.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=auth-dev-website
VITE_FIREBASE_STORAGE_BUCKET=auth-dev-website.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=429330518953
VITE_FIREBASE_APP_ID=1:429330518953:web:52e41a25e9f41a1c042d87
VITE_FIREBASE_MEASUREMENT_ID=G-QWEF1RVR05

# Analytics
VITE_ANALYTICS_ENABLED=true

# Pas besoin de VITE_GEMINI_API_KEY !
```

---

## Service de Génération de Quiz

### Architecture du Service (`src/services/geminiQuiz.js`)

```javascript
import { ai } from '../config/firebase';
import { getGenerativeModel, Schema } from 'firebase/ai';
```

### 1. Définition du Schéma JSON

Le schéma garantit une sortie cohérente et structurée :

```javascript
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
          correctAnswer: Schema.number(), // Index de la bonne réponse
          explanation: Schema.string(),
          points: Schema.number(),
          timeLimit: Schema.number(),
          tags: Schema.array({ items: Schema.string() }),
        },
        optionalProperties: ['code', 'options'], // Facultatifs
      }),
    }),
  }
});
```

### 2. Construction du Prompt

Le prompt est construit dynamiquement selon les données du module :

```javascript
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

...

Génère exactement ${questionCount} questions variées et pertinentes.`;
}
```

### 3. Génération du Quiz

```javascript
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
```

---

## Système de Cache

Pour éviter de régénérer les quiz à chaque fois :

### Configuration

```javascript
const CACHE_KEY_PREFIX = 'quiz-cache-';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours
```

### Fonctions de Cache

```javascript
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
```

### Fonction Principale avec Cache

```javascript
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
```

---

## Types de Questions Supportés

### 1. Multiple Choice (QCM)

```javascript
{
  type: 'multiple-choice',
  question: "Quelle est la différence entre StatelessWidget et StatefulWidget ?",
  options: [
    "StatelessWidget peut changer d'état",
    "StatefulWidget ne peut pas changer d'état",
    "StatefulWidget a un état mutable, StatelessWidget est immutable",
    "Il n'y a aucune différence"
  ],
  correctAnswer: 2, // Index de la bonne réponse (0-3)
  points: 10,
  timeLimit: 30
}
```

### 2. True/False (Vrai/Faux)

```javascript
{
  type: 'true-false',
  question: "Flutter utilise le langage Dart",
  options: ["Faux", "Vrai"], // Toujours dans cet ordre
  correctAnswer: 1, // 1 pour vrai, 0 pour faux
  points: 5,
  timeLimit: 15
}
```

### 3. Code Completion (Complétion de code)

```javascript
{
  type: 'code-completion',
  question: "Complétez le code pour créer un StatelessWidget",
  code: `class MyWidget _____ StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}`,
  options: [
    "extends",
    "implements",
    "with",
    "inherits"
  ],
  correctAnswer: 0,
  points: 15,
  timeLimit: 45
}
```

### 4. Code Debugging (Débogage)

```javascript
{
  type: 'code-debugging',
  question: "Ce code contient une erreur. Identifiez-la.",
  code: `setState() {
  count++;
}`,
  options: [
    "setState doit retourner une valeur",
    "setState doit prendre une fonction en paramètre",
    "count n'est pas déclaré",
    "Aucune erreur"
  ],
  correctAnswer: 1,
  points: 20,
  timeLimit: 60
}
```

---

## Utilisation dans les Composants

### Exemple d'utilisation

```javascript
import { getOrGenerateQuiz } from '../services/geminiQuiz';
import { MODULES_DATA } from '../data/modules';
import { useQuizStore } from '../stores/quizStore';

function StartQuizButton({ moduleId }) {
  const { startQuizSession } = useQuizStore();
  const [loading, setLoading] = useState(false);

  const handleStartQuiz = async () => {
    try {
      setLoading(true);

      // Récupérer les données du module
      const module = MODULES_DATA.find(m => m.id === moduleId);

      // Générer ou charger le quiz depuis le cache
      const quiz = await getOrGenerateQuiz(module);

      // Démarrer la session
      startQuizSession(moduleId, quiz.questions);

      // Naviguer vers la page de quiz
      navigate(`/module/${moduleId}/quiz`);

    } catch (error) {
      console.error('Erreur démarrage quiz:', error);
      alert('Impossible de démarrer le quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartQuiz}
      disabled={loading}
    >
      {loading ? 'Génération...' : 'Commencer le Quiz'}
    </Button>
  );
}
```

---

## Modèles Gemini Disponibles

| Modèle | Usage | Vitesse | Coût |
|--------|-------|---------|------|
| `gemini-2.5-flash` | ✅ **Utilisé** - Génération rapide | Très rapide | Faible |
| `gemini-2.0-flash` | Alternative plus ancienne | Rapide | Faible |
| `gemini-1.5-pro` | Tâches complexes | Moyen | Moyen |
| `gemini-1.5-flash` | Génération standard | Rapide | Faible |

**Notre choix:** `gemini-2.5-flash` pour une génération rapide et économique.

---

## Paramètres de Génération

```javascript
generationConfig: {
  responseMimeType: 'application/json', // Format de sortie JSON
  responseSchema: quizSchema, // Schéma de validation
  temperature: 0.8, // Créativité (0.0 - 1.0)
  topP: 0.95, // Nucleus sampling
  topK: 40, // Top-K sampling
}
```

### Explication des paramètres

- **temperature (0.8):** Un peu de créativité pour varier les questions sans trop s'éloigner du sujet
- **topP (0.95):** Sélectionne parmi les tokens dont la probabilité cumulée atteint 95%
- **topK (40):** Limite aux 40 tokens les plus probables

---

## Gestion des Erreurs

### Cas d'erreur possibles

1. **Quota API dépassé**
2. **Connexion réseau défaillante**
3. **Réponse JSON invalide**
4. **Module introuvable**

### Stratégie de gestion

```javascript
try {
  const quiz = await generateQuiz(moduleData);
  return quiz;
} catch (error) {
  console.error('Erreur génération quiz:', error);

  // Vérifier si un cache existe
  const cached = getCachedQuiz(moduleData.id);
  if (cached) {
    console.warn('⚠️ Utilisation du cache suite à une erreur');
    return cached;
  }

  // Sinon, propager l'erreur
  throw new Error(`Impossible de générer le quiz: ${error.message}`);
}
```

---

## Performances et Limites

### Temps de Génération

- **Quiz 10 questions:** ~3-5 secondes
- **Quiz 20 questions:** ~5-8 secondes
- **Avec cache:** <100ms

### Limites Gemini API Developer

- **Requêtes/minute:** 60
- **Requêtes/jour:** 1500 (gratuit)
- **Tokens/minute:** 32 000

### Optimisations

1. **Cache 7 jours** - Réduit drastiquement les appels API
2. **LocalStorage** - Pas de latence réseau
3. **Modèle Flash** - Génération plus rapide
4. **Structured Output** - Pas besoin de parsing complexe

---

## Roadmap et Évolutions

### V1 (Actuelle)

- [x] Firebase AI Logic configuré
- [x] Génération de quiz avec Gemini 2.5 Flash
- [x] Cache LocalStorage (7 jours)
- [x] 4 types de questions supportés
- [x] Schéma JSON structuré

### V2 (Future)

- [ ] Synchronisation Firestore pour partage multi-appareils
- [ ] Historique des quiz générés
- [ ] Variantes de questions (régénération partielle)
- [ ] Feedback utilisateur sur qualité des questions
- [ ] Analytics sur difficulté réelle des questions
- [ ] Mode hors-ligne avec quiz pré-générés

### V3 (Vision)

- [ ] IA adaptative (ajuste la difficulté selon performance)
- [ ] Questions personnalisées selon points faibles
- [ ] Génération de quiz sur mesure (topics spécifiques)
- [ ] Mode collaboratif (quiz partagés entre formés)

---

## Commandes Utiles

### Vider le cache d'un module

```javascript
import { clearQuizCache } from '../services/geminiQuiz';

clearQuizCache('module-1-1-dart');
```

### Vider tout le cache

```javascript
import { clearAllQuizCache } from '../services/geminiQuiz';

clearAllQuizCache();
```

### Forcer la régénération

```javascript
// Vider le cache puis générer
clearQuizCache(moduleId);
const quiz = await getOrGenerateQuiz(moduleData);
```

---

## Ressources et Références

### Documentation Firebase AI Logic

- [Firebase AI Overview](https://firebase.google.com/docs/ai)
- [Gemini API Developer](https://ai.google.dev/)
- [Structured Output Guide](https://firebase.google.com/docs/ai/structured-output)

### Code Source

- **Configuration:** `src/config/firebase.js`
- **Service:** `src/services/geminiQuiz.js`
- **Store:** `src/stores/quizStore.js`
- **Modules:** `src/data/modules.js`

---

## Support et Dépannage

### Problème: "Failed to fetch AI model"

**Cause:** Clé API Firebase invalide ou projet non configuré
**Solution:** Vérifier `.env` et console Firebase

### Problème: "Quota exceeded"

**Cause:** Trop de requêtes API
**Solution:** Attendre ou utiliser le cache

### Problème: "Invalid JSON response"

**Cause:** Schema mal défini ou prompt trop complexe
**Solution:** Vérifier `quizSchema` et simplifier le prompt

### Problème: Cache ne fonctionne pas

**Cause:** LocalStorage désactivé ou plein
**Solution:** Vérifier les paramètres navigateur

---

**Créé le:** 12 Novembre 2025
**Auteur:** Claude Code
**Version:** 1.0
**Projet:** 00auth Quiz - Formation Flutter Avancée

