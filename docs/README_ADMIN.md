# 🎓 Guide d'Administration - 00Auth Quiz Platform

## 📖 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Accès Administration](#accès-administration)
3. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
4. [Suivi des Progressions](#suivi-des-progressions)
5. [Statistiques](#statistiques)
6. [Permissions et Rôles](#permissions-et-rôles)

---

## 🌟 Vue d'ensemble

La plateforme 00Auth Quiz dispose d'un système complet d'administration permettant de :
- ✅ Gérer les utilisateurs et valider les comptes
- ✅ Suivre les progressions des étudiants
- ✅ Analyser les performances par formation
- ✅ Voir les statistiques de la plateforme

---

## 🔑 Accès Administration

### Pour les Administrateurs

1. **Se connecter** avec votre compte administrateur
2. Cliquer sur votre **avatar** en haut à droite
3. Sélectionner **"Administration"** dans le menu

### Pour les Instructeurs

1. **Se connecter** avec votre compte instructeur
2. Cliquer sur votre **avatar** en haut à droite
3. Sélectionner **"Suivi des Progressions"** dans le menu

### URLs Directes

- **Administration :** `/admin`
- **Suivi Progressions :** `/admin/progress`

> **Note :** Ces pages sont protégées et redirigent automatiquement si vous n'avez pas les permissions nécessaires.

---

## 👥 Gestion des Utilisateurs

### Tableau de Bord

L'interface d'administration affiche :

📊 **Statistiques Globales**
- Nombre total d'utilisateurs
- Comptes validés
- Comptes en attente de validation
- Total de quiz passés

📋 **Liste des Utilisateurs**
- Photo de profil
- Nom complet et email
- Rôle (avec badge coloré)
- Statut du compte (Actif/Désactivé)
- Validation (Validé/En attente)
- Dernière connexion

### Actions Disponibles

#### 1. Valider un Compte ✅

**Pour :** Autoriser un nouvel utilisateur à accéder à la plateforme

**Comment :**
1. Aller dans l'onglet **"En attente de validation"**
2. Cliquer sur le bouton **"Valider"** à côté de l'utilisateur
3. L'utilisateur reçoit immédiatement l'accès

**Résultat :** L'utilisateur peut maintenant se connecter et accéder aux formations.

#### 2. Changer le Rôle d'un Utilisateur ✏️

**Pour :** Promouvoir un utilisateur (ex: utilisateur → instructeur)

**Comment :**
1. Trouver l'utilisateur dans la liste
2. Cliquer sur l'icône **"Modifier"** (crayon)
3. Sélectionner le nouveau rôle :
   - **Utilisateur** : Accès basique aux formations
   - **Instructeur** : + Gestion du contenu + Suivi progressions
   - **Modérateur** : + Gestion des utilisateurs
   - **Administrateur** : Contrôle total
4. Le changement est immédiat

**⚠️ Important :** Le premier administrateur ne peut pas être modifié pour des raisons de sécurité.

#### 3. Activer/Désactiver un Compte 🚫

**Pour :** Suspendre temporairement l'accès d'un utilisateur

**Comment :**
1. Cliquer sur l'icône **"Bloquer"** (cercle barré)
2. Confirmer l'action

**Résultat :**
- **Désactivé** : L'utilisateur ne peut plus se connecter
- **Réactivé** : L'utilisateur retrouve l'accès

### Recherche d'Utilisateurs 🔍

Utilisez la barre de recherche pour trouver rapidement un utilisateur :
- Par **nom complet**
- Par **adresse email**

La recherche est instantanée et met à jour la liste en temps réel.

---

## 📊 Suivi des Progressions

### Sélection de la Formation

En haut de la page, sélectionnez la formation à analyser :
- 📱 **Flutter Advanced**
- *(Autres formations à venir)*

### Statistiques de la Formation

Après sélection, vous verrez :

| Métrique | Description |
|----------|-------------|
| **Étudiants Inscrits** | Nombre total d'inscrits |
| **Progression Moyenne** | Moyenne de complétion (%) |
| **Score Moyen** | Moyenne des scores |
| **Ont Terminé** | Nombre ayant complété 100% |

### Liste des Étudiants

Pour chaque étudiant inscrit :

| Colonne | Information |
|---------|-------------|
| **Étudiant** | Photo + Nom + Email |
| **Progression** | Barre visuelle + Pourcentage |
| **Quiz Passés** | Nombre total |
| **Score Moyen** | Pourcentage avec couleur |
| **Modules Validés** | Nombre complété |
| **Dernière Activité** | Date |

### Vue Détaillée par Étudiant

**Cliquez sur une ligne** pour voir les détails module par module :

Pour chaque module, vous verrez :
- ✅ **Statut** : Complété, En cours, Non commencé, Score parfait
- 📈 **Meilleur Score** : Score maximum obtenu
- 🔢 **Tentatives** : Nombre de fois passé

#### Icônes de Statut

- ✅ **Vert** : Module validé
- ⭐ **Violet** : Score parfait (100%)
- ⏳ **Orange** : En cours
- 🔒 **Gris** : Verrouillé / Non commencé

---

## 📈 Statistiques

### Plateforme Globale

Accessible depuis l'interface d'administration :

```
┌─────────────────────────────────────┐
│  Total Utilisateurs        45       │
│  Comptes Validés          40       │
│  En Attente                2       │
│  Quiz Passés             450       │
└─────────────────────────────────────┘
```

### Par Formation

Accessible depuis le suivi des progressions :

```
┌─────────────────────────────────────┐
│  Inscrits                 35       │
│  Progression Moy.        65%       │
│  Score Moyen            78%       │
│  Ont Terminé            12        │
└─────────────────────────────────────┘
```

### Distribution des Rôles

Visible dans les statistiques de la plateforme :
- 🔴 **Admins** : 1
- 🔵 **Instructeurs** : 3
- 🟡 **Modérateurs** : 2
- ⚪ **Utilisateurs** : 39

---

## 🔐 Permissions et Rôles

### Matrice des Permissions

| Action | User | Instructor | Moderator | Admin |
|--------|------|------------|-----------|-------|
| Passer les quiz | ✅ | ✅ | ✅ | ✅ |
| Voir sa progression | ✅ | ✅ | ✅ | ✅ |
| **Voir progressions étudiants** | ❌ | ✅ | ✅ | ✅ |
| **Gérer utilisateurs** | ❌ | ❌ | ✅ | ✅ |
| **Valider comptes** | ❌ | ❌ | ✅ | ✅ |
| **Gérer formations** | ❌ | ✅ | ❌ | ✅ |
| **Changer rôles** | ❌ | ❌ | ❌ | ✅ |

### Descriptions des Rôles

#### 👤 Utilisateur (User)
- Accès aux formations
- Peut passer les quiz
- Voir sa propre progression
- **Doit être validé** par un admin/modérateur

#### 👨‍🏫 Instructeur (Instructor)
- Toutes les permissions d'un utilisateur
- **Suivi des progressions** des étudiants
- Gestion du contenu pédagogique
- Voir les statistiques

#### 👮 Modérateur (Moderator)
- Toutes les permissions d'un utilisateur
- **Validation des comptes**
- **Gestion des utilisateurs**
- Voir les statistiques

#### 👑 Administrateur (Admin)
- **Contrôle total** sur la plateforme
- Toutes les permissions
- Peut changer les rôles
- Protégé si premier admin

---

## 🎯 Cas d'Usage Fréquents

### Cas 1 : Nouveau Compte Utilisateur

**Scénario :** Un étudiant s'inscrit sur la plateforme

**Actions :**
1. L'étudiant s'inscrit → Compte créé avec `accountIsValid: false`
2. Admin/Modérateur reçoit une notification (onglet "En attente")
3. Admin vérifie les informations
4. Admin clique sur **"Valider"**
5. L'étudiant peut maintenant accéder aux formations

### Cas 2 : Promouvoir un Instructeur

**Scénario :** Vous voulez qu'un utilisateur devienne instructeur

**Actions :**
1. Aller dans l'administration
2. Rechercher l'utilisateur
3. Cliquer sur **"Modifier"** (icône crayon)
4. Sélectionner **"Instructeur"**
5. L'utilisateur a maintenant accès au suivi des progressions

### Cas 3 : Analyser les Performances d'une Formation

**Scénario :** Voir comment vos étudiants progressent

**Actions :**
1. Aller dans **"Suivi des Progressions"**
2. Sélectionner la formation
3. Voir les statistiques globales
4. Cliquer sur un étudiant pour voir les détails
5. Identifier les modules problématiques (scores faibles)

### Cas 4 : Suspendre un Compte

**Scénario :** Un utilisateur ne respecte pas les règles

**Actions :**
1. Aller dans l'administration
2. Trouver l'utilisateur
3. Cliquer sur l'icône **"Bloquer"**
4. Le compte est immédiatement désactivé

---

## 🚀 Démarrage Rapide

### Premier Connexion Admin

Si vous êtes le **premier utilisateur** à vous inscrire :
1. Créez votre compte
2. Vous devenez automatiquement **administrateur**
3. Votre compte est **auto-validé**
4. Vous avez accès immédiat à toutes les fonctionnalités

### Accès Rapide

| Action | Raccourci |
|--------|-----------|
| Administration | Avatar → Administration |
| Suivi Progressions | Avatar → Suivi des Progressions |
| Recherche Utilisateur | Barre de recherche en haut |
| Validation Rapide | Onglet "En attente" |

---

## ⚠️ Bonnes Pratiques

### Validation des Comptes

✅ **À Faire :**
- Vérifier l'email avant de valider
- Valider rapidement les comptes légitimes
- Documenter les refus si nécessaire

❌ **À Éviter :**
- Valider en masse sans vérification
- Laisser des comptes en attente trop longtemps

### Gestion des Rôles

✅ **À Faire :**
- Promouvoir en fonction des besoins
- Limiter le nombre d'administrateurs
- Former les instructeurs/modérateurs

❌ **À Éviter :**
- Donner le rôle admin à tout le monde
- Changer les rôles sans prévenir l'utilisateur

### Suivi des Progressions

✅ **À Faire :**
- Consulter régulièrement les statistiques
- Identifier les étudiants en difficulté
- Ajuster le contenu si scores faibles

❌ **À Éviter :**
- Ignorer les signaux d'alerte
- Ne jamais vérifier les progressions

---

## 🆘 Support

### Problèmes Fréquents

**Q : Je ne vois pas le menu "Administration"**
- Vérifiez que vous êtes connecté
- Vérifiez votre rôle (doit être Admin ou Modérateur)

**Q : Un utilisateur validé ne peut pas se connecter**
- Vérifiez que le compte est **actif** (non désactivé)
- Vérifiez que `accountIsValid: true`

**Q : Les progressions ne s'affichent pas**
- Vérifiez que vous avez le rôle Admin ou Instructeur
- Vérifiez que des étudiants sont inscrits à la formation

### Logs et Débogage

Ouvrez la console développeur (F12) pour voir les erreurs :
```javascript
// Erreur de permission
console.error('Erreur lors de la récupération des utilisateurs:', error);

// Succès
console.log('✅ Compte validé avec succès !');
```

---

## 📚 Ressources

### Documentation Technique

- [ADMIN_SYSTEM.md](ADMIN_SYSTEM.md) - Architecture du système
- [ADMIN_IMPLEMENTATION.md](ADMIN_IMPLEMENTATION.md) - Détails d'implémentation
- [ADMIN_FEATURES.md](ADMIN_FEATURES.md) - Fonctionnalités complètes

### Fichiers Sources

- `src/pages/AdminDashboard.jsx` - Interface admin
- `src/pages/StudentProgressTracker.jsx` - Suivi progressions
- `src/services/firebase/firestore/admin.js` - Services backend
- `src/hooks/usePermissions.js` - Hook de permissions

---

## ✅ Checklist Administrateur

### Quotidien
- [ ] Vérifier les comptes en attente
- [ ] Valider les nouveaux utilisateurs
- [ ] Consulter les statistiques de la plateforme

### Hebdomadaire
- [ ] Analyser les progressions par formation
- [ ] Identifier les étudiants en difficulté
- [ ] Vérifier l'activité des instructeurs

### Mensuel
- [ ] Revoir les rôles des utilisateurs
- [ ] Analyser les tendances de performance
- [ ] Ajuster le contenu si nécessaire

---

**Version :** 1.0
**Dernière mise à jour :** 2025-11-13
**Support :** Pour toute question, consultez la documentation technique ou contactez l'équipe de développement.
