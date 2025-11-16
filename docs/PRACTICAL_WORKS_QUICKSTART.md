# Guide de Démarrage Rapide - Module Travaux Pratiques

## 🎉 Félicitations !

Le module de gestion des Travaux Pratiques est maintenant **entièrement implémenté** et prêt à l'utilisation !

---

## ✅ Ce qui a été créé

### 1. Modèles et Données (100% ✅)
- ✅ [src/models/practicalWork.js](../src/models/practicalWork.js) - Types et fonctions helper
- ✅ [src/data/practicalWorks.js](../src/data/practicalWorks.js) - 18 TPs pour Flutter Avancé

### 2. Services Firebase (100% ✅)
- ✅ [src/services/firebase/firestore/practicalWorks.js](../src/services/firebase/firestore/practicalWorks.js) - CRUD Firestore
- ✅ [src/services/firebase/firestorage/practicalWorkFiles.js](../src/services/firebase/firestorage/practicalWorkFiles.js) - Gestion fichiers

### 3. Règles de Sécurité (100% ✅)
- ✅ [firestore-rules-practical-works.rules](../firestore-rules-practical-works.rules) - Règles Firestore & Storage

### 4. Composants UI (100% ✅)
- ✅ [src/components/PracticalWorks/StatusBadge.jsx](../src/components/PracticalWorks/StatusBadge.jsx)
- ✅ [src/components/PracticalWorks/PracticalWorkCard.jsx](../src/components/PracticalWorks/PracticalWorkCard.jsx)

### 5. Pages (100% ✅)
- ✅ [src/pages/PracticalWorksList.jsx](../src/pages/PracticalWorksList.jsx)
- ✅ [src/pages/PracticalWorkDetail.jsx](../src/pages/PracticalWorkDetail.jsx)
- ✅ [src/pages/PracticalWorkSubmission.jsx](../src/pages/PracticalWorkSubmission.jsx)
- ✅ [src/pages/PracticalWorkReview.jsx](../src/pages/PracticalWorkReview.jsx)

### 6. Intégration (100% ✅)
- ✅ Routes ajoutées dans [src/App.jsx](../src/App.jsx)
- ✅ Menu ajouté dans [src/components/Layout/Navbar.jsx](../src/components/Layout/Navbar.jsx)

---

## 🚀 Déploiement (3 étapes simples)

### Étape 1: Déployer les règles Firestore

1. Ouvrez votre fichier principal `firestore.rules`

2. Copiez les règles de [firestore-rules-practical-works.rules](../firestore-rules-practical-works.rules) dans la section appropriée

3. Déployez :
```bash
firebase deploy --only firestore:rules
```

### Étape 2: Déployer les règles Storage

1. Ouvrez votre fichier `storage.rules`

2. Copiez les règles Storage du fichier [firestore-rules-practical-works.rules](../firestore-rules-practical-works.rules)

3. Déployez :
```bash
firebase deploy --only storage
```

### Étape 3: Installer react-markdown (si pas déjà installé)

La page de détails utilise `react-markdown` pour afficher les instructions :

```bash
npm install react-markdown
# ou
yarn add react-markdown
```

---

## 🎯 Utilisation

### Pour les Étudiants

1. **Accéder aux TPs** :
   - Cliquez sur votre avatar → "Mes Travaux Pratiques"
   - Ou naviguez vers `/course/flutter-advanced/practical-works`

2. **Voir les détails d'un TP** :
   - Cliquez sur une carte de TP
   - Lisez les instructions complètes
   - Consultez le barème de notation

3. **Soumettre un TP** :
   - Cliquez sur "Soumettre mon travail"
   - Remplissez les livrables (GitHub URL, fichiers, etc.)
   - Confirmez la soumission

4. **Voir les résultats** :
   - Retournez sur le détail du TP
   - Consultez votre note et les feedbacks

### Pour les Instructeurs/Admins

1. **Voir les soumissions en attente** :
   - À implémenter : Page `/admin/practical-works`
   - Pour l'instant, accéder directement via URL

2. **Évaluer une soumission** :
   - Naviguez vers `/admin/practical-work/{practicalWorkId}/review/{userId}`
   - Consultez les livrables soumis
   - Attribuez des notes par critère
   - Donnez un feedback général
   - Validez l'évaluation

---

## 📋 Données des TPs

### 18 Travaux Pratiques disponibles

**Semaine 1-2 : Dart & Flutter** (3 TPs)
- TP2: Gestion de Stock (console)
- TP3: Gestion Clients et Factures CEET
- TP Bonus: Navigation comparison

**Semaine 2-3 : Interfaces** (3 TPs)
- TP4: Carte de visite numérique
- TP5: Calculatrice
- TP6: Liste avec suppression

**Semaine 4 : Navigation** (3 TPs)
- TP7: Formulaire d'inscription
- TP8: Todo App complète
- TP Bonus: Formulaire multi-étapes

**Semaine 5 : Thème** (2 TPs)
- TP9: Thème personnalisé
- TP10: Mode clair/sombre

