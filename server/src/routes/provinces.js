const express = require("express");
const router = express.Router();
const Province = require("../models/Province");
const { auth, adminAuth } = require("../middleware/auth");

// Get all provinces
router.get("/", auth, async (req, res) => {
  try {
    const provinces = await Province.find();
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single province
router.get("/:id", auth, async (req, res) => {
  try {
    const province = await Province.findOne({ id: req.params.id });
    if (!province) {
      return res.status(404).json({ message: "Province not found" });
    }
    res.json(province);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update province
router.post("/", adminAuth, async (req, res) => {
  try {
    const { id, name_fa, name_en, fields } = req.body;
    const province = await Province.findOneAndUpdate(
      { id },
      { name_fa, name_en, fields },
      { new: true, upsert: true }
    );
    res.status(201).json(province);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete province
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const province = await Province.findOneAndDelete({ id: req.params.id });
    if (!province) {
      return res.status(404).json({ message: "Province not found" });
    }
    res.json({ message: "Province deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
