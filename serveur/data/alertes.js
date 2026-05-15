/* ============================================================
   data/alertes.js — Données en mémoire (TP 1)
   ============================================================ */


/* ------------------------------------------------------------
   1) Constantes du domaine
   ------------------------------------------------------------ */

const NIVEAUX_AUTORISES = ["info", "avertissement", "critique"];


/* ------------------------------------------------------------
   2) Tableau en mémoire et compteur d'id
   ------------------------------------------------------------ */

let prochainId = 4;

const alertes = [
  {
    id:         1,
    source:     "Serveur web-01",
    type:       "cpu",
    niveau:     "critique",
    message:    "Utilisation CPU à 95 %",
    horodatage: new Date().toISOString(),
    resolue:    false
  },
  {
    id:         2,
    source:     "Routeur principal",
    type:       "reseau",
    niveau:     "avertissement",
    message:    "Latence élevée sur le lien WAN",
    horodatage: new Date().toISOString(),
    resolue:    false
  },
  {
    id:         3,
    source:     "Serveur web-02",
    type:       "disque",
    niveau:     "info",
    message:    "Sauvegarde quotidienne terminée",
    horodatage: new Date().toISOString(),
    resolue:    true
  }
];


/* ------------------------------------------------------------
   3) Helpers d'accès au tableau
   ------------------------------------------------------------ */

function lister(niveau) {
  if (niveau) {
    return alertes.filter((a) => a.niveau === niveau);
  }
  return alertes;
}

function trouverParId(id) {
  return alertes.find((a) => a.id === id);
}

function ajouter({ source, type, niveau, message }) {
  const nouvelle = {
    id:         prochainId++,
    source:     source.trim(),
    type:       type.trim(),
    niveau,
    message:    message.trim(),
    horodatage: new Date().toISOString(),
    resolue:    false
  };
  alertes.push(nouvelle);
  return nouvelle;
}

function resoudre(id) {
  const a = trouverParId(id);
  if (!a) return null;
  if (a.resolue) return { dejaResolue: true };
  a.resolue = true;
  return a;
}

function supprimer(id) {
  const index = alertes.findIndex((a) => a.id === id);
  if (index === -1) return false;
  alertes.splice(index, 1);
  return true;
}


/* ------------------------------------------------------------
   4) Exports
   ------------------------------------------------------------ */

module.exports = {
  NIVEAUX_AUTORISES,
  lister,
  trouverParId,
  ajouter,
  resoudre,
  supprimer
};
