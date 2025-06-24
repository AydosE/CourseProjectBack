const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Template = require("../models/Template");
const Question = require("../models/Question");
const User = require("../models/User");

router.post("/", auth, async (req, res) => {
  const { title, description, category, imageUrl, tags, questions } = req.body;

  if (!title || !Array.isArray(questions)) {
    return res
      .status(400)
      .json({ message: "Нужно указать title и массив вопросов" });
  }

  // Валидация по количеству типов (до 4 каждого)
  const typeCount = { text: 0, textarea: 0, number: 0, checkbox: 0 };
  for (let q of questions) {
    if (!q.type || !q.text)
      return res
        .status(400)
        .json({ message: "Каждый вопрос должен иметь текст и тип" });
    if (typeCount[q.type] !== undefined) typeCount[q.type]++;
  }
  for (let t in typeCount) {
    if (typeCount[t] > 4)
      return res.status(400).json({ message: `Максимум 4 вопроса типа ${t}` });
  }

  try {
    const template = await Template.create({
      title,
      description,
      category,
      imageUrl,
      tags,
      userId: req.user.id,
    });

    const enriched = questions.map((q, i) => ({
      ...q,
      order: i,
      templateId: template.id,
    }));
    await Question.bulkCreate(enriched);

    res.status(201).json({ templateId: template.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ошибка создания шаблона" });
  }
});
// Получить все шаблоны
router.get("/", async (req, res) => {
  try {
    const templates = await Template.findAll({
      include: [
        { model: User, attributes: ["username"] },
        {
          model: Question,
          attributes: ["id", "text", "type", "options", "order"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: "Ошибка получения шаблонов" });
  }
});

// Получить один шаблон по id
router.get("/:id", async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["username", "id"] },
        {
          model: Question,
          attributes: ["id", "text", "type", "options", "order"],
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!template) {
      return res.status(404).json({ message: "Шаблон не найден" });
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ message: "Ошибка получения шаблона" });
  }
});

module.exports = router;
