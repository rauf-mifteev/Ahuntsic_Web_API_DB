/* ============================================================
   app.js — Etape 2 : connexion MongoDB avant demarrage HTTP
   ------------------------------------------------------------
   Deux changements par rapport a l'etape 1 :
     1. require("dotenv").config() charge le fichier .env en
        PREMIER, avant tout autre require qui lirait process.env.
     2. Le demarrage est maintenant une fonction async. Le serveur
        HTTP n'ecoute qu'APRES que la connexion MongoDB a reussi.
        En cas d'echec, process.exit(1) evite qu'un serveur
        "zombie" accepte des requetes sans base de donnees.
   ============================================================ */

require("dotenv").config();

const express = require("express");
const cors    = require("cors");

const { connecterBD }  = require("./config/bd");
const alertesRoutes    = require("./routes/alertes.routes");

const app = express();


/* ------------------------------------------------------------
   Middlewares
   ------------------------------------------------------------ */

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const debut = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - debut}ms)`
    );
  });
  next();
});


/* ------------------------------------------------------------
   Routes
   ------------------------------------------------------------ */

app.use("/api/alertes", alertesRoutes);


/* ------------------------------------------------------------
   Gestion globale des erreurs imprevues
   ------------------------------------------------------------ */

app.use((erreur, req, res, next) => {
  console.error("Erreur non geree :", erreur);
  res.status(500).json({ message: "Erreur serveur." });
});


/* ------------------------------------------------------------
   Demarrage : on attend la base AVANT d'ecouter le port HTTP
   ------------------------------------------------------------ */

const PORT = process.env.PORT || 3000;

async function demarrer() {
  try {
    await connecterBD(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Serveur en ecoute sur http://localhost:${PORT}`);
    });
  } catch (erreur) {
    console.error("Demarrage annule :", erreur.message);
    process.exit(1);
  }
}

demarrer();
