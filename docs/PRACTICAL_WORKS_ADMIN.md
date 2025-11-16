# 👨‍🏫 Page Admin - Gestion des Travaux Pratiques

## Vue d'ensemble

La page **Admin Travaux Pratiques** (`/admin/practical-works`) permet aux administrateurs et instructeurs de :
- **Suivre** toutes les soumissions en attente
- **Évaluer** les travaux des étudiants
- **Consulter** les statistiques par TP
- **Gérer** les évaluations par formation

---

## 🎯 Accès

### Pour les Admins/Instructeurs

**Menu :** Avatar → **Travaux Pratiques**

**URL directe :** `/admin/practical-works`

**Permissions requises :**
- `isAdmin === true` OU
- `role === 'instructor'` OU
- `canManageUsers === true`

### Pour les Étudiants

**Menu :** Avatar → **Mes Travaux Pratiques**

**URL directe :** `/course/flutter-advanced/practical-works`

---

## 📊 Interface Admin

### En-tête

**Statistiques globales** (4 cartes) :
1. **Total soumissions** - Nombre total de TPs soumis
2. **En attente** - Soumissions non encore évaluées
3. **Évalués** - Soumissions déjà notées
4. **Moyenne générale** - Score moyen de tous les TPs

**Sélecteur de formation** :
- Actuellement : Flutter Avancé
- Extensible à d'autres formations

---

### Onglet 1 : En attente d'évaluation

**Tableau des soumissions en attente :**

| Colonne | Description |
|---------|-------------|
| **Étudiant** | Avatar + Nom + Email |
| **Travail Pratique** | Titre + Semaine |
| **Tentative** | Numéro + Badge retard si applicable |
| **Date de soumission** | Date + Heure |
| **Statut** | Badge coloré |
| **Actions** | Bouton "Évaluer" |

**Fonctionnalités :**
- Tri par date de soumission (plus récent en premier)
- Pagination (10, 25, 50 lignes par page)
- Indicateur visuel pour les soumissions en retard

**Action :**
- Clic sur "Évaluer" → Redirection vers page d'évaluation

---

### Onglet 2 : Évalués récemment

**Tableau des évaluations récentes (50 dernières) :**

| Colonne | Description |
|---------|-------------|
| **Étudiant** | Avatar + Nom + Email |
| **Travail Pratique** | Titre du TP |
| **Note** | Score/100 (coloré selon réussite) |
| **Statut** | Badge (Réussi, Échoué, etc.) |
| **Date évaluation** | Date de l'évaluation |
| **Actions** | Bouton "Voir" |

**Fonctionnalités :**
- Consultation des évaluations passées
- Possibilité de modifier une évaluation
- Filtrage par pagination

---

### Onglet 3 : Statistiques par TP

**Grille de cartes** (une par TP) :

Chaque carte affiche :
- **Titre du TP** + Semaine + Type (Bonus/Obligatoire)
- **Barre de progression** : Taux de réussite %
- **Statistiques détaillées** :
  - Soumis (nombre)
  - Réussis (nombre)
  - Moyenne (score)
  - En retard (nombre)

**Couleur de la barre de progression :**
- Vert (success) : ≥ 70% de réussite
- Orange (warning) : < 70% de réussite

**Calculs :**
```javascript
Taux de réussite = (Nombre réussis / Total étudiants) × 100
Moyenne = Somme des scores / Nombre de soumissions évaluées
```

---

## 🔄 Flux de Travail

### 1. Consultation des soumissions en attente

```
Admin se connecte
  ↓
Clique sur "Travaux Pratiques"
  ↓
Voit onglet "En attente d'évaluation"
  ↓
Liste des soumissions non évaluées
```

### 2. Évaluation d'une soumission

```
Clic sur "Évaluer"
  ↓
Redirection vers /admin/practical-work/{id}/review/{userId}
  ↓
Consultation des livrables
  ↓
Attribution des notes
  ↓
Feedback général
  ↓
Validation
  ↓
Retour à la liste (mise à jour automatique)
```

### 3. Suivi des statistiques

```
Onglet "Statistiques par TP"
  ↓
Vue d'ensemble de tous les TPs
  ↓
Identification des TPs problématiques
  ↓
Actions correctives si nécessaire
```

---

## 📈 Métriques Calculées

### Par TP

```javascript
{
  totalStudents: number,        // Nombre d'étudiants ayant commencé
  notStarted: number,           // Non commencés
  inProgress: number,           // En cours
  submitted: number,            // Soumis
  evaluated: number,            // Évalués
  passed: number,               // Réussis (≥70)
  failed: number,               // Échoués (<50)
  revisionRequested: number,    // Révision demandée (50-69)
  averageScore: number,         // Moyenne des scores
  averageAttempts: number,      // Nombre moyen de tentatives
  lateSubmissions: number       // Soumissions en retard
}
```

### Globales

```javascript
{
  totalSubmissions: number,     // Total de toutes les soumissions
  pendingReview: number,        // En attente d'évaluation
  evaluated: number,            // Déjà évalués
  averageScore: number          // Moyenne générale du cours
}
```

---

## 🎨 Code Source

### Fichier
`src/pages/AdminPracticalWorks.jsx`

