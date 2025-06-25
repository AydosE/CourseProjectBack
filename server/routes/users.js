const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Template = require("../models/Template");
const Form = require("../models/Form");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const TemplateModel = require("../models/Template"); // для Form → Template

// 🔐 Мои шаблоны
router.get("/me/templates", auth.required, async (req, res) => {
  try {
    const templates = await Template.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(templates);
  } catch (err) {
    console.error("Ошибка получения шаблонов пользователя:", err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

// 🔐 Мои формы (и ответы)
router.get("/me/forms", auth.required, async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Answer,
          attributes: ["id", "questionId", "value"],
        },
        {
          model: TemplateModel,
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(forms);
  } catch (err) {
    console.error("Ошибка получения форм пользователя:", err);
    res.status(500).json({ message: "Ошибка на сервере" });
  }
});

module.exports = router;
