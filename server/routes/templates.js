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

router.put("/:id", auth.required, checkOwner(Template), async (req, res) => {
  try {
    const { title, questions = [] } = req.body;

    // 1. Найдём шаблон
    const template = await Template.findByPk(req.params.id, {
      include: [Question],
    });

    if (!template) return res.status(404).json({ message: "Шаблон не найден" });

    // 2. Обновим поля шаблона
    await template.update({ title });

    // 3. Обновим список вопросов
    const existingIds = template.Questions.map((q) => q.id);

    for (const q of questions) {
      if (q.id && existingIds.includes(q.id)) {
        // обновляем существующий
        await Question.update(
          { text: q.text, type: q.type },
          { where: { id: q.id } }
        );
      } else {
        // создаём новый
        await Question.create({
          text: q.text,
          type: q.type,
          templateId: template.id,
        });
      }
    }

    // 4. Удалим удалённые вопросы
    const newIds = questions.filter((q) => q.id).map((q) => q.id);
    const toDelete = existingIds.filter((id) => !newIds.includes(id));

    await Question.destroy({ where: { id: toDelete } });

    res.json({ message: "Шаблон обновлён" });
  } catch (err) {
    console.error("Ошибка при обновлении шаблона:", err);
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
});
router.delete("/:id", auth.required, checkOwner(Template), async (req, res) => {
  try {
    // await Form.destroy({ where: { templateId: req.params.id } }); // Удаляем формы, связанные с этим шаблоном
    await Template.destroy({ where: { id: req.params.id } });
    res.json({ message: "Шаблон удалён" });
  } catch (err) {
    console.error("Ошибка удаления:", err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

router.patch(
  "/:id/questions",
  auth.required,
  checkOwner(Template),
  async (req, res) => {
    try {
      const { questions } = req.body;

      if (!Array.isArray(questions))
        return res
          .status(400)
          .json({ message: "Некорректный формат вопросов" });

      const templateId = req.params.id;

      // Получаем существующие вопросы
      const existing = await Question.findAll({ where: { templateId } });
      const existingIds = existing.map((q) => q.id);

      // ID из новых данных
      const incomingIds = questions.filter((q) => q.id).map((q) => q.id);

      // ❌ Вопросы на удаление
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
      if (toDelete.length > 0) {
        await Question.destroy({ where: { id: toDelete } });
      }

      // 🔁 Обновим или создадим
      for (const [i, q] of questions.entries()) {
        if (q.id && existingIds.includes(q.id)) {
          // UPDATE
          await Question.update(
            {
              text: q.text,
              type: q.type,
              options: q.options,
              order: i,
            },
            { where: { id: q.id } }
          );
        } else {
          // CREATE
          await Question.create({
            text: q.text,
            type: q.type,
            options: q.options,
            order: i,
            templateId,
          });
        }
      }

      res.json({ message: "Вопросы обновлены" });
    } catch (err) {
      console.error("Ошибка обновления вопросов:", err);
      res.status(500).json({ message: "Ошибка на сервере" });
    }
  }
);

module.exports = router;
