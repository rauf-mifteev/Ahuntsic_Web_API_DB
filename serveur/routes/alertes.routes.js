/* ============================================================
   routes/alertes.routes.js — Etape 5 : ajout de PUT /:id
   ------------------------------------------------------------
   Une ligne ajoutee par rapport a l'etape 1. 
   ============================================================ */

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controleurs/alertes.controleur");

router.get   ("/",            ctrl.lister);
router.get   ("/:id",         ctrl.obtenir);
router.post  ("/",            ctrl.creer);
router.put   ("/:id",         ctrl.remplacer);      // NOUVEAU
router.patch ("/:id/resolue", ctrl.resoudre);
router.delete("/:id",         ctrl.supprimer);

module.exports = router;
