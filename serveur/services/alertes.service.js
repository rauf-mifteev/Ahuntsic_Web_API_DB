/* ============================================================
   services/alertes.service.js — Etape 5 : ajout de remplacer()
   ------------------------------------------------------------
   Une seule fonction ajoutee : remplacer(), utilisee par PUT.

   findByIdAndUpdate avec les options :
     new: true          -> retourne le document APRES la mise a jour
     runValidators: true -> execute les validateurs du schema
     overwrite: true    -> remplace le document en entier (PUT)
                           sans cette option, Mongoose ferait un
                           $set partiel (comportement PATCH)

   On ne passe que source, type, niveau et message. 
   Les champs horodatage, resolue, resolueAt, createdAt
   et updatedAt ne sont jamais acceptes du client.
   ============================================================ */

const Alerte = require("../modeles/Alerte");
const { construireOptions, enveloppePaginee } = require("./requete");

const NIVEAUX_AUTORISES = ["info", "avertissement", "critique"];


/* ---- GET /api/alertes -------------------------------------- */

async function lister(query = {}) {
  const queryNormalisee = { ...query };
  if (queryNormalisee.type) {
    queryNormalisee.type = queryNormalisee.type.toLowerCase();
  }

  const { filtre, tri, page, limit, skip } = construireOptions(queryNormalisee, {
    champsFiltrables: ["type", "niveau"],
    champsRecherche:  ["message"],
    champDate:        "horodatage",
    triParDefaut:     "horodatage",
    ordreParDefaut:   "desc",
    limitParDefaut:   10
  });

  if (query.resolue === "true") {
    filtre.resolue = true;
  } else if (query.resolue === "false") {
    filtre.resolue = false;
  }

  const [donnees, total] = await Promise.all([
    Alerte.find(filtre).sort(tri).skip(skip).limit(limit),
    Alerte.countDocuments(filtre)
  ]);

  return enveloppePaginee(donnees, total, page, limit);
}


/* ---- GET /api/alertes/:id ---------------------------------- */

async function obtenirParId(id) {
  return Alerte.findById(id);
}


/* ---- POST /api/alertes ------------------------------------- */

async function creer({ source, type, niveau, message }) {
  return Alerte.create({ source, type, niveau, message });
}


/* ---- PUT /api/alertes/:id ---------------------------------- */

async function remplacer(id, { source, type, niveau, message }) {
  // overwrite: true garantit un remplacement complet du document.
  // Sans cette option, Mongoose ferait un $set partiel et les
  // champs absents du corps resteraient inchanges (comportement PATCH).
  return Alerte.findByIdAndUpdate(
    id,
    { source, type, niveau, message },
    { new: true, runValidators: true, overwrite: true }
  );
}


/* ---- PATCH /api/alertes/:id/resolue ----------------------- */

async function resoudre(id) {
  const alerte = await Alerte.findById(id);

  if (!alerte) return null;

  if (alerte.resolue) {
    const e = new Error("Cette alerte est deja resolue.");
    e.name = "DejaResolue";
    throw e;
  }

  alerte.resolue   = true;
  alerte.resolueAt = new Date();
  await alerte.save();

  return alerte;
}


/* ---- DELETE /api/alertes/:id ------------------------------ */

async function supprimer(id) {
  return Alerte.findByIdAndDelete(id);
}


module.exports = {
  NIVEAUX_AUTORISES,
  lister,
  obtenirParId,
  creer,
  remplacer,
  resoudre,
  supprimer
};
