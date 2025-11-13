# Configuration Firebase pour l'Application Quiz

Ce document explique comment configurer et utiliser les fonctionnalités Firebase implémentées dans l'application.

## 📋 Services Firebase Implémentés

### 1. **Firebase Authentication**
- Inscription avec email/mot de passe
- Connexion avec email/mot de passe
- Déconnexion
- Gestion de l'état d'authentification
- Réinitialisation de mot de passe (à compléter)

### 2. **Cloud Firestore**
- Collection `users` : Profils des participants
- Collection `progress` : Progression des quiz par utilisateur
- Synchronisation automatique locale ↔ cloud

### 3. **Firebase Storage**
- Upload de photos de profil
- Redimensionnement automatique des images
- Suppression des anciennes photos

## 🚀 Configuration Initiale

### 1. Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez les services nécessaires

### 2. Activer Authentication

1. Dans Firebase Console, allez dans **Authentication**
2. Cliquez sur **Get Started**
3. Dans l'onglet **Sign-in method**, activez **Email/Password**

### 3. Créer une Base de Données Firestore

1. Allez dans **Firestore Database**
2. Cliquez sur **Create Database**
3. Choisissez **Start in production mode** (ou test mode pour le développement)
4. Sélectionnez une région (ex: `europe-west1`)

### 4. Configurer les Règles Firestore

Allez dans **Firestore Database > Rules** et ajoutez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Collection users - Lecture/écriture pour l'utilisateur propriétaire
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // Collection progress - Lecture/écriture pour l'utilisateur propriétaire
    match /progress/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Configurer Firebase Storage

1. Allez dans **Storage**
2. Cliquez sur **Get Started**
3. Acceptez les règles de sécurité par défaut

### 6. Configurer les Règles Storage

Allez dans **Storage > Rules** et ajoutez :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Photos de profil - Seul le propriétaire peut lire/écrire/supprimer
    match /profile-photos/{userId}_{timestamp}.{extension} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // Max 5MB
                   && request.resource.contentType.matches('image/.*');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 7. Obtenir les Clés de Configuration

1. Dans Firebase Console, allez dans **Project Settings** (icône engrenage)
2. Faites défiler jusqu'à **Your apps**
3. Cliquez sur l'icône Web `</>`
4. Copiez les valeurs de configuration

### 8. Configurer les Variables d'Environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ANALYTICS_ENABLED=true
```

⚠️ **Important** : Ajoutez `.env` au `.gitignore` pour ne pas commiter vos clés !

## 📊 Structure des Données

### Collection `users`

```javascript
{
  uid: "firebase_auth_uid",
  email: "user@example.com",
  fullName: "John Doe",
  photoURL: "https://storage.googleapis.com/...",
  phone: "+33612345678",
  company: "Mon Entreprise",
  jobTitle: "Développeur",
  level: "intermediate", // 'beginner' | 'intermediate' | 'advanced'
  goals: ["Maîtriser Flutter", "..."],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastConnexion: Timestamp,
  isActive: true,
  preferences: {
    emailNotifications: true,
    darkMode: false,
    language: "fr"
  }
}
```

### Collection `progress`

```javascript
{
  userId: "firebase_auth_uid",
  lastSync: Timestamp,
  modules: {
    "module-id": {
      moduleId: "module-id",
      status: "completed", // 'locked' | 'unlocked' | 'in_progress' | 'completed' | 'perfect'
      attempts: [
        {
          attemptId: "module-id-timestamp",
          attemptNumber: 1,
          date: "2025-01-12T10:30:00.000Z",
          score: 85,
          correctCount: 17,
          totalQuestions: 20,
          earnedPoints: 170,
          totalPoints: 200,
          timeSpent: 450, // en secondes
          answers: { /* détails */ }
        }
      ],
      bestScore: 85,
      lastAttemptDate: Timestamp,
      completedAt: Timestamp,
      firstAttemptDate: Timestamp,
      totalTimeSpent: 450
    }
  },
  globalStats: {
    totalModulesCompleted: 5,
    totalQuizzesTaken: 12,
    averageScore: 78,
    totalTimeSpent: 5400,
    currentStreak: 3,
    longestStreak: 7,
    badges: ["first_quiz", "quiz_master_10", "..."],
    lastActivityDate: Timestamp,
    perfectScoresCount: 2
  }
}
```

## 🎯 Utilisation dans l'Application

### 1. AuthContext - Authentification

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, profile, isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;

  if (!isAuthenticated) {
    return <Redirect to="/auth" />;
  }

  return <div>Bienvenue {profile.fullName}</div>;
}
```

