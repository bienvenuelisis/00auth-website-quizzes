# Formatage du Code dans les Questions de Quiz

## Problème Résolu

Garantir que le code généré par Gemini dans les questions de quiz est **correctement formaté** avec :
- Indentation appropriée
- Retours à la ligne lisibles
- Pas de lignes trop longues
- Format cohérent et professionnel

## Solution Multi-Niveaux

### Niveau 1: Instructions dans le Prompt

**Fichier:** [src/services/geminiQuiz.js](../src/services/geminiQuiz.js) - fonction `buildPrompt()`

#### Instructions Ajoutées au Prompt

```javascript
**FORMATAGE DU CODE (TRÈS IMPORTANT):**
- Le code DOIT être correctement indenté avec 2 espaces par niveau
- Utilise des retours à la ligne appropriés pour la lisibilité
- Formate le code comme tu le ferais dans un IDE professionnel
- Évite les lignes trop longues (max 80 caractères)
- Exemple de bon formatage:
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.0),
      child: Text('Hello World'),
    );
  }
}
```
```

#### Renforcement pour Types Spécifiques

Pour les questions `code-completion` et `code-debugging` :

```javascript
**code-completion:**
- code: snippet de code avec un blanc à remplir (BIEN FORMATÉ avec indentation et retours à la ligne)
- Le code DOIT être lisible avec une indentation appropriée

**code-debugging:**
- code: snippet avec une erreur (BIEN FORMATÉ avec indentation et retours à la ligne)
- Le code DOIT être lisible avec une indentation appropriée
```

### Niveau 2: Post-Traitement Automatique

**Fichier:** [src/services/geminiQuiz.js](../src/services/geminiQuiz.js) - fonction `formatCodeSnippet()`

#### Fonction de Nettoyage

```javascript
/**
 * Nettoyer et formater le code pour améliorer la lisibilité
 */
function formatCodeSnippet(code) {
  if (!code) return code;

  // Supprimer les espaces en début/fin
  let formatted = code.trim();

  // Supprimer les balises markdown si présentes
  formatted = formatted.replace(/^```dart\n?/, '').replace(/\n?```$/, '');

  // Normaliser les retours à la ligne (gérer \r\n et \n)
  formatted = formatted.replace(/\r\n/g, '\n');

  // Supprimer les lignes vides excessives (max 1 ligne vide consécutive)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted;
}
```

#### Opérations de Nettoyage

1. **Trim**: Supprime les espaces/retours à la ligne inutiles au début et à la fin
2. **Suppression des balises markdown**: Enlève les ````dart` et ``` `` ` si présents
3. **Normalisation des retours à la ligne**: Uniformise `\r\n` en `\n`
4. **Suppression des lignes vides excessives**: Maximum 1 ligne vide consécutive

#### Application Automatique

Le formatage est appliqué automatiquement lors de la normalisation des questions :

```javascript
const normalizedQuestions = validatedQuestions.map((q, index) => ({
  id: q.id || `q${index + 1}`,
  type: q.type,
  difficulty: q.difficulty || moduleData.difficulty,
  question: q.question,
  code: q.code ? formatCodeSnippet(q.code) : null, // ← Formatage appliqué ici
  options: q.options || (q.type === 'true-false' ? ['Faux', 'Vrai'] : []),
  correctAnswer: q.correctAnswer,
  explanation: q.explanation,
  points: q.points || 10,
  timeLimit: q.timeLimit || 30,
  tags: q.tags || moduleData.topics.slice(0, 3),
}));
```

### Niveau 3: Affichage avec React Syntax Highlighter

**Fichier:** [src/components/Quiz/QuestionCard.jsx](../src/components/Quiz/QuestionCard.jsx)

#### Coloration Syntaxique Professionnelle

