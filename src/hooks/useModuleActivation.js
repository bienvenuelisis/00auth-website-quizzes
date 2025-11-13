/**
 * Hook pour gérer l'activation des modules
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getModuleActivation,
  createModuleActivation,
  getAllModuleActivations,
  getCourseModuleActivations
} from '../services/firebase/firestore/moduleActivation';
import { isModuleCurrentlyActive, getModuleActivationStatus } from '../models/moduleActivation';
import { getModuleById } from '../data/modules';

/**
 * Hook pour charger et vérifier l'activation d'un module
 * @param {string} moduleId - ID du module
 * @returns {Object} - { activation, isActive, status, loading, error, refresh }
 */
export function useModuleActivation(moduleId) {
  const [activation, setActivation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivation = useCallback(async () => {
    if (!moduleId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Charger l'activation depuis Firestore
      let activationData = await getModuleActivation(moduleId);

      // Si n'existe pas, créer avec l'état par défaut
      if (!activationData) {
        const module = getModuleById(moduleId);

        if (!module) {
          throw new Error(`Module ${moduleId} introuvable dans les données`);
        }

        console.log(`⚠️ Activation non trouvée pour ${moduleId}, création avec état par défaut`);

        // Créer l'activation (premier module = actif par défaut)
        const isActive = module.isFirst || false;
        await createModuleActivation({
          moduleId: module.id,
          courseId: module.courseId,
          isActive,
          activatedBy: 'system',
          reason: isActive
            ? 'Module initial de la formation - Activé automatiquement'
            : 'En attente d\'activation par un administrateur'
        });

        // Recharger
        activationData = await getModuleActivation(moduleId);
      }

      setActivation(activationData);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'activation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadActivation();
  }, [loadActivation]);

  // Calculer l'état actif
  const isActive = activation ? isModuleCurrentlyActive(activation) : false;

  // Obtenir le statut pour l'affichage
  const status = activation ? getModuleActivationStatus(activation) : null;

  return {
    activation,
    isActive,
    status,
    loading,
    error,
    refresh: loadActivation
  };
}

/**
 * Hook pour charger toutes les activations de modules
 * @returns {Object} - { activations, loading, error, refresh }
 */
export function useAllModuleActivations() {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllModuleActivations();
      setActivations(data);
    } catch (err) {
      console.error('Erreur lors du chargement des activations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivations();
  }, [loadActivations]);

  return {
    activations,
    loading,
    error,
    refresh: loadActivations
  };
}

/**
 * Hook pour charger les activations d'une formation
 * @param {string} courseId - ID de la formation
 * @returns {Object} - { activations, loading, error, refresh }
 */
export function useCourseModuleActivations(courseId) {
  const [activations, setActivations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivations = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getCourseModuleActivations(courseId);
      setActivations(data);
    } catch (err) {
      console.error('Erreur lors du chargement des activations du cours:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadActivations();
  }, [loadActivations]);

  return {
    activations,
    loading,
    error,
    refresh: loadActivations
  };
}

/**
 * Hook pour combiner les données d'un module avec son activation
 * @param {string} moduleId - ID du module
 * @returns {Object} - { module, activation, isAccessible, loading }
 */
export function useModuleWithActivation(moduleId) {
  const module = getModuleById(moduleId);
  const { activation, isActive, status, loading } = useModuleActivation(moduleId);

  return {
    module,
    activation,
    isActive,
    status,
    loading,
    // Helper pour savoir si le module est accessible (activation + autres conditions seront ajoutées)
    isAccessible: isActive
  };
}
