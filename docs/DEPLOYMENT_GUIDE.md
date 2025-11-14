# Guide de Déploiement - Système d'Activation des Modules

Ce guide vous explique comment déployer et tester le nouveau système d'activation des modules de quiz.

## 📋 Récapitulatif des Fonctionnalités Ajoutées

### 1. Révision des Réponses Incorrectes
- Affichage détaillé des questions manquées après un quiz
- Comparaison entre la réponse de l'utilisateur et la bonne réponse
- Explications détaillées pour chaque question
- 2-3 ressources d'apprentissage par question (documentation, articles, vidéos, tutoriels)

### 2. Système d'Activation des Modules
- Les administrateurs et modérateurs peuvent activer/désactiver des modules
- Activation immédiate ou programmée à une date future
- Interface d'administration complète avec tableaux et filtres
- Synchronisation automatique entre le code et Firestore

## 🗂️ Fichiers Créés/Modifiés

### Nouveaux Fichiers
1. **`src/models/moduleActivation.js`** - Modèle de données avec validation
2. **`src/services/firebase/firestore/moduleActivation.js`** - Services CRUD pour Firestore
3. **`src/hooks/useModuleActivation.js`** - Hooks React pour l'activation
4. **`src/pages/AdminModules.jsx`** - Interface d'administration complète
5. **`src/scripts/migrateModules.js`** - Script de migration pour initialiser les modules
6. **`firestore-rules-module-activation.rules`** - Règles de sécurité Firestore

### Fichiers Modifiés
1. **`src/services/geminiQuiz.js`** - Ajout du champ resources et modification du prompt
2. **`src/pages/QuizSession.jsx`** - Transmission des questions et réponses aux résultats
3. **`src/pages/Results.jsx`** - Section de révision avec accordéons
4. **`src/components/Dashboard/ModuleCard.jsx`** - Vérification de l'activation avec alertes
5. **`src/pages/ModuleDetail.jsx`** - Vérification de l'activation avec bannière
6. **`src/App.jsx`** - Ajout de la route admin et import du script de migration
7. **`src/pages/AdminDashboard.jsx`** - Bouton de navigation vers la gestion des modules

## 🚀 Étapes de Déploiement

### Étape 1: Déployer les Règles Firestore

Les règles de sécurité doivent être ajoutées à votre configuration Firestore existante.

