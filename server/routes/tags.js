const express = require("express");
const router = express.Router();
const Template = require("../models/Template");

router.get("/", async (req, res) => {
  try {
    const templates = await Template.findAll({ attributes: ["tags"] });

    const allTags = templates.flatMap((tpl) => tpl.tags || []);
    const unique = [...new Set(allTags)];

    res.json(unique);
  } catch (err) {
    console.error("Ошибка получения тегов:", err);
    res.status(500).json({ message: "Ошибка при загрузке тегов" });
  }
});

module.exports = router;
