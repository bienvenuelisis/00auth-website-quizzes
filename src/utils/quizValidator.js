/**
 * Utilitaires de validation des quiz
 * Double validation côté client pour garantir l'intégrité des questions
 */

/**
 * Valider qu'une question individuelle est complète
 */
export function validateQuizQuestion(question, index = 0) {
  const issues = [];

  // Champs obligatoires
  if (!question.id) {
    issues.push({ severity: 'error', field: 'id', message: 'ID manquant' });
  }

  if (!question.type) {
    issues.push({ severity: 'error', field: 'type', message: 'Type de question manquant' });
  }

  if (!question.question || question.question.trim() === '') {
    issues.push({ severity: 'error', field: 'question', message: 'Texte de la question vide' });
  }

  if (question.correctAnswer === undefined || question.correctAnswer === null) {
    issues.push({ severity: 'error', field: 'correctAnswer', message: 'Réponse correcte manquante' });
  }

  if (!question.explanation || question.explanation.trim() === '') {
    issues.push({ severity: 'warning', field: 'explanation', message: 'Explication manquante' });
  }

  // Validation selon le type
  if (question.type) {
    switch (question.type) {
      case 'multiple-choice':
      case 'code-completion':
      case 'code-debugging':
        // DOIVENT avoir des options (minimum 2, idéalement 4)
        if (!question.options || !Array.isArray(question.options)) {
          issues.push({
            severity: 'error',
            field: 'options',
            message: `Options manquantes pour ${question.type}`,
          });
        } else if (question.options.length < 2) {
          issues.push({
            severity: 'error',
            field: 'options',
            message: `Pas assez d'options (${question.options.length}/2 minimum)`,
          });
        } else if (question.options.length < 4) {
          issues.push({
            severity: 'warning',
            field: 'options',
            message: `Moins de 4 options (${question.options.length}/4 recommandé)`,
          });
        }

        // Vérifier que les options ne sont pas vides
        if (question.options) {
          question.options.forEach((opt, i) => {
            if (!opt || opt.trim() === '') {
              issues.push({
                severity: 'error',
                field: 'options',
                message: `Option ${i + 1} est vide`,
              });
            }
          });
        }

        // Vérifier que correctAnswer est valide
        if (question.options && typeof question.correctAnswer === 'number') {
          if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
            issues.push({
              severity: 'error',
              field: 'correctAnswer',
              message: `Index invalide (${question.correctAnswer}, doit être entre 0 et ${question.options.length - 1})`,
            });
          }
        }
        break;

      case 'true-false':
        // correctAnswer doit être 0 (Faux) ou 1 (Vrai)
        if (question.correctAnswer !== 0 && question.correctAnswer !== 1) {
          issues.push({
            severity: 'error',
            field: 'correctAnswer',
            message: `Doit être 0 (Faux) ou 1 (Vrai), reçu: ${question.correctAnswer}`,
          });
        }

        // Les options doivent être ['Faux', 'Vrai']
        if (!question.options || question.options.length !== 2) {
          issues.push({
            severity: 'warning',
            field: 'options',
            message: 'Options true-false incorrectes',
          });
        }
        break;

      default:
        issues.push({
          severity: 'error',
          field: 'type',
          message: `Type de question invalide: "${question.type}"`,
        });
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    questionIndex: index,
  };
}

/**
 * Valider un quiz complet
 */
export function validateQuiz(quiz) {
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
    return {
      valid: false,
      error: 'Quiz invalide ou questions manquantes',
      questionResults: [],
    };
  }

  const questionResults = quiz.questions.map((q, index) => validateQuizQuestion(q, index));

  const errors = questionResults.filter(r => !r.valid);
  const warnings = questionResults.flatMap(r =>
    r.issues.filter(i => i.severity === 'warning')
  );

  return {
    valid: errors.length === 0,
    totalQuestions: quiz.questions.length,
    validQuestions: questionResults.filter(r => r.valid).length,
    invalidQuestions: errors.length,
    warningCount: warnings.length,
    questionResults,
    errors,
    warnings,
  };
}

/**
 * Obtenir un rapport détaillé de validation
 */
export function getValidationReport(validationResult) {
  if (!validationResult) return 'Aucun résultat de validation';

  const lines = [];

  lines.push(`📊 Rapport de Validation du Quiz`);
  lines.push(`─────────────────────────────────`);
  lines.push(`Total: ${validationResult.totalQuestions} questions`);
  lines.push(`✅ Valides: ${validationResult.validQuestions}`);
  lines.push(`❌ Invalides: ${validationResult.invalidQuestions}`);
  lines.push(`⚠️  Avertissements: ${validationResult.warningCount}`);
  lines.push('');

  if (validationResult.errors.length > 0) {
    lines.push('❌ ERREURS CRITIQUES:');
    validationResult.errors.forEach((err) => {
      lines.push(`  Question ${err.questionIndex + 1}:`);
      err.issues
        .filter(i => i.severity === 'error')
        .forEach(issue => {
          lines.push(`    • ${issue.field}: ${issue.message}`);
        });
    });
    lines.push('');
  }

  if (validationResult.warnings.length > 0 && validationResult.warnings.length <= 10) {
    lines.push('⚠️  AVERTISSEMENTS:');
    validationResult.questionResults.forEach((result) => {
      const warnings = result.issues.filter(i => i.severity === 'warning');
      if (warnings.length > 0) {
        lines.push(`  Question ${result.questionIndex + 1}:`);
        warnings.forEach(w => {
          lines.push(`    • ${w.field}: ${w.message}`);
        });
      }
    });
  }

  return lines.join('\n');
}

/**
 * Vérifier si une question peut être affichée à l'utilisateur
 * (validation minimale pour éviter les blocages)
 */
export function isQuestionPlayable(question) {
  // Vérifications minimales pour qu'une question soit jouable
  const hasQuestion = question.question && question.question.trim() !== '';
  const hasType = !!question.type;
  const hasCorrectAnswer = question.correctAnswer !== undefined && question.correctAnswer !== null;

  // Pour les questions avec options, vérifier qu'il y a au moins 2 options
  const needsOptions = ['multiple-choice', 'code-completion', 'code-debugging'].includes(question.type);
  const hasValidOptions = needsOptions
    ? (question.options && Array.isArray(question.options) && question.options.length >= 2)
    : true;

  return hasQuestion && hasType && hasCorrectAnswer && hasValidOptions;
}

/**
 * Filtrer un quiz pour ne garder que les questions jouables
 */
export function getPlayableQuestions(quiz) {
  if (!quiz || !quiz.questions) return [];

  return quiz.questions.filter(isQuestionPlayable);
}

/**
 * Statistiques de validation d'un quiz
 */
export function getQuizStats(quiz) {
  if (!quiz || !quiz.questions) {
    return {
      total: 0,
      playable: 0,
      broken: 0,
      byType: {},
    };
  }

  const playable = getPlayableQuestions(quiz);
  const broken = quiz.questions.length - playable.length;

  const byType = quiz.questions.reduce((acc, q) => {
    const type = q.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: quiz.questions.length,
    playable: playable.length,
    broken,
    byType,
  };
}
