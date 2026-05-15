/* ============================================================
   services/alertes.service.js — Etape 2 : migration vers Mongoose
   ------------------------------------------------------------
   Le tableau en memoire est abandonne. Toutes les operations
   utilisent desormais le modele Mongoose Alerte.

   Changements importants :
     - Les identifiants sont maintenant des ObjectId MongoDB, pas
       des entiers. Le controleur passera req.params.id tel quel
       et Mongoose lancera une CastError si l'id est mal forme.
     - resoudre() lance une erreur nommee "DejaResolue" au lieu
       de retourner { dejaResolue: true }. Le controleur capte
       cette erreur et repond 400. 
     - resolueAt est mis a new Date() lors de la resolution.
     - lister() accepte maintenant l'objet query complet. Pour
       l'instant, seul le filtre ?niveau= est gere. 
   ============================================================ */

const Alerte = require("../modeles/Alerte");

const NIVEAUX_AUTORISES = ["info", "avertissement", "critique"];


/* ---- GET /api/alertes -------------------------------------- */

async function lister(query = {}) {
  const { niveau } = query;

  const filtre = {};
  if (niveau) filtre.niveau = niveau;

  // L'interface attend toujours une enveloppe paginee :
  //   { donnees, total, page, limit, pages }
  // On retourne donc cette structure des maintenant, meme sans
  // vraie pagination. 
  const donnees = await Alerte.find(filtre).sort({ horodatage: -1 });
  return {
    donnees,
    total:  donnees.length,
    page:   1,
    limit:  donnees.length || 10,
    pages:  1
  };
}


/* ---- GET /api/alertes/:id ---------------------------------- */

async function obtenirParId(id) {
  // findById lance une CastError si id n'est pas un ObjectId valide.
  // Le controleur attrape cette erreur et repond 400.
  return Alerte.findById(id);
}


/* ---- POST /api/alertes ------------------------------------- */

async function creer({ source, type, niveau, message }) {
  // Mongoose valide les champs et lance une ValidationError si
  // quelque chose ne respecte pas le schema.
  // On passe seulement les quatre champs du client, horodatage,
  // resolue, resolueAt, createdAt et updatedAt sont generes par
  // le schema.
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
  // Retourne le document supprime, ou null si introuvable.
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
