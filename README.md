# Serveur — Console de supervision d'alertes (version persistée)

Le lien vers le dépôt GitHub : **https://github.com/rauf-mifteev/Ahuntsic_Web_API_DB**

## Description

Ce projet est réalisé dans le cadre du cours de Développement d'application de supervision et monitorage au Collège Ahuntsic (420-317-AH). Il consiste à faire évoluer le serveur de TP1 pour y ajouter la persistance des données avec MongoDB, une architecture en trois couches (routes / contrôleurs / services), ainsi que des capacités de filtrage, de recherche et de pagination.

L'interface web est fournie et n'a pas été modifiée. Le travail porte entièrement sur le serveur. Le projet est construit en **6 étapes successives cumulatives** :

| Étape | Fonctionnalité | Concepts appliqués |
|---|---|---|
| **Étape 1** | **Architecture trois couches** : déplacement de la logique HTTP vers `controleurs/` et de l'accès aux données vers `services/`. Les routes ne font plus que du câblage. Les données restent en mémoire. | Séparation des responsabilités, `async/await` |
| **Étape 2** | **Migration vers MongoDB** : connexion Mongoose, schéma `Alerte` avec validateurs, script de seed, démarrage asynchrone du serveur. | Mongoose, `.env`, `config/bd.js`, `donnees/seed.js` |
| **Étape 3** | **Gestion d'erreurs centralisée** : le helper `repondreErreur()` traduit `ValidationError`, `CastError` et les erreurs métier en codes HTTP appropriés. | `controleurs/erreurs.js`, codes 400 / 404 / 409 / 500 |
| **Étape 4** | **Filtres, recherche et pagination** : `GET /api/alertes` accepte `?niveau=`, `?type=`, `?resolue=`, `?q=`, `?since=`, `?until=`, `?sort=`, `?order=`, `?page=`, `?limit=` et retourne une enveloppe paginée. | `req.query`, regex MongoDB, `Promise.all`, `skip` / `limit` |
| **Étape 5** | **Route PUT** : remplacement complet d'une alerte existante avec `findByIdAndUpdate` et `overwrite: true`. | `PUT` vs `PATCH`, `runValidators: true` |
| **Étape 6** | **Polissage** : README, Insomnia, `.gitignore`. | Documentation, bonnes pratiques |

## Prérequis

- Node.js 
- npm
- MongoDB 

Vérifier que MongoDB tourne (PowerShell) :

```
Get-Service MongoDB
```

## Installation

Dans le dossier `serveur/`, exécuter :

```
npm install
```

Copier le fichier de configuration :

```
cp .env.exemple .env
```

Amorcer la base de données (à faire une seule fois, ou pour repartir d'un état propre) :

```
npm run seed
```

## Démarrage

```
npm start
```

Le terminal affiche :

```
MongoDB : connecté
Serveur en écoute sur http://localhost:3000
```

Ouvrir ensuite `interface/index.html` dans le navigateur.

## Routes disponibles

| Méthode | Route | Description | Codes retournés |
|---|---|---|---|
| GET | `/api/alertes` | Liste paginée avec filtres optionnels | 200, 400 |
| GET | `/api/alertes/:id` | Une seule alerte par identifiant | 200, 400, 404 |
| POST | `/api/alertes` | Crée une nouvelle alerte | 201, 400 |
| PUT | `/api/alertes/:id` | Remplace une alerte entièrement | 200, 400, 404 |
| PATCH | `/api/alertes/:id/resolue` | Marque une alerte comme résolue | 200, 400, 404 |
| DELETE | `/api/alertes/:id` | Supprime une alerte | 200, 400, 404 |

## Paramètres de GET /api/alertes

| Paramètre | Effet | Défaut |
|---|---|---|
| `?niveau=critique` | Filtre exact. Retourne 400 si la valeur est hors enum. | (tous) |
| `?type=cpu` | Filtre exact, normalisé en minuscules. | (tous) |
| `?resolue=false` | Filtre booléen. Accepte `true` ou `false`. | (tous) |
| `?q=CPU` | Recherche dans le champ `message`, insensible à la casse. | (tous) |
| `?since=2026-05-01` | Filtre `horodatage >=` cette date (format ISO 8601). | (illimité) |
| `?until=2026-05-31` | Filtre `horodatage <=` cette date (format ISO 8601). | (illimité) |
| `?sort=horodatage` | Champ de tri : `horodatage`, `niveau` ou `createdAt`. | `horodatage` |
| `?order=asc` | Direction du tri : `asc` ou `desc`. | `desc` |
| `?page=2` | Numéro de page, entier ≥ 1. | `1` |
| `?limit=5` | Taille de page, entier entre 1 et 100. | `10` |

La réponse est toujours une enveloppe paginée :

```json
{
  "donnees": [ { "...alerte..." } ],
  "total":   7,
  "page":    1,
  "limit":   10,
  "pages":   1
}
```

## Modèle d'une alerte

```json
{
  "id":         "6620a1f8c4e3b5a1f8c4e3b5",
  "source":     "Serveur web-01",
  "type":       "cpu",
  "niveau":     "critique",
  "message":    "Utilisation CPU à 95 %",
  "horodatage": "2026-05-01T10:30:00.000Z",
  "resolue":    false,
  "resolueAt":  null,
  "createdAt":  "2026-05-01T10:30:00.000Z",
  "updatedAt":  "2026-05-01T10:30:00.000Z"
}
```

Champs envoyés par le client lors d'un POST ou d'un PUT : `source`, `type`, `niveau`, `message` uniquement.
Les champs `id`, `horodatage`, `resolue`, `resolueAt`, `createdAt` et `updatedAt` sont toujours générés par le serveur.

Valeurs autorisées pour `niveau` : `info`, `avertissement`, `critique`.

## Structure des fichiers back-end

```
serveur/
├── package.json
├── .env.exemple               <- modèle de configuration (versionné)
├── .gitignore                 <- exclut node_modules/ et .env
├── app.js                     <- point d'entrée, middlewares, démarrage
├── config/
│   └── bd.js                  <- connexion MongoDB encapsulée
├── modeles/
│   └── Alerte.js              <- schéma Mongoose
├── services/
│   ├── alertes.service.js     <- logique métier, appels Mongoose
│   └── requete.js             <- utilitaire filtres / tri / pagination
├── controleurs/
│   ├── alertes.controleur.js  <- logique HTTP (req / res)
│   └── erreurs.js             <- helper repondreErreur
├── routes/
│   └── alertes.routes.js      <- câblage URL -> contrôleur
└── donnees/
│   └── seed.js                <- script d'amorçage de la base
├── tests-insomnia/
    └── collection-alertes.json      <- tests Insomnia format JSON
    └── collection-alertes.yaml      <- tests Insomnia format YAML
```

## Variables d'environnement

Le fichier `.env` (non versionné) est créé à partir de `.env.exemple` :

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/supervision
```

## Journalisation

Chaque requête reçue est affichée dans le terminal avec la méthode, l'URL, le code de statut et la durée :

```
MongoDB : connecté
Serveur en écoute sur http://localhost:3000
GET /api/alertes?sort=horodatage&order=desc&page=1&limit=5 304 (11ms)
PATCH /api/alertes/6a06a70d0375b18d3048e46b/resolue 200 (49ms)
GET /api/alertes?sort=horodatage&order=desc&page=1&limit=5 200 (12ms)
DELETE /api/alertes/6a06a70d0375b18d3048e46b 200 (14ms)
GET /api/alertes?sort=horodatage&order=desc&page=1&limit=5 200 (14ms)
```
