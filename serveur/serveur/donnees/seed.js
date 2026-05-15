/* ============================================================
   donnees/seed.js — Script d'amorcage de la base
   ------------------------------------------------------------
   Ce script vide la collection alertes, puis insere un jeu de
   donnees de test. Il est idempotent : on peut le relancer
   autant de fois qu'on veut sans doublons.

   Utilisation :
     npm run seed

   Ce que produit ce script :
     - 7 alertes couvrant les trois niveaux (info, avertissement,
       critique), dont 2 deja resolues.
   ============================================================ */

require("dotenv").config();

const mongoose        = require("mongoose");
const { connecterBD } = require("../config/bd");
const Alerte          = require("../modeles/Alerte");

/* ------------------------------------------------------------
   Donnees de depart
   ------------------------------------------------------------ */

const maintenant = Date.now();

const ALERTES_DEPART = [
  {
    source:     "Serveur web-01",
    type:       "cpu",
    niveau:     "critique",
    message:    "Utilisation CPU a 95 %",
    horodatage: new Date(maintenant - 5  * 60 * 1000),
    resolue:    false
  },
  {
    source:     "Routeur principal",
    type:       "reseau",
    niveau:     "avertissement",
    message:    "Latence elevee sur le lien WAN",
    horodatage: new Date(maintenant - 15 * 60 * 1000),
    resolue:    false
  },
  {
    source:     "Serveur web-02",
    type:       "disque",
    niveau:     "info",
    message:    "Sauvegarde quotidienne terminee avec succes",
    horodatage: new Date(maintenant - 2  * 60 * 60 * 1000),
    resolue:    true,
    resolueAt:  new Date(maintenant - 90 * 60 * 1000)
  },
  {
    source:     "Base de donnees principale",
    type:       "memoire",
    niveau:     "critique",
    message:    "Memoire disponible inferieure a 10 %",
    horodatage: new Date(maintenant - 30 * 60 * 1000),
    resolue:    false
  },
  {
    source:     "Serveur de fichiers",
    type:       "disque",
    niveau:     "avertissement",
    message:    "Espace disque inferieur a 20 %",
    horodatage: new Date(maintenant - 45 * 60 * 1000),
    resolue:    false
  },
  {
    source:     "Service de messagerie",
    type:       "application",
    niveau:     "info",
    message:    "Mise a jour du certificat SSL effectuee",
    horodatage: new Date(maintenant - 3  * 60 * 60 * 1000),
    resolue:    true,
    resolueAt:  new Date(maintenant - 150 * 60 * 1000)
  },
  {
    source:     "Pare-feu perimetrique",
    type:       "securite",
    niveau:     "critique",
    message:    "Tentatives de connexion suspectes detectees",
    horodatage: new Date(maintenant - 10 * 60 * 1000),
    resolue:    false
  }
];

/* ------------------------------------------------------------
   Procedure principale
   ------------------------------------------------------------ */

async function seed() {
  await connecterBD(process.env.MONGO_URI);

  console.log("Suppression des alertes existantes...");
  await Alerte.deleteMany({});

  console.log("Insertion des alertes...");
  const alertes = await Alerte.insertMany(ALERTES_DEPART);

  console.log("");
  console.log("===============================================");
  console.log("Seed termine avec succes :");
  console.log(`  - alertes : ${alertes.length}`);
  console.log("    (3 critique, 2 avertissement, 2 info)");
  console.log("    (2 deja resolues)");
  console.log("===============================================");

  await mongoose.disconnect();
}

seed().catch(async (erreur) => {
  console.error("");
  console.error("Erreur de seed :", erreur.message);
  if (erreur.errors) {
    for (const champ in erreur.errors) {
      console.error(`  - ${champ} : ${erreur.errors[champ].message}`);
    }
  }
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
