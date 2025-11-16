# 🔧 Guide de Dépannage - Module Travaux Pratiques

## Erreurs Courantes et Solutions

---

### ❌ Erreur: `progress.attempts.filter is not a function`

**Message complet:**
```
Uncaught TypeError: progress.attempts.filter is not a function
    at getBestAttempt (practicalWork.js:438:47)
```

**Cause:**
Firestore peut retourner `attempts` comme `undefined` ou `null` au lieu d'un tableau vide.

**Solution:**
✅ **Déjà corrigé dans la version actuelle !**

Les fichiers suivants ont été mis à jour avec des validations supplémentaires :
- `src/models/practicalWork.js` - Fonctions `getLatestAttempt`, `getBestAttempt`, `calculateProgressStatus`
- `src/services/firebase/firestore/practicalWorks.js` - Fonction `convertTimestamps`

**Si l'erreur persiste:**

1. **Vérifier les données Firestore existantes**
   - Ouvrir Firebase Console
   - Collection `practicalWorkProgress`
   - Vérifier que `attempts: []` existe dans les documents
   - Si manquant, supprimer les documents de test

2. **Réinitialiser la progression**
   ```javascript
   // Dans la console navigateur
   localStorage.clear();
   // Rafraîchir la page
   ```

3. **Recréer la progression**
   - Supprimer les documents de test dans Firestore
   - Re-cliquer sur "Commencer ce TP"

---

### ❌ Erreur: `Permission denied` lors de la consultation des TPs

**Cause:**
Les règles Firestore ne sont pas déployées ou incorrectes.

**Solution:**

1. **Vérifier que les règles sont déployées**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Tester dans Rules Playground**
   - Firebase Console → Firestore → Rules
   - Onglet "Rules playground"
   - Tester avec :
     - Collection: `practicalWorkProgress`
     - Document: `{userId}_{practicalWorkId}`
     - Operation: `get`
     - Authenticated: `yes`

3. **Vérifier la structure des règles**
   ```javascript
   match /practicalWorkProgress/{progressId} {
     allow read: if request.auth != null
       && (resource.data.userId == request.auth.uid
           || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
           || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor');
   }
   ```

---

### ❌ Erreur: `Permission denied` lors de l'upload de fichier

**Cause:**
Les règles Storage ne sont pas déployées.

**Solution:**

1. **Déployer les règles Storage**
   ```bash
   firebase deploy --only storage
   ```

2. **Vérifier la taille du fichier**
   - Maximum: 10MB
   - Vérifier avec : `file.size < 10 * 1024 * 1024`

3. **Vérifier le type de fichier**
   - Autorisés: PDF, ZIP, images (JPG, PNG, GIF), vidéos (MP4, QuickTime)
   - Regex: `application/pdf|application/zip|application/x-zip-compressed|image/.*|video/.*`

4. **Structure du path Storage**
   ```
   practical-works/{userId}/{practicalWorkId}/{fileName}
   ```

---

### ❌ Erreur: `Module not found: react-markdown`

**Cause:**
Package `react-markdown` non installé.

**Solution:**
```bash
npm install react-markdown
# ou
yarn add react-markdown
```

---

### ❌ Les TPs ne s'affichent pas dans la liste

**Causes possibles:**

1. **Mauvais courseId dans l'URL**
   - Vérifier : `/course/flutter-advanced/practical-works`
   - Le courseId doit être exactement `flutter-advanced`

2. **Import manquant**
   ```javascript
   // Dans PracticalWorksList.jsx
   import { getSortedPracticalWorks } from '../data/practicalWorks';
   ```

3. **Erreur JavaScript**
   - Ouvrir Console (F12)
   - Vérifier les erreurs
   - Regarder l'onglet Network pour les requêtes échouées

**Solution:**
```javascript
// Vérifier dans la console
console.log('PracticalWorks:', practicalWorks);
console.log('Course ID:', courseId);
```

---

### ❌ Upload bloqué / Pas de barre de progression

**Cause:**
Fonction `uploadPracticalWorkFile` non appelée correctement.

**Solution:**

1. **Vérifier la callback de progression**
   ```javascript
   await uploadPracticalWorkFile(
     file,
     userId,
     practicalWorkId,
     deliverableId,
     (percent) => {
       console.log('Upload progress:', percent);
       setUploadProgress(prev => ({ ...prev, [deliverableId]: percent }));
     }
   );
   ```

2. **Vérifier Storage initialisé**
   ```javascript
   // Dans config/firebase.js
   import { storage } from './firebase';
   console.log('Storage:', storage);
   ```

---

### ❌ Soumission ne s'enregistre pas

**Causes possibles:**

1. **Validation échouée**
   - Vérifier que tous les livrables requis sont remplis
   - Console : `validateSubmission()` retourne `false`

