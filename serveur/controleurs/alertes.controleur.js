/* ============================================================
   controleurs/alertes.controleur.js — Etape 5 : ajout de remplacer()
   ------------------------------------------------------------
   Une seule fonction ajoutee : remplacer(), appelee par PUT /:id.

   Le corps attendu est identique a celui d'un POST :
     { source, type, niveau, message }

   Les champs serveur (id, horodatage, resolue, resolueAt,
   createdAt, updatedAt) sont ignores meme si le client les
   envoie : on ne destructure que les quatre champs du client.

   Les erreurs possibles sont les memes que pour POST :
     ValidationError -> 400 (gere par repondreErreur)
     CastError       -> 400 (id mal forme)
     null retourne par le service -> 404 (alerte introuvable)
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


/* ---- PUT /api/alertes/:id ---------------------------------- */

async function remplacer(req, res) {
  try {
    const { source, type, niveau, message } = req.body || {};
    const alerte = await alertesService.remplacer(req.params.id, {
      source, type, niveau, message
    });
    if (!alerte) {
      return res.status(404).json({ message: "Alerte introuvable." });
    }
    res.status(200).json({ message: "Alerte remplacee.", alerte });
  } catch (erreur) {
    repondreErreur(res, erreur, "PUT /api/alertes/:id");
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


module.exports = { lister, obtenir, creer, remplacer, resoudre, supprimer };
