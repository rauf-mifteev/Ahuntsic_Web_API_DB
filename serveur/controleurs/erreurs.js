/* ============================================================
   controleurs/erreurs.js — Etape 3 : version complete
   ------------------------------------------------------------
   Ce helper centralise la traduction des erreurs en reponses
   HTTP. Tous les controleurs l'importent et l'appellent dans
   leur bloc catch. 

   Codes HTTP utilises :
     400  — erreur du client (champ invalide, id mal forme,
             alerte deja resolue)
     409  — conflit (cle unique violee, ex. courriel deja pris)
     500  — erreur inattendue cote serveur

   Erreurs reconnues :
     ValidationError  — schema Mongoose viole  -> 400
     CastError        — ObjectId mal forme     -> 400
     DejaResolue      — alerte deja resolue    -> 400
     ChampManquant    — champ requis absent     -> 400
     ReferenceInvalide — reference introuvable  -> 400
     code 11000       — index unique viole      -> 409
     tout le reste    -> 500 
   ============================================================ */

function repondreErreur(res, erreur, contexte) {

  // 1. Erreur de validation Mongoose (champs invalides ou enum)
  if (erreur.name === "ValidationError") {
    const messages = Object.values(erreur.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(" ") });
  }

  // 2. Erreur de cast (ObjectId mal forme)
  if (erreur.name === "CastError") {
    return res.status(400).json({ message: "Identifiant invalide." });
  }

  // 3. Erreurs metier levees par les services
  if (
    erreur.name === "DejaResolue"      ||
    erreur.name === "ChampManquant"    ||
    erreur.name === "ReferenceInvalide"
  ) {
    return res.status(400).json({ message: erreur.message });
  }

  // 4. Cle dupliquee MongoDB (index unique viole)
  if (erreur.code === 11000) {
    return res.status(409).json({ message: "Conflit : valeur deja existante." });
  }

  // 5. Tout le reste : erreur serveur inattendue
  console.error(`Erreur ${contexte} :`, erreur);
  return res.status(500).json({ message: "Erreur serveur." });
}

module.exports = { repondreErreur };
