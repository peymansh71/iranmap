const mongoose = require("mongoose");

const indexSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["number", "text", "percentage"],
      default: "number",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Index", indexSchema);