### Dépendances
- `@mui/material` - Composants UI
- `react-router-dom` - Navigation
- Services Firebase :
  - `getPendingSubmissions(courseId)`
  - `getEvaluatedSubmissions(courseId, limit)`
  - `getPracticalWorkStats(practicalWorkId)`
  - `getProfile(userId)`

### State Management
```javascript
const [tabValue, setTabValue] = useState(0);
const [selectedCourse, setSelectedCourse] = useState('flutter-advanced');
const [pendingSubmissions, setPendingSubmissions] = useState([]);
const [evaluatedSubmissions, setEvaluatedSubmissions] = useState([]);
const [statsPerTP, setStatsPerTP] = useState({});
const [studentProfiles, setStudentProfiles] = useState({});
```

---

## 🔍 Requêtes Firestore

### Soumissions en attente
```javascript
// Collection: practicalWorkProgress
// Condition: status === 'submitted'
// Tri: par lastSubmissionDate DESC

query(
  collection(db, 'practicalWorkProgress'),
  where('courseId', '==', courseId),
  where('status', '==', 'submitted'),
  orderBy('lastSubmissionDate', 'desc')
)
```

### Soumissions évaluées
```javascript
// Collection: practicalWorkProgress
// Condition: status IN ['evaluated', 'passed', 'failed']
// Tri: par updatedAt DESC
// Limite: 50

query(
  collection(db, 'practicalWorkProgress'),
  where('courseId', '==', courseId),
  where('status', 'in', ['evaluated', 'passed', 'failed']),
  orderBy('updatedAt', 'desc'),
  limit(50)
)
```

### Statistiques par TP
```javascript
// Pour chaque TP:
// 1. Récupérer toutes les progressions
// 2. Calculer les métriques
// 3. Stocker dans statsPerTP[practicalWorkId]

for (const pw of practicalWorks) {
  const stats = await getPracticalWorkStats(pw.id);
  statsPerTP[pw.id] = stats;
}
```

---

## 🎯 Cas d'Usage

### Scénario 1 : Évaluer les soumissions de la semaine

```
1. Instructeur se connecte
2. Navigue vers "Travaux Pratiques"
3. Voit 15 soumissions en attente
4. Trie par date (plus anciennes en premier)
5. Évalue une par une
6. Total évalué = 15
7. Onglet "En attente" vide ✓
```

### Scénario 2 : Identifier les TPs difficiles

```
1. Admin ouvre "Statistiques par TP"
2. Observe les taux de réussite
3. Identifie: TP8 (Todo App) = 45% réussite
4. Note: Moyenne = 55/100
5. Action: Revoir les consignes ou donner aide supplémentaire
```

### Scénario 3 : Modifier une évaluation

```
1. Étudiant conteste sa note
2. Instructeur va dans "Évalués récemment"
3. Trouve la soumission de l'étudiant
4. Clique sur "Voir"
5. Modifie les scores
6. Re-valide
7. Note mise à jour ✓
```

---

## 🚀 Améliorations Futures

### Court terme
- [ ] Filtres avancés (par TP, par date, par note)
- [ ] Recherche d'étudiant
- [ ] Export CSV des notes
- [ ] Notifications email automatiques

### Moyen terme
- [ ] Affectation d'évaluateurs
- [ ] Commentaires sur les livrables
- [ ] Historique des modifications
- [ ] Graphiques de progression dans le temps

### Long terme
- [ ] Évaluation par IA (pré-notation)
- [ ] Détection de plagiat
- [ ] Templates de feedback
- [ ] Webhooks pour intégrations externes

---

## 📊 Performance

### Optimisations Implémentées
- ✅ Chargement limité des évaluations (50 max)
- ✅ Pagination des tableaux
- ✅ Cache des profils utilisateurs
- ✅ Requêtes Firestore optimisées avec index

### Recommandations
- Pour > 100 étudiants : Implémenter pagination côté serveur
- Pour > 1000 soumissions : Ajouter cache Redis
- Monitoring des requêtes Firestore

---

## 🔐 Sécurité

### Règles Firestore

```javascript
// Collection: practicalWorkProgress
match /practicalWorkProgress/{progressId} {
  // Lecture: Admin/Instructeur uniquement
  allow read: if request.auth != null
    && (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
        || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor');
}
```

### Vérifications côté Client

```javascript
// Dans useAuth hook
const { isAdmin, canManageUsers } = usePermissions();

// Dans component
if (!isAdmin && !canManageUsers) {
  return <Navigate to="/" />;
}
```

---

## 📝 Checklist Admin

Avant chaque session d'évaluation :

- [ ] Vérifier les soumissions en attente
- [ ] Trier par date (anciennes en premier)
- [ ] Préparer grilles d'évaluation
- [ ] Consulter les statistiques globales
- [ ] Identifier les étudiants en difficulté

Pendant l'évaluation :

- [ ] Consulter tous les livrables
- [ ] Tester le code si applicable
- [ ] Noter selon le barème
- [ ] Donner feedback constructif
- [ ] Marquer comme "Évalué"

Après l'évaluation :

- [ ] Vérifier que toutes sont traitées
- [ ] Consulter les nouvelles stats
- [ ] Identifier patterns (ex: beaucoup de retards)
- [ ] Planifier actions correctives

---

**Créé le :** 16 novembre 2025
**Version :** 1.0
**Fichier :** `src/pages/AdminPracticalWorks.jsx`
