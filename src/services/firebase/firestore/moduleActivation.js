/**
 * Service de gestion de l'activation des modules dans Firestore
 */

import { Timestamp } from 'firebase/firestore';
import { addDocument, getDocument, updateDocument, getAll, getAllWhere } from './helpers';
import { createModuleActivation as createActivationModel } from '../../../models/moduleActivation';

// Collection pour stocker l'activation des modules
const MODULE_ACTIVATION_COLLECTION = 'moduleActivation';

/**
 * Crée un document d'activation pour un module
 * @param {Object} activationData - Données d'activation
 * @returns {Promise<string>} - ID du document créé
 */
export async function createModuleActivation(activationData) {
  const {
    moduleId,
    courseId,
    isActive = false,
    activatedBy = null,
    reason = '',
    scheduledActivation = null,
    scheduledDeactivation = null
  } = activationData;

  const activation = {
    moduleId,
    courseId,
    isActive,
    activatedBy,
    activatedAt: isActive ? Timestamp.now() : null,
    deactivatedBy: null,
    deactivatedAt: null,
    reason,
    scheduledActivation: scheduledActivation ? Timestamp.fromDate(new Date(scheduledActivation)) : null,
    scheduledDeactivation: scheduledDeactivation ? Timestamp.fromDate(new Date(scheduledDeactivation)) : null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  console.log(`📝 Création de l'activation pour le module: ${moduleId}`);
  return await addDocument(MODULE_ACTIVATION_COLLECTION, activation, moduleId);
}

/**
 * Récupère l'activation d'un module
 * @param {string} moduleId - ID du module
 * @returns {Promise<Object|null>} - Données d'activation ou null
 */
export async function getModuleActivation(moduleId) {
  try {
    const activation = await getDocument(MODULE_ACTIVATION_COLLECTION, moduleId);

    if (!activation) {
      return null;
    }

    // Convertir les Timestamps en Date
    return convertTimestampsToDate(activation);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'activation du module ${moduleId}:`, error);
    return null;
  }
}

/**
 * Récupère toutes les activations de modules
 * @returns {Promise<Array>} - Tableau des activations
 */
export async function getAllModuleActivations() {
  try {
    const activations = await getAll(MODULE_ACTIVATION_COLLECTION);

    // Convertir les Timestamps en Date pour chaque activation
    return activations.map(activation => convertTimestampsToDate(activation));
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les activations:', error);
    return [];
  }
}

/**
 * Récupère les activations pour une formation spécifique
 * @param {string} courseId - ID de la formation
 * @returns {Promise<Array>} - Tableau des activations
 */
export async function getCourseModuleActivations(courseId) {
  try {
    const activations = await getAllWhere(MODULE_ACTIVATION_COLLECTION, 'courseId', '==', courseId);

    // Convertir les Timestamps en Date pour chaque activation
    return activations.map(activation => convertTimestampsToDate(activation));
  } catch (error) {
    console.error(`Erreur lors de la récupération des activations pour le cours ${courseId}:`, error);
    return [];
  }
}

/**
 * Met à jour l'activation d'un module
 * @param {string} moduleId - ID du module
 * @param {Object} updates - Mises à jour à appliquer
 * @returns {Promise<void>}
 */
export async function updateModuleActivation(moduleId, updates) {
  const updateData = {
    ...updates,
    updatedAt: Timestamp.now()
  };

  // Convertir les dates en Timestamp si nécessaire
  if (updates.scheduledActivation && !(updates.scheduledActivation instanceof Timestamp)) {
    updateData.scheduledActivation = Timestamp.fromDate(new Date(updates.scheduledActivation));
  }

  if (updates.scheduledDeactivation && !(updates.scheduledDeactivation instanceof Timestamp)) {
    updateData.scheduledDeactivation = Timestamp.fromDate(new Date(updates.scheduledDeactivation));
  }

  // Mettre à jour activatedAt si on active
  if (updates.isActive === true) {
    updateData.activatedAt = Timestamp.now();
    updateData.deactivatedAt = null;
  }

  // Mettre à jour deactivatedAt si on désactive
  if (updates.isActive === false) {
    updateData.deactivatedAt = Timestamp.now();
  }

  console.log(`🔄 Mise à jour de l'activation du module: ${moduleId}`);
  await updateDocument(MODULE_ACTIVATION_COLLECTION, moduleId, updateData);
}

/**
 * Active un module
 * @param {string} moduleId - ID du module
 * @param {string} activatedBy - Email/UID de l'admin
 * @param {string} reason - Raison de l'activation
 * @returns {Promise<void>}
 */
export async function activateModule(moduleId, activatedBy, reason = '') {
  await updateModuleActivation(moduleId, {
    isActive: true,
    activatedBy,
    activatedAt: Timestamp.now(),
    deactivatedBy: null,
    deactivatedAt: null,
    reason,
    scheduledActivation: null // Annuler l'activation programmée si elle existe
  });

  console.log(`✅ Module activé: ${moduleId} par ${activatedBy}`);
}

/**
 * Désactive un module
 * @param {string} moduleId - ID du module
 * @param {string} deactivatedBy - Email/UID de l'admin
 * @param {string} reason - Raison de la désactivation
 * @returns {Promise<void>}
 */
export async function deactivateModule(moduleId, deactivatedBy, reason = '') {
  await updateModuleActivation(moduleId, {
    isActive: false,
    deactivatedBy,
    deactivatedAt: Timestamp.now(),
    reason,
    scheduledDeactivation: null // Annuler la désactivation programmée si elle existe
  });

  console.log(`🔒 Module désactivé: ${moduleId} par ${deactivatedBy}`);
}

/**
 * Programme l'activation d'un module
 * @param {string} moduleId - ID du module
 * @param {Date} scheduledDate - Date d'activation programmée
 * @param {string} scheduledBy - Email/UID de l'admin
 * @param {string} reason - Raison de l'activation
 * @returns {Promise<void>}
 */
export async function scheduleModuleActivation(moduleId, scheduledDate, scheduledBy, reason = '') {
  await updateModuleActivation(moduleId, {
    scheduledActivation: scheduledDate,
    activatedBy: scheduledBy,
    reason
  });

  const dateStr = scheduledDate.toLocaleString('fr-FR');
  console.log(`📅 Activation programmée: ${moduleId} pour le ${dateStr}`);
}

/**
 * Programme la désactivation d'un module
 * @param {string} moduleId - ID du module
 * @param {Date} scheduledDate - Date de désactivation programmée
 * @param {string} scheduledBy - Email/UID de l'admin
 * @param {string} reason - Raison de la désactivation
 * @returns {Promise<void>}
 */
export async function scheduleModuleDeactivation(moduleId, scheduledDate, scheduledBy, reason = '') {
  await updateModuleActivation(moduleId, {
    scheduledDeactivation: scheduledDate,
    deactivatedBy: scheduledBy,
    reason
  });

  const dateStr = scheduledDate.toLocaleString('fr-FR');
  console.log(`📅 Désactivation programmée: ${moduleId} pour le ${dateStr}`);
}

/**
 * Marque un module comme obsolète (supprimé du code)
 * @param {string} moduleId - ID du module
 * @returns {Promise<void>}
 */
export async function markModuleAsDeprecated(moduleId) {
  await updateModuleActivation(moduleId, {
    isActive: false,
    deprecated: true,
    deactivatedBy: 'system',
    deactivatedAt: Timestamp.now(),
    reason: 'Module supprimé du code source'
  });

  console.log(`⚠️ Module marqué comme obsolète: ${moduleId}`);
}

/**
 * Convertit les Timestamps Firestore en objets Date
 * @param {Object} activation - Objet d'activation
 * @returns {Object} - Objet avec les dates converties
 */
function convertTimestampsToDate(activation) {
  const converted = { ...activation };

  const dateFields = [
    'activatedAt',
    'deactivatedAt',
    'scheduledActivation',
    'scheduledDeactivation',
    'createdAt',
    'updatedAt'
  ];

  dateFields.forEach(field => {
    if (converted[field]) {
      converted[field] = converted[field].toDate ? converted[field].toDate() : converted[field];
    }
  });

  return converted;
}
