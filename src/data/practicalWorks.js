/**
 * @fileoverview Static data for all Practical Works (Travaux Pratiques)
 * Based on the Flutter Advanced Training Program (November 2025 - April 2026)
 */

import { createPracticalWork, DELIVERABLE_TYPES } from '../models/practicalWork';

/**
 * All practical works for the Flutter Advanced course
 * @type {Array<PracticalWork>}
 */
export const PRACTICAL_WORKS = [
  // ========== Semaine 1-2: Introduction Dart & Flutter ==========
  createPracticalWork({
    id: 'tp-02-gestion-stock',
    courseId: 'flutter-advanced',
    title: 'TP2: Application console de gestion de Stock',
    description: 'Workshop en ligne pour créer une application console de gestion de stock en Dart',
    instructions: `# Application Console de Gestion de Stock

## Objectifs
Créer une application en ligne de commande permettant de gérer un stock de produits.

## Fonctionnalités requises
1. Ajouter un produit (nom, référence, quantité, prix)
2. Lister tous les produits
3. Rechercher un produit par référence
4. Modifier la quantité d'un produit
5. Supprimer un produit
6. Calculer la valeur totale du stock

## Compétences évaluées
- Variables et types de données Dart
- Collections (List, Map)
- Fonctions et méthodes
- Classes et objets
- Programmation orientée objet basique`,
    week: 'Semaine 1-2',
    weekNumber: 1,
    topics: ['Dart console', 'POO', 'Collections', 'Gestion de données'],
    difficulty: 'beginner',
    estimatedHours: 4,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Dépôt GitHub',
        description: 'Lien vers le dépôt GitHub contenant le code source',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'readme',
        name: 'README',
        description: 'Documentation expliquant comment exécuter l\'application',
        required: true,
        type: DELIVERABLE_TYPES.TEXT
      }
    ],
    isBonus: false,
    deadline: null,
    order: 2
  }),

  createPracticalWork({
    id: 'tp-03-gestion-clients-factures',
    courseId: 'flutter-advanced',
    title: 'TP3: Gestion de clients et factures (CEET)',
    description: 'Application en ligne de commande pour gérer des clients et leurs factures',
    instructions: `# Gestion de Clients et Factures CEET

## Contexte
Créer une application console pour la Compagnie d'Énergie Électrique du Togo (CEET) permettant de gérer des clients et leurs factures d'électricité.

## Fonctionnalités
1. **Gestion des clients**
   - Ajouter un client (nom, numéro compteur, adresse)
   - Lister tous les clients
   - Rechercher un client

2. **Gestion des factures**
   - Créer une facture pour un client
   - Calculer le montant (selon la consommation en kWh)
   - Marquer une facture comme payée
   - Afficher l'historique des factures d'un client

3. **Statistiques**
   - Total des factures impayées
   - Consommation moyenne par client

## Contraintes techniques
- Utiliser des classes pour Client et Facture
- Implémenter les méthodes toString, fromJson, toJson
- Gestion des erreurs et validations`,
    week: 'Semaine 1-2',
    weekNumber: 1,
    topics: ['Dart', 'POO avancée', 'Sérialisation', 'Gestion erreurs'],
    difficulty: 'beginner',
    estimatedHours: 6,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Dépôt GitHub',
        description: 'Code source complet avec architecture claire',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      }
    ],
    isBonus: false,
    deadline: null,
    order: 3
  }),

  // ========== Semaine 2-3: Interfaces Flutter ==========
  createPracticalWork({
    id: 'tp-04-carte-visite',
    courseId: 'flutter-advanced',
    title: 'TP4: Carte de visite numérique',
    description: 'Créer une application Flutter affichant une carte de visite statique',
    instructions: `# Carte de Visite Numérique

## Objectif
Créer votre première application Flutter affichant votre carte de visite professionnelle.

## Contenu requis
- Photo de profil
- Nom complet
- Titre/Poste
- Email
- Téléphone
- Liens réseaux sociaux (LinkedIn, GitHub, etc.)

## Contraintes
- Design soigné et professionnel
- Utilisation de StatelessWidget
- Au moins 3 widgets différents (Text, Image, Icon, etc.)
- Respect des bonnes pratiques de composition

## Bonus
- Animation d'apparition
- Boutons cliquables pour contacter
- Mode sombre`,
    week: 'Semaine 2-3',
    weekNumber: 2,
    topics: ['Widgets de base', 'Layout', 'StatelessWidget', 'Design'],
    difficulty: 'beginner',
    estimatedHours: 3,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source GitHub',
        description: 'Dépôt contenant le projet Flutter complet',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'screenshot',
        name: 'Captures d\'écran',
        description: 'Images de l\'application (2-3 captures)',
        required: true,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: false,
    deadline: null,
    order: 4
  }),

  createPracticalWork({
    id: 'tp-05-calculatrice',
    courseId: 'flutter-advanced',
    title: 'TP5: Application Calculatrice',
    description: 'CodeLab pour créer une calculatrice fonctionnelle',
    instructions: `# Application Calculatrice

## Fonctionnalités
- Opérations de base: +, -, ×, ÷
- Bouton Clear (C)
- Bouton Égal (=)
- Affichage du résultat
- Gestion des nombres décimaux

## Interface
- Grille de boutons (GridView)
- Écran d'affichage en haut
- Design inspiré des calculatrices iOS/Android

## Compétences
- StatefulWidget
- setState()
- Gestion d'état local
- GridView
- GestureDetector ou Buttons`,
    week: 'Semaine 2-3',
    weekNumber: 2,
    topics: ['StatefulWidget', 'setState', 'Interactivité', 'GridView'],
    difficulty: 'beginner',
    estimatedHours: 5,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'Projet Flutter complet sur GitHub',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'demo-video',
        name: 'Vidéo de démonstration',
        description: 'Courte vidéo (1-2 min) montrant l\'application en action',
        required: false,
        type: DELIVERABLE_TYPES.URL
      }
    ],
    isBonus: false,
    deadline: null,
    order: 5
  }),

  createPracticalWork({
    id: 'tp-06-liste-suppression',
    courseId: 'flutter-advanced',
    title: 'TP6: Liste d\'objets avec suppression',
    description: 'Liste interactive avec possibilité de supprimer des éléments',
    instructions: `# Liste Interactive avec Suppression

## Objectif
Créer une liste d'objets de votre choix avec action de suppression.

## Suggestions d'objets
- Liste de courses
- Contacts
- Tâches
- Livres
- Films favoris

## Fonctionnalités
1. Afficher une liste d'au moins 5 éléments
2. Chaque élément doit avoir plusieurs propriétés
3. Action de suppression (swipe ou bouton)
4. Message de confirmation avant suppression
5. Feedback visuel après suppression

## Contraintes
- Utiliser ListView
- Utiliser des Widgets personnalisés (StatelessWidget)
- Gestion de l'état avec StatefulWidget
- Animation de suppression (optionnel mais recommandé)`,
    week: 'Semaine 2-3',
    weekNumber: 2,
    topics: ['ListView', 'Suppression', 'Interactions', 'Widgets personnalisés'],
    difficulty: 'beginner',
    estimatedHours: 4,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Repository GitHub',
        description: 'Code source du projet',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      }
    ],
    isBonus: false,
    deadline: null,
    order: 6
  }),

  // ========== Semaine 4: Navigation & Interactions ==========
  createPracticalWork({
    id: 'tp-07-formulaire-inscription',
    courseId: 'flutter-advanced',
    title: 'TP7: Formulaire d\'inscription utilisateur',
    description: 'Créer un formulaire complet avec validations',
    instructions: `# Formulaire d'Inscription

## Champs requis
- Nom complet (validation: non vide)
- Email (validation: format email)
- Téléphone (validation: format numérique)
- Mot de passe (validation: min 8 caractères)
- Confirmation mot de passe (validation: identique)
- Acceptation CGU (checkbox obligatoire)

## Fonctionnalités
1. Validation en temps réel
2. Messages d'erreur clairs
3. Bouton "S'inscrire" désactivé si formulaire invalide
4. Animation de soumission
5. Page de confirmation après inscription

## Widgets à utiliser
- Form & TextFormField
- Validators
- FormState
- Navigation vers page de confirmation`,
    week: 'Semaine 4',
    weekNumber: 4,
    topics: ['Forms', 'Validation', 'Navigation', 'TextField'],
    difficulty: 'intermediate',
    estimatedHours: 5,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code GitHub',
        description: 'Projet complet avec formulaire fonctionnel',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'screenshots',
        name: 'Screenshots',
        description: 'Captures montrant validation et erreurs',
        required: true,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: false,
    deadline: null,
    order: 7
  }),

  createPracticalWork({
    id: 'tp-08-todo-app',
    courseId: 'flutter-advanced',
    title: 'TP8: Application de Gestion de Tâches',
    description: 'Application complète de Todo List avec navigation',
    instructions: `# Application de Gestion de Tâches (Todo App)

## Pages requises
1. **Page d'accueil**: Liste des tâches
2. **Page d'ajout**: Formulaire nouvelle tâche
3. **Page de détails**: Détails d'une tâche

## Fonctionnalités
- Ajouter une tâche (titre, description, priorité, date limite)
- Marquer comme complétée
- Modifier une tâche
- Supprimer une tâche
- Filtrer par statut (toutes, actives, complétées)
- Rechercher une tâche

## Navigation
- Navigation entre les pages
- Passage de données entre pages
- Bouton retour fonctionnel

## Design
- AppBar personnalisée
- FloatingActionButton pour ajouter
- Cards pour chaque tâche
- Indicateurs visuels (priorité, statut)`,
    week: 'Semaine 4',
    weekNumber: 4,
    topics: ['Navigation', 'CRUD', 'Multiple pages', 'Gestion état'],
    difficulty: 'intermediate',
    estimatedHours: 8,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'Application Flutter complète',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'demo-video',
        name: 'Vidéo démonstration',
        description: 'Démonstration de toutes les fonctionnalités',
        required: true,
        type: DELIVERABLE_TYPES.URL
      }
    ],
    isBonus: false,
    deadline: null,
    order: 8
  }),

  createPracticalWork({
    id: 'tp-bonus-navigation-comparison',
    courseId: 'flutter-advanced',
    title: 'TP Bonus: Navigator 1.0 vs GoRouter vs Navigator 2.0',
    description: 'Comprendre les différentes approches de navigation dans Flutter',
    instructions: `# Comparaison des Systèmes de Navigation

## Objectif
Implémenter la même application simple avec 3 approches différentes de navigation.

## Application de base
Une app avec 3 écrans:
1. Home
2. Profile
3. Settings

## Implémentations requises
1. **Version Navigator 1.0**: Navigation classique avec push/pop
2. **Version GoRouter**: Routing déclaratif avec package go_router
3. **Version Navigator 2.0**: Router API complète

## Rapport attendu
Document comparant:
- Facilité d'implémentation
- Gestion de l'état d'URL
- Deep linking
- Cas d'usage recommandés pour chaque approche

## Bonus
- Implémenter des routes protégées (authentification)`,
    week: 'Semaine 4',
    weekNumber: 4,
    topics: ['Navigation avancée', 'Router', 'Deep linking'],
    difficulty: 'advanced',
    estimatedHours: 6,
    deliverables: [
      {
        id: 'github-repos',
        name: '3 Repositories',
        description: 'Un repo par approche de navigation',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'comparison-doc',
        name: 'Document de comparaison',
        description: 'Rapport analysant les 3 approches',
        required: true,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: true,
    deadline: null,
    order: 9
  }),

  // ========== Semaine 5: Thème & Ressources ==========
  createPracticalWork({
    id: 'tp-09-theme-personnalise',
    courseId: 'flutter-advanced',
    title: 'TP9: Thème Statique Global Personnalisé',
    description: 'Créer et appliquer un thème cohérent à une application',
    instructions: `# Application avec Thème Personnalisé

## Objectif
Créer une application avec un thème global personnalisé incluant couleurs, typographie et styles de composants.

## Configuration du thème
1. **Couleurs personnalisées**
   - Palette de couleurs principale
   - Couleurs secondaires
   - Couleurs d'erreur et de succès

2. **Typographie**
   - Police personnalisée (Google Fonts ou locale)
   - Styles pour titres, sous-titres, corps de texte

3. **Composants stylisés**
   - AppBar
   - Buttons (Elevated, Text, Outlined)
   - Cards
   - TextFields
   - Icons

## Application de démonstration
Créer une app avec au moins 3 écrans utilisant tous les composants thématisés.

## Ressources
- Intégrer des images (assets)
- Intégrer une police personnalisée
- Intégrer des icônes personnalisées`,
    week: 'Semaine 5',
    weekNumber: 5,
    topics: ['ThemeData', 'Typographie', 'Assets', 'Design System'],
    difficulty: 'intermediate',
    estimatedHours: 5,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'Application avec thème implémenté',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'design-doc',
        name: 'Documentation du design',
        description: 'Document présentant la palette et les choix de design',
        required: false,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: false,
    deadline: null,
    order: 10
  }),

  createPracticalWork({
    id: 'tp-10-mode-clair-sombre',
    courseId: 'flutter-advanced',
    title: 'TP10: Mode Clair / Sombre dynamique',
    description: 'Implémenter le basculement entre mode clair et sombre',
    instructions: `# Implémentation Mode Clair/Sombre

## Fonctionnalités
1. Switch pour basculer entre les modes
2. Persistance du choix (shared_preferences)
3. Application du thème au démarrage
4. Transition fluide entre les modes

## Thèmes requis
- **Mode Clair**: Fond blanc, texte foncé
- **Mode Sombre**: Fond sombre, texte clair
- Adaptation de tous les composants

## Gestion d'état
Utiliser:
- Provider, OU
- ChangeNotifier + ValueListenableBuilder, OU
- Riverpod

## Interface
- Ajout d'un bouton de toggle dans l'AppBar
- Page de paramètres avec switch
- Icônes adaptées (sun/moon)`,
    week: 'Semaine 5',
    weekNumber: 5,
    topics: ['Dark mode', 'Persistance', 'Provider', 'ThemeMode'],
    difficulty: 'intermediate',
    estimatedHours: 4,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Repository GitHub',
        description: 'Code avec dark mode fonctionnel',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'demo-video',
        name: 'Vidéo',
        description: 'Démonstration du basculement de thème',
        required: true,
        type: DELIVERABLE_TYPES.URL
      }
    ],
    isBonus: false,
    deadline: null,
    order: 11
  }),

  // ========== Semaine 6: Interfaces Avancées ==========
  createPracticalWork({
    id: 'tp-11-galerie-images',
    courseId: 'flutter-advanced',
    title: 'TP11: Galerie d\'Images en Ligne',
    description: 'Application de galerie d\'images récupérées depuis une API',
    instructions: `# Galerie d'Images

## Source de données
Utiliser une API publique comme:
- Unsplash API
- Pexels API
- Pixabay API

## Fonctionnalités
1. Affichage en grille (GridView)
2. Chargement progressif avec placeholder
3. Clic sur image → page de détails
4. Animation Hero entre liste et détails
5. Zoom sur l'image en détails
6. Bouton de téléchargement (optionnel)

## Widgets requis
- GridView.builder
- CachedNetworkImage
- Hero
- PageView (pour swiper entre images)
- CircularProgressIndicator

## Bonus
- Recherche d'images
- Pagination infinie
- Favori (stockage local)`,
    week: 'Semaine 6',
    weekNumber: 6,
    topics: ['GridView', 'Images réseau', 'Animations', 'API'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'Application complète',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'api-key-note',
        name: 'Note API',
        description: 'Instructions pour obtenir la clé API',
        required: true,
        type: DELIVERABLE_TYPES.TEXT
      }
    ],
    isBonus: false,
    deadline: null,
    order: 12
  }),

  createPracticalWork({
    id: 'tp-12-todo-responsive',
    courseId: 'flutter-advanced',
    title: 'TP12: Refactorisation Responsive de la Todo App',
    description: 'Adapter l\'application de tâches pour différentes tailles d\'écran',
    instructions: `# Todo App Responsive

## Objectif
Refactoriser l'app de tâches (TP8) pour qu'elle s'adapte aux différentes tailles d'écran.

## Adaptations requises
1. **Mobile (< 600px)**
   - Liste verticale
   - Navigation avec drawer
   - FAB pour ajouter

2. **Tablette (600-900px)**
   - Liste + panel de détails côte à côte
   - Navigation avec bottom navigation

3. **Desktop (> 900px)**
   - Sidebar permanente
   - Liste et détails en colonnes
   - Raccourcis clavier

## Outils à utiliser
- MediaQuery
- LayoutBuilder
- Package sizer (optionnel)

## Bonus
- Orientation portrait/paysage
- Adaptation des tailles de police
- Breakpoints personnalisés`,
    week: 'Semaine 6',
    weekNumber: 6,
    topics: ['Responsive', 'MediaQuery', 'LayoutBuilder', 'Adaptive UI'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code GitHub',
        description: 'App responsive complète',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'screenshots',
        name: 'Screenshots multi-devices',
        description: 'Captures sur mobile, tablette, desktop',
        required: true,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: false,
    deadline: null,
    order: 13
  }),

  createPracticalWork({
    id: 'tp-13-animation-favoris',
    courseId: 'flutter-advanced',
    title: 'TP13 Bonus: Animation de Favoris',
    description: 'Créer une animation personnalisée pour un bouton favori',
    instructions: `# Animation Bouton Favori

## Animations requises
1. **Tap animation**
   - Scale up/down au clic
   - Changement de couleur animé

2. **Icon animation**
   - Transition icône vide → pleine
   - Rotation ou bounce effect

3. **Background animation**
   - Ripple effect
   - Particles (optionnel)

## Widgets à explorer
- AnimationController
- Tween
- AnimatedBuilder
- Transform & Matrix4
- Custom Painter (bonus)

## Application de démonstration
Liste de cartes avec bouton favori animé sur chaque item.

## Bonus avancé
- Confetti animation au favori
- Shake animation
- Custom path animation`,
    week: 'Semaine 6',
    weekNumber: 6,
    topics: ['Animations', 'AnimationController', 'Tween', 'Custom animations'],
    difficulty: 'advanced',
    estimatedHours: 5,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'App avec animations',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'demo-video',
        name: 'Vidéo démo',
        description: 'Démonstration des animations',
        required: true,
        type: DELIVERABLE_TYPES.URL
      }
    ],
    isBonus: true,
    deadline: null,
    order: 14
  }),

  // ========== Semaine 7: Dart Avancé ==========
  createPracticalWork({
    id: 'tp-14-refacto-fonctionnelle',
    courseId: 'flutter-advanced',
    title: 'TP14: Refactorisation Fonctionnelle (Clients & Factures)',
    description: 'Refactoriser l\'app CEET avec programmation fonctionnelle',
    instructions: `# Refactorisation avec Programmation Fonctionnelle

## Objectif
Reprendre le TP3 (Gestion Clients & Factures) et le refactoriser en utilisant la programmation fonctionnelle.

## Concepts à appliquer
1. **Fonctions lambdas**
   - map, where, reduce, fold
   - Filtres et transformations

2. **Immutabilité**
   - Classes avec constructeurs const
   - copyWith methods
   - final properties

3. **Fonctions de première classe**
   - Fonctions en paramètres
   - Callbacks
   - Composition de fonctions

## Améliorations
- Recherche fonctionnelle
- Tri personnalisable
- Calculs avec reduce/fold
- Pipeline de transformations

## Bonus
- Utiliser package fpdart
- Option & Either types
- Gestion d'erreurs fonctionnelle`,
    week: 'Semaine 7',
    weekNumber: 7,
    topics: ['Programmation fonctionnelle', 'Lambdas', 'Immutabilité'],
    difficulty: 'intermediate',
    estimatedHours: 6,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code refactorisé',
        description: 'Version fonctionnelle de l\'app',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'comparison-doc',
        name: 'Rapport de comparaison',
        description: 'Avant/après la refactorisation',
        required: false,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: false,
    deadline: null,
    order: 15
  }),

  createPracticalWork({
    id: 'tp-15-horloge-mondiale',
    courseId: 'flutter-advanced',
    title: 'TP15: Application Horloge Mondiale avec Streams',
    description: 'Application d\'horloge utilisant les Streams',
    instructions: `# Horloge Mondiale avec Streams

## Fonctionnalités
1. Affichage de l'heure actuelle (mise à jour chaque seconde)
2. Liste de villes avec leurs fuseaux horaires
3. Ajout/Suppression de villes
4. Horloge analogique + digitale

## Utilisation des Streams
- Stream.periodic pour la mise à jour
- StreamController pour gérer les événements
- StreamBuilder pour afficher

## API
Utiliser World Time API ou TimeZone API

## Bonus
- Alarmes
- Chronomètre
- Timer
- Notifications`,
    week: 'Semaine 7',
    weekNumber: 7,
    topics: ['Streams', 'Async', 'StreamController', 'Real-time'],
    difficulty: 'intermediate',
    estimatedHours: 7,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'Application complète',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      }
    ],
    isBonus: false,
    deadline: null,
    order: 16
  }),

  createPracticalWork({
    id: 'tp-16-operations-lourdes',
    courseId: 'flutter-advanced',
    title: 'TP16: Fluidifier l\'affichage lors d\'opérations lourdes',
    description: 'Gérer les opérations coûteuses sans bloquer l\'UI',
    instructions: `# Optimisation des Opérations Lourdes

## Scénario
Application de traitement d'images ou de calculs mathématiques complexes.

## Problème à résoudre
Éviter que l'UI freeze pendant les opérations lourdes.

## Solutions à implémenter
1. **Async/Await**
   - Future pour opérations asynchrones
   - Indicators de chargement

2. **Compute function**
   - Déporter les calculs dans un Isolate
   - Comparaison avant/après

3. **FutureBuilder**
   - Affichage conditionnel
   - États: loading, error, data

## Cas pratiques
- Traitement d'une grande liste (tri, filtres)
- Calcul de nombres premiers
- Traitement d'images
- Parsing de gros fichiers JSON

## Mesures de performance
- Utiliser Stopwatch
- Comparer temps d'exécution
- Démonstration du freeze UI vs smooth UI`,
    week: 'Semaine 7',
    weekNumber: 7,
    topics: ['Async', 'Isolates', 'Performance', 'Compute'],
    difficulty: 'advanced',
    estimatedHours: 5,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code démonstration',
        description: 'App avec comparaisons',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'performance-report',
        name: 'Rapport performance',
        description: 'Benchmarks et analyses',
        required: true,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: false,
    deadline: null,
    order: 17
  }),

  createPracticalWork({
    id: 'tp-bonus-isolates',
    courseId: 'flutter-advanced',
    title: 'TP Bonus: Optimisation avec les Isolates',
    description: 'Maîtriser les Isolates pour le calcul parallèle',
    instructions: `# Isolates et Calcul Parallèle

## Objectif
Comprendre et utiliser les Isolates pour exécuter du code en parallèle.

## Exercices
1. **Isolate simple**
   - Créer un Isolate
   - Envoyer/recevoir des messages
   - Killer un Isolate

2. **Traitement parallèle**
   - Diviser une tâche en sous-tâches
   - Distribuer sur plusieurs Isolates
   - Agréger les résultats

3. **Cas d'usage réel**
   - Parser un gros fichier JSON
   - Calculs mathématiques intensifs
   - Compression/décompression

## Performance
- Comparer mono-isolate vs multi-isolates
- Mesurer le gain de performance
- Identifier les cas où Isolates sont bénéfiques

## Bonus
- Communication bi-directionnelle
- Pool d'Isolates
- Isolate avec état persistant`,
    week: 'Semaine 7',
    weekNumber: 7,
    topics: ['Isolates', 'Parallélisme', 'Performance', 'Concurrence'],
    difficulty: 'advanced',
    estimatedHours: 8,
    deliverables: [
      {
        id: 'github-repo',
        name: 'Code source',
        description: 'Exemples et cas pratiques',
        required: true,
        type: DELIVERABLE_TYPES.GITHUB
      },
      {
        id: 'tutorial-doc',
        name: 'Tutorial',
        description: 'Guide d\'utilisation des Isolates',
        required: false,
        type: DELIVERABLE_TYPES.FILE
      }
    ],
    isBonus: true,
    deadline: null,
    order: 18
  })
];

