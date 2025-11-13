/**
 * Service de gestion des profils participants dans Firestore
 */

import { Timestamp, query, getDocs, limit, collection } from 'firebase/firestore';
import { addDocument, getDocument, updateDocument, deleteDocument } from './helpers';
import { usersCollection } from './constants';
import { createParticipantProfile } from '../../../models/participant';
import { db } from '../../../config/firebase';

/**
 * Vérifie s'il existe déjà des utilisateurs dans la base
 * @returns {Promise<boolean>}
 */
export async function hasExistingUsers() {
  try {
    const usersRef = collection(db, usersCollection);
    const q = query(usersRef, limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Erreur lors de la vérification des utilisateurs:', error);
    return false;
  }
}

/**
 * Crée un nouveau profil participant dans Firestore
 * @param {string} uid - Firebase Auth UID
 * @param {Object} profileData - Données du profil
 * @param {string} profileData.email
 * @param {string} profileData.fullName
 * @param {string} [profileData.phone]
 * @param {string} [profileData.company]
 * @param {string} [profileData.jobTitle]
 * @param {string} [profileData.level]
 * @param {string[]} [profileData.goals]
 * @returns {Promise<string>} - ID du document créé
 */
export async function createProfile(uid, profileData) {
  // Vérifier s'il s'agit du premier utilisateur (premier admin)
  const existingUsers = await hasExistingUsers();
  const isFirstAdmin = !existingUsers;

  const profile = createParticipantProfile(
    uid,
    profileData.email,
    profileData.fullName,
    { isFirstAdmin }
  );

  // Ajouter les champs optionnels fournis
  if (profileData.phone) profile.phone = profileData.phone;
  if (profileData.company) profile.company = profileData.company;
  if (profileData.jobTitle) profile.jobTitle = profileData.jobTitle;
  if (profileData.level) profile.level = profileData.level;
  if (profileData.goals) profile.goals = profileData.goals;

  // Convertir les dates en Timestamp Firestore
  const firestoreProfile = {
    ...profile,
    createdAt: Timestamp.fromDate(profile.createdAt),
    updatedAt: profile.updatedAt ? Timestamp.fromDate(profile.updatedAt) : null,
    lastConnexion: Timestamp.fromDate(profile.lastConnexion)
  };

  return await addDocument(usersCollection, firestoreProfile, uid);
}

/**
 * Récupère le profil d'un participant
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Object>} - Profil du participant
 */
export async function getProfile(uid) {
  const profile = await getDocument(usersCollection, uid);

  // Convertir les Timestamps en Date
  if (profile.createdAt) profile.createdAt = profile.createdAt.toDate();
  if (profile.updatedAt) profile.updatedAt = profile.updatedAt.toDate();
  if (profile.lastConnexion) profile.lastConnexion = profile.lastConnexion.toDate();

  return profile;
}

/**
 * Met à jour le profil d'un participant
 * @param {string} uid - Firebase Auth UID
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateProfile(uid, updates) {
  const data = {
    ...updates,
    updatedAt: Timestamp.now()
  };

  return await updateDocument(usersCollection, uid, data);
}

/**
 * Met à jour la date de dernière connexion
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export async function updateLastConnexion(uid) {
  return await updateDocument(usersCollection, uid, {
    lastConnexion: Timestamp.now()
  });
}

/**
 * Met à jour la photo de profil
 * @param {string} uid - Firebase Auth UID
 * @param {string} photoURL - URL de la photo
 * @returns {Promise<void>}
 */
export async function updateProfilePhoto(uid, photoURL) {
  return await updateProfile(uid, { photoURL });
}

/**
 * Met à jour les préférences utilisateur
 * @param {string} uid - Firebase Auth UID
 * @param {Object} preferences - Nouvelles préférences
 * @returns {Promise<void>}
 */
export async function updatePreferences(uid, preferences) {
  return await updateProfile(uid, { preferences });
}

/**
 * Désactive un compte participant
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export async function deactivateProfile(uid) {
  return await updateProfile(uid, { isActive: false });
}

/**
 * Supprime le profil d'un participant
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export async function deleteProfile(uid) {
  return await deleteDocument(usersCollection, uid);
}

/**
 * Vérifie si un profil existe
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<boolean>}
 */
export async function profileExists(uid) {
  try {
    await getProfile(uid);
    return true;
  } catch (error) {
    if (error.message.includes('not exist')) {
      return false;
    }
    throw error;
  }
}

/**
 * Change le rôle d'un utilisateur (admin uniquement)
 * @param {string} uid - Firebase Auth UID de l'utilisateur à modifier
 * @param {string} newRole - Nouveau rôle: 'user' | 'admin' | 'instructor' | 'moderator'
 * @returns {Promise<void>}
 */
export async function changeUserRole(uid, newRole) {
  const validRoles = ['user', 'admin', 'instructor', 'moderator'];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Rôle invalide: ${newRole}`);
  }

  return await updateProfile(uid, { role: newRole });
}

/**
 * Valide un compte utilisateur (admin/moderator uniquement)
 * @param {string} uid - Firebase Auth UID de l'utilisateur à valider
 * @returns {Promise<void>}
 */
export async function validateAccount(uid) {
  return await updateProfile(uid, { accountIsValid: true });
}

/**
 * Invalide un compte utilisateur (admin/moderator uniquement)
 * @param {string} uid - Firebase Auth UID de l'utilisateur à invalider
 * @returns {Promise<void>}
 */
export async function invalidateAccount(uid) {
  return await updateProfile(uid, { accountIsValid: false });
}

/**
 * Active un compte utilisateur
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<void>}
 */
export async function activateProfile(uid) {
  return await updateProfile(uid, { isActive: true });
}

/**
 * Récupère tous les utilisateurs (admin uniquement)
 * @returns {Promise<Array>} - Liste de tous les profils
 */
export async function getAllUsers() {
  try {
    const usersRef = collection(db, usersCollection);
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();

      // Convertir les Timestamps en Date
      if (data.createdAt) data.createdAt = data.createdAt.toDate();
      if (data.updatedAt) data.updatedAt = data.updatedAt.toDate();
      if (data.lastConnexion) data.lastConnexion = data.lastConnexion.toDate();

      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
}

/**
 * Récupère les utilisateurs en attente de validation
 * @returns {Promise<Array>} - Liste des profils non validés
 */
export async function getPendingUsers() {
  const allUsers = await getAllUsers();
  return allUsers.filter(user => !user.accountIsValid && user.role !== 'admin');
}
