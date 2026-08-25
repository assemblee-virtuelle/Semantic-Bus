'use strict';

// Backfill des composants orphelins (sans workspaceId) — SB-IDOR-2026-01.
//
// Contexte : le fix de assertComponentInWorkspace est fail-closed — un composant
// sans workspaceId n'est plus éditable/destructible par personne (même son
// propriétaire légitime) tant qu'il n'a pas de workspaceId. Ce script doit donc
// tourner AVANT ou EN MÊME TEMPS que le déploiement du code corrigé, pour que les
// flux PUT/DELETE légitimes continuent de fonctionner.
//
// ⚠️ MIGRATION ONE-SHOT — PLUS NÉCESSAIRE À PARTIR DE v0.11.16.
// Depuis v0.11.16 : le fail-closed + l'estampillage de workspaceId sur le chemin
// embedded de POST /workspaces/ garantissent qu'aucun nouveau composant sans
// workspaceId ne peut être créé. Ce script n'est donc utile que pour les instances
// qui ont des orphelins pré-existants (créés avant v0.11.16) : il suffit de l'exécuter
// une fois au déploiement de v0.11.16. Idempotent — sans danger de le relancer,
// mais sur une instance déjà ≥ v0.11.16 il n'aura plus rien à faire.
//
// Principe : pour chaque composant sans workspaceId, on cherche le workspace qui le
// référence dans sa liste `workspace.components` et on estampe workspaceId = workspace._id.
// Les composants non retrouvés (vraiment orphelins) sont listés à la fin pour contrôle
// manuel — ils resteront non-éditables/destructibles tant qu'ils n'ont pas de workspaceId.
//
// Usage :
//   node -e "require('./packages/main/scripts/backfillOrphanComponents').work()"
// (à exécuter depuis la racine du repo, config.json chargé via getConfiguration)

module.exports = {
  workspaceComponent_model: require('@semantic-bus/core/models').workspaceComponent,
  workspace_model: require('@semantic-bus/core/models').workspace,

  work: async function() {
    console.log('--- Backfill composants orphelins (sans workspaceId) ---');

    const orphans = await this.workspaceComponent_model.getInstance().model
      .find({ $or: [{ workspaceId: null }, { workspaceId: { $exists: false } }] })
      .lean()
      .exec();

    console.log(`Composants sans workspaceId trouvés : ${orphans.length}`);
    if (orphans.length === 0) {
      console.log('Rien à faire.');
      return;
    }

    const orphanIds = orphans.map(o => o._id);
    const workspaces = await this.workspace_model.getInstance().model
      .find({ components: { $in: orphanIds } })
      .select('_id components')
      .lean()
      .exec();

    // id composant -> workspace._id
    const componentToWorkspace = {};
    for (const ws of workspaces) {
      for (const compId of ws.components) {
        componentToWorkspace[compId.toString()] = ws._id;
      }
    }

    let updated = 0;
    const unresolved = [];
    for (const comp of orphans) {
      const workspaceId = componentToWorkspace[comp._id.toString()];
      if (!workspaceId) {
        unresolved.push(comp._id);
        continue;
      }
      await this.workspaceComponent_model.getInstance().model.updateOne(
        { _id: comp._id },
        { $set: { workspaceId: workspaceId.toString() } }
      ).exec();
      updated++;
    }

    console.log(`Composants backfillés (workspaceId estampé) : ${updated}`);
    if (unresolved.length > 0) {
      console.log(`\n⚠️  ${unresolved.length} composant(s) NON retrouvé(s) dans la liste components d'aucun workspace :`);
      console.log(unresolved.map(id => id.toString()).join('\n'));
      console.log('\nIls resteront non-éditables/destructibles tant qu\'un workspaceId ne leur est pas attribué manuellement.');
    }
    console.log('--- Backfill terminé ---');
  }
};
