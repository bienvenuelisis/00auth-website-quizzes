# Quiz Formation Flutter Avancée

Plateforme de quiz interactive pour valider la progression des apprenants de la Formation Développeur Mobile Avancé avec Flutter.

## 🎯 Fonctionnalités

- **Validation progressive** - Score minimum 70% pour débloquer les modules suivants
- **Génération automatique** - Questions générées via Gemini API
- **Stockage local** - Progression sauvegardée localement (V1)
- **Migration cloud** - Synchronisation Firebase Firestore (V2)
- **Design élégant** - Identité visuelle cohérente avec 00auth.dev
- **Thème clair/sombre** - Préférences persistantes

## 🛠 Technologies

- **React 18.2** + **Vite 4.5**
- **Material-UI 5.14** + **Emotion**
- **Zustand** - State management
- **React Router 6** - Navigation
- **Firebase** - Auth, Firestore, Analytics
- **Gemini API** - Génération questions IA
- **Framer Motion** - Animations
- **Recharts** - Graphiques résultats

## 📁 Structure du Projet

```cmd
src/
├── components/     # Composants réutilisables
│   ├── Common/     # Boutons, Loaders
│   ├── Layout/     # Navbar, Footer
│   ├── Quiz/       # Composants quiz
│   └── Dashboard/  # Cartes modules, stats
├── contexts/       # ThemeContext
├── data/           # modules.js, fallback questions
├── hooks/          # Custom hooks
├── models/         # Modèles de données
├── pages/          # Pages principales
├── services/       # localStorage, Gemini, Firebase
├── stores/         # Zustand store
├── utils/          # Helpers
└── config/         # Firebase config
```

## 🚀 Installation

### 1. Cloner et installer

```bash
cd 00auth-quiz
yarn install
```

### 2. Configuration

Copier `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Renseigner les clés :

- **Firebase** : Console Firebase → Project Settings

### 3. Lancer en développement

```bash
yarn dev
```

Ouvre [http://localhost:5173](http://localhost:5173)

## 📊 Modules de Formation

La formation comprend **3 modules principaux** :

### Module 1 : Introduction (6 sous-modules)

- Introduction à Dart
- Initiation Flutter
- Composants de base (StatelessWidget, StatefulWidget)
- Création interfaces
- Navigation
- Thème et ressources

### Module 2 : Intermédiaire (6 sous-modules)

- Interfaces riches & Animations
- Gestion d'état (Provider, Riverpod, Bloc)
- Architecture (MVVM, Clean Architecture)
- Notions avancées Dart (POO, Async)
- APIs et Stockage données

### Module 3 : Avancé (2 sous-modules)

- Production (Publication stores, CI/CD)
- Qualité de code (Tests, Performance)

### Total : 14 sous-modules obligatoires + 7 modules bonus

## 🎮 Utilisation

### Parcours Utilisateur

1. **Dashboard** → Voir tous les modules et progression
2. **Module Detail** → Consulter détails et meilleur score
3. **Quiz Session** → Répondre aux questions (timer optionnel)
4. **Results** → Voir score, explications, suivant

### Règles de Validation

- **Score minimum** : 70% pour valider un module
- **Déblocage séquentiel** : Valider module N pour accéder à N+1
- **Tentatives illimitées** : Retenter jusqu'à validation
- **Modules bonus** : Optionnels, débloqués après module parent

## 🧩 Architecture MVC

Voir [docs/ARCHITECTURE_MVC_QUIZ.md](docs/ARCHITECTURE_MVC_QUIZ.md) pour détails complets.

**Model** : Services (localStorage, Gemini, Firestore)
**View** : Composants React + MUI
**Controller** : Zustand store + Custom hooks

## 🤖 Génération Questions (Gemini API)

Les questions sont générées automatiquement via les modèles Gemini (Firebase AI Logic) :

```javascript
// Exemple prompt
const prompt = `
Génère un quiz de 15 questions sur le module "Gestion d'état avec Provider"
pour une formation Flutter niveau intermédiaire.

Types de questions : 40% multiple-choice, 30% code-completion, 20% code-debugging

Format JSON strict avec : question, options, correctAnswer, explanation, points
`;
```

**Fallback** : Questions pré-générées si API indisponible

## 🗄 Stockage Données

### Version 1 - LocalStorage

```javascript
// Clé : flutterQuizProgress
{
  userId: "local-user-xxx",
  modules: {
    "module-1-1-dart": {
      status: "completed",
      bestScore: 85,
      attempts: [...]
    }
  },
  globalStats: { ... }
}
```

### Version 2 - Cloud Firestore

```txt
users/{userId}/quizProgress/{moduleId}/
  - status, bestScore, completedAt
  - attempts (subcollection)
```

## 📈 Métriques Suivies

- Taux de complétion par module
- Score moyen global
- Temps par quiz
- Questions les plus ratées
- Progression temporelle

## 🧪 Tests

```bash
# Tests unitaires (À venir)
yarn test

# Tests E2E (À venir)
yarn test:e2e
```

## 📦 Build Production

```bash
yarn build
```

Le build optimisé est dans `dist/`

## 🚀 Déploiement Firebase

```bash
# Build
yarn build

# Deploy
firebase deploy --only hosting
```

## 📝 Scripts Disponibles

- `yarn dev` - Serveur développement
- `yarn build` - Build production
- `yarn preview` - Preview build local
- `yarn lint` - Linter ESLint

## 🤝 Contribution

Ce projet est privé pour la Formation Flutter Avancée 00auth.dev.

## 📧 Contact

- **Email** : <contact@00auth.dev>
- **Site principal** : [00auth.dev](https://00auth.dev)
- **Formation** : [00auth.dev/services/formation/flutter-avance](https://00auth.dev/services/formation/flutter-avance)

---

**00auth.dev** - Le Développeur Authentique 🕴️
