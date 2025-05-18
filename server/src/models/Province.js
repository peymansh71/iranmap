const mongoose = require("mongoose");

const provinceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name_fa: {
      type: String,
      required: true,
    },
    name_en: {
      type: String,
      required: true,
    },
    fields: [
      {
        label: {
          type: String,
          required: true,
        },
        value: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Province", provinceSchema);
