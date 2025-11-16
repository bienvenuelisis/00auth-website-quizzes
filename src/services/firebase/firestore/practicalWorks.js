/**
 * @fileoverview Firebase Firestore service for Practical Works
 * Handles CRUD operations for practical work progress and submissions
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../config/firebase';
import {
  createPracticalWorkProgress,
  createSubmissionAttempt,
  createEvaluation,
  createSubmittedDeliverable,
  calculateProgressStatus,
  getLatestAttempt,
  getBestAttempt,
  PW_STATUS
} from '../../../models/practicalWork';

// Collection names
const PROGRESS_COLLECTION = 'practicalWorkProgress';
const SUBMISSIONS_COLLECTION = 'practicalWorkSubmissions';
const FILES_COLLECTION = 'practicalWorkFiles';

/**
 * Converts Firestore timestamps to Date objects
 * @param {Object} data - Firestore document data
 * @returns {Object} Data with converted dates
 */
function convertTimestamps(data) {
  const converted = { ...data };

  // Ensure attempts is always an array
  if (converted.attempts === undefined || converted.attempts === null) {
    converted.attempts = [];
  }

  Object.keys(converted).forEach(key => {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    } else if (converted[key] && typeof converted[key] === 'object' && !Array.isArray(converted[key])) {
      converted[key] = convertTimestamps(converted[key]);
    } else if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map(item =>
        typeof item === 'object' && item !== null ? convertTimestamps(item) : item
      );
    }
  });
  return converted;
}

// ==================== PROGRESS OPERATIONS ====================

/**
 * Get progress for a specific practical work
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<Object|null>} Progress object or null
 */
export async function getPracticalWorkProgress(userId, practicalWorkId) {
  try {
    const progressId = `${userId}_${practicalWorkId}`;
    const docRef = doc(db, PROGRESS_COLLECTION, progressId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
  } catch (error) {
    console.error('Error getting practical work progress:', error);
    throw error;
  }
}

/**
 * Get all progress for a user in a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Array<Object>>} Array of progress objects
 */
export async function getUserPracticalWorkProgress(userId, courseId) {
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('userId', '==', userId),
      where('courseId', '==', courseId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc =>
      convertTimestamps({ id: doc.id, ...doc.data() })
    );
  } catch (error) {
    console.error('Error getting user practical work progress:', error);
    throw error;
  }
}

/**
 * Get all progress for a practical work (admin/instructor view)
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<Array<Object>>} Array of all student progress
 */
export async function getAllPracticalWorkProgress(practicalWorkId) {
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('practicalWorkId', '==', practicalWorkId),
      orderBy('lastSubmissionDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc =>
      convertTimestamps({ id: doc.id, ...doc.data() })
    );
  } catch (error) {
    console.error('Error getting all practical work progress:', error);
    throw error;
  }
}

/**
 * Initialize progress for a practical work
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Created progress object
 */
