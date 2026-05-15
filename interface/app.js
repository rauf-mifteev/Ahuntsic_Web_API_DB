/* ============================================================
   app.js — Console de supervision d'alertes (persistée)
   ------------------------------------------------------------
   Cette interface est FOURNIE. Vous N'AVEZ PAS à la modifier.

   Elle consomme les six routes attendues côté serveur :

     GET    /api/alertes              -> enveloppe paginée (filtres, recherche,
                                         dates, tri, pagination)
     GET    /api/alertes/:id          -> alerte précise
     POST   /api/alertes              -> créer une alerte
     PUT    /api/alertes/:id          -> remplacer une alerte intégralement
     PATCH  /api/alertes/:id/resolue  -> marquer comme résolue
     DELETE /api/alertes/:id          -> supprimer

   Le serveur doit répondre à GET /api/alertes par une ENVELOPPE :

     {
       donnees: [ ...alertes... ],
       total:   42,
       page:    1,
       limit:   10,
       pages:   5
     }

   Modèle d'une alerte (tel que renvoyé par le serveur) :

     {
       id:          "6620a1f8c4e3b5a1f8c4e3b5",
       source:      "Serveur web-01",
       type:        "cpu",
       niveau:      "critique",
       message:     "Utilisation CPU à 95 %",
       horodatage:  "2026-05-01T10:30:00.000Z",
       resolue:     false,
       resolueAt:   null,
       createdAt:   "2026-05-01T10:30:00.000Z",
       updatedAt:   "2026-05-01T10:30:00.000Z"
     }

   Règle clé : le client N'ENVOIE JAMAIS les champs
               id, horodatage, resolue, resolueAt,
               createdAt, updatedAt.
               Le SERVEUR s'en charge.
   ============================================================ */


/* ------------------------------------------------------------
   1) Configuration
   ------------------------------------------------------------ */

const API_URL = "http://localhost:3000";


/* ------------------------------------------------------------
   2) État local (filtres + page courante)
   ------------------------------------------------------------ */

const etat = {
  niveau:  "",
  type:    "",
  resolue: "",
  q:       "",
  since:   "",
  until:   "",
  sort:    "horodatage",
  order:   "desc",
  page:    1,
  limit:   10
};


/* ------------------------------------------------------------
   3) Références vers les éléments de la page
   ------------------------------------------------------------ */

const listeAlertes    = document.getElementById("liste-alertes");
const btnRafraichir   = document.getElementById("btn-rafraichir");
const messageAlertes  = document.getElementById("message-alertes");
const infoTotal       = document.getElementById("info-total");
const infoPage        = document.getElementById("info-page");
const btnPrec         = document.getElementById("btn-prec");
const btnSuiv         = document.getElementById("btn-suiv");

const formFiltres     = document.getElementById("form-filtres");
const filtreNiveau    = document.getElementById("filtre-niveau");
const filtreType      = document.getElementById("filtre-type");
const filtreResolue   = document.getElementById("filtre-resolue");
const filtreQ         = document.getElementById("filtre-q");
const filtreSince     = document.getElementById("filtre-since");
const filtreUntil     = document.getElementById("filtre-until");
const filtreSort      = document.getElementById("filtre-sort");
const filtreOrder     = document.getElementById("filtre-order");
const filtreLimit     = document.getElementById("filtre-limit");
const btnReinit       = document.getElementById("btn-reinitialiser");

const formAjout       = document.getElementById("form-ajout");
const champSource     = document.getElementById("champ-source");
const champType       = document.getElementById("champ-type");
const champNiveau     = document.getElementById("champ-niveau");
const champMessage    = document.getElementById("champ-message");
const messageAjout    = document.getElementById("message-ajout");


/* ------------------------------------------------------------
   4) Utilitaires d'affichage
   ------------------------------------------------------------ */

function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.classList.remove("succes", "erreur", "info");
  if (type) {
    element.classList.add(type);
  }
}

function formaterHorodatage(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-CA");
}

