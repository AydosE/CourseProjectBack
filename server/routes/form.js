const express = require("express");
const Form = require("../models/Form");

const router = express.Router();

// Получить все формы
router.get("/", async (req, res) => {
  const forms = await Form.findAll();
  res.json(forms);
});

// Создать новую форму
router.post("/", async (req, res) => {
  const { templateId, userId } = req.body;
  if (!templateId || !userId)
    return res.status(400).json({ error: "templateId и userId обязательны" });

  const form = await Form.create({ templateId, userId });
  res.status(201).json(form);
});

// Удалить форму
router.delete("/:id", async (req, res) => {
  await Form.destroy({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
