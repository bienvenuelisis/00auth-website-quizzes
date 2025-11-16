# Module de Gestion des Travaux Pratiques (TPs)
## Documentation d'Implémentation

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Fichiers créés](#fichiers-créés)
4. [Modèle de données](#modèle-de-données)
5. [Services Firebase](#services-firebase)
6. [Interface utilisateur](#interface-utilisateur)
7. [Intégration](#intégration)
8. [Configuration Firebase](#configuration-firebase)
9. [Prochaines étapes](#prochaines-étapes)

---

## 🎯 Vue d'ensemble

Le module de Travaux Pratiques permet aux étudiants de :
- **Consulter** la liste des TPs disponibles pour leur formation
- **Voir les détails** de chaque TP (consignes, livrables, barème)
- **Soumettre** leurs travaux (lien GitHub, fichiers, etc.)
- **Suivre** leur progression et leurs notes
- **Recevoir** des feedbacks de leurs instructeurs

Les instructeurs peuvent :
- **Voir** toutes les soumissions
- **Évaluer** les travaux selon un barème défini
- **Donner des feedbacks** détaillés
- **Suivre** les statistiques globales

---

## 🏗️ Architecture

### Structure des collections Firestore

```
📦 Firestore Collections
├── practicalWorkProgress        # Progression des étudiants
│   └── {userId}_{practicalWorkId}
│       ├── userId
│       ├── practicalWorkId
│       ├── courseId
│       ├── status
│       ├── attempts[]           # Historique des soumissions
│       ├── bestScore
│       ├── isPassed
│       └── ...
│
├── users                        # (Existant) Profils utilisateurs
└── progress                     # (Existant) Progression quiz
```

### Structure Firebase Storage

```
📁 Storage
└── practical-works/
    └── {userId}/
        └── {practicalWorkId}/
            ├── file1.pdf
            ├── file2.zip
            └── screenshot.png
```

---

## 📁 Fichiers créés

### 1. Modèles de données

**`src/models/practicalWork.js`** (✅ Créé)
- Définit tous les types et interfaces
- Fonctions helper pour créer les objets
- Constantes de statuts et labels
- Fonctions de validation et calcul

```javascript
// Types principaux
- PracticalWork          // Définition d'un TP
- PracticalWorkProgress  // Progression d'un étudiant
- SubmissionAttempt      // Une soumission
- Evaluation             // Évaluation par instructeur
- SubmittedDeliverable   // Un livrable soumis
- EvaluationCriteria     // Critère de notation
```

### 2. Données statiques

**`src/data/practicalWorks.js`** (✅ Créé)
- 18 TPs définis pour la formation Flutter Avancé
- Organisés par semaine (Semaine 1 à Semaine 7)
- Fonctions helper pour filtrer et trier

**TPs inclus :**
- TP2: Gestion de Stock (console)
- TP3: Gestion Clients et Factures CEET
- TP4: Carte de visite numérique
- TP5: Calculatrice
- TP6: Liste avec suppression
- TP7: Formulaire d'inscription
- TP8: Todo App complète
- TP9: Thème personnalisé
- TP10: Mode clair/sombre
- TP11: Galerie d'images
- TP12: Todo responsive
- TP13 Bonus: Animation favoris
- TP14: Refactorisation fonctionnelle
- TP15: Horloge mondiale (Streams)
- TP16: Opérations lourdes
- TP Bonus: Isolates
- TP Bonus: Navigation comparison
- TP Bonus: Templates Mason

### 3. Règles de sécurité Firestore

**`firestore-rules-practical-works.rules`** (✅ Créé)

Règles définies pour :
- **Collection `practicalWorkProgress`**
  - Lecture: étudiant voit sa progression, instructeurs voient tout
  - Création: étudiant crée sa progression
  - Mise à jour: étudiant soumet, instructeur évalue
  - Suppression: admins uniquement

- **Collection `practicalWorkFiles`**
  - Métadonnées des fichiers uploadés

**Règles Storage** (incluses dans le fichier) :
- Upload: max 10MB, types autorisés (PDF, ZIP, images, vidéos)
- Lecture: propriétaire + instructeurs
- Suppression: propriétaire + admins

### 4. Services Firebase

**`src/services/firebase/firestore/practicalWorks.js`** (✅ Créé)

**Opérations de progression :**
```javascript
- getPracticalWorkProgress(userId, practicalWorkId)
- getUserPracticalWorkProgress(userId, courseId)
- getAllPracticalWorkProgress(practicalWorkId)
- initializePracticalWorkProgress(userId, practicalWorkId, courseId)
- submitPracticalWork(userId, practicalWorkId, courseId, deliverables, deadline)
- evaluatePracticalWork(userId, practicalWorkId, attemptNumber, evaluatorId, ...)
- markPracticalWorkInProgress(userId, practicalWorkId, courseId)
- deletePracticalWorkProgress(userId, practicalWorkId)
```

**Requêtes de soumission :**
```javascript
- getPendingSubmissions(courseId?)
- getEvaluatedSubmissions(courseId?, limit)
- getLateSubmissions(practicalWorkId, deadline)
```

**Statistiques :**
```javascript
- getPracticalWorkStats(practicalWorkId)
- getStudentPracticalWorkStats(userId, courseId)
```

**`src/services/firebase/firestorage/practicalWorkFiles.js`** (✅ Créé)

**Gestion des fichiers :**
```javascript
- uploadPracticalWorkFile(file, userId, practicalWorkId, deliverableId, onProgress)
- uploadMultiplePracticalWorkFiles(files, ...)
- deletePracticalWorkFile(userId, practicalWorkId, fileName)
- deleteAllPracticalWorkFiles(userId, practicalWorkId)
- listPracticalWorkFiles(userId, practicalWorkId)
- getPracticalWorkFileURL(userId, practicalWorkId, fileName)
- practicalWorkFileExists(userId, practicalWorkId, fileName)
- getUserPracticalWorkStorageUsed(userId)
```

**Validation des fichiers :**
- Taille max: 10MB (configurable)
- Types autorisés: PDF, ZIP, Images (JPEG, PNG, GIF), Vidéos (MP4, QuickTime)

---

## 📊 Modèle de données

### Structure d'un Travail Pratique (PracticalWork)

```javascript
{
  id: 'tp-05-calculatrice',
  courseId: 'flutter-advanced',
  title: 'TP5: Application Calculatrice',
  description: 'CodeLab pour créer une calculatrice fonctionnelle',
  instructions: '# Application Calculatrice\n\n## Fonctionnalités\n...',
  week: 'Semaine 2-3',
  weekNumber: 2,
  topics: ['StatefulWidget', 'setState', 'Interactivité', 'GridView'],
  difficulty: 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: 5,

  deliverables: [
    {
      id: 'github-repo',
      name: 'Code source',
      description: 'Projet Flutter complet sur GitHub',
      required: true,
      type: 'github' // 'github' | 'file' | 'url' | 'text'
    },
    {
      id: 'demo-video',
      name: 'Vidéo démonstration',
      description: 'Courte vidéo (1-2 min) montrant l\'application',
      required: false,
      type: 'url'
    }
  ],

  evaluationCriteria: [
    {
      id: 'functionality',
      name: 'Fonctionnalité',
      description: 'L\'application fonctionne comme demandé',
      maxPoints: 40
    },
    {
      id: 'codeQuality',
      name: 'Qualité du code',
      description: 'Code lisible, bien structuré',
      maxPoints: 30
    },
    {
      id: 'uiUx',
      name: 'UI/UX',
      description: 'Interface respecte les consignes',
      maxPoints: 20
    },
    {
      id: 'deadline',
      name: 'Respect des délais',
      description: 'Soumission dans les délais',
      maxPoints: 10
    }
  ],

  gradingRubric: {
    total: 100,
    breakdown: {
      functionality: 40,
      codeQuality: 30,
      uiUx: 20,
      deadline: 10
    }
  },

  isBonus: false,
  deadline: null, // Date | null
  order: 5,
  createdAt: Date,
  updatedAt: Date
}
```

### Progression d'un étudiant (PracticalWorkProgress)

```javascript
{
  userId: 'abc123',
  practicalWorkId: 'tp-05-calculatrice',
  courseId: 'flutter-advanced',

  status: 'submitted',
  // 'not_started' | 'in_progress' | 'submitted' | 'under_review'
  // | 'evaluated' | 'passed' | 'failed' | 'revision_requested'

  attempts: [
    {
      attemptId: 'attempt-1234567890-1',
      attemptNumber: 1,
      submittedAt: Date,
      status: 'evaluated',

      deliverables: [
        {
          deliverableId: 'github-repo',
          name: 'Code source',
          type: 'github',
          value: 'https://github.com/user/repo',
          submittedAt: Date,
          fileUrl: null,
          fileName: null,
          fileSize: null
        },
        {
          deliverableId: 'screenshot',
          name: 'Captures d\'écran',
          type: 'file',
          value: 'screenshot.png',
          submittedAt: Date,
          fileUrl: 'https://storage.googleapis.com/...',
          fileName: 'screenshot.png',
          fileSize: 1024000
        }
      ],

      evaluation: {
        evaluatorId: 'instructor123',
        evaluatorName: 'John Doe',
        evaluatedAt: Date,

        scores: [
          {
            criteriaId: 'functionality',
            name: 'Fonctionnalité',
            score: 35,
            maxPoints: 40,
            feedback: 'Très bon travail, quelques bugs mineurs'
          },
          {
            criteriaId: 'codeQuality',
            name: 'Qualité du code',
            score: 25,
            maxPoints: 30,
            feedback: 'Code bien structuré, manque quelques commentaires'
          },
          {
            criteriaId: 'uiUx',
            name: 'UI/UX',
            score: 18,
            maxPoints: 20,
            feedback: 'Interface agréable et fonctionnelle'
          },
          {
            criteriaId: 'deadline',
            name: 'Respect des délais',
            score: 10,
            maxPoints: 10,
            feedback: 'Soumis dans les temps'
          }
        ],

        totalScore: 88,
        generalFeedback: 'Excellent travail ! Continuez ainsi.',
        status: 'passed' // 'passed' | 'failed' | 'needs_revision'
      },

      isLate: false,
      daysLate: null
    }
  ],

  currentAttemptNumber: 1,
  bestScore: 88,
  firstSubmissionDate: Date,
  lastSubmissionDate: Date,
  passedAt: Date,
  isPassed: true,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Interface utilisateur

### Pages à créer

#### 1. **Liste des Travaux Pratiques** (`src/pages/PracticalWorksList.jsx`)

**Fonctionnalités :**
- Afficher tous les TPs du cours
- Filtrer par statut (non commencé, en cours, soumis, évalué)
- Filtrer par semaine
- Trier par ordre, deadline, score
- Indicateur de retard si deadline dépassée
- Badge de statut coloré

**Composants :**
```jsx
<PracticalWorksList>
  <FilterBar />
  <PracticalWorkCard
    practicalWork={pw}
    progress={progress}
    onClick={() => navigate to detail}
  />
</PracticalWorksList>
```

#### 2. **Détails d'un TP** (`src/pages/PracticalWorkDetail.jsx`)

**Sections :**
- **En-tête**: Titre, difficulté, temps estimé, deadline
- **Description**: Objectifs et contexte
- **Instructions détaillées**: Markdown formaté
- **Livrables attendus**: Liste avec types
- **Barème de notation**: Tableau des critères
- **Ma progression**: Statut, tentatives, meilleure note
- **Boutons d'action**:
  - "Commencer" (si not_started)
  - "Soumettre mon travail" (si in_progress ou révision demandée)
  - "Voir mes soumissions" (si déjà soumis)

#### 3. **Page de soumission** (`src/pages/PracticalWorkSubmission.jsx`)

**Formulaire :**
- Pour chaque livrable :
  - Si type `github`: Champ URL avec validation
  - Si type `file`: Upload de fichier avec progress bar
  - Si type `url`: Champ URL
  - Si type `text`: TextArea
- Bouton "Soumettre" avec confirmation
- Indication si en retard
- Aperçu des soumissions précédentes

**Gestion de fichiers :**
```jsx
<FileUploader
  onProgress={(percent) => setProgress(percent)}
  onSuccess={(url) => addDeliverable(url)}
  maxSize={10 * 1024 * 1024}
  allowedTypes={['pdf', 'zip', 'jpg', 'png']}
/>
```

#### 4. **Page d'évaluation** (`src/pages/PracticalWorkReview.jsx`) - Admin/Instructeur

**Sections :**
- **Informations étudiant**: Nom, email, photo
- **Détails de la soumission**: Date, tentative n°X, retard?
- **Livrables soumis**:
  - Liens GitHub (ouvrir dans nouvel onglet)
  - Fichiers téléchargeables
  - Aperçu des images
- **Formulaire d'évaluation**:
  - Pour chaque critère: Slider (0 à maxPoints) + TextArea feedback
  - Score total calculé automatiquement
  - TextArea feedback général
  - Bouton "Valider l'évaluation"

**Calcul automatique :**
```jsx
const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
const status = totalScore >= 70 ? 'passed' :
               totalScore >= 50 ? 'needs_revision' : 'failed';
```

#### 5. **Tableau de bord Admin TPs** (`src/pages/AdminPracticalWorks.jsx`)

**Onglets :**
- **En attente d'évaluation**: Liste des soumissions non évaluées
- **Évalués récemment**: Dernières évaluations
- **Statistiques par TP**: Graphiques et métriques
- **Statistiques par étudiant**: Vue globale des performances

**Widgets :**
- Nombre de soumissions en attente
- Taux de réussite moyen
- Moyenne générale du cours
- Graphique de progression dans le temps

### Composants UI

**`src/components/PracticalWorks/PracticalWorkCard.jsx`**
```jsx
<Card>
  <CardHeader>
    <Typography variant="h6">{title}</Typography>
    <StatusBadge status={status} />
  </CardHeader>
  <CardContent>
    <Chip label={week} />
    <Chip label={difficulty} color={difficultyColor} />
    {deadline && <DeadlineChip deadline={deadline} />}
    {progress && <LinearProgress value={progress.bestScore} />}
  </CardContent>
  <CardActions>
    <Button>Voir détails</Button>
  </CardActions>
</Card>
```

**`src/components/PracticalWorks/StatusBadge.jsx`**
```jsx
const STATUS_CONFIG = {
  not_started: { label: 'Non commencé', color: 'default' },
  in_progress: { label: 'En cours', color: 'info' },
  submitted: { label: 'Soumis', color: 'warning' },
  evaluated: { label: 'Évalué', color: 'info' },
  passed: { label: 'Réussi', color: 'success' },
  failed: { label: 'Échoué', color: 'error' },
  revision_requested: { label: 'Révision demandée', color: 'warning' }
};

<Chip
  label={STATUS_CONFIG[status].label}
  color={STATUS_CONFIG[status].color}
  size="small"
/>
```

**`src/components/PracticalWorks/DeliverableInput.jsx`**
```jsx
function DeliverableInput({ deliverable, onSubmit }) {
  switch (deliverable.type) {
    case 'github':
      return <GitHubURLInput />;
    case 'file':
      return <FileUploadInput />;
    case 'url':
      return <URLInput />;
    case 'text':
      return <TextAreaInput />;
  }
}
```

**`src/components/PracticalWorks/EvaluationForm.jsx`**
```jsx
<Form>
  {evaluationCriteria.map(criteria => (
    <Box key={criteria.id}>
      <Typography>{criteria.name} (0-{criteria.maxPoints})</Typography>
      <Slider
        value={scores[criteria.id]}
        onChange={(e, val) => setScore(criteria.id, val)}
        max={criteria.maxPoints}
        marks
      />
      <TextField
        label="Feedback"
        multiline
        rows={2}
        value={feedbacks[criteria.id]}
        onChange={(e) => setFeedback(criteria.id, e.target.value)}
      />
    </Box>
  ))}

  <Divider />

  <Typography variant="h6">
    Score total: {totalScore}/100
  </Typography>

  <TextField
    label="Feedback général"
    multiline
    rows={4}
    fullWidth
  />

  <Button onClick={submitEvaluation}>
    Valider l'évaluation
  </Button>
</Form>
```

**`src/components/PracticalWorks/ProgressSummary.jsx`**
```jsx
<Card>
  <CardContent>
    <Typography variant="h6">Ma progression</Typography>

    <List>
      <ListItem>
        <ListItemText
          primary="Statut"
          secondary={<StatusBadge status={progress.status} />}
        />
      </ListItem>

      <ListItem>
        <ListItemText
          primary="Nombre de tentatives"
          secondary={progress.attempts.length}
        />
      </ListItem>

      {progress.bestScore && (
        <ListItem>
          <ListItemText
            primary="Meilleure note"
            secondary={
              <Box display="flex" alignItems="center">
                <Typography variant="h4" color={getScoreColor(progress.bestScore)}>
                  {progress.bestScore}/100
                </Typography>
              </Box>
            }
          />
        </ListItem>
      )}

      {latestEvaluation && (
        <ListItem>
          <ListItemText
            primary="Dernier feedback"
            secondary={latestEvaluation.generalFeedback}
          />
        </ListItem>
      )}
    </List>
  </CardContent>
</Card>
```

---

## 🔗 Intégration

### 1. Ajouter les routes dans `src/App.jsx`

```jsx
import PracticalWorksList from './pages/PracticalWorksList';
import PracticalWorkDetail from './pages/PracticalWorkDetail';
import PracticalWorkSubmission from './pages/PracticalWorkSubmission';
import PracticalWorkReview from './pages/PracticalWorkReview';
import AdminPracticalWorks from './pages/AdminPracticalWorks';

// Dans la configuration des routes
<Routes>
  {/* ... routes existantes ... */}

  {/* Travaux Pratiques - Étudiants */}
  <Route
    path="/course/:courseId/practical-works"
    element={<PracticalWorksList />}
  />
  <Route
    path="/course/:courseId/practical-work/:practicalWorkId"
    element={<PracticalWorkDetail />}
  />
  <Route
    path="/course/:courseId/practical-work/:practicalWorkId/submit"
    element={<PracticalWorkSubmission />}
  />

  {/* Admin - Travaux Pratiques */}
  <Route
    path="/admin/practical-works"
    element={
      <ProtectedRoute requiresAdmin>
        <AdminPracticalWorks />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/practical-work/:practicalWorkId/review/:userId"
    element={
      <ProtectedRoute requiresInstructor>
        <PracticalWorkReview />
      </ProtectedRoute>
    }
  />
</Routes>
```

### 2. Ajouter le menu dans `src/components/Layout/Navbar.jsx`

```jsx
// Ajouter dans le menu utilisateur
<MenuItem onClick={() => navigate('/course/flutter-advanced/practical-works')}>
  <AssignmentIcon sx={{ mr: 1 }} />
  Mes Travaux Pratiques
</MenuItem>

// Ajouter dans le menu admin (si isAdmin ou role === 'instructor')
<MenuItem onClick={() => navigate('/admin/practical-works')}>
  <AssignmentTurnedInIcon sx={{ mr: 1 }} />
  Travaux Pratiques
</MenuItem>
```

### 3. Ajouter dans le Dashboard du cours (`src/pages/CourseDashboard.jsx`)

```jsx
<Tabs>
  <Tab label="Modules & Quiz" />
  <Tab label="Travaux Pratiques" />
</Tabs>

<TabPanel value={1}>
  <PracticalWorksList courseId={courseId} />
</TabPanel>
```

### 4. Intégrer dans le profil étudiant

```jsx
// Dans src/pages/ProfilePage.jsx
<Card>
  <CardHeader title="Mes Travaux Pratiques" />
  <CardContent>
    <PracticalWorkStats userId={user.uid} courseId={courseId} />
  </CardContent>
</Card>
```

---

## ⚙️ Configuration Firebase

### 1. Déployer les règles Firestore

```bash
# Copier les règles du fichier firestore-rules-practical-works.rules
# dans votre fichier firestore.rules principal

# Déployer
firebase deploy --only firestore:rules
```

### 2. Déployer les règles Storage

```bash
# Ajouter les règles Storage du fichier firestore-rules-practical-works.rules
# dans votre fichier storage.rules

# Déployer
firebase deploy --only storage
```

### 3. Créer les index Firestore (si nécessaire)

Firebase vous alertera si des index sont nécessaires. Ils seront probablement requis pour :
- `practicalWorkProgress` : `(courseId, status, lastSubmissionDate)`
- `practicalWorkProgress` : `(practicalWorkId, lastSubmissionDate)`

Créez-les via la console Firebase ou le lien fourni dans les erreurs.

---

## 📝 Prochaines étapes

### Phase 1: Composants de base ✅ FAIT
- [x] Modèle de données
- [x] Données statiques des TPs
- [x] Services Firebase (Firestore + Storage)
- [x] Règles de sécurité

### Phase 2: Interface utilisateur 🚧 À FAIRE
- [ ] Créer `PracticalWorkCard.jsx`
- [ ] Créer `StatusBadge.jsx`
- [ ] Créer `DeliverableInput.jsx`
- [ ] Créer `EvaluationForm.jsx`
- [ ] Créer `ProgressSummary.jsx`
- [ ] Créer `FileUploader.jsx`

### Phase 3: Pages principales 🚧 À FAIRE
- [ ] `PracticalWorksList.jsx`
- [ ] `PracticalWorkDetail.jsx`
- [ ] `PracticalWorkSubmission.jsx`
- [ ] `PracticalWorkReview.jsx` (Admin/Instructeur)
- [ ] `AdminPracticalWorks.jsx` (Dashboard admin)

### Phase 4: Intégration 🚧 À FAIRE
- [ ] Ajouter les routes dans `App.jsx`
- [ ] Ajouter les menus dans `Navbar.jsx`
- [ ] Intégrer dans `CourseDashboard.jsx`
- [ ] Ajouter widget dans `ProfilePage.jsx`

### Phase 5: Fonctionnalités avancées 🔮 FUTUR
- [ ] Notifications par email lors de soumission/évaluation
- [ ] Export des résultats en CSV/PDF
- [ ] Graphiques de progression
- [ ] Système de commentaires sur les soumissions
- [ ] Historique détaillé des modifications
- [ ] Filtres avancés et recherche
- [ ] Mode hors-ligne (cache local)

---

## 🧪 Tests recommandés

### Tests unitaires
```javascript
// tests/models/practicalWork.test.js
- createPracticalWork()
- createPracticalWorkProgress()
- calculateProgressStatus()
- isLateSubmission()
- calculateDeadlineStatus()
```

### Tests d'intégration
```javascript
// tests/services/practicalWorks.test.js
- submitPracticalWork()
- evaluatePracticalWork()
- getPracticalWorkStats()
```

### Tests E2E
```javascript
// Scénario: Étudiant soumet un TP
1. Navigate to TP list
2. Click on TP card
3. Click "Soumettre mon travail"
4. Fill deliverables
5. Submit
6. Verify success message
7. Check progress updated

// Scénario: Instructeur évalue un TP
1. Login as instructor
2. Navigate to admin TPs
3. Click on pending submission
4. Fill evaluation form
5. Submit evaluation
6. Verify student receives feedback
```

---

## 📚 Ressources et références

### Documentation Firebase
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [File Upload](https://firebase.google.com/docs/storage/web/upload-files)

### MUI Components utilisés
- Card, CardHeader, CardContent, CardActions
- Chip, Badge
- TextField, Select, Slider
- Button, IconButton
- List, ListItem, ListItemText
- LinearProgress, CircularProgress
- Tabs, Tab, TabPanel
- Dialog, Snackbar, Alert

### Icônes recommandées (Material Icons)
- `AssignmentIcon` - Liste des TPs
- `AssignmentTurnedInIcon` - TPs complétés
- `UploadFileIcon` - Upload de fichiers
- `CheckCircleIcon` - Réussi
- `CancelIcon` - Échoué
- `HourglassEmptyIcon` - En attente
- `RateReviewIcon` - Évaluation
- `TrendingUpIcon` - Progression

---

## ⚠️ Points d'attention

### Sécurité
- ✅ Valider tous les fichiers côté client ET serveur
- ✅ Limiter la taille des uploads (10MB)
- ✅ Vérifier les permissions avant chaque opération
- ✅ Sanitizer les URLs GitHub soumises
- ⚠️ Ne jamais exposer les clés API côté client

### Performance
- Utiliser la pagination pour les listes longues
- Mettre en cache les données statiques (TPs)
- Optimiser les requêtes Firestore (limit, indexes)
- Lazy loading des images et fichiers

### UX
- Afficher des indicateurs de chargement
- Confirmer avant soumission/suppression
- Sauvegarder les brouillons automatiquement
- Afficher les erreurs de validation clairement
- Responsive design (mobile-friendly)

### Accessibilité
- Labels ARIA pour tous les inputs
- Navigation au clavier
- Contraste des couleurs suffisant
- Messages d'erreur descriptifs

---

## 🎓 Barème de notation par défaut

```
Total: 100 points

├── Fonctionnalité (40 points)
│   └── L'application fonctionne comme demandé, sans bugs majeurs
│
├── Qualité du code (30 points)
│   ├── Code lisible et bien organisé
│   ├── Respect des conventions Dart/Flutter
│   ├── Commentaires pertinents
│   └── Architecture claire
│
├── UI/UX (20 points)
│   ├── Interface respecte les consignes
│   ├── Design cohérent et agréable
│   ├── Navigation intuitive
│   └── Responsive (si demandé)
│
└── Respect des délais (10 points)
    ├── Soumis à temps: 10 pts
    ├── 1-3 jours de retard: 7 pts
    ├── 4-7 jours de retard: 5 pts
    └── >7 jours de retard: 0 pt

Seuil de réussite: 70/100
```

---

## 🤝 Contribution

Pour ajouter de nouveaux TPs :

1. Éditer `src/data/practicalWorks.js`
2. Utiliser la fonction `createPracticalWork()`
3. Définir les livrables et critères d'évaluation
4. Ajouter au tableau `PRACTICAL_WORKS`
5. Tester l'affichage dans l'interface

Exemple :
```javascript
createPracticalWork({
  id: 'tp-XX-nouveau-tp',
  courseId: 'flutter-advanced',
  title: 'TPX: Titre du TP',
  description: 'Description courte',
  instructions: `# Instructions détaillées en Markdown`,
  week: 'Semaine X',
  weekNumber: X,
  topics: ['Topic1', 'Topic2'],
  difficulty: 'intermediate',
  estimatedHours: 6,
  deliverables: [/* ... */],
  isBonus: false,
  deadline: new Date('2026-03-15'),
  order: XX
})
```

---

## 📞 Support

Pour toute question sur l'implémentation :
- Consulter cette documentation
- Vérifier les fichiers modèles créés
- Tester les services Firebase dans la console
- Référer aux composants similaires existants (Quiz)

---

**Dernière mise à jour:** 16 novembre 2025
**Version:** 1.0
**Status:** Fondations complètes, interfaces en cours
