# Leaderboard des Étudiants - Guide d'utilisation

## Vue d'ensemble

La page **Leaderboard** (`/admin/leaderboard`) permet aux administrateurs et instructeurs de classer et comparer les performances des étudiants selon différents critères.

---

## Accès

### URL
```
https://formations.00auth.dev/admin/leaderboard
```

### Permissions requises
- **Administrateur** - Accès complet
- **Instructeur** - Accès complet
- **Modérateur** - Pas d'accès
- **Utilisateur** - Pas d'accès

### Navigation
Depuis la page "Suivi des Progressions" (`/admin/progress`), cliquez sur le bouton **"Voir le Leaderboard"** en haut à droite.

---

## Fonctionnalités

### 1. Vue Globale

#### Statistiques du Leaderboard
Affiche 4 métriques clés :

- **Étudiants Actifs** - Nombre total d'étudiants ayant des résultats
- **Top Score** - Meilleur score moyen avec le nom de l'étudiant
- **Score Moyen** - Score moyen de tous les étudiants
- **Plus Actif** - Nombre maximum de quiz passés

#### Critères de Classement

Le leaderboard peut être trié selon 4 critères différents :

1. **Score Moyen** ⭐
   - Classement par score moyen décroissant
   - En cas d'égalité : nombre de quiz passés (départage)
   - Favorise la qualité des résultats

2. **Quiz Passés** 🏃
   - Classement par nombre total de quiz passés
   - Favorise l'activité et l'engagement
   - Encourage la pratique régulière

3. **Modules Validés** 🏆
   - Classement par nombre de modules complétés (score ≥ 70%)
   - En cas d'égalité : score moyen (départage)
   - Favorise la complétion complète

4. **Progression** 📈
   - Classement par pourcentage de progression dans la formation
   - Mesure l'avancement global

#### Tableau de Classement

Colonnes affichées :
- **Rang** - Position avec médailles pour le top 3 (🥇🥈🥉)
- **Étudiant** - Avatar, nom et email
- **Score Moyen** - Score moyen en pourcentage
- **Quiz Passés** - Nombre total de tentatives
- **Modules Validés** - Nombre de modules complétés
- **Progression** - Pourcentage de progression
- **Focus** - Métrique mise en avant selon le critère de tri

**Mise en forme :**
- **Top 3** - Fond légèrement coloré pour la visibilité
- **Médailles** - 🥇 Or, 🥈 Argent, 🥉 Bronze
- **Survol** - Mise en évidence au passage de la souris

### 2. Vue Par Module

#### Sélection de Module
- Onglets horizontaux avec défilement
- Icône et titre de chaque module
- Classement spécifique à chaque module

#### Critères de Classement (Par Module)
1. **Meilleur score** (priorité 1)
2. **Nombre de tentatives** (priorité 2 - moins = mieux)

**Exemple :**
- Étudiant A : 95% en 1 tentative → Rang 1
- Étudiant B : 95% en 3 tentatives → Rang 2
- Étudiant C : 90% en 1 tentative → Rang 3

#### Tableau Par Module

Colonnes affichées :
- **Rang** - Position avec médailles pour le top 3
- **Étudiant** - Avatar, nom et email
- **Meilleur Score** - Score le plus élevé obtenu
- **Tentatives** - Nombre total de tentatives sur ce module
- **Statut** - Badge de statut :
  - 🌟 **Parfait** - Score de 100%
  - ✅ **Validé** - Score ≥ 70%
  - 🔄 **En cours** - Score < 70%
- **Dernière Tentative** - Date de la dernière tentative

#### Message si aucune donnée
```
Aucun étudiant n'a encore complété ce module
```

---

## Cas d'Usage

### 1. Identifier les Meilleurs Étudiants
**Objectif :** Récompenser les étudiants performants

**Action :**
1. Sélectionner la formation
2. Trier par "Score Moyen"
3. Consulter le Top 3
4. Contacter les étudiants pour félicitations ou récompenses

### 2. Encourager l'Engagement
**Objectif :** Motiver les étudiants à pratiquer davantage

**Action :**
1. Trier par "Quiz Passés"
2. Identifier les étudiants les plus actifs
3. Mettre en avant leur engagement
4. Encourager les moins actifs

### 3. Suivre la Complétion
**Objectif :** Mesurer le taux de complétion

**Action :**
1. Trier par "Modules Validés"
2. Identifier qui a terminé la formation
3. Relancer les étudiants bloqués
4. Offrir de l'aide ciblée

### 4. Compétition Amicale
**Objectif :** Gamifier l'apprentissage

**Action :**
1. Partager le leaderboard avec les étudiants
2. Organiser des challenges mensuels
3. Récompenser les progressions
4. Créer une émulation positive

### 5. Analyse Par Module
**Objectif :** Identifier les modules difficiles

**Action :**
1. Passer en "Vue Par Module"
2. Consulter chaque module
3. Identifier ceux avec peu de complétions
4. Analyser et améliorer le contenu

---

## Indicateurs de Performance

### Métriques Individuelles

Pour chaque étudiant, le leaderboard affiche :

| Métrique | Description | Calcul |
|----------|-------------|--------|
| Score Moyen | Performance globale | Moyenne de tous les quiz passés |
| Quiz Passés | Engagement | Nombre total de tentatives |
| Modules Validés | Complétion | Modules avec score ≥ 70% |
| Progression | Avancement | % de modules complétés vs total |

### Métriques de Module

Pour chaque module individuellement :

| Métrique | Description | Utilité |
|----------|-------------|---------|
| Meilleur Score | Performance maximale | Capacité de réussite |
| Tentatives | Effort fourni | Persévérance |
| Statut | État de validation | Progression |
| Dernière Tentative | Activité récente | Engagement actuel |

