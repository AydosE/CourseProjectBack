const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Template = require("../models/Template");
const Form = require("../models/Form");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const TemplateModel = require("../models/Template"); // для Form → Template
const User = require("../models/User");

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
          include: [{ model: Question, attributes: ["text", "type"] }],
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

router.get("/:id", auth.required, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        "id",
        "username",
        "email",
        "role",
        "is_blocked",
        "createdAt",
      ],
    });

    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user);
  } catch (err) {
    console.error("Ошибка получения пользователя:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/:id/templates", auth.required, async (req, res) => {
  try {
    const templates = await Template.findAll({
      where: { userId: req.params.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(templates);
  } catch (err) {
    console.error("Ошибка получения шаблонов:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/:id/forms", auth.required, async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { userId: req.params.id },
      include: [
        {
          model: Template,
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(forms);
  } catch (err) {
    console.error("Ошибка получения форм:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