### 2. Synchronisation Automatique

```javascript
import { useProgressSync } from './hooks/useProgressSync';

function App() {
  // Synchronise automatiquement la progression
  const { syncToFirebase, saveAttempt } = useProgressSync();

  // La synchronisation se fait automatiquement :
  // - Au chargement de l'app
  // - Toutes les 5 minutes
  // - Avant de quitter l'app

  return <AppContent />;
}
```

### 3. Sauvegarder une Tentative de Quiz

```javascript
import { useProgressSync } from './hooks/useProgressSync';

function QuizResults() {
  const { saveAttempt } = useProgressSync();

  const handleSaveResults = async () => {
    await saveAttempt(moduleId, {
      score: 85,
      correctCount: 17,
      totalQuestions: 20,
      earnedPoints: 170,
      totalPoints: 200,
      timeSpent: 450
    }, answersDetails);
  };

  return <button onClick={handleSaveResults}>Sauvegarder</button>;
}
```

### 4. Upload de Photo de Profil

```javascript
import { uploadProfilePhoto } from './services/firebase/firestorage/profilePhoto';

function ProfileEditor({ userId }) {
  const handlePhotoUpload = async (file) => {
    const downloadURL = await uploadProfilePhoto(userId, file, {
      onProgress: (progress) => {
        console.log(`Upload: ${progress}%`);
      },
      onError: (error) => {
        console.error(error);
      },
      onSuccess: (url) => {
        console.log('Upload réussi:', url);
      }
    });

    return downloadURL;
  };
}
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter les clés** : Utilisez `.env` et `.gitignore`
2. **Règles Firestore strictes** : Seul le propriétaire peut accéder à ses données
3. **Validation côté serveur** : À implémenter avec Cloud Functions si nécessaire
4. **Limitation de taille** : Photos limitées à 5MB
5. **Types de fichiers** : Seulement JPG, PNG, WebP autorisés

### Règles de Sécurité Avancées (Optionnel)

Pour une sécurité renforcée, vous pouvez ajouter des Cloud Functions pour :
- Valider les données avant l'écriture
- Nettoyer les anciennes photos automatiquement
- Générer des miniatures
- Envoyer des emails de notification

## 📈 Monitoring

### Firebase Console

Surveillez dans Firebase Console :
- **Authentication** : Nombre d'utilisateurs, tentatives échouées
- **Firestore** : Lectures/écritures, erreurs
- **Storage** : Espace utilisé, bande passante
- **Analytics** : Événements personnalisés (déjà configuré)

### Logs de l'Application

Les services Firebase logguent automatiquement dans la console :
```javascript
console.log('Progress synced to Firebase');
console.log('Quiz attempt saved to Firebase and locally');
console.error('Error syncing progress to Firebase:', error);
```

## 🚨 Dépannage

### Erreur "Permission Denied"

**Cause** : Règles Firestore/Storage trop restrictives ou utilisateur non authentifié

**Solution** :
1. Vérifiez que l'utilisateur est bien connecté
2. Vérifiez les règles dans Firebase Console
3. En développement, utilisez temporairement le mode test

### Erreur "Firebase App Not Initialized"

**Cause** : Configuration Firebase manquante ou incorrecte

**Solution** :
1. Vérifiez le fichier `.env`
2. Vérifiez que les variables commencent par `VITE_`
3. Redémarrez le serveur de développement

### Les Données ne se Synchronisent pas

**Cause** : Problème de connexion ou erreur silencieuse

**Solution** :
1. Ouvrez la console du navigateur
2. Vérifiez les logs d'erreur
3. Testez la connexion Firebase manuellement
4. Vérifiez que `useProgressSync` est bien appelé dans App

## 📚 Ressources

- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Firestore](https://firebase.google.com/docs/firestore)
- [Documentation Storage](https://firebase.google.com/docs/storage)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

## 🎓 Prochaines Étapes

- [ ] Implémenter la réinitialisation de mot de passe
- [ ] Ajouter l'authentification par fournisseurs (Google, GitHub)
- [ ] Créer des Cloud Functions pour la validation serveur
- [ ] Ajouter des miniatures de photos automatiques
- [ ] Implémenter la suppression de compte
- [ ] Ajouter des notifications push
