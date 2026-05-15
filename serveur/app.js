/* ============================================================
   app.js — Solution de référence de TP 1
   ------------------------------------------------------------
   POINT D'ENTRÉE du serveur. Conformément au TP 1,
   ce fichier se limite au wiring :
     - middlewares (cors, express.json, journalisation) ;
     - montage du routeur /api/alertes ;
     - démarrage du serveur HTTP.

   Toute la logique métier vit dans :
     - data/alertes.js          (tableau en mémoire + helpers)
     - routes/alertes.routes.js (les 5 routes)

   ============================================================ */

const express = require("express");
const cors    = require("cors");

const alertesRoutes = require("./routes/alertes.routes");

const app = express();


/* ------------------------------------------------------------
   Middlewares
   ------------------------------------------------------------ */

app.use(cors());
app.use(express.json());

// Journalisation simple : méthode + URL + statut + durée
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
   Gestion globale des erreurs imprévues
   ------------------------------------------------------------ */

app.use((erreur, req, res, next) => {
  console.error("Erreur non gérée :", erreur);
  res.status(500).json({ message: "Erreur serveur." });
});


/* ------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------ */

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
