/* ============================================================
   controleurs/alertes.controleur.js — Etape 3
   ------------------------------------------------------------
   Maintenant que erreurs.js est complet, tous les blocs catch
   deleguent a repondreErreur. Le controleur reste concentre
   sur sa seule responsabilite : lire req, appeler le service,
   ecrire res.
   ============================================================ */

const alertesService  = require("../services/alertes.service");
const { repondreErreur } = require("./erreurs");

const { NIVEAUX_AUTORISES } = alertesService;


/* ---- GET /api/alertes -------------------------------------- */

async function lister(req, res) {
  try {
    const { niveau } = req.query;

    // Validation metier specifique : le parametre niveau doit
    // appartenir a l'enum. Ce n'est pas une CastError ni une
    // ValidationError Mongoose, c'est une validation de parametre
    // de requete -> on la gere directement dans le controleur.
    if (niveau !== undefined && niveau !== "" && !NIVEAUX_AUTORISES.includes(niveau)) {
      return res.status(400).json({
        message:
          `Le niveau doit etre l'une des valeurs : ${NIVEAUX_AUTORISES.join(", ")}.`
      });
    }

    const alertes = await alertesService.lister(req.query);
    res.status(200).json(alertes);
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