---

## Interprétation des Résultats

### Score Moyen Élevé (> 80%)
✅ **Bon signe**
- Étudiant maîtrise bien le contenu
- Compréhension solide des concepts
- Potentiel pour aider d'autres étudiants

**Actions suggérées :**
- Proposer du contenu avancé
- Inviter à devenir mentor
- Offrir des défis supplémentaires

### Score Moyen Moyen (60-80%)
⚠️ **À surveiller**
- Compréhension partielle
- Besoin de révisions ciblées
- Potentiel d'amélioration

**Actions suggérées :**
- Proposer des ressources supplémentaires
- Encourager la révision
- Offrir du support

### Score Moyen Faible (< 60%)
🔴 **Intervention nécessaire**
- Difficultés importantes
- Risque d'abandon
- Besoin d'aide urgente

**Actions suggérées :**
- Contact personnel
- Session de rattrapage
- Identifier les lacunes spécifiques

### Nombre de Tentatives Élevé
**Cas 1 : Score élevé**
✅ Persévérance payante
- Étudiant travailleur
- Apprentissage par la pratique

**Cas 2 : Score faible**
⚠️ Difficultés persistantes
- Besoin d'aide méthodologique
- Contenu peut-être inadapté

### Peu de Modules Validés
⚠️ **Risque d'abandon**
- Blocage sur certains modules
- Perte de motivation
- Problème de temps

**Actions suggérées :**
- Identifier les modules bloquants
- Proposer un parcours alternatif
- Offrir des sessions de groupe

---

## Bonnes Pratiques

### Pour les Instructeurs

1. **Consulter régulièrement**
   - Hebdomadaire minimum
   - Détecter les changements de tendance
   - Identifier rapidement les problèmes

2. **Communiquer les résultats**
   - Partager les tops 3 (avec accord des étudiants)
   - Célébrer les succès
   - Créer une émulation positive

3. **Personnaliser l'accompagnement**
   - Adapter selon les performances
   - Offrir du contenu supplémentaire aux meilleurs
   - Soutenir davantage les plus faibles

4. **Analyser les tendances**
   - Comparer entre modules
   - Identifier les points de blocage
   - Ajuster le contenu si nécessaire

### Pour les Administrateurs

1. **Comparer entre formations**
   - Identifier les formations performantes
   - Analyser les différences
   - Partager les bonnes pratiques

2. **Suivre l'évolution**
   - Tracer les tendances dans le temps
   - Mesurer l'impact des améliorations
   - Ajuster la stratégie pédagogique

3. **Gamification**
   - Organiser des compétitions
   - Offrir des récompenses
   - Créer des ligues

---

## Limitations Actuelles

### Ce que le leaderboard NE fait PAS (encore)

- ❌ Filtrer par période (semaine, mois)
- ❌ Exporter en CSV/PDF
- ❌ Comparer plusieurs formations
- ❌ Historique d'évolution
- ❌ Badges automatiques
- ❌ Notifications de classement

### Améliorations Prévues

Voir [ROADMAP_FEATURES.md](ROADMAP_FEATURES.md) Phase 2 :
- Système de badges
- Historique de progression
- Compétitions et tournois
- Export de données
- Notifications automatiques

---

## FAQ

### Q1 : Le classement est-il mis à jour en temps réel ?
**R :** Non, il faut rafraîchir la page pour voir les nouvelles données. Les calculs se font à la demande.

### Q2 : Les étudiants peuvent-ils voir le leaderboard ?
**R :** Non, actuellement seuls les admins et instructeurs y ont accès.

### Q3 : Que se passe-t-il en cas d'égalité ?
**R :** Un critère secondaire est utilisé :
- Score moyen → Nombre de quiz passés
- Modules validés → Score moyen
- Pour un module → Nombre de tentatives (moins = mieux)

### Q4 : Comment sont comptées les tentatives multiples ?
**R :** Toutes les tentatives comptent. Seul le meilleur score est retenu pour les modules.

### Q5 : Un étudiant peut-il être absent du leaderboard ?
**R :** Oui, s'il n'a passé aucun quiz dans la formation sélectionnée.

### Q6 : Peut-on exclure certains étudiants ?
**R :** Non, tous les étudiants avec des résultats apparaissent automatiquement.

### Q7 : Les scores négatifs sont-ils possibles ?
**R :** Non, le score minimum est 0%.

### Q8 : Comment le pourcentage de progression est-il calculé ?
**R :** `(Modules validés / Total modules) × 100`

---

## Support et Assistance

### Problèmes Techniques

**Le leaderboard ne s'affiche pas**
1. Vérifier les permissions (admin/instructeur)
2. Vérifier la connexion Firebase
3. Consulter la console du navigateur (F12)
4. Vérifier qu'il y a des données

**Les scores sont incorrects**
1. Vérifier les calculs dans Firestore
2. Consulter `/admin/progress` pour comparaison
3. Rafraîchir les données du navigateur

**Performances lentes**
1. Limiter le nombre d'étudiants affichés
2. Vider le cache du navigateur
3. Vérifier la connexion internet

### Contact

Pour toute question ou suggestion :
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation technique

---

## Changelog

### Version 1.0 (14 Novembre 2025)
- ✅ Leaderboard global par formation
- ✅ 4 critères de classement
- ✅ Vue par module
- ✅ Médailles Top 3
- ✅ Statistiques récapitulatives
- ✅ Responsive design

### À venir (Version 1.1)
- ⏳ Export CSV/PDF
- ⏳ Filtres temporels
- ⏳ Historique d'évolution
- ⏳ Graphiques de progression

---

**Document créé le :** 14 Novembre 2025
**Dernière mise à jour :** 14 Novembre 2025
**Version :** 1.0
**Auteur :** Équipe Développement
