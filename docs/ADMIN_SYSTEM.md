# 🔐 Système d'Administration - Documentation

## 📋 Vue d'Ensemble

Le système d'administration a été mis en place pour gérer les utilisateurs, leurs rôles et leurs permissions sur la plateforme.

---

## 👥 Rôles Utilisateur

### 1. **User** (Utilisateur Standard)
- Rôle par défaut pour tous les nouveaux utilisateurs
- Nécessite une validation par un administrateur pour accéder à la plateforme
- **Permissions :**
  - ✅ Passer les quiz
  - ✅ Voir sa propre progression
  - ✅ Modifier son profil
  - ❌ Gérer les utilisateurs
  - ❌ Gérer les formations
  - ❌ Voir les statistiques globales

### 2. **Instructor** (Instructeur)
- Responsable de la création et gestion du contenu pédagogique
- **Permissions :**
  - ✅ Toutes les permissions d'un utilisateur
  - ✅ Gérer les formations
  - ✅ Gérer les modules
  - ✅ Voir les statistiques globales
  - ❌ Gérer les utilisateurs
  - ❌ Valider les comptes

### 3. **Moderator** (Modérateur)
- Responsable de la gestion des utilisateurs
- **Permissions :**
  - ✅ Toutes les permissions d'un utilisateur
  - ✅ Gérer les utilisateurs
  - ✅ Valider les comptes
  - ✅ Voir les statistiques globales
  - ❌ Gérer les formations
  - ❌ Gérer les modules

### 4. **Admin** (Administrateur)
- Contrôle total sur la plateforme
- **Permissions :**
  - ✅ Toutes les permissions
  - ✅ Gérer les utilisateurs
  - ✅ Gérer les formations
  - ✅ Gérer les modules
  - ✅ Valider les comptes
  - ✅ Voir les statistiques globales
  - ✅ Changer les rôles

---

## 🎯 Premier Administrateur

### Détection Automatique

Le **premier utilisateur** qui s'inscrit sur la plateforme devient automatiquement administrateur :

```javascript
// Vérification lors de la création du compte
const existingUsers = await hasExistingUsers();
const isFirstAdmin = !existingUsers; // true si aucun utilisateur n'existe

const profile = createParticipantProfile(uid, email, fullName, { isFirstAdmin });
// → role: 'admin'
// → accountIsValid: true
// → isFirstAdmin: true
```

**Caractéristiques du premier admin :**
- `role`: `"admin"`
- `isFirstAdmin`: `true`
- `accountIsValid`: `true` (auto-validé)
- Accès immédiat à toutes les fonctionnalités

---

## 📊 Structure de Données Firestore

### Collection `users`

```javascript
{
  // Identifiants
  uid: "firebase_auth_uid",
  id: "firebase_auth_uid", // identique à uid
  email: "user@example.com",
  fullName: "Nom Complet",
  displayName: "Nom d'affichage", // par défaut = fullName

  // Informations
  photoURL: "https://...",
  phone: "+33...",
  company: "Entreprise",
  jobTitle: "Poste",
  level: "beginner", // 'beginner' | 'intermediate' | 'advanced'
  goals: ["objectif1", "objectif2"],

  // Dates
  createdAt: Timestamp, // created_at
  updatedAt: Timestamp | null, // updated_at
  lastConnexion: Timestamp, // last_connexion

  // Administration
  role: "user", // 'user' | 'admin' | 'instructor' | 'moderator'
  isFirstAdmin: false, // true seulement pour le 1er admin
  accountIsValid: false, // true après validation par admin
  isActive: true, // compte actif/désactivé

  // Préférences
  preferences: {
    emailNotifications: true,
    darkMode: false,
    language: "fr"
  }
}
```

---

## 🛠️ Utilisation du Système

### 1. Vérifier les Permissions (Hook)

```jsx
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const {
    isAdmin,
    isInstructor,
    isModerator,
    canManageUsers,
    canManageCourses,
    canValidateAccounts,
    hasPermission
  } = usePermissions();

  return (
    <div>
      {canManageUsers && <UserManagementPanel />}
      {canManageCourses && <CourseManagementPanel />}
      {hasPermission('canViewAnalytics') && <Analytics />}
    </div>
  );
}
```

### 2. Protéger une Route

```jsx
import ProtectedRoute, { AdminRoute } from '../components/Auth/ProtectedRoute';

// Route nécessitant une permission spécifique
<Route
  path="/analytics"
  element={
    <ProtectedRoute requiredPermission="canViewAnalytics">
      <AnalyticsPage />
    </ProtectedRoute>
  }
/>

// Route réservée aux admins
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

// Route pour admins et instructeurs
<Route
  path="/courses/manage"
  element={
    <ProtectedRoute allowedRoles={['admin', 'instructor']}>
      <CourseManagement />
    </ProtectedRoute>
  }
/>
```

### 3. Vérifier l'Accès à la Plateforme

```javascript
import { canAccessPlatform } from '../models/participant';

const { canAccess, reason } = canAccessPlatform(profile);

if (!canAccess) {
  console.log('Accès refusé:', reason);
  // "Compte en attente de validation par un administrateur"
}
```

---

## 🔧 Fonctions d'Administration

### Gestion des Rôles

```javascript
import { changeUserRole } from '../services/firebase/firestore/profile';

// Promouvoir un utilisateur en instructeur
await changeUserRole(userId, 'instructor');

// Rétrograder en utilisateur
await changeUserRole(userId, 'user');
```

### Validation des Comptes