function abregerId(id) {
  if (!id || typeof id !== "string") return "";
  if (id.length <= 10) return id;
  return id.slice(0, 6) + "…" + id.slice(-4);
}

function afficherAlertes(alertes) {
  listeAlertes.innerHTML = "";

  if (!Array.isArray(alertes) || alertes.length === 0) {
    listeAlertes.innerHTML =
      "<p class='message info'>Aucune alerte à afficher.</p>";
    return;
  }

  alertes.forEach((alerte) => {
    const carte = document.createElement("article");
    carte.className = "carte-alerte niveau-" + (alerte.niveau ?? "info");
    if (alerte.resolue) carte.classList.add("resolue");
    carte.dataset.id = alerte.id;

    // Ligne 1 : source + étiquette niveau
    const ligne1 = document.createElement("div");
    ligne1.className = "carte-ligne";

    const source = document.createElement("h3");
    source.className = "carte-source";
    source.textContent = alerte.source ?? "—";

    const niveau = document.createElement("span");
    niveau.className = "etiquette niveau-" + (alerte.niveau ?? "info");
    niveau.textContent = alerte.niveau ?? "—";

    ligne1.appendChild(source);
    ligne1.appendChild(niveau);

    // Type
    const type = document.createElement("span");
    type.className = "carte-type";
    type.textContent = alerte.type ?? "—";

    // Message
    const msg = document.createElement("p");
    msg.className = "carte-message";
    msg.textContent = alerte.message ?? "—";

    // Horodatage
    const horo = document.createElement("span");
    horo.className = "carte-horodatage";
    horo.textContent = "Reçue le " + formaterHorodatage(alerte.horodatage);

    // Id abrégé
    const idMini = document.createElement("span");
    idMini.className = "carte-id";
    idMini.textContent = "id " + abregerId(alerte.id);

    // Actions
    const actions = document.createElement("div");
    actions.className = "carte-actions";

    const btnResolue = document.createElement("button");
    btnResolue.className = "btn-secondaire";
    btnResolue.textContent = alerte.resolue
      ? "Déjà résolue"
      : "Marquer résolue";
    btnResolue.disabled = !!alerte.resolue;
    btnResolue.addEventListener("click", () => resoudreAlerte(alerte.id));

    const btnRemplacer = document.createElement("button");
    btnRemplacer.className = "btn-secondaire";
    btnRemplacer.textContent = "Remplacer";
    btnRemplacer.addEventListener("click", () => remplacerAlerte(alerte));

    const btnSuppr = document.createElement("button");
    btnSuppr.className = "btn-danger";
    btnSuppr.textContent = "Supprimer";
    btnSuppr.addEventListener("click", () => supprimerAlerte(alerte.id));

    actions.appendChild(btnResolue);
    actions.appendChild(btnRemplacer);
    actions.appendChild(btnSuppr);

    carte.appendChild(ligne1);
    carte.appendChild(type);
    carte.appendChild(msg);
    carte.appendChild(horo);
    carte.appendChild(idMini);
    carte.appendChild(actions);

    listeAlertes.appendChild(carte);
  });
}


/* ------------------------------------------------------------
   5) Construction de l'URL paginée
   ------------------------------------------------------------ */

function construireUrlListe() {
  const u = new URL(`${API_URL}/api/alertes`);

  const ajouterSiNonVide = (cle, valeur) => {
    if (valeur !== "" && valeur !== null && valeur !== undefined) {
      u.searchParams.set(cle, String(valeur));
    }
  };

  ajouterSiNonVide("niveau",  etat.niveau);
  ajouterSiNonVide("type",    etat.type);
  ajouterSiNonVide("resolue", etat.resolue);
  ajouterSiNonVide("q",       etat.q);

  // Les champs datetime-local renvoient une chaîne sans suffixe Z.
  // On convertit en ISO 8601 UTC pour le serveur.
  if (etat.since) {
    const d = new Date(etat.since);
    if (!Number.isNaN(d.getTime())) {
      u.searchParams.set("since", d.toISOString());
    }
  }
  if (etat.until) {
    const d = new Date(etat.until);
    if (!Number.isNaN(d.getTime())) {
      u.searchParams.set("until", d.toISOString());
    }
  }

  ajouterSiNonVide("sort",  etat.sort);
  ajouterSiNonVide("order", etat.order);
  ajouterSiNonVide("page",  etat.page);
  ajouterSiNonVide("limit", etat.limit);

  return u.toString();
}


