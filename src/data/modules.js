/**
 * Modules de la Formation Développeur Mobile Avancé avec Flutter
 * Basé sur : docs/Formation - Developpeur Flutter Advanced.md
 */

export const MODULES_DATA = [
  // ==================== MODULE 0: FONDAMENTAUX ====================
  {
    id: 'module-0-1-dev-informatique',
    courseId: 'flutter-advanced',
    title: 'Introduction au développement informatique',
    description: 'Découvrez les bases de la programmation et du développement logiciel',
    parentModuleId: 'module-0-fondamentaux',
    previousModuleId: null, // Premier module
    topics: [
      'Concepts de base de la programmation',
      'Variables, types de données et opérateurs',
      'Structures de contrôle et algorithmes',
      'Paradigmes de programmation (impératif, POO, fonctionnel)',
      'Environnements de développement (IDE)',
      'Gestion de versions avec Git'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 12,
    estimatedTime: 18,
    isBonus: false,
    isFirst: true,
    order: 1
  },
  {
    id: 'module-0-2-mobile-ecosysteme',
    courseId: 'flutter-advanced',
    title: 'Introduction au développement mobile et à l\'écosystème',
    description: 'Comprenez les écosystèmes Android et iOS',
    parentModuleId: 'module-0-fondamentaux',
    previousModuleId: 'module-0-1-dev-informatique',
    topics: [
      'Histoire et évolution d\'Android (Linux, ARM, Google Play)',
      'Écosystème iOS et App Store',
      'Architecture des systèmes mobiles',
      'Processus de développement mobile',
      'Publication dans les stores',
      'Tendances actuelles du développement mobile'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 14,
    estimatedTime: 20,
    isBonus: false,
    isFirst: false,
    order: 2
  },
  {
    id: 'module-0-3-flutter-comparaison',
    courseId: 'flutter-advanced',
    title: 'Flutter et comparaisons avec les autres outils',
    description: 'Comparez Flutter aux alternatives natives et cross-platform',
    parentModuleId: 'module-0-fondamentaux',
    previousModuleId: 'module-0-2-mobile-ecosysteme',
    topics: [
      'Développement natif (Kotlin/JetPack Compose, Swift/SwiftUI)',
      'Développement cross-platform (React Native, Flutter)',
      'Développement hybride (technologies Web)',
      'Avantages et inconvénients de chaque approche',
      'Performances comparées',
      'Cas d\'usage et choix technologique'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 12,
    estimatedTime: 18,
    isBonus: false,
    isFirst: false,
    order: 3
  },
  {
    id: 'module-0-4-flutter-architecture',
    courseId: 'flutter-advanced',
    title: 'Architecture et Fonctionnement de Flutter',
    description: 'Comprenez l\'architecture haut niveau du framework Flutter',
    parentModuleId: 'module-0-fondamentaux',
    previousModuleId: 'module-0-3-flutter-comparaison',
    topics: [
      'Genèse et évolution de Flutter (2015-2024)',
      'Langage Dart et compilation multi-plateforme',
      'Moteurs de rendu (Skia, Impeller)',
      'Architecture Flutter pour iOS et Android',
      'Hot Reload vs Hot Restart',
      'Structure d\'un projet Flutter et compilation native'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 16,
    estimatedTime: 22,
    isBonus: false,
    isFirst: false,
    order: 4
  },

  // ==================== MODULE 1: INTRODUCTION ====================
  {
    id: 'module-1-1-dart',
    courseId: 'flutter-advanced',
    title: 'Introduction à la programmation avec Dart',
    description: 'Découvrez les fondamentaux du langage Dart',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-0-4-flutter-architecture',
    topics: [
      'Variables et types de données',
      'Opérateurs et expressions',
      'Structures de contrôle (if, switch)',
      'Boucles (for, while)',
      'Fonctions de base',
      'Collections (List, Map, Set)'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 10,
    estimatedTime: 15,
    isBonus: false,
    isFirst: false,
    order: 5
  },
  {
    id: 'module-1-2-flutter-init',
    courseId: 'flutter-advanced',
    title: 'Initiation au développement mobile avec Flutter',
    description: 'Premiers pas avec Flutter et création d\'applications simples',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-1-1-dart',
    topics: [
      'Installation et configuration Flutter',
      'Structure d\'un projet Flutter',
      'Hot reload et hot restart',
      'Widgets de base',
      'Runapp et MaterialApp',
      'Scaffold et AppBar'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 12,
    estimatedTime: 18,
    isBonus: false,
    isFirst: false,
    order: 6
  },
  {
    id: 'module-1-3-composants',
    courseId: 'flutter-advanced',
    title: 'Notions de base des composants Flutter',
    description: 'Maîtrisez les widgets StatelessWidget et StatefulWidget',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-1-2-flutter-init',
    topics: [
      'Déclarative UI',
      'Cycle de vie des composants',
      'StatelessWidget vs StatefulWidget',
      'Widget tree & Element tree',
      'BuildContext',
      'setState et gestion d\'état local'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 15,
    estimatedTime: 20,
    isBonus: false,
    isFirst: false,
    order: 7
  },
  {
    id: 'module-1-4-interfaces',
    courseId: 'flutter-advanced',
    title: 'Création des interfaces utilisateur',
    description: 'Composez des interfaces complexes avec les widgets Flutter',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-1-3-composants',
    topics: [
      'Composition des éléments',
      'Layout widgets (Column, Row, Stack)',
      'Container et Padding',
      'Composants de base (Text, Image, Icon)',
      'Création de pages',
      'ListView et GridView'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 12,
    estimatedTime: 18,
    isBonus: false,
    isFirst: false,
    order: 8
  },
  {
    id: 'module-1-5-navigation',
    courseId: 'flutter-advanced',
    title: 'Navigation entre les écrans',
    description: 'Gérez la navigation et les formulaires dans votre application',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-1-4-interfaces',
    topics: [
      'Navigator.push et Navigator.pop',
      'Routes nommées',
      'Passage de données entre écrans',
      'Interception des actions (WillPopScope)',
      'Création de formulaires',
      'TextField et validation'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 12,
    estimatedTime: 18,
    isBonus: false,
    isFirst: false,
    order: 9
  },
  {
    id: 'module-1-6-theme',
    courseId: 'flutter-advanced',
    title: 'Gestion du thème et des ressources',
    description: 'Personnalisez l\'apparence de votre application',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-1-5-navigation',
    topics: [
      'ThemeData et personnalisation',
      'Couleurs et palettes',
      'Ajout d\'images (assets)',
      'Icônes personnalisées',
      'Polices de caractères',
      'Configuration pubspec.yaml'
    ],
    difficulty: 'beginner',
    minimumScore: 70,
    questionCount: 10,
    estimatedTime: 15,
    isBonus: false,
    isFirst: false,
    order: 10
  },
  {
    id: 'module-1-bonus-navigation',
    courseId: 'flutter-advanced',
    title: 'BONUS: Navigator 1.0 vs GoRouter vs Navigator 2.0',
    description: 'Comparez les différentes approches de navigation',
    parentModuleId: 'module-1-intro',
    previousModuleId: 'module-1-6-theme',
    topics: [
      'Navigator 1.0 (impératif)',
      'Navigator 2.0 (déclaratif)',
      'GoRouter package',
      'Deep linking',
      'Navigation avancée'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 8,
    estimatedTime: 12,
    isBonus: true,
    isFirst: false,
    order: 11
  },

  // ==================== MODULE 2: INTERMÉDIAIRE ====================
  {
    id: 'module-2-1-interfaces-riches',
    courseId: 'flutter-advanced',
    title: 'Création d\'interfaces riches',
    description: 'Créez des interfaces utilisateur avancées et dynamiques',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-1-6-theme',
    topics: [
      'Widgets complexes',
      'CustomScrollView et Slivers',
      'Responsive design',
      'LayoutBuilder et MediaQuery',
      'Gestures et interactions',
      'Hero animations'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 15,
    estimatedTime: 22,
    isBonus: false,
    isFirst: false,
    order: 12
  },
  {
    id: 'module-2-2-animations',
    courseId: 'flutter-advanced',
    title: 'Animations implicites et explicites',
    description: 'Maîtrisez les animations pour des interfaces fluides',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-1-interfaces-riches',
    topics: [
      'AnimatedContainer et AnimatedOpacity',
      'Timer et Ticker',
      'AnimationController',
      'AnimatedWidget et AnimatedBuilder',
      'CustomPainter',
      'Transitions et Transform'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 14,
    estimatedTime: 20,
    isBonus: false,
    isFirst: false,
    order: 13
  },
  {
    id: 'module-2-3-gestion-etat',
    courseId: 'flutter-advanced',
    title: 'Gestion d\'état d\'une application Flutter',
    description: 'Provider, Riverpod, Bloc - Choisissez la bonne solution',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-2-animations',
    topics: [
      'InheritedWidget',
      'ValueNotifier + ValueListenableBuilder',
      'Provider package',
      'Riverpod',
      'Cubit et Bloc pattern',
      'Quand utiliser chaque solution'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 18,
    estimatedTime: 25,
    isBonus: false,
    isFirst: false,
    order: 14
  },
  {
    id: 'module-2-4-architecture',
    courseId: 'flutter-advanced',
    title: 'Architecture d\'une application Flutter',
    description: 'MVVM, Clean Architecture et principes SOLID',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-3-gestion-etat',
    topics: [
      'Feature First organisation',
      'MVVM pattern',
      'Principes SOLID',
      'Design patterns',
      'Clean Architecture',
      'Dependency injection'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 16,
    estimatedTime: 22,
    isBonus: false,
    isFirst: false,
    order: 15
  },
  {
    id: 'module-2-5-dart-avance',
    courseId: 'flutter-advanced',
    title: 'Notions avancées de Dart',
    description: 'POO, gestion d\'erreurs et programmation asynchrone',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-4-architecture',
    topics: [
      'Classes avancées (factory, getters, setters)',
      'Immutabilité des objets',
      'Inheritance et abstract classes',
      'Extensions et Mixins',
      'Gestion des erreurs et exceptions',
      'Futures, async/await et Streams'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 20,
    estimatedTime: 28,
    isBonus: false,
    isFirst: false,
    order: 16
  },
  {
    id: 'module-2-6-api-stockage',
    courseId: 'flutter-advanced',
    title: 'Interaction avec APIs et Stockage des données',
    description: 'HTTP, Firebase et bases de données locales',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-5-dart-avance',
    topics: [
      'Intégration API HTTP',
      'Génération de modèles et JSON',
      'shared_preferences',
      'sqflite et drift',
      'Firebase Authentication',
      'Cloud Firestore et Storage'
    ],
    difficulty: 'intermediate',
    minimumScore: 70,
    questionCount: 18,
    estimatedTime: 25,
    isBonus: false,
    isFirst: false,
    order: 17
  },
  {
    id: 'module-2-bonus-mason',
    courseId: 'flutter-advanced',
    title: 'BONUS: Templates réutilisables avec Mason & Bricks',
    description: 'Automatisez la génération de code',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-6-api-stockage',
    topics: [
      'Installation Mason CLI',
      'Création de bricks',
      'Templates de modèles',
      'Génération d\'architecture',
      'Tests automatiques'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 8,
    estimatedTime: 12,
    isBonus: true,
    isFirst: false,
    order: 18
  },
  {
    id: 'module-2-bonus-isolates',
    courseId: 'flutter-advanced',
    title: 'BONUS: Optimiser avec les Isolates - Google Maps Lite',
    description: 'Tâches de fond et performance',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-6-api-stockage',
    topics: [
      'Comprendre les Isolates',
      'Compute function',
      'Communication entre isolates',
      'Cas d\'usage (parsing, calculs)',
      'Google Maps integration'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 10,
    estimatedTime: 15,
    isBonus: true,
    isFirst: false,
    order: 19
  },
  {
    id: 'module-2-bonus-whatsapp',
    courseId: 'flutter-advanced',
    title: 'BONUS: Mini WhatsApp - Notifications temps réel',
    description: 'Chat instantané avec Firebase',
    parentModuleId: 'module-2-intermediaire',
    previousModuleId: 'module-2-6-api-stockage',
    topics: [
      'Firebase Cloud Messaging',
      'Real-time listeners',
      'Chat UI',
      'Envoi de fichiers',
      'Notifications push'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 12,
    estimatedTime: 18,
    isBonus: true,
    isFirst: false,
    order: 20
  },

  // ==================== MODULE 3: AVANCÉ ====================
  {
    id: 'module-3-1-production',
    courseId: 'flutter-advanced',
    title: 'Production de son application',
    description: 'Publication dans les stores et CI/CD',
    parentModuleId: 'module-3-avance',
    previousModuleId: 'module-2-6-api-stockage',
    topics: [
      'Icône et Splash screen',
      'Variables d\'environnement et Flavours',
      'Obfuscation du code',
      'Analytics et télémétrie',
      'Publication App Store et Play Store',
      'CI/CD avec GitHub Actions et GitLab'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 20,
    estimatedTime: 30,
    isBonus: false,
    isFirst: false,
    order: 21
  },
  {
    id: 'module-3-2-qualite-code',
    courseId: 'flutter-advanced',
    title: 'Qualité de code et performance',
    description: 'Tests, analyse et optimisation',
    parentModuleId: 'module-3-avance',
    previousModuleId: 'module-3-1-production',
    topics: [
      'flutter analyze et Lints',
      'Tests unitaires',
      'Widget testing',
      'Tests d\'intégration',
      'Flutter DevTools',
      'Analyse mémoire et performance'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 18,
    estimatedTime: 25,
    isBonus: false,
    isFirst: false,
    order: 22
  },
  {
    id: 'module-3-bonus-fvm',
    courseId: 'flutter-advanced',
    title: 'BONUS: Flutter Version Management (FVM)',
    description: 'Gérer plusieurs versions de Flutter',
    parentModuleId: 'module-3-avance',
    previousModuleId: 'module-3-2-qualite-code',
    topics: [
      'Installation FVM',
      'Switch entre versions',
      'Configuration par projet',
      'Best practices'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 6,
    estimatedTime: 10,
    isBonus: true,
    isFirst: false,
    order: 23
  },
  {
    id: 'module-3-bonus-publication-auto',
    courseId: 'flutter-advanced',
    title: 'BONUS: Publication automatisée Play Store',
    description: 'CI/CD avec Google Play API',
    parentModuleId: 'module-3-avance',
    previousModuleId: 'module-3-2-qualite-code',
    topics: [
      'Google Play API setup',
      'Fastlane configuration',
      'GitLab CI pipeline',
      'Automatisation complète'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 10,
    estimatedTime: 15,
    isBonus: true,
    isFirst: false,
    order: 24
  },
  {
    id: 'module-3-bonus-i18n',
    courseId: 'flutter-advanced',
    title: 'BONUS: Internationalisation (i18n)',
    description: 'Rendre son application multilingue',
    parentModuleId: 'module-3-avance',
    previousModuleId: 'module-3-2-qualite-code',
    topics: [
      'Flutter intl package',
      'ARB files',
      'Génération de traductions',
      'Changement de langue dynamique'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 8,
    estimatedTime: 12,
    isBonus: true,
    isFirst: false,
    order: 25
  },
  {
    id: 'module-3-bonus-monetisation',
    courseId: 'flutter-advanced',
    title: 'BONUS: Monétisation d\'application',
    description: 'In-app purchases, ads et abonnements',
    parentModuleId: 'module-3-avance',
    previousModuleId: 'module-3-2-qualite-code',
    topics: [
      'Google AdMob',
      'In-app purchases',
      'Abonnements (subscriptions)',
      'Revenue Cat integration',
      'Stratégies de monétisation'
    ],
    difficulty: 'advanced',
    minimumScore: 70,
    questionCount: 10,
    estimatedTime: 15,
    isBonus: true,
    isFirst: false,
    order: 26
  }
];

/**
 * Obtenir un module par son ID
 */
export const getModuleById = (moduleId) => {
  return MODULES_DATA.find(m => m.id === moduleId);
};

/**
 * Obtenir tous les modules obligatoires (non-bonus)
 */
export const getRequiredModules = () => {
  return MODULES_DATA.filter(m => !m.isBonus);
};

/**
 * Obtenir tous les modules bonus
 */
export const getBonusModules = () => {
  return MODULES_DATA.filter(m => m.isBonus);
};

/**
 * Obtenir les modules par groupe (Module 1, 2, 3)
 */
export const getModulesByGroup = (groupId) => {
  return MODULES_DATA.filter(m => m.parentModuleId === groupId);
};

/**
 * Obtenir le module suivant
 */
export const getNextModule = (currentModuleId) => {
  const currentModule = getModuleById(currentModuleId);
  if (!currentModule) return null;

  return MODULES_DATA.find(m => m.previousModuleId === currentModuleId && !m.isBonus);
};

/**
 * Statistiques des modules
 */
export const getModulesStats = () => {
  return {
    total: MODULES_DATA.length,
    required: getRequiredModules().length,
    bonus: getBonusModules().length,
    totalQuestions: MODULES_DATA.reduce((sum, m) => sum + m.questionCount, 0),
    totalTime: MODULES_DATA.reduce((sum, m) => sum + m.estimatedTime, 0)
  };
};

/**
 * Obtenir les modules d'une formation spécifique
 * @param {string} courseId - ID de la formation
 * @returns {Array} Liste des modules de la formation
 */
export const getModulesByCourse = (courseId) => {
  return MODULES_DATA.filter(m => m.courseId === courseId);
};

/**
 * Obtenir les modules obligatoires d'une formation
 * @param {string} courseId - ID de la formation
 * @returns {Array} Liste des modules obligatoires
 */
export const getRequiredModulesByCourse = (courseId) => {
  return MODULES_DATA.filter(m => m.courseId === courseId && !m.isBonus);
};

/**
 * Obtenir les modules bonus d'une formation
 * @param {string} courseId - ID de la formation
 * @returns {Array} Liste des modules bonus
 */
export const getBonusModulesByCourse = (courseId) => {
  return MODULES_DATA.filter(m => m.courseId === courseId && m.isBonus);
};
