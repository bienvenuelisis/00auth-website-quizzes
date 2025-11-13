# Exemples d'Utilisation - Système d'Authentification et Profils

Ce document fournit des exemples concrets d'utilisation des fonctionnalités Firebase implémentées.

## 🔐 Authentification

### Inscription d'un Nouveau Participant

```jsx
import { registerNewUser } from './services/firebase/firestore/auth';
import { initializeProgress } from './services/firebase/firestore/progress';

function SignUpPage() {
  const handleSignUp = async (formData) => {
    try {
      await registerNewUser({
        formData: {
          email: 'participant@example.com',
          password: 'securePassword123',
          fullName: 'Jean Dupont',
          phone: '+33612345678',
          company: 'Tech Corp',
          jobTitle: 'Développeur Mobile',
          level: 'intermediate',
          goals: ['Maîtriser Flutter', 'Créer mon portfolio']
        },
        onSuccess: async ({ credential, userDocId }) => {
          // Initialiser la progression
          await initializeProgress(credential.user.uid);

          console.log('Inscription réussie !');
          // Rediriger vers le dashboard
        },
        onError: (errorMessage) => {
          console.error('Erreur:', errorMessage);
          alert(errorMessage);
        },
        onLogOut: () => {
          // Gérer la déconnexion automatique
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  return <SignUpForm onSubmit={handleSignUp} />;
}
```

### Connexion d'un Participant

```jsx
import { signInUser } from './services/firebase/firestore/auth';

function LoginPage() {
  const handleLogin = async (email, password) => {
    try {
      await signInUser({
        formData: { email, password },
        onSuccess: ({ user, credential }) => {
          console.log('Connexion réussie:', user);
          // Rediriger vers le dashboard
        },
        onError: (errorMessage) => {
          console.error('Erreur:', errorMessage);
          alert(errorMessage);
        },
        onLogOut: () => {
          // Gérer la déconnexion automatique
        }
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

### Déconnexion

```jsx
import { signOutCurrentUser } from './services/firebase/auth';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutCurrentUser();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return <button onClick={handleLogout}>Se déconnecter</button>;
}
```

## 👤 Gestion des Profils

### Récupérer le Profil Utilisateur

```jsx
import { useEffect, useState } from 'react';
import { getProfile } from './services/firebase/firestore/profile';
import { useAuth } from './contexts/AuthContext';

function ProfileDisplay() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const data = await getProfile(user.uid);
        setProfile(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (loading) return <div>Chargement...</div>;
  if (!profile) return <div>Profil non trouvé</div>;

  return (
    <div>
      <h2>{profile.fullName}</h2>
      <p>Email: {profile.email}</p>
      <p>Entreprise: {profile.company}</p>
      <p>Niveau: {profile.level}</p>
    </div>
  );
}
```

### Mettre à Jour le Profil

```jsx
import { updateProfile } from './services/firebase/firestore/profile';
import { useAuth } from './contexts/AuthContext';

