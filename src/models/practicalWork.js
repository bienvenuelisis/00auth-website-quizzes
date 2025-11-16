/**
 * @fileoverview Data models for Practical Works (Travaux Pratiques) module
 * Defines types and helper functions for managing student practical work submissions
 */

/**
 * Evaluation criteria for a practical work
 * @typedef {Object} EvaluationCriteria
 * @property {string} id - Unique identifier
 * @property {string} name - Criteria name (e.g., "Fonctionnalité", "Qualité du code")
 * @property {string} description - Detailed description
 * @property {number} maxPoints - Maximum points for this criteria
 */

/**
 * Grading rubric for a practical work
 * @typedef {Object} GradingRubric
 * @property {number} total - Total points (100)
 * @property {Object} breakdown - Point distribution by criteria
 * @property {number} breakdown.functionality - Points for functionality (40)
 * @property {number} breakdown.codeQuality - Points for code quality (30)
 * @property {number} breakdown.uiUx - Points for UI/UX (20)
 * @property {number} breakdown.deadline - Points for respecting deadline (10)
 */

/**
 * Deliverable item for a practical work
 * @typedef {Object} Deliverable
 * @property {string} id - Unique identifier
 * @property {string} name - Deliverable name
 * @property {string} description - What is expected
 * @property {boolean} required - Whether this deliverable is mandatory
 * @property {string} type - Type: 'github'|'file'|'url'|'text'
 */

/**
 * Practical work definition
 * @typedef {Object} PracticalWork
 * @property {string} id - Unique identifier
 * @property {string} courseId - Associated course ID
 * @property {string} moduleId - Associated module ID (if linked to a module)
 * @property {string} title - TP title
 * @property {string} description - Detailed description
 * @property {string} instructions - Detailed instructions (markdown)
 * @property {string} week - Week number (e.g., "Semaine 1-2")
 * @property {number} weekNumber - Numeric week for sorting
 * @property {Array<string>} topics - Topics covered
 * @property {string} difficulty - 'beginner'|'intermediate'|'advanced'
 * @property {number} estimatedHours - Estimated time in hours
 * @property {Array<Deliverable>} deliverables - List of expected deliverables
 * @property {Array<EvaluationCriteria>} evaluationCriteria - Grading criteria
 * @property {GradingRubric} gradingRubric - Point distribution
 * @property {boolean} isBonus - Whether this is a bonus TP
 * @property {Date|null} deadline - Submission deadline (null if no deadline)
 * @property {number} order - Display order
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Submitted deliverable by a student
 * @typedef {Object} SubmittedDeliverable
 * @property {string} deliverableId - Reference to deliverable definition
 * @property {string} name - Deliverable name
 * @property {string} type - Type: 'github'|'file'|'url'|'text'
 * @property {string} value - GitHub URL, file URL, or text content
 * @property {Date} submittedAt - Submission timestamp
 * @property {string|null} fileUrl - Firebase Storage URL if type is 'file'
 * @property {string|null} fileName - Original file name
 * @property {number|null} fileSize - File size in bytes
 */

/**
 * Evaluation score for a specific criteria
 * @typedef {Object} CriteriaScore
 * @property {string} criteriaId - Reference to evaluation criteria
 * @property {string} name - Criteria name
 * @property {number} score - Points earned
 * @property {number} maxPoints - Maximum points possible
 * @property {string} feedback - Specific feedback for this criteria
 */

/**
 * Complete evaluation by instructor
 * @typedef {Object} Evaluation
 * @property {string} evaluatorId - UID of evaluator
 * @property {string} evaluatorName - Name of evaluator
 * @property {Date} evaluatedAt - Evaluation timestamp
 * @property {Array<CriteriaScore>} scores - Scores per criteria
 * @property {number} totalScore - Total score (0-100)
 * @property {string} generalFeedback - General feedback/comments
 * @property {string} status - 'passed'|'failed'|'needs_revision'
 */