```jsx
<SyntaxHighlighter
  language="dart"
  style={theme.palette.mode === 'dark' ? vscDarkPlus : vs}
  customStyle={{
    margin: 0,
    borderRadius: 0,
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
  }}
  showLineNumbers={true}
  wrapLines={true}
  lineNumberStyle={{
    minWidth: '2.5em',
    paddingRight: '1em',
    color: theme.palette.text.disabled,
    userSelect: 'none',
  }}
>
  {question.code}
</SyntaxHighlighter>
```

#### Avantages

✅ **Indentation visuellement claire** grâce à la coloration syntaxique
✅ **Numéros de lignes** pour faciliter la lecture
✅ **Retour à la ligne automatique** pour les lignes longues
✅ **Thèmes adaptatifs** (clair/sombre) pour un contraste optimal
✅ **Police monospace** professionnelle

## Standards de Formatage Dart

### Indentation
- **2 espaces** par niveau d'indentation (standard Dart)
- Pas de tabulations

### Longueur de Ligne
- Maximum **80 caractères** recommandé
- Facilite la lecture et évite le scroll horizontal

### Accolades
```dart
// ✅ BON
class MyClass {
  void myMethod() {
    if (condition) {
      // code
    }
  }
}

// ❌ MAUVAIS
class MyClass { void myMethod() { if (condition) { /* code */ } } }
```

### Virgules Finales (Trailing Commas)
```dart
// ✅ BON - Facilite le formatage automatique
Container(
  padding: EdgeInsets.all(16.0),
  child: Text('Hello'),
)

// ✅ ACCEPTABLE - Mais moins flexible
Container(
  padding: EdgeInsets.all(16.0),
  child: Text('Hello')
)
```

### Espacement
```dart
// ✅ BON - Espaces autour des opérateurs
int sum = a + b;
bool result = value > 10;

// ❌ MAUVAIS
int sum=a+b;
bool result=value>10;
```

## Exemples de Bon Formatage

### Exemple 1: StatelessWidget Simple
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Text(
        'Hello World',
        style: TextStyle(fontSize: 18.0),
      ),
    );
  }
}
```

### Exemple 2: StatefulWidget avec Logique
```dart
class CounterWidget extends StatefulWidget {
  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Count: $_counter'),
        ElevatedButton(
          onPressed: _incrementCounter,
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

### Exemple 3: Liste avec Map
```dart
Widget buildList() {
  final items = ['Apple', 'Banana', 'Cherry'];

  return ListView(
    children: items.map((item) {
      return ListTile(
        title: Text(item),
        onTap: () => print('Tapped: $item'),
      );
    }).toList(),
  );
}
```

## Cas Problématiques Gérés

### Cas 1: Code sur Une Seule Ligne
**Avant:**
```dart
class MyWidget extends StatelessWidget { @override Widget build(BuildContext context) { return Container(child: Text('Hello')); } }
```

**Après formatage (grâce aux instructions du prompt):**
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text('Hello'),
    );
  }
}
```

### Cas 2: Balises Markdown Résiduelles
**Avant:**
````
```dart
void myFunction() {
  print('Hello');
}
```
````

**Après `formatCodeSnippet()`:**
```dart
void myFunction() {
  print('Hello');
}
```

### Cas 3: Retours à la Ligne Incohérents
**Avant:**
```
void myFunction() {\r\n  print('Hello');\r\n}
```

**Après `formatCodeSnippet()`:**
```dart
void myFunction() {
  print('Hello');
}
```

### Cas 4: Lignes Vides Excessives
**Avant:**
```dart
class MyWidget {


  void method1() {}



  void method2() {}
}
```

**Après `formatCodeSnippet()`:**
```dart
class MyWidget {

  void method1() {}