2. **Erreur Firestore**
   - Console : Vérifier les erreurs Firestore
   - Règles : Vérifier que l'utilisateur peut `create` dans `practicalWorkProgress`

3. **Service non importé**
   ```javascript
   import { submitPracticalWork } from '../services/firebase/firestore/practicalWorks';
   ```

**Solution:**
```javascript
// Ajouter des logs
console.log('Deliverables to submit:', deliverableValues);
console.log('User ID:', user.uid);
console.log('Practical Work ID:', practicalWorkId);
```

---

### ❌ Évaluation ne s'affiche pas pour l'étudiant

**Cause:**
Conversion des dates ou structure incorrecte.

**Solution:**

1. **Vérifier la structure dans Firestore**
   - Document : `practicalWorkProgress/{userId}_{practicalWorkId}`
   - Vérifier : `attempts[0].evaluation` existe

2. **Vérifier la fonction `getLatestAttempt`**
   ```javascript
   const latestAttempt = getLatestAttempt(progress);
   console.log('Latest attempt:', latestAttempt);
   console.log('Evaluation:', latestAttempt?.evaluation);
   ```

3. **Re-évaluer la soumission**
   - Supprimer l'évaluation existante
   - Re-soumettre depuis l'interface instructeur

---

### ❌ Interface instructeur inaccessible

**Cause:**
Route incorrecte ou permissions.

**Solution:**

1. **Vérifier la route**
   ```
   /admin/practical-work/{practicalWorkId}/review/{userId}
   ```

   Exemple correct:
   ```
   /admin/practical-work/tp-05-calculatrice/review/abc123def456
   ```

2. **Vérifier les permissions**
   ```javascript
   // Dans Navbar ou useAuth
   console.log('Is Admin:', profile?.isAdmin);
   console.log('Role:', profile?.role);
   ```

3. **Route protégée**
   - Ajouter `ProtectedRoute` si nécessaire
   - Vérifier `isAdmin || role === 'instructor'`

---

### ❌ Images/Markdown ne s'affichent pas

**Cause:**
Package `react-markdown` manquant ou configuration.

**Solution:**

1. **Installer le package**
   ```bash
   npm install react-markdown
   ```

2. **Vérifier l'import**
   ```javascript
   import ReactMarkdown from 'react-markdown';
   ```

3. **Utilisation correcte**
   ```jsx
   <ReactMarkdown>{practicalWork.instructions}</ReactMarkdown>
   ```

---

### ❌ Erreur: `Cannot read property 'totalScore' of undefined`

**Cause:**
Évaluation non encore créée.

**Solution:**

✅ **Déjà protégé dans le code avec optional chaining**

```javascript
const totalScore = attempt.evaluation?.totalScore || 0;
```

Si l'erreur persiste, ajouter une vérification :
```javascript
if (!attempt || !attempt.evaluation) {
  return <Alert severity="info">Pas encore évalué</Alert>;
}
```

---

## 🔍 Débogage Général

### Console Navigateur (F12)

**Logs utiles à ajouter:**

```javascript
// Dans PracticalWorkDetail.jsx
console.log('Practical Work:', practicalWork);
console.log('Progress:', progress);
console.log('Latest Attempt:', getLatestAttempt(progress));
console.log('Best Attempt:', getBestAttempt(progress));
```

### Firestore Console

**Vérifications:**

1. **Collection `practicalWorkProgress`**
   - Documents existent
   - Structure correcte
   - `attempts` est un tableau

2. **Collection `users`**
   - Profil utilisateur existe
   - `isAdmin` ou `role` correctement défini

3. **Règles**
   - Testées dans Rules Playground
   - Pas d'erreurs de syntaxe

### Network Tab

**Vérifier:**
- Requêtes Firestore (200 OK)
- Upload Storage (pas de 403)
- Temps de réponse

---

## 📞 Support Avancé

### Réinitialisation Complète

Si tout échoue :

```bash
# 1. Supprimer tous les documents de test
# Firebase Console → Firestore → practicalWorkProgress → Supprimer

# 2. Vider le cache local
# Console navigateur:
localStorage.clear();
sessionStorage.clear();

# 3. Re-déployer les règles
firebase deploy --only firestore:rules,storage

# 4. Rebuild l'application
npm run build

# 5. Rafraîchir (Ctrl+Shift+R)
```

### Logs Détaillés

Activer les logs Firebase :

```javascript
// Dans config/firebase.js
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

---

## ✅ Checklist de Vérification

Avant de démarrer le débogage :

- [ ] `npm install react-markdown` exécuté
- [ ] Règles Firestore déployées
- [ ] Règles Storage déployées
- [ ] Build sans erreurs (`npm run build`)
- [ ] Console navigateur ouverte (F12)
- [ ] Connecté en tant qu'utilisateur valide
- [ ] CourseId correct dans l'URL
- [ ] Firestore Console accessible

---

**Dernière mise à jour:** 16 novembre 2025
**Version:** 1.1
