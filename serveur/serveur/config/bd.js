/* ============================================================
   config/bd.js — Connexion a MongoDB via Mongoose
   ------------------------------------------------------------
     - L'URI vient de .env, jamais en dur dans le code.
     - Trois ecouteurs d'evenements rendent visible l'etat de la
       connexion dans la console.
     - La fonction retourne une Promise. app.js l'attend avant
       de demarrer le serveur HTTP.
   ============================================================ */

const mongoose = require("mongoose");

async function connecterBD(uri) {
  if (!uri) {
    throw new Error(
      "MONGO_URI est manquante. Verifiez que le fichier .env existe " +
      "et contient la ligne MONGO_URI=mongodb://localhost:27017/supervision."
    );
  }

  mongoose.connection.on("connected", () => {
    console.log("MongoDB : connecte");
  });

  mongoose.connection.on("error", (erreur) => {
    console.error("MongoDB : erreur ->", erreur.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB : deconnecte");
  });

  await mongoose.connect(uri);
}

module.exports = { connecterBD };
