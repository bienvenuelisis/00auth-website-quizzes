/**
 * Point d'entrée centralisé pour tous les services Firebase
 * Permet d'importer facilement les services dans l'application
 */

// Configuration Firebase
export { app, ai, analytics, auth, db, storage, isAnalyticsReady } from '../../config/firebase';

// Services d'authentification
export {
  signUpWithEmailAndPassword,
  handleAuthStateChanged,
  logInWithEmailAndPassword,
  signOutCurrentUser,
  deleteCurrentUser,
  sendUserPasswordResetEmail
} from './auth';

// Services Auth avec Firestore
export { registerNewUser, signInUser, logUserOut } from './firestore/auth';

// Services de gestion des profils
export {
  createProfile,
  getProfile,
  updateProfile,
  updateLastConnexion,
  updateProfilePhoto,
  updatePreferences,
  deactivateProfile,
  deleteProfile,
  profileExists
} from './firestore/profile';

// Services de gestion de la progression
export {
  initializeProgress,
  getProgress,
  saveQuizAttempt,
  updateModuleStatus,
  syncProgress,
  progressExists
} from './firestore/progress';

// Services Firestore (CRUD générique)
export {
  getAll,
  countAll,
  addDocument,
  getDocument,
  getAllWhere,
  getAllWheres,
  countAllWhere,
  updateDocument,
  deleteDocument
} from './firestore/helpers';

// Services Storage pour photos de profil
export {
  uploadProfilePhoto,
  deleteProfilePhoto,
  getProfilePhotoURL,
  resizeImage,
  prepareImageForUpload
} from './firestorage/profilePhoto';

// Services Storage (générique)
export {
  listFiles,
  uploadFile,
  deleteFile,
  getFileMetadata,
  createStorageRef,
  uploadStringFile,
  getFileDownloadURL
} from './firestorage/helpers';

// Constantes
export { usersCollection, devicesCollection } from './firestore/constants';

// Classes d'erreur
export { FirestoreError, getFirestoreErrorMessage } from './firestore/errors';
export { FirestorageError, handleStorageError } from './firestorage/errors';