#### Option A: Via la Console Firebase (Recommandé)
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Dans le menu latéral, cliquez sur **Firestore Database**
4. Allez dans l'onglet **Règles**
5. Ajoutez les règles suivantes dans votre fichier de règles existant :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ... vos règles existantes pour users, progress, etc. ...

    // Règles pour moduleActivation
    match /moduleActivation/{moduleId} {
      // Lecture : Tous les utilisateurs authentifiés peuvent lire les activations
      allow read: if request.auth != null;

      // Création : Seulement les admins et modérateurs
      allow create: if request.auth != null
        && (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
          || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator == true
        );

      // Mise à jour : Seulement les admins et modérateurs
      allow update: if request.auth != null
        && (
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
          || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isModerator == true
        )
        // Validation : s'assurer que les champs obligatoires sont présents
        && request.resource.data.keys().hasAll(['moduleId', 'courseId', 'isActive'])
        // Validation : s'assurer que moduleId ne peut pas être modifié
        && request.resource.data.moduleId == resource.data.moduleId
        // Validation : s'assurer que courseId ne peut pas être modifié
        && request.resource.data.courseId == resource.data.courseId;

      // Suppression : Seulement les admins (pas les modérateurs)
      allow delete: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

6. Cliquez sur **Publier**

#### Option B: Via Firebase CLI
```bash
# 1. Créer un fichier firestore.rules à la racine du projet
# 2. Y copier les règles ci-dessus
# 3. Déployer
firebase deploy --only firestore:rules
```

### Étape 2: Installer les Dépendances Manquantes

Vérifiez que toutes les dépendances nécessaires sont installées :

```bash
npm install @mui/x-date-pickers date-fns
```

### Étape 3: Builder l'Application

```bash
npm run build
```

### Étape 4: Déployer sur Firebase Hosting

```bash
firebase deploy --only hosting
```

## 🧪 Tests à Effectuer

### Test 1: Migration des Modules

1. **Ouvrez l'application dans votre navigateur**
2. **Ouvrez la console du navigateur** (F12)
3. **Lancez la migration** :
   ```javascript
   await window.migrateModules()
   ```
4. **Vérifiez la sortie** :
   - Vous devriez voir un résumé indiquant le nombre de modules créés
   - Exemple : `✅ Migration terminée avec succès ! Créés: 15, Ignorés: 0, Erreurs: 0`

5. **Vérifiez dans Firestore** :
   - Allez dans Firebase Console > Firestore Database
   - Vous devriez voir une nouvelle collection `moduleActivation`
   - Chaque document doit avoir les champs : `moduleId`, `courseId`, `isActive`, `activatedBy`, `createdAt`, `updatedAt`

### Test 2: Interface d'Administration

1. **Connectez-vous en tant qu'administrateur**
2. **Accédez au tableau de bord admin** : `/admin`
3. **Cliquez sur "Gérer les Modules"**
4. **Testez les fonctionnalités** :

   ✅ **Affichage des modules** :
   - Vérifiez que tous les modules s'affichent avec leur statut actuel
   - Les badges doivent montrer "Actif" ou "Inactif"

   ✅ **Activation/Désactivation immédiate** :
   - Basculez le switch d'un module inactif vers actif
   - Vérifiez que le badge change en "Actif"
   - Basculez-le de nouveau vers inactif

   ✅ **Programmation d'activation** :
   - Cliquez sur "Programmer" pour un module
   - Sélectionnez une date future (par exemple, dans 5 minutes pour tester rapidement)
   - Cliquez sur "Programmer l'activation"
   - Vérifiez que le badge montre "Programmé pour le [date]"

   ✅ **Filtres** :
   - Testez les onglets "Tous", "Actifs", "Inactifs", "Programmés"
   - Vérifiez que le filtrage fonctionne correctement

### Test 3: Expérience Utilisateur (Étudiant)

1. **Connectez-vous avec un compte étudiant (non-admin)**
2. **Accédez à une formation**
3. **Testez un module inactif** :

   ✅ **Dans la liste des modules** :
   - Le module inactif doit afficher une alerte
   - Le bouton "Commencer" doit être désactivé
   - L'effet hover ne doit pas s'appliquer

   ✅ **Dans la page de détail** :
   - Une bannière d'alerte doit s'afficher en haut
   - Le message doit expliquer pourquoi le module n'est pas disponible
   - Le bouton "Commencer le quiz" doit être désactivé

4. **Testez un module programmé** :
   - L'alerte doit indiquer "Module programmé pour le [date]"
   - Après la date de programmation, le module doit devenir accessible automatiquement

5. **Testez un module actif** :
   - Le module doit être accessible normalement
   - Vous devez pouvoir démarrer et compléter le quiz

### Test 4: Section de Révision des Résultats

1. **Complétez un quiz avec quelques réponses incorrectes**
2. **Sur la page de résultats** :

   ✅ **Section "Révision des Questions Manquées"** :
   - Doit s'afficher uniquement s'il y a des réponses incorrectes
   - Chaque question manquée doit avoir un accordéon

   ✅ **Dans chaque accordéon** :
   - Affiche la question avec son numéro
   - Montre votre réponse incorrecte en rouge
   - Montre la bonne réponse en vert
   - Affiche une explication détaillée
   - Liste 2-3 ressources d'apprentissage avec :
     - Titre de la ressource
     - Type (documentation, article, vidéo, tutoriel) avec icône
     - Lien cliquable qui s'ouvre dans un nouvel onglet

## 🔍 Vérifications Post-Déploiement

### Vérification 1: Données Firestore
```javascript
// Dans la console du navigateur
const activations = await getAllModuleActivations();
console.table(activations);
```

Vous devriez voir un tableau avec tous les modules et leur statut d'activation.

### Vérification 2: Intégrité des Règles de Sécurité

Testez les permissions dans la console Firebase :
1. Allez dans Firestore > Règles > Simulateur
2. Testez une lecture en tant qu'utilisateur authentifié (devrait réussir)
3. Testez une écriture en tant qu'utilisateur non-admin (devrait échouer)
4. Testez une écriture en tant qu'admin (devrait réussir)

### Vérification 3: Performance

- Vérifiez que le chargement des modules reste rapide
- Le hook `useModuleActivation` utilise un cache pour éviter les lectures multiples
- Les règles Firestore sont optimisées pour minimiser les lectures

## 🐛 Dépannage

### Problème: Les modules ne s'affichent pas dans l'admin

**Solution** :
1. Vérifiez que vous êtes connecté en tant qu'admin
2. Vérifiez dans votre profil Firestore que `isAdmin: true` ou `isModerator: true`
3. Ouvrez la console et cherchez les erreurs

### Problème: La migration échoue

**Solution** :
1. Vérifiez que les règles Firestore sont déployées
2. Vérifiez que votre compte a les permissions admin
3. Regardez les erreurs dans la console du navigateur
4. Vous pouvez migrer une formation à la fois :
   ```javascript
   await window.migrateCourseModules('auth-oidc-oauth2')
   ```

### Problème: Les modules restent verrouillés même quand actifs

**Solution** :
1. Vérifiez que le module précédent est validé (score ≥ 70%)
2. Le système d'activation s'ajoute au système de progression existant
3. Un module doit être :
   - Activé dans Firestore (nouveau système)
   - ET accessible selon la progression (ancien système)

### Problème: Les ressources ne s'affichent pas dans les résultats

**Solution** :
1. Videz le cache des quiz : allez dans DevTools > Application > Local Storage > Supprimer
2. Régénérez un nouveau quiz avec le bouton "Régénérer le quiz"
3. Vérifiez que le prompt AI inclut bien la demande de ressources

## 📊 Statistiques et Monitoring

Pour suivre l'utilisation du système :

```javascript
// Obtenir les statistiques d'activation
const stats = {
  totalModules: MODULES_DATA.length,
  activeModules: activations.filter(a => a.isActive).length,
  scheduledModules: activations.filter(a => a.scheduledActivation).length,
};
console.table(stats);
```

## 🔐 Sécurité

Le système implémente plusieurs niveaux de sécurité :

1. **Règles Firestore** : Contrôlent l'accès aux données au niveau de la base de données
2. **Vérification côté client** : Vérifie les permissions avant l'affichage
3. **Validation des données** : S'assure que les champs obligatoires sont présents
4. **Champs immutables** : `moduleId` et `courseId` ne peuvent pas être modifiés après création

## 📝 Maintenance

### Ajouter un Nouveau Module

Lorsque vous ajoutez un nouveau module dans `src/data/modules.js` :

1. Le module sera automatiquement créé dans Firestore lors de sa première consultation
2. Par défaut, il sera inactif (sauf s'il est marqué `isFirst: true`)
3. Un admin devra l'activer manuellement via l'interface admin

### Désactiver Temporairement un Module

Si vous devez désactiver un module temporairement (maintenance, mise à jour du contenu) :

1. Allez dans l'interface admin
2. Désactivez le module avec le switch
3. Ajoutez une raison dans le champ "Raison"
4. Le module sera immédiatement inaccessible pour tous les utilisateurs

## ✅ Checklist Finale

Avant de considérer le déploiement comme complet :

- [ ] Règles Firestore déployées et testées
- [ ] Migration des modules exécutée avec succès
- [ ] Interface admin accessible et fonctionnelle
- [ ] Activation/désactivation immédiate testée
- [ ] Programmation d'activation testée
- [ ] Expérience utilisateur (étudiant) testée
- [ ] Section de révision des résultats testée
- [ ] Ressources d'apprentissage s'affichent correctement
- [ ] Performance satisfaisante (chargement < 2s)
- [ ] Aucune erreur dans la console du navigateur

## 🎉 Félicitations !

Si tous les tests sont au vert, votre système d'activation des modules est prêt à être utilisé en production !

Pour toute question ou problème, consultez les logs dans la console du navigateur ou Firestore pour diagnostiquer les problèmes.
