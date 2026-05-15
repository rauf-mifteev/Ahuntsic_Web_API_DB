/* ============================================================
   services/alertes.service.js — Etape 1 : enveloppe du tableau
   ------------------------------------------------------------
   Ce fichier introduit la couche service. Pour l'instant, il
   ne fait qu'envelopper les fonctions de data/alertes.js dans
   des fonctions async. 
   ============================================================ */

const data = require("../data/alertes");

/* Exporte la liste des niveaux valides pour que le controleur
   puisse la lire sans importer directement data/alertes.js.    */
const NIVEAUX_AUTORISES = data.NIVEAUX_AUTORISES;


/* Retourne toutes les alertes, filtrees par niveau si fourni.  */
async function lister(niveau) {
  return data.lister(niveau);
}


/* Retourne une alerte par son identifiant numerique, ou null.  */
async function obtenirParId(id) {
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum) || idNum < 1) return null;
  return data.trouverParId(idNum) || null;
}


/* Cree une nouvelle alerte et la retourne.                     */
async function creer({ source, type, niveau, message }) {
  return data.ajouter({ source, type, niveau, message });
}


/* Marque une alerte comme resolue.
   Retourne null si introuvable.
   Retourne { dejaResolue: true } si deja resolue.              */
async function resoudre(id) {
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum) || idNum < 1) return null;
  return data.resoudre(idNum);
}


/* Supprime une alerte. Retourne true si supprimee, false sinon.*/
async function supprimer(id) {
  const idNum = parseInt(id, 10);
  if (Number.isNaN(idNum) || idNum < 1) return false;
  return data.supprimer(idNum);
}


module.exports = {
  NIVEAUX_AUTORISES,
  lister,
  obtenirParId,
  creer,
  resoudre,
  supprimer
};
