# Bouton de Régénération de Quiz

## Vue d'ensemble

Le bouton "Nouveau Quiz" permet aux utilisateurs de générer un nouveau jeu de questions pour un module, offrant ainsi de la variété dans leurs révisions.

## Emplacement

Le bouton apparaît dans la page de détails du module ([ModuleDetail.jsx](../src/pages/ModuleDetail.jsx)), dans la section "Sujets Couverts", en haut à droite.

## Comportement

### Condition d'Affichage

Le bouton **ne s'affiche que si un quiz existe déjà en cache** pour le module. Cela signifie:
- ✅ Quiz déjà généré et en cache → Bouton visible
- ❌ Aucun quiz en cache → Bouton caché

### Processus de Régénération

1. **Clic sur "Nouveau Quiz"**
   - Ouvre un dialogue de confirmation avec avertissement

2. **Dialogue de Confirmation**
   - Affiche les conséquences de l'action:
     - Génération d'un nouveau jeu de questions
     - Remplacement des questions actuelles
     - Action irréversible
   - Boutons: "Annuler" ou "Régénérer"

3. **Génération**
   - Vide le cache existant
   - Appelle l'API Gemini pour générer de nouvelles questions
   - Met à jour le cache avec le nouveau quiz
   - Affiche un message de succès

4. **Message de Succès**
   - Snackbar affichant: "🎉 Nouveau quiz généré avec X questions !"
   - Disparaît automatiquement après 4 secondes

## Composant

### RegenerateQuizButton

Fichier: [src/components/Quiz/RegenerateQuizButton.jsx](../src/components/Quiz/RegenerateQuizButton.jsx)

#### Props

```typescript
interface RegenerateQuizButtonProps {
  module: Module;              // Données du module
  onQuizRegenerated?: (quiz: Quiz) => void;  // Callback après régénération (optionnel)
}
```

#### Exemple d'utilisation

```jsx
import RegenerateQuizButton from '../components/Quiz/RegenerateQuizButton';

<RegenerateQuizButton
  module={module}
  onQuizRegenerated={(newQuiz) => {
    console.log(`Nouveau quiz avec ${newQuiz.questions.length} questions`);
    // Logique supplémentaire après régénération
  }}
/>
```

## Design

### Apparence

- **Variante**: outlined
- **Couleur**: warning (jaune/orange)
- **Style**: bordure en pointillés (dashed)
- **Icône**: RefreshIcon (icône de rafraîchissement)
- **Hover**: bordure devient solide

### Dialogue

- **Titre**: "Régénérer un Nouveau Quiz" avec icône d'avertissement
- **Contenu**:
  - Texte d'explication
  - Alert d'avertissement avec liste des conséquences
  - Encadré informatif avec astuce
- **Actions**:
  - Bouton "Annuler" (gris)
  - Bouton "Régénérer" (warning, avec icône)

## États

### États du bouton

```javascript
// Vérification de l'existence du quiz en cache
const hasCachedQuiz = getCachedQuiz(module.id) !== null;

// Si pas de quiz en cache → bouton non affiché
if (!hasCachedQuiz) {
  return null;
}
```

### États du dialogue

1. **Fermé** - Dialogue masqué
2. **Ouvert** - Dialogue visible, en attente de confirmation
3. **Chargement** - Génération en cours, boutons désactivés
4. **Erreur** - Affichage d'une erreur si la génération échoue

## Gestion des Erreurs

```jsx
try {
  const newQuiz = await regenerateQuiz(module);
  // Succès
} catch (err) {
  // Affichage de l'erreur dans le dialogue
  setError(err.message || 'Erreur lors de la régénération du quiz');
}
```

Les erreurs possibles:
- Échec de l'API Gemini
- Problème de connexion réseau
- Erreur de parsing JSON
- Quota API dépassé

## Analytics

Le bouton intègre le tracking analytics:

```javascript
analytics.trackQuizGeneration(
  module.id,
  module.title,
  'regenerated',  // Type spécial pour régénération
  0,
  false
);
```

## Cas d'Usage

### Scénario 1: Révision avec Variété
Un utilisateur a déjà complété un quiz et souhaite se tester à nouveau avec de nouvelles questions.

```
1. Utilisateur visite la page du module
2. Voit le bouton "Nouveau Quiz"
3. Clique dessus
4. Confirme la régénération
5. Reçoit un nouveau jeu de questions
6. Commence le nouveau quiz
```

### Scénario 2: Quiz Trop Facile/Difficile
Un utilisateur trouve le quiz actuel inadapté et veut tenter sa chance avec d'autres questions.

```
1. Utilisateur termine un quiz
2. Retourne à la page du module
3. Clique sur "Nouveau Quiz"
4. Génère un nouveau quiz avec potentiellement une difficulté différente
```

## Intégration avec le Cache

Le bouton utilise les fonctions du système de cache intelligent:

```javascript
import {
  getCachedQuiz,      // Vérifier l'existence du cache
  regenerateQuiz,     // Régénérer le quiz
} from '../../services/geminiQuiz';

// Vérifier si quiz en cache
const hasCachedQuiz = getCachedQuiz(module.id) !== null;

// Régénérer
const newQuiz = await regenerateQuiz(module);
```

## Accessibilité

- ✅ Navigation au clavier complète
- ✅ Focus visible sur les boutons
- ✅ ARIA labels appropriés
- ✅ Dialogue modal accessible (ESC pour fermer)
- ✅ AutoFocus sur le bouton principal du dialogue

## Responsive Design

Le bouton s'adapte aux différentes tailles d'écran:
- **Desktop**: Affiché à droite du titre "Sujets Couverts"
- **Mobile**: Peut passer à la ligne si nécessaire
- **Dialogue**: Pleine largeur sur mobile

## Tests Recommandés

### Tests Unitaires
- Vérifier que le bouton ne s'affiche pas sans cache
- Vérifier l'ouverture/fermeture du dialogue
- Tester la gestion des erreurs

### Tests d'Intégration
- Vérifier le flux complet de régénération
- Tester le callback `onQuizRegenerated`
- Vérifier la mise à jour du cache

### Tests E2E
- Parcours utilisateur complet
- Vérifier les analytics
- Tester sur différents navigateurs

## Améliorations Futures

- [ ] Prévisualiser quelques questions avant confirmation
- [ ] Option pour sauvegarder l'ancien quiz
- [ ] Historique des quiz générés
- [ ] Statistiques de régénération par module
- [ ] Limite de régénération (anti-abus)