```javascript
import {
  validateAccount,
  invalidateAccount,
  getPendingUsers
} from '../services/firebase/firestore/profile';

// Récupérer les comptes en attente
const pendingUsers = await getPendingUsers();

// Valider un compte
await validateAccount(userId);

// Invalider un compte
await invalidateAccount(userId);
```

### Gestion des Utilisateurs

```javascript
import {
  getAllUsers,
  activateProfile,
  deactivateProfile
} from '../services/firebase/firestore/profile';

// Récupérer tous les utilisateurs
const allUsers = await getAllUsers();

// Désactiver un compte
await deactivateProfile(userId);

// Réactiver un compte
await activateProfile(userId);
```

---

## 📝 Matrice des Permissions

| Permission | User | Instructor | Moderator | Admin |
|------------|------|------------|-----------|-------|
| `canTakeQuizzes` | ✅ | ✅ | ✅ | ✅ |
| `canViewOwnProgress` | ✅ | ✅ | ✅ | ✅ |
| `canEditOwnProfile` | ✅ | ✅ | ✅ | ✅ |
| `canManageUsers` | ❌ | ❌ | ✅ | ✅ |
| `canManageCourses` | ❌ | ✅ | ❌ | ✅ |
| `canManageModules` | ❌ | ✅ | ❌ | ✅ |
| `canViewAnalytics` | ❌ | ✅ | ✅ | ✅ |
| `canValidateAccounts` | ❌ | ❌ | ✅ | ✅ |

---

## 🚀 Workflow de Création de Compte

### Scénario 1 : Premier Utilisateur (Admin)

1. ✅ Utilisateur s'inscrit
2. ✅ Système détecte qu'aucun utilisateur n'existe
3. ✅ Compte créé avec :
   - `role: 'admin'`
   - `isFirstAdmin: true`
   - `accountIsValid: true`
4. ✅ Accès immédiat à toutes les fonctionnalités

### Scénario 2 : Utilisateur Standard

1. ✅ Utilisateur s'inscrit
2. ✅ Compte créé avec :
   - `role: 'user'`
   - `isFirstAdmin: false`
   - `accountIsValid: false`
3. ⏳ Message d'attente de validation
4. ⏳ Admin/Modérateur valide le compte
5. ✅ Accès à la plateforme

---

## 🔒 Sécurité

### Règles Firestore Recommandées

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Fonction helper pour vérifier le rôle admin
    function isAdmin() {
      return request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Fonction helper pour vérifier si le compte est validé
    function isAccountValid() {
      return request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.accountIsValid == true;
    }

    // Collection users
    match /users/{userId} {
      // Lecture : soi-même ou admin
      allow read: if request.auth != null
        && (request.auth.uid == userId || isAdmin());

      // Création : seulement soi-même
      allow create: if request.auth != null
        && request.auth.uid == userId;

      // Mise à jour : soi-même (sauf champs admin) ou admin
      allow update: if request.auth != null
        && (
          // User peut modifier son profil mais pas role/accountIsValid
          (request.auth.uid == userId
            && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'accountIsValid', 'isFirstAdmin']))
          // Admin peut tout modifier
          || isAdmin()
        );

      // Suppression : admin uniquement
      allow delete: if isAdmin();
    }

    // Collection progress
    match /progress/{userId} {
      allow read, write: if request.auth != null
        && (request.auth.uid == userId || isAdmin())
        && isAccountValid();
    }
  }
}
```

---

## 📚 Exemples d'Utilisation

### Page Admin Dashboard

```jsx
import { AdminRoute } from '../components/Auth/ProtectedRoute';
import { usePermissions } from '../hooks/usePermissions';
import { getPendingUsers, validateAccount } from '../services/firebase/firestore/profile';

function AdminDashboard() {
  const { isAdmin } = usePermissions();
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (isAdmin) {
      loadPendingUsers();
    }
  }, [isAdmin]);

  const loadPendingUsers = async () => {
    const users = await getPendingUsers();
    setPendingUsers(users);
  };

  const handleValidate = async (userId) => {
    await validateAccount(userId);
    loadPendingUsers(); // Recharger la liste
  };

  return (
    <div>
      <h1>Comptes en attente de validation</h1>
      {pendingUsers.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onValidate={() => handleValidate(user.id)}
        />
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
```

### Afficher le Badge de Rôle

```jsx
import { useAuth } from '../contexts/AuthContext';
import { Chip } from '@mui/material';

function UserRoleBadge() {
  const { profile } = useAuth();

  const roleConfig = {
    admin: { label: 'Administrateur', color: 'error' },
    instructor: { label: 'Instructeur', color: 'primary' },
    moderator: { label: 'Modérateur', color: 'warning' },
    user: { label: 'Utilisateur', color: 'default' }
  };

  const config = roleConfig[profile?.role] || roleConfig.user;

  return <Chip label={config.label} color={config.color} size="small" />;
}
```

---

## ✅ Checklist d'Implémentation

- [x] Modèle de données mis à jour avec rôles et permissions
- [x] Fonction de détection du premier admin
- [x] Service Firestore avec fonctions d'administration
- [x] Hook `usePermissions` pour vérifier les permissions
- [x] Composant `ProtectedRoute` pour protéger les routes
- [x] Documentation complète

### À Faire (Optionnel)

- [ ] Interface d'administration pour gérer les utilisateurs
- [ ] Page de gestion des rôles
- [ ] Notifications email lors de la validation de compte
- [ ] Logs d'audit des actions admin
- [ ] Dashboard avec statistiques d'utilisation

---

**Date de création :** 2025-11-13
**Auteur :** Claude
**Version :** 1.0
