# Configuration SPA pour GitHub Pages

## Problème

Les Single Page Applications (SPA) comme React utilisent le routage côté client. Lorsqu'un utilisateur rafraîchit une page avec une route comme `/course/123/module/456`, GitHub Pages cherche un fichier physique à cet emplacement et retourne une erreur **404**.

## Solution implémentée

Nous utilisons la technique "Single Page Apps for GitHub Pages" qui redirige toutes les erreurs 404 vers `index.html` en préservant l'URL originale.

### Fichiers modifiés

#### 1. `public/404.html`

Ce fichier est servi par GitHub Pages lorsqu'une route n'est pas trouvée. Il encode l'URL demandée et redirige vers la racine :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Redirection...</title>
  <script>
    // Redirige vers index.html avec l'URL encodée
    var pathSegmentsToKeep = 0;
    var l = window.location;
    l.replace(
      l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
      l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
      l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
      (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
      l.hash
    );
  </script>
</head>
<body></body>
</html>
```

#### 2. `index.html`

Un script a été ajouté pour décoder l'URL et restaurer la route originale :

```html
<script>
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) {
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

#### 3. `public/.nojekyll`

Fichier vide qui indique à GitHub Pages de ne pas utiliser Jekyll pour traiter le site.

## Comment ça fonctionne

### Scénario : Utilisateur rafraîchit `/course/123/module/456`

1. **GitHub Pages reçoit la requête** pour `/course/123/module/456`
2. **Fichier non trouvé** → GitHub Pages sert `404.html`
3. **`404.html` encode l'URL** :
   - URL originale : `/course/123/module/456`
   - URL encodée : `/?/course/123/module/456`
4. **Redirection vers `index.html`** avec l'URL encodée
5. **`index.html` se charge** et exécute le script de décodage
6. **Le script décode l'URL** et met à jour l'historique du navigateur :
   - `window.history.replaceState()` restaure `/course/123/module/456`
7. **React Router prend le relais** et affiche la bonne page

### Exemple avec paramètres de recherche

URL originale : `/course/123?tab=overview#section-2`

1. Encodée : `/?/course/123&tab=overview#section-2`
2. Décodée : `/course/123?tab=overview#section-2`

## Avantages de cette solution

✅ **Compatible avec GitHub Pages** - Pas besoin de serveur backend
✅ **SEO-friendly** - L'URL finale dans le navigateur est correcte
✅ **Transparent pour l'utilisateur** - La redirection est instantanée
✅ **Support des paramètres** - Query strings et hash fragments préservés
✅ **Pas d'impact sur le développement** - Fonctionne uniquement en production

## Limitations

⚠️ **Pas de vrai SSR** - Le contenu initial est toujours `index.html`
⚠️ **SEO limité** - Les crawlers voient d'abord une page vide
⚠️ **Légère latence** - Double chargement (404.html puis index.html)

## Alternative : Configuration serveur

Si vous hébergez sur un serveur personnalisé (Nginx, Apache, etc.), vous pouvez configurer directement la réécriture d'URL :

### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Vercel (vercel.json)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify (_redirects)
```
/*    /index.html   200
```

## Test de la configuration

### En local
Le développement local avec `npm run dev` fonctionne déjà correctement grâce à Vite.

### En production (GitHub Pages)

1. **Déployez les modifications** :
   ```bash
   git add .
   git commit -m "fix: Add SPA support for GitHub Pages"
   git push
   ```

2. **Attendez le déploiement** (GitHub Actions)

3. **Testez une route directe** :
   - Visitez : `https://[votre-username].github.io/[repo]/course/123/module/456`
   - Rafraîchissez la page (F5)
   - La page doit se charger correctement sans erreur 404

4. **Testez les favoris** :
   - Ajoutez une page aux favoris
   - Fermez l'onglet
   - Ouvrez le favori
   - La page doit se charger correctement

## Débogage

### Si vous voyez toujours une erreur 404

1. **Vérifiez que les fichiers sont bien dans `dist/`** après le build :
   ```bash
   npm run build
   ls dist/  # Doit contenir 404.html et .nojekyll
   ```

2. **Vérifiez le workflow GitHub Actions** :
   - Allez dans l'onglet "Actions" de votre repository
   - Vérifiez que le déploiement s'est terminé avec succès

3. **Vérifiez la configuration GitHub Pages** :
   - Settings → Pages
   - Source : GitHub Actions (pas "Deploy from a branch")

4. **Videz le cache** :
   - Chrome : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
   - Firefox : Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)

### Console du navigateur

Ouvrez la console (F12) et vérifiez :

```javascript
// L'URL doit être correcte
console.log(window.location.pathname);

// Pas de "?/" dans l'URL
console.log(window.location.search);
```

## Références

- [spa-github-pages](https://github.com/rafgraph/spa-github-pages) - Solution originale
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [React Router Documentation](https://reactrouter.com/en/main)
- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html)

## Checklist de déploiement

- [x] `public/404.html` créé
- [x] Script de décodage ajouté dans `index.html`
- [x] `public/.nojekyll` créé
- [ ] Modifications commitées et pushées
- [ ] GitHub Actions déployé avec succès
- [ ] Test de rafraîchissement sur une route dynamique
- [ ] Test d'accès direct via URL
- [ ] Test des favoris
