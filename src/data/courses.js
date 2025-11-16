/**
 * Définition des formations (courses) disponibles
 */

export const COURSES_DATA = [
  {
    id: 'flutter-advanced',
    title: 'Formation Développeur Mobile Avancé avec Flutter',
    shortTitle: 'Flutter Avancé',
    description: 'Maîtrisez le développement d\'applications mobiles cross-platform avec Flutter et Dart',
    longDescription: 'Formation complète pour devenir un développeur Flutter expert. Apprenez à créer des applications mobiles performantes pour iOS et Android avec un seul code source.',
    level: 'advanced',
    category: 'Mobile Development',
    language: 'fr',

    // Informations visuelles
    thumbnail: '/images/courses/flutter-advanced.png', // À ajouter
    color: '#02569B', // Couleur principale Flutter
    icon: '📱',

    // Métadonnées
    duration: '120 heures', // Estimation totale
    totalModules: 26, // Calculé automatiquement depuis modules.js
    requiredModules: 18, // Modules obligatoires
    bonusModules: 8, // Modules bonus

    // Prérequis
    prerequisites: [
      'Connaissances de base en programmation',
      'Notions d\'algorithmique',
      'Motivation pour apprendre'
    ],

    // Objectifs d'apprentissage
    learningObjectives: [
      'Maîtriser le langage Dart',
      'Créer des applications mobiles Flutter',
      'Comprendre l\'architecture Flutter',
      'Gérer l\'état d\'applications complexes',
      'Publier des applications sur les stores',
      'Appliquer les bonnes pratiques de développement'
    ],

    // Compétences acquises
    skills: [
      'Flutter',
      'Dart',
      'Architecture Mobile',
      'State Management',
      'CI/CD',
      'Tests',
      'Firebase'
    ],

    // Statut
    isPublished: true,
    isActive: true,
    isFeatured: true,

    // Dates
    createdAt: '2024-01-01',
    updatedAt: '2025-01-13',

    // Statistiques (seront calculées dynamiquement)
    stats: {
      totalEnrollments: 0,
      averageCompletionRate: 0,
      averageRating: 0,
      totalReviews: 0
    }
  }

  // Futures formations à ajouter
  /*
  {
    id: 'react-native-fundamentals',
    title: 'Formation React Native - Fondamentaux',
    shortTitle: 'React Native',
    description: 'Créez des applications mobiles avec React Native et JavaScript',
    level: 'intermediate',
    category: 'Mobile Development',
    color: '#61DAFB',
    icon: '⚛️',
    isPublished: false,
    isActive: false,
    isFeatured: false
  },
  {
    id: 'kotlin-android',
    title: 'Développement Android avec Kotlin',
    shortTitle: 'Kotlin Android',
    description: 'Développement natif Android avec Kotlin et Jetpack Compose',
    level: 'intermediate',
    category: 'Mobile Development',
    color: '#7F52FF',
    icon: '🤖',
    isPublished: false,
    isActive: false,
    isFeatured: false
  }
  */
];

/**
 * Obtenir une formation par son ID
 */
export const getCourseById = (courseId) => {
  return COURSES_DATA.find(c => c.id === courseId);
};

/**
 * Obtenir toutes les formations publiées
 */
export const getPublishedCourses = () => {
  return COURSES_DATA.filter(c => c.isPublished && c.isActive);
};

/**
 * Obtenir les formations en vedette
 */
export const getFeaturedCourses = () => {
  return COURSES_DATA.filter(c => c.isFeatured && c.isPublished && c.isActive);
};

/**
 * Obtenir les formations par catégorie
 */
export const getCoursesByCategory = (category) => {
  return COURSES_DATA.filter(c => c.category === category && c.isPublished);
};

/**
 * Obtenir les formations par niveau
 */
export const getCoursesByLevel = (level) => {
  return COURSES_DATA.filter(c => c.level === level && c.isPublished);
};