/* ------------------------------------------------------------
   6) GET /api/alertes (avec filtres + pagination)
   ------------------------------------------------------------ */

async function chargerAlertes() {
  const url = construireUrlListe();

  try {
    afficherMessage(messageAlertes, "Chargement…", "info");

    const reponse = await fetch(url);
    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAlertes,
        donnees.message ||
          `Le serveur a répondu avec le code ${reponse.status}.`,
        "erreur"
      );
      listeAlertes.innerHTML = "";
      infoTotal.textContent = "—";
      infoPage.textContent  = "Page —";
      btnPrec.disabled = true;
      btnSuiv.disabled = true;
      return;
    }

    // Vérification minimale du format attendu.
    if (!donnees || !Array.isArray(donnees.donnees)) {
      afficherMessage(
        messageAlertes,
        "Réponse inattendue du serveur : enveloppe paginée absente.",
        "erreur"
      );
      return;
    }

    afficherAlertes(donnees.donnees);
    infoTotal.textContent =
      `${donnees.total ?? donnees.donnees.length} alerte(s) au total`;
    infoPage.textContent =
      `Page ${donnees.page ?? etat.page} / ${donnees.pages ?? 1}`;
    btnPrec.disabled = (donnees.page ?? 1) <= 1;
    btnSuiv.disabled = (donnees.page ?? 1) >= (donnees.pages ?? 1);

    afficherMessage(
      messageAlertes,
      `${donnees.donnees.length} alerte(s) affichée(s).`,
      "succes"
    );
  } catch (erreur) {
    console.error("Erreur pendant le chargement :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
    listeAlertes.innerHTML = "";
    infoTotal.textContent = "—";
    infoPage.textContent  = "Page —";
    btnPrec.disabled = true;
    btnSuiv.disabled = true;
  }
}


/* ------------------------------------------------------------
   7) POST /api/alertes
   ------------------------------------------------------------ */

async function ajouterAlerte(source, type, niveau, message) {
  try {
    afficherMessage(messageAjout, "Envoi au serveur…", "info");

    const reponse = await fetch(`${API_URL}/api/alertes`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ source, type, niveau, message })
    });

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAjout,
        donnees.message ||
          `Erreur serveur (${reponse.status}).`,
        "erreur"
      );
      return;
    }

    const id = donnees.alerte ? donnees.alerte.id : donnees.id;
    afficherMessage(
      messageAjout,
      `Alerte enregistrée (id ${abregerId(id)}).`,
      "succes"
    );
    formAjout.reset();
    etat.page = 1;
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant l'ajout :", erreur);
    afficherMessage(
      messageAjout,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
   8) PUT /api/alertes/:id (remplacement complet)
   ------------------------------------------------------------ */

async function remplacerAlerte(alerteActuelle) {
  // L'utilisateur saisit le nouveau corps via une boîte simple.
  // Le serveur reste la source de vérité de la validation.
  const source = prompt(
    "Nouvelle valeur — source :",
    alerteActuelle.source ?? ""
  );
  if (source === null) return;

  const type = prompt(
    "Nouvelle valeur — type :",
    alerteActuelle.type ?? ""
  );
  if (type === null) return;

  const niveau = prompt(
    "Nouvelle valeur — niveau (info | avertissement | critique) :",
    alerteActuelle.niveau ?? ""
  );
  if (niveau === null) return;

  const message = prompt(
    "Nouvelle valeur — message :",
    alerteActuelle.message ?? ""
  );
  if (message === null) return;

  try {
    const reponse = await fetch(
      `${API_URL}/api/alertes/${encodeURIComponent(alerteActuelle.id)}`,
      {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ source, type, niveau, message })
      }
    );

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAlertes,
        donnees.message ||
          `Échec du remplacement (code ${reponse.status}).`,
        "erreur"
      );
      return;
    }

    afficherMessage(
      messageAlertes,
      `Alerte ${abregerId(alerteActuelle.id)} remplacée.`,
      "succes"
    );
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant le remplacement :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
   9) PATCH /api/alertes/:id/resolue
   ------------------------------------------------------------ */

