/* ============================================================
   controleurs/alertes.controleur.js — Etape 2
   ------------------------------------------------------------
   Deux changements importants par rapport a l'etape 1 :

     1. La validation manuelle du POST est supprimee. Mongoose
        la fait via le schema. En cas d'erreur, il lance 
	une ValidationError que l'on traduit en 400.

     2. Chaque fonction gere les erreurs Mongoose directement
        dans son bloc catch. 
   ============================================================ */

const alertesService = require("../services/alertes.service");
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
    // CastError : l'id fourni n'est pas un ObjectId valide -> 400
    if (erreur.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide." });
    }
    repondreErreur(res, erreur, "GET /api/alertes/:id");
  }
}


/* ---- POST /api/alertes ------------------------------------- */

async function creer(req, res) {
  try {
    const { source, type, niveau, message } = req.body || {};
    // On ne passe que les quatre champs du client. 
    const alerte = await alertesService.creer({ source, type, niveau, message });
    res.status(201).json({ message: "Alerte ajoutee.", alerte });
  } catch (erreur) {
    // ValidationError : un ou plusieurs champs violent le schema
    if (erreur.name === "ValidationError") {
      const messages = Object.values(erreur.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(" ") });
    }
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
    if (erreur.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide." });
    }
    if (erreur.name === "DejaResolue") {
      return res.status(400).json({ message: erreur.message });
    }
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
    if (erreur.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide." });
    }
    repondreErreur(res, erreur, "DELETE /api/alertes/:id");
  }
}


module.exports = { lister, obtenir, creer, resoudre, supprimer };
