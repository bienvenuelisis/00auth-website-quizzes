# Migration vers Multi-Courses - Guide Complet

Ce document détaille toutes les modifications nécessaires pour transformer l'application en système multi-formations.

## 📊 Vue d'Ensemble

### Changements Principaux

1. **Page d'accueil** : Affiche maintenant des cartes de formations au lieu des modules
2. **Structure de routing** : `/course/:courseId/module/:moduleId` au lieu de `/module/:moduleId`
3. **Données** : Ajout du concept de "Course" (Formation)
4. **Progression** : Stockage par formation ET par module

---

## 1. 🗂️ Modifications des Données

### A. Fichier `src/data/modules.js`

**Action** : Ajouter `courseId` à chaque module

**Avant** :
```javascript
{
  id: 'module-0-1-dev-informatique',
  title: 'Introduction au développement informatique',
  // ...
}
```

**Après** :
```javascript
{
  id: 'module-0-1-dev-informatique',
  courseId: 'flutter-advanced', // ⭐ NOUVEAU
  title: 'Introduction au développement informatique',
  // ...
}
```

**Modification manuelle requise** : Ajouter `courseId: 'flutter-advanced'` à TOUS les 26 modules.

**Script automatique** :
```javascript
// À exécuter dans la console du navigateur après migration
MODULES_DATA.forEach(module => {
  if (!module.courseId) {
    module.courseId = 'flutter-advanced';
  }
});
```

### B. Ajouter Helpers dans `src/data/modules.js`

```javascript
/**
 * Obtenir les modules d'une formation spécifique
 */
export const getModulesByCourse = (courseId) => {
  return MODULES_DATA.filter(m => m.courseId === courseId);
};

/**
 * Obtenir les modules obligatoires d'une formation
 */
export const getRequiredModulesByCourse = (courseId) => {
  return MODULES_DATA.filter(m => m.courseId === courseId && !m.isBonus);
};

/**
 * Obtenir les modules bonus d'une formation
 */
export const getBonusModulesByCourse = (courseId) => {
  return MODULES_DATA.filter(m => m.courseId === courseId && m.isBonus);
};
```

---

## 2. 🔄 Modifications de la Progression (Firestore)

### A. Nouvelle Structure `progress` Collection

**AVANT** :
```javascript
{
  userId: "uid",
  modules: {
    "module-0-1-dev-informatique": { ... },
    "module-0-2-mobile-ecosysteme": { ... }
  },
  globalStats: { ... }
}
```

**APRÈS** :
```javascript
{
  userId: "uid",
  courses: {
    "flutter-advanced": {
      courseId: "flutter-advanced",
      enrolledAt: Timestamp,
      lastActivityAt: Timestamp,
      modules: {
        "module-0-1-dev-informatique": { ... },
        "module-0-2-mobile-ecosysteme": { ... }
      },
      stats: {
        totalModulesCompleted: 5,
        totalQuizzesTaken: 12,
        averageScore: 78,
        totalTimeSpent: 5400,
        progress: 25 // %
      }
    }
  },
  globalStats: {
    totalCoursesEnrolled: 1,
    totalCoursesCompleted: 0,
    totalQuizzesTaken: 12,
    averageScore: 78,
    totalTimeSpent: 5400,
    badges: [...],
    // ...
  }
}
```

### B. Modèle de Données Participant (src/models/participant.js)

Ajouter :

```javascript
/**
 * @typedef {Object} CourseProgress
 * @property {string} courseId - ID de la formation
 * @property {Date} enrolledAt - Date d'inscription
 * @property {Date|null} completedAt - Date de complétion
 * @property {Date} lastActivityAt - Dernière activité
 * @property {Object.<string, ModuleProgress>} modules - Progression par module
 * @property {CourseStats} stats - Statistiques de la formation
 */

/**
 * @typedef {Object} CourseStats
 * @property {number} totalModulesCompleted
 * @property {number} totalQuizzesTaken
 * @property {number} averageScore
 * @property {number} totalTimeSpent
 * @property {number} progress - Pourcentage de progression (0-100)
 */

/**
 * Crée une nouvelle progression de formation
 */
export function createCourseProgress(courseId) {
  return {
    courseId,
    enrolledAt: new Date(),
    completedAt: null,
    lastActivityAt: new Date(),
    modules: {},
    stats: {
      totalModulesCompleted: 0,
      totalQuizzesTaken: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      progress: 0
    }
  };
}
```

---

## 3. 📁 Nouveaux Composants

### A. CourseCard Component

**Fichier** : `src/components/Dashboard/CourseCard.jsx`

