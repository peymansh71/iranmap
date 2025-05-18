const express = require("express");
const router = express.Router();
const Index = require("../models/Index");
const { auth, adminAuth } = require("../middleware/auth");

// Get all indexes
router.get("/", auth, async (req, res) => {
  try {
    const indexes = await Index.find();
    res.json(indexes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create index
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const index = new Index({ name, description, type });
    await index.save();
    res.status(201).json(index);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update index
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const index = await Index.findByIdAndUpdate(
      req.params.id,
      { name, description, type },
      { new: true }
    );
    if (!index) {
      return res.status(404).json({ message: "Index not found" });
    }
    res.json(index);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete index
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const index = await Index.findByIdAndDelete(req.params.id);
    if (!index) {
      return res.status(404).json({ message: "Index not found" });
    }
    res.json({ message: "Index deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
