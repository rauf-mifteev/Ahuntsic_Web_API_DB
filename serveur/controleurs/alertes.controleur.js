/* ============================================================
   controleurs/alertes.controleur.js — Etape 1
   ============================================================ */

const alertesService = require("../services/alertes.service");
const { repondreErreur } = require("./erreurs");

const { NIVEAUX_AUTORISES } = alertesService;


/* ---- Utilitaire local --------------------------------------- */

function estChaineNonVide(valeur) {
  return typeof valeur === "string" && valeur.trim() !== "";
}


/* ---- GET /api/alertes -------------------------------------- */

async function lister(req, res) {
  try {
    const { niveau } = req.query;

    if (niveau !== undefined && !NIVEAUX_AUTORISES.includes(niveau)) {
      return res.status(400).json({
        message:
          `Le niveau doit etre l'une des valeurs : ${NIVEAUX_AUTORISES.join(", ")}.`
      });
    }

    const alertes = await alertesService.lister(niveau);
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

    if (!estChaineNonVide(source)) {
      return res.status(400).json({ message: "Le champ source est obligatoire." });
    }
    if (!estChaineNonVide(type)) {
      return res.status(400).json({ message: "Le champ type est obligatoire." });
    }
    if (!estChaineNonVide(niveau)) {
      return res.status(400).json({ message: "Le champ niveau est obligatoire." });
    }
    if (!NIVEAUX_AUTORISES.includes(niveau)) {
      return res.status(400).json({
        message:
          `Le niveau doit etre l'une des valeurs : ${NIVEAUX_AUTORISES.join(", ")}.`
      });
    }
    if (!estChaineNonVide(message)) {
      return res.status(400).json({ message: "Le champ message est obligatoire." });
    }

    const alerte = await alertesService.creer({ source, type, niveau, message });
    res.status(201).json({ message: "Alerte ajoutee.", alerte });
  } catch (erreur) {
    repondreErreur(res, erreur, "POST /api/alertes");
  }
}


/* ---- PATCH /api/alertes/:id/resolue ----------------------- */

async function resoudre(req, res) {
  try {
    const resultat = await alertesService.resoudre(req.params.id);

    if (resultat === null) {
      return res.status(404).json({ message: "Alerte introuvable." });
    }
    if (resultat.dejaResolue) {
      return res.status(400).json({ message: "Cette alerte est deja resolue." });
    }

    res.status(200).json(resultat);
  } catch (erreur) {
    repondreErreur(res, erreur, "PATCH /api/alertes/:id/resolue");
  }
}


/* ---- DELETE /api/alertes/:id ------------------------------ */

async function supprimer(req, res) {
  try {
    const supprime = await alertesService.supprimer(req.params.id);
    if (!supprime) {
      return res.status(404).json({ message: "Alerte introuvable." });
    }
    res.status(200).json({ message: "Alerte supprimee.", id: req.params.id });
  } catch (erreur) {
    repondreErreur(res, erreur, "DELETE /api/alertes/:id");
  }
}


module.exports = { lister, obtenir, creer, resoudre, supprimer };
