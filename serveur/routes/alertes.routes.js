/* ============================================================
   routes/alertes.routes.js — Etape 1 : cablage uniquement
   ============================================================ */

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controleurs/alertes.controleur");

router.get   ("/",            ctrl.lister);
router.get   ("/:id",         ctrl.obtenir);
router.post  ("/",            ctrl.creer);
router.patch ("/:id/resolue", ctrl.resoudre);
router.delete("/:id",         ctrl.supprimer);

module.exports = router;