```jsx
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow, CheckCircle } from '@mui/icons-material';

export default function CourseCard({ course, progress }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/course/${course.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Image ou gradient de fond */}
      <Box
        sx={{
          height: 200,
          background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}66 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 80
        }}
      >
        {course.icon}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          {course.shortTitle}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          {course.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip label={course.level} size="small" sx={{ mr: 1 }} />
          <Chip label={`${course.totalModules} modules`} size="small" variant="outlined" />
        </Box>

        {/* Progression si l'utilisateur a commencé */}
        {progress && progress > 0 ? (
          <>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Progression: {progress}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
          </>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            startIcon={progress && progress > 0 ? <PlayArrow /> : null}
            onClick={handleNavigate}
            fullWidth
          >
            {progress && progress > 0 ? 'Continuer' : 'Commencer'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
```

### B. CourseDashboard Page

**Fichier** : `src/pages/CourseDashboard.jsx`

```jsx
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Box, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getCourseById } from '../data/courses';
import { getModulesByCourse } from '../data/modules';
import ModuleCard from '../components/Dashboard/ModuleCard';

export default function CourseDashboard() {
  const { courseId } = useParams();
  const course = getCourseById(courseId);
  const modules = getModulesByCourse(courseId);

  if (!course) {
    return <div>Formation non trouvée</div>;
  }

  const requiredModules = modules.filter(m => !m.isBonus);
  const bonusModules = modules.filter(m => m.isBonus);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/">Formations</Link>
        <Typography color="text.primary">{course.shortTitle}</Typography>
      </Breadcrumbs>

      {/* En-tête de la formation */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="700">
          {course.icon} {course.title}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {course.description}
        </Typography>
      </Box>

      {/* Card de progression globale (similaire à l'ancien QuizDashboard) */}
      {/* ... */}

      {/* Modules obligatoires */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>Modules Obligatoires</Typography>
        <Grid container spacing={3}>
          {requiredModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.id}>
              <ModuleCard module={module} courseId={courseId} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Modules bonus */}
      {bonusModules.length > 0 && (
        <Box>
          <Typography variant="h4" gutterBottom>Modules Bonus</Typography>
          <Grid container spacing={3}>
            {bonusModules.map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module.id}>
                <ModuleCard module={module} courseId={courseId} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}
```

---

## 4. 🔀 Modifications du Routing

### Fichier `src/App.jsx`

**AVANT** :
```jsx
<Routes>
  <Route path="/" element={<QuizDashboard />} />
  <Route path="/module/:moduleId" element={<ModuleDetail />} />
  <Route path="/module/:moduleId/quiz" element={<QuizSession />} />
  <Route path="/module/:moduleId/results" element={<Results />} />
</Routes>
```

**APRÈS** :
```jsx
<Routes>
  {/* Page d'accueil - Liste des formations */}
  <Route path="/" element={<QuizDashboard />} />

  {/* Authentification et profil */}
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/profile" element={<ProfilePage />} />

  {/* Dashboard d'une formation */}
  <Route path="/course/:courseId" element={<CourseDashboard />} />

  {/* Modules d'une formation */}
  <Route path="/course/:courseId/module/:moduleId" element={<ModuleDetail />} />
  <Route path="/course/:courseId/module/:moduleId/quiz" element={<QuizSession />} />
  <Route path="/course/:courseId/module/:moduleId/results" element={<Results />} />

  {/* Redirection */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## 5. 🔧 Modifications des Composants Existants

### A. ModuleCard

Mettre à jour les liens pour inclure `courseId` :

```jsx
// AVANT
<Link to={`/module/${module.id}`}>