/**
 * Get all practical works for a course
 * @param {string} courseId - Course ID
 * @returns {Array<PracticalWork>}
 */
export function getPracticalWorksByCourse(courseId) {
  return PRACTICAL_WORKS.filter(pw => pw.courseId === courseId);
}

/**
 * Get a specific practical work by ID
 * @param {string} practicalWorkId - Practical work ID
 * @returns {PracticalWork|undefined}
 */
export function getPracticalWorkById(practicalWorkId) {
  return PRACTICAL_WORKS.find(pw => pw.id === practicalWorkId);
}

/**
 * Get practical works by week
 * @param {string} courseId - Course ID
 * @param {number} weekNumber - Week number
 * @returns {Array<PracticalWork>}
 */
export function getPracticalWorksByWeek(courseId, weekNumber) {
  return PRACTICAL_WORKS.filter(
    pw => pw.courseId === courseId && pw.weekNumber === weekNumber
  );
}

/**
 * Get all bonus practical works
 * @param {string} courseId - Course ID
 * @returns {Array<PracticalWork>}
 */
export function getBonusPracticalWorks(courseId) {
  return PRACTICAL_WORKS.filter(
    pw => pw.courseId === courseId && pw.isBonus
  );
}

/**
 * Get required practical works
 * @param {string} courseId - Course ID
 * @returns {Array<PracticalWork>}
 */
