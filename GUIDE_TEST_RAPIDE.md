# Guide de Test Rapide - Quiz Formation Flutter

## 🚀 Démarrage

### 1. Serveur en cours d'exécution
Le serveur est actuellement actif sur:
**http://localhost:5174**

### 2. Première Visite
Ouvrez votre navigateur et accédez à l'URL ci-dessus.

---

## 🧪 Scénario de Test Complet

### Étape 1: Dashboard Principal
**URL:** http://localhost:5174/

**À vérifier:**
- [ ] Page s'affiche sans erreur
- [ ] Titre "Formation Flutter Avancée - Quiz"
- [ ] Carte de progression globale visible
- [ ] 22 cartes de modules affichées
- [ ] Module 1.1 "Introduction à Dart" débloqué (badge vert "Disponible")
- [ ] Autres modules verrouillés (icône cadenas)
- [ ] Toggle thème (icône soleil/lune) dans la navbar

**Actions:**
1. Tester le toggle thème clair/sombre
2. Vérifier que les couleurs changent (noir/blanc + or)

---

### Étape 2: Détails d'un Module
**Action:** Cliquer sur "Module 1.1 - Introduction à Dart"

**URL:** http://localhost:5174/module/module-1-1-dart

**À vérifier:**
- [ ] Titre du module affiché
- [ ] Description visible
- [ ] Liste des sujets (6 topics)
- [ ] Badge "Débutant" présent
- [ ] Estimation de temps (15 minutes)
- [ ] Bouton "Commencer le quiz" actif

**Actions:**
1. Lire les informations du module
2. Cliquer sur "Commencer le quiz"

---

### Étape 3: Génération du Quiz (IMPORTANT)
**Cette étape utilise Firebase AI Logic + Gemini**

**À observer:**
- [ ] Loader/Spinner affiché pendant 3-10 secondes
- [ ] Message "Génération des questions en cours..."
- [ ] Redirection automatique vers la page du quiz une fois généré

**En cas d'erreur:**
- Vérifier que la clé Firebase API est valide dans `.env`
- Vérifier la connexion Internet
- Attendre quelques secondes (quotas API)

---

### Étape 4: Session de Quiz Active
**URL:** http://localhost:5174/module/module-1-1-dart/quiz

**À vérifier:**
- [ ] Barre de progression en haut (Question 1/10)
- [ ] Question affichée clairement
- [ ] Type de question indiqué (QCM, Vrai/Faux, etc.)
- [ ] Badge de difficulté (Facile/Moyen/Difficile)
- [ ] Options de réponse (radio buttons)
- [ ] Code snippet si question de type code
- [ ] Boutons "Précédent" et "Suivant"
- [ ] Bouton "Soumettre le quiz" sur la dernière question

**Actions:**
1. Sélectionner une réponse pour la question 1
2. Cliquer sur "Suivant"
3. Naviguer à travers toutes les questions (1-10)
4. Répondre à au moins 7 questions (pour atteindre 70%)
5. Sur la dernière question, cliquer "Soumettre le quiz"

**Test de validation:**
- Essayer de soumettre sans répondre à toutes → Alert s'affiche

---

### Étape 5: Page Résultats
**URL:** http://localhost:5174/module/module-1-1-dart/results

**À vérifier si score ≥ 70%:**
- [ ] 🎉 Confetti animé à l'écran
- [ ] Badge "Validé" avec fond vert
- [ ] Score affiché avec dégradé de couleur
- [ ] Message "Félicitations ! Module validé"
- [ ] Statistiques:
  - Questions correctes / total
  - Taux de réussite
  - Temps passé
  - Points obtenus
- [ ] Graphique en camembert (bonnes/mauvaises réponses)
- [ ] Boutons d'action:
  - "Retour au tableau de bord"
  - "Recommencer le module"
  - "Module suivant" (si validé)

**À vérifier si score < 70%:**
- [ ] Badge "Non validé" avec fond rouge/orange
- [ ] Message encourageant à recommencer
- [ ] Pas de confetti
- [ ] Bouton "Module suivant" désactivé

**Actions:**
1. Cliquer sur "Retour au tableau de bord"

---

### Étape 6: Vérification Déblocage
**URL:** http://localhost:5174/

**À vérifier:**
- [ ] Module 1.1 affiche maintenant le meilleur score
- [ ] Module 1.2 "Initiation Flutter" est maintenant débloqué (si 70%+)
- [ ] Progression globale mise à jour
- [ ] Badge "Validé" sur le module 1.1

**Actions:**
1. Rafraîchir la page (F5)
2. Vérifier que la progression persiste (LocalStorage)

---

### Étape 7: Test Persistence
**Action:** Fermer l'onglet et rouvrir http://localhost:5174/

**À vérifier:**
- [ ] Progression sauvegardée (module validé toujours vert)
- [ ] Meilleur score affiché
- [ ] Module suivant toujours débloqué
- [ ] Thème choisi (clair/sombre) persisté

---

## 🎨 Tests Visuels

### Thème Clair
**Action:** Passer en mode clair

