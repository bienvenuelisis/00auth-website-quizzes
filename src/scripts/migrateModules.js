/**
 * Script de migration pour initialiser les activations de modules dans Firestore
 * À exécuter une seule fois pour créer les documents d'activation pour tous les modules existants
 */

import { MODULES_DATA } from '../data/modules';
import { createModuleActivation, getModuleActivation } from '../services/firebase/firestore/moduleActivation';

/**
 * Migre tous les modules vers Firestore avec leur état d'activation par défaut
 */
export async function migrateAllModules() {
  console.log('🔄 Début de la migration des modules vers Firestore...');
  console.log(`📊 Nombre de modules à migrer: ${MODULES_DATA.length}`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const module of MODULES_DATA) {
    try {
      // Vérifier si le module existe déjà
      const existing = await getModuleActivation(module.id);

      if (existing) {
        console.log(`⏭️  Module "${module.title}" déjà existant, ignoré`);
        skipped++;
        continue;
      }

      // Créer l'activation
      // Premier module de chaque formation = actif par défaut
      // Autres modules = inactifs par défaut
      const isActive = module.isFirst || false;

      await createModuleActivation({
        moduleId: module.id,
        courseId: module.courseId,
        isActive,
        activatedBy: 'migration-script',
        reason: isActive
          ? 'Module initial - Actif par défaut lors de la migration'
          : 'Inactif par défaut - En attente d\'activation manuelle'
      });

      console.log(`✅ Module "${module.title}" créé (${isActive ? 'actif' : 'inactif'})`);
      created++;
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de "${module.title}":`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📈 Résumé de la migration:');
  console.log(`  ✅ Créés: ${created}`);
  console.log(`  ⏭️  Ignorés (déjà existants): ${skipped}`);
  console.log(`  ❌ Erreurs: ${errors}`);
  console.log(`  📊 Total: ${MODULES_DATA.length}`);
  console.log('='.repeat(60));

  if (errors > 0) {
    throw new Error(`Migration terminée avec ${errors} erreur(s)`);
  }

  console.log('✅ Migration terminée avec succès !');

  return {
    created,
    skipped,
    errors,
    total: MODULES_DATA.length
  };
}

/**
 * Migre uniquement les modules d'une formation spécifique
 * @param {string} courseId - ID de la formation
 */
export async function migrateCourseModules(courseId) {
  console.log(`🔄 Migration des modules de la formation: ${courseId}`);

  const courseModules = MODULES_DATA.filter(m => m.courseId === courseId);
  console.log(`📊 Nombre de modules à migrer: ${courseModules.length}`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const module of courseModules) {
    try {
      const existing = await getModuleActivation(module.id);

      if (existing) {
        console.log(`⏭️  Module "${module.title}" déjà existant, ignoré`);
        skipped++;
        continue;
      }

      const isActive = module.isFirst || false;

      await createModuleActivation({
        moduleId: module.id,
        courseId: module.courseId,
        isActive,
        activatedBy: 'migration-script',
        reason: isActive
          ? 'Module initial - Actif par défaut'
          : 'Inactif - En attente d\'activation'
      });

      console.log(`✅ Module "${module.title}" créé (${isActive ? 'actif' : 'inactif'})`);
      created++;
    } catch (error) {
      console.error(`❌ Erreur lors de la migration de "${module.title}":`, error);
      errors++;
    }
  }

  console.log(`\n📈 Résumé: ${created} créés, ${skipped} ignorés, ${errors} erreurs`);

  return { created, skipped, errors, total: courseModules.length };
}

/**
 * Fonction helper pour exécuter la migration depuis la console du navigateur
 * Usage: await window.migrateModules()
 */
if (typeof window !== 'undefined') {
  window.migrateModules = migrateAllModules;
  window.migrateCourseModules = migrateCourseModules;
  console.log('💡 Migration helpers disponibles:');
  console.log('  - window.migrateModules() : Migrer tous les modules');
  console.log('  - window.migrateCourseModules(courseId) : Migrer une formation spécifique');
}
