# Système de Validation des Quiz

## Problème Résolu

Prévenir les cas où des questions à choix multiples sont générées **sans options de sélection**, ce qui bloque l'utilisateur et rend le quiz injouable.

## Solution Multi-Niveaux

### Niveau 1: Validation Côté Serveur (geminiQuiz.js)

#### Validation Stricte

Fichier: [src/services/geminiQuiz.js](../src/services/geminiQuiz.js)

Trois fonctions de validation:

1. **`validateQuestion(question, index)`**
   - Vérifie tous les champs obligatoires
   - Validation spécifique par type de question
   - Retourne un tableau d'erreurs

2. **`validateAndFixQuestions(questions, moduleData)`**
   - Valide chaque question
   - Tente une correction automatique
   - Rejette le quiz si < 70% de questions valides

3. **`attemptAutoFix(question, index, moduleData)`**
   - Correction automatique des erreurs simples
   - Remplit les champs manquants
   - Retourne `null` si impossible de corriger

#### Règles de Validation

##### Questions Multiple-Choice / Code-Completion / Code-Debugging

```javascript
// REQUIS
- options: Array avec minimum 2 éléments
- correctAnswer: number entre 0 et options.length - 1
- question: string non vide
- explanation: string non vide

// VÉRIFIÉ
✓ options est un tableau
✓ options contient au moins 2 éléments
✓ Toutes les options sont non vides
✓ correctAnswer est dans les limites valides
```

##### Questions True-False

```javascript
// REQUIS
- correctAnswer: 0 (Faux) ou 1 (Vrai)
- options: automatiquement fixé à ['Faux', 'Vrai']

// AUTO-FIX
✓ Si options manquantes → ['Faux', 'Vrai']
✓ Si correctAnswer invalide → défaut à 1 (Vrai)
```

#### Exemple de Logs

```
✅ Quiz généré: 12 questions
⚠️ Problèmes détectés: ["Question 3: options manquantes"]
✅ Question 3 corrigée automatiquement
❌ Question 7: Impossible de générer des options automatiquement
✅ Validation terminée: 11 questions valides
```

### Niveau 2: Validation Côté Client (quizValidator.js)

Fichier: [src/utils/quizValidator.js](../src/utils/quizValidator.js)

#### Fonctions Disponibles

##### validateQuizQuestion(question, index)

Valide une question individuelle.

```javascript
const result = validateQuizQuestion(question, 0);
// {
//   valid: false,
//   issues: [
//     { severity: 'error', field: 'options', message: 'Options manquantes' }
//   ],
//   questionIndex: 0
// }
```

##### validateQuiz(quiz)

Valide un quiz complet.

```javascript
const result = validateQuiz(quiz);
// {
//   valid: true,
//   totalQuestions: 12,
//   validQuestions: 12,
//   invalidQuestions: 0,
//   warningCount: 2,
//   questionResults: [...],
//   errors: [],
//   warnings: [...]
// }
```

##### isQuestionPlayable(question)

Vérification rapide si une question peut être jouée.

```javascript
const playable = isQuestionPlayable(question);
// true/false - critères minimaux pour jouer
```

##### getPlayableQuestions(quiz)

Filtre pour ne garder que les questions jouables.

```javascript
const playable = getPlayableQuestions(quiz);
// [...questions valides uniquement]
```

##### getValidationReport(validationResult)

Rapport textuel détaillé.

```javascript
const report = getValidationReport(validationResult);
console.log(report);
/*
📊 Rapport de Validation du Quiz
─────────────────────────────────
Total: 12 questions
✅ Valides: 11
❌ Invalides: 1
⚠️  Avertissements: 2

❌ ERREURS CRITIQUES:
  Question 7:
    • options: Options manquantes pour multiple-choice

⚠️  AVERTISSEMENTS:
  Question 3:
    • options: Moins de 4 options (3/4 recommandé)
*/
```

### Niveau 3: Hook React (useQuizValidation)

Fichier: [src/hooks/useQuizValidation.js](../src/hooks/useQuizValidation.js)

#### Utilisation

```javascript
import { useQuizValidation } from '../hooks/useQuizValidation';

function QuizPlayer({ quiz }) {
  const {
    validation,
    playableQuestions,
    stats,
    report,
    hasCriticalErrors,
    hasEnoughQuestions,
    isUsable,
  } = useQuizValidation(quiz);

  if (!isUsable) {
    return (
      <Alert severity="error">
        Ce quiz contient des erreurs et ne peut pas être joué.
        {report && <pre>{report}</pre>}
      </Alert>
    );
  }

  // Utiliser playableQuestions au lieu de quiz.questions
  return (
    <div>
      {playableQuestions.map((q, index) => (
        <QuizQuestion key={q.id} question={q} index={index} />
      ))}
    </div>
  );
}
```

#### Propriétés Retournées

```typescript
{
  validation: ValidationResult | null;
  playableQuestions: Question[];
  stats: {
    total: number;
    playable: number;
    broken: number;
    byType: Record<string, number>;
  } | null;
  report: string | null;
  hasCriticalErrors: boolean;
  hasEnoughQuestions: boolean;
  isUsable: boolean;
}
```

## Stratégie de Défense en Profondeur

### 1. Prévention (Prompt Engineering)

Le prompt Gemini insiste sur la nécessité des options:

```javascript
**multiple-choice:** QCM avec 4 options
- correctAnswer: index de la bonne réponse (0-3)
- options: array de 4 chaînes de caractères  // ← EXPLICIT

**CONTRAINTES IMPORTANTES:**
4. Pour les questions à choix multiples, assure-toi que les distracteurs sont plausibles
```

### 2. Détection Précoce (Validation Serveur)

Lors de la génération:
- Validation immédiate après parsing JSON
- Tentative de correction automatique
- Rejet si trop d'erreurs (< 70% valides)

### 3. Double Vérification (Validation Client)

Avant affichage à l'utilisateur:
- Re-validation complète du quiz
- Filtrage des questions non jouables
- Rapport d'erreurs détaillé

### 4. Protection Finale (isUsable)

```javascript
const isUsable = !hasCriticalErrors && hasEnoughQuestions;
// hasCriticalErrors: erreurs bloquantes
// hasEnoughQuestions: au moins 70% de questions valides
```

## Gestion des Erreurs

### Erreur de Génération

```javascript
try {
  const quiz = await generateQuiz(moduleData);
} catch (error) {
  if (error.message.includes('Trop de questions invalides')) {
    // Proposer de régénérer
    toast.error('Quiz invalide. Veuillez régénérer.');
  }
}
```

### Erreur de Validation Client

```javascript
const { isUsable, report } = useQuizValidation(quiz);

if (!isUsable) {
  console.error('Quiz invalide:', report);
  // Afficher message d'erreur
  // Proposer de régénérer
  // Ou charger depuis le cache si disponible
}
```

## Exemples de Cas Gérés

### Cas 1: Multiple-Choice Sans Options

**Problème**:
```json
{
  "type": "multiple-choice",
  "question": "Quelle est la différence...",
  "options": [],  // ❌ VIDE
  "correctAnswer": 0
}
```

**Solution**:
```
❌ Question 1: Impossible de générer des options automatiquement
→ Question rejetée
→ Si < 70% de questions valides → Quiz rejeté
```

### Cas 2: True-False avec correctAnswer Invalide

**Problème**:
```json
{
  "type": "true-false",
  "question": "Flutter utilise Dart?",
  "correctAnswer": 5  // ❌ Devrait être 0 ou 1
}
```

**Solution**:
```
⚠️ Question 2: correctAnswer invalide pour true-false, défaut à 1 (Vrai)
✅ Question 2 corrigée automatiquement
→ correctAnswer: 1
→ options: ['Faux', 'Vrai']
```

### Cas 3: Options Partiellement Vides

**Problème**:
```json
{
  "type": "multiple-choice",
  "question": "Quel widget...",
  "options": ["StatelessWidget", "", "Container", null],
  "correctAnswer": 0
}
```

**Solution**:
```
❌ Question 3: Option 2 est vide
❌ Question 3: Option 4 est vide
→ Question rejetée
```

## Métriques de Qualité

### Seuils de Validation

```javascript
const QUALITY_THRESHOLDS = {
  MIN_VALID_QUESTIONS: 0.7,  // 70% minimum
  MIN_OPTIONS_COUNT: 2,       // Minimum pour QCM
  RECOMMENDED_OPTIONS: 4,     // Recommandé pour QCM
};
```

### Logging

```javascript
console.log(`✅ Quiz généré: ${total} questions`);
console.log(`✅ Validation terminée: ${valid}/${total} questions valides`);
console.log(`⚠️  ${warnings.length} avertissements`);
console.log(`❌ ${errors.length} erreurs critiques`);
```

## Testing

### Test Unitaire (Validation)

```javascript
describe('validateQuestion', () => {
  it('rejette multiple-choice sans options', () => {
    const question = {
      type: 'multiple-choice',
      question: 'Test?',
      options: [],
      correctAnswer: 0,
    };

    const result = validateQuestion(question, 0);
    expect(result.some(e => e.includes('options'))).toBe(true);
  });

  it('accepte true-false valide', () => {
    const question = {
      type: 'true-false',
      question: 'Test?',
      correctAnswer: 1,
      explanation: 'Parce que...',
    };

    const result = validateQuestion(question, 0);
    expect(result.length).toBe(0);
  });
});
```

### Test d'Intégration

```javascript
describe('Quiz Generation with Validation', () => {
  it('rejette quiz avec trop d\'erreurs', async () => {
    const moduleData = { /* ... */ };

    await expect(generateQuiz(moduleData)).rejects.toThrow(
      'Trop de questions invalides'
    );
  });
});
```

## Debugging

### Activer les Logs Détaillés

```javascript
// Dans geminiQuiz.js
console.log('📋 Questions reçues:', quizData.questions);
console.log('✅ Questions validées:', validatedQuestions);
console.log('⚠️  Erreurs:', allErrors);
```

### Inspecter la Validation

```javascript
const validation = validateQuiz(quiz);
console.log(getValidationReport(validation));
```

## Recommandations

1. **Toujours utiliser `playableQuestions`** au lieu de `quiz.questions`
2. **Vérifier `isUsable`** avant d'afficher le quiz
3. **Logger les erreurs** pour améliorer le prompt Gemini
4. **Proposer régénération** si quiz invalide
5. **Monitorer les taux** de questions invalides

## Améliorations Futures

- [ ] Retry automatique si < 70% de questions valides
- [ ] Génération d'options par IA si manquantes
- [ ] Metriques de qualité par type de question
- [ ] Dashboard de monitoring des erreurs
- [ ] A/B testing de différents prompts
