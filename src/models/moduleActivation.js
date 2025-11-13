/**
 * Modèle pour la gestion de l'activation des modules de quiz
 */

/**
 * Crée un objet d'activation de module vide
 * @param {string} moduleId - ID du module
 * @param {string} courseId - ID de la formation
 * @returns {Object} - Objet d'activation du module
 */
export function createModuleActivation(moduleId, courseId) {
  return {
    moduleId,
    courseId,
    isActive: false,
    activatedBy: null,
    activatedAt: null,
    deactivatedBy: null,
    deactivatedAt: null,
    reason: '',
    scheduledActivation: null,
    scheduledDeactivation: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

/**
 * Valide un objet d'activation de module
 * @param {Object} activation - Objet d'activation à valider
 * @returns {boolean} - True si valide
 */
export function validateModuleActivation(activation) {
  if (!activation.moduleId || typeof activation.moduleId !== 'string') {
    return false;
  }

  if (!activation.courseId || typeof activation.courseId !== 'string') {
    return false;
  }

  if (typeof activation.isActive !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Vérifie si un module est actuellement actif
 * @param {Object} activation - Objet d'activation du module
 * @returns {boolean} - True si le module est actif
 */
export function isModuleCurrentlyActive(activation) {
  if (!activation) return false;

  const now = new Date();

  // Vérifier l'état d'activation de base
  if (!activation.isActive) return false;

  // Vérifier l'activation programmée
  if (activation.scheduledActivation) {
    const scheduledDate = activation.scheduledActivation instanceof Date
      ? activation.scheduledActivation
      : activation.scheduledActivation.toDate();

    if (now < scheduledDate) return false;
  }

  // Vérifier la désactivation programmée
  if (activation.scheduledDeactivation) {
    const deactivationDate = activation.scheduledDeactivation instanceof Date
      ? activation.scheduledDeactivation
      : activation.scheduledDeactivation.toDate();

    if (now >= deactivationDate) return false;
  }

  return true;
}

/**
 * Obtient le message de statut pour l'utilisateur
 * @param {Object} activation - Objet d'activation du module
 * @returns {Object} - { status: string, message: string, icon: string }
 */
export function getModuleActivationStatus(activation) {
  if (!activation) {
    return {
      status: 'unknown',
      message: 'Statut inconnu',
      icon: '❓'
    };
  }

  const now = new Date();

  // Module désactivé
  if (!activation.isActive) {
    return {
      status: 'inactive',
      message: activation.reason || 'Ce module est temporairement indisponible',
      icon: '🔒'
    };
  }

  // Activation programmée (pas encore active)
  if (activation.scheduledActivation) {
    const scheduledDate = activation.scheduledActivation instanceof Date
      ? activation.scheduledActivation
      : activation.scheduledActivation.toDate();

    if (now < scheduledDate) {
      const dateStr = scheduledDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        status: 'scheduled',
        message: `Ce module sera disponible le ${dateStr}`,
        icon: '📅'
      };
    }
  }

  // Désactivation programmée (encore active mais bientôt désactivé)
  if (activation.scheduledDeactivation) {
    const deactivationDate = activation.scheduledDeactivation instanceof Date
      ? activation.scheduledDeactivation
      : activation.scheduledDeactivation.toDate();

    if (now >= deactivationDate) {
      return {
        status: 'expired',
        message: 'Ce module n\'est plus disponible',
        icon: '⏰'
      };
    }

    // Avertissement si désactivation dans moins de 7 jours
    const daysUntilDeactivation = Math.ceil((deactivationDate - now) / (1000 * 60 * 60 * 24));
    if (daysUntilDeactivation <= 7) {
      return {
        status: 'expiring-soon',
        message: `Ce module sera désactivé dans ${daysUntilDeactivation} jour${daysUntilDeactivation > 1 ? 's' : ''}`,
        icon: '⚠️'
      };
    }
  }

  // Module actif
  return {
    status: 'active',
    message: 'Module disponible',
    icon: '✅'
  };
}
