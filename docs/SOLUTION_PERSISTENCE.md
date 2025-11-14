# Solution au problème de persistance des quiz

## Problème identifié

**Erreur:** `RangeError: Invalid time value at Date.toISOString()`

**Cause:** Les dates dans les tentatives de quiz (`attempts[].date`) n'étaient pas correctement converties lors de la sauvegarde dans Firestore.

### Analyse détaillée

1. **Ligne 142 de progress.js** - La date était stockée comme `new Date().toISOString()` (string ISO)
2. **Fonction `prepareProgressForFirestore`** - Ne convertissait PAS les dates dans `module.attempts[]`
3. **Lors de la récupération depuis Firestore** - Les dates pouvaient être des Timestamps Firestore, des strings ISO, ou des valeurs invalides
4. **Résultat** - Firestore essayait de convertir une date invalide en Timestamp, causant l'erreur

## Corrections apportées

### 1. Conversion sécurisée vers Timestamp (Écriture)

**Fichier:** `src/services/firebase/firestore/progress.js`

**Ajout de la fonction helper `safeConvertToTimestamp`** (lignes 307-323):
```javascript
const safeConvertToTimestamp = (dateValue) => {
  if (!dateValue) return null;

  try {
    const date = new Date(dateValue);
    // Vérifier que la date est valide
    if (isNaN(date.getTime())) {
      console.warn('Invalid date detected:', dateValue);
      return null;
    }
    return Timestamp.fromDate(date);
  } catch (error) {
    console.warn('Error converting date to timestamp:', dateValue, error);
    return null;
  }
};
```

**Ajout de la conversion des dates dans `attempts`** (lignes 368-374):
```javascript
// IMPORTANT: Convertir les dates dans les tentatives (attempts)
if (module.attempts && Array.isArray(module.attempts)) {
  module.attempts = module.attempts.map((attempt) => ({
    ...attempt,
    date: attempt.date ? safeConvertToTimestamp(attempt.date) : Timestamp.now()
  }));
}
```

### 2. Conversion sécurisée vers Date (Lecture)

**Ajout de la fonction helper `safeConvertToDate`** (lignes 40-60):
```javascript
const safeConvertToDate = (value) => {
  if (!value) return null;

  try {
    // Si c'est un Timestamp Firestore
    if (value && typeof value.toDate === 'function') {
      return value.toDate();
    }
    // Si c'est déjà une Date ou une string
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date value detected:', value);
      return null;
    }
    return date;
  } catch (error) {
    console.warn('Error converting to date:', value, error);
    return null;
  }
};
```

**Amélioration de la conversion dans `getProgress`** - Toutes les dates utilisent maintenant `safeConvertToDate`

## Test de la solution

### 1. Nettoyer le localStorage (si nécessaire)

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Vérifier l'état actuel
console.log('Quiz store:', localStorage.getItem('quiz-storage'));
console.log('Auth store:', localStorage.getItem('auth-storage'));

// OPTIONNEL: Si vous voulez repartir de zéro (attention: supprime toutes les données locales)
// localStorage.removeItem('quiz-storage');
// location.reload();
```

### 2. Tester le module 2

1. **Lancez l'application** : `npm run dev`
2. **Connectez-vous**
3. **Complétez le quiz du module 2**
4. **Vérifiez les logs dans la console** :

Les logs devraient maintenant montrer :
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

**Pas d'erreur "Invalid time value" !**

### 3. Vérifier dans Firebase Console

1. Ouvrez **Firebase Console**
2. Allez dans **Firestore Database**
3. Collection `progress` → votre `userId`
4. Vérifiez la structure :

```
progress/
  {userId}/
    courses/
      {courseId}/
        modules/
          module-1/
            attempts: [
              {
                attemptId: "module-1-1234567890",
                date: Timestamp, ← Doit être un Timestamp Firestore
                score: 85,
                ...
              }
            ]
          module-2/
            attempts: [
              {
                attemptId: "module-2-9876543210",
                date: Timestamp, ← Doit être un Timestamp Firestore
                score: 92,
                ...
              }
            ]
```

### 4. Tester la persistance

1. **Complétez le quiz du module 2**
2. **Rafraîchissez la page** (F5)
3. **Vérifiez que le résultat est toujours affiché**
4. **Complétez le quiz du module 1**
5. **Rafraîchissez à nouveau**
6. **Les deux résultats doivent être persistés**

## Bénéfices des corrections

✅ **Gestion robuste des dates** - Validation avant conversion
✅ **Support de multiples formats** - String ISO, Date, Timestamp Firestore
✅ **Pas de crash** - Les dates invalides retournent `null` avec un warning
✅ **Logs détaillés** - Facilite le débogage futur
✅ **Conversion bidirectionnelle** - Lecture et écriture sécurisées

## Prévention d'erreurs futures

### Bonnes pratiques pour les dates dans Firestore

1. **Toujours utiliser `Timestamp.now()`** pour créer une nouvelle date Firestore
2. **Valider les dates** avant conversion avec `isNaN(date.getTime())`
3. **Utiliser des helpers** comme `safeConvertToTimestamp` et `safeConvertToDate`
4. **Logger les warnings** pour identifier les données invalides
5. **Tester avec différents scénarios** :
   - Premier module uniquement
   - Deuxième module uniquement
   - Plusieurs modules à la suite
   - Après rafraîchissement de page

## Code de vérification (pour tester)

Ajoutez temporairement dans la console après soumission d'un quiz :

```javascript
// Vérifier l'état du store local
const quizStore = JSON.parse(localStorage.getItem('quiz-storage'));
console.log('Modules avec attempts:',
  Object.entries(quizStore?.state?.userProgress?.courses || {})
    .map(([courseId, course]) => ({
      courseId,
      modules: Object.entries(course.modules || {})
        .map(([modId, mod]) => ({
          moduleId: modId,
          attemptsCount: mod.attempts?.length || 0,
          lastAttempt: mod.attempts?.[mod.attempts.length - 1]
        }))
    }))
);
```

## Support

Si le problème persiste après ces corrections :

1. **Vérifiez les règles Firestore** - Assurez-vous qu'il n'y a pas de restrictions
2. **Videz le cache** - Cache navigateur et localStorage
3. **Vérifiez les logs** - Recherchez d'autres warnings
4. **Contactez le support** - Avec les logs de console complets