**Semaine 6 : Interfaces Avancées** (3 TPs)
- TP11: Galerie d'images
- TP12: Todo responsive
- TP13 Bonus: Animation favoris

**Semaine 7 : Dart Avancé** (4 TPs)
- TP14: Refactorisation fonctionnelle
- TP15: Horloge mondiale (Streams)
- TP16: Opérations lourdes
- TP Bonus: Isolates

**Architecture** (1 TP)
- TP Bonus: Templates Mason

---

## 🎨 Fonctionnalités Principales

### ✨ Pour les Étudiants

- ✅ Liste des TPs avec filtres (semaine, statut)
- ✅ Statistiques de progression
- ✅ Instructions détaillées en Markdown
- ✅ Barème de notation visible
- ✅ Soumission de livrables multiples :
  - URL GitHub
  - Fichiers (PDF, ZIP, images, vidéos)
  - URLs diverses
  - Texte libre
- ✅ Upload de fichiers avec barre de progression
- ✅ Historique des tentatives
- ✅ Feedback détaillé par critère
- ✅ Indicateurs de deadline et retard
- ✅ Badges de statut colorés

### 👨‍🏫 Pour les Instructeurs

- ✅ Interface d'évaluation complète
- ✅ Consultation des livrables soumis
- ✅ Notation par critère avec sliders
- ✅ Calcul automatique du score total
- ✅ Feedback personnalisé
- ✅ Modification des évaluations
- ✅ Indication des retards

---

## 🔧 Personnalisation

### Ajouter un nouveau TP

Éditez [src/data/practicalWorks.js](../src/data/practicalWorks.js) :

```javascript
createPracticalWork({
  id: 'tp-XX-nouveau-tp',
  courseId: 'flutter-advanced',
  title: 'TPX: Titre du TP',
  description: 'Description courte',
  instructions: `# Instructions détaillées\n\n## Objectifs\n...`,
  week: 'Semaine X',
  weekNumber: X,
  topics: ['Topic1', 'Topic2'],
  difficulty: 'intermediate',
  estimatedHours: 6,
  deliverables: [
    {
      id: 'github-repo',
      name: 'Code source',
      description: 'Dépôt GitHub',
      required: true,
      type: DELIVERABLE_TYPES.GITHUB
    }
  ],
  isBonus: false,
  deadline: null, // ou new Date('2026-03-15')
  order: XX
})
```

### Modifier le barème de notation

Par défaut (100 points) :
- 40 pts : Fonctionnalité
- 30 pts : Qualité du code
- 20 pts : UI/UX
- 10 pts : Respect des délais

Pour modifier, éditez `evaluationCriteria` dans `createPracticalWork()`.

---

## 🐛 Résolution de problèmes

### Erreur : "Module not found: react-markdown"
```bash
npm install react-markdown
```

### Erreur : "Permission denied" lors de l'upload
Vérifiez que les règles Storage sont bien déployées :
```bash
firebase deploy --only storage
```

### Les TPs ne s'affichent pas
Vérifiez :
1. Les imports dans `PracticalWorksList.jsx`
2. Le `courseId` dans l'URL (`flutter-advanced`)
3. La console navigateur pour les erreurs

### Erreur Firestore lors de la soumission
Vérifiez que les règles Firestore sont déployées :
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Statuts des TPs

| Statut | Label | Couleur | Description |
|--------|-------|---------|-------------|
| `not_started` | Non commencé | Gris | Aucune action |
| `in_progress` | En cours | Bleu | Travail commencé |
| `submitted` | Soumis | Orange | En attente évaluation |
| `evaluated` | Évalué | Bleu | Évalué mais < 70 |
| `passed` | Réussi | Vert | Score ≥ 70 |
| `failed` | Échoué | Rouge | Score < 50 |
| `revision_requested` | Révision demandée | Orange | 50 ≤ Score < 70 |

---

## 🎓 Prochaines Améliorations Possibles

### Court terme
- [ ] Page admin listant toutes les soumissions en attente
- [ ] Notifications email lors de soumission/évaluation
- [ ] Export des notes en CSV

### Moyen terme
- [ ] Système de commentaires sur les livrables
- [ ] Graphiques de progression
- [ ] Filtres avancés et recherche
- [ ] Mode hors-ligne (cache local)

### Long terme
- [ ] Collaboration étudiants (TPs en groupe)
- [ ] Intégration avec GitHub API (vérification auto)
- [ ] Système de peer-review
- [ ] Génération automatique de certificats

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- [PRACTICAL_WORKS_IMPLEMENTATION.md](./PRACTICAL_WORKS_IMPLEMENTATION.md) - Documentation complète

---

## 🙏 Support

Pour toute question :
1. Consultez la documentation
2. Vérifiez les fichiers créés
3. Testez dans la console Firebase
4. Référez-vous aux composants Quiz existants

---

**Version:** 1.0
**Date:** 16 novembre 2025
**Status:** ✅ Prêt pour production
