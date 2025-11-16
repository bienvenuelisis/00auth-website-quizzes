# ✅ TODO - Configuration Finale du Module Travaux Pratiques

## 🚀 Actions Requises (3 étapes)

### ☐ Étape 1: Installer react-markdown

```bash
npm install react-markdown
# ou
yarn add react-markdown
```

**Pourquoi ?** La page de détails utilise `react-markdown` pour afficher les instructions formatées.

---

### ☐ Étape 2: Déployer les Règles Firestore

1. **Ouvrir** `firestore.rules`

2. **Ajouter** les règles de `firestore-rules-practical-works.rules` :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ... vos règles existantes (users, progress, etc.)

    // ===== TRAVAUX PRATIQUES =====

    // Progression des travaux pratiques
    match /practicalWorkProgress/{progressId} {
      allow read: if request.auth != null
        && (resource.data.userId == request.auth.uid
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor');

      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow update: if request.auth != null
        && (resource.data.userId == request.auth.uid
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor');

      allow delete: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Fichiers des travaux pratiques (métadonnées)
    match /practicalWorkFiles/{fileId} {
      allow read: if request.auth != null
        && (resource.data.userId == request.auth.uid
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor');

      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;

      allow update: if request.auth != null
        && resource.data.userId == request.auth.uid;

      allow delete: if request.auth != null
        && (resource.data.userId == request.auth.uid
            || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
  }
}
```

3. **Déployer** :

```bash
firebase deploy --only firestore:rules
```

4. **Vérifier** dans la console Firebase que les règles sont actives

---

### ☐ Étape 3: Déployer les Règles Storage

1. **Ouvrir** `storage.rules`

2. **Ajouter** les règles Storage :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // ... vos règles existantes

    // ===== TRAVAUX PRATIQUES =====

    // Dossier des travaux pratiques
    match /practical-works/{userId}/{practicalWorkId}/{fileName} {
      // Lecture: propriétaire et instructeurs/admins
      allow read: if request.auth != null
        && (request.auth.uid == userId
            || firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true
            || firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'instructor');

      // Écriture: uniquement le propriétaire
      allow write: if request.auth != null
        && request.auth.uid == userId
        // Limite de taille: 10MB
        && request.resource.size < 10 * 1024 * 1024
        // Types de fichiers autorisés
        && request.resource.contentType.matches('application/pdf|application/zip|application/x-zip-compressed|image/.*|video/.*');

      // Suppression: propriétaire ou admin
      allow delete: if request.auth != null
        && (request.auth.uid == userId
            || firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
  }
}
```

3. **Déployer** :

```bash
firebase deploy --only storage
```

4. **Vérifier** dans la console Firebase

---

## ✅ Vérification Post-Déploiement

### ☐ Test 1: Affichage de la liste

1. Connectez-vous en tant qu'étudiant
2. Menu → "Mes Travaux Pratiques"
3. Vérifiez que les 18 TPs s'affichent
4. Testez les filtres (semaine, statut)
5. Vérifiez les statistiques en haut

**Attendu:** Liste de 18 TPs avec filtres fonctionnels

---

### ☐ Test 2: Détails d'un TP

1. Cliquez sur "TP5: Application Calculatrice"
2. Vérifiez que les instructions s'affichent
3. Vérifiez le barème de notation
4. Cliquez sur "Commencer ce TP"

**Attendu:** Instructions formatées + barème visible

---

### ☐ Test 3: Soumission

1. Sur un TP commencé, cliquez "Soumettre mon travail"
2. Remplissez un URL GitHub
3. Uploadez un fichier test (< 10MB)
4. Confirmez la soumission

**Attendu:**
- Upload avec barre de progression
- Confirmation de soumission
- Retour au détail avec statut "Soumis"

---

### ☐ Test 4: Évaluation (Instructeur)

1. Connectez-vous en tant qu'admin/instructeur
2. Naviguez vers :
   `/admin/practical-work/{practicalWorkId}/review/{userId}`

   Exemple:
   `/admin/practical-work/tp-05-calculatrice/review/abc123`

3. Vérifiez que les livrables s'affichent
4. Attribuez des notes avec les sliders
5. Écrivez un feedback
6. Validez l'évaluation

**Attendu:**
- Livrables visibles et téléchargeables
- Sliders de notation fonctionnels
- Calcul automatique du total
- Confirmation d'enregistrement

---

### ☐ Test 5: Consultation de l'évaluation (Étudiant)

1. Retournez sur le détail du TP évalué
2. Vérifiez que la note s'affiche
3. Consultez le feedback détaillé

**Attendu:**
- Note visible
- Feedback par critère
- Feedback général
- Badge "Réussi" si note ≥ 70

---

## 🐛 Résolution de Problèmes

### Erreur: "Module not found: react-markdown"
```bash
npm install react-markdown
```

### Erreur: "Permission denied" (Firestore)
- Vérifier que les règles Firestore sont déployées
- Tester dans le Rules Playground de Firebase

### Erreur: "Permission denied" (Storage)
- Vérifier que les règles Storage sont déployées
- Vérifier la taille du fichier (< 10MB)
- Vérifier le type de fichier

### Les TPs ne s'affichent pas
- Ouvrir la console navigateur (F12)
- Vérifier les erreurs JavaScript
- Vérifier que `courseId` est bien `flutter-advanced`

### Upload bloqué
- Vérifier la taille (max 10MB)
- Vérifier le type (PDF, ZIP, images, vidéos)
- Vérifier les règles Storage

---

## 📝 Checklist Complète

### Configuration
- [ ] `npm install react-markdown` exécuté
- [ ] Règles Firestore ajoutées et déployées
- [ ] Règles Storage ajoutées et déployées
- [ ] Build réussi sans erreurs

### Tests Fonctionnels
- [ ] Liste des TPs s'affiche
- [ ] Filtres fonctionnent
- [ ] Détails d'un TP s'affichent
- [ ] Instructions markdown rendues
- [ ] Bouton "Commencer" fonctionne
- [ ] Formulaire de soumission s'affiche
- [ ] Upload de fichier fonctionne
- [ ] Soumission réussie
- [ ] Interface d'évaluation accessible
- [ ] Notation fonctionne
- [ ] Feedback enregistré
- [ ] Étudiant voit son évaluation

### Tests de Sécurité
- [ ] Étudiant ne peut pas voir les soumissions d'autres
- [ ] Étudiant ne peut pas évaluer
- [ ] Fichiers > 10MB sont rejetés
- [ ] Types de fichiers invalides sont rejetés
- [ ] Seul l'admin peut supprimer

### Performance
- [ ] Chargement liste < 2s
- [ ] Upload fichier avec progression
- [ ] Pas de freeze pendant upload
- [ ] Responsive sur mobile

---

## 🎯 Prochaines Étapes (Optionnel)

### Court terme
- [ ] Créer page `/admin/practical-works` listant soumissions en attente
- [ ] Ajouter notifications email
- [ ] Export des notes en CSV

### Moyen terme
- [ ] Dashboard statistiques admin
- [ ] Graphiques de progression
- [ ] Système de commentaires
- [ ] Recherche avancée

### Long terme
- [ ] Intégration GitHub API
- [ ] Peer review
- [ ] Certificats automatiques
- [ ] Mode hors-ligne

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez la documentation**
   - [PRACTICAL_WORKS_QUICKSTART.md](docs/PRACTICAL_WORKS_QUICKSTART.md)
   - [PRACTICAL_WORKS_IMPLEMENTATION.md](docs/PRACTICAL_WORKS_IMPLEMENTATION.md)

2. **Vérifiez les fichiers créés**
   - Tous les fichiers sont commentés
   - Exemples d'utilisation inclus

3. **Testez dans la console Firebase**
   - Rules Playground pour Firestore
   - Storage tab pour les fichiers

4. **Vérifiez les logs**
   - Console navigateur (F12)
   - Console Firebase

---

## ✅ Une fois terminé

Cochez cette case quand tout fonctionne :

- [ ] **Le module Travaux Pratiques est opérationnel !** 🎉

---

**Temps estimé:** 10-15 minutes
**Difficulté:** Facile
**Prérequis:** Accès Firebase Console
