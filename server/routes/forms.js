const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Template = require("../models/Template");
const auth = require("../middleware/authMiddleware");
const canViewForm = require("../middleware/canViewForm");
const { validate: isUuid } = require("uuid");

router.post("/", auth.required, async (req, res) => {
  try {
    const { templateId, answers } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Нет пользователя" });

    if (!templateId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Неверные данные формы" });
    }

    const questions = await Question.findAll({ where: { templateId } });
    const questionIds = questions.map((q) => q.id);

    for (const ans of answers) {
      if (!ans.questionId || !questionIds.includes(ans.questionId)) {
        return res
          .status(400)
          .json({ message: "Некорректный вопрос в ответах" });
      }
      if (typeof ans.value !== "string") {
        return res.status(400).json({ message: "Ответ должен быть строкой" });
      }
    }

    const form = await Form.create({ templateId, userId });
    const formattedAnswers = answers.map((a) => ({
      formId: form.id,
      questionId: a.questionId,
      value: a.value,
    }));
    const createdAnswers = await Answer.bulkCreate(formattedAnswers, {
      returning: true,
    });

    res.status(201).json({ message: "Ответ отправлен", formId: form.id });
  } catch (err) {
    console.error("Ошибка формы:", err);
    res.status(500).json({ message: "Ошибка при сохранении формы" });
  }
});

router.get("/:id", auth.required, canViewForm, async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res
      .status(400)
      .json({ message: "Некорректный идентификатор формы" });
  }

  try {
    const form = await Form.findByPk(id, {
      include: [
        {
          model: Answer,
          attributes: ["id", "questionId", "value"],
          include: [{ model: Question, attributes: ["text", "type"] }],
        },
        {
          model: Template,
          include: [{ model: Question, attributes: ["id", "text", "type"] }],
        },
      ],
    });

    if (!form) return res.status(404).json({ message: "Форма не найдена" });

    res.json(form);
  } catch (err) {
    console.error("Ошибка получения формы:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

router.delete("/:id", auth.required, canViewForm, async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) {
    return res
      .status(400)
      .json({ message: "Некорректный идентификатор формы" });
  }

  try {
    const form = await Form.findByPk(id);
    if (!form) return res.status(404).json({ message: "Форма не найдена" });

    await form.destroy();
    res.json({ message: "Ответ удалён" });
  } catch (err) {
    console.error("Ошибка удаления формы:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
});

module.exports = router;