export async function initializePracticalWorkProgress(userId, practicalWorkId, courseId) {
  try {
    const progressId = `${userId}_${practicalWorkId}`;
    const progress = createPracticalWorkProgress(userId, practicalWorkId, courseId);

    await setDoc(doc(db, PROGRESS_COLLECTION, progressId), {
      ...progress,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return progress;
  } catch (error) {
    console.error('Error initializing practical work progress:', error);
    throw error;
  }
}

/**
 * Submit a practical work attempt
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} courseId - Course ID
 * @param {Array<Object>} deliverables - Submitted deliverables
 * @param {Date|null} deadline - TP deadline
 * @returns {Promise<Object>} Updated progress
 */
export async function submitPracticalWork(userId, practicalWorkId, courseId, deliverables, deadline = null) {
  try {
    const progressId = `${userId}_${practicalWorkId}`;

    // Get existing progress or create new
    let progress = await getPracticalWorkProgress(userId, practicalWorkId);
    if (!progress) {
      progress = await initializePracticalWorkProgress(userId, practicalWorkId, courseId);
    }

    // Create new attempt
    const attemptNumber = (progress.currentAttemptNumber || 0) + 1;
    const attempt = createSubmissionAttempt(attemptNumber, deliverables, deadline);

    // Update progress
    const updatedProgress = {
      ...progress,
      status: PW_STATUS.SUBMITTED,
      attempts: [...progress.attempts, attempt],
      currentAttemptNumber: attemptNumber,
      firstSubmissionDate: progress.firstSubmissionDate || new Date(),
      lastSubmissionDate: new Date(),
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, PROGRESS_COLLECTION, progressId), updatedProgress);

    return convertTimestamps(updatedProgress);
  } catch (error) {
    console.error('Error submitting practical work:', error);
    throw error;
  }
}

/**
 * Evaluate a practical work submission
 * @param {string} userId - Student user ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {number} attemptNumber - Attempt number to evaluate
 * @param {string} evaluatorId - Evaluator user ID
 * @param {string} evaluatorName - Evaluator name
 * @param {Array<Object>} scores - Criteria scores
 * @param {string} generalFeedback - General feedback
 * @returns {Promise<Object>} Updated progress
 */
export async function evaluatePracticalWork(
  userId,
  practicalWorkId,
  attemptNumber,
  evaluatorId,
  evaluatorName,
  scores,
  generalFeedback
) {
  try {
    const progressId = `${userId}_${practicalWorkId}`;
    const progress = await getPracticalWorkProgress(userId, practicalWorkId);

    if (!progress) {
      throw new Error('Progress not found');
    }

    // Find the attempt to evaluate
    const attemptIndex = progress.attempts.findIndex(
      a => a.attemptNumber === attemptNumber
    );

    if (attemptIndex === -1) {
      throw new Error('Attempt not found');
    }

    // Create evaluation
    const evaluation = createEvaluation(evaluatorId, evaluatorName, scores, generalFeedback);

    // Update attempt with evaluation
    const updatedAttempts = [...progress.attempts];
    updatedAttempts[attemptIndex] = {
      ...updatedAttempts[attemptIndex],
      evaluation,
      status: 'evaluated'
    };

    // Calculate best score and determine if passed
    const evaluatedAttempts = updatedAttempts.filter(a => a.evaluation);
    const bestScore = Math.max(...evaluatedAttempts.map(a => a.evaluation.totalScore));
    const isPassed = bestScore >= 70;

    // Update progress
    const updatedProgress = {
      ...progress,
      attempts: updatedAttempts,
      bestScore,
      isPassed,
      status: evaluation.status === 'passed' ? PW_STATUS.PASSED :
              evaluation.status === 'needs_revision' ? PW_STATUS.REVISION_REQUESTED :
              PW_STATUS.EVALUATED,
      passedAt: isPassed && !progress.passedAt ? new Date() : progress.passedAt,
      updatedAt: serverTimestamp()
    };

    await updateDoc(doc(db, PROGRESS_COLLECTION, progressId), updatedProgress);

    return convertTimestamps(updatedProgress);
  } catch (error) {
    console.error('Error evaluating practical work:', error);
    throw error;
  }
}

/**
 * Mark a practical work as in progress
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Updated progress
 */
export async function markPracticalWorkInProgress(userId, practicalWorkId, courseId) {
  try {
    const progressId = `${userId}_${practicalWorkId}`;
    let progress = await getPracticalWorkProgress(userId, practicalWorkId);

    if (!progress) {
      progress = await initializePracticalWorkProgress(userId, practicalWorkId, courseId);
    }

    if (progress.status === PW_STATUS.NOT_STARTED) {
      await updateDoc(doc(db, PROGRESS_COLLECTION, progressId), {
        status: PW_STATUS.IN_PROGRESS,
        updatedAt: serverTimestamp()
      });
    }

    return progress;
  } catch (error) {
    console.error('Error marking practical work in progress:', error);
    throw error;
  }
}

/**
 * Delete a practical work progress (admin only)
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<void>}
 */
export async function deletePracticalWorkProgress(userId, practicalWorkId) {
  try {
    const progressId = `${userId}_${practicalWorkId}`;
    await deleteDoc(doc(db, PROGRESS_COLLECTION, progressId));
  } catch (error) {
    console.error('Error deleting practical work progress:', error);
    throw error;
  }
}

// ==================== SUBMISSION QUERIES ====================

/**
 * Get all submissions pending review
 * @param {string} courseId - Course ID (optional filter)
 * @returns {Promise<Array<Object>>} Pending submissions
 */
export async function getPendingSubmissions(courseId = null) {
  try {
    let q = query(
      collection(db, PROGRESS_COLLECTION),
      where('status', '==', PW_STATUS.SUBMITTED),
      orderBy('lastSubmissionDate', 'desc')
    );

    if (courseId) {
      q = query(
        collection(db, PROGRESS_COLLECTION),
        where('courseId', '==', courseId),
        where('status', '==', PW_STATUS.SUBMITTED),
        orderBy('lastSubmissionDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc =>
      convertTimestamps({ id: doc.id, ...doc.data() })
    );
  } catch (error) {
    console.error('Error getting pending submissions:', error);
    throw error;
  }
}

/**
 * Get evaluated submissions
 * @param {string} courseId - Course ID (optional filter)
 * @param {number} limitCount - Limit results
 * @returns {Promise<Array<Object>>} Evaluated submissions
 */
export async function getEvaluatedSubmissions(courseId = null, limitCount = 50) {
  try {
    let q;
    if (courseId) {
      q = query(
        collection(db, PROGRESS_COLLECTION),
        where('courseId', '==', courseId),
        where('status', 'in', [PW_STATUS.EVALUATED, PW_STATUS.PASSED, PW_STATUS.FAILED]),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, PROGRESS_COLLECTION),
        where('status', 'in', [PW_STATUS.EVALUATED, PW_STATUS.PASSED, PW_STATUS.FAILED]),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc =>
      convertTimestamps({ id: doc.id, ...doc.data() })
    );
  } catch (error) {
    console.error('Error getting evaluated submissions:', error);
    throw error;
  }
}

/**
 * Get late submissions
 * @param {string} practicalWorkId - Practical work ID
 * @param {Date} deadline - Deadline date
 * @returns {Promise<Array<Object>>} Late submissions
 */
export async function getLateSubmissions(practicalWorkId, deadline) {
  try {
    const q = query(
      collection(db, PROGRESS_COLLECTION),
      where('practicalWorkId', '==', practicalWorkId),
      where('lastSubmissionDate', '>', Timestamp.fromDate(deadline))
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc =>
      convertTimestamps({ id: doc.id, ...doc.data() })
    );
  } catch (error) {
    console.error('Error getting late submissions:', error);
    throw error;
  }
}

// ==================== STATISTICS ====================

/**
 * Get statistics for a practical work
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<Object>} Statistics object
 */
export async function getPracticalWorkStats(practicalWorkId) {
  try {
    const allProgress = await getAllPracticalWorkProgress(practicalWorkId);

    const stats = {
      totalStudents: allProgress.length,
      notStarted: 0,
      inProgress: 0,
      submitted: 0,
      evaluated: 0,
      passed: 0,
      failed: 0,
      revisionRequested: 0,
      averageScore: 0,
      averageAttempts: 0,
      lateSubmissions: 0
    };

    let totalScore = 0;
    let totalAttempts = 0;
    let scoredStudents = 0;

    allProgress.forEach(progress => {
      // Count by status
      switch (progress.status) {
        case PW_STATUS.NOT_STARTED:
          stats.notStarted++;
          break;
        case PW_STATUS.IN_PROGRESS:
          stats.inProgress++;
          break;
        case PW_STATUS.SUBMITTED:
          stats.submitted++;
          break;
        case PW_STATUS.EVALUATED:
          stats.evaluated++;
          break;
        case PW_STATUS.PASSED:
          stats.passed++;
          break;
        case PW_STATUS.FAILED:
          stats.failed++;
          break;
        case PW_STATUS.REVISION_REQUESTED:
          stats.revisionRequested++;
          break;
      }

      // Calculate averages
      if (progress.bestScore !== null) {
        totalScore += progress.bestScore;
        scoredStudents++;
      }

      totalAttempts += progress.attempts.length;

      // Count late submissions
      const latestAttempt = getLatestAttempt(progress);
      if (latestAttempt && latestAttempt.isLate) {
        stats.lateSubmissions++;
      }
    });

    stats.averageScore = scoredStudents > 0 ? totalScore / scoredStudents : 0;
    stats.averageAttempts = allProgress.length > 0 ? totalAttempts / allProgress.length : 0;

    return stats;
  } catch (error) {
    console.error('Error getting practical work stats:', error);
    throw error;
  }
}

/**
 * Get student statistics across all practical works
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Student statistics
 */
export async function getStudentPracticalWorkStats(userId, courseId) {
  try {
    const allProgress = await getUserPracticalWorkProgress(userId, courseId);

    const stats = {
      totalPracticalWorks: allProgress.length,
      completed: 0,
      passed: 0,
      failed: 0,
      inProgress: 0,
      notStarted: 0,
      averageScore: 0,
      totalAttempts: 0,
      lateSubmissions: 0
    };

    let totalScore = 0;
    let scoredWorks = 0;

    allProgress.forEach(progress => {
      if (progress.status === PW_STATUS.PASSED) stats.passed++;
      if (progress.status === PW_STATUS.FAILED) stats.failed++;
      if (progress.status === PW_STATUS.IN_PROGRESS) stats.inProgress++;
      if (progress.status === PW_STATUS.NOT_STARTED) stats.notStarted++;

      if (progress.isPassed) stats.completed++;

      if (progress.bestScore !== null) {
        totalScore += progress.bestScore;
        scoredWorks++;
      }

      stats.totalAttempts += progress.attempts.length;

      const latestAttempt = getLatestAttempt(progress);
      if (latestAttempt && latestAttempt.isLate) {
        stats.lateSubmissions++;
      }
    });

    stats.averageScore = scoredWorks > 0 ? totalScore / scoredWorks : 0;

    return stats;
  } catch (error) {
    console.error('Error getting student practical work stats:', error);
    throw error;
  }
}

// ==================== FILE METADATA ====================

/**
 * Save file metadata
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @param {string} deliverableId - Deliverable ID
 * @param {Object} fileInfo - File information
 * @returns {Promise<string>} File metadata ID
 */
export async function saveFileMetadata(userId, practicalWorkId, deliverableId, fileInfo) {
  try {
    const fileId = `${userId}_${practicalWorkId}_${deliverableId}_${Date.now()}`;
    const fileData = {
      userId,
      practicalWorkId,
      deliverableId,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      fileType: fileInfo.type,
      fileUrl: fileInfo.url,
      uploadedAt: serverTimestamp()
    };

    await setDoc(doc(db, FILES_COLLECTION, fileId), fileData);
    return fileId;
  } catch (error) {
    console.error('Error saving file metadata:', error);
    throw error;
  }
}

/**
 * Get file metadata for a practical work
 * @param {string} userId - User ID
 * @param {string} practicalWorkId - Practical work ID
 * @returns {Promise<Array<Object>>} File metadata
 */
export async function getFileMetadata(userId, practicalWorkId) {
  try {
    const q = query(
      collection(db, FILES_COLLECTION),
      where('userId', '==', userId),
      where('practicalWorkId', '==', practicalWorkId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc =>
      convertTimestamps({ id: doc.id, ...doc.data() })
    );
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

export default {
  // Progress operations
  getPracticalWorkProgress,
  getUserPracticalWorkProgress,
  getAllPracticalWorkProgress,
  initializePracticalWorkProgress,
  submitPracticalWork,
  evaluatePracticalWork,
  markPracticalWorkInProgress,
  deletePracticalWorkProgress,

  // Submission queries
  getPendingSubmissions,
  getEvaluatedSubmissions,
  getLateSubmissions,

  // Statistics
  getPracticalWorkStats,
  getStudentPracticalWorkStats,

  // File metadata
  saveFileMetadata,
  getFileMetadata
};
