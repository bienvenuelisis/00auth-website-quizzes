# Documentation de Référence - Projet 00auth.dev

## Guide pour la Création d'un Projet Quiz Complémentaire

---

## Table des Matières

1. [Vue d'Ensemble du Projet Source](#1-vue-densemble-du-projet-source)
2. [Architecture Technique](#2-architecture-technique)
3. [Design System et Identité Visuelle](#3-design-system-et-identité-visuelle)
4. [Structure des Données](#4-structure-des-données)
5. [Services et Utilitaires](#5-services-et-utilitaires)
6. [Configuration Firebase](#6-configuration-firebase)
7. [Assets et Ressources](#7-assets-et-ressources)
8. [Recommandations pour le Projet Quiz](#8-recommandations-pour-le-projet-quiz)
9. [Checklist de Démarrage](#9-checklist-de-démarrage)

---

## 1. Vue d'Ensemble du Projet Source

### 1.1 Identité du Projet

**Nom:** 00auth.dev - Le Développeur Authentique
**Type:** Site web personnel et plateforme de services
**Stack Principal:** React 18.2 + Vite 4.5 + Material-UI 5
**Hébergement:** Firebase Hosting
**Analytics:** Firebase Analytics

### 1.2 Objectifs et Fonctionnalités

Le site 00auth.dev est une plateforme professionnelle qui combine :

- **Portfolio** - Projets, articles, conférences
- **Services** - Formation Flutter avancée (6 mois), consultations
- **Agrégation de contenu** - Articles depuis LinkedIn, Hashnode, Newsletter
- **Engagement** - Prise de rendez-vous, téléchargements, inscriptions

### 1.3 État Actuel du Projet

**Version:** 1.0.0
**Derniers commits majeurs:**
- Mise à jour des dates limites d'inscriptions
- Ajout du syllabus et téléchargement
- Amélioration du tracking Firebase Analytics
- Ajout du CV et téléchargement

**Points forts:**
- Architecture React moderne et bien structurée
- Design élégant inspiré James Bond
- Système d'analytics complet
- Thème clair/sombre avec persistance
- Agrégation multi-sources d'articles

**Points à améliorer:**
- Système de booking incomplet (UI présente, backend manquant)
- Newsletter non implémentée (UI présente)
- Tests unitaires minimaux
- Pas de TypeScript (uniquement type definitions)

---

## 2. Architecture Technique

### 2.1 Stack Technologique

```json
{
  "frontend": {
    "framework": "React 18.2.0",
    "buildTool": "Vite 4.5.14",
    "router": "React Router DOM 6.17.0",
    "ui": "Material-UI 5.14.17",
    "styling": "@emotion/react 11.11.1 + @emotion/styled 11.11.0",
    "icons": "@mui/icons-material 5.14.16",
    "datePicker": "@mui/x-date-pickers 6.18.1",
    "utilities": "dayjs 1.11.10"
  },
  "backend": {
    "hosting": "Firebase Hosting",
    "analytics": "Firebase Analytics 12.3.0",
    "dataStorage": "Static JSON files + External APIs"
  },
  "devTools": {
    "types": "@types/react 18.3.23 + @types/react-dom 18.3.7",
    "vitePlugin": "@vitejs/plugin-react 4.7.0"
  }
}
```

### 2.2 Structure des Dossiers

```
00auth-dev-website/
├── public/
│   ├── documents/
│   │   ├── CV_AGBAVON_Kokou_Bienvenu.pdf
│   │   └── syllabus/
│   │       └── Syllabus_Formation_Flutter_Avancee.pdf
│   ├── images/
│   │   ├── speeches/
│   │   ├── projects/
│   │   ├── formations/
│   │   └── me_conference.jpg
│   ├── *_articles_source.json (3 fichiers)
│   └── favicon, manifest, etc.
│
├── src/
│   ├── components/
│   │   ├── Articles/
│   │   │   ├── ArticleCard.js
│   │   │   ├── ArticleFilters.js
│   │   │   ├── ArticleStats.js
│   │   │   ├── ArticleSkeletonCard.js
│   │   │   ├── ArticlesLoadingState.js
│   │   │   ├── Pagination.js
│   │   │   ├── ShareableLink.js
│   │   │   ├── SpeechCard.js
│   │   │   └── __tests__/
│   │   ├── Common/
│   │   │   ├── TrackedButton.js
│   │   │   └── TrackedExternalLink.js
│   │   ├── Layout/
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── ThemeToggle.js
│   │   ├── Services/
│   │   │   ├── ServiceCard.js
│   │   │   └── FeaturedTrainingCard.jsx
│   │   └── Speeches/
│   │       └── FeaturedSpeechCard.js
│   │
│   ├── contexts/
│   │   └── ThemeContext.js
│   │
│   ├── data/
│   │   ├── profile.json
│   │   ├── projects.json
│   │   ├── speeches.json
│   │   ├── services.json
│   │   ├── articles.json
│   │   ├── all-services.json
│   │   └── externalArticleModel.js
│   │
│   ├── hooks/
│   │   ├── useAnalytics.js
│   │   ├── useArticles.js
│   │   ├── usePagination.js
│   │   ├── useServices.js
│   │   └── useURLFilters.js
│   │
│   ├── models/
│   │   └── ServiceModels.js
│   │
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Projects.js
│   │   ├── Speeches.js
│   │   ├── SpeechDetail.js
│   │   ├── Articles.js
│   │   ├── ArticleDetail.js
│   │   ├── Services.js
│   │   ├── ServiceDetail.js
│   │   └── Contact.js
│   │
│   ├── services/
│   │   ├── analytics.js
│   │   └── fetchExternalArticles.js
│   │
│   ├── config/
│   │   └── firebase.js
│   │
│   ├── App.js
│   ├── main.jsx
│   ├── index.css
│   └── theme.js
│
├── .env
├── .env.production
├── firebase.json
├── .firebaserc
├── vite.config.js
├── package.json
└── README.md
```

### 2.3 Routing et Navigation

**Configuration React Router v6:**

```javascript
// Routes principales
/ → Home
/projects → Projects (liste)
/speeches → Speeches (liste)
/speeches/:id → SpeechDetail
/articles → Articles (liste + filtres)
/articles/:id → ArticleDetail
/services → Services (liste)
/services/:type/:id → ServiceDetail (formation/consultation)
/contact → Contact
```

**Fonctionnalités de routing:**
- Client-side routing avec BrowserRouter
- Scroll automatique vers le haut lors du changement de page
- Tracking analytics sur chaque changement de route
- Paramètres d'URL pour filtres partagés (articles)
- Firebase hosting rewrites (toutes routes → index.html)

### 2.4 Gestion d'État

**Approche minimaliste sans Redux:**

1. **Context API** - ThemeContext pour le mode clair/sombre
2. **Component State** - useState pour l'état local
3. **URL State** - Paramètres d'URL pour filtres (useURLFilters)
4. **Custom Hooks** - Logique partagée réutilisable
5. **LocalStorage** - Persistance préférence thème

**Pas de bibliothèque de state management global** → Simplicité et performance

---

## 3. Design System et Identité Visuelle

### 3.1 Inspiration James Bond 007

**Concept:** Élégance, sobriété, professionnalisme avec un clin d'œil à l'univers 007

**Mots-clés design:**
- Sophistication
- Minimalisme
- Contraste élégant
- Animations subtiles
- Typographie claire

### 3.2 Palette de Couleurs

```javascript
// Couleurs principales
const colors = {
  primary: {
    main: '#1a1a1a',    // Noir élégant (comme le smoking de Bond)
    light: '#333333',
    dark: '#000000'
  },
  secondary: {
    main: '#c9b037',    // Or James Bond (doré sophistiqué)
    light: '#ddc76b',
    dark: '#9d8627'
  },

  // Mode clair
  light: {
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666'
    }
  },

  // Mode sombre
  dark: {
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0'
    }
  }
};
```

**Utilisation des couleurs:**
- **Noir (#1a1a1a)** - Textes principaux, boutons primaires, éléments structurels
- **Or (#c9b037)** - Accents, CTAs importants, hover states, focus
- **Gris (#666666)** - Textes secondaires, descriptions
- **Blanc (#ffffff)** - Backgrounds mode clair, textes mode sombre

### 3.3 Typographie

**Police principale:** Inter (Google Fonts)

```javascript
typography: {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

  h1: {
    fontWeight: 700,
    fontSize: '3.5rem',    // 56px
    lineHeight: 1.2
  },
  h2: {
    fontWeight: 600,
    fontSize: '2.5rem',    // 40px
    lineHeight: 1.3
  },
  h3: {
    fontWeight: 600,
    fontSize: '2rem',      // 32px
    lineHeight: 1.4
  },
  h4: {
    fontWeight: 500,
    fontSize: '1.5rem',    // 24px
    lineHeight: 1.4
  },
  body1: {
    fontSize: '1rem',      // 16px
    lineHeight: 1.6
  }
}
```

**Hiérarchie typographique:**
- H1 → Titres de pages principales
- H2 → Sections majeures
- H3 → Sous-sections
- H4 → Titres de cartes/composants
- Body1 → Texte courant

### 3.4 Composants Material-UI Personnalisés

**Boutons (MuiButton):**
```javascript
{
  textTransform: 'none',        // Pas de MAJUSCULES
  borderRadius: 8,              // Coins arrondis doux
  fontWeight: 500,
  padding: '10px 24px',

  // Variant outlined
  outlined: {
    borderColor: mode === 'light' ? '#1a1a1a' : '#ffffff',
    '&:hover': {
      borderColor: '#c9b037',
      color: '#c9b037',
      backgroundColor: 'rgba(201, 176, 55, 0.04)'
    }
  }
}
```

**Cartes (MuiCard):**
```javascript
{
  borderRadius: 12,
  boxShadow: mode === 'light'
    ? '0 4px 20px rgba(0,0,0,0.1)'
    : '0 4px 20px rgba(255,255,255,0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',     // Effet lift au survol
    boxShadow: mode === 'light'
      ? '0 8px 30px rgba(0,0,0,0.15)'
      : '0 8px 30px rgba(255,255,255,0.1)'
  }
}
```

**Champs de texte (MuiTextField):**
```javascript
{
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#c9b037'    // Or au focus
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#c9b037'            // Label or au focus
  }
}
```

**AppBar (Navigation):**
```javascript
{
  backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
}
```

### 3.5 Animations et Transitions

**Transitions globales:**
```css
transition: transform 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out,
            background-color 0.3s ease;
```

**Effets hover:**
- Cards → translateY(-4px) + shadow increase
- Buttons → color change + subtle background
- Links → color transition to gold
- Images → scale(1.05)

**Loading states:**
- Skeleton screens avec animation pulse
- Transitions fluides entre loading → content

### 3.6 Responsive Breakpoints

**Breakpoints Material-UI:**
```javascript
{
  xs: 0,      // Extra small (mobile)
  sm: 600,    // Small (tablette portrait)
  md: 960,    // Medium (tablette paysage)
  lg: 1280,   // Large (desktop)
  xl: 1920    // Extra large (grand écran)
}
```

**Approche Mobile-First:**
- Design conçu d'abord pour mobile
- Progressive enhancement pour desktop
- Navigation burger sur mobile (<md)
- Grilles adaptatives (12 colonnes MUI)

---

## 4. Structure des Données

### 4.1 Fichiers JSON Statiques

#### profile.json

```json
{
  "name": "AGBAVON Kokou Bienvenu",
  "title": "Développeur Mobile & Web",
  "tagline": "Le Développeur Authentique",
  "description": "Développeur mobile et web passionné...",
  "avatar": "/images/me_conference.jpg",
  "email": "contact@00auth.dev",
  "phone": "+228 ...",
  "location": "Lomé, Togo",
  "calendly": "https://calendly.com/...",
  "socialLinks": {
    "github": "https://github.com/bienvenuelisis",
    "linkedin": "https://linkedin.com/in/bienvenu-agbavon",
    "twitter": "...",
    "hashnode": "..."
  },
  "skills": ["Flutter", "React", "Node.js", ...],
  "yearsOfExperience": 5
}
```

**Utilisation:**
- Hero section (Home page)
- Footer contact info
- About section
- Statistics dashboard

#### services.json

**Structure détaillée pour la formation Flutter:**

```json
{
  "formations": [
    {
      "id": "flutter-avance",
      "title": "Formation Développeur Mobile Avancé",
      "description": "6 mois pour maîtriser Flutter...",
      "type": "formation",
      "format": "en ligne (cours lives + mentorat 1-on-1)",
      "duration": "6 mois (jusqu'à 200 heures)",
      "level": "Débutant à Avancé",
      "priceRange": "250.000 - 350.000",
      "currency": "FCFA",

      "pricingDetails": {
        "basePrice": 250000,
        "options": [
          {
            "label": "Prix de base",
            "price": 250000,
            "description": "Formation complète..."
          },
          {
            "label": "Réduction étudiant",
            "price": -50000,
            "description": "..."
          }
        ]
      },

      "schedule": {
        "frequency": "6-10h/semaine",
        "sessions": "3 à 5 séances de 2h",
        "individualMentoring": "1h/semaine"
      },

      "modules": [
        "Introduction au développement mobile",
        "Maîtrise Dart et Flutter",
        "Gestion d'état (Provider, Riverpod, Bloc)",
        "Architecture MVVM et Clean Architecture",
        "API, Firebase, Storage",
        "CI/CD et Publication stores"
      ],

      "bonusModules": [
        "GoRouter vs Navigator 2.0",
        "Mason & Bricks templates",
        "Isolates et Google Maps Lite",
        "Notifications temps réel"
      ],

      "targetAudience": [
        "Étudiants en reconversion",
        "Développeurs web → mobile",
        "Développeurs mobiles juniors"
      ],

      "prerequisites": [
        "Bases programmation (recommandé)",
        "Motivation et 6h/semaine minimum",
        "PC 8Go RAM, 50Go libre"
      ],

      "resources": [
        { "type": "documentation", "description": "Docs complète FR" },
        { "type": "codebase", "description": "Codes sources TPs" },
        { "type": "kit", "description": "Kit démarrage Flutter" },
        { "type": "tools", "description": "CLI MVVM architecture" }
      ],

      "nextCohort": "10 Novembre 2025 - 30 Avril 2026",
      "registrationStart": "2025-10-16T23:59:59Z",
      "registrationDeadline": "2025-11-02T23:59:59Z",
      "maxParticipants": 6,

      "caIncitations": [
        { "data": "+4", "text": "mini projets réels" },
        { "data": "+2", "text": "apps déployées" },
        { "data": "+2 mois", "text": "stage entreprise" }
      ],

      "marketContext": [
        "75% internautes africains utilisent smartphone",
        "1.5M emplois mobiles en Afrique",
        "Google, Binance, ByteDance utilisent Flutter"
      ],

      "signUpLink": "https://forms.gle/...",
      "syllabusLink": "/documents/syllabus/...",
      "featured": true
    }
  ],
  "consultations": []
}
```

**Points clés:**
- Tarification flexible avec options additionnelles
- Modules détaillés + bonus
- Dates et deadlines ISO 8601
- Incitations marketing (caIncitations)
- Contexte marché pour justification valeur

#### projects.json

```json
[
  {
    "id": "google-maps-directions",
    "title": "Google Maps Directions",
    "type": "package",
    "description": "Package Flutter pour itinéraires Google Maps",
    "features": [
      "Calcul d'itinéraires",
      "Affichage sur carte",
      "Support modes transport"
    ],
    "stats": {
      "downloads": "10k+",
      "likes": 45,
      "pubPoints": 130,
      "popularity": "89%"
    },
    "technologies": ["Flutter", "Dart", "Google Maps API"],
    "platforms": ["Android", "iOS", "Web"],
    "links": {
      "pub": "https://pub.dev/packages/...",
      "github": "https://github.com/...",
      "demo": "..."
    },
    "image": "/images/projects/google-maps-directions.png",
    "featured": true,
    "date": "2024-03-15"
  }
]
```

#### speeches.json

```json
[
  {
    "id": "flutter-fest-2024",
    "title": "Architecture MVVM dans Flutter",
    "event": "Flutter Festival 2024",
    "type": "conference",
    "date": "2024-09-20",
    "location": "Lomé, Togo",
    "description": "Présentation architecture MVVM...",
    "topics": [
      "Clean Architecture",
      "Separation of Concerns",
      "Testabilité"
    ],
    "duration": "45min",
    "details": {
      "startTime": "14:00",
      "organizer": "GDG Lomé",
      "venue": "Seedspace Lomé",
      "role": "Speaker principal",
      "attendees": 80
    },
    "slides": "https://slides.com/...",
    "video": "https://youtube.com/...",
    "image": "/images/speeches/flutter-fest-2024.jpg",
    "featured": true
  }
]
```

### 4.2 Agrégation Articles Externes

**Sources configurées:**

1. **Newsletter Tech & Africa** (API JSON)
   - URL: `https://newsletter.00auth.dev/api/articles`
   - Format: JSON direct

2. **LinkedIn Articles** (JSON statique)
   - Fichier: `/public/linkedin_articles_source.json`

3. **Hashnode Blog 1** - The Auth Dev (RSS)
   - Fichier: `/public/hashnode_technical_articles_source.json`

4. **Hashnode Blog 2** - My Flutter Journey (RSS)
   - Fichier: `/public/flutter_journey_articles_source.json`

**Modèle d'article normalisé:**

```javascript
{
  id: string,
  title: string,
  summary: string,
  content: string,
  image: string,
  url: string,

  author: {
    name: string,
    avatar: string,
    email: string,
    web: string,
    linkedin: string,
    twitter: string
  },

  date: string (ISO 8601),
  read_time: number (minutes),

  categories: string[],
  category_main: string,
  tags: string[],

  featured: boolean,
  orientation: 'portrait' | 'landscape',

  source: {
    name: string,
    homepage: string,
    api: string,
    color: string,
    description: string
  }
}
```

**Service d'agrégation (fetchExternalArticles.js):**

```javascript
// Parsing RSS XML
const parseRSSFeed = (xmlText) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const items = xmlDoc.querySelectorAll('item');

  return Array.from(items).map(item => {
    const title = item.querySelector('title')?.textContent;
    const link = item.querySelector('link')?.textContent;
    const description = item.querySelector('description')?.textContent;
    const pubDate = item.querySelector('pubDate')?.textContent;
    const creator = item.querySelector('creator')?.textContent;
    const categories = Array.from(item.querySelectorAll('category'))
      .map(cat => cat.textContent);

    // Calculer temps de lecture
    const wordCount = description?.split(/\s+/).length || 0;
    const readTime = Math.ceil(wordCount / 200);

    return {
      id: link,
      title,
      summary: description,
      url: link,
      date: new Date(pubDate).toISOString(),
      read_time: readTime,
      categories,
      // ... normalisation complète
    };
  });
};

// Agrégation de toutes les sources
const fetchAllArticles = async () => {
  const [newsletter, linkedin, hashnode1, hashnode2] = await Promise.all([
    fetchNewsletterArticles(),
    fetchLinkedInArticles(),
    fetchHashnodeArticles('technical'),
    fetchHashnodeArticles('flutter')
  ]);

  return [...newsletter, ...linkedin, ...hashnode1, ...hashnode2]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};
```

---

## 5. Services et Utilitaires

### 5.1 Analytics Service (analytics.js)

**Classe singleton avec queue d'événements:**

```javascript
class AnalyticsService {
  constructor() {
    this.isEnabled = !!analytics;
    this.eventQueue = [];
    this.startCheckingAnalytics();  // Polling jusqu'à Firebase ready
  }

  // Méthode générique
  logEvent(eventName, parameters = {}) {
    if (!isAnalyticsReady()) {
      this.eventQueue.push({ eventName, parameters });
      return;
    }
    logEvent(analytics, eventName, parameters);
  }

  // Événements spécifiques
  logPageView(pageName, pageTitle, additionalParams) { ... }
  logNavigation(from, to, method) { ... }
  logArticleView(articleId, articleTitle, category) { ... }
  logProjectView(projectId, projectTitle, type) { ... }
  logServiceView(serviceId, serviceTitle, serviceType) { ... }
  logSpeechView(speechId, speechTitle, eventName) { ... }
  logUserInteraction(action, category, label, value) { ... }
  logExternalLink(url, linkText, location) { ... }
  logSearch(query, category, resultsCount) { ... }
  logScrollDepth(page, depth) { ... }
  logTimeOnPage(page, seconds) { ... }

  // Événements spécifiques services
  logInscriptionModalOpen(serviceId, serviceTitle) { ... }
  logInscriptionSubmit(serviceId, serviceTitle, formData) { ... }
  logCTAClick(ctaName, ctaLocation, destination) { ... }
  logSyllabusDownload(serviceId, serviceTitle) { ... }
}

export default new AnalyticsService();
```

**Événements trackés:**
- Navigation et vues de pages
- Interactions utilisateur (clics, soumissions)
- Vues de contenu (articles, projets, services, speeches)
- Liens externes
- Recherches
- Scroll depth (25%, 50%, 75%, 100%)
- Temps passé sur page
- Téléchargements (CV, syllabus)
- Inscriptions formations

### 5.2 Custom Hooks

#### useAnalytics

```javascript
import { useCallback } from 'react';
import analyticsService from '../services/analytics';

export const useAnalytics = () => {
  const trackPageView = useCallback((pageName, pageTitle, params) => {
    analyticsService.logPageView(pageName, pageTitle, params);
  }, []);

  const trackInteraction = useCallback((action, category, label, value) => {
    analyticsService.logUserInteraction(action, category, label, value);
  }, []);

  const trackCTAClick = useCallback((ctaName, location, destination) => {
    analyticsService.logCTAClick(ctaName, location, destination);
  }, []);

  return {
    trackPageView,
    trackInteraction,
    trackCTAClick,
    // ... autres méthodes
  };
};
```

#### useArticles

```javascript
export const useArticles = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExternalArticles()
      .then(articles => setAllArticles(articles))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // Filtrage avec memoization
  const filterArticles = useCallback((filters) => {
    return allArticles.filter(article => {
      const matchSearch = !filters.search ||
        article.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        article.summary.toLowerCase().includes(filters.search.toLowerCase());

      const matchCategory = !filters.category ||
        filters.category === 'all' ||
        article.category_main === filters.category;

      const matchSource = !filters.source ||
        article.source.name === filters.source;

      const matchTags = !filters.tags?.length ||
        filters.tags.every(tag => article.tags.includes(tag));

      return matchSearch && matchCategory && matchSource && matchTags;
    });
  }, [allArticles]);

  // Statistiques
  const statistics = useMemo(() => ({
    totalArticles: allArticles.length,
    totalReadTime: allArticles.reduce((sum, a) => sum + a.read_time, 0),
    categoriesCount: new Set(allArticles.map(a => a.category_main)).size,
    sourcesCount: new Set(allArticles.map(a => a.source.name)).size,
    topTags: getTopTags(allArticles, 10)
  }), [allArticles]);

  return { allArticles, loading, error, filterArticles, statistics };
};
```

#### usePagination

```javascript
export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPage] = useState(itemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const reset = () => setCurrentPage(1);

  return {
    currentPage,
    totalPages,
    currentItems,
    itemsPerPage: itemsPerPageState,
    setItemsPerPage,
    goToPage,
    nextPage,
    prevPage,
    reset,
    startIndex,
    endIndex
  };
};
```

#### useURLFilters

```javascript
import { useSearchParams } from 'react-router-dom';

export const useURLFilters = (initialFilters = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Lire les filtres depuis l'URL
  const filters = {
    search: searchParams.get('search') || initialFilters.search || '',
    category: searchParams.get('category') || initialFilters.category || 'all',
    source: searchParams.get('source') || initialFilters.source || '',
    tags: searchParams.getAll('tag') || initialFilters.tags || []
  };

  // Mettre à jour l'URL
  const updateFilters = (newFilters) => {
    const params = new URLSearchParams();

    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });

    setSearchParams(params);
  };

  return { filters, updateFilters };
};
```

### 5.3 Composants Réutilisables

#### TrackedButton

```javascript
import { Button } from '@mui/material';
import analyticsService from '../../services/analytics';

export const TrackedButton = ({
  onClick,
  trackingData,
  children,
  ...props
}) => {
  const handleClick = (e) => {
    if (trackingData) {
      analyticsService.logUserInteraction(
        trackingData.action || 'button_click',
        trackingData.category || 'engagement',
        trackingData.label || children,
        trackingData.value
      );
    }
    onClick?.(e);
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};
```

#### ShareableLink

```javascript
export const ShareableLink = ({ filters, baseUrl }) => {
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopy = async () => {
    const link = generateLink();

    // Web Share API ou clipboard
    if (navigator.share) {
      await navigator.share({ url: link });
    } else {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Button onClick={handleCopy} startIcon={<ShareIcon />}>
      {copied ? 'Copié !' : 'Partager'}
    </Button>
  );
};
```

---

## 6. Configuration Firebase

### 6.1 Setup Firebase (firebase.js)

```javascript
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialisation
const app = initializeApp(firebaseConfig);

// Analytics conditionnel
let analytics = null;
let analyticsReady = false;

const initAnalytics = async () => {
  const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';

  if (analyticsEnabled && await isSupported()) {
    analytics = getAnalytics(app);
    analyticsReady = true;
    console.log('Firebase Analytics initialized');
  } else {
    console.log('Firebase Analytics disabled or not supported');
  }
};

initAnalytics();

export { app, analytics };
export const isAnalyticsReady = () => analyticsReady;
```

### 6.2 Variables d'Environnement

**.env (Development):**
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=auth-dev-website.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=auth-dev-website
VITE_FIREBASE_STORAGE_BUCKET=auth-dev-website.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ANALYTICS_ENABLED=true
```

**.env.production:**
```env
# Mêmes variables avec valeurs de production
VITE_ANALYTICS_ENABLED=true
```

**Sécurité:**
- Ne jamais commit .env dans Git
- Ajouter .env* dans .gitignore
- Variables exposées côté client (VITE_ prefix)
- Credentials Firebase protégées par règles de sécurité

### 6.3 Hosting Configuration (firebase.json)

```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=604800"
          }
        ]
      }
    ]
  }
}
```

**.firebaserc:**
```json
{
  "projects": {
    "default": "auth-dev-website"
  }
}
```

### 6.4 Déploiement

```bash
# Build production
npm run build

# Deploy sur Firebase
firebase deploy

# Deploy hosting uniquement
firebase deploy --only hosting

# Preview avant deploy
firebase hosting:channel:deploy preview
```

---

## 7. Assets et Ressources

### 7.1 Images

**Organisation:**
```
public/images/
├── me_conference.jpg         # Photo profil (953KB)
├── speeches/                 # Photos événements
│   └── ...
├── projects/                 # Screenshots projets
│   └── ...
└── formations/               # Visuels formations
    └── flutter-advanced.jpg
```

**Bonnes pratiques:**
- Format: JPG pour photos, PNG pour logos/icônes, SVG pour illustrations
- Compression: TinyPNG ou ImageOptim
- Résolution: Max 1920px largeur pour hero images
- Taille fichier: < 200KB par image si possible
- Naming: kebab-case, descriptif

**Optimisation recommandée:**
- Utiliser WebP avec fallback JPG
- Lazy loading avec loading="lazy"
- srcset pour responsive images

### 7.2 Documents

```
public/documents/
├── CV_AGBAVON_Kokou_Bienvenu.pdf
└── syllabus/
    └── Syllabus_Formation_Flutter_Avancee.pdf
```

**Gestion des téléchargements:**

```javascript
// Téléchargement CV
const handleDownloadCV = () => {
  analyticsService.logUserInteraction(
    'download',
    'engagement',
    'CV_download',
    'hero_section'
  );

  const link = document.createElement('a');
  link.href = '/documents/CV_AGBAVON_Kokou_Bienvenu.pdf';
  link.download = 'CV_AGBAVON_Kokou_Bienvenu.pdf';
  link.click();
};

// Téléchargement Syllabus
const handleDownloadSyllabus = (serviceId, serviceTitle) => {
  analyticsService.logSyllabusDownload(serviceId, serviceTitle);

  window.open(syllabusLink, '_blank');
};
```

### 7.3 Favicons et Manifests

```
public/
├── favicon.ico
├── favicon.svg
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
├── android-chrome-192x192.png
├── android-chrome-512x512.png
└── site.webmanifest
```

**site.webmanifest:**
```json
{
  "name": "00auth.dev - Le Développeur Authentique",
  "short_name": "00auth.dev",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#1a1a1a",
  "background_color": "#fafafa",
  "display": "standalone"
}
```

### 7.4 Fonts

**Google Fonts (Inter):**

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Poids utilisés:**
- 400 (Regular) - Texte courant
- 500 (Medium) - Boutons, labels
- 600 (Semi-Bold) - Titres H2-H4
- 700 (Bold) - Titre H1, emphase

---

## 8. Recommandations pour le Projet Quiz

### 8.1 Réutilisation du Design System

**À conserver à l'identique:**
- Palette de couleurs (#1a1a1a, #c9b037)
- Typographie Inter avec mêmes poids
- Thème clair/sombre avec ThemeContext
- Composants MUI customisés (Button, Card, TextField)
- Animations et transitions

**À adapter:**
- Palette secondaire possible pour différencier (ex: vert #2ecc71 pour bonnes réponses)
- Ajout de couleurs pour états quiz (succès, erreur, neutre)

### 8.2 Architecture Technique Recommandée

**Stack identique:**
```json
{
  "framework": "React 18.2 + Vite 4.5",
  "ui": "Material-UI 5.14",
  "routing": "React Router 6",
  "styling": "@emotion/react + @emotion/styled",
  "backend": "Firebase (Hosting + Firestore + Analytics)"
}
```

**Ajouts spécifiques quiz:**
```json
{
  "stateManagement": "Zustand 4.x (recommandé pour état quiz)",
  "animations": "Framer Motion 10.x (transitions questions)",
  "charts": "Recharts 2.x (graphiques résultats)",
  "confetti": "canvas-confetti (célébration succès)"
}
```

### 8.3 Structure de Données Quiz

**questions.json:**
```json
{
  "formations": {
    "flutter-avance": {
      "modules": [
        {
          "id": "module-1-intro",
          "title": "Introduction au développement mobile",
          "questions": [
            {
              "id": "q1-1",
              "type": "multiple-choice",
              "difficulty": "easy",
              "question": "Qu'est-ce que Flutter ?",
              "options": [
                "Un framework mobile cross-platform",
                "Un langage de programmation",
                "Une base de données",
                "Un système d'exploitation"
              ],
              "correctAnswer": 0,
              "explanation": "Flutter est un framework UI de Google pour créer des applications mobiles, web et desktop avec un seul code source.",
              "points": 10,
              "timeLimit": 30
            },
            {
              "id": "q1-2",
              "type": "true-false",
              "difficulty": "easy",
              "question": "Flutter utilise le langage Dart",
              "correctAnswer": true,
              "explanation": "Oui, Flutter utilise Dart...",
              "points": 5,
              "timeLimit": 15
            },
            {
              "id": "q1-3",
              "type": "code-completion",
              "difficulty": "medium",
              "question": "Complétez le code pour créer un StatelessWidget",
              "code": "class MyWidget extends _____ {\n  @override\n  Widget build(BuildContext context) {\n    return Container();\n  }\n}",
              "correctAnswer": "StatelessWidget",
              "points": 15,
              "timeLimit": 45
            }
          ]
        }
      ]
    }
  }
}
```

**Types de questions:**
- `multiple-choice` - QCM classique
- `true-false` - Vrai/Faux
- `code-completion` - Compléter du code
- `code-debugging` - Trouver l'erreur
- `ordering` - Remettre dans l'ordre
- `matching` - Associer éléments

**userProgress.json (Firestore):**
```javascript
{
  userId: string,
  formationId: "flutter-avance",

  progress: {
    "module-1-intro": {
      completed: true,
      score: 85,
      totalQuestions: 15,
      correctAnswers: 13,
      timeSpent: 420,  // secondes
      attempts: 2,
      lastAttempt: "2025-01-10T14:30:00Z",
      bestScore: 85
    }
  },

  overallStats: {
    totalModulesCompleted: 3,
    totalQuestions: 45,
    totalCorrect: 38,
    averageScore: 84,
    totalTimeSpent: 1200,
    badges: ["quick-learner", "perfect-score-module-1"],
    level: 5,
    xp: 450
  },

  achievements: [
    {
      id: "first-quiz",
      unlockedAt: "2025-01-08T10:00:00Z"
    }
  ]
}
```

### 8.4 Fonctionnalités Quiz Recommandées

**MVP (Version 1):**
1. Quiz par module de formation
2. Questions multiple-choice et true-false
3. Score et feedback immédiat
4. Progression sauvegardée localement
5. Résultats avec explications
6. Timer par question (optionnel)

**Version 2 (Améliorations):**
1. Authentification utilisateur (Firebase Auth)
2. Progression cloud (Firestore)
3. Types de questions avancés (code, ordering)
4. Système de points/XP
5. Badges et achievements
6. Leaderboard par module
7. Mode pratique vs mode évaluation

**Version 3 (Gamification):**
1. Lives/cœurs système
2. Streaks quotidiennes
3. Défis contre autres utilisateurs
4. Récompenses déblocables
5. Avatar et personnalisation
6. Partage réseaux sociaux

### 8.5 Pages Principales Quiz App

```
/quiz → Dashboard quiz (modules disponibles)
/quiz/:formationId → Liste modules formation
/quiz/:formationId/:moduleId → Démarrer quiz module
/quiz/:formationId/:moduleId/results → Résultats détaillés
/quiz/profile → Profil utilisateur et stats
/quiz/leaderboard → Classements
/quiz/achievements → Badges débloqués
```

### 8.6 Composants Spécifiques Quiz

**QuestionCard.jsx:**
```javascript
export const QuestionCard = ({
  question,
  onAnswer,
  timeRemaining,
  showExplanation
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Timer */}
      {timeRemaining && (
        <LinearProgress
          variant="determinate"
          value={(timeRemaining / question.timeLimit) * 100}
          sx={{ mb: 2 }}
        />
      )}

      {/* Question */}
      <Typography variant="h5" gutterBottom>
        {question.question}
      </Typography>

      {/* Code block si code question */}
      {question.code && (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          my: 2
        }}>
          <pre>{question.code}</pre>
        </Box>
      )}

      {/* Options */}
      <Stack spacing={2} sx={{ mt: 3 }}>
        {question.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswer === index ? 'contained' : 'outlined'}
            onClick={() => setSelectedAnswer(index)}
            disabled={showExplanation}
            sx={{
              justifyContent: 'flex-start',
              textAlign: 'left',
              p: 2,
              // Colorisation si réponse montrée
              ...(showExplanation && {
                bgcolor: index === question.correctAnswer
                  ? 'success.light'
                  : selectedAnswer === index
                    ? 'error.light'
                    : 'inherit'
              })
            }}
          >
            {String.fromCharCode(65 + index)}. {option}
          </Button>
        ))}
      </Stack>

      {/* Explanation */}
      {showExplanation && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <AlertTitle>Explication</AlertTitle>
          {question.explanation}
        </Alert>
      )}

      {/* Submit */}
      {!showExplanation && (
        <Button
          variant="contained"
          onClick={() => onAnswer(selectedAnswer)}
          disabled={selectedAnswer === null}
          sx={{ mt: 3 }}
        >
          Valider
        </Button>
      )}
    </Card>
  );
};
```

**ProgressBar.jsx:**
```javascript
export const ProgressBar = ({ current, total, score }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Question {current}/{total}
        </Typography>
        <Typography variant="body2" color="secondary">
          Score: {score} pts
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(current / total) * 100}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
};
```

**ResultsSummary.jsx:**
```javascript
export const ResultsSummary = ({ results }) => {
  const percentage = (results.correct / results.total) * 100;

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', p: 4, textAlign: 'center' }}>
      {/* Animation succès/échec */}
      {percentage >= 70 && <SuccessAnimation />}

      {/* Score principal */}
      <Typography variant="h2" color="primary" gutterBottom>
        {percentage.toFixed(0)}%
      </Typography>

      <Typography variant="h5" gutterBottom>
        {percentage >= 70 ? 'Félicitations !' : 'Continuez vos efforts'}
      </Typography>

      {/* Détails */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={4}>
          <StatBox label="Questions" value={results.total} />
        </Grid>
        <Grid item xs={4}>
          <StatBox
            label="Correctes"
            value={results.correct}
            color="success.main"
          />
        </Grid>
        <Grid item xs={4}>
          <StatBox
            label="Temps"
            value={formatTime(results.timeSpent)}
          />
        </Grid>
      </Grid>

      {/* Graphique performance */}
      <Box sx={{ mt: 4 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={results.byCategory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#c9b037" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Actions */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={onReview}>
          Revoir les questions
        </Button>
        <Button variant="contained" onClick={onRetry}>
          Recommencer
        </Button>
        <Button variant="contained" color="secondary" onClick={onNext}>
          Module suivant
        </Button>
      </Stack>
    </Card>
  );
};
```

### 8.7 State Management Quiz (Zustand)

```javascript
// stores/quizStore.js
import create from 'zustand';
import { persist } from 'zustand/middleware';

export const useQuizStore = create(
  persist(
    (set, get) => ({
      // État actuel du quiz
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      timeStarted: null,

      // Questions chargées
      questions: [],

      // Progression globale
      userProgress: {},

      // Actions
      loadQuestions: (questions) => set({ questions, currentQuestionIndex: 0 }),

      answerQuestion: (questionId, answer) => {
        const { questions, currentQuestionIndex } = get();
        const question = questions[currentQuestionIndex];
        const isCorrect = answer === question.correctAnswer;

        set(state => ({
          answers: {
            ...state.answers,
            [questionId]: { answer, isCorrect, timestamp: Date.now() }
          },
          score: isCorrect ? state.score + question.points : state.score,
          currentQuestionIndex: state.currentQuestionIndex + 1
        }));
      },

      resetQuiz: () => set({
        currentQuestionIndex: 0,
        answers: {},
        score: 0,
        timeStarted: Date.now()
      }),

      saveProgress: (moduleId, results) => {
        set(state => ({
          userProgress: {
            ...state.userProgress,
            [moduleId]: {
              ...results,
              lastAttempt: Date.now()
            }
          }
        }));
      }
    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        userProgress: state.userProgress
      })
    }
  )
);
```

### 8.8 Analytics Spécifiques Quiz

**Événements à tracker:**

```javascript
// analyticsService.js (extension)

logQuizStarted(formationId, moduleId, questionCount) {
  this.logEvent('quiz_started', {
    formation_id: formationId,
    module_id: moduleId,
    question_count: questionCount,
    timestamp: new Date().toISOString()
  });
}

logQuizCompleted(formationId, moduleId, results) {
  this.logEvent('quiz_completed', {
    formation_id: formationId,
    module_id: moduleId,
    score: results.score,
    percentage: results.percentage,
    correct_answers: results.correct,
    total_questions: results.total,
    time_spent: results.timeSpent,
    passed: results.percentage >= 70
  });
}

logQuestionAnswered(questionId, isCorrect, timeSpent) {
  this.logEvent('question_answered', {
    question_id: questionId,
    is_correct: isCorrect,
    time_spent: timeSpent
  });
}

logBadgeUnlocked(badgeId, badgeName) {
  this.logEvent('badge_unlocked', {
    badge_id: badgeId,
    badge_name: badgeName
  });
}
```

### 8.9 Intégration avec Site Principal

**Options d'intégration:**

**Option A - Sous-domaine:**
- Site principal: `00auth.dev`
- Quiz: `quiz.00auth.dev`
- Avantages: Séparation claire, déploiements indépendants
- Inconvénients: Configuration DNS, possibles problèmes CORS

**Option B - Sous-route:**
- Site principal: `00auth.dev`
- Quiz: `00auth.dev/quiz`
- Avantages: Même domaine, navigation fluide, SEO unifié
- Inconvénients: Bundle size plus gros si même app

**Option C - Application séparée avec deep linking:**
- Site principal: `00auth.dev`
- Quiz: `quiz-formation.00auth.dev`
- Deep links depuis service detail: `Accéder au quiz →`
- Avantages: Totalement découplé, optimisation spécifique
- Inconvénients: Deux apps à maintenir

**Recommandation:** Option B (sous-route) pour MVP, Option A (sous-domaine) pour scale.

**Liens depuis site principal:**

```javascript
// ServiceDetail.js - Ajout section Quiz
<Box sx={{ mt: 4, p: 3, bgcolor: 'secondary.light', borderRadius: 2 }}>
  <Typography variant="h5" gutterBottom>
    Testez vos connaissances
  </Typography>
  <Typography variant="body1" paragraph>
    Évaluez votre progression avec des quiz interactifs pour chaque module.
  </Typography>
  <Button
    variant="contained"
    color="secondary"
    component={Link}
    to={`/quiz/${serviceId}`}
    startIcon={<QuizIcon />}
  >
    Accéder aux quiz
  </Button>
</Box>
```

---

## 9. Checklist de Démarrage

### 9.1 Setup Initial

- [ ] **Créer nouveau projet Vite + React**
  ```bash
  npm create vite@latest 00auth-quiz -- --template react
  cd 00auth-quiz
  npm install
  ```

- [ ] **Installer dépendances principales**
  ```bash
  npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
  npm install react-router-dom dayjs
  npm install firebase
  npm install zustand
  npm install framer-motion
  npm install recharts
  npm install canvas-confetti
  ```

- [ ] **Copier design system depuis projet source**
  - [ ] ThemeContext.js
  - [ ] theme.js (si nécessaire)
  - [ ] index.css (styles globaux)
  - [ ] Polices Inter (index.html)

- [ ] **Setup Firebase**
  - [ ] Créer nouveau projet Firebase ou utiliser existant
  - [ ] Activer Firestore Database
  - [ ] Activer Authentication (Email/Password, Google)
  - [ ] Activer Analytics
  - [ ] Configurer Security Rules
  - [ ] Copier config dans .env

- [ ] **Structure de dossiers**
  - [ ] Créer arborescence selon schéma ci-dessus
  - [ ] Créer fichiers .env et .gitignore

### 9.2 Développement MVP

**Phase 1 - Setup et Design (Semaine 1)**
- [ ] Setup projet et dépendances
- [ ] Implémenter ThemeContext et thème MUI
- [ ] Créer Layout (Navbar, Footer similaires)
- [ ] Page d'accueil Quiz Dashboard
- [ ] Routing de base

**Phase 2 - Données et Logique (Semaine 2)**
- [ ] Créer questions.json (minimum 1 module complet)
- [ ] Implémenter Zustand store
- [ ] Service de chargement questions
- [ ] Logique de scoring
- [ ] Timer questions (optionnel MVP)

**Phase 3 - Interface Quiz (Semaine 3)**
- [ ] Composant QuestionCard (multiple-choice + true-false)
- [ ] Composant ProgressBar
- [ ] Page Quiz en cours
- [ ] Transitions entre questions
- [ ] Validation et feedback

**Phase 4 - Résultats et Persistence (Semaine 4)**
- [ ] Page ResultsSummary
- [ ] Graphiques de performance
- [ ] Sauvegarde LocalStorage (MVP)
- [ ] Intégration Firebase Analytics
- [ ] Tests utilisateur

**Phase 5 - Intégration et Déploiement (Semaine 5)**
- [ ] Connexion avec site principal (liens)
- [ ] Build production
- [ ] Déploiement Firebase Hosting
- [ ] Tests multi-devices
- [ ] Documentation

### 9.3 Post-MVP Améliorations

**Version 1.1 (Mois 2)**
- [ ] Authentification Firebase
- [ ] Persistence Firestore (progression cloud)
- [ ] Types questions avancés (code-completion)
- [ ] Système de badges basique
- [ ] Partage résultats réseaux sociaux

**Version 1.2 (Mois 3)**
- [ ] Leaderboard par module
- [ ] Mode pratique vs évaluation
- [ ] Explications enrichies (vidéos, liens)
- [ ] Révision questions ratées
- [ ] Export résultats PDF

**Version 2.0 (Mois 4+)**
- [ ] Gamification complète (XP, levels, streaks)
- [ ] Défis entre utilisateurs
- [ ] Questions générées par IA (optionnel)
- [ ] Application mobile (React Native ou Flutter)
- [ ] API pour intégration tierce

### 9.4 Ressources à Réutiliser

**Directement depuis projet source:**
- [ ] ThemeContext.js (copier tel quel)
- [ ] services/analytics.js (adapter événements)
- [ ] hooks/usePagination.js (si leaderboard paginé)
- [ ] components/Common/TrackedButton.js
- [ ] Palette de couleurs complète
- [ ] Typographie Inter

**À adapter:**
- [ ] Navbar (ajouter liens quiz)
- [ ] Footer (mêmes infos contact)
- [ ] Firebase config (nouveau projet ou partage)
- [ ] .gitignore et scripts package.json

**Assets à récupérer:**
- [ ] Logo/favicon
- [ ] Images formations (pour lier modules)
- [ ] documents/syllabus (référence modules)

### 9.5 Métriques de Succès

**KPIs à tracker:**
- Taux de complétion quiz (objectif: >60%)
- Score moyen par module (objectif: >70%)
- Temps moyen par quiz
- Taux de retentative (combien refont un quiz)
- Progression dans formation (modules complétés)
- Conversion quiz → inscription formation
- Engagement (sessions/utilisateur, durée session)

**Analytics Dashboard:**
- Utiliser Firebase Analytics console
- Créer custom reports pour:
  - Questions les plus ratées (pour améliorer contenu)
  - Modules les plus difficiles
  - Taux d'abandon par question
  - Progression temporelle utilisateurs

---

## 10. Points d'Attention et Pièges à Éviter

### 10.1 Performance

**Problèmes potentiels:**
- Chargement de toutes les questions en mémoire
- Re-renders excessifs lors du timer
- Animations lourdes sur mobile

**Solutions:**
- Lazy loading des questions par module
- useMemo/useCallback pour optimiser renders
- Désactiver animations complexes sur mobile
- Utiliser React.memo pour QuestionCard

### 10.2 UX Quiz

**À éviter:**
- Timer trop court stressant
- Pas de feedback immédiat après réponse
- Impossible de revenir en arrière
- Pas d'indication de progression

**Bonnes pratiques:**
- Feedback visuel immédiat (couleur, animation)
- Explication toujours affichée après réponse
- Option "mode pratique" sans timer
- ProgressBar toujours visible
- Possibilité de sauvegarder et reprendre

### 10.3 Données Questions

**Éviter:**
- Questions ambiguës ou mal formulées
- Réponses trop similaires (piège gratuit)
- Explications insuffisantes
- Déséquilibre difficulté (tout facile ou tout dur)

**Faire:**
- Relecture par tierce personne
- Test auprès d'apprenants réels
- Mix de difficultés par module
- Explications avec ressources additionnelles

### 10.4 Sécurité

**Vulnérabilités:**
- Réponses correctes visibles dans code client
- Pas de validation côté serveur
- Manipulation localStorage pour tricher

**Mitigations:**
- Pour mode évaluation: validation serveur obligatoire
- Hashing des réponses correctes
- Cloud Functions pour calcul score final
- Rate limiting sur tentatives

---

## Conclusion

Ce document de référence fournit une base solide pour démarrer le projet Quiz complémentaire à 00auth.dev.

**Points clés à retenir:**

1. **Design System cohérent** - Réutiliser intégralement la palette James Bond et la typographie Inter pour une identité visuelle unifiée

2. **Architecture éprouvée** - Stack React 18 + Vite + MUI est moderne, performante et bien maîtrisée

3. **Firebase ecosystem** - Analytics, Hosting, et futur Firestore offrent une solution complète sans backend custom

4. **Approche progressive** - MVP en 5 semaines, puis itérations mensuelles pour enrichir l'expérience

5. **Focus utilisateur** - Quiz doit être éducatif, engageant et motivant, pas punitive

**Prochaines étapes:**

1. Valider le périmètre fonctionnel du MVP avec l'équipe
2. Créer les questions pour le premier module (15-20 questions)
3. Setup projet et environnement de développement
4. Sprint 1 : Design system et structure
5. Déploiement beta pour tests utilisateurs

**Ressources additionnelles:**

- [Material-UI Documentation](https://mui.com/)
- [React Router v6 Guide](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**Document créé le:** 12 Novembre 2025
**Projet source:** 00auth.dev Website v1.0.0
**Auteur:** Claude Code (analyse automatisée)
**Contact:** contact@00auth.dev

---

*Ce document est un guide de référence vivant. Il doit être mis à jour au fur et à mesure de l'évolution des deux projets.*
