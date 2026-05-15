/* ============================================================
   modeles/Alerte.js — Schema Mongoose pour la collection alertes
   ------------------------------------------------------------
   Chaque contrainte declaree ici remplace une verification
   manuelle qui existait dans routes/alertes.routes.js.

   ============================================================ */

const mongoose = require("mongoose");

const alerteSchema = new mongoose.Schema(
  {
    source: {
      type:      String,
      required:  [true, "Le champ source est obligatoire."],
      trim:      true,
      minlength: [2,  "Le champ source doit contenir au moins 2 caracteres."],
      maxlength: [80, "Le champ source ne peut pas depasser 80 caracteres."]
    },

    type: {
      type:      String,
      required:  [true, "Le champ type est obligatoire."],
      trim:      true,
      lowercase: true   // normalise toujours en minuscules avant enregistrement
    },

    niveau: {
      type:     String,
      required: [true, "Le champ niveau est obligatoire."],
      enum: {
        values:  ["info", "avertissement", "critique"],
        message: "Le niveau doit etre l'une des valeurs : info, avertissement, critique."
      }
    },

    message: {
      type:      String,
      required:  [true, "Le champ message est obligatoire."],
      trim:      true,
      minlength: [3,   "Le champ message doit contenir au moins 3 caracteres."],
      maxlength: [200, "Le champ message ne peut pas depasser 200 caracteres."]
    },

    horodatage: {
      type:    Date,
      default: Date.now,
      index:   true
    },

    resolue: {
      type:    Boolean,
      default: false
    },

    resolueAt: {
      type:    Date,
      default: null
    }
  },
  {
    timestamps:  true,       // ajoute createdAt et updatedAt
    versionKey:  false,      // retire le champ __v

    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();   // expose "id" (string)
        delete ret._id;                // masque "_id"
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Alerte", alerteSchema);
