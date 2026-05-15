/* ============================================================
   controleurs/alertes.controleur.js — Etape 4
   ------------------------------------------------------------
   Un seul changement par rapport a l'etape 3 : la fonction
   lister() passe maintenant l'objet req.query complet au
   service au lieu d'en extraire seulement "niveau". C'est le
   service (via construireOptions) qui lit et applique tous les
   parametres de filtrage, tri et pagination.

   La seule logique qui reste dans le controleur est la
   validation du parametre ?niveau= : si la valeur n'est pas
   dans l'enum, on retourne 400 immediatement, avant meme
   d'appeler le service. 

   ============================================================ */

const alertesService     = require("../services/alertes.service");
const { repondreErreur } = require("./erreurs");

const { NIVEAUX_AUTORISES } = alertesService;


/* ---- GET /api/alertes -------------------------------------- */

async function lister(req, res) {
  try {
    const { niveau } = req.query;

    if (niveau !== undefined && niveau !== "" && !NIVEAUX_AUTORISES.includes(niveau)) {
      return res.status(400).json({
        message:
          `Le niveau doit etre l'une des valeurs : ${NIVEAUX_AUTORISES.join(", ")}.`
      });
    }

    // On passe req.query en entier. Le service et requete.js
    // s'occupent de lire type, resolue, q, since, until, sort,
    // order, page et limit.
    const resultat = await alertesService.lister(req.query);
    res.status(200).json(resultat);
  } catch (erreur) {
    repondreErreur(res, erreur, "GET /api/alertes");
  }
}


/* ---- GET /api/alertes/:id ---------------------------------- */

async function obtenir(req, res) {
  try {
    const alerte = await alertesService.obtenirParId(req.params.id);
    if (!alerte) {
      return res.status(404).json({ message: "Alerte introuvable." });
    }
    res.status(200).json(alerte);
  } catch (erreur) {
    repondreErreur(res, erreur, "GET /api/alertes/:id");
  }
}


/* ---- POST /api/alertes ------------------------------------- */

async function creer(req, res) {
  try {
    const { source, type, niveau, message } = req.body || {};
    const alerte = await alertesService.creer({ source, type, niveau, message });
    res.status(201).json({ message: "Alerte ajoutee.", alerte });
  } catch (erreur) {
    repondreErreur(res, erreur, "POST /api/alertes");
  }
}


/* ---- PATCH /api/alertes/:id/resolue ----------------------- */

async function resoudre(req, res) {
  try {
    const alerte = await alertesService.resoudre(req.params.id);
    if (!alerte) {
      return res.status(404).json({ message: "Alerte introuvable." });
    }
    res.status(200).json(alerte);
  } catch (erreur) {
    repondreErreur(res, erreur, "PATCH /api/alertes/:id/resolue");
  }
}


/* ---- DELETE /api/alertes/:id ------------------------------ */

async function supprimer(req, res) {
  try {
    const alerte = await alertesService.supprimer(req.params.id);
    if (!alerte) {
      return res.status(404).json({ message: "Alerte introuvable." });
    }
    res.status(200).json({ message: "Alerte supprimee.", id: alerte._id.toString() });
  } catch (erreur) {
    repondreErreur(res, erreur, "DELETE /api/alertes/:id");
  }
}


module.exports = { lister, obtenir, creer, resoudre, supprimer };