function EditProfileForm() {
  const { user, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    company: '',
    jobTitle: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(user.uid, formData);
      await refreshProfile(); // Rafraîchir le profil dans le contexte
      alert('Profil mis à jour !');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        placeholder="Nom complet"
      />
      {/* Autres champs */}
      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

### Upload de Photo de Profil

```jsx
import { useState, useRef } from 'react';
import { uploadProfilePhoto, deleteProfilePhoto } from './services/firebase/firestorage/profilePhoto';
import { updateProfilePhoto } from './services/firebase/firestore/profile';
import { useAuth } from './contexts/AuthContext';

function ProfilePhotoUploader() {
  const { user, profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload la nouvelle photo
      const downloadURL = await uploadProfilePhoto(user.uid, file, {
        onProgress: (percentage) => {
          setProgress(percentage);
        },
        onError: (error) => {
          alert(`Erreur: ${error}`);
          setUploading(false);
        }
      });

      // Supprimer l'ancienne photo si elle existe
      if (profile.photoURL) {
        try {
          await deleteProfilePhoto(profile.photoURL);
        } catch (err) {
          console.error('Erreur suppression ancienne photo:', err);
        }
      }

      // Mettre à jour le profil
      await updateProfilePhoto(user.uid, downloadURL);
      await refreshProfile();

      alert('Photo mise à jour !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handlePhotoDelete = async () => {
    if (!profile.photoURL || !window.confirm('Supprimer la photo ?')) return;

    setUploading(true);

    try {
      await deleteProfilePhoto(profile.photoURL);
      await updateProfilePhoto(user.uid, null);
      await refreshProfile();

      alert('Photo supprimée !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {profile.photoURL && (
        <img src={profile.photoURL} alt="Profil" width="150" />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePhotoSelect}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? `Upload... ${Math.round(progress)}%` : 'Changer la photo'}
      </button>

      {profile.photoURL && (
        <button onClick={handlePhotoDelete} disabled={uploading}>
          Supprimer la photo
        </button>
      )}
    </div>
  );
}
```

## 📊 Gestion de la Progression

### Sauvegarder une Tentative de Quiz

```jsx
import { saveQuizAttempt } from './services/firebase/firestore/progress';
import { useAuth } from './contexts/AuthContext';

function QuizResults({ moduleId, results, answers }) {
  const { user } = useAuth();

  const handleSave = async () => {
    try {
      await saveQuizAttempt(user.uid, moduleId, {
        score: results.score,
        correctCount: results.correctCount,
        totalQuestions: results.totalQuestions,
        earnedPoints: results.earnedPoints,
        totalPoints: results.totalPoints,
        timeSpent: results.timeSpent
      }, answers);

      console.log('Progression sauvegardée !');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <h2>Résultats</h2>
      <p>Score: {results.score}%</p>
      <button onClick={handleSave}>Sauvegarder</button>
    </div>
  );
}
```

### Récupérer la Progression

```jsx
import { useEffect, useState } from 'react';
import { getProgress } from './services/firebase/firestore/progress';
import { useAuth } from './contexts/AuthContext';

function ProgressDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        const data = await getProgress(user.uid);
        setProgress(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    loadProgress();
  }, [user]);

  if (!progress) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Ma Progression</h2>
      <p>Modules complétés: {progress.globalStats.totalModulesCompleted}</p>
      <p>Quiz passés: {progress.globalStats.totalQuizzesTaken}</p>
      <p>Score moyen: {progress.globalStats.averageScore}%</p>

      <h3>Modules</h3>
      {Object.entries(progress.modules).map(([moduleId, module]) => (
        <div key={moduleId}>
          <h4>{moduleId}</h4>
          <p>Statut: {module.status}</p>
          <p>Meilleur score: {module.bestScore}%</p>
          <p>Tentatives: {module.attempts.length}</p>
        </div>
      ))}
    </div>
  );
}
```

### Synchronisation Automatique avec useProgressSync

```jsx
import { useProgressSync } from './hooks/useProgressSync';
import { useAuth } from './contexts/AuthContext';

function QuizSessionWithSync({ moduleId }) {
  const { user } = useAuth();
  const { saveAttempt } = useProgressSync();

  const handleQuizComplete = async (results, answers) => {
    // Sauvegarde automatiquement dans Firebase ET localement
    await saveAttempt(moduleId, results, answers);

    console.log('Résultats sauvegardés et synchronisés !');
  };

  return (
    <div>
      {/* Composant Quiz */}
      <button onClick={() => handleQuizComplete(results, answers)}>
        Terminer le quiz
      </button>
    </div>
  );
}
```

## 🔄 Synchronisation Manuelle

### Forcer la Synchronisation

```jsx
import { useProgressSync } from './hooks/useProgressSync';

function SyncButton() {
  const { syncToFirebase, loadFromFirebase } = useProgressSync();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);

    try {
      await syncToFirebase();
      alert('Synchronisation réussie !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const handleReload = async () => {
    setSyncing(true);

    try {
      await loadFromFirebase();
      alert('Données rechargées depuis le cloud !');
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <button onClick={handleSync} disabled={syncing}>
        {syncing ? 'Synchronisation...' : 'Synchroniser'}
      </button>
      <button onClick={handleReload} disabled={syncing}>
        Recharger depuis le cloud
      </button>
    </div>
  );
}
```

## 🎨 Utilisation Avancée

### Composant Profil Complet

```jsx
import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import ProfileEditor from './components/Profile/ProfileEditor';

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!user || !profile) {
    return <Redirect to="/auth" />;
  }

  const handleUpdate = async (updatedProfile) => {
    await refreshProfile();
    setEditing(false);
  };

  if (editing) {
    return (
      <ProfileEditor
        profile={profile}
        onUpdate={handleUpdate}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div>
      <h1>{profile.fullName}</h1>
      <img src={profile.photoURL} alt="Profil" />
      <p>Email: {profile.email}</p>
      <p>Entreprise: {profile.company}</p>
      <button onClick={() => setEditing(true)}>Modifier</button>
    </div>
  );
}
```

### Composant Protégé par Authentification

```jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

// Utilisation dans le routing
<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  }
/>
```

## 📱 Gestion des Préférences

### Mettre à Jour les Préférences

```jsx
import { updatePreferences } from './services/firebase/firestore/profile';
import { useAuth } from './contexts/AuthContext';

function PreferencesForm() {
  const { user, profile, refreshProfile } = useAuth();
  const [prefs, setPrefs] = useState(profile.preferences);

  const handleSave = async () => {
    try {
      await updatePreferences(user.uid, prefs);
      await refreshProfile();
      alert('Préférences sauvegardées !');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={prefs.emailNotifications}
          onChange={(e) =>
            setPrefs({ ...prefs, emailNotifications: e.target.checked })
          }
        />
        Notifications par email
      </label>

      <label>
        <input
          type="checkbox"
          checked={prefs.darkMode}
          onChange={(e) => setPrefs({ ...prefs, darkMode: e.target.checked })}
        />
        Mode sombre
      </label>

      <select
        value={prefs.language}
        onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
      >
        <option value="fr">Français</option>
        <option value="en">English</option>
      </select>

      <button onClick={handleSave}>Sauvegarder</button>
    </div>
  );
}
```

## 🎯 Astuces et Bonnes Pratiques

### 1. Gérer les Erreurs

```jsx
try {
  await someFirebaseOperation();
} catch (error) {
  // Les erreurs Firebase ont un code spécifique
  if (error.code === 'permission-denied') {
    alert('Vous n\'avez pas la permission d\'effectuer cette action');
  } else if (error.code === 'not-found') {
    alert('Donnée introuvable');
  } else {
    alert(`Erreur: ${error.message}`);
  }
}
```

### 2. Optimiser les Lectures Firestore

```jsx
// ❌ Mauvais - Lit toute la collection
const allUsers = await getAll('users');

// ✅ Bon - Lit seulement l'utilisateur concerné
const user = await getDocument('users', userId);
```

### 3. Éviter les Doublons de Synchronisation

```jsx
// useProgressSync gère déjà la synchronisation automatique
// Pas besoin d'appeler syncToFirebase manuellement sauf cas spécial

function App() {
  useProgressSync(); // Synchronisation automatique activée

  // Ne pas faire de synchronisation manuelle supplémentaire
  // sauf si besoin spécifique
}
```

### 4. Utiliser le Loading State

```jsx
function MyComponent() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? <Dashboard /> : <LoginPrompt />;
}
```
