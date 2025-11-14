# Guide de débogage - Persistance des quiz

## Problème
Les quiz du deuxième module ne sont pas persistés dans Firestore.

## Points à vérifier

### 1. Console du navigateur
Ouvrez la console du navigateur (F12) et vérifiez les logs lors de la soumission d'un quiz :

#### Logs attendus (dans l'ordre)
```
🟡 [QuizSession] Sauvegarde du quiz avec saveAttempt: {...}
🟡 [useProgressSync] saveAttempt appelé: {...}
🟢 [useProgressSync] Sauvegarde dans Firebase...
🔵 [Firebase progress.js] saveQuizAttempt appelé: {...}
🔵 [Firebase progress.js] Progression récupérée: {...}
🟢 [Firebase progress.js] Données préparées pour Firestore: {...}
✅ [Firebase progress.js] Progression sauvegardée dans Firestore
🟢 [useProgressSync] Sauvegarde locale...
✅ [useProgressSync] Quiz attempt saved to Firebase and locally
```

### 2. Vérifications spécifiques

#### A. Vérifier l'authentification
Dans la console, tapez :
```javascript
// Vérifier l'état d'authentification
console.log('User:', JSON.parse(localStorage.getItem('auth-storage'))?.state?.user);
```

#### B. Vérifier les paramètres du quiz
Lors de la soumission, vérifiez dans les logs :
- `courseId` : doit être présent et valide
- `moduleId` : doit correspondre au module actuel
- `results` : doit contenir score, correctCount, totalQuestions, etc.
- `answers` : doit contenir toutes les réponses

#### C. Vérifier Firestore directement
1. Ouvrez Firebase Console
2. Allez dans Firestore Database
3. Collection `progress` > Document avec votre `userId`
4. Vérifiez la structure :
   ```
   progress/{userId}/
     courses/
       {courseId}/
         modules/
           {moduleId}/
             attempts: [...]
             bestScore: X
             status: "completed"
   ```

### 3. Erreurs potentielles

#### Erreur A : Règles Firestore
Si vous voyez une erreur comme :
```
Error saving quiz attempt to Firebase: FirebaseError: Missing or insufficient permissions
```

**Cause** : Les règles Firestore bloquent l'écriture pour ce module.

**Solution** : Vérifier les règles Firestore (si elles existent) :
```javascript
// Règle correcte pour permettre l'écriture
match /progress/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

#### Erreur B : courseId ou moduleId invalide
Si vous voyez dans les logs :
```
courseId: undefined
ou
moduleId: undefined
```

**Cause** : Les paramètres de route ne sont pas correctement passés.

**Solution** : Vérifier la navigation et les paramètres de route.

#### Erreur C : Structure de données incorrecte
Si vous voyez :
```
Error updating document: Cannot read properties of undefined
```

**Cause** : La structure de `progress.courses[courseId]` n'existe pas.

**Solution déjà implémentée** : Le code crée automatiquement la structure (ligne 124-127 de progress.js).

### 4. Tests manuels à effectuer

#### Test 1 : Vérifier que le premier module persiste
1. Complétez le quiz du module 1
2. Rafraîchissez la page
3. Vérifiez que le résultat est toujours là

#### Test 2 : Vérifier que le deuxième module persiste
1. Complétez le quiz du module 2
2. Rafraîchissez la page
3. Vérifiez que le résultat est toujours là

#### Test 3 : Vérifier l'état dans Firestore
1. Ouvrez Firebase Console
2. Vérifiez manuellement que les deux tentatives sont sauvegardées

### 5. Code de débogage à ajouter temporairement

#### Dans QuizSession.jsx (ligne 172)
Ajoutez plus de logs :
```javascript
const handleSubmit = () => {
  // ... code existant ...

  console.log('🔍 [DEBUG] handleSubmit - Détails complets:', {
    courseId,
    moduleId,
    results,
    answers,
    answersKeys: Object.keys(answers),
    questionsCount: questions.length,
    isAuthenticated,
    userId: user?.uid,
    currentSession
  });

  saveAttempt(courseId, moduleId, results, answers);
  // ...
};
```

#### Dans useProgressSync.js (ligne 72)
Ajoutez un log après l'appel Firebase :
```javascript
try {
  console.log('🟢 [useProgressSync] Sauvegarde dans Firebase...');
  await saveQuizAttempt(user.uid, courseId, moduleId, results, answers);

  console.log('✅ [useProgressSync] Retour de saveQuizAttempt réussi');

  // ... reste du code
} catch (error) {
  console.error('❌ [useProgressSync] Détails de l\'erreur:', {
    message: error.message,
    code: error.code,
    stack: error.stack,
    userId: user.uid,
    courseId,
    moduleId
  });
  // ...
}
```

#### Dans progress.js (ligne 120)
Ajoutez un log détaillé de la progression récupérée :
```javascript
const progress = await getProgress(userId);
console.log('🔵 [Firebase progress.js] Progression récupérée:', {
  userId,
  coursesKeys: Object.keys(progress.courses || {}),
  hasCourse: !!progress.courses[courseId],
  courseModules: progress.courses[courseId] ? Object.keys(progress.courses[courseId].modules || {}) : [],
  hasModule: !!(progress.courses[courseId]?.modules[moduleId])
});
```

### 6. Scénarios à tester

#### Scénario 1 : Module 1 puis Module 2 (même session)
1. Complétez le quiz du module 1
2. Sans rafraîchir, complétez le quiz du module 2
3. Vérifiez dans Firestore que les deux sont sauvegardés

#### Scénario 2 : Module 1, rafraîchir, puis Module 2
1. Complétez le quiz du module 1
2. Rafraîchissez la page
3. Complétez le quiz du module 2
4. Vérifiez dans Firestore

#### Scénario 3 : Directement Module 2
1. Complétez uniquement le quiz du module 2
2. Vérifiez dans Firestore

### 7. Checklist de diagnostic

- [ ] Les logs apparaissent dans la console lors de la soumission ?
- [ ] L'utilisateur est authentifié (user.uid présent) ?
- [ ] Le courseId et moduleId sont corrects et non undefined ?
- [ ] Les résultats (results) contiennent bien toutes les données ?
- [ ] Les réponses (answers) sont présentes et non vides ?
- [ ] Aucune erreur n'apparaît dans la console ?
- [ ] La progression est visible dans Firebase Console ?
- [ ] Les deux modules apparaissent dans `progress.courses[courseId].modules` ?

### 8. Solution rapide si le problème persiste

Si après tous ces tests, le problème persiste uniquement pour le module 2, vérifiez :

1. **Les règles Firestore** : Peut-être y a-t-il une limitation sur le nombre de modules ou une validation spécifique
2. **La taille des données** : Si le module 2 a beaucoup plus de questions, peut-être que la limite de taille Firestore est atteinte
3. **Le cache navigateur** : Videz le cache et réessayez
4. **Le localStorage** : Vérifiez que le store Zustand n'a pas de problème :
   ```javascript
   console.log('Zustand store:', localStorage.getItem('quiz-storage'));
   ```

## Prochaines étapes

1. Lancez l'application en mode développement
2. Ouvrez la console du navigateur
3. Complétez un quiz sur le module 2
4. Observez les logs et notez toute erreur ou comportement anormal
5. Comparez avec les logs attendus ci-dessus
6. Identifiez à quelle étape le processus échoue
