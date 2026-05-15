/* ============================================================
   controleurs/erreurs.js — Etape 1 : version de base
   ============================================================ */

function repondreErreur(res, erreur, contexte) {
  console.error(`Erreur ${contexte} :`, erreur);
  return res.status(500).json({ message: "Erreur serveur." });
}

module.exports = { repondreErreur };