**À vérifier:**
- [ ] Fond blanc/gris clair
- [ ] Texte noir
- [ ] Accents dorés (#c9b037)
- [ ] Lisibilité excellente

### Thème Sombre
**Action:** Passer en mode sombre

**À vérifier:**
- [ ] Fond noir (#121212)
- [ ] Texte blanc
- [ ] Accents dorés conservés
- [ ] Contrastes suffisants

---

## 🐛 Tests d'Erreurs

### Test 1: Navigation Invalide
**Action:** Aller sur http://localhost:5174/invalid-route

**Résultat attendu:** Redirection automatique vers `/`

### Test 2: Module Verrouillé
**Action:** Essayer d'accéder à http://localhost:5174/module/module-2-1-state/quiz

**Résultat attendu:**
- Page dashboard affichée
- Message indiquant que le module est verrouillé

### Test 3: Quiz Sans Questions
**Action:** Vider le cache LocalStorage et accéder directement à une session

**Résultat attendu:** Redirection vers la page détails du module

---

## 📊 Fonctionnalités Avancées à Tester

### Cache des Quiz
**Action:**
1. Compléter un quiz pour Module 1.1
2. Recommencer immédiatement le même module

**Résultat attendu:**
- Questions identiques (cache 7 jours)
- Chargement instantané (pas de génération)

### Vider le Cache
**Action dans la console navigateur:**
```javascript
localStorage.removeItem('quiz-cache-module-1-1-dart');
```

**Puis recommencer le module**

**Résultat attendu:**
- Nouvelles questions générées
- Délai de génération (3-10s)

---

## ✅ Checklist Finale

### Fonctionnalités Essentielles
- [ ] Dashboard s'affiche
- [ ] Modules se débloquent séquentiellement
- [ ] Questions se génèrent via Gemini
- [ ] Réponses s'enregistrent
- [ ] Score se calcule correctement
- [ ] Validation à 70% fonctionne
- [ ] Persistence après refresh
- [ ] Thème clair/sombre fonctionne

### Performance
- [ ] Chargement initial < 2s
- [ ] Navigation fluide
- [ ] Animations sans lag
- [ ] Génération quiz < 10s

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablette (768px)
- [ ] Mobile (375px)

---

## 📱 Test Mobile

### Action
1. Ouvrir DevTools (F12)
2. Activer le mode mobile (Ctrl+Shift+M)
3. Tester différentes tailles

**À vérifier:**
- [ ] Layout s'adapte
- [ ] Texte lisible
- [ ] Boutons accessibles
- [ ] Navigation tactile fluide

---

## 🎯 Scénarios Utilisateur Réels

### Scénario A: Nouvel Utilisateur
```
1. Arrive sur le site
2. Voit 22 modules
3. Commence par Module 1.1
4. Répond aux questions
5. Obtient 80% → Validation
6. Passe au Module 1.2
```

### Scénario B: Utilisateur qui Échoue
```
1. Commence Module 1.1
2. Obtient 60% → Non validé
3. Voit le message d'encouragement
4. Clique "Recommencer"
5. Améliore son score à 75%
6. Valide et passe au suivant
```

### Scénario C: Perfectionniste
```
1. Valide Module 1.1 avec 70%
2. Voit "Recommencer le module"
3. Retente pour améliorer
4. Obtient 95% → Score parfait
5. Badge "Parfait" affiché
```

---

## 🔧 Outils de Debug

### Console Navigateur
**Ouvrir:** F12 → Console

**Commandes utiles:**
```javascript
// Voir l'état du store Zustand
import { useQuizStore } from './stores/quizStore';
console.log(useQuizStore.getState());

// Voir la progression
console.log(useQuizStore.getState().userProgress);

// Voir le cache des quiz
console.log(localStorage.getItem('quiz-cache-module-1-1-dart'));

// Reset complet
localStorage.clear();
location.reload();
```

---

## 📈 Métriques de Succès

### Un test est réussi si:
- ✅ Aucune erreur console
- ✅ Navigation fluide
- ✅ Génération de quiz fonctionne
- ✅ Progression sauvegardée
- ✅ Déblocage séquentiel opérationnel
- ✅ Score calculé correctement
- ✅ Interface responsive

---

## 🆘 Dépannage Rapide

### Problème: Questions ne se génèrent pas
**Solution:**
1. Vérifier la connexion Internet
2. Vérifier la clé Firebase dans `.env`
3. Attendre 30 secondes (quotas API)
4. Vérifier la console navigateur pour erreurs

### Problème: Score incorrect
**Solution:**
1. Vérifier que toutes les questions ont été répondues
2. Voir la console pour erreurs de calcul
3. Tester avec 10/10 bonnes réponses → devrait donner 100%

### Problème: Module ne se débloque pas
**Solution:**
1. Vérifier que le score précédent ≥ 70%
2. Rafraîchir la page
3. Vider le cache et recommencer

---

## 🎉 Félicitations !

Si tous les tests passent, le projet est **100% fonctionnel** ! 🚀

**Prochaines étapes:**
1. Faire tester par de vrais utilisateurs
2. Recueillir les feedbacks
3. Planifier la V2 avec Firestore + Auth
4. Déployer sur Firebase Hosting

---

**Guide créé le:** 12 Novembre 2025
**Par:** Claude Code
**Version:** 1.0
