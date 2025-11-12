# Architecture MVC - Système de Quiz Formation Flutter Avancée

## Document Technique - Plateforme d'Évaluation Progressive

---

## Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Architecture MVC Adaptée](#2-architecture-mvc-adaptée)
3. [Structure des Modules et Quiz](#3-structure-des-modules-et-quiz)
4. [Système de Validation Progressive](#4-système-de-validation-progressive)
5. [Stockage Local et Migration Cloud](#5-stockage-local-et-migration-cloud)
6. [Génération Automatique avec Gemini API](#6-génération-automatique-avec-gemini-api)
7. [Modèles de Données](#7-modèles-de-données)
8. [Flow Utilisateur](#8-flow-utilisateur)
9. [Implémentation Technique](#9-implémentation-technique)

---

## 1. Vue d'Ensemble

### 1.1 Objectif du Système

Le système de quiz permet aux participants de la **Formation Développeur Mobile Avancé** de :

- **Évaluer progressivement** leurs connaissances à chaque module
- **Valider leur progression** avant d'accéder au module suivant
- **Obtenir un feedback immédiat** sur leurs réponses
- **Suivre leurs performances** dans le temps
- **Débloquer des modules** en atteignant un score minimum

### 1.2 Contraintes et Exigences

**Contraintes techniques :**
- Version 1 : Stockage 100% local (LocalStorage)
- Version 2 : Migration progressive vers Cloud Firestore
- Génération automatique des questions via Gemini API
- Interface cohérente avec le site principal 00auth.dev

**Exigences pédagogiques :**
- Score minimum de **70%** pour débloquer le module suivant
- Possibilité de retenter un quiz illimitée (mode apprentissage)
- Feedback détaillé avec explications pour chaque question
- Progression visible et motivante

### 1.3 Modules de la Formation

D'après le document **Formation - Developpeur Flutter Advanced.md**, la formation comprend **3 grands modules** avec plusieurs sous-modules :

#### **Module 1 : Introduction au développement mobile cross-platform**
- Introduction à la programmation avec Dart
- Initiation au développement mobile avec Flutter
- Notions de base des composants (StatelessWidget, StatefulWidget)
- Création des interfaces
- Navigation entre écrans
- Gestion du thème et ressources

**Bonus Module 1 :**
- Navigator 1.0 vs GoRouter vs Navigator 2.0

#### **Module 2 : Développement mobile Flutter - Notions Intermédiaires**
- Création d'interfaces riches
- Animations (Implicit & Explicit)
- Gestion d'état (InheritedWidget, ValueNotifier, Provider, Riverpod, Bloc)
- Architecture (MVVM, Clean Architecture, SOLID)
- Notions avancées Dart (POO, Gestion erreurs, Programmation fonctionnelle/asynchrone)
- Interaction APIs et Stockage de données

**Bonus Module 2 :**
- Mason & Bricks templates
- Isolates et Google Maps Lite
- Mini WhatsApp avec notifications temps réel

#### **Module 3 : Développement mobile Flutter - Notions Avancées**
- Production de l'application (Icône, Splash, Flavours, Obfuscation)
- Publication App Store / Play Store
- CI/CD (CodeMagic, GitHub Actions, GitLab CI)
- Qualité de code (Analyse, Lints, Tests)
- Performance (Flutter DevTools, Memory analysis)

**Bonus Module 3 :**
- FVM (Flutter Version Management)
- Publication automatisée Play Store
- Internationalisation
- Monétisation

---

## 2. Architecture MVC Adaptée

### 2.1 Pattern MVC dans React

Bien que React utilise principalement le pattern **Component-Based**, nous adaptons MVC ainsi :

```
┌─────────────────────────────────────────────────────────┐
│                         VIEW                             │
│  (Composants React - Interface Utilisateur)             │
│                                                           │
│  QuizDashboard → ModuleList → QuizSession → Results     │
│       ↓              ↓             ↓            ↓         │
│  QuestionCard, ProgressBar, Timer, Feedback              │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                      CONTROLLER                          │
│  (Hooks + Store Zustand - Logique Métier)               │
│                                                           │
│  useQuizStore → Actions: startQuiz, answerQuestion,      │
│                          calculateScore, unlockModule    │
│                                                           │
│  useModuleProgress → Getters: getModuleStatus,           │
│                               canAccessModule            │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                        MODEL                             │
│  (Services + Data Layer)                                 │
│                                                           │
│  LocalStorageService → CRUD progression utilisateur      │
│  GeminiQuizService → Génération questions automatique    │
│  ModulesDataService → Chargement structure formation     │
│  FirestoreService → Sync cloud (Version 2)               │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Séparation des Responsabilités

**Model (Données) :**
- `services/localStorage.js` - Gestion persistence locale
- `services/geminiQuiz.js` - Génération questions IA
- `services/modulesData.js` - Structure des modules
- `services/firestore.js` - Sync cloud (V2)
- `models/` - Définitions TypeScript/JSDoc

**Controller (Logique) :**
- `stores/quizStore.js` - État global Zustand
- `hooks/useQuizSession.js` - Logique session quiz
- `hooks/useModuleProgress.js` - Gestion progression
- `utils/scoring.js` - Calculs de scores
- `utils/validation.js` - Règles de validation

**View (Interface) :**
- `pages/` - Pages principales
- `components/` - Composants réutilisables
- `layouts/` - Structures de mise en page

---

## 3. Structure des Modules et Quiz

### 3.1 Organisation Hiérarchique

```
Formation Flutter Avancée
│
├── Module 1: Introduction (6 sous-modules)
│   ├── 1.1 Introduction Dart
│   │   └── Quiz 1.1 (10 questions)
│   ├── 1.2 Initiation Flutter
│   │   └── Quiz 1.2 (12 questions)
│   ├── 1.3 Composants de base
│   │   └── Quiz 1.3 (15 questions)
│   ├── 1.4 Création interfaces
│   │   └── Quiz 1.4 (10 questions)
│   ├── 1.5 Navigation
│   │   └── Quiz 1.5 (12 questions)
│   ├── 1.6 Thème et ressources
│   │   └── Quiz 1.6 (8 questions)
│   └── BONUS 1 (optionnel)
│       └── Quiz Bonus 1 (5 questions)
│
├── Module 2: Intermédiaire (6 sous-modules + bonus)
│   ├── 2.1 Interfaces riches
│   ├── 2.2 Animations
│   ├── 2.3 Gestion d'état
│   ├── 2.4 Architecture
│   ├── 2.5 Notions avancées Dart
│   ├── 2.6 APIs et Stockage
│   └── BONUS 2.1, 2.2, 2.3
│
└── Module 3: Avancé (2 sous-modules + bonus)
    ├── 3.1 Production
    ├── 3.2 Qualité de code
    └── BONUS 3.1, 3.2, 3.3, 3.4
```

### 3.2 Mapping avec le Document Formation

Chaque sous-module du document `Formation - Developpeur Flutter Advanced.md` devient un **quiz indépendant**.

**Exemple Module 1.3 - Composants de base :**

```javascript
{
  id: "module-1-3-composants",
  title: "Notions de bases des composants en Flutter",
  parentModule: "module-1-intro",
  topics: [
    "Déclarative UI",
    "Cycle de vie des composants",
    "StatelessWidget vs StatefulWidget",
    "Widget tree & Element tree",
    "BuildContext"
  ],
  minimumScore: 70,
  questionCount: 15,
  estimatedTime: 20, // minutes
  difficulty: "beginner"
}
```

### 3.3 Types de Questions par Module

**Module 1 (Introduction) :**
- Multiple choice (60%)
- True/False (30%)
- Code completion (10%)

**Module 2 (Intermédiaire) :**
- Multiple choice (40%)
- Code completion (30%)
- Code debugging (20%)
- Ordering/Matching (10%)

**Module 3 (Avancé) :**
- Multiple choice (30%)
- Code debugging (30%)
- Code completion (25%)
- Scenario-based (15%)

---

## 4. Système de Validation Progressive

### 4.1 Règles de Déblocage

**Règle 1 : Score Minimum**
- Un quiz est **validé** si score ≥ 70%
- Score < 70% → Quiz peut être retenté
- Nombre de tentatives illimité

**Règle 2 : Séquentialité**
```
Module 1.1 [✓ validé 85%]
    ↓
Module 1.2 [🔓 débloqué] ← accessible
    ↓
Module 1.3 [🔒 verrouillé] ← pas encore accessible
```

**Règle 3 : Modules Bonus**
- Débloqués automatiquement après validation du module parent
- Score non requis pour progression (optionnels)
- Mais comptabilisés dans statistiques globales

**Règle 4 : Passage au Module Suivant**
```
Module 1 validé = Tous les sous-modules obligatoires à 70%+
  → Module 2 débloqué
```

### 4.2 Algorithme de Calcul

```javascript
// Pseudo-code
function canAccessModule(moduleId, userProgress) {
  const module = getModuleById(moduleId);

  // Module 1.1 toujours accessible
  if (module.isFirst) return true;

  // Vérifier si module précédent validé
  const previousModule = getPreviousModule(moduleId);
  const previousScore = userProgress[previousModule.id]?.bestScore || 0;

  return previousScore >= module.minimumScore;
}

function isModuleGroupCompleted(moduleGroupId, userProgress) {
  const subModules = getRequiredSubModules(moduleGroupId);

  return subModules.every(sub => {
    const score = userProgress[sub.id]?.bestScore || 0;
    return score >= sub.minimumScore;
  });
}
```

### 4.3 Feedback Visuel de Progression

**États des modules :**

```javascript
const MODULE_STATUS = {
  LOCKED: 'locked',           // 🔒 Gris, non cliquable
  UNLOCKED: 'unlocked',       // 🔓 Bleu, cliquable
  IN_PROGRESS: 'in_progress', // ⏳ Jaune, score < 70%
  COMPLETED: 'completed',     // ✅ Vert, score ≥ 70%
  PERFECT: 'perfect'          // ⭐ Or, score = 100%
};
```

**Interface Dashboard :**
```
┌─────────────────────────────────────────────────┐
│  Module 1: Introduction                         │
│  ━━━━━━━━━━━━━━━ 83% (5/6 validés)              │
│                                                  │
│  ✅ 1.1 Dart (85%)        ✅ 1.2 Flutter (92%)   │
│  ✅ 1.3 Composants (78%)  ⏳ 1.4 Interfaces (65%)│
│  🔒 1.5 Navigation        🔒 1.6 Thème           │
└─────────────────────────────────────────────────┘
```

---

## 5. Stockage Local et Migration Cloud

### 5.1 Version 1 - LocalStorage (MVP)

**Structure de données LocalStorage :**

```javascript
// Clé: 'flutterQuizProgress'
{
  userId: "local-user-" + UUID, // ID généré localement
  lastSync: null, // Pas encore synchronisé

  modules: {
    "module-1-1-dart": {
      status: "completed",
      attempts: [
        {
          attemptNumber: 1,
          date: "2025-01-10T14:30:00Z",
          score: 60,
          totalQuestions: 10,
          correctAnswers: 6,
          timeSpent: 420, // secondes
          answers: {
            "q1": { selected: 0, correct: true },
            "q2": { selected: 2, correct: false },
            // ...
          }
        },
        {
          attemptNumber: 2,
          date: "2025-01-11T10:15:00Z",
          score: 85,
          totalQuestions: 10,
          correctAnswers: 8.5,
          timeSpent: 380
        }
      ],
      bestScore: 85,
      lastAttemptDate: "2025-01-11T10:15:00Z",
      completedAt: "2025-01-11T10:15:00Z"
    }
  },

  globalStats: {
    totalModulesCompleted: 5,
    totalQuizzesTaken: 12,
    averageScore: 78,
    totalTimeSpent: 3600,
    currentStreak: 3, // jours consécutifs
    longestStreak: 7
  }
}
```

**Service LocalStorage :**

```javascript
// services/localStorage.js
class LocalStorageService {
  STORAGE_KEY = 'flutterQuizProgress';

  getProgress() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : this.createDefaultProgress();
  }

  saveModuleAttempt(moduleId, attemptData) {
    const progress = this.getProgress();

    if (!progress.modules[moduleId]) {
      progress.modules[moduleId] = {
        status: 'in_progress',
        attempts: []
      };
    }

    progress.modules[moduleId].attempts.push(attemptData);

    // Mettre à jour best score
    const scores = progress.modules[moduleId].attempts.map(a => a.score);
    progress.modules[moduleId].bestScore = Math.max(...scores);

    // Mettre à jour statut
    if (progress.modules[moduleId].bestScore >= 70) {
      progress.modules[moduleId].status = 'completed';
      progress.modules[moduleId].completedAt = new Date().toISOString();
    }

    this.saveProgress(progress);
  }

  canAccessModule(moduleId) {
    const progress = this.getProgress();
    const module = modulesData.find(m => m.id === moduleId);

    if (!module.previousModuleId) return true;

    const prevScore = progress.modules[module.previousModuleId]?.bestScore || 0;
    return prevScore >= 70;
  }
}
```

### 5.2 Version 2 - Migration Cloud Firestore

**Structure Firestore :**

```
users/{userId}/
  ├── profile/
  │   ├── email
  │   ├── displayName
  │   └── createdAt
  │
  └── quizProgress/{moduleId}/
      ├── status: "completed"
      ├── bestScore: 85
      ├── lastAttemptDate: Timestamp
      ├── completedAt: Timestamp
      │
      └── attempts (subcollection)
          └── {attemptId}/
              ├── attemptNumber: 2
              ├── date: Timestamp
              ├── score: 85
              ├── totalQuestions: 10
              ├── correctAnswers: 8.5
              ├── timeSpent: 380
              └── answers: Map
```

**Service de Migration :**

```javascript
// services/migration.js
class MigrationService {
  async migrateLocalToCloud(userId) {
    const localData = localStorageService.getProgress();
    const batch = firestore.batch();

    // Créer profil utilisateur
    const userRef = firestore.collection('users').doc(userId);
    batch.set(userRef, {
      localUserId: localData.userId,
      migratedAt: serverTimestamp(),
      email: auth.currentUser.email
    });

    // Migrer chaque module
    Object.entries(localData.modules).forEach(([moduleId, moduleData]) => {
      const moduleRef = userRef.collection('quizProgress').doc(moduleId);

      batch.set(moduleRef, {
        status: moduleData.status,
        bestScore: moduleData.bestScore,
        lastAttemptDate: new Date(moduleData.lastAttemptDate),
        completedAt: moduleData.completedAt ? new Date(moduleData.completedAt) : null
      });

      // Migrer tentatives
      moduleData.attempts.forEach((attempt, index) => {
        const attemptRef = moduleRef.collection('attempts').doc();
        batch.set(attemptRef, {
          ...attempt,
          date: new Date(attempt.date)
        });
      });
    });

    await batch.commit();

    // Marquer comme synchronisé
    localData.lastSync = new Date().toISOString();
    localStorageService.saveProgress(localData);
  }
}
```

**Sync bidirectionnel (optionnel V2.1) :**

```javascript
// Mode offline-first avec sync automatique
class SyncService {
  async syncProgress() {
    if (!navigator.onLine) {
      console.log('Offline - sync postponed');
      return;
    }

    const localData = localStorageService.getProgress();
    const cloudData = await this.fetchCloudProgress();

    // Résolution de conflits : last-write-wins
    const merged = this.mergeProgress(localData, cloudData);

    await this.uploadToCloud(merged);
    localStorageService.saveProgress(merged);
  }
}
```

---

## 6. Génération Automatique avec Gemini API

### 6.1 Intégration Gemini API

**Configuration :**

```javascript
// services/geminiQuiz.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

class GeminiQuizService {
  model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async generateQuiz(moduleData) {
    const prompt = this.buildPrompt(moduleData);
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseQuizJSON(text);
  }
}
```

### 6.2 Prompts de Génération

**Template de prompt :**

```javascript
buildPrompt(moduleData) {
  return `
Tu es un expert en Flutter et en pédagogie. Génère un quiz de validation pour le module suivant :

MODULE: ${moduleData.title}
NIVEAU: ${moduleData.difficulty}
SUJETS COUVERTS:
${moduleData.topics.map(t => `- ${t}`).join('\n')}

CONTRAINTES:
- Générer exactement ${moduleData.questionCount} questions
- ${this.getQuestionTypeDistribution(moduleData)}
- Niveau de difficulté adapté au profil: ${moduleData.difficulty}
- Questions en français
- Chaque question doit tester la compréhension profonde, pas la mémorisation

FORMAT DE SORTIE (JSON strict):
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "difficulty": "medium",
      "question": "Quelle est la différence entre StatelessWidget et StatefulWidget ?",
      "code": null,
      "options": [
        "StatelessWidget peut changer d'état",
        "StatefulWidget ne peut pas changer d'état",
        "StatelessWidget ne peut pas changer d'état",
        "Il n'y a aucune différence"
      ],
      "correctAnswer": 2,
      "explanation": "Un StatelessWidget est immutable et ne peut pas changer son état interne. Un StatefulWidget maintient un état mutable via la classe State associée.",
      "points": 10,
      "timeLimit": 30,
      "tags": ["widgets", "état", "fondamentaux"]
    }
  ]
}

TYPES DE QUESTIONS DISPONIBLES:
- "multiple-choice": Question à choix multiples (1 bonne réponse)
- "true-false": Vrai ou Faux
- "code-completion": Compléter un code
- "code-debugging": Trouver l'erreur dans le code
- "ordering": Remettre dans le bon ordre

GÉNÈRE MAINTENANT LE QUIZ EN JSON:
`;
}

getQuestionTypeDistribution(moduleData) {
  const distributions = {
    beginner: "70% multiple-choice, 20% true-false, 10% code-completion",
    intermediate: "40% multiple-choice, 30% code-completion, 20% code-debugging, 10% ordering",
    advanced: "30% multiple-choice, 30% code-debugging, 25% code-completion, 15% scenario"
  };

  return distributions[moduleData.difficulty] || distributions.beginner;
}
```

### 6.3 Parsing et Validation

```javascript
parseQuizJSON(text) {
  // Extraire JSON du texte (peut contenir du markdown)
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                   text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Invalid response format from Gemini');
  }

  const quiz = JSON.parse(jsonMatch[0].replace(/```json\n?|\n?```/g, ''));

  // Validation
  if (!quiz.questions || !Array.isArray(quiz.questions)) {
    throw new Error('Invalid quiz structure');
  }

  // Ajouter IDs uniques si manquants
  quiz.questions = quiz.questions.map((q, index) => ({
    id: q.id || `q${index + 1}`,
    ...q
  }));

  return quiz;
}
```

### 6.4 Cache et Optimisation

**Éviter de régénérer à chaque fois :**

```javascript
class QuizCacheService {
  CACHE_KEY_PREFIX = 'quiz-cache-';
  CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours

  async getOrGenerateQuiz(moduleId, moduleData) {
    const cached = this.getCachedQuiz(moduleId);

    if (cached && !this.isCacheExpired(cached)) {
      console.log('Using cached quiz for', moduleId);
      return cached.quiz;
    }

    console.log('Generating new quiz for', moduleId);
    const quiz = await geminiQuizService.generateQuiz(moduleData);

    this.cacheQuiz(moduleId, quiz);
    return quiz;
  }

  cacheQuiz(moduleId, quiz) {
    const cacheData = {
      quiz,
      generatedAt: Date.now(),
      version: 1
    };

    localStorage.setItem(
      this.CACHE_KEY_PREFIX + moduleId,
      JSON.stringify(cacheData)
    );
  }
}
```

### 6.5 Fallback Questions

**En cas d'échec de l'API :**

```javascript
// data/fallbackQuestions.js
export const fallbackQuestions = {
  "module-1-1-dart": {
    questions: [
      // Questions pré-générées manuellement
    ]
  }
};

// Dans le service
async generateQuizWithFallback(moduleId, moduleData) {
  try {
    return await this.generateQuiz(moduleData);
  } catch (error) {
    console.error('Gemini API error, using fallback:', error);

    if (fallbackQuestions[moduleId]) {
      return fallbackQuestions[moduleId];
    }

    throw new Error('No quiz available for this module');
  }
}
```

---

## 7. Modèles de Données

### 7.1 Module

```javascript
/**
 * @typedef {Object} Module
 * @property {string} id - Identifiant unique (ex: "module-1-1-dart")
 * @property {string} title - Titre du module
 * @property {string} description - Description courte
 * @property {string} parentModuleId - ID du module parent (ex: "module-1-intro")
 * @property {string|null} previousModuleId - Module précédent requis
 * @property {string[]} topics - Liste des sujets couverts
 * @property {'beginner'|'intermediate'|'advanced'} difficulty - Niveau
 * @property {number} minimumScore - Score minimum pour validation (70)
 * @property {number} questionCount - Nombre de questions
 * @property {number} estimatedTime - Temps estimé en minutes
 * @property {boolean} isBonus - Module bonus optionnel
 * @property {boolean} isFirst - Premier module (toujours accessible)
 * @property {number} order - Ordre d'affichage
 */
```

### 7.2 Question

```javascript
/**
 * @typedef {Object} Question
 * @property {string} id - ID unique
 * @property {'multiple-choice'|'true-false'|'code-completion'|'code-debugging'|'ordering'} type
 * @property {'easy'|'medium'|'hard'} difficulty
 * @property {string} question - Énoncé de la question
 * @property {string|null} code - Code à afficher (si applicable)
 * @property {string[]|null} options - Options de réponse (pour multiple-choice)
 * @property {number|boolean|string} correctAnswer - Réponse correcte
 * @property {string} explanation - Explication de la réponse
 * @property {number} points - Points attribués
 * @property {number} timeLimit - Temps limite en secondes
 * @property {string[]} tags - Tags pour classification
 */
```

### 7.3 Quiz Attempt

```javascript
/**
 * @typedef {Object} QuizAttempt
 * @property {number} attemptNumber - Numéro de la tentative
 * @property {string} date - Date ISO 8601
 * @property {number} score - Score obtenu (0-100)
 * @property {number} totalQuestions - Nombre total de questions
 * @property {number} correctAnswers - Nombre de bonnes réponses
 * @property {number} timeSpent - Temps total en secondes
 * @property {Object.<string, AnswerData>} answers - Réponses détaillées
 */

/**
 * @typedef {Object} AnswerData
 * @property {any} selected - Réponse sélectionnée
 * @property {boolean} correct - Correct ou non
 * @property {number} timeSpent - Temps passé sur cette question
 * @property {number} timestamp - Timestamp de réponse
 */
```

### 7.4 User Progress

```javascript
/**
 * @typedef {Object} UserProgress
 * @property {string} userId - ID utilisateur
 * @property {string|null} lastSync - Dernière sync cloud
 * @property {Object.<string, ModuleProgress>} modules - Progression par module
 * @property {GlobalStats} globalStats - Statistiques globales
 */

/**
 * @typedef {Object} ModuleProgress
 * @property {'locked'|'unlocked'|'in_progress'|'completed'|'perfect'} status
 * @property {QuizAttempt[]} attempts - Liste des tentatives
 * @property {number} bestScore - Meilleur score
 * @property {string} lastAttemptDate - Date dernière tentative
 * @property {string|null} completedAt - Date de complétion
 */

/**
 * @typedef {Object} GlobalStats
 * @property {number} totalModulesCompleted - Modules complétés
 * @property {number} totalQuizzesTaken - Quiz tentés
 * @property {number} averageScore - Score moyen
 * @property {number} totalTimeSpent - Temps total (secondes)
 * @property {number} currentStreak - Série actuelle (jours)
 * @property {number} longestStreak - Plus longue série
 * @property {string[]} badges - Badges débloqués
 */
```

---

## 8. Flow Utilisateur

### 8.1 Parcours Complet

```
┌─────────────────┐
│  Landing Page   │
│   /quiz         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Quiz Dashboard  │  ← Affiche tous les modules
│  Progression:   │  ← Barre de progression globale
│  Module 1: 83%  │  ← État de chaque module
│  Module 2: 0%   │
└────────┬────────┘
         │
         ↓ (Click module débloqué)
         │
┌─────────────────┐
│  Module Detail  │  ← Détails du module
│  - Sujets       │  ← Liste des topics
│  - Best: 85%    │  ← Meilleur score
│  - Attempts: 2  │  ← Nombre de tentatives
└────────┬────────┘
         │
         ↓ (Click "Commencer le Quiz")
         │
┌─────────────────┐
│  Quiz Session   │  ← Session de quiz active
│  Q 3/15         │  ← Progression
│  Timer: 0:25    │  ← Countdown
│  [Question]     │  ← Question actuelle
│  [Options]      │  ← Choix de réponses
└────────┬────────┘
         │
         ↓ (Toutes questions répondues)
         │
┌─────────────────┐
│  Results Page   │  ← Résultats détaillés
│  Score: 78%     │  ← Score final
│  ✅ Validé !    │  ← Statut
│  [Revoir]       │  ← Revoir réponses
│  [Suivant]      │  ← Module suivant
└─────────────────┘
```

### 8.2 Cas d'Usage Détaillés

**UC1 : Première visite**
1. User arrive sur `/quiz`
2. Système charge progression depuis LocalStorage (vide)
3. Initialise progression par défaut (Module 1.1 débloqué)
4. Affiche Dashboard avec Module 1.1 accessible

**UC2 : Tenter un quiz**
1. User clique sur module débloqué
2. Page détail affiche infos + bouton "Commencer"
3. Click "Commencer" → vérifie si quiz en cache
4. Si pas en cache → génère via Gemini API
5. Charge questions et démarre session
6. Timer commence, questions s'affichent une par une
7. User répond → sauvegarde réponse + temps
8. Dernière question → calcule score
9. Sauvegarde tentative dans LocalStorage
10. Redirige vers Results

**UC3 : Quiz non validé (score < 70%)**
1. Results affiche score 65%
2. Message: "Score insuffisant. Recommencez !"
3. Bouton "Retenter le quiz"
4. Module reste "in_progress"
5. Module suivant reste verrouillé

**UC4 : Quiz validé (score ≥ 70%)**
1. Results affiche score 78%
2. Animation de célébration (confetti)
3. Message: "Félicitations ! Module validé !"
4. Module passe en "completed"
5. Module suivant se débloque
6. Bouton "Module suivant" apparaît

**UC5 : Migration vers Cloud**
1. User se connecte avec Firebase Auth
2. Système détecte progression locale non synchronisée
3. Propose: "Voulez-vous synchroniser votre progression ?"
4. Si oui → lance migration
5. Copie données LocalStorage → Firestore
6. Marque comme synchronisé
7. Désormais, lecture/écriture sur Firestore

---

## 9. Implémentation Technique

### 9.1 Stack Technique

```javascript
{
  "frontend": {
    "framework": "React 18.2",
    "buildTool": "Vite 4.5",
    "router": "React Router DOM 6.17",
    "ui": "Material-UI 5.14",
    "styling": "@emotion/react + @emotion/styled",
    "stateManagement": "Zustand 4.x",
    "animations": "Framer Motion 10.x",
    "charts": "Recharts 2.x",
    "confetti": "canvas-confetti"
  },
  "backend": {
    "aiGeneration": "Google Gemini API",
    "storageV1": "LocalStorage",
    "storageV2": "Firebase Firestore",
    "auth": "Firebase Authentication",
    "analytics": "Firebase Analytics"
  }
}
```

### 9.2 Zustand Store - Quiz

```javascript
// stores/quizStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useQuizStore = create(
  persist(
    (set, get) => ({
      // État session en cours
      currentSession: null,
      currentQuestionIndex: 0,
      answers: {},
      sessionStartTime: null,

      // Questions chargées
      questions: [],

      // Progression utilisateur (persistée)
      userProgress: {
        userId: null,
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
      },

      // Actions
      initializeUser: () => {
        const userId = get().userProgress.userId || `local-user-${crypto.randomUUID()}`;
        set(state => ({
          userProgress: {
            ...state.userProgress,
            userId
          }
        }));
      },

      startQuizSession: (moduleId, questions) => {
        set({
          currentSession: { moduleId, startedAt: Date.now() },
          questions,
          currentQuestionIndex: 0,
          answers: {},
          sessionStartTime: Date.now()
        });
      },

      answerQuestion: (questionId, answer) => {
        const { questions, currentQuestionIndex } = get();
        const question = questions[currentQuestionIndex];
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

      nextQuestion: () => {
        set(state => ({
          currentQuestionIndex: state.currentQuestionIndex + 1
        }));
      },

      calculateScore: () => {
        const { questions, answers } = get();
        const correctCount = Object.values(answers).filter(a => a.correct).length;
        const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
        const earnedPoints = questions.reduce((sum, q) => {
          return sum + (answers[q.id]?.correct ? q.points : 0);
        }, 0);

        return {
          score: Math.round((earnedPoints / totalPoints) * 100),
          correctCount,
          totalQuestions: questions.length,
          earnedPoints,
          totalPoints
        };
      },

      saveQuizAttempt: (moduleId, results) => {
        set(state => {
          const moduleProgress = state.userProgress.modules[moduleId] || {
            status: 'in_progress',
            attempts: [],
            bestScore: 0
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

          // Mettre à jour statut
          if (results.score >= 70) {
            moduleProgress.status = 'completed';
            moduleProgress.completedAt = newAttempt.date;
          }
          if (results.score === 100) {
            moduleProgress.status = 'perfect';
          }

          return {
            userProgress: {
              ...state.userProgress,
              modules: {
                ...state.userProgress.modules,
                [moduleId]: moduleProgress
              }
            }
          };
        });

        // Réinitialiser session
        set({
          currentSession: null,
          questions: [],
          currentQuestionIndex: 0,
          answers: {},
          sessionStartTime: null
        });
      },

      canAccessModule: (moduleId) => {
        const { userProgress } = get();
        const module = modulesData.find(m => m.id === moduleId);

        if (!module) return false;
        if (module.isFirst) return true;
        if (!module.previousModuleId) return true;

        const prevScore = userProgress.modules[module.previousModuleId]?.bestScore || 0;
        return prevScore >= 70;
      },

      getModuleStatus: (moduleId) => {
        const { userProgress } = get();
        const moduleProgress = userProgress.modules[moduleId];

        if (!moduleProgress) {
          return get().canAccessModule(moduleId) ? 'unlocked' : 'locked';
        }

        return moduleProgress.status;
      }
    }),
    {
      name: 'flutter-quiz-storage',
      partialize: (state) => ({
        userProgress: state.userProgress
      })
    }
  )
);
```

### 9.3 Structure des Dossiers

```
00auth-quiz/
├── public/
│   ├── images/
│   └── documents/
│
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   ├── TrackedButton.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── Quiz/
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── QuestionTypes/
│   │   │   │   ├── MultipleChoice.jsx
│   │   │   │   ├── TrueFalse.jsx
│   │   │   │   ├── CodeCompletion.jsx
│   │   │   │   └── CodeDebugging.jsx
│   │   │   └── ResultsSummary.jsx
│   │   └── Dashboard/
│   │       ├── ModuleCard.jsx
│   │       ├── ProgressOverview.jsx
│   │       └── StatsCards.jsx
│   │
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   │
│   ├── data/
│   │   ├── modules.js
│   │   └── fallbackQuestions.js
│   │
│   ├── hooks/
│   │   ├── useQuizSession.js
│   │   ├── useModuleProgress.js
│   │   └── useAnalytics.js
│   │
│   ├── models/
│   │   ├── Module.js
│   │   ├── Question.js
│   │   └── Progress.js
│   │
│   ├── pages/
│   │   ├── QuizDashboard.jsx
│   │   ├── ModuleDetail.jsx
│   │   ├── QuizSession.jsx
│   │   ├── Results.jsx
│   │   └── Profile.jsx
│   │
│   ├── services/
│   │   ├── localStorage.js
│   │   ├── geminiQuiz.js
│   │   ├── quizCache.js
│   │   ├── firestore.js (V2)
│   │   ├── migration.js (V2)
│   │   └── analytics.js
│   │
│   ├── stores/
│   │   └── quizStore.js
│   │
│   ├── utils/
│   │   ├── scoring.js
│   │   ├── validation.js
│   │   └── dateHelpers.js
│   │
│   ├── config/
│   │   └── firebase.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── docs/
│   ├── PROJET_REFERENCE_QUIZ.md
│   ├── ARCHITECTURE_MVC_QUIZ.md (ce document)
│   └── Formation - Developpeur Flutter Advanced.md
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

### 9.4 Routes

```javascript
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizDashboard />} />
        <Route path="/module/:moduleId" element={<ModuleDetail />} />
        <Route path="/module/:moduleId/quiz" element={<QuizSession />} />
        <Route path="/module/:moduleId/results" element={<Results />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 10. Roadmap de Développement

### Phase 1 - MVP (Semaines 1-3)

**Semaine 1 : Setup et Design**
- [x] Créer projet Vite + React + Yarn
- [x] Copier dossier docs
- [x] Installer dépendances
- [ ] Setup ThemeContext (copié de 00auth-dev)
- [ ] Créer Layout (Navbar, Footer)
- [ ] Créer structure dossiers complète

**Semaine 2 : Données et Logique**
- [ ] Créer modules.js depuis Formation doc
- [ ] Implémenter Zustand store
- [ ] Service LocalStorage
- [ ] Service Gemini Quiz
- [ ] Service QuizCache
- [ ] Logique de scoring et validation

**Semaine 3 : Interface Quiz**
- [ ] Page QuizDashboard
- [ ] Composant ModuleCard
- [ ] Page ModuleDetail
- [ ] Page QuizSession
- [ ] Composants QuestionCard (types basiques)
- [ ] Page Results

### Phase 2 - Amélioration (Semaine 4)

- [ ] Timer par question
- [ ] Animations (Framer Motion)
- [ ] Graphiques résultats (Recharts)
- [ ] Confetti célébration
- [ ] Types questions avancés
- [ ] Système de badges basique

### Phase 3 - Cloud Migration (Semaine 5-6)

- [ ] Firebase Authentication
- [ ] Firestore setup
- [ ] Service Migration
- [ ] Sync bidirectionnelle
- [ ] Tests migration

### Phase 4 - Polish et Déploiement (Semaine 7)

- [ ] Tests utilisateurs
- [ ] Corrections bugs
- [ ] Optimisations performance
- [ ] Documentation utilisateur
- [ ] Déploiement Firebase Hosting

---

## Conclusion

Cette architecture MVC adaptée pour React permet de créer un système de quiz robuste, évolutif et maintenable pour la Formation Flutter Avancée.

**Points clés :**
- ✅ Validation progressive avec déblocage séquentiel
- ✅ Stockage local puis migration cloud
- ✅ Génération automatique via Gemini API
- ✅ Design cohérent avec 00auth.dev
- ✅ Expérience utilisateur motivante

**Prochaines étapes :**
1. Valider cette architecture avec l'équipe
2. Commencer l'implémentation Phase 1
3. Générer les premiers quiz pour Module 1
4. Tests avec utilisateurs beta

---

**Document créé le:** 12 Novembre 2025
**Version:** 1.0
**Auteur:** Documentation Technique - 00auth.dev
**Contact:** contact@00auth.dev
