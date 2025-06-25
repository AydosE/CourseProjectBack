const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Template = require("../models/Template");
const Question = require("../models/Question");
const User = require("../models/User");
const Form = require("../models/Form");
const checkOwner = require("../middleware/checkOwnership");
// 🔐 Создать шаблон (только авторизованные)
router.post("/", auth.required, async (req, res) => {
  const { title, description, category, imageUrl, tags, questions } = req.body;

  if (!title || !Array.isArray(questions)) {
    return res
      .status(400)
      .json({ message: "Нужно указать title и массив questions" });
  }

  const typeCount = { text: 0, textarea: 0, number: 0, checkbox: 0 };
  for (let q of questions) {
    if (!q.type || !q.text) {
      return res
        .status(400)
        .json({ message: "Каждый вопрос должен иметь текст и тип" });
    }
    if (typeCount[q.type] !== undefined) typeCount[q.type]++;
  }
  for (let t in typeCount) {
    if (typeCount[t] > 4) {
      return res
        .status(400)
        .json({ message: `Максимум 4 вопроса типа "${t}"` });
    }
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

    const enrichedQuestions = questions.map((q, i) => ({
      ...q,
      order: i,
      templateId: template.id,
    }));

    await Question.bulkCreate(enrichedQuestions);

    res.status(201).json({ templateId: template.id });
  } catch (err) {
    console.error("Ошибка при создании шаблона:", err);
    res.status(500).json({ message: "Ошибка на сервере при создании шаблона" });
  }
});

// 🔓 Получить все шаблоны
router.get("/", async (req, res) => {
  try {
    const { limit } = req.query;
    const queryOptions = {
      include: [
        { model: User, attributes: ["username"] },
        {
          model: Question,
          attributes: ["id", "text", "type", "options", "order"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };
    if (limit) queryOptions.limit = parseInt(limit);
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
    console.error("Ошибка при получении шаблонов:", err);
    res.status(500).json({ message: "Ошибка при получении шаблонов" });
  }
});

router.get("/top", async (req, res) => {
  try {
    // Получаем все шаблоны + сколько форм у каждого
    const templates = await Template.findAll({
      include: [{ model: Form, attributes: ["id"] }],
    });

    const top = templates
      .map((tpl) => ({
        id: tpl.id,
        title: tpl.title,
        formCount: tpl.Forms.length,
      }))
      .sort((a, b) => b.formCount - a.formCount)
      .slice(0, 5);

    res.json(top);
  } catch (err) {
    console.error("Ошибка получения топа:", err);
    res.status(500).json({ message: "Ошибка получения популярных шаблонов" });
  }
});
// 🔓 Получить один шаблон по ID
router.get("/:id", async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["username", "id"] },
        {
          model: Question,
          attributes: ["id", "text", "type", "options", "order"],
        },
      ],
      order: [[Question, "order", "ASC"]],
    });

    if (!template) {
      return res.status(404).json({ message: "Шаблон не найден" });
    }

    res.json(template);
  } catch (err) {
    console.error("Ошибка при получении шаблона:", err);
    res.status(500).json({ message: "Ошибка при получении шаблона" });
  }
});

// 🔐 Обновить шаблон (только автор или админ)
router.put("/:id", auth.required, checkOwner(Template), async (req, res) => {
  try {
    const { title, description, category, tags, imageUrl } = req.body;
    const template = await Template.findByPk(req.params.id);
    template.title = title ?? template.title;
    template.description = description ?? template.description;
    template.category = category ?? template.category;
    template.tags = tags ?? template.tags;
    template.imageUrl = imageUrl ?? template.imageUrl;

    await template.save();
    res.json({ message: "Шаблон обновлён" });
  } catch (err) {
    console.error("Ошибка при обновлении шаблона:", err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

module.exports = router;
