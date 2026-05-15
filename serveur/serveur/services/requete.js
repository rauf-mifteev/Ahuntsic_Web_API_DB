/* ============================================================
   services/requete.js
   ------------------------------------------------------------
   Utilitaire partage par tous les services qui ont besoin de
   filtres, de tri et de pagination. 

   Il offre deux fonctions :

     construireOptions(query, options)
       Transforme req.query en { filtre, tri, page, limit, skip }
       utilisables directement par Mongoose.

     enveloppePaginee(donnees, total, page, limit)
       Construit la reponse standard :
         { donnees, total, page, limit, pages }
   ============================================================ */


/* Convertit une chaine en entier positif borne entre min et max.
   Retourne `defaut` si la valeur est absente ou non numerique.  */
function entierBorne(valeur, defaut, min, max) {
  const n = parseInt(valeur, 10);
  if (Number.isNaN(n)) return defaut;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}


/**
 * Construit filtre, tri et pagination a partir de req.query.
 *
 * Parametres de query reconnus :
 *   Filtres exacts     : couples (cle, valeur) listes dans champsFiltrables.
 *   Recherche regex    : ?q=...  sur les champs de champsRecherche.
 *   Plage de dates     : ?since=ISO  ?until=ISO  sur le champ champDate.
 *   Tri                : ?sort=champ  ?order=asc|desc
 *   Pagination         : ?page=N (>=1)   ?limit=N (1..100)
 *
 * Retourne { filtre, tri, page, limit, skip }.
 */
function construireOptions(query, options = {}) {
  const {
    champsFiltrables = [],
    champsRecherche  = [],
    champDate        = null,
    triParDefaut     = "createdAt",
    ordreParDefaut   = "desc",
    limitParDefaut   = 20
  } = options;

  // --- 1. Filtre ---
  const filtre = {};

  for (const champ of champsFiltrables) {
    if (query[champ] !== undefined && query[champ] !== "") {
      filtre[champ] = query[champ];
    }
  }

  // Recherche textuelle insensible a la casse
  if (query.q && query.q.trim() !== "") {
    const motif = query.q.trim();
    filtre.$or = champsRecherche.map((c) => ({
      [c]: { $regex: motif, $options: "i" }
    }));
  }

  // Plage de dates
  if (champDate && (query.since || query.until)) {
    filtre[champDate] = {};
    if (query.since) {
      const d = new Date(query.since);
      if (!Number.isNaN(d.getTime())) filtre[champDate].$gte = d;
    }
    if (query.until) {
      const d = new Date(query.until);
      if (!Number.isNaN(d.getTime())) filtre[champDate].$lte = d;
    }
    if (Object.keys(filtre[champDate]).length === 0) {
      delete filtre[champDate];
    }
  }

  // --- 2. Tri ---
  const sortChamp = (query.sort  || triParDefaut).trim();
  const sortOrdre = (query.order || ordreParDefaut).toLowerCase() === "asc" ? 1 : -1;
  const tri = { [sortChamp]: sortOrdre };

  // --- 3. Pagination ---
  const page  = entierBorne(query.page,  1,             1, 10000);
  const limit = entierBorne(query.limit, limitParDefaut, 1, 100);
  const skip  = (page - 1) * limit;

  return { filtre, tri, page, limit, skip };
}


/**
 * Construit la reponse paginee enrichie.
 *
 *   {
 *     donnees : [...],   // les documents de la page
 *     total   : N,       // total qui matchent le filtre
 *     page    : P,       // page courante
 *     limit   : L,       // taille de page demandee
 *     pages   : T        // nombre total de pages
 *   }
 */
function enveloppePaginee(donnees, total, page, limit) {
  const pages = limit > 0 ? Math.ceil(total / limit) : 0;
  return { donnees, total, page, limit, pages };
}


module.exports = { construireOptions, enveloppePaginee };
