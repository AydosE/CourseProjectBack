const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const Template = require("../models/Template");
const Form = require("../models/Form");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");
const checkOwnership = require("../middleware/checkOwnership");

router.get(
  "/:id/templates",
  auth.required,
  checkOwnership(Template),
  async (req, res) => {
    const userId = req.params.id === "me" ? req.user.id : req.params.id;
    console.log(req.user.isAdmin);
    console.log("in route now for templates");
    try {
      const templates = await Template.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });
      res.json(templates);
    } catch (error) {
      console.error("Ошибка при получении шаблонов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

router.get(
  "/:id/forms",
  auth.required,
  checkOwnership(Form),
  async (req, res) => {
    console.log("in route now for forms");
    try {
      const userId = req.params.id === "me" ? req.user.id : req.params.id;

      const forms = await Form.findAll({
        where: { userId },
        include: [
          {
            model: Answer,
            attributes: ["id", "questionId", "value"],
            include: [{ model: Question, attributes: ["text", "type"] }],
          },
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
  }
);
router.get("/:id/datas", auth.required, async (req, res) => {
  console.log("in route now for user details");
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

module.exports = router;
