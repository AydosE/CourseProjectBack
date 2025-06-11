const express = require("express");
const Template = require("../models/Template");

const router = express.Router();

// Получение всех шаблонов
router.get("/", async (req, res) => {
  const templates = await Template.findAll();
  res.json(templates);
});

// Создание шаблона
router.post("/", async (req, res) => {
  const { title, description } = req.body;
  const template = await Template.create({ title, description });
  res.status(201).json(template);
});

// Удаление шаблона
router.delete("/:id", async (req, res) => {
  await Template.destroy({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