/**
 * Single submission attempt
 * @typedef {Object} SubmissionAttempt
 * @property {string} attemptId - Unique attempt identifier
 * @property {number} attemptNumber - Sequential number (1, 2, 3...)
 * @property {Date} submittedAt - Submission timestamp
 * @property {string} status - 'submitted'|'under_review'|'evaluated'|'revision_requested'
 * @property {Array<SubmittedDeliverable>} deliverables - Submitted items
 * @property {Evaluation|null} evaluation - Evaluation (null if not yet evaluated)
 * @property {boolean} isLate - Whether submitted after deadline
 * @property {number|null} daysLate - Number of days late (if applicable)
 */

/**
 * Student's progress on a practical work
 * @typedef {Object} PracticalWorkProgress
 * @property {string} userId - Student UID
 * @property {string} practicalWorkId - TP identifier
 * @property {string} courseId - Course identifier
 * @property {string} status - Overall status: 'not_started'|'in_progress'|'submitted'|'evaluated'|'passed'|'failed'
 * @property {Array<SubmissionAttempt>} attempts - All submission attempts
 * @property {number|null} currentAttemptNumber - Current attempt (null if not started)
 * @property {number|null} bestScore - Highest score achieved
 * @property {Date|null} firstSubmissionDate - When first submitted
 * @property {Date|null} lastSubmissionDate - When last submitted
 * @property {Date|null} passedAt - When passed (score >= 70)
 * @property {boolean} isPassed - Whether student passed
 * @property {Date} createdAt - When progress was initialized
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Default grading rubric
 * @constant
 */
export const DEFAULT_GRADING_RUBRIC = {
  total: 100,
  breakdown: {
    functionality: 40,  // Application works as requested, no major bugs
    codeQuality: 30,    // Readable, well-structured, commented code
    uiUx: 20,           // Interface respects guidelines, ergonomic
    deadline: 10        // Respect of deadline
  }
};

/**
 * Status constants for practical works
 * @constant
 */
export const PW_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  EVALUATED: 'evaluated',
  PASSED: 'passed',
  FAILED: 'failed',
  REVISION_REQUESTED: 'revision_requested'
};

/**
 * Status labels in French
 * @constant
 */
export const PW_STATUS_LABELS = {
  [PW_STATUS.NOT_STARTED]: 'Non commencé',
  [PW_STATUS.IN_PROGRESS]: 'En cours',
  [PW_STATUS.SUBMITTED]: 'Soumis',
  [PW_STATUS.UNDER_REVIEW]: 'En cours d\'évaluation',
  [PW_STATUS.EVALUATED]: 'Évalué',
  [PW_STATUS.PASSED]: 'Réussi',
  [PW_STATUS.FAILED]: 'Échoué',
  [PW_STATUS.REVISION_REQUESTED]: 'Révision demandée'
};

/**
 * Status colors for UI display
 * @constant
 */
export const PW_STATUS_COLORS = {
  [PW_STATUS.NOT_STARTED]: 'default',
  [PW_STATUS.IN_PROGRESS]: 'info',
  [PW_STATUS.SUBMITTED]: 'warning',
  [PW_STATUS.UNDER_REVIEW]: 'warning',
  [PW_STATUS.EVALUATED]: 'info',
  [PW_STATUS.PASSED]: 'success',
  [PW_STATUS.FAILED]: 'error',
  [PW_STATUS.REVISION_REQUESTED]: 'warning'
};

/**
 * Deliverable types
 * @constant
 */
export const DELIVERABLE_TYPES = {
  GITHUB: 'github',
  FILE: 'file',
  URL: 'url',
  TEXT: 'text'
};

/**
 * Creates a new practical work definition
 * @param {Object} data - Practical work data
 * @returns {PracticalWork}
 */