// APRÈS
<Link to={`/course/${courseId}/module/${module.id}`}>
```

### B. QuizDashboard (Devient la page d'accueil)

Transformer pour afficher les formations au lieu des modules :

```jsx
export default function QuizDashboard() {
  const courses = getPublishedCourses();
  const { userProgress } = useQuizStore();

  return (
    <Container>
      <Typography variant="h3">Mes Formations</Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <CourseCard
              course={course}
              progress={calculateCourseProgress(course.id, userProgress)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
```

### C. ModuleDetail, QuizSession, Results

Adapter pour récupérer `courseId` depuis les params :

```jsx
export default function ModuleDetail() {
  const { courseId, moduleId } = useParams(); // ⭐ Ajouter courseId

  // Utiliser courseId pour la navigation
  const handleStartQuiz = () => {
    navigate(`/course/${courseId}/module/${moduleId}/quiz`);
  };
}
```

---

## 6. 💾 Modifications du Store Zustand

### Fichier `src/stores/quizStore.js`

Ajouter des fonctions pour gérer les formations :

```javascript
/**
 * Obtenir la progression d'une formation spécifique
 */
getCourseProgress: (courseId) => {
  const { userProgress } = get();
  const courseData = userProgress.courses?.[courseId];

  if (!courseData) return 0;

  const modules = getModulesByCourse(courseId);
  const requiredModules = modules.filter(m => !m.isBonus);
  const completedModules = requiredModules.filter(m => {
    const progress = courseData.modules[m.id];
    return progress && (progress.status === 'completed' || progress.status === 'perfect');
  });

  return Math.round((completedModules.length / requiredModules.length) * 100);
},

/**
 * Inscrire l'utilisateur à une formation
 */
enrollInCourse: (courseId) => {
  set(state => ({
    userProgress: {
      ...state.userProgress,
      courses: {
        ...state.userProgress.courses,
        [courseId]: createCourseProgress(courseId)
      }
    }
  }));
}
```

---

## 7. 🔄 Migration des Données Existantes

### Script de Migration Firestore

Pour les utilisateurs existants, migrer leurs données vers la nouvelle structure :

```javascript
// services/firebase/firestore/migration.js

export async function migrateUserProgressToMultiCourse(userId) {
  try {
    const oldProgress = await getProgress(userId);

    // Si déjà migré, ne rien faire
    if (oldProgress.courses) return;

    const newProgress = {
      userId,
      lastSync: new Date(),
      courses: {
        'flutter-advanced': {
          courseId: 'flutter-advanced',
          enrolledAt: oldProgress.globalStats.lastActivityDate || new Date(),
          completedAt: null,
          lastActivityAt: oldProgress.globalStats.lastActivityDate || new Date(),
          modules: oldProgress.modules || {},
          stats: {
            totalModulesCompleted: oldProgress.globalStats.totalModulesCompleted,
            totalQuizzesTaken: oldProgress.globalStats.totalQuizzesTaken,
            averageScore: oldProgress.globalStats.averageScore,
            totalTimeSpent: oldProgress.globalStats.totalTimeSpent,
            progress: calculateProgress('flutter-advanced', oldProgress.modules)
          }
        }
      },
      globalStats: {
        ...oldProgress.globalStats,
        totalCoursesEnrolled: 1,
        totalCoursesCompleted: 0
      }
    };

    await updateDocument('progress', userId, newProgress);

    console.log('Migration réussie pour l\'utilisateur:', userId);
  } catch (error) {
    console.error('Erreur de migration:', error);
    throw error;
  }
}
```

---

## 8. ✅ Checklist de Migration

- [ ] Créer `src/data/courses.js`
- [ ] Ajouter `courseId: 'flutter-advanced'` à tous les modules dans `modules.js`
- [ ] Ajouter les helpers `getModulesByCourse`, etc. dans `modules.js`
- [ ] Créer `src/components/Dashboard/CourseCard.jsx`
- [ ] Créer `src/pages/CourseDashboard.jsx`
- [ ] Modifier le routing dans `src/App.jsx`
- [ ] Mettre à jour `ModuleCard` pour utiliser `courseId`
- [ ] Refactoriser `QuizDashboard` pour afficher les formations
- [ ] Modifier `ModuleDetail`, `QuizSession`, `Results` pour gérer `courseId`
- [ ] Mettre à jour le store Zustand avec les fonctions de formations
- [ ] Mettre à jour le modèle de données dans `participant.js`
- [ ] Créer le script de migration Firestore
- [ ] Exécuter la migration pour les utilisateurs existants
- [ ] Tester tous les parcours utilisateur
- [ ] Mettre à jour la documentation

---

## 9. 🧪 Tests à Effectuer

1. ✅ Affichage de la page d'accueil avec les formations
2. ✅ Navigation vers le dashboard d'une formation
3. ✅ Affichage des modules d'une formation
4. ✅ Démarrage d'un quiz
5. ✅ Sauvegarde de la progression
6. ✅ Retour à la page d'accueil
7. ✅ Progression correctement affichée sur la carte de formation
8. ✅ Migration des données existantes

---

## 10. 📝 Bénéfices de Cette Architecture

### Avantages
✅ **Scalabilité** : Facile d'ajouter de nouvelles formations
✅ **Organisation** : Séparation claire entre formations et modules
✅ **UX** : Vue d'ensemble claire pour l'utilisateur
✅ **Progression** : Tracking séparé par formation
✅ **Flexibilité** : Différentes formations peuvent avoir des structures différentes

### Inconvénients
⚠️ **Complexité** : Plus de niveaux de navigation
⚠️ **Migration** : Nécessite la migration des données existantes
⚠️ **Performance** : Plus de requêtes pour charger les données

---

## 11. 🔮 Évolutions Futures

Une fois cette architecture en place, il sera facile d'ajouter :

- ✨ Système d'inscription aux formations
- ✨ Certificats de complétion par formation
- ✨ Prérequis entre formations
- ✨ Parcours d'apprentissage recommandés
- ✨ Formations payantes vs gratuites
- ✨ Système de notation et reviews
- ✨ Tableau de bord multi-formations