export function getRequiredPracticalWorks(courseId) {
  return PRACTICAL_WORKS.filter(
    pw => pw.courseId === courseId && !pw.isBonus
  );
}

/**
 * Get practical works sorted by order
 * @param {string} courseId - Course ID
 * @returns {Array<PracticalWork>}
 */
export function getSortedPracticalWorks(courseId) {
  return getPracticalWorksByCourse(courseId).sort((a, b) => a.order - b.order);
}

/**
 * Get upcoming practical works (with deadlines)
 * @param {string} courseId - Course ID
 * @returns {Array<PracticalWork>}
 */
export function getUpcomingPracticalWorks(courseId) {
  const now = new Date();
  return PRACTICAL_WORKS.filter(
    pw => pw.courseId === courseId && pw.deadline && pw.deadline > now
  ).sort((a, b) => a.deadline - b.deadline);
}

/**
 * Get overdue practical works
 * @param {string} courseId - Course ID
 * @param {Array<string>} submittedIds - IDs of submitted practical works
 * @returns {Array<PracticalWork>}
 */
export function getOverduePracticalWorks(courseId, submittedIds = []) {
  const now = new Date();
  return PRACTICAL_WORKS.filter(
    pw =>
      pw.courseId === courseId &&
      pw.deadline &&
      pw.deadline < now &&
      !submittedIds.includes(pw.id)
  );
}