async function resoudreAlerte(id) {
  try {
    const reponse = await fetch(
      `${API_URL}/api/alertes/${encodeURIComponent(id)}/resolue`,
      { method: "PATCH" }
    );

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAlertes,
        donnees.message ||
          `Échec de la résolution (code ${reponse.status}).`,
        "erreur"
      );
      return;
    }

    afficherMessage(
      messageAlertes,
      `Alerte ${abregerId(id)} marquée résolue.`,
      "succes"
    );
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant la résolution :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
  10) DELETE /api/alertes/:id
   ------------------------------------------------------------ */

async function supprimerAlerte(id) {
  const confirmer = confirm(
    `Supprimer définitivement l'alerte ${abregerId(id)} ?`
  );
  if (!confirmer) return;

  try {
    const reponse = await fetch(
      `${API_URL}/api/alertes/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAlertes,
        donnees.message ||
          `Échec de la suppression (code ${reponse.status}).`,
        "erreur"
      );
      return;
    }

    afficherMessage(
      messageAlertes,
      `Alerte ${abregerId(id)} supprimée.`,
      "succes"
    );
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant la suppression :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
  11) Lecture de l'état depuis le formulaire
   ------------------------------------------------------------ */

function lireFiltres() {
  etat.niveau  = filtreNiveau.value;
  etat.type    = filtreType.value.trim();
  etat.resolue = filtreResolue.value;
  etat.q       = filtreQ.value.trim();
  etat.since   = filtreSince.value;
  etat.until   = filtreUntil.value;
  etat.sort    = filtreSort.value;
  etat.order   = filtreOrder.value;
  etat.limit   = parseInt(filtreLimit.value, 10) || 10;
}

function reinitialiserFiltres() {
  filtreNiveau.value  = "";
  filtreType.value    = "";
  filtreResolue.value = "";
  filtreQ.value       = "";
  filtreSince.value   = "";
  filtreUntil.value   = "";
  filtreSort.value    = "horodatage";
  filtreOrder.value   = "desc";
  filtreLimit.value   = "10";
  etat.page = 1;
  lireFiltres();
  chargerAlertes();
}


/* ------------------------------------------------------------
  12) Événements
   ------------------------------------------------------------ */

btnRafraichir.addEventListener("click", () => {
  lireFiltres();
  chargerAlertes();
});

formFiltres.addEventListener("submit", (evt) => {
  evt.preventDefault();
  lireFiltres();
  etat.page = 1;
  chargerAlertes();
});

btnReinit.addEventListener("click", reinitialiserFiltres);

btnPrec.addEventListener("click", () => {
  if (etat.page > 1) {
    etat.page -= 1;
    chargerAlertes();
  }
});

btnSuiv.addEventListener("click", () => {
  etat.page += 1;
  chargerAlertes();
});

formAjout.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const source  = champSource.value.trim();
  const type    = champType.value.trim();
  const niveau  = champNiveau.value.trim();
  const message = champMessage.value.trim();

  // Validation minimale côté client — la vraie validation est côté SERVEUR.
  if (source === "" || type === "" || niveau === "" || message === "") {
    afficherMessage(
      messageAjout,
      "Veuillez remplir tous les champs.",
      "erreur"
    );
    return;
  }

  ajouterAlerte(source, type, niveau, message);
});


/* ------------------------------------------------------------
  13) Premier chargement
   ------------------------------------------------------------ */

chargerAlertes();
