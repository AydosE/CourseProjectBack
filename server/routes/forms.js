const express = require("express");
const router = express.Router();
const Form = require("../models/Form");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Template = require("../models/Template");
const auth = require("../middleware/authMiddleware");

// Можно использовать как с авторизацией, так и без
router.post("/", auth.required, async (req, res) => {
  try {
    const { templateId, answers } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Нет пользователя" });

    if (!templateId || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Неверные данные формы" });
    }

    // Получаем все вопросы шаблона
    const questions = await Question.findAll({ where: { templateId } });
    const questionIds = questions.map((q) => q.id);

    // Валидация: каждый ответ должен относиться к этому шаблону
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
    await Answer.bulkCreate(formattedAnswers);

    res.status(201).json({ message: "Ответ отправлен", formId: form.id });
  } catch (err) {
    console.error("Ошибка формы:", err);
    res.status(500).json({ message: "Ошибка при сохранении формы" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const form = await Form.findByPk(req.params.id, {
      include: [
        {
          model: Answer,
          attributes: ["id", "questionId", "value"],
        },
        {
          model: Template,
          include: [
            {
              model: Question,
              attributes: ["id", "text", "type"],
            },
          ],
        },
      ],
    });

    if (!form) return res.status(404).json({ message: "Форма не найдена" });

    res.json(form);
  } catch (err) {
    console.error("Ошибка получения формы", err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

module.exports = router;