export function createPracticalWork(data) {
  const now = new Date();
  return {
    id: data.id || `pw-${Date.now()}`,
    courseId: data.courseId,
    moduleId: data.moduleId || null,
    title: data.title,
    description: data.description || '',
    instructions: data.instructions || '',
    week: data.week || '',
    weekNumber: data.weekNumber || 0,
    topics: data.topics || [],
    difficulty: data.difficulty || 'beginner',
    estimatedHours: data.estimatedHours || 2,
    deliverables: data.deliverables || [],
    evaluationCriteria: data.evaluationCriteria || createDefaultEvaluationCriteria(),
    gradingRubric: data.gradingRubric || DEFAULT_GRADING_RUBRIC,
    isBonus: data.isBonus || false,
    deadline: data.deadline ? new Date(data.deadline) : null,
    order: data.order || 0,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
}

/**
 * Creates default evaluation criteria
 * @returns {Array<EvaluationCriteria>}
 */
export function createDefaultEvaluationCriteria() {
  return [
    {
      id: 'functionality',
      name: 'Fonctionnalité',
      description: 'L\'application fonctionne comme demandé, sans bugs majeurs',
      maxPoints: 40
    },
    {
      id: 'codeQuality',
      name: 'Qualité du code',
      description: 'Code lisible, bien structuré, commenté si nécessaire',
      maxPoints: 30
    },
    {
      id: 'uiUx',
      name: 'UI/UX',
      description: 'Interface respecte les consignes, ergonomique et agréable',
      maxPoints: 20
    },
    {
      id: 'deadline',
      name: 'Respect des délais',
      description: 'Soumission dans les délais impartis',
      maxPoints: 10
    }
  ];
}

/**
 * Creates initial progress for a practical work
 * @param {string} userId - Student UID
 * @param {string} practicalWorkId - TP ID
 * @param {string} courseId - Course ID
 * @returns {PracticalWorkProgress}
 */
export function createPracticalWorkProgress(userId, practicalWorkId, courseId) {
  const now = new Date();
  return {
    userId,
    practicalWorkId,
    courseId,
    status: PW_STATUS.NOT_STARTED,
    attempts: [],
    currentAttemptNumber: null,
    bestScore: null,
    firstSubmissionDate: null,
    lastSubmissionDate: null,
    passedAt: null,
    isPassed: false,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Creates a new submission attempt
 * @param {number} attemptNumber - Attempt number
 * @param {Array<SubmittedDeliverable>} deliverables - Submitted deliverables
 * @param {Date|null} deadline - TP deadline
 * @returns {SubmissionAttempt}
 */
export function createSubmissionAttempt(attemptNumber, deliverables, deadline = null) {
  const now = new Date();
  const isLate = deadline ? now > deadline : false;
  const daysLate = isLate ? Math.ceil((now - deadline) / (1000 * 60 * 60 * 24)) : null;

  return {
    attemptId: `attempt-${Date.now()}-${attemptNumber}`,
    attemptNumber,
    submittedAt: now,
    status: 'submitted',
    deliverables,
    evaluation: null,
    isLate,
    daysLate
  };
}

/**
 * Creates an evaluation object
 * @param {string} evaluatorId - Evaluator UID
 * @param {string} evaluatorName - Evaluator name
 * @param {Array<CriteriaScore>} scores - Scores per criteria
 * @param {string} generalFeedback - General feedback
 * @returns {Evaluation}
 */
export function createEvaluation(evaluatorId, evaluatorName, scores, generalFeedback) {
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const status = totalScore >= 70 ? 'passed' : (totalScore >= 50 ? 'needs_revision' : 'failed');

  return {
    evaluatorId,
    evaluatorName,
    evaluatedAt: new Date(),
    scores,
    totalScore,
    generalFeedback,
    status
  };
}

/**
 * Creates a submitted deliverable
 * @param {string} deliverableId - Deliverable definition ID
 * @param {string} name - Deliverable name
 * @param {string} type - Deliverable type
 * @param {string} value - URL or text content
 * @param {Object} fileInfo - File information (if type is 'file')
 * @returns {SubmittedDeliverable}
 */
export function createSubmittedDeliverable(deliverableId, name, type, value, fileInfo = null) {
  return {
    deliverableId,
    name,
    type,
    value,
    submittedAt: new Date(),
    fileUrl: fileInfo?.url || null,
    fileName: fileInfo?.name || null,
    fileSize: fileInfo?.size || null
  };
}

/**
 * Calculates deadline status
 * @param {Date|null} deadline - Deadline date
 * @returns {Object} Status object with isOverdue, daysRemaining, etc.
 */
export function calculateDeadlineStatus(deadline) {
  if (!deadline) {
    return {
      hasDeadline: false,
      isOverdue: false,
      daysRemaining: null,
      hoursRemaining: null
    };
  }

  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  return {
    hasDeadline: true,
    isOverdue: diffMs < 0,
    daysRemaining: diffDays,
    hoursRemaining: diffHours,
    deadline
  };
}

/**
 * Checks if a practical work is late
 * @param {Date} submittedAt - Submission date
 * @param {Date|null} deadline - Deadline
 * @returns {boolean}
 */
export function isLateSubmission(submittedAt, deadline) {
  if (!deadline) return false;
  return submittedAt > deadline;
}

/**
 * Calculates days late
 * @param {Date} submittedAt - Submission date
 * @param {Date} deadline - Deadline
 * @returns {number|null}
 */
export function calculateDaysLate(submittedAt, deadline) {
  if (!deadline || submittedAt <= deadline) return null;
  return Math.ceil((submittedAt - deadline) / (1000 * 60 * 60 * 24));
}

/**
 * Validates a practical work progress object
 * @param {PracticalWorkProgress} progress - Progress object
 * @returns {boolean}
 */
export function validatePracticalWorkProgress(progress) {
  return !!(
    progress.userId &&
    progress.practicalWorkId &&
    progress.courseId &&
    progress.status &&
    Array.isArray(progress.attempts)
  );
}

/**
 * Gets the latest attempt from progress
 * @param {PracticalWorkProgress} progress - Progress object
 * @returns {SubmissionAttempt|null}
 */
export function getLatestAttempt(progress) {
  if (!progress || !progress.attempts || !Array.isArray(progress.attempts) || progress.attempts.length === 0) {
    return null;
  }
  return progress.attempts[progress.attempts.length - 1];
}

/**
 * Gets the best scoring attempt from progress
 * @param {PracticalWorkProgress} progress - Progress object
 * @returns {SubmissionAttempt|null}
 */
export function getBestAttempt(progress) {
  if (!progress || !progress.attempts || !Array.isArray(progress.attempts) || progress.attempts.length === 0) {
    return null;
  }

  const evaluatedAttempts = progress.attempts.filter(a => a && a.evaluation);
  if (evaluatedAttempts.length === 0) return null;

  return evaluatedAttempts.reduce((best, current) => {
    const bestScore = best.evaluation?.totalScore || 0;
    const currentScore = current.evaluation?.totalScore || 0;
    return currentScore > bestScore ? current : best;
  });
}

/**
 * Calculates the status based on latest attempt
 * @param {PracticalWorkProgress} progress - Progress object
 * @returns {string} Status
 */
export function calculateProgressStatus(progress) {
  if (!progress || !progress.attempts || !Array.isArray(progress.attempts) || progress.attempts.length === 0) {
    return PW_STATUS.NOT_STARTED;
  }

  const latestAttempt = getLatestAttempt(progress);

  if (!latestAttempt || !latestAttempt.evaluation) {
    return latestAttempt?.status === 'submitted' ? PW_STATUS.SUBMITTED : PW_STATUS.IN_PROGRESS;
  }

  const evaluation = latestAttempt.evaluation;

  if (evaluation.status === 'passed') return PW_STATUS.PASSED;
  if (evaluation.status === 'needs_revision') return PW_STATUS.REVISION_REQUESTED;
  if (evaluation.status === 'failed') return PW_STATUS.FAILED;

  return PW_STATUS.EVALUATED;
}

/**
 * Formats score for display
 * @param {number} score - Score value
 * @param {number} maxScore - Maximum score
 * @returns {string}
 */
export function formatScore(score, maxScore = 100) {
  return `${score}/${maxScore}`;
}

/**
 * Gets score color based on value
 * @param {number} score - Score value
 * @returns {string} Color name
 */
export function getScoreColor(score) {
  if (score >= 90) return 'success';
  if (score >= 70) return 'info';
  if (score >= 50) return 'warning';
  return 'error';
}
