/* ============================================================
   services/alertes.service.js — Etape 4 : filtres et pagination
   ------------------------------------------------------------
   lister() est completement reecrite. Elle utilise desormais
   construireOptions() pour appliquer tous les filtres, la
   recherche, le tri et la pagination, puis retourne l'enveloppe
   paginee { donnees, total, page, limit, pages }.

   Parametres acceptes par lister() :
     niveau  : filtre exact (valide par le controleur avant d'arriver ici)
     type    : filtre exact (normalise en minuscules)
     resolue : "true" | "false" -> converti en booleen
     q       : recherche regex insensible a la casse sur message
     since   : date ISO -> horodatage >= since
     until   : date ISO -> horodatage <= until
     sort    : horodatage | niveau | createdAt  (defaut: horodatage)
     order   : asc | desc  (defaut: desc)
     page    : entier >= 1  (defaut: 1)
     limit   : entier 1..100  (defaut: 10)

   ============================================================ */

const Alerte = require("../modeles/Alerte");
const { construireOptions, enveloppePaginee } = require("./requete");

const NIVEAUX_AUTORISES = ["info", "avertissement", "critique"];


/* ---- GET /api/alertes (avec filtres et pagination) --------- */

async function lister(query = {}) {

  // Normaliser le type en minuscules si present, pour que le
  // filtre correspond au schema (qui stocke type en lowercase).
  const queryNormalisee = { ...query };
  if (queryNormalisee.type) {
    queryNormalisee.type = queryNormalisee.type.toLowerCase();
  }

  const { filtre, tri, page, limit, skip } = construireOptions(queryNormalisee, {
    champsFiltrables: ["type", "niveau"],  // filtres exacts
    champsRecherche:  ["message"],         // recherche ?q=
    champDate:        "horodatage",        // plage ?since= ?until=
    triParDefaut:     "horodatage",
    ordreParDefaut:   "desc",
    limitParDefaut:   10                   // 10 par defaut
  });

  // Le champ resolue est booleen : il faut convertir la chaine
  // "true"/"false" manuellement, car construireOptions fait des
  // filtres exacts sur des chaines.
  if (query.resolue === "true") {
    filtre.resolue = true;
  } else if (query.resolue === "false") {
    filtre.resolue = false;
  }

  // Deux requetes en parallele : les donnees et le total.
  // Promise.all les lance simultanement, ce qui est plus rapide
  // que de les executer l'une apres l'autre.
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
  resoudre,
  supprimer
};
