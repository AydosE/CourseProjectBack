const express = require("express");
const router = express.Router();
const { validate: isUuid } = require("uuid");
const auth = require("../middleware/authMiddleware");
const checkOwner = require("../middleware/checkOwnership");
const { Op } = require("sequelize");

const Template = require("../models/Template");
const Question = require("../models/Question");
const Form = require("../models/Form");
const User = require("../models/User");

router.post("/", auth.required, async (req, res) => {
  const { title, description, category, imageUrl, tags, questions } = req.body;

  if (!title || !Array.isArray(questions)) {
    return res
      .status(400)
      .json({ message: "Нужно указать title и массив questions" });
  }

  const typeLimit = { text: 0, textarea: 0, number: 0, checkbox: 0 };
  for (let q of questions) {
    if (!q.type || !q.text) {
      return res
        .status(400)
        .json({ message: "Каждый вопрос должен иметь текст и тип" });
    }
    if (typeLimit[q.type] !== undefined) typeLimit[q.type]++;
  }

  for (let type in typeLimit) {
    if (typeLimit[type] > 4) {
      return res
        .status(400)
        .json({ message: `Максимум 4 вопроса типа "${type}"` });
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

    const enriched = questions.map((q, i) => ({
      ...q,
      order: i,
      templateId: template.id,
    }));

    await Question.bulkCreate(enriched);
    res.status(201).json({ templateId: template.id });
  } catch (err) {
    console.error("Ошибка при создании шаблона:", err);
    res.status(500).json({ message: "Ошибка на сервере при создании шаблона" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { limit, tag } = req.query;

    const queryOptions = {
      where: {}, // ← Задаём заранее
      include: [
        { model: User, attributes: ["username"] },
        {
          model: Question,
          attributes: ["id", "text", "type", "options", "order"],
        },
      ],
      order: [["createdAt", "DESC"]],
    };

    if (limit && !isNaN(limit)) {
      queryOptions.limit = Math.min(parseInt(limit), 100);
    }

    if (tag) {
      queryOptions.where.tags = {
        [Op.contains]: [tag],
      };
    }

    const templates = await Template.findAll(queryOptions);
    res.json(templates);
  } catch (err) {
    console.error("Ошибка при получении шаблонов:", err);
    res.status(500).json({ message: "Ошибка при получении шаблонов" });
  }
});

router.get("/top", async (req, res) => {
  try {
    const templates = await Template.findAll({ include: [Form] });

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

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res
      .status(400)
      .json({ message: "Некорректный идентификатор шаблона" });
  }

  try {
    const template = await Template.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "username"] },
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
    const { title, questions = [], version: clientVersion, ...rest } = req.body;
    const template = await Template.findByPk(req.params.id, {
      include: [Question],
    });

    if (!template) return res.status(404).json({ message: "Шаблон не найден" });
    if (template.version !== clientVersion) {
      return res.status(409).json({
        message: "Шаблон был изменён другим пользователем. Обновите данные.",
      });
    }

    await template.update({ title });

    const existingIds = template.Questions.map((q) => q.id);
    const newIds = questions.filter((q) => q.id).map((q) => q.id);
    const toDelete = existingIds.filter((id) => !newIds.includes(id));

    await Question.destroy({ where: { id: toDelete } });

    for (const q of questions) {
      if (q.id && existingIds.includes(q.id)) {
        await Question.update(
          { text: q.text, type: q.type },
          { where: { id: q.id } }
        );
      } else {
        await Question.create({
          text: q.text,
          type: q.type,
          templateId: template.id,
        });
      }
    }

    res.json({ message: "Шаблон обновлён" });
  } catch (err) {
    console.error("Ошибка при обновлении шаблона:", err);
    res.status(500).json({ message: "Ошибка при обновлении шаблона" });
  }
});

router.delete("/:id", auth.required, checkOwner(Template), async (req, res) => {
  try {
    await Template.destroy({ where: { id: req.params.id } });
    res.json({ message: "Шаблон удалён" });
  } catch (err) {
    console.error("Ошибка удаления шаблона:", err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

router.patch(
  "/:id/questions",
  auth.required,
  checkOwner(Template),
  async (req, res) => {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "Некорректный формат вопросов" });
    }

    try {
      const templateId = req.params.id;
      const existing = await Question.findAll({ where: { templateId } });
      const existingIds = existing.map((q) => q.id);
      const incomingIds = questions.filter((q) => q.id).map((q) => q.id);
      const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

      if (toDelete.length > 0) {
        await Question.destroy({ where: { id: toDelete } });
      }

      for (const [i, q] of questions.entries()) {
        if (q.id && existingIds.includes(q.id)) {
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