  void method2() {}
}
```

## Stratégie de Défense en Profondeur

### 1. Prévention (Instructions Prompt)
- Guide Gemini pour générer du code bien formaté dès le départ
- Exemples concrets de bon formatage
- Instructions spécifiques par type de question

### 2. Correction (Post-Traitement)
- Nettoyage automatique des artefacts
- Normalisation des retours à la ligne
- Suppression des éléments indésirables

### 3. Présentation (React Syntax Highlighter)
- Coloration syntaxique professionnelle
- Numéros de lignes pour faciliter la lecture
- Thèmes adaptatifs pour un contraste optimal

## Métriques de Qualité

### Critères de Qualité du Code

```javascript
const CODE_QUALITY_CHECKS = {
  // Indentation standard Dart (2 espaces)
  INDENTATION: /^( {2})+/gm,

  // Longueur de ligne raisonnable
  MAX_LINE_LENGTH: 80,

  // Pas de lignes vides excessives
  MAX_CONSECUTIVE_BLANK_LINES: 1,

  // Pas de trailing whitespace
  NO_TRAILING_WHITESPACE: /\s+$/gm,
};
```

### Logging

```javascript
console.log(`🎨 Formatage du code pour question ${index + 1}`);
console.log(`   - Longueur originale: ${code.length} caractères`);
console.log(`   - Longueur formatée: ${formatted.length} caractères`);
console.log(`   - Lignes: ${formatted.split('\n').length}`);
```

## Améliorations Futures Possibles

### Option A: Formateur Dart Intégré
Utiliser un formateur Dart réel (comme `dart format`) via WebAssembly ou API :

```javascript
async function formatDartCode(code) {
  // Appeler un service de formatage Dart
  const response = await fetch('https://dartpad-api.dev/format', {
    method: 'POST',
    body: JSON.stringify({ source: code }),
  });

  const { formatted } = await response.json();
  return formatted;
}
```

**Avantages:**
- Formatage 100% conforme aux standards Dart
- Gestion automatique de tous les cas edge

**Inconvénients:**
- Dépendance externe
- Latence réseau
- Coût potentiel

### Option B: Validation de Formatage
Ajouter une vérification de qualité du formatage :

```javascript
function validateCodeFormatting(code) {
  const issues = [];

  // Vérifier indentation
  const lines = code.split('\n');
  lines.forEach((line, index) => {
    if (line.match(/^\t/)) {
      issues.push(`Ligne ${index + 1}: Utilise des tabulations au lieu d'espaces`);
    }
  });

  // Vérifier longueur de ligne
  lines.forEach((line, index) => {
    if (line.length > 80) {
      issues.push(`Ligne ${index + 1}: Trop longue (${line.length}/80 caractères)`);
    }
  });

  return issues;
}
```

### Option C: Exemples dans le Cache
Mettre en cache des exemples de code bien formaté et les utiliser comme référence dans le prompt :

```javascript
const DART_FORMATTING_EXAMPLES = {
  'StatelessWidget': `class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}`,
  'StatefulWidget': `class MyWidget extends StatefulWidget {
  @override
  State<MyWidget> createState() => _MyWidgetState();
}`,
  // ... autres exemples
};
```

## Testing

### Test Unitaire

```javascript
describe('formatCodeSnippet', () => {
  it('supprime les balises markdown', () => {
    const input = '```dart\nvoid test() {}\n```';
    const expected = 'void test() {}';
    expect(formatCodeSnippet(input)).toBe(expected);
  });

  it('normalise les retours à la ligne', () => {
    const input = 'void test() {\r\n  print("Hello");\r\n}';
    const expected = 'void test() {\n  print("Hello");\n}';
    expect(formatCodeSnippet(input)).toBe(expected);
  });

  it('supprime les lignes vides excessives', () => {
    const input = 'void test() {\n\n\n  print("Hello");\n}';
    const expected = 'void test() {\n\n  print("Hello");\n}';
    expect(formatCodeSnippet(input)).toBe(expected);
  });
});
```

## Recommandations

1. **Toujours formater le code** avant de l'afficher
2. **Utiliser les standards Dart** (2 espaces, trailing commas)
3. **Tester visuellement** dans le mode sombre et clair
4. **Monitorer la qualité** du code généré par Gemini
5. **Itérer sur le prompt** si le formatage n'est pas satisfaisant

## Références

- [Dart Style Guide](https://dart.dev/guides/language/effective-dart/style)
- [Flutter Code Formatting](https://docs.flutter.dev/development/tools/formatting)
- [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
